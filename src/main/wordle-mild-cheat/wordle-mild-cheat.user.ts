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
    unknown,
    absent,
    present,
    correct,
  }

  const fullWordList: string[] = [];
  let currentWordList: string[] = [];
  const letterMap: Record<string, number[]> = {};
  const wordState: Record<number, string[]> = {
    0: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
    1: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
    2: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
    3: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
    4: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
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

  const strToState = (value: string | null): State => {
    switch (value) {
      case 'absent':
        return State.absent;
      case 'present':
        return State.present;
      case 'correct':
        return State.correct;
      default:
        return State.unknown;
    }
  };

  const filterWordList = (): void => {
    // make sure we have a word list
    if (fullWordList.length > 0) {
      currentWordList = new Array(...fullWordList);
      // filter out words by each letter position
      for (let i = 0; i < 5; i++) {
        currentWordList = currentWordList.filter(word => wordState[i].includes(word.charAt(i)));
      }
      // filter out words with letter in invalid position
      for (const entry in letterMap) {
        if (Object.prototype.hasOwnProperty.call(letterMap, entry)) {
          currentWordList = currentWordList.filter(word => letterMap[entry].some(pos => word.charAt(pos) === entry));
        }
      }
    }
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

  const showWordlist = (): void => {
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
      currentWordList.forEach(word => {
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

  const buildLetterState = (): void => {
    // examine board for letter state
    const board = document.querySelector("div[class^='Board-module_board__']");
    if (board) {
      const tiles = board.querySelectorAll("div[class^='Tile-module_tile__']");
      tiles.forEach(tile => {
        const state = strToState(tile.getAttribute('data-state'));
        const letter = tile.textContent;
        let pos: number | null = null;
        const delay = tile.parentElement?.style.animationDelay;
        if (delay) {
          const delayStr = RegExp(/\d+/).exec(delay);
          if (delayStr) {
            // convert to num
            pos = parseInt(delayStr[0], 10) / 100;
          }
        }
        if (letter) {
          switch (state) {
            case State.absent: {
              // remove this letter for all positions
              for (let i = 0; i < 5; i++) {
                wordState[i] = wordState[i].filter(item => item !== letter);
              }
              break;
            }
            case State.correct: {
              // remove all other letters for current position
              if (pos !== null) {
                wordState[pos] = wordState[pos].filter(item => item === letter);
              }
              // remove from letter map
              for (const entry in letterMap) {
                if (Object.prototype.hasOwnProperty.call(letterMap, entry)) {
                  letterMap[entry] = letterMap[entry].filter(item => item !== pos);
                }
              }
              delete letterMap[letter];
              break;
            }
            case State.present: {
              // remove this letter for current position and keep track of possible positions
              if (pos !== null) {
                wordState[pos] = wordState[pos].filter(item => item !== letter);
              }
              for (let i = 0; i < 5; i++) {
                if (wordState[i].some(item => item === letter)) {
                  if (!(letter in letterMap)) {
                    letterMap[letter] = [];
                  }
                  letterMap[letter].push(i);
                }
              }
              break;
            }
          }
        }
      });
    }
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
        buildLetterState();
        filterWordList();
        showWordlist();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        hideWordlist();
      }
    },
    true
  );
}
