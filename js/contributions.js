// GitHub contribution graph, drawn from a saved snapshot of the public
// calendar (assets/data/contributions.json; refresh it with
// `npm run contributions`). The section stays hidden if the data is missing.
const WEEKS = 40; // 40 columns of 12px cells fill the 600px text column
const DAY_MS = 86_400_000;

const dateLabel = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const number = new Intl.NumberFormat("en");

const parseDay = (iso) => new Date(`${iso}T00:00:00Z`);

function countLabel(count) {
  if (count === 0) return "No contributions";
  return `${number.format(count)} contribution${count === 1 ? "" : "s"}`;
}

/** The most recent WEEKS weeks, as columns that each start on a Sunday. */
function pickDays(days) {
  const last = parseDay(days[days.length - 1].date);
  const wanted = (WEEKS - 1) * 7 + last.getUTCDay() + 1;
  return days.slice(-wanted);
}

function buildCell(day) {
  const cell = document.createElement("span");
  cell.className = "contrib__day";
  cell.dataset.level = String(day.level);
  cell.dataset.label = `${countLabel(day.count)} on ${dateLabel.format(parseDay(day.date))}`;
  return cell;
}

function buildSpacer() {
  const spacer = document.createElement("span");
  spacer.className = "contrib__day contrib__day--empty";
  return spacer;
}

/** One shared tooltip that glides from day to day. */
function wireTooltip(graph, grid, tip) {
  let visible = false;

  const show = (cell) => {
    tip.textContent = cell.dataset.label;
    const area = graph.getBoundingClientRect();
    const box = cell.getBoundingClientRect();
    const half = tip.offsetWidth / 2;
    const centre = box.left - area.left + box.width / 2;
    // Keep the pill inside the graph so it never runs off a phone screen.
    const x = Math.min(Math.max(centre, half), area.width - half);
    tip.style.translate = `${x}px ${box.top - area.top - 8}px`;
    if (!visible) {
      // First appearance: place it without animating in from the corner.
      tip.style.transitionDuration = "0s";
      void tip.offsetWidth;
      tip.style.transitionDuration = "";
      visible = true;
    }
    tip.dataset.visible = "";
  };

  const hide = () => {
    visible = false;
    delete tip.dataset.visible;
  };

  grid.addEventListener("pointerover", (event) => {
    const cell = event.target.closest(".contrib__day[data-label]");
    if (cell) show(cell);
  });
  grid.addEventListener("pointerleave", hide);
  document.addEventListener("pointerdown", (event) => {
    if (!grid.contains(event.target)) hide();
  });
}

export async function initContributions() {
  const root = document.querySelector("[data-contributions]");
  if (!root) return;

  const graph = root.querySelector("[data-contrib-graph]");
  const grid = root.querySelector("[data-contrib-grid]");
  const tip = root.querySelector("[data-contrib-tip]");
  const totalEl = root.querySelector("[data-contrib-total]");
  const rangeEl = root.querySelector("[data-contrib-range]");
  if (!graph || !grid || !tip || !totalEl || !rangeEl) return;

  let data;
  try {
    const response = await fetch(root.dataset.src);
    if (!response.ok) return;
    data = await response.json();
  } catch {
    return;
  }
  if (!Array.isArray(data.days) || data.days.length === 0) return;

  const days = pickDays(data.days);
  const first = parseDay(days[0].date);
  const last = parseDay(days[days.length - 1].date);
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const months = Math.max(1, Math.round((last - first) / DAY_MS / 30.44));
  const range = `in the last ${months === 1 ? "month" : `${months} months`}`;

  // If the snapshot is shorter than WEEKS, pad so the first column still
  // starts on a Sunday.
  const cells = [];
  for (let i = 0; i < first.getUTCDay(); i += 1) cells.push(buildSpacer());
  days.forEach((day) => cells.push(buildCell(day)));
  grid.replaceChildren(...cells);

  totalEl.textContent = number.format(total);
  rangeEl.textContent = ` contributions ${range} · as of ${dateLabel.format(last)}`;
  graph.setAttribute(
    "aria-label",
    `GitHub contribution graph: ${number.format(total)} contributions ${range}`,
  );

  wireTooltip(graph, grid, tip);
  root.hidden = false;
}
