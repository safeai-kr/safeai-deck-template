# SafeAI Deck — 직접 편집 모드 (deck-editor.js) 설계

- 작성일: 2026-07-16
- 상태: 설계 확정, 구현 계획 대기

## 1. 배경 & 목적

현재 덱은 `deck.html`(슬라이드) + `deck-stage.js`(웹컴포넌트 런타임) 무빌드 구조다.
강점은 **"텍스트·목차만 잘 넣으면 AI가 그럴싸하게 배치"** 해주는 것. 약점은 **문구
하나·요소 위치 같은 짜잘한 수정마다 AI에 텍스트 명령을 내려야 하는 것** — 토큰을 태우기
아까운 미세 수정이 마찰 지점이다.

**핵심 원칙: 큰 것(생성·스타일링)은 AI가, 짜잘한 것(문구·위치·크기·색)은 사람이 손으로,
토큰 0으로.**

이 설계는 그 "직접 편집"을 기존 덱 위에 **최소 침습(bolt-on)** 으로 얹는다.

## 2. 확정된 스코프 결정

| 항목 | 결정 |
|------|------|
| 통합 방식 | **Bolt-on** — `deck.html`/`deck-stage.js` 유지, 편집 모드만 얹음. 저장은 deck.html 재작성 |
| 소스 오브 트루스 | **deck.html (light-DOM sections)**. 별도 JSON 모델 없음 |
| flow vs freeform | **슬라이드별 lazy bake** — 첫 이동/크기/회전 시 그 슬라이드만 absolute로 고정 |
| 저장 | **File System Access API 직접 쓰기**, 미지원 브라우저는 다운로드 폴백 |
| v1 기능 | 텍스트 인라인 수정 · 이동 · 크기 · 색 · 글자크기 · 추가/삭제 · **Undo/Redo · 이미지 교체 · 회전 + 스냅/정렬 가이드** |
| export | **범위 밖** — 기존 decks-hub PPTX 익스포터 + deck-stage PDF 인쇄에 위임. 편집기는 깨끗한 absolute DOM만 생산 |
| 편집기 형태 | **단일 바닐라 스크립트 `deck-editor.js`** (무빌드, deck-stage.js 불변) |

### 명시적 비목표 (v1 제외)
- PPTX/PDF export 자체 구현 (기존 것에 위임)
- JSON 씬그래프 모델 / AI↔사람 왕복 병합 (후속 단계)
- 다중 선택, 레이어 패널, 그룹핑
- 애니메이션/전환 효과

## 3. 아키텍처 & 통합

### 3.1 파일 구성 (deck-stage.js 불변)
```
deck.html          ← <script src="deck-editor.js"> 한 줄 추가 (deck-stage.js 뒤)
deck-stage.js      ← 손대지 않음 (CLAUDE.md: 수정 금지)
deck-editor.js     ← 신규. 편집기 전부. 자체 CSS는 JS가 <style> 주입
```

### 3.2 슬라이드에 붙는 방식
- deck-stage가 슬라이드를 **light DOM `<slot>`** 으로 투영하고 활성 슬라이드에
  `data-deck-active`를 붙인다(확인됨: deck-stage.js line 158-171). 편집기는
  `section[data-deck-active]`를 현재 편집 대상으로 스코프한다.
- deck-stage의 슬라이드 변경 이벤트(`detail.index`)를 구독 → 슬라이드 전환 시 자동
  선택 해제 & 새 활성 슬라이드로 재스코프.
- 편집기 UI(툴바·핸들·가이드)에는 **`export-hidden` + `no-print`** 부여 → 기존 PPTX
  익스포터(`.export-hidden` 숨김)와 PDF 인쇄가 무시.

### 3.3 좌표계
- deck-stage가 캔버스를 `transform:scale()`로 축소(shadow DOM 내부). 편집기 포인터 계산은
  **scale로 나눠 authored px로 환산**. `scale = activeSlide.getBoundingClientRect().width / 1280`.

### 3.4 편집 모드 생명주기
- 토글: 떠 있는 "편집" 버튼(export-hidden·no-print) + 단축키 **`E`** (텍스트 입력 중 무시).
- 키 충돌: deck-stage는 이미 contenteditable/INPUT 포커스 중 화살표·숫자 네비를 무시
  (deck-stage.js line 1321). 그 위에 편집기가 **캡처 단계** keydown 리스너로:
  - 요소 선택됨 → 화살표 = 미세이동, 이벤트 stop (슬라이드 안 넘어감)
  - 빈 선택 → 화살표 = deck-stage로 통과 (슬라이드 이동)
- 편집 중에도 레일로 슬라이드 전환 가능 → 전환되면 자동 재스코프.

## 4. 선택 · 조작 모델

### 4.1 선택 & 핸들 (단일 선택)
- 클릭 → 선택(아웃라인). 핸들: 크기 6개(모서리/변) + 회전 핸들 1개.
- **핸들·선택박스·가이드는 슬라이드 DOM 밖 오버레이 레이어**에 렌더 → 선택 요소의 변환된
  rect를 미러링. 슬라이드 콘텐츠 DOM에는 편집기 잔재가 절대 안 섞임 (직렬화·undo 안전).
- 이동: 몸통 드래그 → left/top (÷scale).
- 크기: 텍스트는 폭 변경 시 자동 줄바꿈(높이 auto), 박스는 양방향.
- 회전: `transform:rotate(deg)`.
- 미세이동: 화살표 1px, Shift+화살표 10px.
- 삭제: Delete/Backspace (텍스트 편집 중 아닐 때).

### 4.2 회전된 상태의 크기조절 (격리된 복잡 유닛)
- 회전 박스를 로컬 축으로 리사이즈: 포인터 델타를 `-각도`로 역회전 → 로컬 축 투영 →
  반대편 모서리 고정되도록 중심 재계산 ("rotated box resize" 표준 수학).
- **별도 순수 함수로 격리 + 단위 테스트로 못 박음.**

### 4.3 스냅 / 정렬 가이드
- 드래그 중 선택 요소의 모서리·중앙을 (a) 다른 요소, (b) 슬라이드 중앙/안전여백과 비교.
- 임계값 6px(스테이지 좌표) 안이면 스냅 + 가이드선 표시.

## 5. flow → absolute 베이크

- 텍스트 수정만으로는 베이크하지 않음 (요소는 flow 유지, 인플레이스 편집).
- 슬라이드에서 **첫 이동/크기/회전** 시:
  1. 그 슬라이드의 "콘텐츠 리프" 요소들의 현재 렌더 위치 측정
     (요소 rect − 슬라이드 rect, ÷scale = authored px).
  2. **한 번에 전부** `position:absolute; left/top/width(/height)`로 고정 → 아무것도 안 튐.
  3. 슬라이드에 `data-baked` 표시 (전이 마커, 저장 시 제거). 이후 그 슬라이드는 완전 freeform.
- **콘텐츠 리프 판정**: 직접 텍스트를 갖거나 `img`이거나 카드형(배경/보더)인 요소. 순수
  레이아웃 래퍼 제외.
- ⚠️ **베이크 정확도가 최대 리스크** → 24종 템플릿 전부에 대해 테스트로 검증. 어긋나면
  (a) Undo 즉시 복구, (b) 후속으로 템플릿에 `data-edit` 마커를 달아 판정 가이드하는 확장.

## 6. 텍스트 편집

- 더블클릭 → `contenteditable=true`, 포커스. 블러/Esc → 커밋. 한글 IME 그대로 동작.
- **붙여넣기는 평문만** (서식 제거) → 리치 HTML 유입 차단(PDF 안전). 요소 클래스/스타일
  보존, 텍스트만 교체.

## 7. 색 & PDF 안전 (하드 가드레일)

- 툴바 스와치는 **디자인 토큰만**:
  - 글자: `--primary`, `--ink`, `--g6`, `--primary-dark`, `--accent`, white
  - 배경: 투명, `--primary-light`, `--g2`, `--dark`, `--primary`, `--accent`
  - → 임의 hex 불가, CLAUDE.md 색 규칙 자동 준수.
- **불변식: 편집기는 PDF-unsafe CSS를 절대 생성하지 않는다.** gradient·filter·
  `background-clip:text`·컬러 box-shadow 금지. 직렬화는 position/size/transform/color/
  background-color(토큰)만 방출.
- **글자크기는 타입스케일 계단으로**: 12·14·15·16·18·20·28·36·56. A−/A＋가 다음 단계로
  스냅 → "raw font-size 금지" 정신 유지.

## 8. Undo / Redo (스냅샷 방식)

- 각 커밋(이동/크기/회전 종료, 텍스트 커밋, 색, 추가/삭제, 베이크, 이미지)마다 **해당
  슬라이드의 innerHTML 스냅샷**을 undo 스택에 push.
- Undo = 그 슬라이드 innerHTML 복원 → 선택/핸들 재부착. Redo = 반대.
- 핸들·툴바가 오버레이 레이어(슬라이드 밖)에 있으므로 스냅샷에 편집기 잔재 없음.
- 스택 상한 50. Cmd/Ctrl+Z · Shift+Z.

## 9. 이미지 교체 / 업로드

- 요소 선택 → 툴바 "이미지" → 파일 선택.
- 저장 경로:
  - **FSA 디렉터리 핸들 있으면 `assets/`에 복사** 후 `assets/파일명` 참조 (deck.html 경량).
  - 없으면 data-URI 임베드 (+ 용량 경고).
- 삽입은 `<img style="...object-fit:contain">` (규칙상 cover 금지 — 좌우 잘림 방지).
- v1: 이미지 요소 교체 + 새 이미지 추가.

## 10. 저장 / 직렬화

- 소스 = deck.html. 저장 시:
  1. `document` 클론 → **편집기 주입물 제거**(오버레이 레이어, 주입 `<style>`, 전이 속성
     `data-baked`/선택 마커/`contenteditable`).
  2. `documentElement.outerHTML` 직렬화 → FSA로 deck.html에 씀.
  3. **`<script src="deck-editor.js">` 태그는 남김** (다음에 열어도 편집 유지).
- 결과: 베이크된 absolute 스타일·수정 텍스트·이미지만 반영된 깨끗한 deck.html.
- **FSA 흐름**: 디렉터리 핸들 1회 승인 → deck.html 쓰기 + `assets/` 이미지 복사 둘 다 해결.
- 저장 트리거 Cmd/Ctrl+S. 미저장 이탈 시 `beforeunload` 경고.
- 폴백(FSA 미지원): 저장 = deck.html 다운로드 + 이미지 data-URI 강제 + 안내 배너.
- (얇게) 새로고침 사고 대비 localStorage 임시 초안.

## 11. 테스트 전략

- 레포 무빌드/무테스트 → **dev 전용 Vitest + jsdom** 도입(배포 산출물 불변,
  devDependencies만). 무툴체인 선호 시 in-browser `test.html` 하니스가 대안.
- **단위 테스트(순수 로직, TDD 우선)**: 좌표 변환(client→stage, scale), 회전 리사이즈
  수학, 스냅 계산, 타입스케일 스텝, 콘텐츠 리프 판정, 직렬화/strip.
- **베이크 검증(최고가치)**: 24종 템플릿 각각 로드 → 베이크 → 모든 리프의 베이크 전/후
  rect가 ±1px 일치 assert.
- **통합 체크리스트(수동)**: 한글 텍스트 편집 · 이동/크기/회전/스냅 · undo/redo · 이미지
  교체 · 저장 왕복(저장→새로고침→반영 유지) · PDF 인쇄(편집물 有, 편집기 UI 無) · 기존
  PPTX 익스포터가 편집기 UI 무시 확인.

## 12. 컴포넌트 분해 (구현 단위)

`deck-editor.js` 내부를 역할별 순수/부수효과 유닛으로 분리:

| 유닛 | 책임 | 의존 |
|------|------|------|
| `geometry` | client↔stage 좌표 변환, 회전 리사이즈, 스냅 계산 (순수) | 없음 |
| `bake` | 콘텐츠 리프 판정 + flow→absolute 변환 | geometry, DOM |
| `selection` | 선택 상태 + 오버레이 핸들 렌더/드래그 | geometry |
| `text` | contenteditable 진입/커밋, 평문 붙여넣기 | DOM |
| `toolbar` | 색·글자크기·이미지·추가/삭제 UI | selection |
| `history` | 슬라이드 innerHTML 스냅샷 undo/redo | DOM |
| `image` | 파일 선택 → assets/ 복사 or data-URI | fs |
| `fs` | FSA 디렉터리 핸들, deck.html 쓰기, 폴백 다운로드 | 없음 |
| `serialize` | 문서 클론 → 편집기 잔재 제거 → outerHTML | DOM |
| `mode` | 편집 모드 토글, 키 라우팅, deck-stage 이벤트 구독 | 전부 조율 |
