// ==UserScript==
// @name         Octordle Mild Cheat
// @namespace    bricemciver
// @version      0.1
// @description  Give you hints for each game board based on valid remaining words
// @author       bricemciver
// @match        https://www.britannica.com/games/octordle*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=britannica.com
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

"use strict";
(() => {
  // src/main/octordle-mild-cheat/octordle-mild-cheat.user.ts
  var wordBankRegEx = /"([^"]*\bsonic\b[^"]*)"/;
  var allowedRegEx = /"([^"]*\bcorky\b[^"]*)"/;
  var wordBankWords = [];
  var allowedWords = [];
  var setItem = (key, value) => {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  };
  var getItem = (key, defaultVal) => {
    const val = window.sessionStorage.getItem(key);
    if (!val || val === "undefined")
      return defaultVal;
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  };
  var callback = (mutationList, mutationObserver) => {
    for (const mutation of mutationList) {
      if (mutation.addedNodes.length > 0 && mutation.addedNodes[0].nodeType === Node.ELEMENT_NODE && mutation.addedNodes[0].nodeName === "SCRIPT") {
        const element = mutation.addedNodes[0];
        if (element.type === "module") {
          GM.xmlHttpRequest({
            method: "GET",
            url: element.src,
            onload(response) {
              const text = response.responseText;
              const wordBankMatches = RegExp(wordBankRegEx).exec(text);
              if (wordBankMatches && wordBankMatches.length > 1) {
                wordBankWords.push(...wordBankMatches[1].split(" ").map((word) => word.toUpperCase()));
              }
              const allowedMatches = RegExp(allowedRegEx).exec(text);
              if (allowedMatches && allowedMatches.length > 1) {
                allowedWords.push(...allowedMatches[1].split(" ").map((word) => word.toUpperCase()));
              }
              setItem("wordBank", wordBankWords);
              setItem("allowed", allowedWords);
            }
          });
          mutationObserver.disconnect();
          break;
        }
      }
    }
  };
  var findAllowedWords = () => {
    wordBankWords.push(...getItem("wordBank", []));
    allowedWords.push(...getItem("allowed", []));
    if (!wordBankWords.length || !allowedWords.length) {
      const observer = new MutationObserver(callback);
      observer.observe(document, { subtree: true, childList: true });
    }
  };
  var createWordlistDialog = () => {
    const wordlist = document.createElement("dialog");
    wordlist.classList.add("dialog");
    wordlist.id = "dialog";
    const header = document.createElement("h2");
    header.textContent = "Word List";
    wordlist.appendChild(header);
    const listContainer = document.createElement("div");
    listContainer.id = "wordList";
    wordlist.appendChild(listContainer);
    return wordlist;
  };
  var createBoardList = (wordList, board, title) => {
    const boardHeader = document.createElement("h2");
    boardHeader.textContent = title;
    wordList.appendChild(boardHeader);
    const list = document.createElement("ul");
    board.forEach((word) => {
      const listItem = document.createElement("li");
      listItem.textContent = word;
      if (wordBankWords.some((item) => item === word)) {
        listItem.attributeStyleMap.set("font-weight", 700);
      }
      list.appendChild(listItem);
    });
    wordList.appendChild(list);
  };
  var showWordlist = (...boards) => {
    let wordList = document.getElementById("wordList");
    if (!wordList) {
      const head = document.getElementsByTagName("head")[0];
      const style = document.createElement("style");
      head.appendChild(style);
      style.setAttribute("type", "text/css");
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
      const helpDiv = createWordlistDialog();
      document.body.appendChild(helpDiv);
      wordList = document.getElementById("wordList");
    }
    if (wordList) {
      wordList.innerHTML = "";
    }
    boards.forEach((board, index) => {
      if (wordList) {
        createBoardList(wordList, board, `Board ${index + 1}`);
      }
    });
    const dialog = document.querySelector("dialog#dialog");
    if (dialog) {
      dialog.showModal();
    }
  };
  var hideWordlist = () => {
    const dialog = document.querySelector("dialog#dialog");
    if (dialog) {
      dialog.close();
    }
  };
  var processCell = (pos, element) => {
    const letter = element.children[0].textContent ?? "";
    if (element.classList.contains("exact-match")) {
      return {
        letter: letter.trim(),
        position: pos,
        status: 0 /* correct */
      };
    }
    if (element.classList.contains("word-match")) {
      return {
        letter: letter.trim(),
        position: pos,
        status: 1 /* diff */
      };
    }
    if (letter.length > 0 && letter === letter.toUpperCase() && letter !== letter.toLowerCase()) {
      return {
        letter: letter.trim(),
        position: pos,
        status: 2 /* none */
      };
    }
    return null;
  };
  var extractGameBoard = (boardNum) => {
    const boardState = [];
    const board = document.getElementById(`board-${boardNum}`);
    if (board) {
      const rows = board.querySelectorAll("div[class~='board-row']");
      rows.forEach((row) => {
        const cells = row.querySelectorAll("div[class~='letter']");
        let index = 0;
        cells.forEach((cell) => {
          const processedCell = processCell(index, cell);
          if (processedCell !== null) {
            boardState.push(processedCell);
          }
          index++;
        });
      });
    }
    return boardState;
  };
  var addListeners = () => {
    document.addEventListener(
      "keydown",
      function(event) {
        if (event.defaultPrevented) {
          return;
        }
        if (event.key === "?") {
          event.preventDefault();
          const boardArray = [];
          for (let i = 1; i < 9; i++) {
            boardArray.push(processGameBoard(extractGameBoard(i)));
          }
          showWordlist(...boardArray);
        }
        if (event.key === "Escape") {
          event.preventDefault();
          hideWordlist();
        }
      },
      true
    );
  };
  var sortProcessedCells = (cells) => {
    return cells.sort((a, b) => a.status - b.status);
  };
  var processGameBoard = (boardState) => {
    let tempWordList = [...wordBankWords, ...allowedWords];
    sortProcessedCells(boardState);
    boardState.forEach((item) => {
      if (item.status === 0 /* correct */) {
        tempWordList = tempWordList.filter((word) => word.charAt(item.position).toUpperCase() === item.letter.toUpperCase());
      } else if (item.status === 1 /* diff */) {
        tempWordList = tempWordList.filter(
          (word) => word.charAt(item.position).toUpperCase() !== item.letter.toUpperCase() && word.indexOf(item.letter.toUpperCase()) !== -1
        );
      } else if (item.status === 2 /* none */ && !boardState.some(({ letter, status }) => (status === 0 /* correct */ || status === 1 /* diff */) && letter === item.letter)) {
        tempWordList = tempWordList.filter((word) => word.indexOf(item.letter.toUpperCase()) === -1);
      } else if (item.status === 2 /* none */ && boardState.some(({ letter, status }) => (status === 0 /* correct */ || status === 1 /* diff */) && letter === item.letter)) {
        tempWordList = tempWordList.filter((word) => word.indexOf(item.letter.toUpperCase()) === word.lastIndexOf(item.letter.toUpperCase()));
      }
    });
    return tempWordList;
  };
  findAllowedWords();
  addListeners();
})();
//# sourceMappingURL=octordle-mild-cheat.user.js.map
