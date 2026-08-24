import { defaultGame, startingPosition } from 'chessops/pgn'
import { parseSan } from 'chessops/san'
import { makeUci } from 'chessops/util'

const CACHE_NAME = 'lichess-cache'
const EXPLORER = 'https://explorer.lichess.org/masters'

interface Moves {
  uci: string
  san: string
}
interface ChessDBResult {
  moves: Array<Moves>
  opening: { eco: string; name: string | null } | null
}

// Lichess rotates the custom element names of its move list between builds
// (rm6/kwdb -> i5d/z7yx), so locate the list by content instead of by tag.
const SAN_RE = /^(?:O-O(?:-O)?|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=?[QRBN])?)[+#]?[!?]{0,2}$/

interface MoveEntry {
  el: Element
  san: string
}

// The move list comes in two shapes. A game in progress renders each move as a
// bare leaf (`<z7yx>Nf3</z7yx>`); the analysis board and the review page of a
// finished game wrap it (`<move p="1"><san>e4</san></move>`), interleaved with
// `<index>` elements holding the move number.
const sanOf = (el: Element): string | null => {
  let text: string
  if (el.childElementCount === 0) text = el.textContent?.trim() ?? ''
  else {
    // A direct child, not a descendant: a variation is a `<lines>` subtree
    // whose nested <san> would otherwise be read as a move of the line that
    // contains it.
    const san = el.querySelector(':scope > san')
    if (!san) return null
    text = san.textContent?.trim() ?? ''
  }
  return SAN_RE.test(text) ? text : null
}

const entriesIn = (parent: Element): MoveEntry[] => {
  const entries: MoveEntry[] = []
  for (const child of parent.children) {
    const san = sanOf(child)
    if (san !== null) entries.push({ el: child, san })
  }
  return entries
}

// Returns the moves up to the one on the board, [] at the starting position, or
// null when the position on screen cannot be determined.
const getPlayedMoves = (): string[] | null => {
  const scope = document.querySelector('main') ?? document.body
  let best: MoveEntry[] = []
  for (const candidate of scope.querySelectorAll('*')) {
    const entries = entriesIn(candidate)
    if (entries.length > best.length) best = entries
  }

  // Lichess marks the move being viewed; everything after it is ahead of the
  // board. The analysis board names that class `active`. The round page uses a
  // build-specific name, but marks exactly one move with it -- requiring
  // exactly one keeps a lone computer-analysis annotation (`blunder` and
  // friends, which only ever appear on the analysis board) from being mistaken
  // for the marker.
  let viewing = best.findIndex((entry) => entry.el.classList.contains('active'))
  if (viewing === -1) {
    const marked = best.filter((entry) => entry.el.className !== '')
    if (marked.length === 1) viewing = best.indexOf(marked[0])
  }

  if (viewing === -1) {
    // The marked move sits inside a variation, so the main line no longer
    // describes the board.
    const active = scope.querySelector('move.active')
    if (active && !best.some((entry) => entry.el === active)) return null
    // No move is marked: the board is rewound to the starting position.
    return []
  }
  return best.slice(0, viewing + 1).map((entry) => entry.san)
}

const toUci = (played: string[]): string[] | null => {
  if (played.length === 0) return []

  const game = defaultGame()
  const pos = startingPosition(game.headers).unwrap()
  const uciMoves: string[] = []

  for (const move of played) {
    const chessMove = parseSan(pos, move)
    if (!chessMove) {
      // A truncated move list would query the explorer for the wrong position.
      console.warn(`Illegal move detected: "${move}"`)
      return null
    }
    uciMoves.push(makeUci(chessMove))
    pos.play(chessMove)
  }
  return uciMoves
}

const fetchExplorer = async (url: string): Promise<ChessDBResult | null> => {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(url)
  if (cached) return (await cached.json()) as ChessDBResult

  const response = await GM.xmlHttpRequest({ method: 'GET', url })
  if (response.status < 200 || response.status >= 300) {
    console.warn('Opening explorer returned', response.status)
    return null
  }
  let parsed: ChessDBResult
  try {
    parsed = JSON.parse(response.responseText) as ChessDBResult
  } catch {
    console.warn('Opening explorer returned a non-JSON body')
    return null
  }
  // Only successful, well-formed responses are cached; the cache never expires.
  await cache.put(url, new Response(response.responseText, { headers: { 'Content-Type': 'application/json' } }))
  return parsed
}

const getContainer = (): HTMLElement => {
  let container = document.getElementById('lichess-top-move')
  if (!container) {
    container = document.createElement('div')
    container.id = 'lichess-top-move'
    container.style.cssText =
      'margin:8px 0;display:flex;justify-content:center;align-items:center;font-size:14px;font-weight:bold;'
  }
  // Lichess mounts these panels after the script's first run, so the readout is
  // re-homed as they appear. `main` is deliberately not a candidate: on the
  // analysis board it is a grid, which collapses a child it has no area for
  // into an unreadable sliver over the board.
  const host = document.querySelector('.round__app__table, .analyse__tools, .analyse__controls') ?? document.body
  if (container.parentElement !== host) host.appendChild(container)
  return container
}

const updateMoveDisplay = (text: string) => {
  const container = getContainer()
  // Rewriting the same text would trip the observer and refresh in a loop.
  if (container.textContent !== text) container.textContent = text
}

// Only the newest in-flight lookup is allowed to paint.
let generation = 0

const refresh = async () => {
  const current = ++generation
  const played = getPlayedMoves()
  if (played === null) {
    // Variations are not looked up, but leaving the main line's reading on
    // screen would attribute it to a position that is not being shown.
    updateMoveDisplay('Off the main line')
    return
  }
  const moves = toUci(played)
  if (moves === null) return
  const url = `${EXPLORER}?since=2008&play=${moves.join(',')}`
  let data: ChessDBResult | null
  try {
    data = await fetchExplorer(url)
  } catch (error) {
    console.error('Opening explorer lookup failed:', error)
    return
  }
  if (current !== generation) return
  if (!data) return
  const top = data.moves[0]
  updateMoveDisplay(top ? `Top master move: ${top.san} (${top.uci})` : 'Not in the masters book')
}

const main = () => {
  console.info('Lichess Opening Explorer script loaded.')
  let timer: ReturnType<typeof setTimeout> | undefined
  const observer = new MutationObserver(() => {
    clearTimeout(timer)
    timer = setTimeout(() => void refresh(), 150)
  })
  observer.observe(document.body, { childList: true, subtree: true, characterData: true })
  void refresh()
}

main()
