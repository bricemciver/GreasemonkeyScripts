// Facebook Birthday Wisher
//
// Writes a birthday wish on the timeline of each friend whose birthday is today, from
// Facebook's own birthdays page.
//
// The point of the script is that the wishes should not read as generated: the message a
// person gets depends on who they are to you, nobody gets the same one twice, and two
// friends who share a birthday do not get the same words. See selectTemplate() and
// composeForDay() for how that is arranged.
//
// Posting to someone's timeline is not undoable, so the script defaults to reviewing
// drafts and to dry run. Both have to be turned off deliberately in settings.

import { deleteStoredValue, getStoredValue, setStoredValue } from '../../common/gmStorageUtils'

// ---------------------------------------------------------------------------
// Page contract
// ---------------------------------------------------------------------------
//
// Verified against the live page on 2026-08-24. Facebook regenerates its class names on
// every deploy, so everything below anchors on accessible names and page text instead.
// When this script breaks, re-check these five facts first:
//
//  1. Birthdays live at /friends/birthdays/. The old /events/birthdays/ page was removed
//     and now redirects to /events/discovery/ with "This Page Isn't Available".
//  2. The page has three sections, headed by the literal text "Today's birthdays",
//     "Recent birthdays" and "Upcoming birthdays". Only the first may ever be posted to.
//  3. One card is a <form>. Inside it: the composer is div[role=textbox][contenteditable]
//     and the submit control is div[role=button][aria-label="Post birthday message"].
//     Upcoming cards carry no such button, which is a useful second guard.
//  4. The friend's identity comes from the profile <a> in the card, above the form.
//  5. The composer is a Lexical editor (data-lexical-editor) that is PRE-FILLED with a
//     randomly chosen Facebook suggestion. It must be cleared, and it can only be
//     written to via a synthetic beforeinput event -- see setComposerText().

const BIRTHDAYS_PATH = '/friends/birthdays'
const TODAY_HEADING = "Today's birthdays"
const OTHER_HEADINGS = ['Recent birthdays', 'Upcoming birthdays']
const COMPOSER_SELECTOR = 'div[role="textbox"][contenteditable="true"]'
const POST_BUTTON_SELECTOR = 'div[role="button"][aria-label="Post birthday message"]'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * How you know someone. Drives which pool of messages they can draw from and which
 * emoji are considered fair game.
 */
type Tier = 'close' | 'family' | 'coworker' | 'default'

const TIERS: readonly Tier[] = ['close', 'family', 'coworker', 'default']

/** One friend with a birthday today, as scraped from the page. */
interface Friend {
  /** Stable identity, taken from the profile link. Display names are not unique. */
  id: string
  firstName: string
  fullName: string
}

/** A message that has been sent, remembered so it is not sent to that person again. */
interface HistoryEntry {
  year: number
  templateId: string
}

/** Message pools, one list of raw templates per tier. */
type Pools = Record<Tier, string[]>

interface Settings {
  mode: 'review' | 'auto'
  /** Do everything except click Post. The only safe way to test this script. */
  dryRun: boolean
  dailyCap: number
  minDelayMs: number
  maxDelayMs: number
  /** [startHour, endHour) in local time, or null for no restriction. */
  allowedHours: [number, number] | null
  /** A template is off-limits for a person if they got it within this many years. */
  noRepeatYears: number
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const KEY_POOLS = 'pools'
const KEY_TIERS = 'tiers'
const KEY_HISTORY = 'history'
const KEY_SALTS = 'salts'
const KEY_SKIP = 'skip'
const KEY_SETTINGS = 'settings'

const DEFAULT_SETTINGS: Settings = {
  mode: 'review',
  dryRun: true,
  dailyCap: 15,
  minDelayMs: 20_000,
  maxDelayMs: 90_000,
  allowedHours: null,
  noRepeatYears: 3,
}

// Templates support {first}, {full} and {emoji}, plus [this|or this] alternation.
// Alternation is expanded deterministically, so a handful of lines covers a lot of
// distinct messages without the pool needing to be long.
const DEFAULT_POOLS: Pools = {
  close: [
    'Happy birthday, {first}! {emoji} [Hope it is a great one|Hope you get spoiled today|Have an excellent day]!',
    'Happy birthday {first}! {emoji} [Let us celebrate soon|We need to catch up soon].',
    '{first}! Happy birthday {emoji} Hope the day treats you [well|right].',
    'Happy birthday to one of my favourite people. Have a [great|wonderful] one, {first}! {emoji}',
    'Another year on you, {first} {emoji} [Enjoy every bit of it|Make it count]!',
    'Happy birthday, {first}! {emoji} [Eat some cake for me|Have a slice of cake for me].',
  ],
  family: [
    'Happy birthday, {first}! {emoji} [Hope your day is wonderful|Wishing you a wonderful day].',
    'Happy birthday {first}! {emoji} [Love you|Thinking of you today]!',
    'Wishing you a [great|lovely] birthday, {first} {emoji}',
    'Happy birthday, {first}! {emoji} Hope the year ahead is [a good one|kind to you].',
  ],
  coworker: [
    'Happy birthday, {first}! [Hope you have a great day|Have a great one].',
    'Happy birthday {first}! {emoji}',
    'Happy birthday, {first} — [enjoy the day|hope it is a good one]!',
    'Wishing you a happy birthday, {first}!',
  ],
  default: [
    'Happy birthday, {first}! {emoji}',
    'Happy birthday {first}! [Hope you have a great day|Hope it is a good one].',
    'Happy birthday, {first} — [have a great one|enjoy the day]! {emoji}',
    'Wishing you a happy birthday, {first} {emoji}',
    'Happy birthday {first}! Hope the day is [a good one|treating you well].',
  ],
}

// Deliberately tiered: a coworker does not get the party emoji.
const TIER_EMOJI: Record<Tier, string[]> = {
  close: ['🎉', '🥳', '🎂', '🍻'],
  family: ['🎂', '❤️', '🎉'],
  coworker: ['🎂'],
  default: ['🎂', '🎉'],
}

const getPools = (): Pools => ({ ...DEFAULT_POOLS, ...getStoredValue<Partial<Pools>>(KEY_POOLS, {}) })
const getTierMap = (): Record<string, Tier> => getStoredValue<Record<string, Tier>>(KEY_TIERS, {})
const getHistory = (): Record<string, HistoryEntry[]> => getStoredValue<Record<string, HistoryEntry[]>>(KEY_HISTORY, {})
const getSalts = (): Record<string, number> => getStoredValue<Record<string, number>>(KEY_SALTS, {})
const getSkipList = (): string[] => getStoredValue<string[]>(KEY_SKIP, [])
const getSettings = (): Settings => ({ ...DEFAULT_SETTINGS, ...getStoredValue<Partial<Settings>>(KEY_SETTINGS, {}) })

const tierOf = (friendId: string): Tier => getTierMap()[friendId] ?? 'default'

const setTier = (friendId: string, tier: Tier): void => {
  const tiers = getTierMap()
  tiers[friendId] = tier
  setStoredValue(KEY_TIERS, tiers)
}

/**
 * Record that a message was sent. Call this only once a post is confirmed, never
 * optimistically -- the history is what stops a reload from posting to someone twice.
 */
const recordSent = (friendId: string, year: number, templateId: string): void => {
  const history = getHistory()
  const entries = history[friendId] ?? []
  entries.push({ year, templateId })
  history[friendId] = entries
  setStoredValue(KEY_HISTORY, history)
}

/** Advance a friend's salt so selectTemplate() lands somewhere else for them this year. */
const reroll = (friendId: string): void => {
  const salts = getSalts()
  salts[friendId] = (salts[friendId] ?? 0) + 1
  setStoredValue(KEY_SALTS, salts)
}

const toggleSkip = (friendId: string): boolean => {
  const skip = getSkipList()
  const next = skip.includes(friendId) ? skip.filter((id) => id !== friendId) : [...skip, friendId]
  setStoredValue(KEY_SKIP, next)
  return next.includes(friendId)
}

const resetHistory = (): void => {
  deleteStoredValue(KEY_HISTORY)
  deleteStoredValue(KEY_SALTS)
}

// ---------------------------------------------------------------------------
// Message engine (pure -- no DOM)
// ---------------------------------------------------------------------------

/** FNV-1a. Used for identity and for every "random" choice the script makes. */
const hash32 = (input: string): number => {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/**
 * A template's identity is its text, so editing a line in the settings pool retires the
 * old wording from everyone's history rather than silently rewriting what they received.
 */
const templateId = (text: string): string => hash32(text).toString(36)

const pick = <T>(items: T[], seed: string): T => items[hash32(seed) % items.length]

/**
 * Choose the template a friend gets this year.
 *
 * Two filters apply, in order of how much they matter:
 *
 * - Hard: anything the friend received within `noRepeatYears`. If that rules out the
 *   whole pool, the least recently used templates come back rather than repeating a
 *   recent one.
 * - Soft: `usedToday`, so two friends sharing a birthday do not get the same words. This
 *   yields if honouring it would leave nothing -- on a busy day some overlap is fine,
 *   sending nobody a message is not.
 *
 * The choice is a hash of the friend, the year and their reroll salt, so it is stable
 * across page loads: reloading re-renders the same message instead of reshuffling.
 */
const selectTemplate = (
  friendId: string,
  year: number,
  pool: string[],
  history: HistoryEntry[],
  salt: number,
  noRepeatYears: number,
  usedToday: ReadonlySet<string> = new Set(),
): string => {
  const recent = new Set(history.filter((e) => e.year > year - noRepeatYears).map((e) => e.templateId))
  let eligible = pool.filter((text) => !recent.has(templateId(text)))

  if (eligible.length === 0) {
    const lastUsed = new Map<string, number>()
    for (const entry of history) {
      lastUsed.set(entry.templateId, Math.max(lastUsed.get(entry.templateId) ?? 0, entry.year))
    }
    const staleness = pool.map((text) => lastUsed.get(templateId(text)) ?? 0)
    const oldest = Math.min(...staleness)
    eligible = pool.filter((_text, i) => staleness[i] === oldest)
  }

  const unused = eligible.filter((text) => !usedToday.has(templateId(text)))
  return pick(unused.length > 0 ? unused : eligible, `${friendId}:${year}:${salt}`)
}

/**
 * Expand `[a|b]` alternation and substitute {first}, {full} and {emoji}. Every choice is
 * seeded from `seed`, so the same inputs always produce the same message.
 */
const renderTemplate = (text: string, friend: Friend, emoji: string[], seed: string): string => {
  let group = 0
  const expanded = text.replace(/\[([^[\]]+)\]/g, (_match, body: string) => {
    group += 1
    return pick(body.split('|'), `${seed}:alt:${group}`)
  })

  return expanded
    .replace(/\{first\}/g, friend.firstName)
    .replace(/\{full\}/g, friend.fullName)
    .replace(/\{emoji\}/g, pick(emoji, `${seed}:emoji`))
    .replace(/\s+/g, ' ')
    .trim()
}

interface ComposedMessage {
  friend: Friend
  text: string
  templateId: string
}

/** The message a friend should get today, plus the template id to record if it sends. */
const composeMessage = (friend: Friend, year: number, usedToday?: ReadonlySet<string>): ComposedMessage => {
  const tier = tierOf(friend.id)
  const pools = getPools()
  const pool = pools[tier].length > 0 ? pools[tier] : pools.default
  const salt = getSalts()[friend.id] ?? 0
  const chosen = selectTemplate(
    friend.id,
    year,
    pool,
    getHistory()[friend.id] ?? [],
    salt,
    getSettings().noRepeatYears,
    usedToday,
  )

  return {
    friend,
    text: renderTemplate(chosen, friend, TIER_EMOJI[tier], `${friend.id}:${year}:${salt}`),
    templateId: templateId(chosen),
  }
}

/**
 * Compose for everyone at once. Prefer this over calling composeMessage() per friend:
 * it threads the set of templates already spoken for through the batch, which is what
 * keeps a day's worth of wishes from all sounding alike.
 */
const composeForDay = (friends: Friend[], year: number): ComposedMessage[] => {
  const usedToday = new Set<string>()
  return friends.map((friend) => {
    const composed = composeMessage(friend, year, usedToday)
    usedToday.add(composed.templateId)
    return composed
  })
}

/** Whether this friend should be left alone today. */
const shouldSkip = (friend: Friend, year: number): boolean =>
  getSkipList().includes(friend.id) || (getHistory()[friend.id] ?? []).some((e) => e.year === year)

// ---------------------------------------------------------------------------
// Page reading
// ---------------------------------------------------------------------------

const log = (message: string, data?: unknown): void => {
  if (data === undefined) {
    console.info(`[Birthday Wisher] ${message}`)
  } else {
    console.info(`[Birthday Wisher] ${message}`, data)
  }
}

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/** One posting target: a friend, the composer to write into and the button to press. */
interface BirthdayCard {
  friend: Friend
  form: HTMLFormElement
  composer: HTMLElement
  postButton: HTMLElement
}

/** Find a leaf element whose entire text is exactly `text`. */
const findHeading = (text: string): HTMLElement | null =>
  [...document.querySelectorAll<HTMLElement>('h2,h3,h4,span,div')].find(
    (el) => el.children.length === 0 && (el.textContent ?? '').trim() === text,
  ) ?? null

/**
 * The smallest ancestor of the "Today's birthdays" heading that actually contains cards.
 *
 * Climbing from the heading rather than selecting a container by class is what keeps
 * this working across deploys, and stopping at the first ancestor holding a <form> is
 * what keeps Recent and Upcoming out of scope. isTodayScope() re-checks that.
 */
const findTodayScope = (): HTMLElement | null => {
  const heading = findHeading(TODAY_HEADING)
  if (!heading) return null
  let scope: HTMLElement = heading
  while (scope.parentElement && !scope.querySelector('form')) {
    scope = scope.parentElement
  }
  return scope.querySelector('form') ? scope : null
}

/**
 * Refuse to treat a container as today's section if it has swallowed a neighbouring one.
 * Posting to "Recent birthdays" would write on timelines days after the fact, so this
 * check has to fail closed.
 */
const isTodayScope = (scope: HTMLElement): boolean => {
  const text = scope.innerText ?? ''
  return !OTHER_HEADINGS.some((heading) => text.includes(heading))
}

const isProfileLink = (a: HTMLAnchorElement): boolean => {
  try {
    const url = new URL(a.href)
    return url.pathname === '/profile.php' || /^\/[^/]+\/?$/.test(url.pathname)
  } catch {
    return false
  }
}

/** Usernames are stable; numeric ids are the fallback for people without one. */
const friendIdFromLink = (a: HTMLAnchorElement): string | null => {
  try {
    const url = new URL(a.href)
    if (url.pathname === '/profile.php') {
      const id = url.searchParams.get('id')
      return id ? `id:${id}` : null
    }
    return url.pathname.replace(/\//g, '') || null
  } catch {
    return null
  }
}

/** Walk up from a card's form to the profile link that names its owner. */
const friendForForm = (form: HTMLFormElement): Friend | null => {
  let node: HTMLElement = form
  for (let i = 0; i < 8 && node.parentElement; i += 1) {
    node = node.parentElement
    const link = [...node.querySelectorAll<HTMLAnchorElement>('a[role="link"]')].find(
      (a) => isProfileLink(a) && (a.innerText ?? '').trim().length > 0,
    )
    if (!link) continue

    const id = friendIdFromLink(link)
    const fullName = (link.innerText ?? '').trim()
    if (!id || !fullName) return null
    return { id, fullName, firstName: fullName.split(/\s+/)[0] }
  }
  return null
}

/** Every friend whose birthday is today, with the controls needed to wish them. */
const findTodayCards = (): BirthdayCard[] => {
  const scope = findTodayScope()
  if (!scope) return []
  if (!isTodayScope(scope)) {
    log('refusing to run: today’s section could not be isolated from Recent/Upcoming')
    return []
  }

  const cards: BirthdayCard[] = []
  for (const form of scope.querySelectorAll<HTMLFormElement>('form')) {
    const composer = form.querySelector<HTMLElement>(COMPOSER_SELECTOR)
    const postButton = form.querySelector<HTMLElement>(POST_BUTTON_SELECTOR)
    const friend = friendForForm(form)
    if (composer && postButton && friend) {
      cards.push({ friend, form, composer, postButton })
    }
  }
  return cards
}

// ---------------------------------------------------------------------------
// Page writing
// ---------------------------------------------------------------------------

/**
 * Replace the composer's contents.
 *
 * The composer is a Lexical editor, which reconciles the DOM from its own internal
 * state: assigning textContent or calling execCommand('insertText') is silently reverted
 * (verified 2026-08-24). A synthetic beforeinput event is the one thing it honours.
 * Selecting the whole editor first is what clears Facebook's pre-filled suggestion --
 * without it the text is appended to that suggestion instead of replacing it.
 */
const setComposerText = (composer: HTMLElement, text: string): void => {
  composer.focus()
  const range = document.createRange()
  range.selectNodeContents(composer)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
  composer.dispatchEvent(
    new InputEvent('beforeinput', {
      inputType: 'insertText',
      data: text,
      bubbles: true,
      cancelable: true,
      composed: true,
    }),
  )
}

const POST_CONFIRM_TIMEOUT_MS = 15_000

/**
 * Click Post and wait for the page to show that it took.
 *
 * Success is only ever inferred from the card going away or the composer emptying. An
 * ambiguous outcome returns false, and the caller stops the run: re-clicking a button
 * whose effect is unknown is how one wish becomes five.
 */
const postAndConfirm = async (card: BirthdayCard): Promise<boolean> => {
  card.postButton.click()
  const deadline = Date.now() + POST_CONFIRM_TIMEOUT_MS
  while (Date.now() < deadline) {
    await delay(500)
    if (!card.form.isConnected) return true
    if (!card.composer.isConnected) return true
    if ((card.composer.innerText ?? '').trim() === '') return true
  }
  return false
}

const randomBetween = (min: number, max: number): number => min + Math.floor(Math.random() * Math.max(1, max - min))

const withinAllowedHours = (settings: Settings): boolean => {
  if (!settings.allowedHours) return true
  const [start, end] = settings.allowedHours
  const hour = new Date().getHours()
  return start <= end ? hour >= start && hour < end : hour >= start || hour < end
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

const PANEL_ID = 'fbw-panel'

const injectStyles = (): void => {
  if (document.getElementById('fbw-styles')) return
  GM_addStyle(`
    #${PANEL_ID} {
      position: fixed; top: 72px; right: 16px; width: 380px; max-height: 78vh; overflow-y: auto;
      background: #fff; color: #1c1e21; border: 1px solid #ced0d4; border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,.2); z-index: 9999; font: 13px/1.4 system-ui, sans-serif;
    }
    #${PANEL_ID} header { padding: 10px 12px; border-bottom: 1px solid #ced0d4; font-weight: 600;
      display: flex; justify-content: space-between; align-items: center; }
    #${PANEL_ID} .fbw-mode { font-weight: 400; font-size: 11px; padding: 2px 6px; border-radius: 10px; background: #e4e6eb; }
    #${PANEL_ID} .fbw-mode.fbw-live { background: #ffe0e0; color: #b00; }
    #${PANEL_ID} .fbw-row { padding: 10px 12px; border-bottom: 1px solid #f0f2f5; }
    #${PANEL_ID} .fbw-name { font-weight: 600; display: flex; align-items: center; gap: 6px; }
    #${PANEL_ID} .fbw-name select { margin-left: auto; font-size: 11px; }
    #${PANEL_ID} textarea { width: 100%; box-sizing: border-box; margin-top: 6px; min-height: 46px;
      font: inherit; border: 1px solid #ced0d4; border-radius: 4px; padding: 5px; resize: vertical; }
    #${PANEL_ID} .fbw-actions { display: flex; gap: 6px; margin-top: 5px; align-items: center; }
    #${PANEL_ID} button { font: inherit; padding: 4px 9px; border: 1px solid #ced0d4; border-radius: 4px;
      background: #f0f2f5; cursor: pointer; }
    #${PANEL_ID} button.fbw-primary { background: #1877f2; color: #fff; border-color: #1877f2; font-weight: 600; }
    #${PANEL_ID} button:disabled { opacity: .5; cursor: default; }
    #${PANEL_ID} footer { padding: 10px 12px; display: flex; gap: 6px; align-items: center; position: sticky;
      bottom: 0; background: #fff; border-top: 1px solid #ced0d4; }
    #${PANEL_ID} .fbw-status { font-size: 11px; color: #65676b; margin-left: auto; text-align: right; }
    #${PANEL_ID} .fbw-skipped { opacity: .55; }
    #${PANEL_ID} .fbw-empty { padding: 16px 12px; color: #65676b; }
  `)
  const marker = document.createElement('meta')
  marker.id = 'fbw-styles'
  document.head?.appendChild(marker)
}

/** A panel row, holding the draft alongside the card it will be typed into. */
interface Row {
  card: BirthdayCard
  composed: ComposedMessage
  textarea: HTMLTextAreaElement
  include: HTMLInputElement
  status: HTMLElement
}

const buildPanel = (cards: BirthdayCard[]): void => {
  document.getElementById(PANEL_ID)?.remove()
  injectStyles()

  const settings = getSettings()
  const year = new Date().getFullYear()
  const panel = document.createElement('div')
  panel.id = PANEL_ID

  const liveClass = settings.dryRun ? '' : ' fbw-live'
  const modeLabel = settings.dryRun ? 'dry run' : `live · ${settings.mode}`
  panel.innerHTML = `
    <header>Birthday Wisher<span class="fbw-mode${liveClass}">${modeLabel}</span></header>
    <div class="fbw-rows"></div>
    <footer>
      <button class="fbw-primary fbw-run">${settings.dryRun ? 'Insert drafts' : 'Send all'}</button>
      <button class="fbw-settings">Settings</button>
      <span class="fbw-status"></span>
    </footer>
  `

  const rowsEl = panel.querySelector<HTMLElement>('.fbw-rows')
  const statusEl = panel.querySelector<HTMLElement>('.fbw-status')
  const runBtn = panel.querySelector<HTMLButtonElement>('.fbw-run')
  if (!rowsEl || !statusEl || !runBtn) return

  if (cards.length === 0) {
    rowsEl.innerHTML = '<div class="fbw-empty">No birthdays today.</div>'
    runBtn.disabled = true
  }

  const composedAll = composeForDay(
    cards.map((c) => c.friend),
    year,
  )
  const rows: Row[] = []

  cards.forEach((card, i) => {
    const composed = composedAll[i]
    const skipped = shouldSkip(card.friend, year)
    const rowEl = document.createElement('div')
    rowEl.className = skipped ? 'fbw-row fbw-skipped' : 'fbw-row'
    rowEl.innerHTML = `
      <div class="fbw-name">
        <input type="checkbox" class="fbw-include"${skipped ? '' : ' checked'}>
        <span></span>
        <select class="fbw-tier">${TIERS.map(
          (t) => `<option value="${t}"${t === tierOf(card.friend.id) ? ' selected' : ''}>${t}</option>`,
        ).join('')}</select>
      </div>
      <textarea class="fbw-text"></textarea>
      <div class="fbw-actions">
        <button class="fbw-reroll">Reroll</button>
        <button class="fbw-never">${getSkipList().includes(card.friend.id) ? 'Unskip' : 'Never wish'}</button>
        <span class="fbw-rowstatus fbw-status"></span>
      </div>
    `
    // Set the name as text, never as HTML -- it comes off the page.
    const nameEl = rowEl.querySelector<HTMLElement>('.fbw-name span')
    if (nameEl) nameEl.textContent = card.friend.fullName

    const textarea = rowEl.querySelector<HTMLTextAreaElement>('.fbw-text')
    const include = rowEl.querySelector<HTMLInputElement>('.fbw-include')
    const status = rowEl.querySelector<HTMLElement>('.fbw-rowstatus')
    if (!textarea || !include || !status) return
    textarea.value = composed.text
    if (skipped) status.textContent = getSkipList().includes(card.friend.id) ? 'on skip list' : 'already wished'

    rowEl.querySelector('.fbw-tier')?.addEventListener('change', (e) => {
      setTier(card.friend.id, (e.target as HTMLSelectElement).value as Tier)
      textarea.value = composeMessage(card.friend, year).text
    })
    rowEl.querySelector('.fbw-reroll')?.addEventListener('click', () => {
      reroll(card.friend.id)
      textarea.value = composeMessage(card.friend, year).text
    })
    rowEl.querySelector('.fbw-never')?.addEventListener('click', (e) => {
      const nowSkipped = toggleSkip(card.friend.id)
      ;(e.target as HTMLButtonElement).textContent = nowSkipped ? 'Unskip' : 'Never wish'
      include.checked = !nowSkipped
      rowEl.classList.toggle('fbw-skipped', nowSkipped)
      status.textContent = nowSkipped ? 'on skip list' : ''
    })

    rowsEl.appendChild(rowEl)
    rows.push({ card, composed, textarea, include, status })
  })

  runBtn.addEventListener('click', () => {
    runBtn.disabled = true
    void runQueue(rows, statusEl).finally(() => {
      runBtn.disabled = false
    })
  })
  panel.querySelector('.fbw-settings')?.addEventListener('click', openSettingsDialog)

  document.body.appendChild(panel)
}

/**
 * Work through the checked rows.
 *
 * Stops at the first unconfirmed post rather than carrying on, and paces itself between
 * sends. In dry run the composer is filled in and nothing is clicked, which is the only
 * way to see what would happen without it happening.
 */
const runQueue = async (rows: Row[], statusEl: HTMLElement): Promise<void> => {
  const settings = getSettings()
  const year = new Date().getFullYear()

  if (!settings.dryRun && !withinAllowedHours(settings)) {
    statusEl.textContent = 'outside allowed hours'
    return
  }

  const queue = rows.filter((row) => row.include.checked && !shouldSkip(row.card.friend, year))
  let sent = 0

  for (const row of queue) {
    if (sent >= settings.dailyCap) {
      statusEl.textContent = `daily cap (${settings.dailyCap}) reached`
      break
    }

    const text = row.textarea.value.trim()
    if (!text) {
      row.status.textContent = 'empty, skipped'
      continue
    }

    setComposerText(row.card.composer, text)
    await delay(400)

    const landed = (row.card.composer.innerText ?? '').trim()
    if (landed !== text) {
      row.status.textContent = 'could not fill composer'
      statusEl.textContent = 'stopped: composer rejected the text'
      break
    }

    if (settings.dryRun) {
      row.status.textContent = 'draft inserted (not sent)'
      continue
    }

    row.status.textContent = 'posting…'
    const confirmed = await postAndConfirm(row.card)
    if (!confirmed) {
      row.status.textContent = 'UNCONFIRMED'
      statusEl.textContent = 'stopped: could not confirm the post'
      break
    }

    // Only now is it safe to remember it: an optimistic write here would let a failed
    // send masquerade as a delivered one and silently skip the person next year.
    recordSent(row.card.friend.id, year, row.composed.templateId)
    row.status.textContent = 'sent'
    sent += 1

    if (row !== queue[queue.length - 1]) {
      const wait = randomBetween(settings.minDelayMs, settings.maxDelayMs)
      statusEl.textContent = `sent ${sent}, waiting ${Math.round(wait / 1000)}s…`
      await delay(wait)
    }
  }

  if (!statusEl.textContent?.startsWith('stopped')) {
    statusEl.textContent = settings.dryRun ? 'dry run complete' : `done · ${sent} sent`
  }
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

const DIALOG_ID = 'fbw-settings-dialog'

const openSettingsDialog = (): void => {
  document.getElementById(DIALOG_ID)?.remove()
  const settings = getSettings()
  const pools = getPools()

  const dialog = document.createElement('dialog')
  dialog.id = DIALOG_ID
  dialog.style.cssText =
    'width:min(560px,92vw);padding:16px;border:1px solid #ced0d4;border-radius:8px;font:13px system-ui,sans-serif'
  dialog.innerHTML = `
    <form method="dialog">
      <h3 style="margin:0 0 10px">Birthday Wisher settings</h3>
      <label><input type="checkbox" class="fbw-dry"${settings.dryRun ? ' checked' : ''}> Dry run (fill the box, never post)</label><br>
      <label style="display:inline-block;margin:8px 0">Mode
        <select class="fbw-modesel">
          <option value="review"${settings.mode === 'review' ? ' selected' : ''}>review before sending</option>
          <option value="auto"${settings.mode === 'auto' ? ' selected' : ''}>send automatically</option>
        </select>
      </label><br>
      <label>Daily cap <input type="number" class="fbw-cap" min="1" max="60" value="${settings.dailyCap}" style="width:60px"></label>
      <label style="margin-left:10px">Delay <input type="number" class="fbw-min" min="0" value="${Math.round(settings.minDelayMs / 1000)}" style="width:55px">–<input type="number" class="fbw-max" min="1" value="${Math.round(settings.maxDelayMs / 1000)}" style="width:55px">s</label>
      <label style="margin-left:10px">No repeat for <input type="number" class="fbw-years" min="1" max="20" value="${settings.noRepeatYears}" style="width:45px"> yrs</label>
      <p style="margin:12px 0 4px">Message pools — one template per line. Use {first}, {full}, {emoji} and [either|or].</p>
      ${TIERS.map(
        (t) =>
          `<label style="display:block;margin-bottom:6px">${t}<textarea class="fbw-pool" data-tier="${t}" style="width:100%;min-height:64px;font:12px monospace">${pools[t].join('\n')}</textarea></label>`,
      ).join('')}
      <div style="display:flex;gap:8px;margin-top:12px">
        <button value="save" class="fbw-save">Save</button>
        <button value="cancel" type="button" class="fbw-cancel">Cancel</button>
        <button value="reset" type="button" class="fbw-reset" style="margin-left:auto">Reset history</button>
      </div>
    </form>
  `

  dialog.addEventListener('close', () => dialog.remove())
  dialog.querySelector('.fbw-cancel')?.addEventListener('click', () => dialog.close())
  dialog.querySelector('.fbw-reset')?.addEventListener('click', () => {
    resetHistory()
    log('history and reroll salts cleared')
    dialog.close()
  })

  dialog.querySelector('form')?.addEventListener('submit', () => {
    const num = (sel: string, fallback: number): number => {
      const v = Number(dialog.querySelector<HTMLInputElement>(sel)?.value)
      return Number.isFinite(v) && v > 0 ? v : fallback
    }
    setStoredValue<Settings>(KEY_SETTINGS, {
      ...settings,
      dryRun: dialog.querySelector<HTMLInputElement>('.fbw-dry')?.checked ?? true,
      mode: (dialog.querySelector<HTMLSelectElement>('.fbw-modesel')?.value as Settings['mode']) ?? 'review',
      dailyCap: num('.fbw-cap', settings.dailyCap),
      minDelayMs: num('.fbw-min', settings.minDelayMs / 1000) * 1000,
      maxDelayMs: num('.fbw-max', settings.maxDelayMs / 1000) * 1000,
      noRepeatYears: num('.fbw-years', settings.noRepeatYears),
    })

    const nextPools = {} as Pools
    for (const area of dialog.querySelectorAll<HTMLTextAreaElement>('.fbw-pool')) {
      const tier = area.dataset.tier as Tier
      nextPools[tier] = area.value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    }
    setStoredValue(KEY_POOLS, nextPools)
    render()
  })

  document.body.appendChild(dialog)
  dialog.showModal()
}

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

const onBirthdaysPage = (): boolean => location.pathname.startsWith(BIRTHDAYS_PATH)

const render = (): void => {
  if (!onBirthdaysPage()) {
    document.getElementById(PANEL_ID)?.remove()
    return
  }
  const cards = findTodayCards()
  log(
    `found ${cards.length} birthday(s) today`,
    cards.map((c) => c.friend.fullName),
  )
  buildPanel(cards)

  const settings = getSettings()
  if (settings.mode === 'auto' && !settings.dryRun) {
    document.querySelector<HTMLButtonElement>(`#${PANEL_ID} .fbw-run`)?.click()
  }
}

/**
 * Facebook is a single-page app, so arriving at the birthdays page from elsewhere fires
 * no page load. Watch the URL and the DOM instead, and settle before rendering: the
 * cards stream in after the shell.
 */
const watch = (): void => {
  let lastPath = ''
  let settle: number | undefined

  const maybeRender = (): void => {
    const changed = location.pathname !== lastPath
    if (changed) {
      lastPath = location.pathname
      document.getElementById(PANEL_ID)?.remove()
    }
    if (!onBirthdaysPage()) return
    if (document.getElementById(PANEL_ID) && !changed) return

    window.clearTimeout(settle)
    settle = window.setTimeout(() => {
      if (onBirthdaysPage() && findTodayScope()) render()
    }, 600)
  }

  new MutationObserver(maybeRender).observe(document.body, { childList: true, subtree: true })
  window.addEventListener('popstate', maybeRender)
  maybeRender()
}

// Debug handle. Exposes the message engine so drafts can be inspected from the console
// (`birthdayWisher.composeMessage({id:'x',firstName:'Sam',fullName:'Sam Fox'}, 2026)`)
// without touching the page, and so the engine can be exercised outside the browser.
Object.assign(window, {
  birthdayWisher: {
    composeMessage,
    composeForDay,
    shouldSkip,
    reroll,
    recordSent,
    resetHistory,
    findTodayCards,
    settings: getSettings,
  },
})

GM_registerMenuCommand('Birthday wisher settings', openSettingsDialog)
watch()
