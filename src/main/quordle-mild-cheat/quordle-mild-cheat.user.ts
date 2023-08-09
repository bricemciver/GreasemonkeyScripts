// ==UserScript==
// @name         Quordle Mild Cheat
// @namespace    https://github.com/bricemciver/
// @version      0.1
// @license      MIT
// @description  Get hints based on the words you've already tried
// @author       bricemciver
// @match        https://www.merriam-webster.com/games/quordle/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=merriam-webster.com
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// ==/UserScript==
{
  type ProcessedCell = {
    letter: string;
    position: number;
    status: 'diff' | 'correct' | 'none';
  };

  const wordBankRegEx = /wordBank:\s*"([^"]*)"/;
  const allowedRegEx = /allowed:\s*"([^"]*)"/;
  const wordBankWords: string[] = [];
  const allowedWords: string[] = [];

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

  const findAllowedWords = () => {
    // see if we need to retrieve
    wordBankWords.push(...getItem('wordBank', []));
    allowedWords.push(...getItem('allowed', []));
    if (!wordBankWords.length || !allowedWords.length) {
      const script = document.querySelector<HTMLScriptElement>("script[type='module']");

      // Get the script
      if (script) {
        GM.xmlHttpRequest({
          method: 'GET',
          url: script.src,
          onload(response) {
            const text = response.responseText;
            // get wordBank words
            const wordBankMatches = RegExp(wordBankRegEx).exec(text);
            if (wordBankMatches && wordBankMatches.length > 1) {
              wordBankWords.push(...wordBankMatches[1].split(' '));
            }
            // get allowed words
            const allowedMatches = RegExp(allowedRegEx).exec(text);
            if (allowedMatches && allowedMatches.length > 1) {
              allowedWords.push(...allowedMatches[1].split(' '));
            }
            // store in session so we don't retrieve every time
            setItem('wordBank', wordBankWords);
            setItem('allowed', allowedWords);
          },
        });
      }
    }
  };

  const createWordlistDialog = () => {
    const wordlist = document.createElement('dialog');
    wordlist.classList.add('dialog');
    wordlist.id = 'dialog';
    const header = document.createElement('h2');
    header.textContent = 'Word List';
    wordlist.appendChild(header);
    const listContainer = document.createElement('div');
    listContainer.id = 'wordList';
    wordlist.appendChild(listContainer);
    return wordlist;
  };

  const createBoardList = (wordList: HTMLElement, board: string[], title: string) => {
    const boardHeader = document.createElement('h2');
    boardHeader.textContent = title;
    wordList.appendChild(boardHeader);
    const list = document.createElement('ul');
    board.forEach(word => {
      const listItem = document.createElement('li');
      listItem.textContent = word;
      if (wordBankWords.some(item => item === word)) {
        listItem.classList.add('font-bold');
      }
      list.appendChild(listItem);
    });
    wordList.appendChild(list);
  };

  const showWordlist = (...boards: string[][]) => {
    let wordList = document.getElementById('wordList');
    if (!wordList) {
      // load new styles
      const head = document.getElementsByTagName('head')[0];
      const style = document.createElement('style');
      head.appendChild(style);
      style.setAttribute('type', 'text/css');
      if (style.sheet) {
        style.sheet.insertRule(`.dialog li {
            display: block;
            padding: 2px 0px;
        }`);
        style.sheet.insertRule(`.dialog ul {
            list-style: none;
            margin: 4px 0px;
            position: relative;
            padding: 0px;
        }`);
        style.sheet.insertRule(`.dialog h2 {
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
        style.sheet.insertRule(`.dialog {
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
      }

      // create wordlist div
      const helpDiv = createWordlistDialog();

      // attach to body
      document.body.appendChild(helpDiv);
      wordList = document.getElementById('wordList');
    }

    if (wordList) {
      wordList.innerHTML = '';
    }

    // add boards
    boards.forEach((board, index) => {
      if (wordList) {
        createBoardList(wordList, board, `Board ${index + 1}`);
      }
    });

    const dialog = document.querySelector<HTMLDialogElement>('dialog#dialog');
    if (dialog) {
      dialog.showModal();
    }
  };

  const hideWordlist = () => {
    const dialog = document.querySelector<HTMLDialogElement>('dialog#dialog');
    if (dialog) {
      dialog.close();
    }
  };

  const addListeners = () => {
    document.addEventListener(
      'keydown',
      function (event) {
        if (event.defaultPrevented) {
          return; // Do nothing if the event was already processed
        }
        if (event.key === '?') {
          event.preventDefault();
          const boardArray: string[][] = [];
          for (let i = 1; i < 5; i++) {
            boardArray.push(processGameBoard(extractGameBoard(i)));
          }
          showWordlist(...boardArray);
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          hideWordlist();
        }
      },
      true
    );
  };

  /**
   * Examples of text found:
   * - 'A' (letter 1) is in a different spot
   * - 'S' (letter 1) is correct
   * - 'N' (letter 3) is incorrect
   */
  const cellRegEx = /'(\w+)' \(letter (\d+)\) is (in a different spot|correct|incorrect)/;
  const processCell = (element: HTMLDivElement): ProcessedCell | null => {
    const label = element.ariaLabel;
    if (label) {
      const match = RegExp(cellRegEx).exec(label);
      if (match && match.length > 3) {
        const letter = match[1];
        const position = parseInt(match[2], 10);
        const status = match[3];
        return {
          letter,
          position,
          status: statusToBasic[status],
        };
      }
    }
    return null;
  };

  const statusToBasic: Record<string, 'diff' | 'correct' | 'none'> = {
    'in a different spot': 'diff',
    correct: 'correct',
    incorrect: 'none',
  };

  const extractGameBoard = (boardNum: number) => {
    const boardState: ProcessedCell[] = [];
    const board = document.querySelector<HTMLDivElement>(`div[role="table"][aria-label="Game Board ${boardNum}"]`);
    // get rows
    if (board) {
      const rows = board.querySelectorAll<HTMLDivElement>('div[role="row"]');
      rows.forEach(row => {
        // get all cells in a row
        const cells = row.querySelectorAll<HTMLDivElement>('div[role="cell"]');
        cells.forEach(cell => {
          // get the letter, position, and status
          const processedCell = processCell(cell);
          if (processedCell !== null) {
            boardState.push(processedCell);
          }
        });
      });
    }
    return boardState;
  };

  const sortProcessedCells = (cells: ProcessedCell[]): ProcessedCell[] => {
    const statusOrder: Record<string, number> = {
      correct: 0,
      diff: 1,
      none: 2,
    };

    return cells.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  };

  const processGameBoard = (boardState: ProcessedCell[]) => {
    let tempWordList: string[] = [...wordBankWords, ...allowedWords];

    // sort boardState so all correct answers are handled first, then diff, then none
    sortProcessedCells(boardState);

    boardState.forEach(item => {
      if (item.status === 'correct') {
        // process all the correct answers first to shrink word list
        tempWordList = tempWordList.filter(word => word.charAt(item.position - 1).toUpperCase() === item.letter.toUpperCase());
      } else if (item.status === 'diff') {
        // now eliminate words where 'diff' items appear in that spot
        // and where 'diff' item doesn't appear at all
        tempWordList = tempWordList.filter(
          word =>
            word.charAt(item.position - 1).toUpperCase() !== item.letter.toUpperCase() && word.indexOf(item.letter.toUpperCase()) !== -1
        );
      } else if (
        item.status === 'none' &&
        !boardState.some(({ letter, status }) => (status === 'correct' || status === 'diff') && letter === item.letter)
      ) {
        // need to be careful here, only remove 'none' if it wasn't previously 'correct' or 'diff' (since it could be a second occurance)
        tempWordList = tempWordList.filter(word => word.indexOf(item.letter.toUpperCase()) === -1);
      } else if (
        item.status === 'none' &&
        boardState.some(({ letter, status }) => (status === 'correct' || status === 'diff') && letter === item.letter)
      ) {
        // edge case; remove words with duplicate letters if status is none but other status of diff or correct exists
        // this will not handle words with 3 of the same letter correctly
        tempWordList = tempWordList.filter(word => word.indexOf(item.letter.toUpperCase()) === word.lastIndexOf(item.letter.toUpperCase()));
      }
    });

    return tempWordList;
  };

  (function () {
    'use strict';

    // Retrieve (locally or from site) the word lists
    findAllowedWords();

    // add listeners
    addListeners();
  })();
}
