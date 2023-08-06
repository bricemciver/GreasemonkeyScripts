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
    var wordBankRegEx_1 = /wordBank:\s*"([^"]*)"/;
    var allowedRegEx_1 = /allowed:\s*"([^"]*)"/;
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
    var findAllowedWords_1 = function () {
        // see if we need to retrieve
        wordBankWords_1.push.apply(wordBankWords_1, getItem_1('wordBank', []));
        allowedWords_1.push.apply(allowedWords_1, getItem_1('allowed', []));
        if (!wordBankWords_1.length || !allowedWords_1.length) {
            var script = document.querySelector("script[type='module']");
            // Get the script
            if (script) {
                GM.xmlHttpRequest({
                    method: 'GET',
                    url: script.src,
                    onload: function (response) {
                        var text = response.responseText;
                        // get wordBank words
                        var wordBankMatches = RegExp(wordBankRegEx_1).exec(text);
                        if (wordBankMatches && wordBankMatches.length > 1) {
                            wordBankWords_1.push.apply(wordBankWords_1, wordBankMatches[1].split(' '));
                        }
                        // get allowed words
                        var allowedMatches = RegExp(allowedRegEx_1).exec(text);
                        if (allowedMatches && allowedMatches.length > 1) {
                            allowedWords_1.push.apply(allowedWords_1, allowedMatches[1].split(' '));
                        }
                        // store in session so we don't retrieve every time
                        setItem_1('wordBank', wordBankWords_1);
                        setItem_1('allowed', allowedWords_1);
                    },
                });
            }
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
                listItem.classList.add('font-bold');
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
    var addListeners_1 = function () {
        document.addEventListener('keydown', function (event) {
            if (event.defaultPrevented) {
                return; // Do nothing if the event was already processed
            }
            if (event.key === '?') {
                event.preventDefault();
                var boardArray = [];
                for (var i = 1; i < 5; i++) {
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
    /**
     * Examples of text found:
     * - 'A' (letter 1) is in a different spot
     * - 'S' (letter 1) is correct
     * - 'N' (letter 3) is incorrect
     */
    var cellRegEx_1 = /'(\w+)' \(letter (\d+)\) is (in a different spot|correct|incorrect)/;
    var processCell_1 = function (element) {
        var label = element.ariaLabel;
        if (label) {
            var match = RegExp(cellRegEx_1).exec(label);
            if (match && match.length > 3) {
                var letter = match[1];
                var position = parseInt(match[2], 10);
                var status_1 = match[3];
                return {
                    letter: letter,
                    position: position,
                    status: statusToBasic_1[status_1],
                };
            }
        }
        return null;
    };
    var statusToBasic_1 = {
        'in a different spot': 'diff',
        correct: 'correct',
        incorrect: 'none',
    };
    var extractGameBoard_1 = function (boardNum) {
        var boardState = [];
        var board = document.querySelector("div[role=\"table\"][aria-label=\"Game Board ".concat(boardNum, "\"]"));
        // get rows
        if (board) {
            var rows = board.querySelectorAll('div[role="row"]');
            rows.forEach(function (row) {
                // get all cells in a row
                var cells = row.querySelectorAll('div[role="cell"]');
                cells.forEach(function (cell) {
                    // get the letter, position, and status
                    var processedCell = processCell_1(cell);
                    if (processedCell !== null) {
                        boardState.push(processedCell);
                    }
                });
            });
        }
        return boardState;
    };
    var sortProcessedCells_1 = function (cells) {
        var statusOrder = {
            correct: 0,
            diff: 1,
            none: 2,
        };
        return cells.sort(function (a, b) { return statusOrder[a.status] - statusOrder[b.status]; });
    };
    var processGameBoard_1 = function (boardState) {
        var tempWordList = __spreadArray(__spreadArray([], wordBankWords_1, true), allowedWords_1, true);
        // sort boardState so all correct answers are handled first, then diff, then none
        sortProcessedCells_1(boardState);
        boardState.forEach(function (item) {
            if (item.status === 'correct') {
                // process all the correct answers first to shrink word list
                tempWordList = tempWordList.filter(function (word) { return word.charAt(item.position - 1).toUpperCase() === item.letter.toUpperCase(); });
            }
            else if (item.status === 'diff') {
                // now eliminate words where 'diff' items appear in that spot
                // and where 'diff' item doesn't appear at all
                tempWordList = tempWordList.filter(function (word) {
                    return word.charAt(item.position - 1).toUpperCase() !== item.letter.toUpperCase() && word.indexOf(item.letter.toUpperCase()) !== -1;
                });
            }
            else if (item.status === 'none' &&
                !boardState.some(function (_a) {
                    var letter = _a.letter, status = _a.status;
                    return (status === 'correct' || status === 'diff') && letter === item.letter;
                })) {
                // need to be careful here, only remove 'none' if it wasn't previously 'correct' or 'diff' (since it could be a second occurance)
                tempWordList = tempWordList.filter(function (word) { return word.indexOf(item.letter.toUpperCase()) === -1; });
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
