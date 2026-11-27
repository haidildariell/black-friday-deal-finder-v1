# DealSleuth — Real Black Friday Deals, Checked 27 Nov 2026

[![Black Friday Deal Finder](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Rank](https://make.fun/badge/black-friday-deal-finder-01/haidildariell/black-friday-deal-finder-v1/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Reward](https://make.fun/badge/black-friday-deal-finder-01/haidildariell/black-friday-deal-finder-v1/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

DealSleuth is a static Black Friday deal finder built for the
[make.fun Black Friday deal finder bounty](https://make.fun/bounty/black-friday-deal-finder-01).

## What it is

A deal finder for shoppers, not a list of inflated "discounts": 34 real
Black Friday and Cyber Monday deals, each with its product, store, store
link, sale price, usual price, discount, an honest verdict (new low, strong
deal, or routine sale, with the evidence), the source that showed the price,
and the time the price was checked — 27 Nov 2026.

## Features

- Live search plus filters by category, store and minimum discount
- Sort by biggest % off, biggest $ saving, lowest price, or name A–Z
- A detail page for every deal (hash routes, e.g. `#/deal/airpods-pro-3`)
  with the full price history, evidence and source
- "Also at" notes where the same price was verified at a second store
- Responsive layout: full grid on desktop, two-column cards on a phone
- Fully static: no build step, no network request, every file local

## How the deals were checked

Every price was read on 27 Nov 2026 from the source named on the deal —
a retailer page or a deals roundup that names the retailer (9to5Toys,
Yahoo Shopping, WIRED, ProductBible, TechRadar, Best Buy's own Black
Friday release, Walmart and Target ad roundups, and others). The verdict
on each deal says what the evidence supports: "new low" only where a
source calls it the lowest verified price, "routine sale" where the cut
is small.

## Layout

- `app/index.html` — the page shell
- `app/style.css` — the original design
- `app/data.js` — the 34 checked deals, with store, prices, verdict and source
- `app/app.js` — search, filters, sorting and hash routing
- `main.ts` — copies `app/` and `screenshots/` to `/output` and writes
  `dossier.json` with the vendored make.fun library
- `screenshots/` — real renders of the site in a browser

## Run it locally

```sh
cd app && python3 -m http.server 8080
```

Then open http://localhost:8080 — no build step, no install.

## License

MIT — see LICENSE.
