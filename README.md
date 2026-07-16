# SafeAI Slide Template

PDF-safe HTML 프레젠테이션 템플릿. 팀원들이 포크해서 새 발표자료를 만들 수 있도록 설계되었습니다.
`deck-stage.js`(썸네일 레일·자동 스케일·인쇄·전체화면 내장)로 구동됩니다.

## 빠른 시작

1. 이 레포(폴더)를 복사 — `deck.html` + `deck-stage.js` + `deck-editor.js`(편집 모드) + `assets/` 함께
2. `deck.html`을 브라우저로 열기 (좌측 썸네일 레일 + 자동 스케일 확인)
3. 필요시 `:root` 의 `--primary` 색상을 브랜드 컬러로 변경 (기본 = SafeAI 블루)
4. 필요한 `<section class="slide" data-label="...">` 만 남기고 나머지 삭제
5. 내용 입력 → `Cmd/Ctrl+P` 로 PDF 저장 (`F` 전체화면 발표)

> 구조·색상·금지 규칙은 `docs/design-system.md`, 에이전트 규칙은 `CLAUDE.md`/`AGENTS.md` 참고.

## 슬라이드 카탈로그 (24종)

| # | 레이아웃 | 용도 |
|---|---------|------|
| 01 | Cover — Dark Brand | 표지 (다크 배경) |
| 02 | Cover — Clean Light | 표지 (밝은 배경) |
| 03 | Agenda | 목차 (4섹션) |
| 04 | Section Divider | 섹션 구분 슬라이드 |
| 05 | Title + Bullet Points | 제목 + 2열 불릿 |
| 06 | Title + Image Right | 텍스트 좌 / 이미지 우 |
| 07 | Title + Image Left | 이미지 좌 / 텍스트 우 |
| 08 | Two Columns Equal | 2단 동등 비교 |
| 09 | Three Column Cards | 3열 카드 |
| 10 | Stats / Metrics | 숫자 강조 지표 |
| 11 | Full Bleed Image | 전면 이미지 |
| 12 | Table — Comparison | 비교 표 |
| 13 | Quote / Testimonial | 인용구 / 고객 발언 |
| 14 | Timeline | 로드맵 타임라인 |
| 15 | Problem → Solution | 문제 / 해결책 비교 |
| 16 | Process Steps | 프로세스 4단계 |
| 17 | 2×2 Image Grid | 이미지 4장 그리드 |
| 18 | Team Members | 팀원 소개 (4명) |
| 19 | Closing / Thank You | 마무리 슬라이드 |
| 20 | Company Overview | 회사 소개 (좌: 소개+특징, 우: 지표 3종) |
| 21 | Solution Feature (A-type) | 다크 헤더 + 좌 설명 + 우 2단 이미지 |
| 22 | Technical Proposal (Split) | 좌 다크 도전과제 + 우 솔루션 비교표 |
| 23 | R&D Project Background | 과제 헤더 + 2×2 목표 그리드 + 기술 태그 |
| 24 | Client / Partner Logos | 레퍼런스 로고 3×2 그리드 |

## 발표 / 조작 (deck-stage.js 내장)

`deck.html`을 브라우저로 열면 좌측에 **썸네일 레일**이 뜨고, 슬라이드는 화면에 꽉 차게 자동 스케일됩니다.

| 키 | 동작 |
|----|------|
| `← →` `Space` `PgUp/Dn` | 슬라이드 이동 |
| `Home` `End` | 처음 / 마지막 |
| `1`~`9` `0` | 해당 슬라이드 점프 |
| `R` | 첫 슬라이드 리셋 |
| `F` | 전체화면 토글 |
| `T` | 썸네일 레일 토글 |
| `E` | 직접 편집 모드 토글 (`deck-editor.js` 포함 시) |

썸네일: 클릭 이동 · 드래그 재정렬 · 우클릭(건너뛰기/복제/삭제).

## 직접 편집 (편집 모드)

브라우저에서 슬라이드를 바로 고치는 WYSIWYG 편집 레이어입니다. `deck-stage.js` 를
건드리지 않고 그 위에 얹히는 bolt-on 이라, 덱 HTML 에 **스크립트 한 줄만 추가**하면 켜집니다.

```html
<script src="deck-stage.js"></script>
<script src="deck-editor.js"></script>   <!-- ← 이 줄이 편집 모드를 얹어줌 -->
```

> `deck.html`, `api-contract-deck.html` 등 기존 덱에는 이미 포함돼 있습니다.
> 이 줄이 **없으면** 보여주기 전용(편집 불가)이 됩니다. `deck-editor.js` 파일 자체는 수정하지 않습니다.

| 조작 | 동작 |
|------|------|
| `E` 또는 우하단 `편집` 버튼 | 편집 모드 진입 / 종료 |
| 요소 클릭 → 드래그 | 위치 이동 |
| 핸들 드래그 | 크기 조절 |
| 텍스트 더블클릭 | 인라인 수정 (`Esc` 로 확정) |
| 방향키 | 선택 요소 미세 이동 |
| `Delete` / `Backspace` | 선택 요소 삭제 |
| `Cmd/Ctrl + S` | 저장 |

> 발표(보여주기)만 할 때는 `E` 를 누르지 않으면 편집 모드가 켜지지 않습니다.
> 전체화면(`F`) 진입 시 편집 UI 는 자동으로 숨겨져 클린 프레젠테이션이 유지됩니다.

## PDF 저장

`Cmd/Ctrl + P` → **PDF로 저장** → 그대로 저장.
deck-stage가 용지를 1280×720(16:9)로 자동 설정하므로 **용지 크기를 바꾸지 마세요.**
슬라이드당 1페이지로 깔끔하게 출력됩니다. (배경 그래픽 체크 권장)

## 브랜드 컬러 변경

`deck.html` 상단 `:root` 블록에서 수정 (기본값 = SafeAI 브랜드 블루):

```css
:root {
  --primary:       #3242C6;  /* 제목·헤더·아이콘·액센트 (밝은 브랜드 블루) */
  --primary-dark:  #2937A7;  /* 진한 블루 — 호버/테이블 헤더 */
  --primary-light: #E1E9F7;  /* 라이트블루 틴트 — 배지/콜아웃 */
  --dark:          #1B2456;  /* 다크 슬라이드 배경 (navy) */
  --ink:           #222A35;  /* 본문 slate */
  --accent:        #0EA5E9;  /* 포인트 컬러 */
}
```

> 제목은 `c-primary`(브랜드 블루)로 — 검정(`c-dark`)으로 두지 마세요.

## 이미지 교체

1. `assets/` 폴더에 이미지 추가
2. `img-ph` 클래스 div를 `<img>` 태그로 교체:

```html
<!-- 교체 전 -->
<div class="img-ph" style="flex:1;">이미지</div>

<!-- 교체 후 -->
<img src="assets/your-image.png" style="flex:1;object-fit:cover;border-radius:8px;">
```

## PDF-safe 규칙

이 템플릿은 다음 규칙을 준수합니다. **절대 위반 금지:**

| 금지 | 대체 |
|------|------|
| `background-clip: text` | `color: #hex` 직접 사용 |
| `box-shadow` colored rgba | `rgba(0,0,0,.N)` 또는 `border` |
| `filter: blur()` 장식 | `display:none` 또는 제거 |
| `mask-image` | `opacity` 조절 |
| `::before` `content: none` | 규칙 완전 제거 |
| `backdrop-filter: blur()` | solid `background-color` |

## 배포 (Vercel)

라이브: **https://safeai-deck-template.vercel.app**

`main` 브랜치에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 Vercel 프로덕션으로 자동 배포합니다.

**최초 1회 설정** — repo Settings → Secrets and variables → Actions 에 추가:

| Secret | 값 |
|--------|-----|
| `VERCEL_TOKEN` | Vercel 대시보드 → Account Settings → Tokens 에서 발급 |
| `VERCEL_ORG_ID` | (등록 완료) |
| `VERCEL_PROJECT_ID` | (등록 완료) |

> 무료(Hobby) 플랜은 org 소유 private repo의 네이티브 Git 연동을 지원하지 않아, 토큰 기반 CLI 배포로 우회합니다.
> 수동 배포가 필요하면 로컬에서 `vercel --prod --scope wonderits-projects`.
