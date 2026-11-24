// Clicking "email" copies the address. If the clipboard is unavailable the
// link keeps its normal mailto behaviour.
const RESET_MS = 1600;

function initOne(root) {
  const address = root.dataset.emailCopy;
  const trigger = root.querySelector("[data-email-trigger]");
  const status = root.querySelector("[data-email-status]");
  if (!address || !trigger || !navigator.clipboard) return;

  let timer = 0;

  trigger.addEventListener("click", async (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      window.location.href = trigger.href;
      return;
    }
    root.classList.add("is-copied");
    if (status) status.textContent = "Email address copied";
    clearTimeout(timer);
    timer = setTimeout(() => {
      root.classList.remove("is-copied");
      if (status) status.textContent = "";
    }, RESET_MS);
  });
}

export function initEmailCopy() {
  document.querySelectorAll("[data-email-copy]").forEach(initOne);
}
