// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const DECK = 'file://' + path.resolve(__dirname, '..', 'deck.html');

// 외부 폰트 CDN은 무시(오프라인 안정성) — 레이아웃은 폴백 폰트로 계속 동작
test.beforeEach(async ({ page }) => {
  await page.route(/cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com/, (r) => r.abort());
  await page.goto(DECK);
  await page.waitForFunction(() => !!window.__deckEditor && !!window.__deckEditor.activeSlide());
});

test('편집 모드 토글 + 편집기 UI 주입', async ({ page }) => {
  const editBtn = page.locator('.de-editbtn');
  await expect(editBtn).toBeVisible();
  await expect(page.locator('#de-style')).toHaveCount(1);
  await page.evaluate(() => window.__deckEditor.setMode(true));
  await expect(editBtn).toHaveClass(/on/);
  expect(await page.evaluate(() => window.__deckEditor.S.on)).toBe(true);
});

test('텍스트 인라인 편집 — 한글 입력·커밋', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const E = window.__deckEditor;
    E.setMode(true);
    const slide = E.activeSlide();
    const unit = E.bakeUnits(slide).find((u) => u.tagName !== 'IMG' && u.tagName !== 'SVG');
    E.startEdit(unit);
    unit.textContent = '';           // 선택영역 대체 시뮬레이션
    unit.textContent = '안녕하세요 세이프에이아이';
    E.commitText(unit);
    return { text: unit.textContent, editable: unit.getAttribute('contenteditable') };
  });
  expect(result.text).toBe('안녕하세요 세이프에이아이');
  expect(result.editable).toBeNull();  // 커밋 후 contenteditable 제거
});

test('이동 → 슬라이드 lazy bake(absolute) + 위치 변경', async ({ page }) => {
  const res = await page.evaluate(() => {
    const E = window.__deckEditor;
    E.setMode(true);
    const slide = E.activeSlide();
    const bakedBefore = slide.dataset.deBaked !== undefined;
    const unit = E.bakeUnits(slide)[0];
    E.bakeSlide(slide);              // 이동이 트리거하는 것과 동일
    const before = parseFloat(unit.style.left) || 0;
    unit.style.left = (before + 40) + 'px';
    return {
      bakedBefore,
      bakedAfter: slide.dataset.deBaked !== undefined,
      unitAbsolute: getComputedStyle(unit).position === 'absolute',
      moved: (parseFloat(unit.style.left) - before) === 40,
    };
  });
  expect(res.bakedBefore).toBe(false);
  expect(res.bakedAfter).toBe(true);
  expect(res.unitAbsolute).toBe(true);
  expect(res.moved).toBe(true);
});

test('실제 마우스 드래그로 요소 이동', async ({ page }) => {
  // 텍스트 유닛이 명확한 콘텐츠 슬라이드(s05)로 이동
  await page.evaluate(() => {
    const st = document.querySelector('deck-stage');
    const s5 = document.getElementById('s05');
    document.querySelectorAll('deck-stage > section').forEach((s) => s.removeAttribute('data-deck-active'));
    s5.setAttribute('data-deck-active', '');
    window.__deckEditor.setMode(true);
  });
  const target = await page.evaluate(() => {
    const E = window.__deckEditor;
    // 텍스트 직접 포함 유닛 하나의 중심점
    const u = E.collectUnits(E.activeSlide()).find((x) => x.textContent.trim() && x.tagName !== 'IMG');
    const r = u.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });
  await page.mouse.move(target.x, target.y);
  await page.mouse.down();
  await page.mouse.move(target.x + 60, target.y + 30, { steps: 10 });
  await page.mouse.up();
  const res = await page.evaluate(() => {
    const s = window.__deckEditor.S.sel;
    return {
      selected: !!s,
      absolute: s ? getComputedStyle(s).position === 'absolute' : false,
      baked: window.__deckEditor.activeSlide().dataset.deBaked !== undefined,
      left: s ? (parseFloat(s.style.left) || 0) : null,
    };
  });
  expect(res.selected).toBe(true);
  expect(res.absolute).toBe(true);
  expect(res.baked).toBe(true);
  expect(res.left).not.toBe(0);
});

test('베이크 round-trip — 전 슬라이드 리프 위치 ±2px 유지', async ({ page }) => {
  const report = await page.evaluate(() => {
    const E = window.__deckEditor;
    const sections = Array.from(document.querySelectorAll('deck-stage > section'));
    const bad = [];
    let checked = 0;
    for (const slide of sections) {
      if (getComputedStyle(slide).display === 'none') continue;
      if (slide.dataset.deBaked !== undefined) continue;
      const units = E.bakeUnits(slide);
      const before = units.map((u) => u.getBoundingClientRect());
      E.bakeSlide(slide);
      const after = units.map((u) => u.getBoundingClientRect());
      for (let i = 0; i < units.length; i++) {
        checked++;
        const dx = Math.abs(before[i].left - after[i].left);
        const dy = Math.abs(before[i].top - after[i].top);
        if (dx > 2 || dy > 2) bad.push({ slide: slide.id || slide.dataset.label, dx: +dx.toFixed(1), dy: +dy.toFixed(1) });
      }
    }
    return { checked, bad };
  });
  console.log('  베이크 검증: ' + report.checked + '개 리프 검사, 이탈 ' + report.bad.length + '개');
  if (report.bad.length) console.log('  ' + JSON.stringify(report.bad.slice(0, 8)));
  expect(report.bad.length).toBe(0);
});

test('Undo / Redo — 위치 복원', async ({ page }) => {
  const res = await page.evaluate(() => {
    const E = window.__deckEditor;
    E.setMode(true);
    const slide = E.activeSlide();
    const unit = E.bakeUnits(slide)[0];
    E.select(unit);
    E.bakeSlide(slide);
    const orig = unit.style.left;
    // 커밋 형태의 변경: pushUndo 후 이동
    E.S.undo.push({ id: slide.id || slide.getAttribute('data-deck-slide') || '', html: slide.innerHTML });
    unit.style.left = '999px';
    E.undo();
    const afterUndo = E.bakeUnits(E.activeSlide())[0].style.left;
    return { orig, afterUndo };
  });
  expect(res.afterUndo).toBe(res.orig);
});

test('색·글자크기 툴바 — 토큰 색 적용, 타입스케일 스텝', async ({ page }) => {
  const res = await page.evaluate(() => {
    const E = window.__deckEditor;
    E.setMode(true);
    const unit = E.bakeUnits(E.activeSlide()).find((u) => u.tagName !== 'IMG' && u.tagName !== 'SVG');
    E.select(unit);
    E.applyTextColor('#3242C6');
    const color = unit.style.color;
    E.stepFont(1);
    const fs = parseFloat(unit.style.fontSize);
    const onScale = [12,14,15,16,18,20,24,28,36,44,56].includes(fs);
    return { color, onScale, fs };
  });
  // rgb(50, 66, 198) == #3242C6
  expect(res.color.replace(/\s/g, '')).toBe('rgb(50,66,198)');
  expect(res.onScale).toBe(true);
});

test('직렬화 — 편집기 잔재 제거, doctype 유지, 편집 반영', async ({ page }) => {
  const html = await page.evaluate(() => {
    const E = window.__deckEditor;
    E.setMode(true);
    const slide = E.activeSlide();
    const unit = E.bakeUnits(slide).find((u) => u.tagName !== 'IMG' && u.tagName !== 'SVG');
    unit.textContent = 'SERIALIZE_MARKER_텍스트';
    E.bakeSlide(slide);
    return E.serializeDeck();
  });
  expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
  expect(html).toContain('SERIALIZE_MARKER_텍스트');
  expect(html).toContain('deck-editor.js');       // 스크립트 태그는 남김
  expect(html).not.toContain('de-overlay');        // 오버레이 제거
  expect(html).not.toContain('de-toolbar');        // 툴바 제거
  expect(html).not.toContain('data-de-baked');     // 전이 속성 제거
  expect(html).not.toContain('contenteditable');   // 편집 속성 제거
  expect(html).not.toContain('id="de-style"');     // 주입 스타일 제거
});

test('회전 — 회전 핸들 드래그 시 transform:rotate 적용', async ({ page }) => {
  await page.evaluate(() => {
    document.querySelectorAll('deck-stage > section').forEach((s) => s.removeAttribute('data-deck-active'));
    document.getElementById('s05').setAttribute('data-deck-active', '');
    const E = window.__deckEditor;
    E.setMode(true);
    const u = E.collectUnits(E.activeSlide()).find((x) => x.textContent.trim() && x.tagName !== 'IMG');
    E.bakeSlide(E.activeSlide());
    E.select(u);
    E.positionOverlay();
    u.setAttribute('data-de-rt', '1');
  });
  const rot = page.locator('.de-rot');
  const rb = await rot.boundingBox();
  await page.mouse.move(rb.x + rb.width / 2, rb.y + rb.height / 2);
  await page.mouse.down();
  await page.mouse.move(rb.x + 80, rb.y + 40, { steps: 8 });
  await page.mouse.up();
  const t = await page.evaluate(() => document.querySelector('[data-de-rt]').style.transform);
  expect(t).toMatch(/rotate\(-?\d/);
});

test('이미지 삽입 — object-fit:contain img 로 교체', async ({ page }) => {
  const ok = await page.evaluate(() => {
    const E = window.__deckEditor;
    E.setMode(true);
    const u = E.collectUnits(E.activeSlide()).find((x) => x.textContent.trim());
    const px = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    E.insertImage(u, px);
    const img = u.querySelector('img');
    return !!img && img.getAttribute('src') === px && /contain/.test(img.style.objectFit);
  });
  expect(ok).toBe(true);
});

test('텍스트 추가 / 삭제', async ({ page }) => {
  const res = await page.evaluate(() => {
    const E = window.__deckEditor;
    E.setMode(true);
    const slide = E.activeSlide();
    const n0 = slide.querySelectorAll('[data-de-baked]').length;
    E.addText();
    const added = E.S.sel;
    const hasNew = slide.contains(added) && added.textContent.includes('새 텍스트');
    E.deleteSel();
    const removed = !slide.contains(added);
    return { hasNew, removed };
  });
  expect(res.hasNew).toBe(true);
  expect(res.removed).toBe(true);
});

const fs = require('fs');
test('저장 왕복 — 직렬화 결과를 새 파일로 로드 시 편집 반영·편집기 잔재 없음', async ({ page }) => {
  const html = await page.evaluate(() => {
    const E = window.__deckEditor;
    E.setMode(true);
    const slide = E.activeSlide();
    const u = E.collectUnits(slide).find((x) => x.textContent.trim() && x.tagName !== 'IMG');
    E.select(u); E.bakeSlide(slide);
    u.textContent = 'ROUNDTRIP_확인_텍스트';
    u.style.left = '333px';
    u.setAttribute('data-rt', '1');
    return E.serializeDeck();
  });
  const tmp = path.resolve(__dirname, '..', 'deck.__roundtrip.html');
  fs.writeFileSync(tmp, html);
  try {
    const p2 = await page.context().newPage();
    await p2.route(/cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com/, (r) => r.abort());
    await p2.goto('file://' + tmp);
    await p2.waitForFunction(() => !!window.__deckEditor);
    const res = await p2.evaluate(() => {
      const marker = document.querySelector('[data-rt]');
      return {
        persisted: !!marker && marker.textContent.includes('ROUNDTRIP_확인_텍스트'),
        left: marker ? marker.style.left : null,
        noBakedAttr: document.querySelectorAll('[data-de-baked]').length,
        editorReinit: !!window.__deckEditor.setMode, // 스크립트 유지 → 재초기화
      };
    });
    expect(res.persisted).toBe(true);
    expect(res.left).toBe('333px');
    expect(res.noBakedAttr).toBe(0);      // 저장물엔 전이 속성 없음
    expect(res.editorReinit).toBe(true);  // deck-editor.js 재로드됨
    await p2.close();
  } finally {
    fs.unlinkSync(tmp);
  }
});
