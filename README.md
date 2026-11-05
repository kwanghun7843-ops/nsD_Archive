# 2026 남산중학교 질문하는 학교 디지털 아카이브

‘질문의 날개, 배움의 미래’를 주제로 제작한 GitHub Pages용 정적 웹사이트입니다.

## 파일 구성

- `index.html` — 웹사이트 기본 화면
- `styles.css` — 리플릿 테마와 반응형 디자인
- `script.js` — 타임라인·성과 카드·화면 동작

## GitHub Pages에 올리는 방법

1. GitHub에서 새 저장소를 만듭니다.
2. 이 압축파일을 풀어 나온 파일 4개를 저장소의 최상위 위치에 업로드합니다.
3. 저장소의 **Settings → Pages**로 이동합니다.
4. **Build and deployment**에서 `Deploy from a branch`를 선택합니다.
5. Branch는 `main`, 폴더는 `/ (root)`를 선택하고 **Save**를 누릅니다.
6. 잠시 기다린 뒤 표시되는 GitHub Pages 주소로 접속합니다.

## 내용 수정

- 연간 활동과 성과 카드 문구: `script.js`
- 제목·소개·N-ASKIN·자료실 문구: `index.html`
- 색상·배경·글꼴·반응형 화면: `styles.css`

사진과 PDF를 추가할 때는 저장소에 `assets` 폴더를 만든 뒤 파일을 넣고, HTML에서 `assets/파일명` 형식으로 연결하면 됩니다.
