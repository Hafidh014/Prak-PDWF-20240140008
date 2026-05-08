"use strict";

/* ── DOM References */
const $  = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// Form inputs
const fName       = $("f-name");
const fUniversity = $("f-university");
const fPosition = $("f-position");
const fDept     = $("f-dept");
const fId       = $("f-id");
const fFrom     = $("f-from");
const fTo       = $("f-to");
const photoInput = $("photo-input");

// Card front elements
const cPhotoWrap = $("c-photo-wrap");
const cName       = $("c-name");
const cUniversity = $("c-university");
const cPosition = $("c-position");
const cExp      = $("c-exp");
const cFrom     = $("c-from");
const cId       = $("c-id");

// Card back elements
const cbName       = $("cb-name");
const cbUniversity = $("cb-university");
const cbOrg     = $("cb-org");
const cbValid   = $("cb-valid");
const cbNik     = $("cb-nik");
const validFill = $("validity-fill");
const validLabel = $("validity-label");

// Misc
const cardWrapper = $("card-wrapper");
const cardFront   = $("card-front");
const cardBack    = $("card-back");
const themeGrid   = $("theme-grid");
const toast       = $("toast");
const toastMsg    = $("toast-msg");
const toastIcon   = $("toast-icon");
const statGen     = $("stat-gen");
const qrCanvas    = $("qr-canvas");

/* ── State*/
let currentTheme = "navy";
let photoDataURL  = null;
let genCount      = 0;

/* ── Init*/
(function init() {
  setDefaultDates();
  bindEvents();
  liveUpdate();
  generateQR("KARTU-MAHASISWA");
})();

/* ── Default Dates*/
function setDefaultDates() {
  const now  = new Date();
  const next = new Date(now);
  next.setFullYear(now.getFullYear() + 4);

  fFrom.value = now.toISOString().split("T")[0];
  fTo.value   = next.toISOString().split("T")[0];
}

/* ── Event Binding*/
function bindEvents() {
  const name       = fName.value.trim() || "NAMA MAHASISWA";
    const university = fUniversity.value.trim() || "UNIVERSITAS";
    const position = fPosition.value.trim() || "PROGRAM STUDI";
    const dept = fDept.value.trim() || "FAKULTAS";
    const id = fId.value.trim() || "—";
    const from = fFrom.value;
    const to = fTo.value;
  [fName, fUniversity, fPosition, fDept, fId, fFrom, fTo].forEach(el => el.addEventListener("input", liveUpdate));

  photoInput.addEventListener("change", handlePhotoUpload);

  themeGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".theme-btn");
    if (!btn) return;
    currentTheme = btn.dataset.theme;
    $$(".theme-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyTheme(currentTheme);
  });

  cardWrapper.addEventListener("click", () => {
    cardWrapper.classList.toggle("flipped");
  });

  $("btn-generate").addEventListener("click", handleGenerate);
  $("btn-reset").addEventListener("click", handleReset);
  $("btn-dl-front").addEventListener("click", () => downloadCard("front"));
  $("btn-dl-back").addEventListener("click",  () => downloadCard("back"));
}

/* ── Live Update*/
function liveUpdate() {

  const name =
    fName.value.trim() || "NAMA MAHASISWA";

  const university =
    fUniversity.value.trim() || "UNIVERSITAS";

  const pos =
    fPosition.value.trim() || "PROGRAM STUDI";

  const dept =
    fDept.value.trim() || "FAKULTAS";

  const id =
    fId.value.trim() || "—";

  const from =
    fFrom.value;

  const to =
    fTo.value;

  // Front
  cName.textContent =
    name.toUpperCase();

  cUniversity.textContent =
    university.toUpperCase();

  cPosition.textContent =
    `${pos.toUpperCase()} • ${dept.toUpperCase()}`;

  cId.textContent =
    id;

  cFrom.textContent =
  from ? formatDate(from) : "—";

  cExp.textContent =
  to ? formatDate(to) : "—";

  // Back
  cbName.textContent =
    name;

  cbUniversity.textContent =
    university;

  cbOrg.textContent =
    pos;

  cbNik.textContent =
    id;

  cbValid.textContent =
    (from && to)
      ? `${formatDate(from)} s/d ${formatDate(to)}`
      : "—";

  updateValidityBar(from, to);

  const qrData =
    [name, university, pos, dept, id]
      .filter(v => v && v !== "—")
      .join(" | ");

  generateQR(qrData || "KARTU-MAHASISWA");
}

/* ── Format Date*/
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

/* ── Validity Progress Bar*/
function updateValidityBar(from, to) {
  if (!from || !to) {
    validFill.style.width  = "80%";
    validLabel.textContent = "Aktif";
    return;
  }

  const now    = Date.now();
  const start  = new Date(from).getTime();
  const end    = new Date(to).getTime();
  const total  = end - start;
  const passed = now - start;

  if (now > end) {
    validFill.style.width      = "100%";
    validFill.style.background = "var(--danger)";
    validLabel.textContent     = "Kadaluarsa";
  } else if (now < start) {
    validFill.style.width  = "0%";
    validLabel.textContent = "Belum Aktif";
  } else {
    const pct = Math.max(5, Math.min(95, (passed / total) * 100));
    validFill.style.width      = pct + "%";
    validFill.style.background = "";
    const daysLeft = Math.ceil((end - now) / 86400000);
    validLabel.textContent = daysLeft + " hari lagi";
  }
}

/* ── Photo Upload*/
function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    photoDataURL = ev.target.result;
    $("photo-preview").src = photoDataURL;
    $("photo-preview-wrap").style.display = "block";
    cPhotoWrap.innerHTML = `<img src="${photoDataURL}" alt="foto" style="width:100%;height:100%;object-fit:cover;" />`;
  };
  reader.readAsDataURL(file);
}

/* ── Apply Theme*/
function applyTheme(theme) {
  $$(".card-face").forEach(face => {
    ["navy","carbon","forest","rose","aurora","slate","copper","ice"]
      .forEach(t => face.classList.remove(t));
    face.classList.add(theme);
  });
}

/* ── Generate QR Code*/
function generateQR(text) {
  const canvas = qrCanvas;
  const ctx    = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (typeof QRCode !== "undefined") {
    try {
      const tmp = document.createElement("div");
      tmp.style.display = "none";
      document.body.appendChild(tmp);

      new QRCode(tmp, {
        text: text || "MAHASISWA",
        width: 62, height: 62,
        colorDark: "#000", colorLight: "#fff",
        correctLevel: QRCode.CorrectLevel.M,
      });

      setTimeout(() => {
        const img = tmp.querySelector("img");
        if (img) {
          const image = new Image();
          image.onload = () => ctx.drawImage(image, 0, 0, 62, 62);
          image.src = img.src;
        }
        document.body.removeChild(tmp);
      }, 100);
    } catch (err) {
      drawFallbackQR(ctx, text);
    }
  } else {
    drawFallbackQR(ctx, text);
  }
}

/* ── Fallback QR*/
function drawFallbackQR(ctx, text) {
  const size = 62, cells = 10, cell = size / cells;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, size, size);
  const hash = simpleHash(text || "ID");
  ctx.fillStyle = "#111";
  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      if ((hash >> ((row * cells + col) % 24)) & 1) {
        ctx.fillRect(col * cell + 1, row * cell + 1, cell - 2, cell - 2);
      }
    }
  }
  drawQRMarker(ctx, 1, 1, 3, cell);
  drawQRMarker(ctx, cells - 4, 1, 3, cell);
  drawQRMarker(ctx, 1, cells - 4, 3, cell);
}

function drawQRMarker(ctx, col, row, size, cell) {
  ctx.fillStyle = "#111";
  ctx.fillRect(col * cell, row * cell, size * cell, size * cell);
  ctx.fillStyle = "#fff";
  ctx.fillRect((col + .5) * cell, (row + .5) * cell, (size - 1) * cell, (size - 1) * cell);
  ctx.fillStyle = "#111";
  ctx.fillRect((col + 1) * cell, (row + 1) * cell, (size - 2) * cell, (size - 2) * cell);
}

function simpleHash(str) {
  let h = 0xdeadbeef;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
  return h >>> 0;
}

/* ── Generate Button*/
function handleGenerate() {
  if (!fName.value.trim()) {
    showToast("⚠️", "Nama lengkap harus diisi!", true);
    fName.focus();
    return;
  }

  liveUpdate();
  genCount++;
  statGen.textContent = genCount;

  cardWrapper.style.transform = "rotateY(0deg) scale(1.04)";
  setTimeout(() => { cardWrapper.style.transform = ""; }, 400);

  showToast("✅", "Kartu mahasiswa berhasil di-generate!");
}

/* ── Reset*/
function handleReset() {
  [fName, fUniversity, fPosition, fDept, fId]
  .forEach(el => el.value = "");
  photoDataURL = null;
  $("photo-preview-wrap").style.display = "none";
  cPhotoWrap.innerHTML = `<span class="card-photo-placeholder">👤</span>`;

  setDefaultDates();
  liveUpdate();

  currentTheme = "navy";
  $$(".theme-btn").forEach(b => b.classList.remove("active"));
  document.querySelector('[data-theme="navy"]').classList.add("active");
  applyTheme("navy");
  cardWrapper.classList.remove("flipped");

  showToast("↺", "Form direset!");
}

/* ── Download*/
async function downloadCard(side) {
  if (typeof html2canvas === "undefined") {
    showToast("⚠️", "html2canvas belum tersedia.", true);
    return;
  }

  const target = side === "front" ? cardFront : cardBack;

  if (side === "back") {
    cardWrapper.classList.add("flipped");
    await delay(650);
  }

  try {
    const canvas = await html2canvas(target, {
      scale: 3, useCORS: true, backgroundColor: null, logging: false,
    });

    const link = document.createElement("a");
    const name  = fName.value.trim().replace(/\s+/g, "_") || "mahasiswa";
    link.download = `kartu-mahasiswa-${name}-${side}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    showToast("⬇", `Kartu ${side === "front" ? "depan" : "belakang"} diunduh!`);
  } catch (err) {
    showToast("❌", "Gagal mengunduh kartu.", true);
    console.error(err);
  } finally {
    if (side === "back") cardWrapper.classList.remove("flipped");
  }
}

/* ── Toast*/
let toastTimer = null;

function showToast(icon, msg, isError = false) {
  toastIcon.textContent = icon;
  toastMsg.textContent  = msg;
  toast.style.borderColor = isError ? "rgba(255,95,126,.35)" : "rgba(255,255,255,.07)";
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

/* ── Utility*/
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}