# SafeAI Deck Template — Agent Instructions

이 폴더는 SafeAI 팀의 HTML 슬라이드 템플릿입니다.
수정 전 반드시 아래 내용과 `docs/design-system.md`를 읽으세요. (Codex/Claude 공통)

@docs/design-system.md

---

## 아키텍처 — deck-stage.js 웹 컴포넌트

이 덱은 `deck-stage.js`(레퍼런스와 동일, 수정 금지)가 구동합니다. 모든 슬라이드는
`<deck-stage>` 안의 직속 `<section class="slide" data-label="...">` 입니다.

```html
<deck-stage width="1280" height="720" style="--deck-rail-w:200px;">
  <section class="slide" data-label="표지" id="s01"> ... </section>
  <section class="slide" data-label="목차" id="s02"> ... </section>
</deck-stage>
<script src="deck-stage.js"></script>
```

컴포넌트가 자동 제공하는 것 (직접 구현 금지):
- **좌측 썸네일 레일** — 클릭 이동, 드래그 재정렬, 우클릭(skip/복제/삭제)
- **자동 스케일** — 캔버스(1280×720)를 뷰포트에 꽉 차게 letterbox 스케일
- **인쇄/PDF** — `@page`를 1280×720으로 주입 → Cmd+P 시 슬라이드당 1페이지
- **하단 네비 오버레이** — 이전/다음/리셋 + 페이지 카운트

### 키보드 / 조작
| 키 | 동작 |
|----|------|
| `←` `→` `Space` `PgUp/Dn` | 슬라이드 이동 |
| `Home` `End` | 처음 / 마지막 |
| `1`~`9` `0` | 해당 슬라이드로 점프 |
| `R` | 첫 슬라이드로 리셋 |
| **`F`** | 전체화면 토글 (deck.html 내장 스크립트) |
| **`T`** | 썸네일 레일 토글 (deck.html 내장 스크립트) |
| **`E`** | 직접 편집 모드 토글 (`deck-editor.js` 포함 시) |

> ⚠️ `<deck-stage>`의 직속 자식은 `<section>`과 주석만 가능. 다른 요소(`<p>`, `<div>`)를
> 넣으면 그것도 슬라이드로 인식됩니다. 슬라이드 제목/라벨은 `data-label` 속성으로 지정.

### 직접 편집 모드 — deck-editor.js (bolt-on)

`deck-stage.js`를 수정하지 않고 그 위에 얹는 WYSIWYG 편집 레이어입니다. 덱 HTML에
`<script src="deck-editor.js"></script>` **한 줄만 추가**하면 켜집니다 (`deck-stage.js` 다음에).

- **`E`** 또는 우하단 `편집` 버튼으로 진입/종료 → 요소 드래그 이동·핸들 리사이즈,
  텍스트 더블클릭 인라인 수정, 방향키 미세 이동, `Delete` 삭제, **`Cmd/Ctrl+S`** 저장.
- 이 줄이 **없으면** 보여주기 전용(편집 불가). `deck-editor.js` 파일 자체는 수정 금지(레퍼런스 유지).
- 발표만 할 땐 `E`를 누르지 않으면 편집 모드는 켜지지 않고, `F`(전체화면) 시 편집 UI는 자동 숨김.
- **새 덱 생성 시** `deck-stage.js`와 함께 `deck-editor.js` include도 챙길 것.

---

## 작업 전 필수 확인

1. **단일 파일**: 모든 슬라이드는 `deck.html` 하나에 있습니다. (+ `deck-stage.js`, 편집 모드용 `deck-editor.js`)
2. **이미지**: `assets/` 폴더에만 저장. 외부 URL 사용 금지.
3. **로고**: `safeai_h_white.png` (다크 배경) / `safeai_v_blue.png` (라이트 배경). 텍스트 대체 금지.
4. **이모지 금지**: SVG 아이콘만 사용 (viewBox="0 0 24 24", stroke="currentColor").
5. **PDF 안전**: PDF 깨짐 유발 CSS 패턴 금지 (`background-clip:text`, `filter:blur`, `backdrop-filter` 등).

## 색상 — 밝은 브랜드 블루 (검정·navy 남용 금지)

`:root` 토큰만 사용. 임의 hex 금지.

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--primary` | `#3242C6` | **제목·헤더·아이콘·액센트** (밝은 브랜드 블루) |
| `--primary-dark` | `#2937A7` | 진한 블루 (호버·테이블 헤더) |
| `--primary-light` | `#E1E9F7` | 라이트블루 틴트 (배지·콜아웃·아이콘 배경) |
| `--dark` | `#1B2456` | **다크 슬라이드 배경** (navy — 거의-검정 금지) |
| `--ink` | `#222A35` | 본문 near-black slate |
| `--g6` | `#64748B` | 보조 텍스트 |

- **제목(`h2`)은 `c-primary`** (브랜드 블루) — `c-dark`(검정 슬레이트) 쓰지 말 것.
- 본문은 `c-dark`(=`--ink` 슬레이트) 또는 `c-muted`.
- 다크 슬라이드는 `style="background:var(--dark)"` + 흰색 텍스트(`c-white`).

## 레이아웃 안전 여백 — 반드시 준수

슬라이드 크기 **1280 × 720px**. 콘텐츠가 로고/페이지번호와 겹치지 않게:

```
┌──────────────────────────────────────────────┐  y=0
│ ▲ --safe-top: 76px   .logo-wrap(top:26 h:26 → y=52) │
├──────────────────────────────────────────────┤  y=76  콘텐츠 시작
│   좌우 --pad: 52px                              │
├──────────────────────────────────────────────┤  y=668 콘텐츠 끝
│ ▼ --safe-bottom: 52px   .pg(bottom:22)         │
└──────────────────────────────────────────────┘  y=720
```

**모든 `position:absolute;inset:0` 콘텐츠 컨테이너는 반드시:**
```html
padding: var(--safe-top) var(--pad) var(--safe-bottom)
```
`padding:var(--pad)` 단독 금지 — 상단 로고, 하단 페이지번호와 겹칩니다.

## PDF / 이미지

- **PDF**: Cmd+P → "PDF로 저장" → 그대로 저장. deck-stage가 용지를 1280×720으로 자동
  설정하므로 **용지 크기를 손대지 말 것**. 슬라이드당 1페이지로 깔끔히 나옵니다.
- **커버/일러스트 이미지**: 반드시 `object-fit:contain` — `cover`는 좌우 잘림 발생.

### `.no-print` — PDF 탈출구
PDF-unsafe CSS는 원칙적으로 금지하되, **화면 연출용으로 꼭 써야 하는 장식 요소**는
`class="no-print"`를 붙여 인쇄 시에만 숨긴다 (deck.html에 `@media print{.no-print{display:none!important}}` 내장).
대상: `mask-image`/`-webkit-mask-image`(마스크 무시되고 배경 통째 인쇄), mesh·grid `background-image`(격자 인쇄),
장식용 glow `box-shadow`(사각 음영으로 렌더), `background-clip:text` 그라디언트(깨짐 → 단색 fallback 별도 제공).
> 콘텐츠(텍스트·핵심 도형)에는 쓰지 말 것 — PDF에서 사라진다. 어디까지나 장식 전용.

## 페이지 번호 부여 규칙 (`.pg`)

- **커버** (`data-label`에 "커버/Cover"): 페이지 번호 **없음**.
- **섹션 디바이더** (다크 전체배경 + 짧은 타이틀만): 번호 **없음** (로고와 겹침).
- **전면 이미지/클로징** 류: 번호 없음.
- 우측 상단에 **버튼(데모 등)이 오는 슬라이드**: `.logo-wrap` 로고 **제거** (겹침 방지).
- 그 외 일반 콘텐츠 슬라이드: 커버를 01로 세고 **02부터** 순번 부여.
- 다크 배경 슬라이드의 번호는 `.pg pg-light` (흰색).

## 슬라이드 추가 시

```html
<!-- <deck-stage> 안에 <section>을 직속 자식으로. slide-label <p> 쓰지 말 것 -->
<section class="slide" data-label="슬라이드 이름" id="sNN">
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;
              padding:var(--safe-top) var(--pad) var(--safe-bottom);">
    <!-- 헤더 (flex-shrink:0) — eyebrow + h2.c-primary -->
    <!-- 콘텐츠 (flex:1) -->
  </div>
  <div class="logo-wrap"><img src="assets/safeai_v_blue.png" style="height:26px;display:block;"></div>
  <div class="pg">NN</div>
</section>
```

## Fill-Space 원칙

**슬라이드 여백이 40% 이상이면 레이아웃이 잘못된 것입니다.**
- 텍스트가 적으면 → 폰트 크기 업
- 콘텐츠가 적으면 → 이미지/차트 추가 또는 레이아웃 변경
- 빈 자리표시자(`img-ph`)는 납품 전 반드시 실제 콘텐츠로 교체
