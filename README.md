# SafeAI Slide Template

PDF-safe HTML 프레젠테이션 템플릿. 팀원들이 포크해서 새 발표자료를 만들 수 있도록 설계되었습니다.
`deck-stage.js`(썸네일 레일·자동 스케일·인쇄·전체화면 내장)로 구동됩니다.

## 빠른 시작

1. 이 레포(폴더)를 복사 — `deck.html` + `deck-stage.js` + `assets/` 함께
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

썸네일: 클릭 이동 · 드래그 재정렬 · 우클릭(건너뛰기/복제/삭제).

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

참고: [Claude Design 슬라이드 PDF 깨짐 원인과 예방법](http://blog.wonderx.co.kr/posts/claude-design-pdf-broken-fix)
