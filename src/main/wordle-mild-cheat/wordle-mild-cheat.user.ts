// ==UserScript==
// @name         Wordle Mild Cheat
// @namespace    bricemciver
// @description  Will show you all of the valid words that still exist based on your guesses
// @author       Brice McIver
// @license      MIT
// @version      0.1
// @match        https://www.nytimes.com/games/wordle/index.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nytimes.com
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

{
  enum State {
    correct,
    diff,
    none,
  }

  type ProcessedCell = {
    letter: string;
    position: number;
    status: State;
  };

  const fullWordList: string[] = [];

  /**
   * Set an item into storage
   * @param key key to set
   * @param value value to set
   */
  const setItem = (key: string, value: any) => {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  };

  /**
   * Get an item from session storage
   * @param key key to get
   * @param defaultVal value to return if key doesnt exist
   */
  const getItem = (key: string, defaultVal: any) => {
    const val = window.sessionStorage.getItem(key);
    if (!val || val === 'undefined') return defaultVal;
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  };

  const callback: MutationCallback = (mutationList, mutationObserver) => {
    for (const mutation of mutationList) {
      if (
        mutation.addedNodes.length > 0 &&
        mutation.addedNodes[0].nodeType === Node.ELEMENT_NODE &&
        mutation.addedNodes[0].nodeName === 'SCRIPT'
      ) {
        const element = mutation.addedNodes[0] as HTMLScriptElement;
        if (element.src.startsWith('https://www.nytimes.com/games-assets/v2/wordle.')) {
          // Get the script
          GM.xmlHttpRequest({
            method: 'GET',
            url: element.src,
            onload(response) {
              // find a known valid word
              const sonic = response.responseText.indexOf('sonic');
              // find the beginning of array
              const begArray = response.responseText.lastIndexOf('[', sonic);
              // find the end of array
              const endArray = response.responseText.indexOf(']', sonic);
              // Get the word list from script
              const wordListStr = response.responseText.substring(begArray, endArray + 1);
              // Convert to an array object
              const tempArray = JSON.parse(wordListStr) as string[];
              fullWordList.push(...tempArray);
            },
          });
          mutationObserver.disconnect();
          break;
        }
      }
    }
  };

  const strToState: Record<string, State> = {
    absent: State.none,
    present: State.diff,
    correct: State.correct,
  };

  const createWordlistDialog = (): HTMLDialogElement => {
    const wordlist = document.createElement('dialog');
    wordlist.classList.add('dialog');
    wordlist.id = 'dialog';
    const header = document.createElement('h2');
    header.textContent = 'Word List';
    const list = document.createElement('ul');
    list.id = 'wordList';
    wordlist.appendChild(header);
    wordlist.appendChild(list);
    return wordlist;
  };

  const showWordlist = (curWords: string[]): void => {
    let wordList = document.getElementById('wordList');
    if (!wordList) {
      // load new styles
      const head = document.getElementsByTagName('head')[0];
      const style = document.createElement('style');
      head.appendChild(style);
      style.setAttribute('type', 'text/css');
      style.sheet?.insertRule(`.dialog li {
        display: block;
        padding: 2px 0px;
      }`);
      style.sheet?.insertRule(`.dialog ul {
        list-style: none;
        margin: 4px 0px;
        position: relative;
        padding: 0px;
      }`);
      style.sheet?.insertRule(`.dialog h2 {
        font-size: 0.6875rem;
        line-height: 1.5;
        letter-spacing: 0.08rem;
        font-family: "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-weight: 700;
        display: flex;
        align-items: center;
        border-radius: 5px;
        outline: 0px;
        width: 100%;
        justify-content: flex-start;
        transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
        text-decoration: none;
        color: rgb(111, 126, 140);
        margin-top: 8px;
        text-transform: uppercase;
      }`);
      style.sheet?.insertRule(`.dialog {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
        padding: 20px;
        background-color: #f2f2f2;
        border: 1px solid #ccc;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        font-family: Arial, sans-serif;
        color: #333;
        margin: 0 auto;
      }`);

      // create wordlist div
      const helpDiv = createWordlistDialog();

      // attach to body
      document.body.appendChild(helpDiv);

      wordList = document.getElementById('wordList');
    }
    if (wordList) {
      wordList.innerHTML = '';
      curWords.forEach(word => {
        const listItem = document.createElement('li');
        listItem.textContent = word;
        wordList?.appendChild(listItem);
      });
    }
    document.querySelector<HTMLDialogElement>('dialog#dialog')?.showModal();
  };

  const hideWordlist = (): void => {
    document.querySelector<HTMLDialogElement>('dialog#dialog')?.close();
  };

  /**
   * Examples of text found:
   * - 'A' (letter 1) is in a different spot
   * - 'S' (letter 1) is correct
   * - 'N' (letter 3) is incorrect
   */
  const processCell = (element: HTMLDivElement): ProcessedCell | null => {
    const label = element.ariaLabel;
    if (label) {
      // get letter and status from label
      const [letter, status] = label.split(' ');
      if (letter && letter !== 'empty') {
        let position = 0;
        const delay = element.parentElement?.style.animationDelay;
        if (delay) {
          const delayStr = RegExp(/\d+/).exec(delay);
          if (delayStr) {
            // convert to num
            position = parseInt(delayStr[0], 10) / 100;
          }
        }
        return {
          letter,
          position,
          status: strToState[status],
        };
      }
    }
    return null;
  };

  const extractGameBoard = () => {
    const boardState: ProcessedCell[] = [];
    const board = document.querySelector<HTMLDivElement>("div[class^='Board-module_board__']");
    if (board) {
      const tiles = board.querySelectorAll<HTMLDivElement>("div[class^='Tile-module_tile__']");
      tiles.forEach(tile => {
        // get the letter, position, and status
        const processedCell = processCell(tile);
        if (processedCell !== null) {
          boardState.push(processedCell);
        }
      });
    }
    return boardState;
  };

  const sortProcessedCells = (cells: ProcessedCell[]): ProcessedCell[] => {
    return cells.sort((a, b) => a.status - b.status);
  };

  const processGameBoard = (boardState: ProcessedCell[]) => {
    let tempWordList: string[] = [...fullWordList];

    // sort boardState so all correct answers are handled first, then diff, then none
    sortProcessedCells(boardState);

    boardState.forEach(item => {
      if (item.status === State.correct) {
        // process all the correct answers first to shrink word list
        tempWordList = tempWordList.filter(word => word.charAt(item.position - 1).toUpperCase() === item.letter.toUpperCase());
      } else if (item.status === State.diff) {
        // now eliminate words where 'diff' items appear in that spot
        // and where 'diff' item doesn't appear at all
        tempWordList = tempWordList.filter(
          word =>
            word.charAt(item.position - 1).toUpperCase() !== item.letter.toUpperCase() && word.indexOf(item.letter.toUpperCase()) !== -1
        );
      } else if (
        item.status === State.none &&
        !boardState.some(({ letter, status }) => (status === State.correct || status === State.diff) && letter === item.letter)
      ) {
        // need to be careful here, only remove 'none' if it wasn't previously 'correct' or 'diff' (since it could be a second occurance)
        tempWordList = tempWordList.filter(word => word.indexOf(item.letter.toUpperCase()) === -1);
      }
    });

    return tempWordList;
  };

  // create a new instance of `MutationObserver` named `observer`,
  // passing it a callback function
  const observer = new MutationObserver(callback);

  // call `observe()` on that MutationObserver instance,
  // passing it the element to observe, and the options object
  observer.observe(document, { subtree: true, childList: true });

  document.addEventListener(
    'keydown',
    event => {
      if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
      }

      if (event.key === '?') {
        event.preventDefault();
        showWordlist(processGameBoard(extractGameBoard()));
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        hideWordlist();
      }
    },
    true
  );
}
