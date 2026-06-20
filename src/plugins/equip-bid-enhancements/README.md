# Equip-Bid Enhancements

A userscript that bundles several quality-of-life improvements for [equip-bid.com](https://www.equip-bid.com) auctions into one script. It **replaces the standalone _Equip-Bid Auto Login_ script** — the auto-login feature is now built in here, so install this one instead.

## What it does

| #   | Feature                 | Why it helps                                                                                                                                                                                                                                                         |
| --- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Auto-login**          | Re-submits your saved credentials when the one-week session cookie expires, then returns you to the page you were on. (Same behavior as the old _Auto Login_ script.)                                                                                                |
| 2   | **Connection recovery** | equip-bid's live bidding sometimes drops its websocket and shows _"No Connection!"_ / _"Socket Connection Lost."_, requiring a manual reload. This detects that state and reloads for you (with a cancelable countdown) or offers a one-click **Reload now** button. |
| 3   | **All-in cost badges**  | The listed bid hides the real price. A badge next to each lot's _Next Required Bid_ shows the true cost = bid + buyer's premium (default 18%) + per-lot handling (default $1.00) + optional sales tax.                                                               |
| 4   | **Bid counts**          | The lot grid never shows how many bids a lot has — only the detail page does. Each visible lot's detail page is fetched in the background (lazily, as it scrolls into view) and the lot is badged with its bid count.                                                |
| 5   | **Photo carousel**      | Adds a 🔍 zoom button to each lot thumbnail. It opens a lightbox showing the full-size image, then pulls the lot's _entire_ photo set from its detail page so you can flip through every photo (arrow keys / on-screen arrows) without opening the lot.              |
| 6   | **Watchlist summary**   | On the dashboard Watched Lots tab, a banner totals the all-in cost to win everything at current bids, **subtotaled by auction** (since you pay and pick up per auction).                                                                                             |

Features 3–6 work everywhere a lot appears — the auction grid, the single-lot detail page, and the dashboard **Watched Lots** tab.

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) (the auto-login and connection features rely on `GM_cookie` / `GM_xmlhttpRequest`).
2. Download the userscript from <https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/equip-bid-enhancements.user.js>
3. If you previously installed **Equip-Bid Auto Login**, remove it — its functionality is included here and running both is redundant.

## Configuration

Open the Tampermonkey menu on any equip-bid.com page:

- **Set equip-bid credentials** — enter, update, or clear the email/password used for auto-login.
- **Set equip-bid fee settings** — adjust the buyer's premium %, per-lot handling, and sales tax % used for the all-in badges.
- **Enable/Disable auto-reload on connection loss** — toggle whether a dropped connection reloads automatically or just shows a manual button.

## Notes & caveats

- **Credentials are stored in plain text** in Tampermonkey's local storage on your machine. Only use auto-login on a device you trust.
- Auto-reload is **rate-limited** (max 3 reloads per minute) so a real server outage can't trap you in a reload loop, and it won't fire while you're typing in an input.
- The lot features key off equip-bid's per-lot element ids/classes (e.g. `lot_next_required_bid_*`, `img.auction-img`) and **re-apply themselves as lots load and update over the websocket**. If the site significantly changes that markup, a feature may quietly stop matching rather than break the page; please file an issue.
- The **all-in figure is an estimate** and uses one premium/handling/tax setting for every auction. Buyer's premiums and tax can differ between auctions/affiliates, so confirm the exact figures against each auction's Terms before bidding.
- **Bid counts and the photo carousel fetch each lot's detail page in the background.** Fetching is lazy (only as a lot scrolls into view), capped at a few requests at a time, and cached per page load. The displayed **bid count is a snapshot** from when the lot was first fetched, not a live ticker.

## How auto-login works

equip-bid keeps you signed in via an `oas-equip-bid` session cookie, issued as a persistent cookie lasting one week (`Max-Age=604800`). The cookie is `HttpOnly`, so it's read with Tampermonkey's `GM_cookie` API. On every page the script checks for a valid (present and unexpired) cookie; if it's missing/expired and you have saved credentials, it silently POSTs them to the same endpoint the login form uses (`/user/account/login`, no CSRF token required), then reloads the page you were heading to — now signed in. Only one login attempt is made per navigation, so a bad password can't cause a reload loop.
