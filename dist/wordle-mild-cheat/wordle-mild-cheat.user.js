"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
{
    var State = void 0;
    (function (State) {
        State[State["correct"] = 0] = "correct";
        State[State["diff"] = 1] = "diff";
        State[State["none"] = 2] = "none";
    })(State || (State = {}));
    var fullWordList_1 = [];
    /**
     * Set an item into storage
     * @param key key to set
     * @param value value to set
     */
    var setItem_1 = function (key, value) {
        window.sessionStorage.setItem(key, JSON.stringify(value));
    };
    /**
     * Get an item from session storage
     * @param key key to get
     * @param defaultVal value to return if key doesnt exist
     */
    var getItem_1 = function (key, defaultVal) {
        var val = window.sessionStorage.getItem(key);
        if (!val || val === 'undefined')
            return defaultVal;
        try {
            return JSON.parse(val);
        }
        catch (e) {
            return val;
        }
    };
    var callback_1 = function (mutationList, mutationObserver) {
        for (var _i = 0, mutationList_1 = mutationList; _i < mutationList_1.length; _i++) {
            var mutation = mutationList_1[_i];
            if (mutation.addedNodes.length > 0 &&
                mutation.addedNodes[0].nodeType === Node.ELEMENT_NODE &&
                mutation.addedNodes[0].nodeName === 'SCRIPT') {
                var element = mutation.addedNodes[0];
                if (element.src.startsWith('https://www.nytimes.com/games-assets/v2/wordle.')) {
                    // Get the script
                    GM.xmlHttpRequest({
                        method: 'GET',
                        url: element.src,
                        onload: function (response) {
                            // find a known valid word
                            var sonic = response.responseText.indexOf('sonic');
                            // find the beginning of array
                            var begArray = response.responseText.lastIndexOf('[', sonic);
                            // find the end of array
                            var endArray = response.responseText.indexOf(']', sonic);
                            // Get the word list from script
                            var wordListStr = response.responseText.substring(begArray, endArray + 1);
                            // Convert to an array object
                            var tempArray = JSON.parse(wordListStr);
                            fullWordList_1.push.apply(fullWordList_1, tempArray);
                            setItem_1('wordList', fullWordList_1);
                        },
                    });
                    mutationObserver.disconnect();
                    break;
                }
            }
        }
    };
    var strToState_1 = {
        absent: State.none,
        'present in another position': State.diff,
        correct: State.correct,
    };
    var createWordlistDialog_1 = function () {
        var wordlist = document.createElement('dialog');
        wordlist.classList.add('dialog');
        wordlist.id = 'dialog';
        var header = document.createElement('h2');
        header.textContent = 'Word List';
        var list = document.createElement('ul');
        list.id = 'wordList';
        wordlist.appendChild(header);
        wordlist.appendChild(list);
        return wordlist;
    };
    var showWordlist_1 = function (curWords) {
        var _a, _b, _c, _d, _e;
        var wordList = document.getElementById('wordList');
        if (!wordList) {
            // load new styles
            var head = document.getElementsByTagName('head')[0];
            var style = document.createElement('style');
            head.appendChild(style);
            style.setAttribute('type', 'text/css');
            (_a = style.sheet) === null || _a === void 0 ? void 0 : _a.insertRule(".dialog li {\n        display: block;\n        padding: 2px 0px;\n      }");
            (_b = style.sheet) === null || _b === void 0 ? void 0 : _b.insertRule(".dialog ul {\n        list-style: none;\n        margin: 4px 0px;\n        position: relative;\n        padding: 0px;\n      }");
            (_c = style.sheet) === null || _c === void 0 ? void 0 : _c.insertRule(".dialog h2 {\n        font-size: 0.6875rem;\n        line-height: 1.5;\n        letter-spacing: 0.08rem;\n        font-family: \"IBM Plex Sans\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\";\n        font-weight: 700;\n        display: flex;\n        align-items: center;\n        border-radius: 5px;\n        outline: 0px;\n        width: 100%;\n        justify-content: flex-start;\n        transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;\n        text-decoration: none;\n        color: rgb(111, 126, 140);\n        margin-top: 8px;\n        text-transform: uppercase;\n      }");
            (_d = style.sheet) === null || _d === void 0 ? void 0 : _d.insertRule(".dialog {\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%, -50%);\n        width: 300px;\n        padding: 20px;\n        background-color: #f2f2f2;\n        border: 1px solid #ccc;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n        font-family: Arial, sans-serif;\n        color: #333;\n        margin: 0 auto;\n      }");
            // create wordlist div
            var helpDiv = createWordlistDialog_1();
            // attach to body
            document.body.appendChild(helpDiv);
            wordList = document.getElementById('wordList');
        }
        if (wordList) {
            wordList.innerHTML = '';
            curWords.forEach(function (word) {
                var listItem = document.createElement('li');
                listItem.textContent = word;
                wordList === null || wordList === void 0 ? void 0 : wordList.appendChild(listItem);
            });
        }
        (_e = document.querySelector('dialog#dialog')) === null || _e === void 0 ? void 0 : _e.showModal();
    };
    var hideWordlist_1 = function () {
        var _a;
        (_a = document.querySelector('dialog#dialog')) === null || _a === void 0 ? void 0 : _a.close();
    };
    /**
     * Examples of text found:
     * - 'A' (letter 1) is in a different spot
     * - 'S' (letter 1) is correct
     * - 'N' (letter 3) is incorrect
     */
    var processCell_1 = function (element) {
        var label = element.ariaLabel;
        if (label) {
            // get letter, status, position from label
            var _a = label.split(', '), position = _a[0], letter = _a[1], status_1 = _a[2];
            if (letter && letter !== 'empty') {
                return {
                    letter: letter,
                    position: parseInt(position.charAt(0), 10),
                    status: strToState_1[status_1],
                };
            }
        }
        return null;
    };
    var extractGameBoard_1 = function () {
        var boardState = [];
        var board = document.querySelector("div[class^='Board-module_board__']");
        if (board) {
            var tiles = board.querySelectorAll("div[class^='Tile-module_tile__']");
            tiles.forEach(function (tile) {
                var processedCell = processCell_1(tile);
                if (processedCell !== null) {
                    boardState.push(processedCell);
                }
            });
        }
        return boardState;
    };
    var sortProcessedCells_1 = function (cells) {
        return cells.sort(function (a, b) { return a.status - b.status; });
    };
    var processGameBoard_1 = function (boardState) {
        var tempWordList = __spreadArray([], fullWordList_1, true);
        // sort boardState so all correct answers are handled first, then diff, then none
        sortProcessedCells_1(boardState);
        boardState.forEach(function (item) {
            if (item.status === State.correct) {
                // process all the correct answers first to shrink word list
                tempWordList = tempWordList.filter(function (word) { return word.charAt(item.position - 1).toLowerCase() === item.letter.toLowerCase(); });
            }
            else if (item.status === State.diff) {
                // now eliminate words where 'diff' items appear in that spot
                // and where 'diff' item doesn't appear at all
                tempWordList = tempWordList.filter(function (word) {
                    return word.charAt(item.position - 1).toLowerCase() !== item.letter.toLowerCase() && word.indexOf(item.letter.toLowerCase()) !== -1;
                });
            }
            else if (item.status === State.none &&
                !boardState.some(function (_a) {
                    var letter = _a.letter, status = _a.status;
                    return (status === State.correct || status === State.diff) && letter.toLowerCase() === item.letter.toLowerCase();
                })) {
                // need to be careful here, only remove 'none' if it wasn't previously 'correct' or 'diff' (since it could be a second occurance)
                tempWordList = tempWordList.filter(function (word) { return word.indexOf(item.letter.toLowerCase()) === -1; });
            }
        });
        return tempWordList;
    };
    var findAllowedWords_1 = function () {
        fullWordList_1.push.apply(fullWordList_1, getItem_1('wordList', []));
        if (fullWordList_1.length === 0) {
            // create a new instance of `MutationObserver` named `observer`,
            // passing it a callback function
            var observer = new MutationObserver(callback_1);
            // call `observe()` on that MutationObserver instance,
            // passing it the element to observe, and the options object
            observer.observe(document, { subtree: true, childList: true });
        }
    };
    var addListeners_1 = function () {
        document.addEventListener('keydown', function (event) {
            if (event.defaultPrevented) {
                return; // Do nothing if the event was already processed
            }
            if (event.key === '?') {
                event.preventDefault();
                showWordlist_1(processGameBoard_1(extractGameBoard_1()));
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                hideWordlist_1();
            }
        }, true);
    };
    (function () {
        'use strict';
        // Retrieve (locally or from site) the word lists
        findAllowedWords_1();
        // add listeners
        addListeners_1();
    })();
}
