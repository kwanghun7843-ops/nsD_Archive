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

// 남산 울림(M&Q): 월별 질문·답변 기록 카드
function renderMQMonth(month) {
  if (!month) return "";
  return `
    <div class="mq-month-summary">
      <strong>${month.month}의 울림</strong>
      <span>${month.caption}</span>
    </div>
    <div class="mq-month-posters">
      <figure class="mq-poster-question">
        <a href="${month.question}" target="_blank" rel="noopener" aria-label="${month.month} 베스트 질문 포스터 크게 보기">
          <img src="${month.question}" alt="${month.month} 남산 울림 베스트 질문 3개 선정 결과" loading="lazy" />
        </a>
        <figcaption><b>BEST QUESTION</b> 이달의 베스트 질문 3개 <span>클릭해서 크게 보기 ↗</span></figcaption>
      </figure>
      <figure class="mq-poster-answer">
        <a href="${month.answer}" target="_blank" rel="noopener" aria-label="${month.month} 베스트 답변 포스터 크게 보기">
          <img src="${month.answer}" alt="${month.month} 남산 울림 베스트 답변 3개 선정 결과" loading="lazy" />
        </a>
        <figcaption><b>BEST ANSWER</b> 이달의 베스트 답변 3개 <span>클릭해서 크게 보기 ↗</span></figcaption>
      </figure>
    </div>
  `;
}

function openActivity(activityId) {
  const activity = activities.find((item) => item.id === activityId);
  if (!activity) return;
  const category = categories.find((item) => item.id === activity.category);
  const imageSection = activity.images?.length ? `<section class="dialog-section ${activity.mq ? "mq-photo-section" : ""}"><h3>${activity.mq ? "방송실 앞, 울림의 현장" : "사진 기록"}</h3><div class="dialog-gallery">${activity.images.map((image) => `<figure>${activity.mq ? `<a href="${image.src}" target="_blank" rel="noopener" aria-label="${image.alt || activity.title} 사진 크게 보기">` : ""}<img src="${image.src}" alt="${image.alt || activity.title}" loading="lazy" />${activity.mq ? "</a>" : ""}${image.caption ? `<figcaption>${image.caption}</figcaption>` : ""}</figure>`).join("")}</div></section>` : "";
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

  const mqSection = activity.mq ? `
    <section class="dialog-section mq-guide-section">
      <div class="mq-section-kicker">MUSIC & QUESTION</div>
      <h3>어떻게 질문할까요?</h3>
      <p class="mq-guide-intro">${activity.mq.guideIntro}</p>
      <div class="mq-writing-checklist">
        <h4>좋은 질문을 위한 3대 체크리스트</h4>
        <div>${activity.mq.checklist.map((point) => `<article><b>${point.title}</b><span>${point.body}</span></article>`).join("")}</div>
      </div>
      <div class="mq-route-grid">
        ${activity.mq.routes.map((route) => `<article><strong>${route.title}</strong><p>${route.body}</p></article>`).join("")}
      </div>
      <div class="mq-guide-grid">
        ${activity.mq.guides.map((guide) => `<figure>
          <a href="${guide.src}" target="_blank" rel="noopener" aria-label="${guide.title} 크게 보기"><img src="${guide.src}" alt="${guide.alt}" loading="lazy" /></a>
          <figcaption><b>${guide.title}</b><span>${guide.caption}</span></figcaption>
        </figure>`).join("")}
      </div>
    </section>
    <section class="dialog-section mq-criteria-section">
      <h3>무엇을 기준으로 선정할까요?</h3>
      <div class="mq-criteria-grid">
        ${activity.mq.criteria.map((criteria) => `<article>
          <h4>${criteria.title}</h4>
          <ul>${criteria.items.map((item) => `<li><b>${item.name}</b><span>${item.detail}</span></li>`).join("")}</ul>
        </article>`).join("")}
      </div>
    </section>
  ` : "";
  const mqArchiveSection = activity.mq?.months?.length ? `
    <section class="dialog-section mq-month-section">
      <div class="mq-section-kicker">MONTHLY ARCHIVE · 2026</div>
      <h3>이달의 베스트 질문 & 답변</h3>
      <p class="mq-guide-intro">${activity.mq.monthlyIntro}</p>
      <div class="mq-month-tabs" role="tablist" aria-label="월별 베스트 질문과 답변">
        ${activity.mq.months.map((month, index) => `<button type="button" role="tab" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" data-mq-month="${index}">${month.month.replace("2026년 ", "")}</button>`).join("")}
      </div>
      <div class="mq-month-panel" role="tabpanel" aria-live="polite">${renderMQMonth(activity.mq.months[0])}</div>
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
    ${mqSection}
    <section class="outcome-box">
      <span>${activity.outcomeLabel || "성과 또는 변화"}</span>
      <p>${activity.outcome}</p>
    </section>
    ${imageSection}${mqArchiveSection}${resourceSection}
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
  const mqMonthTab = event.target.closest("[data-mq-month]");
  if (mqMonthTab) {
    const monthSection = mqMonthTab.closest(".mq-month-section");
    const monthIndex = Number(mqMonthTab.dataset.mqMonth);
    const mqActivity = activities.find((item) => item.id === "mq-project");
    const selectedMonth = mqActivity?.mq?.months?.[monthIndex];
    if (monthSection && selectedMonth) {
      monthSection.querySelectorAll("[data-mq-month]").forEach((tab) => {
        const selected = tab === mqMonthTab;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      monthSection.querySelector(".mq-month-panel").innerHTML = renderMQMonth(selectedMonth);
    }
    return;
  }
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
