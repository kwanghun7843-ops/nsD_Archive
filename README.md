# 2026 남산중학교 질문하는 학교 디지털 아카이브

GitHub Pages에서 별도의 설치나 빌드 없이 실행할 수 있는 정적 웹앱입니다.

## 파일 구성

- `index.html` — 웹앱 화면 구조
- `styles.css` — 리플릿 테마와 반응형 디자인
- `script.js` — 카테고리 전환과 활동 상세 창 기능
- `archive-data.js` — 4개 카테고리와 17개 활동 내용
- `assets/images/` — 추후 활동 사진 저장 폴더

## GitHub Pages에 올리는 방법

1. GitHub에서 새 저장소를 만듭니다.
2. 이 압축파일을 풀고 안에 있는 모든 파일과 `assets` 폴더를 저장소 최상위에 업로드합니다.
3. 저장소의 `Settings` → `Pages`로 이동합니다.
4. `Build and deployment`의 Source를 `Deploy from a branch`로 선택합니다.
5. Branch는 `main`, 폴더는 `/(root)`를 선택한 뒤 저장합니다.
6. 잠시 후 표시되는 GitHub Pages 주소로 접속합니다.

## 활동 문구 수정

활동명, 소개, 주요 과정, 성과 문구는 `archive-data.js`에서 수정합니다.

```javascript
{
  id: "question-wings",
  category: "school",
  title: "질문의 날개",
  subtitle: "우리의 생각이 모여 배움의 날개가 되다!",
  introduction: "활동 소개",
  process: ["과정 1", "과정 2", "과정 3"],
  outcome: "성과 또는 변화",
  images: [],
  resources: []
}
```

## 사진 추가

사진 파일을 `assets/images` 폴더에 넣은 다음 해당 활동의 `images` 배열에 등록합니다.

```javascript
images: [
  { src: "assets/images/question-wings-main.jpg", alt: "완성된 질문의 날개" },
  { src: "assets/images/question-wings-activity-01.jpg", alt: "학생 질문 작성 모습" }
]
```

사진이 등록되지 않은 활동은 사진 영역이 자동으로 숨겨집니다. 웹용 사진은 JPG 또는 WebP 형식을 권장합니다.

## Google Drive·영상·자료 연결

해당 활동의 `resources` 배열에 공개 링크를 등록합니다.

```javascript
resources: [
  { label: "활동 안내자료", url: "https://drive.google.com/..." },
  { label: "활동 영상", url: "https://youtube.com/..." }
]
```

연결 자료가 등록되지 않은 활동은 자료 영역이 자동으로 숨겨집니다. Google Drive 자료는 링크가 있는 사용자가 열람할 수 있도록 공유 설정을 확인해야 합니다.

## 현재 수록 내용

- 질문하는 학교: 5개 활동
- 질문하는 학생: 4개 활동
- 질문하는 수업: 5개 활동
- 함께 성장하는 교사: 3개 활동

총 17개 활동이 수록되어 있습니다.
