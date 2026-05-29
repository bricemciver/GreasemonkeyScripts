# Equip-Bid Auto Login

A userscript that keeps you logged into equip-bid.com by re-submitting your saved credentials whenever your session expires.

## What it does

equip-bid.com keeps you signed in via an `oas-equip-bid` session cookie. On a successful login the server issues it as a persistent cookie that lasts one week (`Max-Age=604800`); once that week lapses — or you log out — the cookie is gone and you have to sign in again. The cookie is `HttpOnly`, so it is read with Tampermonkey's `GM_cookie` API.

On every equip-bid page this script checks for a valid (present and unexpired) session cookie. If it's missing or expired and you have saved credentials, it silently POSTs them to the same endpoint the login form uses, then reloads the page you were heading to — now signed in.

## Features

- **Automatic re-login**: Detects a missing/expired session and logs you back in without interrupting your browsing
- **Returns you to your page**: After logging in, you land on the page you originally requested (via the login form's `return` parameter)
- **Simple credentials UI**: A Tampermonkey menu command, **"Set equip-bid credentials"**, opens a small dialog to enter, update, or clear your email and password
- **Loop-safe**: Only one login attempt per navigation, so a bad password can't cause a reload loop
- **Easy Installation**: Compatible with Tampermonkey and other userscript managers that support `GM_cookie`

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/)
2. Download the userscript from <https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/equip-bid-auto-login.user.js>

## How to Use

1. **Save your credentials**: Open the Tampermonkey menu on any equip-bid.com page and click **"Set equip-bid credentials"**, then enter your email and password and click **Save**.
2. **Browse normally**: Whenever your one-week session has expired, the script logs you in again automatically and reloads the page you wanted.
3. **Update or remove credentials**: Reopen the same menu command to change them, or click **Clear saved** to remove them.

## Security note

Your email and password are stored **in plain text** in Tampermonkey's local storage on your machine. Anyone with access to your browser profile / Tampermonkey dashboard can read them. Use this only on a device you trust.

## How it works

- **Login detection** — `GM_cookie.list` reads the `HttpOnly` `oas-equip-bid` cookie; you're considered logged in only if it exists and has a future expiry. (Logout sets it to `deleted` with an expiry in the past, and a week-old login simply drops it.)
- **Login** — a background `GM_xmlhttpRequest` POST to `https://www.equip-bid.com/user/account/login` with `emailAddress`, `password`, `return`, and `submit`, exactly as the real form submits. The form has no CSRF token, so no token scraping is needed. Success is confirmed by re-reading the cookie.
