# SafeAI Deck Design System
> AI 에이전트 및 팀원을 위한 슬라이드 제작 가이드.
> 이 파일을 읽은 뒤 deck.html을 수정하세요.

---

## 0. 아키텍처 (deck-stage.js)

덱은 `deck-stage.js` 웹 컴포넌트가 구동합니다 (**수정 금지** — 레퍼런스와 동일하게 유지).
슬라이드는 `<deck-stage width="1280" height="720">` 안의 직속 `<section class="slide" data-label="...">`.

- 좌측 **썸네일 레일**, 캔버스 **자동 스케일**(뷰포트 꽉 채움), **인쇄**(Cmd+P → 슬라이드당 1페이지), 하단 네비 오버레이를 컴포넌트가 자동 제공.
- 조작: `←→`/`Space`/`Home`/`End`/`1~9`/`R`, **`F` 전체화면**, **`T` 레일 토글**.
- ⚠️ `<deck-stage>` 직속 자식은 `<section>`·주석만. 슬라이드 라벨은 `data-label` 속성 사용 (`<p class="slide-label">` 금지 — 슬라이드로 오인됨).

---

## 1. 핵심 원칙: "AI스럽지 않게"

AI가 만든 자료처럼 보이는 가장 큰 원인은 **공간을 채우지 않는 것**과 **장식 과잉**이다.

### 반드시 지킬 것

| 금지 패턴 | 이유 | 대체 방법 |
|-----------|------|-----------|
| 이모지 (🚀🎯💡) | 즉시 AI 생성 티가 남 | Feather 스타일 인라인 SVG 아이콘 |
| `background-clip: text` 그라디언트 텍스트 | PDF 깨짐 + AI 클리셰 | 단색 `color: #hex` |
| 과도한 `box-shadow` (여러 레이어) | 과장된 입체감 = AI 스타일 | border 또는 단순 그림자 |
| "카드 속 카드" 중첩 구조 | 정보 위계 파괴 | 1단계 카드만 사용 |
| 글머리 기호 남용 (bullet 5개 이상) | 파워포인트 클리셰 | 2–3개 핵심만, 나머지는 삭제 |
| 빈 `img-ph` 자리표시자 그대로 납품 | 미완성처럼 보임 | 실제 이미지로 교체하거나 슬라이드 삭제 |
| 텍스트로만 채운 슬라이드 (이미지 0개) | 콘텐츠 밀도 부족 | 차트·스크린샷·다이어그램 삽입 |
| 슬라이드 절반 이상 여백 | 공간 낭비 = AI가 만든 것처럼 보임 | 레이아웃 변경 또는 콘텐츠 보강 |

### 채워야 할 것

**Fill-Space 원칙**: 슬라이드 여백이 40% 이상이면 레이아웃을 바꿔라.
- 텍스트가 짧으면 → 폰트 키우기 (`t28` → `t36`)
- 리스트가 짧으면 → 이미지나 차트 추가
- 카드가 작으면 → `flex:1`로 늘리거나 2열 → 1열로 변경

---

## 2. 브랜드 토큰

```css
/* 반드시 아래 변수만 사용. 임의 hex 값 사용 금지 */
--primary:       #3242C6;   /* SafeAI 브랜드 블루 — 제목·헤더·아이콘·액센트 */
--primary-dark:  #2937A7;   /* 진한 블루 — 호버 / 테이블 헤더 */
--primary-mid:   #2A38B0;   /* 그라디언트 대신 사용 */
--primary-light: #E1E9F7;   /* 라이트블루 틴트 — 배지·콜아웃·아이콘 배경 */
--accent:        #0EA5E9;   /* 포인트 — sparingly 사용 */
--dark:          #1B2456;   /* 다크 슬라이드 배경 — navy (거의-검정 #0F172A 폐기) */
--ink:           #222A35;   /* 본문 near-black slate */
```

### 색상 사용 규칙 (검정·navy 남용 금지)
- **슬라이드 제목 `h2`는 `c-primary`** (밝은 브랜드 블루 #3242C6). `c-dark`(검정 슬레이트) 쓰지 말 것 — 제목이 밋밋한 검정으로 보임.
- **본문**은 `c-dark`(=`--ink` 슬레이트) 또는 `c-muted`(--g6).
- **다크 슬라이드**는 `style="background:var(--dark)"`(navy) + 흰색 텍스트(`c-white`). `#0F172A` 같은 거의-검정 배경 금지.
- 아이브로우(eyebrow)·강조 숫자·아이콘도 `--primary`(브랜드 블루).

### 로고 사용 규칙

| 배경 | 로고 파일 | 높이 |
|------|-----------|------|
| 다크 (navy/dark) 슬라이드 | `assets/safeai_h_white.png` | `height:24px` |
| 라이트 (white/gray) 슬라이드 | `assets/safeai_v_blue.png` | `height:26px` |

로고는 반드시 `.logo-wrap` (우측 상단 고정) 또는 헤더 내 inline으로만 배치.
텍스트로 "LOGO" / "SafeAI" 대체 **절대 금지**.

---

## 3. 레이아웃 안전 여백

슬라이드 크기: **1280 × 720px** (16:9 고정)

```
┌──────────────────────────────────────────────────────────┐  y=0
│  ██ .logo-wrap  top:26px, height≈26px → 하단 y=52px       │
│ ─────────────── --safe-top: 76px ──────────────────────── │  y=76  ← 콘텐츠 시작
│                                                           │
│  LEFT --pad: 52px ←──────────────────────→ RIGHT --pad   │
│                                                           │
│ ─────────────── --safe-bottom: 52px ───────────────────── │  y=668 ← 콘텐츠 끝
│  .pg  bottom:22px                                        │
└──────────────────────────────────────────────────────────┘  y=720
```

**황금 규칙**: `position:absolute;inset:0` 콘텐츠 컨테이너는 **반드시**:
```html
padding: var(--safe-top) var(--pad) var(--safe-bottom)
```
`padding:var(--pad)` 단독 사용 금지 — 상단은 로고(y=26~52), 하단은 페이지 번호(y=698~720)와 겹칩니다.

**커버/일러스트 이미지**: 반드시 `object-fit:contain` 사용. `cover`는 이미지 잘림 발생.
```html
<img src="assets/cover.png" style="width:100%;height:auto;object-fit:contain;display:block;">
```

---

## 4. 타이포그래피 위계

| 용도 | 클래스 | 크기 |
|------|--------|------|
| 커버 제목 | `t56 fw8 lh11 tight` | 56px |
| 섹션 제목 | `t36 fw7 tight c-primary` | 36px |
| 슬라이드 제목 | `t28 fw7 tight c-primary` | 28px |
| 소제목 | `t20 fw6` | 20px |
| 본문 | `t16 lh16` | 16px |
| 보조 | `t14 lh16 c-muted` | 14px |
| 레이블/태그 | `t12 wide` | 12px |

**절대 지시사항**:
- 한 슬라이드에 3단계 이상 폰트 크기 혼용 금지
- `font-size` 직접 지정 금지 — 위 클래스 사용
- 줄바꿈이 어색하면 `<br>` 추가 (CSS hyphens 금지)

---

## 5. 아이콘 규칙

Feather Icons 스타일 인라인 SVG만 사용.

```html
<!-- 올바른 예 -->
<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.5"
     stroke-linecap="round" stroke-linejoin="round">
  <path d="..."/>
</svg>

<!-- 금지 -->
🚀 💡 ⚡ 🛡 (이모지)
<i class="fa fa-rocket"> (Font Awesome)
```

아이콘 배경 컨테이너:
```html
<div style="width:40px;height:40px;border-radius:10px;
            background:var(--primary-light);
            display:flex;align-items:center;justify-content:center;
            color:var(--primary);flex-shrink:0;">
  <!-- SVG here -->
</div>
```

---

## 6. 슬라이드별 사용 가이드

### 페이지 번호 없는 슬라이드
- `01` (Cover Dark) — 페이지 번호 없음
- `02` (Cover Light) — 페이지 번호 없음
- `04` (Section Divider) — 번호 있어도 무방, 없어도 무방

### 다크 배경 슬라이드 (슬라이드 01, 04, 21 헤더, 22 좌측)
- 텍스트: `c-white` 또는 `rgba(255,255,255,0.7)`
- 로고: `safeai_h_white.png`
- `.pg-light` 클래스로 페이지 번호 흰색 처리

### 콘텐츠 슬라이드 공통 구조
```html
<section class="slide" id="sNN">
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;padding:var(--pad);">
    <!-- 헤더 영역 -->
    <div style="flex-shrink:0;margin-bottom:32px;">
      <div class="eyebrow g8" style="margin-bottom:10px;"><span class="ep"></span>섹션명</div>
      <h2 class="t36 fw7 tight c-dark">슬라이드 제목</h2>
    </div>
    <!-- 콘텐츠 영역 (flex:1 = 나머지 공간 모두 사용) -->
    <div style="flex:1;min-height:0;">
      <!-- 내용 -->
    </div>
  </div>
  <div class="logo-wrap"><img src="assets/safeai_v_blue.png" style="height:26px;display:block;"></div>
  <div class="pg">NN</div>
</section>
```

---

## 7. PDF 변환 금지 규칙

Chrome 인쇄 시 깨지는 패턴:

| 금지 | 대체 |
|------|------|
| `background-clip: text` | `color: #hex` 직접 지정 |
| colored `rgba` box-shadow | `rgba(0,0,0,.1)` 단색 그림자 또는 border |
| `filter: blur()` | 제거 |
| `mask-image` | `opacity` 조절 |
| `backdrop-filter: blur()` | solid background-color |
| `::before` content 장식 | 실제 `<span>` 태그 사용 |

---

## 8. AI 에이전트 체크리스트

슬라이드를 추가하거나 수정한 후 반드시 확인:

- [ ] 이모지가 있는가? → SVG 아이콘으로 교체
- [ ] 로고가 텍스트인가? → img 태그로 교체
- [ ] `--safe-bottom` 없이 `bottom:0` 컨테이너를 썼는가? → padding-bottom 52px 이상 확보
- [ ] 빈 `img-ph` 자리표시자가 있는가? → 실제 이미지 또는 슬라이드 삭제
- [ ] 슬라이드 여백이 절반 이상인가? → 레이아웃 재설계
- [ ] 한 슬라이드에 4개 이상 bullet이 있는가? → 2–3개로 압축
- [ ] 임의 hex 색상을 썼는가? → CSS 변수로 교체
- [ ] PDF 금지 CSS를 썼는가? → 위 표 참고하여 수정
- [ ] 페이지 번호가 커버(01, 02)에 있는가? → 제거
