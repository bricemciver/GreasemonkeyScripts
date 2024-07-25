// ==UserScript==
// @name Quordle Mild Cheat
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @version 0.1
// @license MIT
// @description Get hints based on the words you've already tried
// @match https://www.merriam-webster.com/games/quordle/*
// @icon https://www.google.com/s2/favicons?sz=64&domain=merriam-webster.com
// @grant GM.xmlHttpRequest
// @grant GM_xmlhttpRequest
// ==/UserScript==

/* jshint esversion: 6 */
"use strict";
(() => {
  // src/main/quordle-mild-cheat/quordle-mild-cheat.user.ts
  var QuordleMildCheat;
  ((QuordleMildCheat2) => {
    const wordBankRegEx = /wordBank:\s*"([^"]*)"/;
    const allowedRegEx = /allowed:\s*"([^"]*)"/;
    const wordBankWords = [];
    const allowedWords = [];
    const setItem = (key, value) => {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    };
    const getItem = (key, defaultVal) => {
      const val = window.sessionStorage.getItem(key);
      if (!val || val === "undefined")
        return defaultVal;
      try {
        return JSON.parse(val);
      } catch (e) {
        return val;
      }
    };
    QuordleMildCheat2.findAllowedWords = () => {
      wordBankWords.push(...getItem("wordBank", []));
      allowedWords.push(...getItem("allowed", []));
      if (!wordBankWords.length || !allowedWords.length) {
        const script = document.querySelector("script[type='module']");
        if (script) {
          GM.xmlHttpRequest({
            method: "GET",
            url: script.src,
            onload(response) {
              const text = response.responseText;
              const wordBankMatches = RegExp(wordBankRegEx).exec(text);
              if (wordBankMatches && wordBankMatches.length > 1) {
                wordBankWords.push(...wordBankMatches[1].split(" "));
              }
              const allowedMatches = RegExp(allowedRegEx).exec(text);
              if (allowedMatches && allowedMatches.length > 1) {
                allowedWords.push(...allowedMatches[1].split(" "));
              }
              setItem("wordBank", wordBankWords);
              setItem("allowed", allowedWords);
            }
          });
        }
      }
    };
    const createWordlistDialog = () => {
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
    const createBoardList = (wordList, board, title) => {
      const boardHeader = document.createElement("h2");
      boardHeader.textContent = title;
      wordList.appendChild(boardHeader);
      const list = document.createElement("ul");
      board.forEach((word) => {
        const listItem = document.createElement("li");
        listItem.textContent = word;
        if (wordBankWords.some((item) => item === word)) {
          listItem.classList.add("font-bold");
        }
        list.appendChild(listItem);
      });
      wordList.appendChild(list);
    };
    const showWordlist = (...boards) => {
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
    const hideWordlist = () => {
      const dialog = document.querySelector("dialog#dialog");
      if (dialog) {
        dialog.close();
      }
    };
    QuordleMildCheat2.addListeners = () => {
      document.addEventListener(
        "keydown",
        function(event) {
          if (event.defaultPrevented) {
            return;
          }
          if (event.key === "?") {
            event.preventDefault();
            const boardArray = [];
            for (let i = 1; i < 5; i++) {
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
    const cellRegEx = /'(\w+)' \(letter (\d+)\) is (in a different spot|correct|incorrect)/;
    const processCell = (element) => {
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
            status: statusToBasic[status]
          };
        }
      }
      return null;
    };
    const statusToBasic = {
      "in a different spot": "diff",
      correct: "correct",
      incorrect: "none"
    };
    const extractGameBoard = (boardNum) => {
      const boardState = [];
      const board = document.querySelector(`div[role="table"][aria-label="Game Board ${boardNum}"]`);
      if (board) {
        const rows = board.querySelectorAll('div[role="row"]');
        rows.forEach((row) => {
          const cells = row.querySelectorAll('div[role="cell"]');
          cells.forEach((cell) => {
            const processedCell = processCell(cell);
            if (processedCell !== null) {
              boardState.push(processedCell);
            }
          });
        });
      }
      return boardState;
    };
    const sortProcessedCells = (cells) => {
      const statusOrder = {
        correct: 0,
        diff: 1,
        none: 2
      };
      return cells.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    };
    const processGameBoard = (boardState) => {
      let tempWordList = [...wordBankWords, ...allowedWords];
      sortProcessedCells(boardState);
      boardState.forEach((item) => {
        if (item.status === "correct") {
          tempWordList = tempWordList.filter((word) => word.charAt(item.position - 1).toUpperCase() === item.letter.toUpperCase());
        } else if (item.status === "diff") {
          tempWordList = tempWordList.filter(
            (word) => word.charAt(item.position - 1).toUpperCase() !== item.letter.toUpperCase() && word.indexOf(item.letter.toUpperCase()) !== -1
          );
        } else if (item.status === "none" && !boardState.some(({ letter, status }) => (status === "correct" || status === "diff") && letter === item.letter)) {
          tempWordList = tempWordList.filter((word) => word.indexOf(item.letter.toUpperCase()) === -1);
        } else if (item.status === "none" && boardState.some(({ letter, status }) => (status === "correct" || status === "diff") && letter === item.letter)) {
          tempWordList = tempWordList.filter((word) => word.indexOf(item.letter.toUpperCase()) === word.lastIndexOf(item.letter.toUpperCase()));
        }
      });
      return tempWordList;
    };
  })(QuordleMildCheat || (QuordleMildCheat = {}));
  QuordleMildCheat.findAllowedWords();
  QuordleMildCheat.addListeners();
})();
//# sourceMappingURL=quordle-mild-cheat.user.js.map
