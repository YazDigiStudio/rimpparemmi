// cms-media-adapter.js
// Decap CMS custom media library — uploads files to Firebase Storage
// via the /api/upload server-side route. No Firebase credentials in this file.

(function () {
  CMS.registerMediaLibrary({
    name: "firebase-storage",
    init: function ({ options, handleInsert }) {
      return {
        show: function ({ value, config, allowMultiple, imagesOnly }) {
          var input = document.createElement("input");
          input.type = "file";
          input.accept = imagesOnly ? "image/*" : "image/*,application/pdf";
          input.multiple = !!allowMultiple;
          input.style.display = "none";
          document.body.appendChild(input);

          input.onchange = function (e) {
            var files = Array.from(e.target.files);
            document.body.removeChild(input);
            if (!files.length) return;

            Promise.all(files.map(uploadFile))
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

  function uploadFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function (e) {
        // Strip the "data:...;base64," prefix
        var base64 = e.target.result.split(",")[1];

        fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            data: base64,
          }),
        })
          .then(function (res) {
            if (!res.ok) return res.json().then(function (b) { throw new Error(b.error || res.status); });
            return res.json();
          })
          .then(function (result) { resolve(result.url); })
          .catch(reject);
      };
      reader.readAsDataURL(file);
    });
  }
})();
