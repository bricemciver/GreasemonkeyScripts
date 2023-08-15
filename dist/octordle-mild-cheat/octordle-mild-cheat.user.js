"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
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
{
    var State = void 0;
    (function (State) {
        State[State["correct"] = 0] = "correct";
        State[State["diff"] = 1] = "diff";
        State[State["none"] = 2] = "none";
    })(State || (State = {}));
    var wordBankRegEx_1 = /"([^"]*\bsonic\b[^"]*)"/;
    var allowedRegEx_1 = /"([^"]*\bcorky\b[^"]*)"/;
    var wordBankWords_1 = [];
    var allowedWords_1 = [];
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
     * @param defaultVal value to return if key doesn't exist
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
                if (element.type === 'module') {
                    // Get the script
                    GM.xmlHttpRequest({
                        method: 'GET',
                        url: element.src,
                        onload: function (response) {
                            var text = response.responseText;
                            // get wordBank words
                            var wordBankMatches = RegExp(wordBankRegEx_1).exec(text);
                            if (wordBankMatches && wordBankMatches.length > 1) {
                                wordBankWords_1.push.apply(wordBankWords_1, wordBankMatches[1].split(' ').map(function (word) { return word.toUpperCase(); }));
                            }
                            // get allowed words
                            var allowedMatches = RegExp(allowedRegEx_1).exec(text);
                            if (allowedMatches && allowedMatches.length > 1) {
                                allowedWords_1.push.apply(allowedWords_1, allowedMatches[1].split(' ').map(function (word) { return word.toUpperCase(); }));
                            }
                            // store in session so we don't retrieve every time
                            setItem_1('wordBank', wordBankWords_1);
                            setItem_1('allowed', allowedWords_1);
                        },
                    });
                    mutationObserver.disconnect();
                    break;
                }
            }
        }
    };
    var findAllowedWords_1 = function () {
        // see if we need to retrieve
        wordBankWords_1.push.apply(wordBankWords_1, getItem_1('wordBank', []));
        allowedWords_1.push.apply(allowedWords_1, getItem_1('allowed', []));
        if (!wordBankWords_1.length || !allowedWords_1.length) {
            // create a new instance of `MutationObserver` named `observer`,
            // passing it a callback function
            var observer = new MutationObserver(callback_1);
            // call `observe()` on that MutationObserver instance,
            // passing it the element to observe, and the options object
            observer.observe(document, { subtree: true, childList: true });
        }
    };
    var createWordlistDialog_1 = function () {
        var wordlist = document.createElement('dialog');
        wordlist.classList.add('dialog');
        wordlist.id = 'dialog';
        var header = document.createElement('h2');
        header.textContent = 'Word List';
        wordlist.appendChild(header);
        var listContainer = document.createElement('div');
        listContainer.id = 'wordList';
        wordlist.appendChild(listContainer);
        return wordlist;
    };
    var createBoardList_1 = function (wordList, board, title) {
        var boardHeader = document.createElement('h2');
        boardHeader.textContent = title;
        wordList.appendChild(boardHeader);
        var list = document.createElement('ul');
        board.forEach(function (word) {
            var listItem = document.createElement('li');
            listItem.textContent = word;
            if (wordBankWords_1.some(function (item) { return item === word; })) {
                listItem.attributeStyleMap.set('font-weight', 700);
            }
            list.appendChild(listItem);
        });
        wordList.appendChild(list);
    };
    var showWordlist_1 = function () {
        var boards = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            boards[_i] = arguments[_i];
        }
        var wordList = document.getElementById('wordList');
        if (!wordList) {
            // load new styles
            var head = document.getElementsByTagName('head')[0];
            var style = document.createElement('style');
            head.appendChild(style);
            style.setAttribute('type', 'text/css');
            if (style.sheet) {
                style.sheet.insertRule(".dialog li {\n            display: block;\n            padding: 2px 0px;\n        }");
                style.sheet.insertRule(".dialog ul {\n            list-style: none;\n            margin: 4px 0px;\n            position: relative;\n            padding: 0px;\n        }");
                style.sheet.insertRule(".dialog h2 {\n            font-size: 0.6875rem;\n            line-height: 1.5;\n            letter-spacing: 0.08rem;\n            font-family: \"IBM Plex Sans\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\";\n            font-weight: 700;\n            display: flex;\n            align-items: center;\n            border-radius: 5px;\n            outline: 0px;\n            width: 100%;\n            justify-content: flex-start;\n            transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;\n            text-decoration: none;\n            color: rgb(111, 126, 140);\n            margin-top: 8px;\n            text-transform: uppercase;\n        }");
                style.sheet.insertRule(".dialog {\n            top: 50%;\n            left: 50%;\n            transform: translate(-50%, -50%);\n            width: 300px;\n            padding: 20px;\n            background-color: #f2f2f2;\n            border: 1px solid #ccc;\n            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n            font-family: Arial, sans-serif;\n            color: #333;\n            margin: 0 auto;\n        }");
            }
            // create wordlist div
            var helpDiv = createWordlistDialog_1();
            // attach to body
            document.body.appendChild(helpDiv);
            wordList = document.getElementById('wordList');
        }
        if (wordList) {
            wordList.innerHTML = '';
        }
        // add boards
        boards.forEach(function (board, index) {
            if (wordList) {
                createBoardList_1(wordList, board, "Board ".concat(index + 1));
            }
        });
        var dialog = document.querySelector('dialog#dialog');
        if (dialog) {
            dialog.showModal();
        }
    };
    var hideWordlist_1 = function () {
        var dialog = document.querySelector('dialog#dialog');
        if (dialog) {
            dialog.close();
        }
    };
    var processCell_1 = function (pos, element) {
        var _a;
        var letter = (_a = element.children[0].textContent) !== null && _a !== void 0 ? _a : '';
        if (element.classList.contains('exact-match')) {
            // letter is in correct spot
            return {
                letter: letter.trim(),
                position: pos,
                status: State.correct,
            };
        }
        if (element.classList.contains('word-match')) {
            // letter is in word, not in that place
            return {
                letter: letter.trim(),
                position: pos,
                status: State.diff,
            };
        }
        if (letter.length > 0 && letter === letter.toUpperCase() && letter !== letter.toLowerCase()) {
            // if we have a letter, it doesn't belong
            return {
                letter: letter.trim(),
                position: pos,
                status: State.none,
            };
        }
        return null;
    };
    var extractGameBoard_1 = function (boardNum) {
        var boardState = [];
        var board = document.getElementById("board-".concat(boardNum));
        // get rows
        if (board) {
            var rows = board.querySelectorAll("div[class~='board-row']");
            rows.forEach(function (row) {
                // get all cells in a row
                var cells = row.querySelectorAll("div[class~='letter']");
                var index = 0;
                cells.forEach(function (cell) {
                    // get the letter, position, and status
                    var processedCell = processCell_1(index, cell);
                    if (processedCell !== null) {
                        boardState.push(processedCell);
                    }
                    index++;
                });
            });
        }
        return boardState;
    };
    var addListeners_1 = function () {
        document.addEventListener('keydown', function (event) {
            if (event.defaultPrevented) {
                return; // Do nothing if the event was already processed
            }
            if (event.key === '?') {
                event.preventDefault();
                var boardArray = [];
                for (var i = 1; i < 9; i++) {
                    boardArray.push(processGameBoard_1(extractGameBoard_1(i)));
                }
                showWordlist_1.apply(void 0, boardArray);
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                hideWordlist_1();
            }
        }, true);
    };
    var sortProcessedCells_1 = function (cells) {
        return cells.sort(function (a, b) { return a.status - b.status; });
    };
    var processGameBoard_1 = function (boardState) {
        var tempWordList = __spreadArray(__spreadArray([], wordBankWords_1, true), allowedWords_1, true);
        // sort boardState so all correct answers are handled first, then diff, then none
        sortProcessedCells_1(boardState);
        boardState.forEach(function (item) {
            if (item.status === State.correct) {
                // process all the correct answers first to shrink word list
                tempWordList = tempWordList.filter(function (word) { return word.charAt(item.position).toUpperCase() === item.letter.toUpperCase(); });
            }
            else if (item.status === State.diff) {
                // now eliminate words where 'diff' items appear in that spot
                // and where 'diff' item doesn't appear at all
                tempWordList = tempWordList.filter(function (word) { return word.charAt(item.position).toUpperCase() !== item.letter.toUpperCase() && word.indexOf(item.letter.toUpperCase()) !== -1; });
            }
            else if (item.status === State.none &&
                !boardState.some(function (_a) {
                    var letter = _a.letter, status = _a.status;
                    return (status === State.correct || status === State.diff) && letter === item.letter;
                })) {
                // need to be careful here, only remove 'none' if it wasn't previously 'correct' or 'diff' (since it could be a second occurance)
                tempWordList = tempWordList.filter(function (word) { return word.indexOf(item.letter.toUpperCase()) === -1; });
            }
            else if (item.status === State.none &&
                boardState.some(function (_a) {
                    var letter = _a.letter, status = _a.status;
                    return (status === State.correct || status === State.diff) && letter === item.letter;
                })) {
                // edge case; remove words with duplicate letters if status is none but other status of diff or correct exists
                // this will not handle words with 3 of the same letter correctly
                tempWordList = tempWordList.filter(function (word) { return word.indexOf(item.letter.toUpperCase()) === word.lastIndexOf(item.letter.toUpperCase()); });
            }
        });
        return tempWordList;
    };
    (function () {
        'use strict';
        // Retrieve (locally or from site) the word lists
        findAllowedWords_1();
        // add listeners
        addListeners_1();
    })();
}
