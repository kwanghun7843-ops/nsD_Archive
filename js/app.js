const categories = window.archiveCategories || [];
const activities = window.archiveActivities || [];
const naskinModels = window.naskinModels || [];
let activeCategory = categories[0]?.id || "school";

const overview = document.querySelector("#collection-overview");
const tabs = document.querySelector("#category-tabs");
const categoryIntro = document.querySelector("#category-intro");
const activityGrid = document.querySelector("#activity-grid");
const naskinModelGrid = document.querySelector("#naskin-model-grid");
const dialog = document.querySelector("#activity-dialog");
const dialogContent = document.querySelector("#dialog-content");

const activityCount = (categoryId) => activities.filter((item) => item.category === categoryId).length;

overview.innerHTML = categories.map((category) => `
  <button class="collection-card ${category.color} reveal" type="button" data-category-link="${category.id}">
    <span class="collection-number">COLLECTION ${category.number}</span>
    <span class="collection-symbol" aria-hidden="true">${category.symbol}</span>
    <strong>${category.title}</strong>
    <span class="collection-tagline">${category.tagline}</span>
    <span class="collection-meta">${activityCount(category.id)}개의 활동 <b>→</b></span>
  </button>
`).join("");

tabs.innerHTML = categories.map((category, index) => `
  <button class="category-tab ${category.color}" type="button" role="tab" data-category="${category.id}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">
    <span>${category.number}</span>${category.title}
  </button>
`).join("");

naskinModelGrid.innerHTML = naskinModels.map((model) => `
  <article class="naskin-model-card ${model.color} reveal">
    <div class="model-card-head"><span>MODEL ${model.number}</span><b>${model.scope}</b></div>
    <h3>${model.title}</h3>
    <p>${model.short}</p>
    <blockquote>“${model.coreQuestion}”</blockquote>
    <button type="button" data-open-model="${model.id}">단계와 수업 적용 예시 보기 <span>→</span></button>
  </article>
`).join("");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .1 });

const observeReveals = () => {
  document.querySelectorAll(".reveal:not(.visible)").forEach((element) => observer.observe(element));
};

function renderCategory(categoryId) {
  activeCategory = categoryId;
  const category = categories.find((item) => item.id === categoryId);
  const items = activities.filter((item) => item.category === categoryId);
  if (!category) return;

  tabs.querySelectorAll("[role='tab']").forEach((tab) => {
    const selected = tab.dataset.category === categoryId;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });

  categoryIntro.className = `category-intro ${category.color}`;
  categoryIntro.innerHTML = `
    <div><span>COLLECTION ${category.number}</span><h3>${category.title}</h3></div>
    <p>${category.tagline}</p>
  `;

  activityGrid.className = `activity-grid ${category.color}`;
  activityGrid.innerHTML = items.map((item, index) => `
    <article class="activity-card reveal">
      <div class="activity-card-top"><span>${String(index + 1).padStart(2, "0")}</span><i aria-hidden="true">${category.symbol}</i></div>
      <h3>${item.title}</h3>
      <p class="activity-subtitle">${item.subtitle}</p>
      <p class="activity-preview">${item.introduction}</p>
      <button type="button" data-open-activity="${item.id}">자세히 보기 <span>→</span></button>
    </article>
  `).join("");
  observeReveals();
}

function openActivity(activityId) {
  const activity = activities.find((item) => item.id === activityId);
  if (!activity) return;
  const category = categories.find((item) => item.id === activity.category);
  const imageSection = activity.images?.length ? `<section class="dialog-section"><h3>사진 기록</h3><div class="dialog-gallery">${activity.images.map((image) => `<figure><img src="${image.src}" alt="${image.alt || activity.title}" loading="lazy" />${image.caption ? `<figcaption>${image.caption}</figcaption>` : ""}</figure>`).join("")}</div></section>` : "";
  const resourceSection = activity.resources?.length ? `<section class="dialog-section"><h3>연결 자료</h3><div class="dialog-resources">${activity.resources.map((resource) => `<a href="${resource.url}" target="_blank" rel="noopener">${resource.label}<span>↗</span></a>`).join("")}</div></section>` : "";
  const highlightSection = activity.highlights?.length ? `
    <section class="dialog-section activity-highlight-section">
      <h3>운영 특징</h3>
      <div class="activity-highlight-grid">
        ${activity.highlights.map((highlight) => `<article><b>${highlight.title}</b><p>${highlight.body}</p></article>`).join("")}
      </div>
    </section>
  ` : "";
  const programSection = activity.programs?.length ? `
    <section class="dialog-section quest-program-section">
      <h3>체험별 질문탐구</h3>
      <div class="quest-program-grid">
        ${activity.programs.map((program, index) => `
          <article class="quest-program-card">
            <header class="quest-program-heading">
              <span>${String(index + 1).padStart(2, "0")}</span>
              <div><b>${program.focus}</b><h4>${program.title}</h4></div>
            </header>
            <p class="quest-program-summary">${program.summary}</p>
            <blockquote class="quest-program-question"><b>탐구 질문</b><span>“${program.question}”</span></blockquote>
            <ol class="quest-program-activities">
              ${program.activities.map((step) => `<li>${step}</li>`).join("")}
            </ol>
            <p class="quest-program-evidence"><b>남기는 근거</b><span>${program.evidence}</span></p>
          </article>
        `).join("")}
      </div>
    </section>
  ` : "";

  dialog.className = `activity-dialog ${category?.color || "blue"}`;
  dialogContent.innerHTML = `
    <header class="dialog-header">
      <span class="dialog-category">${category?.title || "활동 기록"}</span>
      <h2 id="dialog-title">${activity.title}</h2>
      <p>${activity.subtitle}</p>
    </header>
    <section class="dialog-section">
      <h3>활동 소개</h3>
      <p class="dialog-introduction">${activity.introduction}</p>
    </section>
    <section class="dialog-section">
      <h3>주요 과정</h3>
      <ol class="process-list">${activity.process.map((step, index) => `<li><b>${String(index + 1).padStart(2, "0")}</b><span>${step}</span></li>`).join("")}</ol>
    </section>
    ${highlightSection}
    ${programSection}
    <section class="outcome-box">
      <span>${activity.outcomeLabel || "성과 또는 변화"}</span>
      <p>${activity.outcome}</p>
    </section>
    ${imageSection}${resourceSection}
  `;
  if (typeof dialog.showModal === "function") dialog.showModal();
}

function openNaskinModel(modelId) {
  const model = naskinModels.find((item) => item.id === modelId);
  if (!model) return;

  dialog.className = `activity-dialog model-dialog ${model.color}`;
  dialogContent.innerHTML = `
    <header class="dialog-header model-dialog-header">
      <span class="dialog-category">${model.scope}</span>
      <h2 id="dialog-title">${model.title}</h2>
      <p>${model.short}</p>
    </header>
    <section class="dialog-section">
      <h3>모델의 목적</h3>
      <p class="dialog-introduction">${model.purpose}</p>
      <blockquote class="model-core-question"><span>핵심 질문</span>“${model.coreQuestion}”</blockquote>
    </section>
    <section class="dialog-section">
      <h3>단계별 탐구 활동</h3>
      <ol class="model-step-list">
        ${model.steps.map((step) => `<li><b>${step.code}</b><div><strong>${step.name}</strong><span>${step.body}</span></div></li>`).join("")}
      </ol>
    </section>
    <section class="dialog-section model-example-section">
      <h3>수업 적용 예시</h3>
      <div class="example-heading"><span>${model.example.subject}</span><h4>${model.example.title}</h4></div>
      <p class="example-situation">${model.example.situation}</p>
      <div class="example-question"><b>예시 질문</b><p>“${model.example.question}”</p></div>
      <ol class="example-activity-list">
        ${model.example.activities.map((activity, index) => `<li><b>${String(index + 1).padStart(2, "0")}</b><span>${activity}</span></li>`).join("")}
      </ol>
    </section>
    <section class="model-subjects">
      <b>적용 가능한 교과·영역</b>
      <div>${model.subjects.map((subject) => `<span>${subject}</span>`).join("")}</div>
    </section>
  `;
  if (typeof dialog.showModal === "function") dialog.showModal();
}

document.addEventListener("click", (event) => {
  const categoryLink = event.target.closest("[data-category-link]");
  if (categoryLink) {
    renderCategory(categoryLink.dataset.categoryLink);
    document.querySelector("#archive").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const tab = event.target.closest("[data-category]");
  if (tab) {
    renderCategory(tab.dataset.category);
    return;
  }
  const modelButton = event.target.closest("[data-open-model]");
  if (modelButton) {
    openNaskinModel(modelButton.dataset.openModel);
    return;
  }
  const activityButton = event.target.closest("[data-open-activity]");
  if (activityButton) openActivity(activityButton.dataset.openActivity);
});

tabs.addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  const currentIndex = categories.findIndex((item) => item.id === activeCategory);
  const direction = event.key === "ArrowRight" ? 1 : -1;
  const nextIndex = (currentIndex + direction + categories.length) % categories.length;
  const nextId = categories[nextIndex].id;
  renderCategory(nextId);
  tabs.querySelector(`[data-category="${nextId}"]`).focus();
});

document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".main-nav");
const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 30);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));

renderCategory(activeCategory);
observeReveals();
