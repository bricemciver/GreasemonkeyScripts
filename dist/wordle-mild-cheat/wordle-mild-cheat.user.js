// ==UserScript==
// @name Wordle Mild Cheat
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @description Will show you all of the valid words that still exist based on your guesses
// @license MIT
// @version 0.1
// @match https://www.nytimes.com/games/wordle/index.html
// @icon https://www.google.com/s2/favicons?sz=64&domain=nytimes.com
// @grant GM.xmlHttpRequest
// @grant GM_xmlhttpRequest
// @run-at document-start
// ==/UserScript==

/* jshint esversion: 6 */
"use strict";
(() => {
  // src/main/wordle-mild-cheat/wordle-mild-cheat.user.ts
  var WordleMildCheat;
  ((WordleMildCheat2) => {
    let State;
    ((State2) => {
      State2[State2["correct"] = 0] = "correct";
      State2[State2["diff"] = 1] = "diff";
      State2[State2["none"] = 2] = "none";
    })(State || (State = {}));
    const fullWordList = [];
    const setItem = (key, value) => {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    };
    const getItem = (key, defaultVal) => {
      const val = window.sessionStorage.getItem(key);
      if (!val || val === "undefined") return defaultVal;
      try {
        return JSON.parse(val);
      } catch (e) {
        return val;
      }
    };
    const callback = (mutationList, mutationObserver) => {
      for (const mutation of mutationList) {
        if (mutation.addedNodes.length > 0 && mutation.addedNodes[0].nodeType === Node.ELEMENT_NODE && mutation.addedNodes[0].nodeName === "SCRIPT") {
          const element = mutation.addedNodes[0];
          if (element.src.startsWith("https://www.nytimes.com/games-assets/v2/wordle.")) {
            GM.xmlHttpRequest({
              method: "GET",
              url: element.src,
              onload(response) {
                const sonic = response.responseText.indexOf("sonic");
                const begArray = response.responseText.lastIndexOf("[", sonic);
                const endArray = response.responseText.indexOf("]", sonic);
                const wordListStr = response.responseText.substring(begArray, endArray + 1);
                const tempArray = JSON.parse(wordListStr);
                fullWordList.push(...tempArray);
                setItem("wordList", fullWordList);
              }
            });
            mutationObserver.disconnect();
            break;
          }
        }
      }
    };
    const strToState = {
      absent: 2 /* none */,
      "present in another position": 1 /* diff */,
      correct: 0 /* correct */
    };
    const createWordlistDialog = () => {
      const wordlist = document.createElement("dialog");
      wordlist.classList.add("dialog");
      wordlist.id = "dialog";
      const header = document.createElement("h2");
      header.textContent = "Word List";
      const list = document.createElement("ul");
      list.id = "wordList";
      wordlist.appendChild(header);
      wordlist.appendChild(list);
      return wordlist;
    };
    const showWordlist = (curWords) => {
      var _a, _b, _c, _d, _e;
      let wordList = document.getElementById("wordList");
      if (!wordList) {
        const head = document.getElementsByTagName("head")[0];
        const style = document.createElement("style");
        head.appendChild(style);
        style.setAttribute("type", "text/css");
        (_a = style.sheet) == null ? void 0 : _a.insertRule(`.dialog li {
        display: block;
        padding: 2px 0px;
      }`);
        (_b = style.sheet) == null ? void 0 : _b.insertRule(`.dialog ul {
        list-style: none;
        margin: 4px 0px;
        position: relative;
        padding: 0px;
      }`);
        (_c = style.sheet) == null ? void 0 : _c.insertRule(`.dialog h2 {
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
        (_d = style.sheet) == null ? void 0 : _d.insertRule(`.dialog {
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
        const helpDiv = createWordlistDialog();
        document.body.appendChild(helpDiv);
        wordList = document.getElementById("wordList");
      }
      if (wordList) {
        wordList.innerHTML = "";
        curWords.forEach((word) => {
          const listItem = document.createElement("li");
          listItem.textContent = word;
          wordList == null ? void 0 : wordList.appendChild(listItem);
        });
      }
      (_e = document.querySelector("dialog#dialog")) == null ? void 0 : _e.showModal();
    };
    const hideWordlist = () => {
      var _a;
      (_a = document.querySelector("dialog#dialog")) == null ? void 0 : _a.close();
    };
    const processCell = (element) => {
      const label = element.ariaLabel;
      if (label) {
        const [position, letter, status] = label.split(", ");
        if (letter && letter !== "empty") {
          return {
            letter,
            position: parseInt(position.charAt(0), 10),
            status: strToState[status]
          };
        }
      }
      return null;
    };
    const extractGameBoard = () => {
      const boardState = [];
      const board = document.querySelector("div[class^='Board-module_board__']");
      if (board) {
        const tiles = board.querySelectorAll("div[class^='Tile-module_tile__']");
        tiles.forEach((tile) => {
          const processedCell = processCell(tile);
          if (processedCell !== null) {
            boardState.push(processedCell);
          }
        });
      }
      return boardState;
    };
    const sortProcessedCells = (cells) => {
      return cells.sort((a, b) => a.status - b.status);
    };
    const processGameBoard = (boardState) => {
      let tempWordList = [...fullWordList];
      sortProcessedCells(boardState);
      boardState.forEach((item) => {
        if (item.status === 0 /* correct */) {
          tempWordList = tempWordList.filter((word) => word.charAt(item.position - 1).toLowerCase() === item.letter.toLowerCase());
        } else if (item.status === 1 /* diff */) {
          tempWordList = tempWordList.filter(
            (word) => word.charAt(item.position - 1).toLowerCase() !== item.letter.toLowerCase() && word.indexOf(item.letter.toLowerCase()) !== -1
          );
        } else if (item.status === 2 /* none */ && !boardState.some(
          ({ letter, status }) => (status === 0 /* correct */ || status === 1 /* diff */) && letter.toLowerCase() === item.letter.toLowerCase()
        )) {
          tempWordList = tempWordList.filter((word) => word.indexOf(item.letter.toLowerCase()) === -1);
        }
      });
      return tempWordList;
    };
    WordleMildCheat2.findAllowedWords = () => {
      fullWordList.push(...getItem("wordList", []));
      if (fullWordList.length === 0) {
        const observer = new MutationObserver(callback);
        observer.observe(document, { subtree: true, childList: true });
      }
    };
    WordleMildCheat2.addListeners = () => {
      document.addEventListener(
        "keydown",
        (event) => {
          if (event.defaultPrevented) {
            return;
          }
          if (event.key === "?") {
            event.preventDefault();
            showWordlist(processGameBoard(extractGameBoard()));
          }
          if (event.key === "Escape") {
            event.preventDefault();
            hideWordlist();
          }
        },
        true
      );
    };
  })(WordleMildCheat || (WordleMildCheat = {}));
  WordleMildCheat.findAllowedWords();
  WordleMildCheat.addListeners();
})();
//# sourceMappingURL=wordle-mild-cheat.user.js.map
