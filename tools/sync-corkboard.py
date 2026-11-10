#!/usr/bin/env python3
"""Copy Corkboard Jobs from the portfolio repo into this site.

The portfolio repo (drew-cannedy-site) is the master copy of Corkboard. Its label
checker and PDF builder live there, so make changes there first, then run:

    python3 tools/sync-corkboard.py [path/to/drew-cannedy-site]

The path defaults to a drew-cannedy-site folder next to this repo. The script:
  1. replaces site/practice/ with a fresh copy of the portfolio's practice/ folder,
  2. points the "Drew Cannedy's portfolio" link at drew-cannedy.com (on this site,
     "/" is the learning site's home page, not the portfolio), and drops the hub's
     "Stuck? ... use Ask the coach" tip, since there's no coach here,
  3. rebuilds the /practice/files/ download routes in site/staticwebapp.config.json
     from the download block in the portfolio's netlify.toml, so the practice
     résumé PDFs download with the same messy file names they have on the portfolio.

The AI coach is not copied. It needs a server function and an API key, and
Corkboard hides the "Ask the coach" box on its own when the function is missing.
"""
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_REPO = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT.parent / "drew-cannedy-site"
SRC = SRC_REPO / "practice"
DEST = ROOT / "site" / "practice"
CONFIG = ROOT / "site" / "staticwebapp.config.json"

PORTFOLIO_LINK_OLD = '<a href="/">Drew Cannedy\'s portfolio</a>'
PORTFOLIO_LINK_NEW = '<a href="https://drew-cannedy.com/">Drew Cannedy\'s portfolio</a>'
# The hub's how-to box points learners at "Ask the coach", which doesn't exist on this
# site (no coach function). Drop that one paragraph from the copy so nobody hunts for it.
COACH_TIP_RE = re.compile(r"\n?[ \t]*<p><b>Stuck\?</b>[^\n]*?<b>Ask the coach</b>.*?</p>")


def copy_practice():
    if not SRC.is_dir():
        sys.exit(f"Can't find {SRC}. Pass the path to the drew-cannedy-site folder.")
    if DEST.exists():
        shutil.rmtree(DEST)
    shutil.copytree(SRC, DEST, ignore=shutil.ignore_patterns(".DS_Store"))
    hub = DEST / "index.html"
    html = hub.read_text(encoding="utf-8")
    if PORTFOLIO_LINK_OLD in html:
        html = html.replace(PORTFOLIO_LINK_OLD, PORTFOLIO_LINK_NEW)
    else:
        print("Note: the portfolio link in practice/index.html changed. Check where it points.")
    html, n = COACH_TIP_RE.subn("", html)
    if n != 1:
        print("Note: couldn't find the 'Stuck? ... Ask the coach' tip in practice/index.html. Check it.")
    hub.write_text(html, encoding="utf-8")
    return sum(1 for p in DEST.rglob("*") if p.is_file())


def download_routes():
    toml = (SRC_REPO / "netlify.toml").read_text(encoding="utf-8")
    m = re.search(r"# BEGIN practice file downloads(.*?)# END practice file downloads", toml, re.S)
    if not m:
        sys.exit("Can't find the practice file downloads block in netlify.toml.")
    pairs = re.findall(
        r'for = "(/practice/files/[^"*]+)"\s*\[headers\.values\]\s*Content-Disposition = \'([^\']+)\'',
        m.group(1),
    )
    routes = [
        {"route": path, "headers": {"Content-Disposition": disp, "X-Robots-Tag": "noindex"}}
        for path, disp in pairs
    ]
    # SWA uses the first route that matches, so the catch-all goes last.
    routes.append({"route": "/practice/files/*", "headers": {"X-Robots-Tag": "noindex"}})
    return routes


def write_config(new_routes):
    config = json.loads(CONFIG.read_text(encoding="utf-8")) if CONFIG.exists() else {}
    kept = [r for r in config.get("routes", []) if not r.get("route", "").startswith("/practice/files/")]
    config["routes"] = kept + new_routes
    CONFIG.write_text(json.dumps(config, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    n = copy_practice()
    routes = download_routes()
    write_config(routes)
    print(f"Copied {n} Corkboard files and {len(routes) - 1} download names.")
