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

// 상세창을 다시 열 때 이전 활동의 스크롤 위치를 이어받지 않습니다.
function showDialogFromTop() {
  if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  // 브라우저가 자동 포커스를 이동한 뒤에도 제목이 맨 위에 보이도록 보정합니다.
  requestAnimationFrame(() => {
    if (dialog.open) dialog.scrollTop = 0;
  });
}

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
      ${item.schedule ? `<p class="activity-schedule">${item.schedule}</p>` : ""}
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


// 질문탐구대회: 영역별 기록과 우수 리포트 뷰어
function inquiryGallery(gallery) {
  if (!gallery?.length) return "";
  return `<div class="inquiry-gallery">${gallery.map((image) => `
    <figure class="inquiry-gallery-item ${image.kind === "work" ? "inquiry-work" : "inquiry-photo"}">
      <a href="${image.src}" target="_blank" rel="noopener" aria-label="${image.alt} 이미지 크게 보기">
        <img src="${image.src}" alt="${image.alt}" loading="lazy" />
        <span>원본 크기로 보기 ↗</span>
      </a>
      <figcaption>${image.caption}</figcaption>
    </figure>`).join("")}</div>`;
}
function renderInquiryReport(track, index) {
  const report = track.reports?.[index];
  if (!report) return "";
  return `
    <div class="inquiry-report-head"><div><b>${report.title}</b><span>${report.pageRange} · 전체 ${track.reports.length}개 기록 중 ${index + 1}번째</span></div>
      <div class="inquiry-report-actions"><button type="button" data-inquiry-report-nav="prev" ${index === 0 ? "disabled" : ""}>이전</button><button type="button" data-inquiry-report-nav="next" ${index === track.reports.length - 1 ? "disabled" : ""}>다음</button></div>
    </div>
    <div class="inquiry-report-pages">${report.pages.map((src,i) => `
      <figure><a href="${src}" target="_blank" rel="noopener" aria-label="${report.title} ${i+1}쪽 크게 보기"><img src="${src}" alt="${report.title} 리포트 ${i+1}쪽" loading="lazy" /></a><figcaption>${i === 0 ? "앞쪽" : "뒷쪽"} · 클릭하면 확대</figcaption></figure>`).join("")}</div>`;
}
function renderInquiryTrack(track, reportIndex = 0) {
  if (!track) return "";
  return `
    <div class="inquiry-track-header"><span>${track.eyebrow}</span><h4>${track.title}</h4><p>${track.lead}</p></div>
    <div class="inquiry-focus-grid">${track.focus.map((item,idx) => `
      <article><span>${String(idx+1).padStart(2,"0")}</span><h5>${item.title}</h5><p>${item.body}</p></article>`).join("")}</div>
    ${track.gallery?.length ? `
      <div class="inquiry-gallery-header"><h4>${track.galleryTitle}</h4><p>${track.galleryIntro}</p></div>
      ${inquiryGallery(track.gallery)}` : '<p class="inquiry-text-only">과학 영역은 요청에 따라 사진 없이 활동 설명만 수록했습니다.</p>'}
    ${track.reports?.length ? `<div class="inquiry-report-section"><div class="inquiry-gallery-header"><h4>우수 학생 질문탐구 리포트</h4><p>${track.reportIntro}</p></div><div class="inquiry-report-viewer" data-report-index="${reportIndex}">${renderInquiryReport(track,reportIndex)}</div></div>` : ""}
  `;
}

// 메이커 교과: 기술·가정 세 주제의 N-ASKIN 6단계 및 활동 기록
function renderMakerTrack(track) {
  if (!track) return "";
  if (track.projects?.length) {
    return `
      <div class="maker-track-head">
        <span>INFORMATICS · DIGITAL MAKING</span>
        <h4>${track.title}</h4>
        <p class="maker-info-description">${track.description}</p>
        <div class="maker-driving-question"><b>핵심 질문</b><p>“${track.question}”</p></div>
      </div>
      <h5 class="maker-section-title">정보교과 활동과 디지털 결과물</h5>
      <div class="maker-info-project-grid">
        ${track.projects.map((project, index) => `<article class="maker-info-project">
          <span class="maker-info-project-number">${String(index + 1).padStart(2, "0")}</span>
          <h6>${project.title}</h6>
          <p>${project.description}</p>
          <div class="maker-info-links">
            ${project.resources.map((resource) => `<a href="${resource.url}" target="_blank" rel="noopener noreferrer">${resource.label}<span aria-hidden="true">↗</span></a>`).join("")}
          </div>
        </article>`).join("")}
      </div>`;
  }
  return `
    <div class="maker-track-head">
      <span>TECHNOLOGY · HOME ECONOMICS</span>
      <h4>${track.title}</h4>
      <div class="maker-driving-question"><b>핵심 질문</b><p>“${track.question}”</p></div>
    </div>
    <h5 class="maker-section-title">N-ASKIN 단계별 수업 활동</h5>
    <div class="maker-steps">
      ${track.steps.map((step, index) => `<article class="maker-step">
        <div class="maker-step-identifier"><span>${String(index+1).padStart(2, "0")}</span><b>${step.code}</b></div>
        <div><h6>${step.name}</h6><p>${step.detail}</p></div>
      </article>`).join("")}
    </div>
    ${track.photos?.length ? `
      <div class="maker-gallery-heading"><h5>${track.galleryTitle || "활동 사진"}</h5></div>
      <div class="maker-gallery">
        ${track.photos.map((photo) => `<figure>
          <a href="${photo.src}" target="_blank" rel="noopener" aria-label="${photo.alt} 크게 보기">
            <img src="${photo.src}" alt="${photo.alt}" loading="lazy" />
          </a>
          <figcaption>${photo.caption}</figcaption>
        </figure>`).join("")}
      </div>` : ""}
    ${track.video ? `
      <div class="maker-video-section">
        <h5>${track.video.title}</h5>
        <video controls playsinline preload="none" poster="${track.video.poster}" aria-label="${track.video.title}">
          <source src="${track.video.src}" type="video/mp4" />
          이 브라우저는 동영상 재생을 지원하지 않습니다.
        </video>
        <p>${track.video.caption}</p>
      </div>` : ""}
  `;
}

// v3.3 인문·사회 수업: 사회 세계지도와 국어 질문하는 독서 히어로
function renderHumanitiesWork(track, index) {
  const work = track.works?.[index];
  if (!work) return "";
  return `
    <div class="humanities-work-nav">
      <div><b>${work.label}</b><span>원본 활동 결과물 ${work.originalPage}쪽 · 선별 ${index + 1}/${track.works.length}</span></div>
      <div class="humanities-work-actions">
        <button type="button" data-humanities-work-nav="prev" ${index === 0 ? "disabled" : ""} aria-label="이전 학생 작품">이전</button>
        <button type="button" data-humanities-work-nav="next" ${index === track.works.length - 1 ? "disabled" : ""} aria-label="다음 학생 작품">다음</button>
      </div>
    </div>
    <figure class="humanities-work-page"><a href="${work.src}" target="_blank" rel="noopener" aria-label="${work.label} 원본 이미지 크게 보기"><img src="${work.src}" loading="lazy" alt="${work.label} — 개인정보 표시를 가린 독서 히어로 학생 학습지" /></a><figcaption>이미지를 누르면 원본 크기로 볼 수 있습니다.</figcaption></figure>
  `;
}
function renderHumanitiesTrack(track) {
  if (!track) return "";
  return `
    <div class="humanities-track-head">
      <span>${track.eyebrow}</span>
      <h4>${track.title}</h4>
      <p class="humanities-subtitle">${track.subtitle}</p>
      <p>${track.intro}</p>
      <div class="humanities-driving-question"><small>${track.questionLabel || "핵심 탐구 질문"}</small><b>“${track.question}”</b></div>
    </div>
    <h5 class="humanities-subheading">${track.stepsTitle}</h5>
    <div class="humanities-flow-grid">${track.steps.map((step,index)=>`
      <article class="humanities-flow-step"><span>${String(index+1).padStart(2,"0")}</span><b>${step.code}</b><div><h6>${step.name}</h6><p>${step.detail}</p></div></article>
    `).join("")}</div>
    <div class="humanities-meaning"><b>활동의 의미</b><p>${track.meaning}</p></div>
    ${track.photos?.length ? `
      <h5 class="humanities-subheading">${track.galleryTitle}</h5>
      <div class="humanities-gallery">${track.photos.map((photo)=>`<figure>
        <a href="${photo.src}" target="_blank" rel="noopener" aria-label="${photo.alt} 크게 보기"><img src="${photo.src}" alt="${photo.alt}" loading="lazy" /></a>
        <figcaption>${photo.caption}</figcaption></figure>`).join("")}</div>` : ""}
    ${track.works?.length ? `
      <div class="humanities-works">
        <h5 class="humanities-subheading">학생 독서·질문 활동 결과물</h5>
        <p class="humanities-works-intro">${track.worksIntro}</p>
        <div class="humanities-work-viewer" data-work-index="0">${renderHumanitiesWork(track,0)}</div>
      </div>` : ""}
  `;
}

// v3.5 활동 상세 화면 공통 템플릿: 소개 → 세부 탭 → 선택 내용 → 성과·자료
function renderActivityProcess(activity) {
  if (!activity.process?.length) return "";
  return `<ol class="process-list">${activity.process.map((step, index) => `<li><b>${String(index + 1).padStart(2, "0")}</b><span>${step}</span></li>`).join("")}</ol>`;
}
function renderActivityImages(images, title = "활동 사진") {
  if (!images?.length) return "";
  return `<div class="dialog-gallery detail-image-gallery">${images.map((img) => `<figure>
    <a href="${img.src}" target="_blank" rel="noopener" aria-label="${img.alt || title} 크게 보기"><img src="${img.src}" alt="${img.alt || title}" loading="lazy" /></a>
    ${img.caption ? `<figcaption>${img.caption}</figcaption>` : ""}
  </figure>`).join("")}</div>`;
}
function renderActivityResources(resources, title = "연결 자료") {
  if (!resources?.length) return "";
  return `<section class="dialog-section detail-resource-section"><h3>${title}</h3><div class="dialog-resources">${resources.map((r) => `<a href="${r.url}" target="_blank" rel="noopener noreferrer">${r.label}<span aria-hidden="true">↗</span></a>`).join("")}</div></section>`;
}
function renderActivityHighlight(activity) {
  if (!activity.highlights?.length) return "";
  return `<section class="dialog-section activity-highlight-section"><h3>운영 특징</h3><div class="activity-highlight-grid">${activity.highlights.map((h) => `<article><b>${h.title}</b><p>${h.body}</p></article>`).join("")}</div></section>`;
}
function renderStandardExtras(activity) {
  const mathSection = activity.mathLesson ? `
    <section class="dialog-section math-lesson-section">
      <span class="math-lesson-eyebrow">${activity.mathLesson.tagline}</span>
      <h3>${activity.mathLesson.title}</h3>
      <p class="math-lesson-intro">${activity.mathLesson.intro}</p>
      <div class="math-lesson-goals">
        <b>학습 목표</b>
        <ul>${activity.mathLesson.learningGoals.map((goal) => `<li>${goal}</li>`).join("")}</ul>
        <p><strong>활용 도구</strong> ${activity.mathLesson.tools}</p>
      </div>
      <h4 class="math-lesson-subheading">N-ASKIN 수업 흐름</h4>
      <div class="math-lesson-flow">
        ${activity.mathLesson.steps.map((step, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><b>${step.code}</b><div><h5>${step.name}</h5><p>${step.detail}</p></div></article>`).join("")}
      </div>
      <h4 class="math-lesson-subheading">학생들이 직접 만든 질문</h4>
      <p class="math-lesson-intro">${activity.mathLesson.questionIntro}</p>
      <div class="math-question-grid">
        ${activity.mathLesson.questionSamples.map((question) => `<article><small>${question.label}</small><p>“${question.question}”</p></article>`).join("")}
      </div>
      <h4 class="math-lesson-subheading">학생 질문 학습지 · 손글씨 기록</h4>
      <p class="math-lesson-intro">${activity.mathLesson.galleryIntro}</p>
      <div class="math-worksheet-gallery">
        ${activity.mathLesson.gallery.map((item) => `<figure><a href="${item.src}" target="_blank" rel="noopener" aria-label="${item.caption} 확대 보기"><img src="${item.src}" loading="lazy" alt="${item.caption}, 학생 질문 작성 부분만 편집한 이미지" /></a><figcaption>${item.caption}<span>클릭해서 크게 보기 ↗</span></figcaption></figure>`).join("")}
      </div>
    </section>
  ` : "";
  const highlightSection = activity.highlights?.length ? `
    <section class="dialog-section activity-highlight-section">
      <h3>운영 특징</h3>
      <div class="activity-highlight-grid">
        ${activity.highlights.map((highlight) => `<article><b>${highlight.title}</b><p>${highlight.body}</p></article>`).join("")}
      </div>
    </section>
  ` : "";
  const flowSection = activity.flowSteps?.length ? `
    <section class="dialog-section naskin-flow-section">
      <h3>N-ASKIN 6단계 흐름</h3>
      <div class="naskin-flow-grid">
        ${activity.flowSteps.map((step, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><b>${step.code}</b><h4>${step.title}</h4><p>${step.body}</p></article>`).join("")}
      </div>
    </section>
  ` : "";
  const comparisonSection = activity.comparison?.points?.length ? `
    <section class="dialog-section naskin-comparison-section">
      <div class="naskin-section-kicker">QUEST vs. N-ASKIN</div>
      <h3>모델 비교로 보는 N-ASKIN의 확장성</h3>
      <p class="naskin-comparison-intro">${activity.comparison.intro}</p>
      <div class="naskin-comparison-table">
        <div class="naskin-comparison-head aspect">비교 항목</div>
        <div class="naskin-comparison-head quest">QUEST</div>
        <div class="naskin-comparison-head naskin">N-ASKIN</div>
        ${activity.comparison.points.map((point) => `
          <div class="naskin-compare-aspect"><b>${point.aspect}</b></div>
          <div class="naskin-compare-body quest"><p>${point.quest}</p></div>
          <div class="naskin-compare-body naskin"><p>${point.naskin}</p></div>
        `).join("")}
      </div>
    </section>
  ` : "";

  return `${flowSection}${comparisonSection}${mathSection}`;
}

function renderQuestProgram(program, index, resource) {
  return `<article class="quest-program-card detail-quest-card">
    <header class="quest-program-heading"><span>${String(index + 1).padStart(2, "0")}</span><div><b>${program.focus}</b><h4>${program.title}</h4></div></header>
    <p class="quest-program-summary">${program.summary}</p>
    <blockquote class="quest-program-question"><b>핵심 탐구 질문</b><span>“${program.question}”</span></blockquote>
    <h5 class="detail-subheading">현장 탐구 과정</h5>
    <ol class="quest-program-activities">${program.activities.map((item) => `<li>${item}</li>`).join("")}</ol>
    <p class="quest-program-evidence"><b>남기는 근거</b><span>${program.evidence}</span></p>
    ${resource ? `<div class="detail-track-resources"><a href="${resource.url}" target="_blank" rel="noopener noreferrer">${resource.label} <span aria-hidden="true">↗</span></a></div>` : ""}
  </article>`;
}
function renderNAMoment(activity, index) {
  const h = activity.highlights[index];
  if (!h) return "";
  const imageGroups = [[], activity.images.slice(4), activity.images.slice(0,4)];
  const steps = [activity.process.slice(0,2), activity.process.slice(2,3), activity.process.slice(3)];
  return `<div class="detail-track-head"><span>NOTICE · ASK · REFLECT</span><h4>${h.title}</h4><p>${h.body}</p></div>
    <h5 class="detail-subheading">활동 과정</h5>
    <ol class="detail-simple-steps">${steps[index].map((step) => `<li>${step}</li>`).join("")}</ol>
    ${imageGroups[index].length ? `<h5 class="detail-subheading">활동 사진과 기록</h5>${renderActivityImages(imageGroups[index], h.title)}` : ""}
    ${index === 0 ? `<div class="detail-track-resources">${activity.resources.map((r) => `<a href="${r.url}" target="_blank" rel="noopener noreferrer">${r.label} <span aria-hidden="true">↗</span></a>`).join("")}</div>` : ""}`;
}
function renderMQGuide(activity) {
  const mq = activity.mq;
  return `<div class="detail-track-head"><span>MUSIC & QUESTION</span><h4>메아리함에서 시작된 질문</h4><p>${mq.guideIntro}</p></div>
    <div class="mq-writing-checklist"><h4>좋은 질문을 위한 3대 체크리스트</h4><div>${mq.checklist.map((c) => `<article><b>${c.title}</b><span>${c.body}</span></article>`).join("")}</div></div>
    <div class="mq-route-grid">${mq.routes.map((r) => `<article><strong>${r.title}</strong><p>${r.body}</p></article>`).join("")}</div>
    <h5 class="detail-subheading">M&Q 작성 가이드</h5>
    <div class="mq-guide-grid">${mq.guides.map((g) => `<figure><a href="${g.src}" target="_blank" rel="noopener" aria-label="${g.title} 크게 보기"><img src="${g.src}" alt="${g.alt}" loading="lazy" /></a><figcaption><b>${g.title}</b><span>${g.caption}</span></figcaption></figure>`).join("")}</div>
    <h5 class="detail-subheading">방송실 앞 울림의 현장</h5>${renderActivityImages(activity.images, "M&Q 현장")}`;
}
function renderMQCriteria(activity) {
  return `<div class="detail-track-head"><span>BEST QUESTION & ANSWER</span><h4>좋은 질문과 답변을 선정하는 기준</h4><p>매월 서로 다른 관점을 담은 질문과 답변을 선정하여 학교 전체에 공유했습니다.</p></div>
  <div class="mq-criteria-grid">${activity.mq.criteria.map((c) => `<article><h4>${c.title}</h4><ul>${c.items.map((item) => `<li><b>${item.name}</b><span>${item.detail}</span></li>`).join("")}</ul></article>`).join("")}</div>`;
}
function renderMQArchive(activity) {
  const months = activity.mq.months;
  return `<div class="mq-month-section">
    <div class="detail-track-head"><span>MONTHLY ARCHIVE · 2026</span><h4>이달의 베스트 질문 & 답변</h4><p>${activity.mq.monthlyIntro}</p></div>
    <div class="mq-month-tabs" role="tablist" aria-label="월별 베스트 질문과 답변">
      ${months.map((m,i) => `<button type="button" role="tab" data-mq-month="${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${m.month.replace("2026년 ", "")}</button>`).join("")}
    </div>
    <div class="mq-month-panel" role="tabpanel" aria-live="polite">${renderMQMonth(months[0])}</div>
  </div>`;
}
function renderHumanitiesLinkTrack(activity, subject) {
  const isEnglish = subject === "영어";
  const resources = activity.resources.filter((r) => r.label.startsWith(isEnglish ? "영어" : "도덕"));
  const description = isEnglish ? activity.process.find((s) => s.startsWith("영어:")) : activity.process.find((s) => s.startsWith("도덕:"));
  return `<div class="detail-track-head"><span>${isEnglish ? "ENGLISH · AI REFLECTION" : "ETHICS · DIGITAL CITIZENSHIP"}</span><h4>${isEnglish ? "영어 — AI 포스터 만들기" : "도덕 — 가상공간과 에티켓"}</h4><p>${description || ""}</p></div>
    <h5 class="detail-subheading">학생 활동과 결과물</h5>
    <p class="detail-link-note">현재는 외부 자료를 통해 수업 기록을 공유합니다. 아래 링크에서 해당 학급의 탐구 결과를 살펴볼 수 있습니다.</p>
    <div class="dialog-resources detail-track-link-grid">${resources.map((r) => `<a href="${r.url}" target="_blank" rel="noopener noreferrer">${r.label}<span>↗</span></a>`).join("")}</div>`;
}
function renderSTEMScience(activity) {
  return `<div class="detail-track-head"><span>SCIENCE · QUESTION & EVIDENCE</span><h4>과학 — 자연과 일상에서 발견하는 탐구 질문</h4><p>자연과 일상 현상을 관찰하고, 그 원인과 조건에 관한 질문을 근거를 통해 설명하는 과학과 질문탐구 활동을 소개합니다.</p></div>
    <h5 class="detail-subheading">과학 질문탐구 과정</h5><ol class="detail-simple-steps"><li>${activity.process.find((p) => p.startsWith("과학:")) || "현상을 관찰하고 질문을 만들며 근거를 수집해 설명하기"}</li></ol>
    <p class="detail-link-note">과학과는 요청에 따라 별도 사진 없이 활동 설명만 수록했습니다.</p>`;
}

// 함께 성장하는 교사: 지역별 연수·수업 나눔 기록
function renderTeacherProgram(program) {
  return `<div class="detail-track-head teacher-program-head">
      <span>${program.eyebrow}</span>
      <h4>${program.title}</h4>
      <p>${program.summary}</p>
    </div>
    <div class="teacher-program-meta"><b>참여 대상</b><span>${program.audience}</span></div>
    <blockquote class="maker-driving-question teacher-driving-question"><b>연수의 핵심 질문</b><p>“${program.question}”</p></blockquote>
    <h5 class="detail-subheading">연수·나눔의 흐름</h5>
    <ol class="detail-simple-steps teacher-program-steps">${program.activities.map((item) => `<li>${item}</li>`).join("")}</ol>
    <div class="humanities-meaning teacher-program-meaning"><b>활동의 의미</b><p>${program.meaning}</p></div>
    ${program.images?.length ? `<h5 class="detail-subheading">연수 현장</h5>${renderActivityImages(program.images, program.title)}` : ""}
    <div class="detail-track-resources"><a href="${program.resource.url}" target="_blank" rel="noopener noreferrer">${program.resource.label} <span aria-hidden="true">↗</span></a></div>`;
}

// 함께 성장하는 교사: QUEST에서 N-ASKIN과 정보교과 4모델로 이어진 연구 과정
function renderTeacherResearchStage(activity, stage, index) {
  const research = activity.teacherResearch;
  const image = activity.images?.[stage.imageIndex];
  const evolution = index === 0 ? `
    <h5 class="detail-subheading">질문탐구 수업 모델의 발전 흐름</h5>
    <div class="research-evolution-grid">
      ${research.evolution.map((item, itemIndex) => `<article>
        <span>${String(itemIndex + 1).padStart(2, "0")} · ${item.period}</span>
        <b>${item.name}</b>
        <p>${item.body}</p>
      </article>`).join("")}
    </div>` : "";
  return `<div class="detail-track-head research-stage-head">
      <span>${stage.eyebrow}</span>
      <h4>${stage.title}</h4>
      <p>${stage.summary}</p>
    </div>
    <div class="teacher-program-meta research-stage-period"><b>연구 시기</b><span>${stage.period}</span></div>
    ${evolution}
    <blockquote class="maker-driving-question research-driving-question"><b>이 단계의 연구 질문</b><p>“${stage.question}”</p></blockquote>
    <h5 class="detail-subheading">연구와 수업 적용</h5>
    <ol class="detail-simple-steps research-stage-actions">${stage.actions.map((item) => `<li>${item}</li>`).join("")}</ol>
    <div class="research-turning-point"><b>다음 단계로 이끈 발견</b><p>${stage.turningPoint}</p></div>
    ${image ? `<h5 class="detail-subheading">공동 연구 현장</h5>${renderActivityImages([image], stage.title)}` : ""}
    ${stage.resources?.length ? `<div class="detail-track-resources">${stage.resources.map((resource) => `<a href="${resource.url}" target="_blank" rel="noopener noreferrer">${resource.label} <span aria-hidden="true">↗</span></a>`).join("")}</div>` : ""}`;
}

// 2026. 11. 12. 정보과 공개수업: 개요·미션·디버깅형 N-ASKIN
function renderOpenClassOverview(activity) {
  const overview = activity.openClassDetails.overview;
  return `<div class="detail-track-head open-class-head">
      <span>OPEN CLASS · 2026. 11. 12.</span>
      <h4>협력적 앱 개발 × 디버깅형 N-ASKIN</h4>
      <p>카페 키오스크 앱의 오류를 실험으로 재현하고, 질문과 근거를 연결해 수정·재검증하는 45분 수업입니다.</p>
    </div>
    <blockquote class="maker-driving-question open-class-question"><b>핵심 탐구 질문</b><p>“${overview.question}”</p></blockquote>
    <h5 class="detail-subheading">학습 목표</h5>
    <ol class="detail-simple-steps open-class-goals">${overview.goals.map((goal) => `<li>${goal}</li>`).join("")}</ol>
    <h5 class="detail-subheading">2인 1조 · 태블릿 2대 역할</h5>
    <div class="activity-highlight-grid open-class-role-grid">${overview.roles.map((role) => `<article><b>${role.title}</b><p>${role.body}</p></article>`).join("")}</div>
    <div class="detail-track-resources">${overview.resources.map((resource) => `<a href="${resource.url}" target="_blank" rel="noopener noreferrer">${resource.label} <span aria-hidden="true">↗</span></a>`).join("")}</div>`;
}
function renderOpenClassMissions(activity) {
  const missions = activity.openClassDetails.missions;
  return `<div class="detail-track-head open-class-head">
      <span>12 GROUPS · 4 DEBUGGING MISSIONS</span>
      <h4>네 가지 오류를 세 조씩 비교 탐구</h4>
      <p>각 미션을 세 조가 맡아 서로 다른 실행 기록과 원인 판단을 비교할 수 있도록 구성했습니다.</p>
    </div>
    <div class="open-class-mission-grid">${missions.map((mission) => `<article>
      <span>${mission.number}</span><h5>${mission.title}</h5><p>${mission.focus}</p>
    </article>`).join("")}</div>`;
}
function renderOpenClassFlow(activity) {
  const steps = activity.openClassDetails.steps;
  return `<div class="detail-track-head open-class-head">
      <span>DEBUGGING N-ASKIN · 6 STEPS</span>
      <h4>관찰에서 재검증까지 이어지는 탐구 흐름</h4>
      <p>실행 결과를 바로 해석하거나 코드를 먼저 고치지 않고, 사실 기록과 조건 통제, 근거 연결을 거쳐 수정의 타당성을 확인합니다.</p>
    </div>
    <div class="maker-steps open-class-flow">${steps.map((step, index) => `<article class="maker-step">
      <div class="maker-step-identifier"><span>${String(index + 1).padStart(2, "0")}</span><b>${step.code}</b></div>
      <div><h6>${step.name}</h6><p>${step.detail}</p></div>
    </article>`).join("")}</div>`;
}
function getActivityDetailTabs(activity) {
  // 목록에 나타나는 순서와 선택 후 표시할 내용이 이 한 곳에서 관리됩니다.
  if (activity.programs?.length) return activity.programs.map((p,i) => ({ id:`trip-${i}`, label:p.title.replace("여름방학 ", "").replace("1학년 ", "").replace("2학년 ", ""), render:() => renderQuestProgram(p,i,activity.resources?.find((r) => r.label.includes(p.title))) }));
  if (activity.id === "na-moment") return activity.highlights.map((h,i) => ({ id:`na-${i}`, label:h.title, render:() => renderNAMoment(activity,i) }));
  if (activity.mq) return [
    { id:"mq-guide", label:"참여 방법", render:() => renderMQGuide(activity) },
    { id:"mq-criteria", label:"선정 기준", render:() => renderMQCriteria(activity) },
    { id:"mq-archive", label:"월별 질문·답변", render:() => renderMQArchive(activity) }
  ];
  if (activity.inquiry?.tracks?.length) return activity.inquiry.tracks.map((t) => ({ id:t.id, label:t.label, render:() => renderInquiryTrack(t) }));
  if (activity.humanitiesLessons?.tracks?.length) return [
    ...activity.humanitiesLessons.tracks.slice().sort((a,b) => (a.id === "reading" ? -1 : b.id === "reading" ? 1 : 0)).map((t) => ({ id:t.id, label:t.id === "social" ? "사회" : t.id === "reading" ? "국어" : t.label, render:() => renderHumanitiesTrack(t) })),
    { id:"english", label:"영어", render:() => renderHumanitiesLinkTrack(activity,"영어") },
    { id:"ethics", label:"도덕", render:() => renderHumanitiesLinkTrack(activity,"도덕") }
  ];
  if (activity.mathLesson) return [
    { id:"math", label:"수학", render:() => renderStandardExtras({ mathLesson:activity.mathLesson }) },
    { id:"science", label:"과학", render:() => renderSTEMScience(activity) }
  ];
  if (activity.makerLessons?.tracks?.length) return activity.makerLessons.tracks.map((t) => ({ id:t.id, label:t.label, render:() => renderMakerTrack(t) }));
  if (activity.teacherResearch?.stages?.length) return activity.teacherResearch.stages.map((stage, index) => ({ id:stage.id, label:stage.label, render:() => renderTeacherResearchStage(activity, stage, index) }));
  if (activity.teacherPrograms?.length) return activity.teacherPrograms.map((program) => ({ id:program.id, label:program.label, render:() => renderTeacherProgram(program) }));
  if (activity.openClassDetails) return [
    { id:"open-overview", label:"수업 개요", render:() => renderOpenClassOverview(activity) },
    { id:"open-missions", label:"4개 미션", render:() => renderOpenClassMissions(activity) },
    { id:"open-flow", label:"N-ASKIN 흐름", render:() => renderOpenClassFlow(activity) }
  ];
  return [];
}
function renderDetailTabGroup(activity, detailTabs) {
  if (!detailTabs.length) return "";
  return `<section class="dialog-section detail-tabs-section" data-detail-activity="${activity.id}">
    <div class="detail-section-header"><span>EXPLORE THE ACTIVITIES</span><h3>세부 활동 살펴보기</h3><p>항목을 선택하면 해당 활동의 질문과 탐구 과정, 사진·결과물만 표시됩니다.</p></div>
    <div class="detail-tabs" role="tablist" aria-label="${activity.title} 세부 활동 선택">
      ${detailTabs.map((t,i) => `<button id="detail-tab-${activity.id}-${i}" type="button" role="tab" data-detail-tab="${t.id}" aria-selected="${i === 0}" aria-controls="detail-panel-${activity.id}" tabindex="${i === 0 ? 0 : -1}">${t.label}</button>`).join("")}
    </div>
    <div class="detail-panel" id="detail-panel-${activity.id}" role="tabpanel" aria-labelledby="detail-tab-${activity.id}-0" aria-live="polite">${detailTabs[0].render()}</div>
  </section>`;
}
function openActivity(activityId) {
  const activity = activities.find((item) => item.id === activityId);
  if (!activity) return;
  const category = categories.find((item) => item.id === activity.category);
  const detailTabs = getActivityDetailTabs(activity);
  const multi = detailTabs.length > 1;
  const commonProcess = activity.process?.length ? (multi
    ? `<details class="detail-overview-more"><summary>전체 활동 과정 펼쳐 보기</summary>${renderActivityProcess(activity)}</details>`
    : `<section class="dialog-section detail-process-section"><h3>탐구 및 활동 과정</h3>${renderActivityProcess(activity)}</section>`) : "";
  const genericHighlights = (multi && activity.id === "na-moment") ? "" : renderActivityHighlight(activity);
  const singleImages = !multi && activity.images?.length ? `<section class="dialog-section detail-images-section"><h3>사진과 결과물</h3>${renderActivityImages(activity.images,activity.title)}</section>` : "";
  const bottomResources = multi && ["quest-trip","na-moment","humanities-inquiry","maker-inquiry","teacher-study-group","regional-sharing","open-class"].includes(activity.id) ? "" : renderActivityResources(activity.resources);
  dialog.className = `activity-dialog ${category?.color || "blue"}`;
  dialogContent.innerHTML = `
    <header class="dialog-header">
      <span class="dialog-category">${category?.title || "활동 기록"}</span>
      <h2 id="dialog-title">${activity.title}</h2>
      <p>${activity.subtitle}</p>
    </header>
    <section class="dialog-section detail-intro-section">
      <h3>활동 전체 소개</h3>
      <p class="dialog-introduction">${activity.introduction}</p>
      ${activity.schedule ? `<p class="dialog-schedule">${activity.schedule}</p>` : ""}
      ${multi ? commonProcess : ""}
    </section>
    ${multi ? renderDetailTabGroup(activity,detailTabs) : `${commonProcess}${renderStandardExtras(activity)}`}
    ${genericHighlights}
    ${singleImages}
    <section class="outcome-box detail-common-outcome">
      <span>${activity.outcomeLabel || "활동의 의미 및 변화"}</span>
      <p>${activity.outcome}</p>
    </section>
    ${bottomResources}
  `;
  showDialogFromTop();
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
  showDialogFromTop();
}

const lightbox = document.querySelector("#archive-image-lightbox");
let lightboxImages = [];
let lightboxIndex = 0;
function setLightboxIndex(index) {
  if (!lightboxImages.length) return;
  lightboxIndex = Math.max(0, Math.min(lightboxImages.length - 1, index));
  const selected = lightboxImages[lightboxIndex];
  const preview = lightbox.querySelector("img");
  preview.src = selected.src;
  preview.alt = selected.alt;
  lightbox.querySelector("figcaption").textContent = selected.alt;
  lightbox.querySelector(".lightbox-count").textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
  lightbox.querySelector(".lightbox-prev").disabled = lightboxIndex === 0;
  lightbox.querySelector(".lightbox-next").disabled = lightboxIndex === lightboxImages.length - 1;
}
function showImageLightbox(link) {
  // 동일한 사진 갤러리 안에서 공통 이전/다음 동작을 제공합니다.
  const group = link.closest(".dialog-gallery, .inquiry-gallery, .inquiry-report-pages, .humanities-gallery, .humanities-work-viewer, .math-worksheet-gallery, .maker-gallery, .mq-guide-grid, .mq-month-posters") || dialogContent;
  const links = [...group.querySelectorAll('a[href]')].filter((a) => /\.(?:png|webp|jpe?g)(?:[?#].*)?$/i.test(a.getAttribute("href") || ""));
  lightboxImages = links.map((a) => ({ src:a.getAttribute("href"), alt:a.querySelector("img")?.alt || "활동 사진" }));
  if (!lightboxImages.length) lightboxImages = [{src:link.getAttribute("href"),alt:link.querySelector("img")?.alt || "활동 사진"}];
  const selected = lightboxImages.findIndex((item) => item.src === link.getAttribute("href"));
  setLightboxIndex(Math.max(0,selected));
  if (!lightbox.open) lightbox.showModal();
}
lightbox.querySelector(".lightbox-prev").addEventListener("click", () => setLightboxIndex(lightboxIndex - 1));
lightbox.querySelector(".lightbox-next").addEventListener("click", () => setLightboxIndex(lightboxIndex + 1));
lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    setLightboxIndex(lightboxIndex + (event.key === "ArrowRight" ? 1 : -1));
  }
});
lightbox.addEventListener("click", (event) => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener("close", () => { lightbox.querySelector("img").removeAttribute("src"); lightboxImages = []; });

document.addEventListener("click", (event) => {
  // 상세창 내 사진은 동일한 확대 화면으로 표시합니다. 외부 링크는 그대로 엽니다.
  const imageLink = event.target.closest('#dialog-content a[href]');
  if (imageLink && /\.(?:png|webp|jpe?g)(?:[?#].*)?$/i.test(imageLink.getAttribute("href") || "")) {
    event.preventDefault();
    showImageLightbox(imageLink);
    return;
  }
  const commonTab = event.target.closest("[data-detail-tab]");
  if (commonTab) {
    const section = commonTab.closest(".detail-tabs-section");
    const activity = activities.find((a) => a.id === section?.dataset.detailActivity);
    const selected = getActivityDetailTabs(activity || {}).find((t) => t.id === commonTab.dataset.detailTab);
    if (section && selected) {
      section.querySelectorAll("[data-detail-tab]").forEach((button) => {
        const active = button === commonTab;
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
      });
      const panel = section.querySelector(".detail-panel");
      panel.innerHTML = selected.render();
      panel.setAttribute("aria-labelledby", commonTab.id);
    }
    return;
  }
  const workNav=event.target.closest("[data-humanities-work-nav]");
  if (workNav) {
    const section=workNav.closest(".detail-tabs-section");
    const selectedTab=section?.querySelector('[data-detail-tab][aria-selected="true"]');
    const activity=activities.find((item)=>item.id==="humanities-inquiry");
    const track=activity?.humanitiesLessons?.tracks?.find((item)=>item.id===selectedTab?.dataset.detailTab);
    const viewer=section?.querySelector(".humanities-work-viewer");
    if (track?.works?.length && viewer) {
      const current=Number(viewer.dataset.workIndex||0);
      const next=Math.max(0,Math.min(track.works.length-1,current+(workNav.dataset.humanitiesWorkNav==="next"?1:-1)));
      viewer.dataset.workIndex=String(next);
      viewer.innerHTML=renderHumanitiesWork(track,next);
    }
    return;
  }
  const reportNav = event.target.closest("[data-inquiry-report-nav]");
  if (reportNav) {
    const section = reportNav.closest(".detail-tabs-section");
    const selected = section?.querySelector('[data-detail-tab][aria-selected="true"]');
    const contest = activities.find((item) => item.id === "inquiry-contest");
    const track = contest?.inquiry?.tracks?.find((item) => item.id === selected?.dataset.detailTab);
    const viewer = section?.querySelector(".inquiry-report-viewer");
    if (track?.reports && viewer) {
      const current = Number(viewer.dataset.reportIndex || 0);
      const next = Math.max(0, Math.min(track.reports.length - 1, current + (reportNav.dataset.inquiryReportNav === "next" ? 1 : -1)));
      viewer.dataset.reportIndex = String(next);
      viewer.innerHTML = renderInquiryReport(track, next);
    }
    return;
  }
  const mqMonthTab = event.target.closest("[data-mq-month]");
  if (mqMonthTab) {
    const monthSection = mqMonthTab.closest(".mq-month-section");
    const monthIndex = Number(mqMonthTab.dataset.mqMonth);
    const mqActivity = activities.find((item) => item.id === "mq-project");
    const selectedMonth = mqActivity?.mq?.months?.[monthIndex];
    if (monthSection && selectedMonth) {
      monthSection.querySelectorAll("[data-mq-month]").forEach((tab) => {
        const active = tab === mqMonthTab;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
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

dialog.addEventListener("keydown", (event) => {
  const active = document.activeElement;
  if (!active?.matches?.("[data-detail-tab]") || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  const buttons = [...active.closest(".detail-tabs")?.querySelectorAll("[data-detail-tab]") || []];
  if (!buttons.length) return;
  event.preventDefault();
  const current = buttons.indexOf(active);
  const index = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
  buttons[index].focus();
  buttons[index].click();
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

dialog.addEventListener("close", () => { dialog.scrollTop = 0; });
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
