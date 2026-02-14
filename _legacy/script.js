// ---------- Theme (Dark/Light) ----------
const html = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

function setTheme(mode) {
  if (mode === "dark") {
    html.classList.add("dark");
    themeIcon.textContent = "☀️";
    localStorage.setItem("theme", "dark");
  } else {
    html.classList.remove("dark");
    themeIcon.textContent = "🌙";
    localStorage.setItem("theme", "light");
  }
}

const savedTheme = localStorage.getItem("theme");
setTheme(savedTheme || "light");

themeToggle?.addEventListener("click", () => {
  const isDark = html.classList.contains("dark");
  setTheme(isDark ? "light" : "dark");
});

// ---------- Navigation (Landing <-> App) ----------
const landing = document.getElementById("landing");
const app = document.getElementById("app");
const btnGoApp = document.getElementById("btnGoApp");
const btnGoLanding = document.getElementById("btnGoLanding");
const ctaOpenStudio = document.getElementById("ctaOpenStudio");
const btnBackLanding = document.getElementById("btnBackLanding");

function openApp() {
  landing.classList.add("hidden");
  app.classList.remove("hidden");
  btnGoLanding.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function openLanding() {
  app.classList.add("hidden");
  landing.classList.remove("hidden");
  btnGoLanding.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

btnGoApp?.addEventListener("click", openApp);
ctaOpenStudio?.addEventListener("click", openApp);
btnBackLanding?.addEventListener("click", openLanding);
btnGoLanding?.addEventListener("click", openLanding);

// Landing sample button
document.getElementById("ctaDownloadSample")?.addEventListener("click", () => {
  openApp();
  setTimeout(() => downloadBanner(), 300);
});

// ---------- Elements ----------
const elName = document.getElementById("name");
const elRole = document.getElementById("role");
const elCompany = document.getElementById("company");
const elUpload = document.getElementById("profileUpload");

const banner = document.getElementById("banner");
const bannerName = document.getElementById("bannerName");
const bannerRole = document.getElementById("bannerRole");
const bannerCompany = document.getElementById("bannerCompany");
const profilePreview = document.getElementById("profilePreview");
const watermark = document.getElementById("watermark");
const textWrap = document.getElementById("textWrap");

// Live panel
const nameSize = document.getElementById("nameSize");
const gap = document.getElementById("gap");
const photoSize = document.getElementById("photoSize");
const align = document.getElementById("align");
const accent = document.getElementById("accent");
const watermarkToggle = document.getElementById("watermarkToggle");

const nameSizeVal = document.getElementById("nameSizeVal");
const gapVal = document.getElementById("gapVal");
const photoVal = document.getElementById("photoVal");

const btnGenerate = document.getElementById("btnGenerate");
const btnDownload = document.getElementById("btnDownload");
const btnReset = document.getElementById("btnReset");
const btnRandomTemplate = document.getElementById("btnRandomTemplate");

// Landing preview template chips
const landingPreview = document.getElementById("landingPreview");

// ---------- State ----------
let currentTemplate = "minimal";
let watermarkOn = true;

// ---------- Template selection ----------
function setTemplate(style) {
  currentTemplate = style;
  if (banner) banner.className = `banner ${style} relative flex items-center gap-10 p-10 rounded-2xl shadow-2xl`;
  if (landingPreview) landingPreview.className = `banner ${style} relative flex items-center gap-8 p-8`;

  // update cards/chips active state
  document.querySelectorAll(".tpl-card").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.style === style);
  });
  document.querySelectorAll(".tpl-chip").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.style === style);
  });
}

// Cards
document.querySelectorAll(".tpl-card").forEach(btn => {
  btn.addEventListener("click", () => setTemplate(btn.dataset.style));
});

// Chips
document.querySelectorAll(".tpl-chip").forEach(btn => {
  btn.addEventListener("click", () => setTemplate(btn.dataset.style));
});

// Random
btnRandomTemplate?.addEventListener("click", () => {
  const styles = ["minimal","corporate","tech","creative","dark"];
  const pick = styles[Math.floor(Math.random()*styles.length)];
  setTemplate(pick);
});

// ---------- Live Update ----------
function updateBanner() {
  const name = (elName?.value || "").trim();
  const role = (elRole?.value || "").trim();
  const company = (elCompany?.value || "").trim();

  bannerName.textContent = name || "Your Name";
  bannerRole.textContent = role || "Your Role";
  bannerCompany.textContent = company || "Your Company";
}

// photo upload
elUpload?.addEventListener("change", () => {
  const file = elUpload.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    profilePreview.style.display = "block";
    profilePreview.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// inputs live typing
[elName, elRole, elCompany].forEach(el => {
  el?.addEventListener("input", updateBanner);
});

btnGenerate?.addEventListener("click", updateBanner);

// ---------- Live panel controls ----------
function setGap(v) {
  document.querySelectorAll(".banner").forEach(b => {
    // gap is in inline style via class in tailwind; override using style
    b.style.gap = `${v}px`;
  });
}

function setPhotoSize(v) {
  profilePreview.style.height = `${v}px`;
  profilePreview.style.width = `${v}px`;
  profilePreview.style.borderRadius = "9999px";
}

function setNameSize(v) {
  bannerName.style.fontSize = `${v}px`;
}

function setAlign(v) {
  if (!textWrap) return;
  textWrap.classList.remove("text-left", "text-center", "text-right");
  textWrap.classList.add(`text-${v}`);
}

function setAccent(hex) {
  // Use accent to color the role text (subtle premium touch)
  bannerRole.style.color = hex;
}

nameSize?.addEventListener("input", () => {
  nameSizeVal.textContent = nameSize.value;
  setNameSize(nameSize.value);
});

gap?.addEventListener("input", () => {
  gapVal.textContent = gap.value;
  setGap(gap.value);
});

photoSize?.addEventListener("input", () => {
  photoVal.textContent = photoSize.value;
  setPhotoSize(photoSize.value);
});

align?.addEventListener("change", () => setAlign(align.value));
accent?.addEventListener("input", () => setAccent(accent.value));

// Watermark toggle
watermarkToggle?.addEventListener("click", () => {
  watermarkOn = !watermarkOn;
  watermark.style.display = watermarkOn ? "block" : "none";
  watermarkToggle.textContent = watermarkOn ? "ON" : "OFF";
});

// Reset
btnReset?.addEventListener("click", () => {
  // reset values
  nameSize.value = 48;
  gap.value = 40;
  photoSize.value = 120;
  align.value = "left";
  accent.value = "#2563eb";
  watermarkOn = true;

  nameSizeVal.textContent = "48";
  gapVal.textContent = "40";
  photoVal.textContent = "120";

  // reset UI
  bannerName.style.fontSize = "48px";
  document.querySelectorAll(".banner").forEach(b => (b.style.gap = "40px"));
  setPhotoSize(120);
  setAlign("left");
  setAccent("#2563eb");
  watermark.style.display = "block";
  watermarkToggle.textContent = "ON";

  // reset template
  setTemplate("minimal");

  // keep text
  updateBanner();
});

// ---------- Download ----------
function downloadBanner() {
  updateBanner();

  // ensure watermark state applied
  watermark.style.display = watermarkOn ? "block" : "none";

  html2canvas(banner, {
    scale: 2,          // sharper
    useCORS: true,
    backgroundColor: null
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = "linkedin-banner.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

btnDownload?.addEventListener("click", downloadBanner);

// ---------- Init ----------
setTemplate("minimal");
updateBanner();
setGap(40);
setNameSize(48);
setPhotoSize(120);
setAlign("left");
setAccent("#2563eb");
watermarkToggle.textContent = "ON";
