# Learning site

Free resume lessons and a practice job search for adult job seekers. Built by Drew Cannedy for Urban League Twin Cities Workforce Solutions, to be handed over to ULTC.

Hosted on Azure Static Web Apps (Free plan). Every push to `main` publishes the site.

## What's in it

Only the `site/` folder goes online. Everything else (this README, `tools/`) stays in the repo.

| Path | What it is | Where it comes from |
|---|---|---|
| `site/index.html` | Landing page | Edit by hand |
| `site/resume/start-here/` | Rise course "Your Resume: Start Here" | Rise web export |
| `site/practice/` | Corkboard Jobs, the practice job board | Copied from the portfolio repo |
| `site/404.html` | Page-not-found page | Edit by hand |
| `site/staticwebapp.config.json` | Azure settings and the résumé PDF download names | Partly written by `tools/sync-corkboard.py` |

## Update a Rise course

1. In Rise, export the course as **Web** (no tracking).
2. Unzip it. Delete everything inside the course's folder (for example `site/resume/start-here/`) and put the unzipped files there. `index.html` should sit directly inside that folder.
3. Commit and push.

To add a new course, make a new folder (for example `site/resume/advanced/`), put the export in it, and add a card for it in `site/index.html`.

## Update Corkboard Jobs

The portfolio repo (`drew-cannedy-site`) is the master copy. Its label checker and PDF builder live there, and a digital literacy course quotes Corkboard's exact words. Make changes there first, then copy them here:

```
python3 tools/sync-corkboard.py ../drew-cannedy-site
```

That replaces `site/practice/`, points the portfolio link at drew-cannedy.com, and rebuilds the PDF download names in `staticwebapp.config.json`.

Corkboard lives at `/practice/` here, the same path it has on drew-cannedy.com, so lesson links like `/practice/files/<id>.pdf` only change by domain.

The AI coach is not copied. It needs a server function and an API key (which should belong to ULTC, since it bills whoever owns it). Without it, Corkboard hides the "Ask the coach" box on its own and everything else works.

## Azure setup (one time)

In the Azure portal: **Create a resource > Static Web App**.

- Plan type: **Free**
- Deployment source: **GitHub**, this repo, branch `main`
- Build presets: **Custom**
- App location: `site`
- Api location: leave empty
- Output location: leave empty

Azure adds a workflow file to `.github/workflows/` in this repo. Leave it there; it's what publishes the site on every push.

## Handing it over to ULTC

1. Transfer this repo to a ULTC GitHub account (Settings > Danger Zone > Transfer), or have ULTC fork it.
2. ULTC creates its own Static Web App pointed at the repo, using the settings above.
3. If the site has a custom domain, point it at ULTC's Static Web App, then delete the old one.
