// Equip-Bid Auto Login
//
// equip-bid.com sets an `oas-equip-bid` session cookie. On a successful login the
// server re-issues it as a *persistent* cookie with `Max-Age=604800` (one week);
// on logout (or once the week lapses) the cookie is deleted/absent. The cookie is
// HttpOnly, so it can only be read via GM_cookie, not document.cookie.
//
// On every equip-bid page we read that cookie. If it is missing or already expired,
// and the user has saved credentials, we POST those credentials in the background to
// the same endpoint the login form uses, then reload the page the user was heading to
// (now authenticated). Credentials are entered/edited through a Tampermonkey menu
// command that opens a small in-page dialog.

const SESSION_COOKIE = 'oas-equip-bid'
const LOGIN_ENDPOINT = 'https://www.equip-bid.com/user/account/login'

// Tampermonkey storage keys.
const EMAIL_KEY = 'emailAddress'
const PASSWORD_KEY = 'password'

// Set on the navigation right before a login attempt, so a failed attempt cannot
// spin into a reload loop. Lives in sessionStorage so it is scoped to this tab and
// cleared automatically when the tab closes.
const ATTEMPT_FLAG = 'equipBidAutoLoginAttempted'

type Credentials = { email: string; password: string }

const getCredentials = (): Credentials => ({
  email: GM_getValue<string>(EMAIL_KEY, ''),
  password: GM_getValue<string>(PASSWORD_KEY, ''),
})

const saveCredentials = ({ email, password }: Credentials): void => {
  GM_setValue(EMAIL_KEY, email)
  GM_setValue(PASSWORD_KEY, password)
}

const clearCredentials = (): void => {
  GM_deleteValue(EMAIL_KEY)
  GM_deleteValue(PASSWORD_KEY)
}

// Resolve the current login session cookie (or undefined if there isn't one).
const getSessionCookie = (): Promise<Tampermonkey.Cookie | undefined> =>
  new Promise((resolve) => {
    GM_cookie.list({ name: SESSION_COOKIE }, (cookies, error) => {
      if (error || !cookies || cookies.length === 0) {
        resolve(undefined)
      } else {
        resolve(cookies[0])
      }
    })
  })

// We are logged in only when the cookie exists AND is persistent with a future
// expiry. A deleted cookie is absent; an anonymous/session cookie has no future
// expirationDate. expirationDate is in seconds since the Unix epoch.
const isLoggedIn = (cookie: Tampermonkey.Cookie | undefined): boolean => {
  if (!cookie || cookie.session || !cookie.expirationDate) {
    return false
  }
  return cookie.expirationDate * 1000 > Date.now()
}

// POST the saved credentials to the login endpoint exactly as the real form does.
// `return` tells the server where to send us after login; the form also includes an
// empty `submit` field, mirrored here. Success is confirmed by re-reading the cookie
// rather than trusting the response body.
const attemptLogin = (credentials: Credentials, returnPath: string): Promise<boolean> => {
  const body = new URLSearchParams({
    emailAddress: credentials.email,
    password: credentials.password,
    return: returnPath,
    submit: '',
  }).toString()

  return new Promise((resolve) => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: LOGIN_ENDPOINT,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: body,
      onload: () => {
        // The browser commits the response's Set-Cookie before onload fires, so
        // re-reading the cookie tells us whether a real session was established
        // (more reliable than parsing the response body).
        getSessionCookie().then((cookie) => resolve(isLoggedIn(cookie)))
      },
      onerror: () => resolve(false),
      ontimeout: () => resolve(false),
    })
  })
}

// ---------------------------------------------------------------------------
// Credentials dialog
// ---------------------------------------------------------------------------

const DIALOG_ID = 'equip-bid-auto-login-dialog'

const injectStyles = (): void => {
  if (document.getElementById(`${DIALOG_ID}-styles`)) {
    return
  }
  const style = document.createElement('style')
  style.id = `${DIALOG_ID}-styles`
  style.textContent = `
    #${DIALOG_ID} {
      border: none;
      border-radius: 8px;
      padding: 0;
      width: 340px;
      max-width: 90vw;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
      color: #333;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #${DIALOG_ID}::backdrop {
      background: rgba(0, 0, 0, 0.5);
    }
    #${DIALOG_ID} form { margin: 0; padding: 20px; }
    #${DIALOG_ID} h2 { margin: 0 0 4px; font-size: 1.15rem; }
    #${DIALOG_ID} p.hint { margin: 0 0 16px; font-size: 0.8rem; color: #777; }
    #${DIALOG_ID} label { display: block; font-size: 0.85rem; font-weight: 600; margin: 12px 0 4px; }
    #${DIALOG_ID} input[type="email"],
    #${DIALOG_ID} input[type="password"] {
      width: 100%;
      box-sizing: border-box;
      padding: 8px 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 0.95rem;
    }
    #${DIALOG_ID} .buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
    }
    #${DIALOG_ID} button {
      border: none;
      border-radius: 4px;
      padding: 8px 14px;
      font-size: 0.9rem;
      cursor: pointer;
    }
    #${DIALOG_ID} .right-buttons { display: flex; gap: 8px; }
    #${DIALOG_ID} button.save { background: #2bb24c; color: #fff; }
    #${DIALOG_ID} button.cancel { background: #e0e0e0; color: #333; }
    #${DIALOG_ID} button.clear { background: transparent; color: #c0392b; padding-left: 0; }
  `
  document.head?.appendChild(style)
}

const openCredentialsDialog = (): void => {
  injectStyles()

  // Reuse an existing dialog if it is already in the DOM.
  document.getElementById(DIALOG_ID)?.remove()

  const { email, password } = getCredentials()

  const dialog = document.createElement('dialog')
  dialog.id = DIALOG_ID
  dialog.innerHTML = `
    <form method="dialog">
      <h2>Equip-Bid Auto Login</h2>
      <p class="hint">Stored locally in Tampermonkey and re-submitted automatically when your session expires.</p>
      <label for="${DIALOG_ID}-email">Email address</label>
      <input id="${DIALOG_ID}-email" type="email" autocomplete="off" />
      <label for="${DIALOG_ID}-password">Password</label>
      <input id="${DIALOG_ID}-password" type="password" autocomplete="off" />
      <div class="buttons">
        <button type="button" class="clear">Clear saved</button>
        <div class="right-buttons">
          <button type="button" class="cancel">Cancel</button>
          <button type="submit" class="save">Save</button>
        </div>
      </div>
    </form>
  `

  const emailInput = dialog.querySelector<HTMLInputElement>(`#${DIALOG_ID}-email`)
  const passwordInput = dialog.querySelector<HTMLInputElement>(`#${DIALOG_ID}-password`)
  if (emailInput) emailInput.value = email
  if (passwordInput) passwordInput.value = password

  // One cleanup path for every way the dialog can close (Esc, Cancel, or Save).
  dialog.addEventListener('close', () => dialog.remove())

  dialog.querySelector<HTMLButtonElement>('button.cancel')?.addEventListener('click', () => dialog.close())

  dialog.querySelector<HTMLButtonElement>('button.clear')?.addEventListener('click', () => {
    clearCredentials()
    if (emailInput) emailInput.value = ''
    if (passwordInput) passwordInput.value = ''
  })

  // Saving on the form's submit means both the Save button and the Enter key work;
  // `method="dialog"` then closes the dialog (triggering the cleanup above).
  dialog.querySelector<HTMLFormElement>('form')?.addEventListener('submit', () => {
    saveCredentials({
      email: emailInput?.value.trim() ?? '',
      password: passwordInput?.value ?? '',
    })
    // Allow a fresh auto-login attempt now that credentials may have changed.
    sessionStorage.removeItem(ATTEMPT_FLAG)
    // If we are currently logged out, kick off a login right away.
    void ensureLoggedIn()
  })

  document.body.appendChild(dialog)
  dialog.showModal()
}

// GM_registerMenuCommand needs no DOM; the dialog itself waits for <body>.
GM_registerMenuCommand('Set equip-bid credentials', () => {
  if (document.body) {
    openCredentialsDialog()
  } else {
    window.addEventListener('DOMContentLoaded', openCredentialsDialog, { once: true })
  }
})

// ---------------------------------------------------------------------------
// Auto-login flow
// ---------------------------------------------------------------------------

const ensureLoggedIn = async (): Promise<void> => {
  const cookie = await getSessionCookie()
  if (isLoggedIn(cookie)) {
    return
  }

  const credentials = getCredentials()
  if (!credentials.email || !credentials.password) {
    console.info(
      '[equip-bid auto-login] No saved credentials. Use the Tampermonkey menu → "Set equip-bid credentials".',
    )
    return
  }

  // Don't retry within the same navigation if we already tried (avoids reload loops).
  if (sessionStorage.getItem(ATTEMPT_FLAG)) {
    console.warn('[equip-bid auto-login] Login already attempted for this navigation; not retrying.')
    return
  }
  sessionStorage.setItem(ATTEMPT_FLAG, '1')

  const returnPath = location.pathname + location.search
  const success = await attemptLogin(credentials, returnPath)

  if (success) {
    // Cookie is set; reload so the page renders in its authenticated state.
    location.reload()
  } else {
    console.error('[equip-bid auto-login] Login failed. Check the saved credentials via the Tampermonkey menu.')
  }
}

void ensureLoggedIn()
