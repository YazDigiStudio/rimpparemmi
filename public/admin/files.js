// files.js
// Admin page "Tiedostot & QR": upload a PDF/image (or paste a web address),
// create a short link /l/<slug>, and get a printable QR code for it.
// Talks to /api/links. File upload reuses the CMS flow: /api/cms-token →
// /api/upload-token → direct PUT to Firebase → processImage function.

// Domain encoded into the QR codes — must be the live domain before printing
var SITE_URL = "https://rimpparemmi.fi";
var PROCESS_URL =
  "https://europe-north1-rimpparemmi-b3154.cloudfunctions.net/processImage";

var knownSlugs = new Set(); // slugs already in use (server still decides)
var editingSlug = null; // set while replacing an existing link
var slugTouched = false; // stop auto-suggesting once the editor edits it
var firebaseToken = null;
var firebaseTokenExpires = 0;

function el(id) {
  return document.getElementById(id);
}

// ── Login (Netlify Identity, same session as the CMS) ──────────────────────

async function identityToken() {
  var user = window.netlifyIdentity && window.netlifyIdentity.currentUser();
  if (!user) throw new Error("Kirjaudu ensin sisään.");
  return user.jwt();
}

async function api(method, body, query) {
  var res = await fetch("/api/links" + (query || ""), {
    method: method,
    headers: {
      Authorization: "Bearer " + (await identityToken()),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  var data = await res.json();
  if (!res.ok) throw new Error(data.error || "Pyyntö epäonnistui");
  return data;
}

async function getFirebaseToken() {
  if (firebaseToken && Date.now() < firebaseTokenExpires) return firebaseToken;
  var res = await fetch("/api/cms-token", {
    method: "POST",
    headers: { Authorization: "Bearer " + (await identityToken()) },
  });
  if (!res.ok) throw new Error("Latauslupaa ei saatu");
  firebaseToken = (await res.json()).token;
  firebaseTokenExpires = Date.now() + 50 * 60 * 1000;
  return firebaseToken;
}

// ── Upload (same 3 steps as the CMS media adapter) ─────────────────────────

async function uploadFile(file, onProgress) {
  var token = await getFirebaseToken();
  var tokenRes = await fetch("/api/upload-token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });
  if (!tokenRes.ok) {
    throw new Error((await tokenRes.json()).error || "Latausosoitetta ei saatu");
  }
  var signed = await tokenRes.json();

  await new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", signed.uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error("Lataus epäonnistui (" + xhr.status + ")"));
    };
    xhr.onerror = function () { reject(new Error("Verkkovirhe latauksessa")); };
    xhr.send(file);
  });

  var processRes = await fetch(PROCESS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify({
      storagePath: signed.storagePath,
      filename: file.name,
      contentType: file.type,
    }),
  });
  if (!processRes.ok) {
    throw new Error((await processRes.json()).error || "Tallennus epäonnistui");
  }
  return (await processRes.json()).url;
}

// ── QR code (SVG built from the module grid, PNG drawn from that SVG) ──────

function qrSvg(text, pixelSize) {
  var qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  var count = qr.getModuleCount();
  var margin = 4; // quiet zone required by scanners
  var size = count + margin * 2;
  var path = "";
  for (var r = 0; r < count; r++) {
    for (var c = 0; c < count; c++) {
      if (qr.isDark(r, c)) path += "M" + (c + margin) + " " + (r + margin) + "h1v1h-1z";
    }
  }
  var dims = pixelSize ? ' width="' + pixelSize + '" height="' + pixelSize + '"' : "";
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + " " + size + '"' +
    dims + ' shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/>' +
    '<path d="' + path + '" fill="#000"/></svg>'
  );
}

function qrPngBlob(text) {
  return new Promise(function (resolve, reject) {
    var img = new Image();
    var url = URL.createObjectURL(
      new Blob([qrSvg(text, 2000)], { type: "image/svg+xml" })
    );
    img.onload = function () {
      var canvas = document.createElement("canvas");
      canvas.width = 2000;
      canvas.height = 2000;
      canvas.getContext("2d").drawImage(img, 0, 0, 2000, 2000);
      URL.revokeObjectURL(url);
      canvas.toBlob(resolve, "image/png");
    };
    img.onerror = reject;
    img.src = url;
  });
}

function saveBlob(blob, filename) {
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── Result + list ──────────────────────────────────────────────────────────

function shortUrl(slug) {
  return SITE_URL + "/l/" + slug;
}

function showResult(link) {
  var url = shortUrl(link.slug);
  el("resultUrl").value = url;
  el("resultQr").innerHTML = qrSvg(url);
  el("copyBtn").onclick = function () {
    navigator.clipboard.writeText(url);
    el("copyBtn").textContent = "Kopioitu!";
    setTimeout(function () { el("copyBtn").textContent = "Kopioi"; }, 1500);
  };
  el("downloadSvg").onclick = function () {
    saveBlob(new Blob([qrSvg(url)], { type: "image/svg+xml" }), link.slug + "-qr.svg");
  };
  el("downloadPng").onclick = async function () {
    saveBlob(await qrPngBlob(url), link.slug + "-qr.png");
  };
  el("result").hidden = false;
  el("result").scrollIntoView({ behavior: "smooth" });
}

function makeButton(text, onClick) {
  var b = document.createElement("button");
  b.type = "button";
  b.textContent = text;
  b.onclick = onClick;
  return b;
}

async function refreshList() {
  var data = await api("GET");
  knownSlugs = new Set(data.links.map(function (l) { return l.slug; }));
  var list = el("linkList");
  list.textContent = "";
  if (!data.links.length) list.textContent = "Ei vielä linkkejä.";
  data.links.forEach(function (link) {
    var li = document.createElement("li");
    var title = document.createElement("strong");
    title.textContent = link.label;
    var info = document.createElement("small");
    // Uploaded files: short link only. Web addresses: also show the target.
    info.textContent =
      link.kind === "url"
        ? shortUrl(link.slug) + " → " + link.url
        : shortUrl(link.slug);
    var buttons = document.createElement("div");
    buttons.className = "row";
    buttons.append(
      makeButton("QR", function () { showResult(link); }),
      makeButton("Vaihda kohde", function () { startReplace(link); }),
      makeButton("Poista", async function () {
        if (!confirm('Poistetaanko linkki "' + link.label + '"? Tulostettu QR lakkaa toimimasta.')) return;
        await api("DELETE", null, "?slug=" + encodeURIComponent(link.slug));
        await refreshList();
      })
    );
    li.append(title, info, buttons);
    list.appendChild(li);
  });
}

// ── Form ───────────────────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[äå]/g, "a")
    .replace(/ö/g, "o")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function selectedKind() {
  return document.querySelector('input[name="kind"]:checked').value;
}

function updateSlugPreview() {
  el("slugPreview").textContent = shortUrl(el("slugInput").value || "…");
}

function setStatus(text, isError) {
  el("status").textContent = text;
  el("status").className = isError ? "error" : "hint";
}

function resetForm() {
  editingSlug = null;
  slugTouched = false;
  el("linkForm").reset();
  el("slugInput").disabled = false;
  el("formTitle").textContent = "Uusi linkki";
  el("submitBtn").textContent = "Luo linkki ja QR";
  el("cancelBtn").hidden = true;
  el("fileRow").hidden = false;
  el("urlRow").hidden = true;
  updateSlugPreview();
}

function startReplace(link) {
  resetForm();
  editingSlug = link.slug;
  el("slugInput").value = link.slug;
  el("slugInput").disabled = true;
  el("labelInput").value = link.label;
  el("formTitle").textContent = "Vaihda kohde: " + link.slug;
  el("submitBtn").textContent = "Tallenna uusi kohde";
  el("cancelBtn").hidden = false;
  updateSlugPreview();
  el("linkForm").scrollIntoView({ behavior: "smooth" });
}

async function handleSubmit(event) {
  event.preventDefault();
  var slug = el("slugInput").value.trim();
  var label = el("labelInput").value.trim();
  el("submitBtn").disabled = true;
  setStatus("");
  try {
    if (!editingSlug && knownSlugs.has(slug)) {
      throw new Error("Tämä linkin tunnus on jo käytössä. Valitse toinen.");
    }
    var kind = selectedKind();
    var url;
    if (kind === "file") {
      var file = el("fileInput").files[0];
      if (!file) throw new Error("Valitse tiedosto.");
      url = await uploadFile(file, function (pct) {
        setStatus("Ladataan… " + pct + " %");
      });
    } else {
      url = el("urlInput").value.trim();
    }
    setStatus("Tallennetaan…");
    var data = await api(editingSlug ? "PUT" : "POST", {
      slug: slug,
      label: label,
      kind: kind,
      url: url,
    });
    resetForm();
    setStatus("");
    showResult(data.link);
    await refreshList();
  } catch (err) {
    setStatus(err.message, true);
  } finally {
    el("submitBtn").disabled = false;
  }
}

function wireForm() {
  el("linkForm").onsubmit = handleSubmit;
  el("cancelBtn").onclick = resetForm;
  document.querySelectorAll('input[name="kind"]').forEach(function (radio) {
    radio.onchange = function () {
      el("fileRow").hidden = selectedKind() !== "file";
      el("urlRow").hidden = selectedKind() !== "url";
    };
  });
  // Suggest a slug from the file name or label until the editor edits it
  function suggest(text) {
    if (editingSlug || slugTouched) return;
    el("slugInput").value = slugify(text.replace(/\.[^.]+$/, ""));
    updateSlugPreview();
  }
  el("fileInput").onchange = function () {
    var file = el("fileInput").files[0];
    if (file && !el("labelInput").value) el("labelInput").value = file.name.replace(/\.[^.]+$/, "");
    if (file) suggest(file.name);
  };
  el("labelInput").oninput = function () { suggest(el("labelInput").value); };
  el("slugInput").oninput = function () {
    slugTouched = true;
    updateSlugPreview();
  };
  updateSlugPreview();
}

// ── Start ──────────────────────────────────────────────────────────────────

function showApp() {
  el("loginBox").hidden = true;
  el("app").hidden = false;
  refreshList().catch(function (err) { setStatus(err.message, true); });
}

function showLogin() {
  el("app").hidden = true;
  el("loginBox").hidden = false;
}

wireForm();
el("loginBtn").onclick = function () { window.netlifyIdentity.open("login"); };
window.netlifyIdentity.on("init", function (user) { return user ? showApp() : showLogin(); });
window.netlifyIdentity.on("login", function () { window.netlifyIdentity.close(); showApp(); });
window.netlifyIdentity.on("logout", showLogin);
window.netlifyIdentity.init();
