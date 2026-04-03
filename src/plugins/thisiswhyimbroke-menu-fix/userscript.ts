// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY
// ─────────────────────────────────────────────────────────────────────────────
// The nav dropdowns use position:absolute, so overflow-y:auto on the dropdown
// itself does nothing — the browser renders it outside the normal flow and the
// page body scrolls instead. The real fix is:
//
//   1. Find each open dropdown panel when the user hovers a nav item.
//   2. Measure whether it overflows the viewport bottom.
//   3. If it does, clamp its height and make it scrollable in-place.
//   4. Prevent wheel/touch events from bubbling out of the panel so the
//      page body does NOT scroll while the user scrolls the menu.
// ─────────────────────────────────────────────────────────────────────────────

// ── Constants ──────────────────────────────────────────────────────────────

const VIEWPORT_PADDING_PX = 8;
const MIN_PANEL_HEIGHT_PX = 80;
const POLL_INTERVAL_MS = 200;
const HOVER_DELAY_MS = [50, 150] as const;

const PANEL_SELECTORS = [
  "nav li ul",
  "nav li ol",
  "nav li div",
  "header li ul",
  "header li div",
  "[class*='dropdown']",
  "[class*='drop-down']",
  "[class*='submenu']",
  "[class*='sub-menu']",
  "[class*='nav-menu']",
  "[class*='mega-menu']",
].join(", ");

const DATA_FIXED = "tiwibFixed";
const DATA_GUARDED = "tiwibGuarded";

// ── Helpers ────────────────────────────────────────────────────────────────

const isVisible = (el: HTMLElement): boolean =>
  el.offsetParent !== null || el.getBoundingClientRect().height > 0;

const isAbsolutelyPositioned = (el: HTMLElement): boolean => {
  const { position } = globalThis.getComputedStyle(el);
  return position === "absolute" || position === "fixed";
};

// ── Clamp / reset ──────────────────────────────────────────────────────────

const clampDropdown = (panel: HTMLElement): void => {
  const { bottom, top } = panel.getBoundingClientRect();
  if (bottom > window.innerHeight - VIEWPORT_PADDING_PX) {
    const maxH = Math.max(window.innerHeight - top - VIEWPORT_PADDING_PX, MIN_PANEL_HEIGHT_PX);
    panel.style.maxHeight = `${maxH}px`;
    panel.style.overflowY = "auto";
    panel.style.overflowX = "hidden";
    panel.dataset[DATA_FIXED] = "1";
  }
};

const resetDropdown = (panel: HTMLElement): void => {
  if (panel.dataset[DATA_FIXED]) {
    panel.style.maxHeight = "";
    panel.style.overflowY = "";
    panel.style.overflowX = "";
    delete panel.dataset[DATA_FIXED];
  }
};

// ── Scroll isolation ───────────────────────────────────────────────────────
// Stops scroll events from reaching the body while the user is inside
// a clamped panel that still has room to scroll in that direction.

const onWheel = (e: WheelEvent): void => {
  const panel = e.currentTarget as HTMLElement;
  const atTop = panel.scrollTop === 0 && e.deltaY < 0;
  const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1 && e.deltaY > 0;
  if (!atTop && !atBottom) e.stopPropagation();
};

let touchStartY = 0;

const onTouchStart = (e: TouchEvent): void => {
  touchStartY = e.touches[0].clientY;
};

const onTouchMove = (e: TouchEvent): void => {
  const panel = e.currentTarget as HTMLElement;
  const dy = touchStartY - e.touches[0].clientY;
  const atTop = panel.scrollTop === 0 && dy < 0;
  const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1 && dy > 0;
  if (!atTop && !atBottom) e.stopPropagation();
};

const attachScrollGuards = (panel: HTMLElement): void => {
  if (panel.dataset[DATA_GUARDED]) return;
  panel.addEventListener("wheel", onWheel as EventListener, { passive: true });
  panel.addEventListener("touchstart", onTouchStart as EventListener, { passive: true });
  panel.addEventListener("touchmove", onTouchMove as EventListener, { passive: true });
  panel.dataset[DATA_GUARDED] = "1";
};

// ── Discovery ──────────────────────────────────────────────────────────────

const findVisiblePanels = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>(PANEL_SELECTORS))
    .filter(isVisible)
    .filter(isAbsolutelyPositioned);

// ── Main tick ──────────────────────────────────────────────────────────────

const seen = new WeakSet<HTMLElement>();

const tick = (): void => {
  for (const panel of findVisiblePanels()) {
    if (!seen.has(panel)) {
      seen.add(panel);
      attachScrollGuards(panel);
    }
    clampDropdown(panel);
  }

  // Reset panels that were clamped but are no longer visible (menu closed)
  for (const panel of document.querySelectorAll<HTMLElement>("[data-tiwib-fixed]")) {
    if (!isVisible(panel)) resetDropdown(panel);
  }
};

// Background poll to catch anything missed by the hover listener
setInterval(tick, POLL_INTERVAL_MS);

// Immediate reaction when the user moves into the nav area; the small delays
// give Angular time to reveal the panel before we measure it.
document.addEventListener(
  "mouseover",
  (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest("nav, header")) {
      for (const delay of HOVER_DELAY_MS) setTimeout(tick, delay);
    }
  },
  { passive: true },
);

// ── Slim scrollbar styling ─────────────────────────────────────────────────

GM_addStyle(`
    [data-tiwib-fixed]::-webkit-scrollbar { width: 4px; }
    [data-tiwib-fixed]::-webkit-scrollbar-track { background: transparent; }
    [data-tiwib-fixed]::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.3); border-radius: 2px; }
  `);
