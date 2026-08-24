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

const getMoveElements = (): Element[] => {
  const known = document.querySelector('rm6, l4x')
  const kwdb = known?.querySelectorAll('kwdb')
  if (kwdb?.length) return [...kwdb]

  const scope = document.querySelector('main') ?? document.body
  let best: Element[] = []
  for (const candidate of scope.querySelectorAll('*')) {
    const moves = [...candidate.children].filter(
      (child) => child.childElementCount === 0 && SAN_RE.test(child.textContent?.trim() ?? ''),
    )
    if (moves.length > best.length) best = moves
  }
  // Lichess marks the move being viewed with a class; everything after it is
  // ahead of the board, so stop there.
  const viewing = best.findIndex((el) => el.className !== '')
  // No move is marked: the board is rewound to the starting position.
  return viewing === -1 ? [] : best.slice(0, viewing + 1)
}

const getLichessGame = (): string[] | null => {
  const moveElements = getMoveElements()
  if (moveElements.length === 0) return []

  const game = defaultGame()
  const pos = startingPosition(game.headers).unwrap()
  const uciMoves: string[] = []

  for (const moveEl of moveElements) {
    const move = moveEl.textContent?.trim()
    if (!move) continue
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
  if (container) return container
  container = document.createElement('div')
  container.id = 'lichess-top-move'
  container.style.cssText =
    'margin:8px 0;display:flex;justify-content:center;align-items:center;font-size:14px;font-weight:bold;'
  const host = document.querySelector('.round__app__table, .analyse__tools, main') ?? document.body
  host.appendChild(container)
  return container
}

const updateMoveDisplay = (move: string | null) => {
  getContainer().textContent = move ? `Top master move: ${move}` : 'Not in the masters book'
}

// Only the newest in-flight lookup is allowed to paint.
let generation = 0

const refresh = async () => {
  const current = ++generation
  const moves = getLichessGame()
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
  updateMoveDisplay(top ? `${top.san} (${top.uci})` : null)
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
