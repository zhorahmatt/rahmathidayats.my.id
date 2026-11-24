// "What I believe": one statement shown at a time, arrows wrap around.
function initQuoteSet(root) {
  const slides = [...root.querySelectorAll("[data-slide]")];
  const count = root.querySelector("[data-count]");
  const prev = root.querySelector("[data-prev]");
  const next = root.querySelector("[data-next]");
  if (slides.length === 0) return;

  let index = Math.max(0, slides.findIndex((slide) => slide.hasAttribute("data-active")));

  const show = (target) => {
    index = (target + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.toggleAttribute("data-active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });
    if (count) count.textContent = `${index + 1} / ${slides.length}`;
  };

  prev?.addEventListener("click", () => show(index - 1));
  next?.addEventListener("click", () => show(index + 1));
  show(index);
}

export function initQuotes() {
  document.querySelectorAll("[data-quotes]").forEach(initQuoteSet);
}
