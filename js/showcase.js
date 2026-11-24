// "Selected work": one project shown at a time. The arrows, the thumbnail
// strip, the arrow keys and a sideways swipe all change which one.
const SWIPE_MIN_PX = 40;

function initOne(root) {
  const stage = root.querySelector("[data-stage]");
  const slides = [...root.querySelectorAll("[data-slide]")];
  const thumbs = [...root.querySelectorAll("[data-thumb]")];
  const count = root.querySelector("[data-count]");
  if (!stage || slides.length === 0) return;

  let index = Math.max(0, slides.findIndex((slide) => slide.hasAttribute("data-active")));

  const show = (target) => {
    index = (target + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.toggleAttribute("data-active", active);
      slide.toggleAttribute("inert", !active);
    });
    thumbs.forEach((thumb, i) => thumb.setAttribute("aria-current", String(i === index)));
    if (count) count.textContent = `${index + 1} / ${slides.length}`;
  };

  root.querySelector("[data-prev]")?.addEventListener("click", () => show(index - 1));
  root.querySelector("[data-next]")?.addEventListener("click", () => show(index + 1));
  thumbs.forEach((thumb, i) => thumb.addEventListener("click", () => show(i)));

  // Left / right arrow keys while focus is anywhere in the section.
  root.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    show(index + (event.key === "ArrowRight" ? 1 : -1));
    if (thumbs.includes(document.activeElement)) thumbs[index]?.focus();
  });

  // Swipe on touch screens. Mostly-vertical drags are left to page scrolling.
  let startX = 0;
  let startY = 0;
  stage.addEventListener(
    "touchstart",
    (event) => {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    },
    { passive: true },
  );
  stage.addEventListener(
    "touchend",
    (event) => {
      const dx = event.changedTouches[0].clientX - startX;
      const dy = event.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      show(index + (dx < 0 ? 1 : -1));
    },
    { passive: true },
  );

  show(index);
}

export function initShowcase() {
  document.querySelectorAll("[data-showcase]").forEach(initOne);
}
