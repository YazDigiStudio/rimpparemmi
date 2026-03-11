// cms-media-adapter.js
// Decap CMS custom media library — uploads files to Firebase Storage
// via a 3-step direct upload flow. No Firebase credentials in this file.
//
// Upload flow:
//   1. POST /api/upload-token → { uploadUrl, storagePath }
//   2. PUT file directly to Firebase via signed URL (XHR for byte-level progress)
//   3. POST PROCESS_URL { storagePath, filename, contentType } → { url }
//      Processing runs on Firebase Functions (same datacenter as storage = fast)

var PROCESS_URL =
  "https://europe-north1-rimpparemmi-b3154.cloudfunctions.net/processImage";

(function () {
  // Token cache — reuse within the 1-hour Firebase token window
  var cachedToken = null;
  var tokenExpiresAt = 0;

  async function getToken() {
    if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

    var res = await fetch("/api/cms-token", { method: "POST" });
    if (!res.ok) throw new Error("Failed to get upload token");
    var data = await res.json();
    cachedToken = data.token;
    tokenExpiresAt = Date.now() + 50 * 60 * 1000; // cache for 50 minutes
    return cachedToken;
  }

  CMS.registerMediaLibrary({
    name: "firebase-storage",
    init: function ({ handleInsert }) {
      return {
        show: function ({ imagesOnly }) {
          var input = document.createElement("input");
          input.type = "file";
          input.accept = imagesOnly
            ? "image/*"
            : "image/*,application/pdf,.svg,video/mp4,video/quicktime,video/webm,application/zip,.zip";
          input.multiple = false;
          input.style.display = "none";
          document.body.appendChild(input);

          input.onchange = function (e) {
            var files = Array.from(e.target.files);
            document.body.removeChild(input);
            if (!files.length) return;

            var overlay = createProgressOverlay();

            getToken()
              .then(function (token) {
                return uploadFile(files[0], token, function (loaded, total) {
                  updateProgressBytes(overlay, loaded, total);
                }, function () {
                  setOverlayPhase(overlay, "processing");
                });
              })
              .then(function (url) {
                removeProgressOverlay(overlay);
                handleInsert(url);
              })
              .catch(function (err) {
                removeProgressOverlay(overlay);
                console.error("CMS upload error:", err);
                alert("Upload failed: " + err.message);
              });
          };

          input.click();
        },

        hide: function () {},
        enableStandalone: function () { return true; },
      };
    },
  });

  function getProductionId() {
    var match = window.location.hash.match(
      /^#\/collections\/productions\/entries\/([^/]+)/
    );
    return match ? match[1] : null;
  }

  function createProgressOverlay() {
    var overlay = document.createElement("div");
    overlay.style.cssText = [
      "position:fixed", "inset:0", "z-index:99999",
      "background:rgba(0,0,0,0.55)", "display:flex",
      "flex-direction:column", "align-items:center", "justify-content:center",
      "font-family:sans-serif", "color:#fff",
    ].join(";");

    var msg = document.createElement("div");
    msg.style.cssText = "font-size:1.2rem;margin-bottom:1rem;";
    msg.textContent = "Ladataan\u2026";
    overlay.appendChild(msg);

    var counter = document.createElement("div");
    counter.style.cssText = "font-size:2rem;font-weight:bold;margin-bottom:1.5rem;";
    counter.textContent = "0%";
    overlay.appendChild(counter);

    var barWrap = document.createElement("div");
    barWrap.style.cssText = "width:260px;height:8px;background:rgba(255,255,255,0.25);border-radius:4px;overflow:hidden;";
    var bar = document.createElement("div");
    bar.style.cssText = "height:100%;background:#fff;border-radius:4px;transition:width 0.2s;width:0%;";
    barWrap.appendChild(bar);
    overlay.appendChild(barWrap);

    overlay._msg = msg;
    overlay._counter = counter;
    overlay._bar = bar;
    document.body.appendChild(overlay);
    return overlay;
  }

  function updateProgressBytes(overlay, loaded, total) {
    var pct = total > 0 ? Math.round((loaded / total) * 100) : 0;
    overlay._counter.textContent = pct + "%";
    overlay._bar.style.width = pct + "%";
  }

  function setOverlayPhase(overlay, phase) {
    if (phase === "processing") {
      overlay._msg.textContent = "Tallennetaan\u2026";
      overlay._counter.textContent = "";
      overlay._bar.style.width = "100%";
      overlay._bar.style.opacity = "0.5";
    }
  }

  function removeProgressOverlay(overlay) {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  async function uploadFile(file, token, onByteProgress, onProcessing) {
    // Step 1: Get a signed upload URL from the server
    var tokenRes = await fetch("/api/upload-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
    });

    if (!tokenRes.ok) {
      var tokenErr = await tokenRes.json();
      throw new Error(tokenErr.error || "Failed to get upload URL");
    }

    var uploadTokenData = await tokenRes.json();
    var uploadUrl = uploadTokenData.uploadUrl;
    var storagePath = uploadTokenData.storagePath;

    // Step 2: Upload the file directly to Firebase via XHR (for byte-level progress)
    await new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) onByteProgress(e.loaded, e.total);
      };
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error("Direct upload to Firebase failed (" + xhr.status + ")"));
      };
      xhr.onerror = function () {
        reject(new Error("Network error during upload"));
      };
      xhr.send(file);
    });

    // Step 3: Ask Firebase Function to process the file and return the final URL
    onProcessing();
    var processRes = await fetch(PROCESS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify({
        storagePath: storagePath,
        filename: file.name,
        contentType: file.type,
        productionId: getProductionId(),
      }),
    });

    if (!processRes.ok) {
      var processErr = await processRes.json();
      throw new Error(processErr.error || "Processing failed");
    }

    var result = await processRes.json();
    return result.url;
  }
})();
