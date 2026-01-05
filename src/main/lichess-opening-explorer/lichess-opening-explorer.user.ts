import { defaultGame, startingPosition } from 'chessops/pgn'
import { parseSan } from 'chessops/san'
import { makeUci } from 'chessops/util'

namespace LichessOpeningExplorer {
  const CACHE_NAME = 'lichess-cache'

  interface Moves {
    uci: string
    san: string
    averageRating: number
    white: number
    draws: number
    black: number
    game: string | null
    opening: {
      eco: string
      name: string
    } | null
  }

  interface Games {
    uci: string
    id: string
    winner: string | null
    black: {
      name: string
      rating: number
    }
    white: {
      name: string
      rating: number
    }
    year: number
    month: string
  }

  interface ChessDBResult {
    white: number
    draws: number
    black: number
    moves: Array<Moves>
    topGames: Array<Games>
    opening: {
      eco: string
      name: string | null
    }
  }

  const getLichessGame = (): string[] => {
    console.info('=== LICHESS GAME EXTRACTOR ===\n')

    // Find the move list container
    const moveContainer = document.querySelector('rm6, l4x')
    if (!moveContainer) {
      return []
    }

    // Extract all moves in Standard Algebraic Notation (SAN)
    const moveElements = moveContainer.querySelectorAll('kwdb')
    // Use chessops library to parse moves
    const game = defaultGame()
    const pos = startingPosition(game.headers).unwrap()
    const uciMoves: string[] = []

    for (const moveEl of moveElements) {
      const move = moveEl.textContent?.trim()
      if (move) {
        const chessMove = parseSan(pos, move)
        if (!chessMove) {
          console.warn(`Illegal move detected: "${move}"`)
          break
        }
        uciMoves.push(makeUci(chessMove))
        pos.play(chessMove)
      }
    }

    console.info('Moves found:', pos.fullmoves)
    return uciMoves
  }

  const fetchWithCache = async (url: string) => {
    try {
      const cache = await caches.open(CACHE_NAME)
      const cachedResponse = await cache.match(url)

      // Return cached response if it exists (no expiration check)
      if (cachedResponse) {
        console.log('Cache hit:', url)
        return cachedResponse
      }

      // Cache miss - fetch fresh data using GM.xmlHttpRequest
      console.log('Cache miss, fetching:', url)
      const response = await GM.xmlHttpRequest({
        method: 'GET',
        url: url,
        responseType: 'json',
      })

      // Store as JSON string in cache
      const status = response.responseText === 'bad request: illegal uci' ? 400 : 200
      const statusText = status === 200 ? 'OK' : 'Bad Request'
      const cacheableResponse = new Response(response.responseText, {
        status,
        statusText,
        headers: { 'Content-Type': 'application/json' },
      })

      await cache.put(url, cacheableResponse)

      // Return the cached response
      return await cache.match(url)
    } catch (error) {
      console.error('Fetch error:', error)
      throw error
    }
  }

  const updateMoveDisplay = (move: string | null) => {
    // Create a new container and place it into the grid
    let container = document.getElementById('lichess-top-move')
    if (!container) {
      container = document.createElement('div')
      container.id = 'lichess-top-move'
      container.style.marginTop = '8px'
      container.style.display = 'flex'
      container.style.justifyContent = 'center'
      container.style.fontSize = '14px'
      container.style.fontWeight = 'bold'
      container.style.flexFlow = 'row nowrap'
      container.style.alignItems = 'center'
      container.style.gridArea = 'voice'
      document.body.prepend(container)
    }

    container.textContent = move ? `Top Move: ${move}` : ''
  }

  export const main = async () => {
    console.info('Lichess Opening Explorer script loaded.')
    // Watch for mutations to detect when a move has been made
    const targetNode = document.body
    const config = { childList: true, subtree: true }

    const callback: MutationCallback = async (mutationsList, internalObserver) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement && node.matches('rm6, l4x, kwdb')) {
              console.info('Move list updated, extracting position...')
              const result = getLichessGame()
              if (result.length > 0) {
                const url = `https://explorer.lichess.ovh/masters?since=2008&play=${result.join(',')}`
                const data = await fetchWithCache(url)
                if (data?.ok) {
                  const chessDBResult = (await data.json()) as ChessDBResult
                  if (chessDBResult.moves.length === 0) {
                    console.info('No moves found in database for this position.')
                    updateMoveDisplay(null)
                    internalObserver.disconnect()
                    return
                  }
                  updateMoveDisplay(chessDBResult.moves[0].uci)
                  console.info('Top Move:', chessDBResult.moves[0].uci)
                } else {
                  console.warn('Failed to fetch data from Lichess Opening Explorer.')
                }
              }
            }
          }
        }
      }
    }

    const observer = new MutationObserver(callback)
    observer.observe(targetNode, config)

    // Initial extraction
    const initialResult = getLichessGame()
    if (initialResult.length > 0) {
      const url = `https://explorer.lichess.ovh/masters?since=2008&play=${initialResult.join(',')}`
      const data = await fetchWithCache(url)
      if (data) {
        const chessDBResult = (await data.json()) as ChessDBResult
        if (chessDBResult.moves.length > 0) {
          updateMoveDisplay(chessDBResult.moves[0].uci)
          console.info('Top Move:', chessDBResult.moves[0].uci)
        }
      }
    }
  }
}

LichessOpeningExplorer.main()
