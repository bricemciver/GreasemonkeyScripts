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
        State[State["unknown"] = 0] = "unknown";
        State[State["absent"] = 1] = "absent";
        State[State["present"] = 2] = "present";
        State[State["correct"] = 3] = "correct";
    })(State || (State = {}));
    var fullWordList_1 = [];
    var currentWordList_1 = [];
    var letterMap_1 = {};
    var wordState_1 = {
        0: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
        1: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
        2: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
        3: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
        4: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
    };
    var callback = function (mutationList, mutationObserver) {
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
                        },
                    });
                    mutationObserver.disconnect();
                    break;
                }
            }
        }
    };
    var strToState_1 = function (value) {
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
    var filterWordList_1 = function () {
        // make sure we have a word list
        if (fullWordList_1.length > 0) {
            currentWordList_1 = new (Array.bind.apply(Array, __spreadArray([void 0], fullWordList_1, false)))();
            var _loop_1 = function (i) {
                currentWordList_1 = currentWordList_1.filter(function (word) { return wordState_1[i].indexOf(word.charAt(i)) !== -1; });
            };
            // filter out words by each letter position
            for (var i = 0; i < 5; i++) {
                _loop_1(i);
            }
            var _loop_2 = function (entry) {
                if (Object.prototype.hasOwnProperty.call(letterMap_1, entry)) {
                    currentWordList_1 = currentWordList_1.filter(function (word) { return letterMap_1[entry].some(function (pos) { return word.charAt(pos) === entry; }); });
                }
            };
            // filter out words with letter in invalid position
            for (var entry in letterMap_1) {
                _loop_2(entry);
            }
        }
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
    var showWordlist_1 = function () {
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
            currentWordList_1.forEach(function (word) {
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
    var buildLetterState_1 = function () {
        // examine board for letter state
        var board = document.querySelector("div[class^='Board-module_board__']");
        if (board) {
            var tiles = board.querySelectorAll("div[class^='Tile-module_tile__']");
            tiles.forEach(function (tile) {
                var _a;
                var state = strToState_1(tile.getAttribute('data-state'));
                var letter = tile.textContent;
                var pos = null;
                var delay = (_a = tile.parentElement) === null || _a === void 0 ? void 0 : _a.style.animationDelay;
                if (delay) {
                    var delayStr = RegExp(/\d+/).exec(delay);
                    if (delayStr) {
                        // convert to num
                        pos = parseInt(delayStr[0], 10) / 100;
                    }
                }
                if (letter) {
                    switch (state) {
                        case State.absent: {
                            // remove this letter for all positions
                            for (var i = 0; i < 5; i++) {
                                wordState_1[i] = wordState_1[i].filter(function (item) { return item !== letter; });
                            }
                            break;
                        }
                        case State.correct: {
                            // remove all other letters for current position
                            if (pos !== null) {
                                wordState_1[pos] = wordState_1[pos].filter(function (item) { return item === letter; });
                            }
                            // remove from letter map
                            for (var entry in letterMap_1) {
                                if (Object.prototype.hasOwnProperty.call(letterMap_1, entry)) {
                                    letterMap_1[entry] = letterMap_1[entry].filter(function (item) { return item !== pos; });
                                }
                            }
                            delete letterMap_1[letter];
                            break;
                        }
                        case State.present: {
                            // remove this letter for current position and keep track of possible positions
                            if (pos !== null) {
                                wordState_1[pos] = wordState_1[pos].filter(function (item) { return item !== letter; });
                            }
                            for (var i = 0; i < 5; i++) {
                                if (wordState_1[i].some(function (item) { return item === letter; })) {
                                    if (!(letter in letterMap_1)) {
                                        letterMap_1[letter] = [];
                                    }
                                    letterMap_1[letter].push(i);
                                }
                            }
                            break;
                        }
                        default: {
                            // Nothing to do here
                        }
                    }
                }
            });
        }
    };
    // create a new instance of `MutationObserver` named `observer`,
    // passing it a callback function
    var observer = new MutationObserver(callback);
    // call `observe()` on that MutationObserver instance,
    // passing it the element to observe, and the options object
    observer.observe(document, { subtree: true, childList: true });
    document.addEventListener('keydown', function (event) {
        if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }
        if (event.key === '?') {
            event.preventDefault();
            buildLetterState_1();
            filterWordList_1();
            showWordlist_1();
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            hideWordlist_1();
        }
    }, true);
}
