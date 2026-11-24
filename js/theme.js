// Light / dark switch. The inline script in <head> has already set
// <html data-theme>; this wires the button, remembers the choice and follows
// the system setting until the visitor picks a theme by hand.
const STORAGE_KEY = "theme";
const THEME_COLORS = { light: "#ffffff", dark: "#0b0b0b" };
const SWITCH_CLASS = "theme-switching";
const SWITCH_MS = 300;

function readSaved() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function save(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage: the choice just lasts for this visit.
  }
}

export function initTheme() {
  const root = document.documentElement;
  const button = document.querySelector("[data-theme-toggle]");
  const meta = document.querySelector('meta[name="theme-color"]');
  const system = matchMedia("(prefers-color-scheme: dark)");
  let timer = 0;

  const apply = (theme) => {
    root.dataset.theme = theme;
    if (meta) meta.content = THEME_COLORS[theme];
    if (button) {
      const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
      button.setAttribute("aria-label", label);
      button.title = label;
    }
  };

  apply(root.dataset.theme === "dark" ? "dark" : "light");

  button?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.classList.add(SWITCH_CLASS);
    clearTimeout(timer);
    timer = setTimeout(() => root.classList.remove(SWITCH_CLASS), SWITCH_MS);
    save(next);
    apply(next);
  });

  system.addEventListener("change", (event) => {
    if (readSaved() === null) apply(event.matches ? "dark" : "light");
  });
}
