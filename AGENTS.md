# SafeAI Deck Template — Agent Guide (Codex / 범용)

SafeAI 팀 HTML 슬라이드 템플릿. **수정 전 반드시 아래 두 파일을 읽으세요:**
1. `docs/design-system.md` — 전체 디자인 시스템 (색상·타이포·금지 규칙·체크리스트)
2. 이 파일 (`AGENTS.md`) — 아키텍처·핵심 규칙 요약

> `CLAUDE.md`와 동일 내용입니다. 한쪽을 고치면 다른 쪽도 맞추세요.

---

## 아키텍처 — deck-stage.js

`deck-stage.js`(레퍼런스와 동일, **수정 금지**)가 덱을 구동합니다. 슬라이드는 모두
`<deck-stage>` 안의 직속 `<section class="slide" data-label="...">` 입니다.

```html
<deck-stage width="1280" height="720" style="--deck-rail-w:200px;">
  <section class="slide" data-label="표지" id="s01"> ... </section>
</deck-stage>
<script src="deck-stage.js"></script>
```

컴포넌트 자동 제공 (재구현 금지): 좌측 썸네일 레일 · 자동 스케일(뷰포트 꽉 채움) ·
인쇄(@page 1280×720 주입 → 슬라이드당 1페이지) · 하단 네비 오버레이.

**조작**: `←→`/`Space`/`PgUp/Dn` 이동, `Home`/`End`, `1~9` 점프, `R` 리셋,
`F` 전체화면 토글, `T` 썸네일 레일 토글. (`F`·`T`는 deck.html 내장 스크립트)

> ⚠️ `<deck-stage>` 직속 자식은 `<section>`과 주석만. `<p class="slide-label">` 같은
> 요소를 넣지 말 것 — 슬라이드로 오인됩니다. 라벨은 `data-label` 속성으로.

---

## 핵심 규칙

1. **단일 파일** `deck.html` (+ `deck-stage.js`). 이미지는 `assets/`에만.
2. **로고**: 다크 배경 `safeai_h_white.png` / 라이트 배경 `safeai_v_blue.png`. 텍스트 대체 금지.
3. **이모지 금지** → Feather 스타일 인라인 SVG (viewBox="0 0 24 24", stroke="currentColor").
4. **PDF 안전 금지 패턴**: `background-clip:text`, `filter:blur`, `backdrop-filter`, `mask-image`,
   colored `box-shadow`, `::before content` 장식.

## 색상 — 밝은 브랜드 블루 (검정·navy 남용 금지)

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--primary` | `#3242C6` | 제목·헤더·아이콘·액센트 (밝은 블루) |
| `--primary-dark` | `#2937A7` | 진한 블루 |
| `--primary-light` | `#E1E9F7` | 라이트블루 틴트 |
| `--dark` | `#1B2456` | 다크 슬라이드 배경 (navy) |
| `--ink` | `#222A35` | 본문 슬레이트 |

- 제목 `h2`는 **`c-primary`**(브랜드 블루). `c-dark`(검정) 쓰지 말 것.
- 다크 슬라이드: `style="background:var(--dark)"` + `c-white`.

## 레이아웃 안전 여백 (1280×720)

`position:absolute;inset:0` 콘텐츠 컨테이너는 **반드시**:
```css
padding: var(--safe-top) var(--pad) var(--safe-bottom)   /* 76px 52px 52px */
```
상단 로고(`--safe-top`)·하단 페이지번호(`--safe-bottom`)와 겹침 방지. `padding:var(--pad)` 단독 금지.

## PDF / 이미지

- **PDF**: Cmd+P → PDF로 저장 → 용지 크기 손대지 말 것 (1280×720 자동). 슬라이드당 1페이지.
- **커버/일러스트**: `object-fit:contain` (cover는 잘림).
- **`.no-print` 탈출구**: PDF에서 깨지는 장식 요소(`mask-image`, mesh/grid `background-image`,
  glow `box-shadow`, `background-clip:text` 그라디언트)는 화면 연출용으로만 쓰고 `class="no-print"`를
  붙여 인쇄 시 숨긴다 (deck.html에 `@media print{.no-print{display:none!important}}` 내장).
  **콘텐츠엔 쓰지 말 것** — PDF에서 사라짐. 장식 전용.

## 페이지 번호 부여 규칙 (`.pg`)

- 커버(`data-label`에 "커버/Cover") · 섹션 디바이더(다크 전체+짧은 타이틀) · 전면이미지/클로징 → 번호 **없음**.
- 우측 상단에 버튼(데모 등)이 오는 슬라이드 → `.logo-wrap` 로고 **제거**(겹침 방지).
- 그 외 콘텐츠 슬라이드 → 커버를 01로 세고 **02부터** 순번. 다크 배경 번호는 `.pg pg-light`(흰색).

## 슬라이드 추가 템플릿

```html
<section class="slide" data-label="슬라이드 이름" id="sNN">
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;
              padding:var(--safe-top) var(--pad) var(--safe-bottom);">
    <!-- 헤더(flex-shrink:0): eyebrow + h2.c-primary -->
    <!-- 콘텐츠(flex:1) -->
  </div>
  <div class="logo-wrap"><img src="assets/safeai_v_blue.png" style="height:26px;display:block;"></div>
  <div class="pg">NN</div>
</section>
```

## Fill-Space 원칙

슬라이드 여백 40% 이상이면 레이아웃 오류. 폰트 키우기 / 이미지·차트 추가 / 레이아웃 변경.
빈 `img-ph`는 납품 전 실제 콘텐츠로 교체.
