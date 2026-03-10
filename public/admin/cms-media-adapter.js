// cms-media-adapter.js
// Decap CMS custom media library — uploads files to Firebase Storage
// via a 3-step direct upload flow. No Firebase credentials in this file.
//
// Upload flow:
//   1. POST /api/upload-token → { uploadUrl, storagePath }
//   2. PUT file directly to Firebase via signed URL (no server, no size limit)
//   3. POST /api/process { storagePath, filename, contentType } → { url }

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
        show: function ({ allowMultiple, imagesOnly }) {
          var input = document.createElement("input");
          input.type = "file";
          input.accept = imagesOnly
            ? "image/*"
            : "image/*,application/pdf,.svg,video/mp4,video/quicktime,video/webm";
          input.multiple = !!allowMultiple;
          input.style.display = "none";
          document.body.appendChild(input);

          input.onchange = function (e) {
            var files = Array.from(e.target.files);
            document.body.removeChild(input);
            if (!files.length) return;

            getToken()
              .then(function (token) {
                return Promise.all(
                  files.map(function (file) {
                    return uploadFile(file, token);
                  })
                );
              })
              .then(function (urls) {
                handleInsert(urls.length === 1 ? urls[0] : urls);
              })
              .catch(function (err) {
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

  async function uploadFile(file, token) {
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

    // Step 2: Upload the file directly to Firebase via the signed URL
    var putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!putRes.ok) {
      throw new Error("Direct upload to Firebase failed (" + putRes.status + ")");
    }

    // Step 3: Ask the server to process the file and return the final URL
    var processRes = await fetch("/api/process", {
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
