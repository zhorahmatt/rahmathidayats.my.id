// Contact dock. Three states on [data-contact]:
//   closed -> nothing but the avatar
//   peek   -> hovering shows the row of links
//   open   -> clicking grows the full card
const LEAVE_DELAY_MS = 140;

export function initContact() {
  const root = document.querySelector("[data-contact]");
  if (!root) return;

  const avatar = root.querySelector("[data-contact-avatar]");
  const toggle = root.querySelector("[data-contact-toggle]");
  const bar = root.querySelector("[data-contact-bar]");
  if (!avatar || !toggle || !bar) return;

  let leaveTimer = 0;
  const state = () => root.dataset.state;

  const setState = (next) => {
    if (state() === next) return;
    root.dataset.state = next;
    const open = next === "open";
    avatar.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close contact card" : "Open contact card");
  };

  // The peek strip is exactly as wide as the row of links.
  const measure = () => {
    const last = bar.lastElementChild;
    if (!last) return;
    const width = last.offsetLeft + last.offsetWidth + 4;
    if (width > 0) root.style.setProperty("--peek", `${width}px`);
  };
  measure();
  window.addEventListener("resize", measure);

  root.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "touch") return;
    clearTimeout(leaveTimer);
    if (state() === "closed") setState("peek");
  });

  root.addEventListener("pointerleave", () => {
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(() => {
      if (state() === "peek" && !root.contains(document.activeElement)) setState("closed");
    }, LEAVE_DELAY_MS);
  });

  avatar.addEventListener("click", () => {
    setState(state() === "open" ? "closed" : "open");
  });

  toggle.addEventListener("click", () => {
    setState(state() === "open" ? "peek" : "open");
  });

  // Keyboard: tabbing onto the avatar reveals the links so they can be reached.
  root.addEventListener("focusin", () => {
    clearTimeout(leaveTimer);
    if (state() === "closed") setState("peek");
  });

  root.addEventListener("focusout", (event) => {
    if (root.contains(event.relatedTarget)) return;
    if (state() === "peek" && !root.matches(":hover")) setState("closed");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || state() === "closed") return;
    const hadFocus = root.contains(document.activeElement);
    setState("closed");
    if (hadFocus) avatar.blur();
  });

  document.addEventListener("pointerdown", (event) => {
    if (state() === "open" && !root.contains(event.target)) setState("closed");
  });
}
