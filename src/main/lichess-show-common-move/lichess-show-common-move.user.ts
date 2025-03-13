import { Chess, fen, pgn, san } from 'chessops/index';

namespace LichessShowCommonMove {
  type ChessMove = {
    opening: string;
    moves: string;
  };

  let previousMoves = '';
  let observerCnt = 0;

  const observerOptions = {
    childList: true,
    subtree: true,
  };

  const createMoveBlock = () => {
    const moveBlock = document.getElementById('common-move-block');
    if (moveBlock) {
      return moveBlock;
    }
    const parent = document.querySelector('div.material.material-bottom');
    if (parent) {
      const moveBlock = document.createElement('div');
      moveBlock.id = 'common-move-block';
      parent.parentElement?.insertBefore(moveBlock, parent.nextSibling);
      return moveBlock;
    }
    console.error('Could not find parent element');
    return null;
  };

  const pgnToFen = (pgnString: string) => {
    try {
      // Parse the PGN string
      const parsedPgn = pgn.parsePgn(pgnString);

      // Get the first game from the parsed PGN
      // parsePgn returns an array of games
      const game = parsedPgn[0];

      // Initialize a new chess position
      const pos = Chess.default();

      // Play through all the moves in the mainline
      Array.from(game.moves.mainline()).forEach(move => {
        const parsed = san.parseSan(pos, move.san);
        if (!parsed) {
          throw new Error(`Invalid move: ${move.san}`);
        }
        pos.play(parsed);
      });

      // Return the final position as FEN
      return fen.makeFen(pos.toSetup());
    } catch (error) {
      throw new Error(`Error processing PGN: ${error}`);
    }
  };

  const handleResponse = (response: ChessMove, observer: MutationObserver) => {
    const moveBlock = createMoveBlock();
    if (response.moves) {
      if (moveBlock) {
        moveBlock.innerHTML = `<div>Opening: ${response.opening}</div><div>Move: ${response.moves}</div>`;
      }
    } else {
      observer.disconnect();
      if (moveBlock) {
        moveBlock.innerHTML = `<div>No more known moves</div>`;
      }
    }
  };

  const getMoveList = async (node: Element, observer: MutationObserver) => {
    // We need to get the full move list so go to parent element
    const parentElement = node.parentElement;
    if (!parentElement) {
      console.log('Could not find parent element. Unexpected error');
      return;
    }
    let currentMoves = '';
    for (const item of Array.from(parentElement.children)) {
      if (item.nodeName == 'I5Z') {
        currentMoves += `${item.textContent}.`;
      } else if (item.nodeName == 'KWDB') {
        currentMoves += `${item.textContent} `;
      }
    }
    if (currentMoves === previousMoves) {
      return;
    }
    console.log(`Moves: ${currentMoves}`);
    const parsedToFen = pgnToFen(currentMoves.trim());
    console.log(`Parsed Moves: ${parsedToFen}`);

    // check the cache first
    let cachedMoves = window.localStorage.getItem(parsedToFen);
    if (!cachedMoves) {
      // populate the cache
      // Now make the call
      const response = await GM.xmlHttpRequest({
        method: 'GET',
        url: `https://explorer.lichess.ovh/masters?fen=${parsedToFen}`,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        const parsedResponse = JSON.parse(response.responseText);
        const storedObject: ChessMove = {
          opening: parsedResponse.opening?.name ?? 'Unknown',
          moves: parsedResponse.moves.length > 0 ? parsedResponse.moves[0].uci : '',
        };
        const value = JSON.stringify(storedObject);
        console.log(`Stored Key-Value pair: Key:${parsedToFen}; Value:${value}`);
        window.localStorage.setItem(parsedToFen, value);
        cachedMoves = value;
      } else {
        console.error(`Error fetching moves: ${response.statusText}`);
      }
    }
    if (cachedMoves) {
      const movesObject = JSON.parse(cachedMoves);
      handleResponse(movesObject, observer);
    } else {
      console.error('No moves to handle');
    }
    previousMoves = currentMoves;
  };

  const getMovesDiv = (element: Element) => {
    observerCnt++;
    return element.querySelector('rm6, l4x') ? element : null;
  };

  const getMoves: MutationCallback = (records, observer): void => {
    // this observer is used to get the latest moves
    for (const record of records) {
      for (const item of Array.from(record.addedNodes)) {
        if (item.nodeType === Node.ELEMENT_NODE) {
          getMoveList(item as Element, observer);
        }
      }
    }
  };

  const findNode: MutationCallback = (records, observer): void => {
    // this observer is used to narrow down to the node we care about
    for (const record of records) {
      // filter down to the node we care about
      for (const item of Array.from(record.addedNodes)) {
        if (item.nodeType == Node.ELEMENT_NODE) {
          const retNode = getMovesDiv(item as Element);
          if (retNode) {
            observer.disconnect();
            const movesObserver = new MutationObserver(getMoves);
            movesObserver.observe(retNode, observerOptions);
            break;
          } else if (observerCnt > 75) {
            // We're not going to find it on this page so stop looking
            observer.disconnect();
            break;
          }
        }
      }
    }
  };

  export const main = (): void => {
    const observer = new MutationObserver(findNode);
    observer.observe(document.body, observerOptions);
  };
}
LichessShowCommonMove.main();
