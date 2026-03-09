// cms-media-adapter.js
// Decap CMS custom media library — uploads files to Firebase Storage
// via the /api/upload server-side route. No Firebase credentials in this file.
//
// Auth flow:
//   1. Calls /api/cms-token to get a short-lived Firebase ID token (cached 50 min)
//   2. Sends the token as Authorization: Bearer header with every upload
//   3. Server verifies the token before processing

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
          input.accept = imagesOnly ? "image/*" : "image/*,application/pdf,.svg";
          input.multiple = !!allowMultiple;
          input.style.display = "none";
          document.body.appendChild(input);

          input.onchange = function (e) {
            var files = Array.from(e.target.files);
            document.body.removeChild(input);
            if (!files.length) return;

            getToken()
              .then(function (token) {
                return Promise.all(files.map(function (file) {
                  return uploadFile(file, token);
                }));
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

  async function uploadFile(file, token) {
    var base64 = await new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function (e) {
        // Strip the "data:...;base64," prefix
        resolve(e.target.result.split(",")[1]);
      };
      reader.readAsDataURL(file);
    });

    var res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        data: base64,
      }),
    });

    if (!res.ok) {
      var body = await res.json();
      throw new Error(body.error || res.status);
    }

    var result = await res.json();
    return result.url;
  }
})();
