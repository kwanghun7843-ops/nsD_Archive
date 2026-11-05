const timelineData = [
  { period: "3—4월", title: "질문을 발견하다", body: "학생 질문의 의미를 함께 이해하고, 교과 수업 속 질문의 가능성을 탐색했습니다." },
  { period: "5—7월", title: "수업을 바꾸다", body: "질문 중심 수업을 시도하고, 학생의 질문이 탐구로 이어지는 과정을 기록했습니다." },
  { period: "8—10월", title: "모델을 다듬다", body: "수업의 시행착오를 바탕으로 N-ASKIN 질문 탐구 흐름을 구체화했습니다." },
  { period: "11—12월", title: "배움을 나누다", body: "학생·교사·학교의 변화를 전시하고, 다음 질문을 위한 성찰을 나눕니다." }
];

const archiveData = [
  { number: "COLLECTION 01", title: "질문하는 학생", body: "학생들의 질문과 생각이 탐구로 자라난 순간", symbol: "?" },
  { number: "COLLECTION 02", title: "질문하는 수업", body: "교과 수업 속에서 질문이 배움으로 이어진 사례", symbol: "Q" },
  { number: "COLLECTION 03", title: "함께 성장하는 교사", body: "수업을 함께 고민하고 실천하며 나눈 기록", symbol: "+" },
  { number: "COLLECTION 04", title: "디지털 프로젝트", body: "질문과 기술을 연결해 만든 우리 학교의 프로젝트", symbol: "∞" }
];

document.querySelector("#timeline").innerHTML = timelineData.map((item) => `
  <article class="timeline-item reveal">
    <div class="timeline-card">
      <time>${item.period}</time>
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    </div>
  </article>
`).join("");

document.querySelector("#archive-grid").innerHTML = archiveData.map((item) => `
  <article class="archive-card reveal" data-symbol="${item.symbol}">
    <span class="card-number">${item.number}</span>
    <h3>${item.title}</h3>
    <p>${item.body}</p>
    <span class="card-link">기록 준비 중 <b>→</b></span>
  </article>
`).join("");

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

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
