// Equip-Bid Enhancements
//
// A single userscript bundling several quality-of-life fixes for equip-bid.com:
//
//   1. Auto-login          - re-submit saved credentials when the session cookie expires
//                            (this replaces the standalone "Equip-Bid Auto Login" script).
//   2. Connection recovery - detect the site's "No Connection!" / "Socket Connection Lost."
//                            state and offer a one-click (optionally automatic) reload.
//   3. All-in cost badges  - show the true cost of each lot (bid + buyer's premium +
//                            per-lot handling + optional tax) next to the next-required-bid.
//   4. Bid counts          - the auction grid doesn't show how many bids a lot has, but the
//                            lot detail page does. We lazily fetch each visible lot's detail
//                            page in the background and badge it with the bid count.
//   5. Photo carousel      - a zoom button on each grid thumbnail opens a lightbox. The same
//                            detail-page fetch also yields the lot's full set of photos, so
//                            the lightbox becomes a multi-image carousel.
//
// equip-bid renders lot data as plain-text labels ("Next Required Bid: $5.00",
// "High Bidder: #1234", ...) and updates them over a websocket, so the on-grid features key
// off visible text rather than fragile CSS class names and re-apply themselves as the lot
// list mutates. The detail page is plain server-rendered HTML: the bid count appears as
// "N Bid(s)" and the photos as a `dataSource: [{ "image": "..." }]` JSON array, both of
// which we parse out of the fetched HTML.

// ===========================================================================
// Shared config (fees) — editable from the Tampermonkey menu
// ===========================================================================

// equip-bid's terms list an 18% buyer's premium and a $1.00/lot handling surcharge.
// Sales tax varies (and tax-exempt buyers pay none), so it defaults to off.
const FEE_KEYS = {
  premiumPct: 'feeBuyerPremiumPct',
  handling: 'feeHandlingPerLot',
  taxPct: 'feeTaxPct',
} as const

type Fees = { premiumPct: number; handling: number; taxPct: number }

const getFees = (): Fees => ({
  premiumPct: GM_getValue<number>(FEE_KEYS.premiumPct, 18),
  handling: GM_getValue<number>(FEE_KEYS.handling, 1),
  taxPct: GM_getValue<number>(FEE_KEYS.taxPct, 0),
})

const saveFees = ({ premiumPct, handling, taxPct }: Fees): void => {
  GM_setValue(FEE_KEYS.premiumPct, premiumPct)
  GM_setValue(FEE_KEYS.handling, handling)
  GM_setValue(FEE_KEYS.taxPct, taxPct)
}

// Whether a dropped connection should reload the page automatically (with a cancelable
// countdown) or just show a manual "Reload now" button.
const AUTO_RELOAD_KEY = 'connectionAutoReload'
const getAutoReload = (): boolean => GM_getValue<boolean>(AUTO_RELOAD_KEY, true)

const usd = (n: number): string => `$${n.toFixed(2)}`

// ===========================================================================
// 1. Auto-login (ported from the standalone equip-bid-auto-login script)
// ===========================================================================

const SESSION_COOKIE = 'oas-equip-bid'
const LOGIN_ENDPOINT = 'https://www.equip-bid.com/user/account/login'
const EMAIL_KEY = 'emailAddress'
const PASSWORD_KEY = 'password'
// One attempt per navigation so a bad password can't spin into a reload loop.
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

// Logged in only when the cookie exists AND is persistent with a future expiry.
const isLoggedIn = (cookie: Tampermonkey.Cookie | undefined): boolean => {
  if (!cookie || cookie.session || !cookie.expirationDate) {
    return false
  }
  return cookie.expirationDate * 1000 > Date.now()
}

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
        getSessionCookie().then((cookie) => resolve(isLoggedIn(cookie)))
      },
      onerror: () => resolve(false),
      ontimeout: () => resolve(false),
    })
  })
}

const ensureLoggedIn = async (): Promise<void> => {
  const cookie = await getSessionCookie()
  if (isLoggedIn(cookie)) {
    return
  }

  const credentials = getCredentials()
  if (!credentials.email || !credentials.password) {
    console.info('[equip-bid] No saved credentials. Use the Tampermonkey menu → "Set equip-bid credentials".')
    return
  }

  if (sessionStorage.getItem(ATTEMPT_FLAG)) {
    console.warn('[equip-bid] Login already attempted for this navigation; not retrying.')
    return
  }
  sessionStorage.setItem(ATTEMPT_FLAG, '1')

  const returnPath = location.pathname + location.search
  const success = await attemptLogin(credentials, returnPath)

  if (success) {
    location.reload()
  } else {
    console.error('[equip-bid] Login failed. Check the saved credentials via the Tampermonkey menu.')
  }
}

// ===========================================================================
// Styling for everything this script injects
// ===========================================================================

const STYLE_ID = 'equip-bid-enhancements-styles'

const injectStyles = (): void => {
  if (document.getElementById(STYLE_ID)) {
    return
  }
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    /* shared dialog look (credentials + fee settings) */
    dialog.eqb-dialog {
      border: none; border-radius: 8px; padding: 0; width: 360px; max-width: 90vw;
      box-shadow: 0 10px 40px rgba(0,0,0,.35); color: #333;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    dialog.eqb-dialog::backdrop { background: rgba(0,0,0,.5); }
    dialog.eqb-dialog form { margin: 0; padding: 20px; }
    dialog.eqb-dialog h2 { margin: 0 0 4px; font-size: 1.15rem; }
    dialog.eqb-dialog p.hint { margin: 0 0 16px; font-size: .8rem; color: #777; }
    dialog.eqb-dialog label { display: block; font-size: .85rem; font-weight: 600; margin: 12px 0 4px; }
    dialog.eqb-dialog input { width: 100%; box-sizing: border-box; padding: 8px 10px;
      border: 1px solid #ccc; border-radius: 4px; font-size: .95rem; }
    dialog.eqb-dialog .buttons { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
    dialog.eqb-dialog .right-buttons { display: flex; gap: 8px; }
    dialog.eqb-dialog button { border: none; border-radius: 4px; padding: 8px 14px; font-size: .9rem; cursor: pointer; }
    dialog.eqb-dialog button.save { background: #2bb24c; color: #fff; }
    dialog.eqb-dialog button.cancel { background: #e0e0e0; color: #333; }
    dialog.eqb-dialog button.clear { background: transparent; color: #c0392b; padding-left: 0; }

    /* all-in cost badge */
    .eqb-allin { display: inline-block; margin-left: 6px; padding: 1px 6px; border-radius: 10px;
      background: #eef6ee; color: #1f7a33; font-size: .8em; font-weight: 600; white-space: nowrap; }

    /* per-lot bid count */
    .eqb-bidcount { display: inline-block; margin-left: 6px; padding: 1px 6px; border-radius: 10px;
      background: #eef1f6; color: #355; font-size: .8em; font-weight: 600; white-space: nowrap; }

    /* photo preview zoom button + lightbox carousel */
    .eqb-zoom { position: absolute; top: 6px; right: 6px; z-index: 5; width: 28px; height: 28px;
      border: none; border-radius: 50%; background: rgba(0,0,0,.6); color: #fff; font-size: 14px;
      line-height: 28px; text-align: center; cursor: pointer; padding: 0; opacity: 0; transition: opacity .15s; }
    .eqb-img-wrap { position: relative; }
    .eqb-img-wrap:hover .eqb-zoom { opacity: 1; }
    #eqb-lightbox { position: fixed; inset: 0; z-index: 10000; display: none; align-items: center;
      justify-content: center; background: rgba(0,0,0,.85); }
    #eqb-lightbox.open { display: flex; }
    #eqb-lb-content { position: relative; display: flex; align-items: center; justify-content: center;
      max-width: 94vw; max-height: 94vh; }
    #eqb-lb-content img { max-width: 92vw; max-height: 92vh; box-shadow: 0 0 40px rgba(0,0,0,.6); border-radius: 4px; }
    .eqb-lb-nav { position: absolute; top: 50%; transform: translateY(-50%); border: none; cursor: pointer;
      width: 46px; height: 70px; background: rgba(0,0,0,.45); color: #fff; font-size: 30px; line-height: 70px;
      border-radius: 4px; }
    .eqb-lb-nav:hover { background: rgba(0,0,0,.7); }
    .eqb-lb-prev { left: -8px; }
    .eqb-lb-next { right: -8px; }
    .eqb-lb-counter { position: absolute; bottom: -30px; left: 50%; transform: translateX(-50%);
      color: #fff; font-size: .9rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

    /* connection-lost banner */
    #eqb-connection { position: fixed; left: 50%; top: 16px; transform: translateX(-50%); z-index: 10001;
      max-width: 90vw; background: #c0392b; color: #fff; padding: 12px 18px; border-radius: 6px;
      box-shadow: 0 8px 30px rgba(0,0,0,.4); font-size: .9rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex; align-items: center; gap: 12px; }
    #eqb-connection button { border: none; border-radius: 4px; padding: 6px 12px; font-size: .85rem; cursor: pointer; }
    #eqb-connection button.reload { background: #fff; color: #c0392b; font-weight: 600; }
    #eqb-connection button.dismiss { background: rgba(255,255,255,.2); color: #fff; }
  `
  document.head?.appendChild(style)
}

// ===========================================================================
// DOM helpers
// ===========================================================================

// The leaf-most elements whose own text carries a given label, so we can attach badges
// right next to the value rather than to some big wrapper.
const findLabelLeaves = (root: ParentNode, label: RegExp): HTMLElement[] => {
  const all = Array.from(root.querySelectorAll<HTMLElement>('*')).filter((el) => label.test(el.textContent ?? ''))
  return all.filter((el) => !all.some((other) => other !== el && el.contains(other)))
}

// Walk up from an element to find the lot detail URL for the card it belongs to.
const itemUrlFor = (el: Element): string | null => {
  let cur: Element | null = el
  for (let i = 0; i < 8 && cur; i++) {
    const a = cur.querySelector<HTMLAnchorElement>('a[href*="/item/"]')
    if (a?.href) return a.href
    cur = cur.parentElement
  }
  return null
}

// ===========================================================================
// Detail-page fetching (powers bid counts + the photo carousel)
// ===========================================================================

type LotDetail = { bidCount: number | null; images: string[] }

const detailCache = new Map<string, LotDetail>()
const inflight = new Map<string, Promise<LotDetail>>()

// Be a good citizen: cap how many detail pages we fetch in parallel.
const MAX_CONCURRENT = 4
let activeFetches = 0
const fetchQueue: Array<() => void> = []

const pumpQueue = (): void => {
  while (activeFetches < MAX_CONCURRENT && fetchQueue.length > 0) {
    fetchQueue.shift()!()
  }
}

const parseDetail = (html: string): LotDetail => {
  const bidMatch = html.match(/(\d+)\s*bid\(s\)/i)
  const bidCount = bidMatch ? Number.parseInt(bidMatch[1], 10) : null

  // Photos live in a `dataSource: [{ ..., "image": "https:\/\/..." }]` JSON array.
  const images: string[] = []
  const re = /"image"\s*:\s*"(https:[^"]+)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    images.push(m[1].replace(/\\\//g, '/'))
  }
  return { bidCount, images: [...new Set(images)] }
}

const fetchDetail = (url: string): Promise<LotDetail> => {
  const cached = detailCache.get(url)
  if (cached) return Promise.resolve(cached)
  const existing = inflight.get(url)
  if (existing) return existing

  const promise = new Promise<LotDetail>((resolve) => {
    const run = (): void => {
      activeFetches += 1
      GM_xmlhttpRequest({
        method: 'GET',
        url,
        onload: (res) => resolve(parseDetail(res.responseText)),
        onerror: () => resolve({ bidCount: null, images: [] }),
        ontimeout: () => resolve({ bidCount: null, images: [] }),
      })
    }
    fetchQueue.push(run)
    pumpQueue()
  }).then((detail) => {
    activeFetches -= 1
    inflight.delete(url)
    detailCache.set(url, detail)
    pumpQueue()
    return detail
  })

  inflight.set(url, promise)
  return promise
}

// ===========================================================================
// 2. Connection recovery
// ===========================================================================

// equip-bid keeps hidden socket-status alerts in the page and reveals them on error. The
// "_danger" one ("Can't connect to Server! ... you will need to refresh the page") is the
// state worth reloading for; the "_warning" one auto-recovers, so we ignore it.
const DANGER_ALERT_ID = 'sockoas_connection_alert_danger'
const RELOAD_COUNT_KEY = 'equipBidReloadCount'
const RELOAD_TS_KEY = 'equipBidReloadTs'
const MAX_AUTO_RELOADS = 3 // within RELOAD_WINDOW_MS, then fall back to manual
const RELOAD_WINDOW_MS = 60_000
const RELOAD_COUNTDOWN_S = 10

let connectionBannerShown = false

const hasConnectionError = (): boolean => {
  // The alert is in the page at all times but hidden (display:none) until the socket gives
  // up; offsetParent is null while hidden, non-null once revealed.
  const alert = document.getElementById(DANGER_ALERT_ID)
  return !!alert && alert.offsetParent !== null
}

const dismissConnectionBanner = (): void => {
  document.getElementById('eqb-connection')?.remove()
  connectionBannerShown = false
}

const showConnectionBanner = (): void => {
  if (connectionBannerShown || document.getElementById('eqb-connection')) {
    return
  }
  connectionBannerShown = true

  // Rate-limit automatic reloads so a server outage can't trap us in a reload loop.
  const now = Date.now()
  const firstTs = GM_getValue<number>(RELOAD_TS_KEY, 0)
  let count = GM_getValue<number>(RELOAD_COUNT_KEY, 0)
  if (now - firstTs > RELOAD_WINDOW_MS) {
    count = 0
    GM_setValue(RELOAD_TS_KEY, now)
  }
  const reloadsLeft = MAX_AUTO_RELOADS - count
  const editing = document.activeElement instanceof HTMLInputElement
  const willAutoReload = getAutoReload() && reloadsLeft > 0 && !editing

  const banner = document.createElement('div')
  banner.id = 'eqb-connection'
  const msg = document.createElement('span')
  banner.appendChild(msg)

  const reloadNow = (): void => {
    GM_setValue(RELOAD_COUNT_KEY, count + 1)
    GM_setValue(RELOAD_TS_KEY, GM_getValue<number>(RELOAD_TS_KEY, now))
    location.reload()
  }

  const reloadBtn = document.createElement('button')
  reloadBtn.className = 'reload'
  reloadBtn.textContent = 'Reload now'
  reloadBtn.addEventListener('click', reloadNow)
  banner.appendChild(reloadBtn)

  const dismissBtn = document.createElement('button')
  dismissBtn.className = 'dismiss'
  dismissBtn.textContent = 'Dismiss'
  banner.appendChild(dismissBtn)

  document.body.appendChild(banner)

  if (willAutoReload) {
    let remaining = RELOAD_COUNTDOWN_S
    msg.textContent = `Connection lost. Reloading in ${remaining}s…`
    const timer = window.setInterval(() => {
      remaining -= 1
      if (remaining <= 0) {
        window.clearInterval(timer)
        reloadNow()
        return
      }
      msg.textContent = `Connection lost. Reloading in ${remaining}s…`
    }, 1000)
    dismissBtn.textContent = 'Cancel'
    dismissBtn.addEventListener('click', () => {
      window.clearInterval(timer)
      dismissConnectionBanner()
    })
  } else {
    msg.textContent = 'Connection lost. Live bids and timers may be stale.'
    dismissBtn.addEventListener('click', dismissConnectionBanner)
  }
}

const checkConnection = (): void => {
  if (hasConnectionError()) {
    showConnectionBanner()
  } else if (connectionBannerShown) {
    dismissConnectionBanner() // connection recovered on its own
  }
}

// ===========================================================================
// 3. All-in cost badges
// ===========================================================================

// Pull a dollar amount that follows a given label out of an element's text.
const amountAfter = (text: string, label: RegExp): number | null => {
  const re = new RegExp(label.source + String.raw`\s*:?\s*\$\s*([0-9][0-9,]*(?:\.[0-9]{2})?)`, 'i')
  const m = text.match(re)
  if (!m) return null
  const n = Number.parseFloat(m[1].replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

const computeAllIn = (bid: number, fees: Fees): number => {
  const base = bid * (1 + fees.premiumPct / 100) + fees.handling
  return base * (1 + fees.taxPct / 100)
}

const applyAllInBadges = (root: ParentNode, fees: Fees): void => {
  // Re-derive from scratch each pass so socket bid updates stay accurate.
  root.querySelectorAll('.eqb-allin').forEach((b) => b.remove())
  if (fees.premiumPct === 0 && fees.handling === 0 && fees.taxPct === 0) {
    return
  }
  for (const el of findLabelLeaves(root, /next required bid/i)) {
    const bid = amountAfter(el.textContent ?? '', /next required bid/i)
    if (bid === null) continue
    const badge = document.createElement('span')
    badge.className = 'eqb-allin'
    badge.textContent = `≈ ${usd(computeAllIn(bid, fees))} all-in`
    const taxNote = fees.taxPct > 0 ? `, ${fees.taxPct}% tax` : ''
    badge.title = `Bid ${usd(bid)} + ${fees.premiumPct}% premium + ${usd(fees.handling)} handling${taxNote}`
    el.appendChild(badge)
  }
}

// ===========================================================================
// 4. Bid counts (lazily fetched from each lot's detail page)
// ===========================================================================

const setBidBadge = (el: HTMLElement, count: number): void => {
  if (el.querySelector(':scope > .eqb-bidcount')) return
  const badge = document.createElement('span')
  badge.className = 'eqb-bidcount'
  badge.textContent = count === 1 ? '1 bid' : `${count} bids`
  el.appendChild(badge)
}

// Fetch a lot's detail page only once it scrolls near the viewport.
const bidObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const el = entry.target as HTMLElement
      bidObserver.unobserve(el)
      const url = itemUrlFor(el)
      if (!url) continue
      void fetchDetail(url).then((detail) => {
        if (detail.bidCount != null && el.isConnected) {
          setBidBadge(el, detail.bidCount)
        }
      })
    }
  },
  { rootMargin: '300px' },
)

const applyBidCounts = (root: ParentNode): void => {
  for (const el of findLabelLeaves(root, /high bidder/i)) {
    const url = itemUrlFor(el)
    if (!url) continue
    const cached = detailCache.get(url)
    if (cached?.bidCount != null) {
      setBidBadge(el, cached.bidCount)
    } else if (!el.dataset.eqbBidObserved) {
      el.dataset.eqbBidObserved = '1'
      bidObserver.observe(el)
    }
  }
}

// ===========================================================================
// 5. Photo carousel (zoom button + lightbox)
// ===========================================================================

// equip-bid thumbnails come from rackcdn with a single-letter size prefix on the filename
// (T_ thumb, M_ medium, ...). Stripping it yields the full-size image, matching the URLs in
// the detail page's dataSource.
const stripSizePrefix = (url: string): string => url.replace(/\/[A-Za-z]+_(?=[^/]+$)/, '/')
const fileBase = (url: string): string => stripSizePrefix(url).split('/').pop() ?? url

let lbImages: string[] = []
let lbIndex = 0

const ensureLightbox = (): HTMLDivElement => {
  let box = document.getElementById('eqb-lightbox') as HTMLDivElement | null
  if (box) return box

  box = document.createElement('div')
  box.id = 'eqb-lightbox'
  box.innerHTML = `
    <div id="eqb-lb-content">
      <button class="eqb-lb-nav eqb-lb-prev" type="button" aria-label="Previous">‹</button>
      <img alt="Lot photo" />
      <button class="eqb-lb-nav eqb-lb-next" type="button" aria-label="Next">›</button>
      <div class="eqb-lb-counter"></div>
    </div>
  `

  const close = (): void => box!.classList.remove('open')
  // Click the dark backdrop (but not the image/buttons) to close.
  box.addEventListener('click', (e) => {
    if (e.target === box) close()
  })
  box.querySelector('.eqb-lb-prev')?.addEventListener('click', () => stepLightbox(-1))
  box.querySelector('.eqb-lb-next')?.addEventListener('click', () => stepLightbox(1))
  document.addEventListener('keydown', (e) => {
    if (!box!.classList.contains('open')) return
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowLeft') stepLightbox(-1)
    if (e.key === 'ArrowRight') stepLightbox(1)
  })

  document.body.appendChild(box)
  return box
}

const renderLightbox = (): void => {
  const box = ensureLightbox()
  const img = box.querySelector('img')
  const counter = box.querySelector<HTMLDivElement>('.eqb-lb-counter')
  const prev = box.querySelector<HTMLButtonElement>('.eqb-lb-prev')
  const next = box.querySelector<HTMLButtonElement>('.eqb-lb-next')
  if (!img || !counter || !prev || !next) return

  const multi = lbImages.length > 1
  img.src = lbImages[lbIndex]
  counter.textContent = multi ? `${lbIndex + 1} / ${lbImages.length}` : ''
  prev.style.display = multi ? '' : 'none'
  next.style.display = multi ? '' : 'none'
}

const stepLightbox = (delta: number): void => {
  if (lbImages.length < 2) return
  lbIndex = (lbIndex + delta + lbImages.length) % lbImages.length
  renderLightbox()
}

const openLightbox = (thumbSrc: string, detailUrl: string | null): void => {
  const box = ensureLightbox()
  const img = box.querySelector('img')
  if (!img) return

  // Show the full-size version of the clicked thumbnail right away, falling back to the
  // thumbnail itself if the larger variant 404s.
  const full = stripSizePrefix(thumbSrc)
  img.onerror = () => {
    img.onerror = null
    img.src = thumbSrc
  }
  lbImages = [full]
  lbIndex = 0
  renderLightbox()
  box.classList.add('open')

  // Then pull the lot's full photo set from its detail page and upgrade to a carousel.
  if (detailUrl) {
    void fetchDetail(detailUrl).then((detail) => {
      if (!box.classList.contains('open') || detail.images.length === 0) return
      lbImages = detail.images
      const wanted = fileBase(thumbSrc)
      const found = detail.images.findIndex((u) => fileBase(u) === wanted)
      lbIndex = found >= 0 ? found : 0
      img.onerror = null
      renderLightbox()
    })
  }
}

const addPhotoPreviews = (container: ParentNode): void => {
  for (const img of container.querySelectorAll<HTMLImageElement>('img')) {
    if (img.dataset.eqbZoom || !img.src) continue
    if (img.naturalWidth && img.naturalWidth < 60) continue // skip icons/sprites
    img.dataset.eqbZoom = '1'

    const parent = img.parentElement
    if (!parent) continue
    parent.classList.add('eqb-img-wrap')

    const zoom = document.createElement('button')
    zoom.className = 'eqb-zoom'
    zoom.type = 'button'
    zoom.textContent = '🔍'
    zoom.title = 'Preview photos'
    zoom.addEventListener('click', (e) => {
      e.preventDefault() // don't follow the lot link the thumbnail sits inside
      e.stopPropagation()
      openLightbox(img.currentSrc || img.src, itemUrlFor(img))
    })
    parent.appendChild(zoom)
  }
}

// ===========================================================================
// Orchestration — run the DOM features, re-running as the lot list mutates
// ===========================================================================

let observer: MutationObserver | null = null
let debounceTimer = 0

// Wrap DOM writes so our own mutations don't retrigger the observer (avoids loops).
const enhance = (): void => {
  observer?.disconnect()
  try {
    // Scope every DOM change to the auction lot list. On pages without one (affiliate
    // profiles, account, home, single-lot detail, ...) we touch nothing, so the script
    // can't interfere with their links or layout.
    const lotList = document.querySelector<HTMLElement>('div.lot-list')
    if (lotList) {
      applyAllInBadges(lotList, getFees())
      applyBidCounts(lotList)
      addPhotoPreviews(lotList)
    }
  } catch (err) {
    console.error('[equip-bid] enhancement pass failed:', err)
  } finally {
    if (document.body && observer) {
      observer.observe(document.body, { childList: true, subtree: true })
    }
  }
  // Connection check reads (and may add its own banner) outside the paused window. Safe on
  // every page: getElementById returns null where there's no socket alert.
  checkConnection()
}

const scheduleEnhance = (): void => {
  window.clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(enhance, 250)
}

// ===========================================================================
// Tampermonkey menu: credentials + fee settings + auto-reload toggle
// ===========================================================================

const buildDialog = (innerHTML: string): HTMLDialogElement => {
  injectStyles()
  document.querySelectorAll('dialog.eqb-dialog').forEach((d) => d.remove())
  const dialog = document.createElement('dialog')
  dialog.className = 'eqb-dialog'
  dialog.innerHTML = innerHTML
  dialog.addEventListener('close', () => dialog.remove())
  document.body.appendChild(dialog)
  return dialog
}

const openCredentialsDialog = (): void => {
  const { email, password } = getCredentials()
  const dialog = buildDialog(`
    <form method="dialog">
      <h2>Equip-Bid Auto Login</h2>
      <p class="hint">Stored locally in Tampermonkey and re-submitted automatically when your session expires.</p>
      <label for="eqb-email">Email address</label>
      <input id="eqb-email" type="email" autocomplete="off" />
      <label for="eqb-password">Password</label>
      <input id="eqb-password" type="password" autocomplete="off" />
      <div class="buttons">
        <button type="button" class="clear">Clear saved</button>
        <div class="right-buttons">
          <button type="button" class="cancel">Cancel</button>
          <button type="submit" class="save">Save</button>
        </div>
      </div>
    </form>
  `)

  const emailInput = dialog.querySelector<HTMLInputElement>('#eqb-email')
  const passwordInput = dialog.querySelector<HTMLInputElement>('#eqb-password')
  if (emailInput) emailInput.value = email
  if (passwordInput) passwordInput.value = password

  dialog.querySelector<HTMLButtonElement>('button.cancel')?.addEventListener('click', () => dialog.close())
  dialog.querySelector<HTMLButtonElement>('button.clear')?.addEventListener('click', () => {
    clearCredentials()
    if (emailInput) emailInput.value = ''
    if (passwordInput) passwordInput.value = ''
  })
  dialog.querySelector<HTMLFormElement>('form')?.addEventListener('submit', () => {
    saveCredentials({ email: emailInput?.value.trim() ?? '', password: passwordInput?.value ?? '' })
    sessionStorage.removeItem(ATTEMPT_FLAG)
    void ensureLoggedIn()
  })

  dialog.showModal()
}

const openFeesDialog = (): void => {
  const fees = getFees()
  const dialog = buildDialog(`
    <form method="dialog">
      <h2>Equip-Bid Fee Settings</h2>
      <p class="hint">Used to compute the "all-in" cost shown next to each lot's next required bid.</p>
      <label for="eqb-premium">Buyer's premium (%)</label>
      <input id="eqb-premium" type="number" min="0" step="0.1" />
      <label for="eqb-handling">Handling per lot ($)</label>
      <input id="eqb-handling" type="number" min="0" step="0.01" />
      <label for="eqb-tax">Sales tax (%) — 0 to ignore</label>
      <input id="eqb-tax" type="number" min="0" step="0.1" />
      <div class="buttons">
        <div></div>
        <div class="right-buttons">
          <button type="button" class="cancel">Cancel</button>
          <button type="submit" class="save">Save</button>
        </div>
      </div>
    </form>
  `)

  const premium = dialog.querySelector<HTMLInputElement>('#eqb-premium')
  const handling = dialog.querySelector<HTMLInputElement>('#eqb-handling')
  const tax = dialog.querySelector<HTMLInputElement>('#eqb-tax')
  if (premium) premium.value = String(fees.premiumPct)
  if (handling) handling.value = String(fees.handling)
  if (tax) tax.value = String(fees.taxPct)

  dialog.querySelector<HTMLButtonElement>('button.cancel')?.addEventListener('click', () => dialog.close())
  dialog.querySelector<HTMLFormElement>('form')?.addEventListener('submit', () => {
    saveFees({
      premiumPct: Number.parseFloat(premium?.value ?? '') || 0,
      handling: Number.parseFloat(handling?.value ?? '') || 0,
      taxPct: Number.parseFloat(tax?.value ?? '') || 0,
    })
    scheduleEnhance()
  })

  dialog.showModal()
}

const withBody = (fn: () => void): void => {
  if (document.body) {
    fn()
  } else {
    window.addEventListener('DOMContentLoaded', fn, { once: true })
  }
}

GM_registerMenuCommand('Set equip-bid credentials', () => withBody(openCredentialsDialog))
GM_registerMenuCommand('Set equip-bid fee settings', () => withBody(openFeesDialog))
GM_registerMenuCommand(`${getAutoReload() ? 'Disable' : 'Enable'} auto-reload on connection loss`, () => {
  GM_setValue(AUTO_RELOAD_KEY, !getAutoReload())
  location.reload() // re-register the menu label
})

// ===========================================================================
// Boot
// ===========================================================================

void ensureLoggedIn() // runs at document-start

const start = (): void => {
  injectStyles()
  observer = new MutationObserver(scheduleEnhance)
  enhance()
}

withBody(start)
