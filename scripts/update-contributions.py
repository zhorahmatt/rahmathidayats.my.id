#!/usr/bin/env python3
"""Refresh assets/data/contributions.json from GitHub's public contribution calendar.

Usage:  python3 scripts/update-contributions.py [github-username]

GitHub serves the calendar that sits on every profile page as plain HTML at
/users/<name>/contributions. This reads the day cells out of it (date, shade
level, count) and saves them as JSON for js/contributions.js to draw. No token
is needed; only public contributions are included.
"""
import json
import re
import sys
import urllib.request
from datetime import date
from pathlib import Path

USERNAME = sys.argv[1] if len(sys.argv) > 1 else "zhorahmatt"
OUTPUT = Path(__file__).resolve().parent.parent / "assets" / "data" / "contributions.json"

CELL = re.compile(r'data-date="(\d{4}-\d{2}-\d{2})"\s+id="([\w-]+)"\s+data-level="(\d)"')
TIP = re.compile(r'<tool-tip[^>]*\sfor="([\w-]+)"[^>]*>\s*([^<]+?)\s*</tool-tip>')
COUNT = re.compile(r"^(\d[\d,]*) contributions?")


def main() -> None:
    request = urllib.request.Request(
        f"https://github.com/users/{USERNAME}/contributions",
        headers={"User-Agent": "contribution-snapshot", "X-Requested-With": "XMLHttpRequest"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        html = response.read().decode("utf-8")

    labels = dict(TIP.findall(html))
    days = []
    for day, cell_id, level in CELL.findall(html):
        match = COUNT.match(labels.get(cell_id, ""))
        count = int(match.group(1).replace(",", "")) if match else 0
        days.append({"date": day, "count": count, "level": int(level)})

    if not days:
        sys.exit("No contribution days found. GitHub may have changed the page; nothing was written.")

    days.sort(key=lambda item: item["date"])
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps({"username": USERNAME, "updated": date.today().isoformat(), "days": days}, separators=(",", ":"))
        + "\n",
        encoding="utf-8",
    )
    total = sum(item["count"] for item in days)
    print(f"{USERNAME}: {len(days)} days, {total} contributions, {days[0]['date']} to {days[-1]['date']}")


if __name__ == "__main__":
    main()
