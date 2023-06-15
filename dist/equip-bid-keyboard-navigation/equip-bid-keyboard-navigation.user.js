"use strict";
var _a;
// ==UserScript==
// @name         Equip-Bid Keyboard Nav
// @namespace    bricemciver
// @description  Use Feedly-style navigation on Equip Bid auctions
// @author       Brice McIver
// @license      MIT
// @version      0.2
// @match        https://www.equip-bid.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=equip-bid.com
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @connect      equip-bid.com
// ==/UserScript==
{
    var lotList = document.querySelector('div.lot-list');
    var lots_1 = Array.from((_a = lotList === null || lotList === void 0 ? void 0 : lotList.querySelectorAll('h4[id^="itemTitle"]')) !== null && _a !== void 0 ? _a : []);
    var prevLink_1 = document.querySelector('li.previous a');
    var nextLink_1 = document.querySelector('li.next a');
    var helpTopics_1 = [
        { section: '', items: [{ key: '?', description: 'Keyboard shortcuts' }] },
        {
            section: 'Auction items',
            items: [
                { key: 'j', description: 'Scroll to next auction item' },
                { key: 'k', description: 'Scroll to previous auction item' },
            ],
        },
        {
            section: 'Selected item',
            items: [
                { key: 'w', description: 'Add item to watchlist' },
                { key: 'v', description: 'Open item in a new tab' },
            ],
        },
    ];
    var index_1 = -1;
    window.addEventListener('keydown', function (event) {
        if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }
        switch (event.key) {
            case 'J':
            case 'j':
                index_1++;
                // Cancel the default action to avoid it being handled twice
                event.preventDefault();
                indexAction_1();
                break;
            case 'K':
            case 'k':
                index_1--;
                // Cancel the default action to avoid it being handled twice
                event.preventDefault();
                indexAction_1();
                break;
            case 'W':
            case 'w':
                event.preventDefault();
                addToWatchList_1();
                break;
            case 'V':
            case 'v':
                event.preventDefault();
                openInNewTab_1();
                break;
            case '?':
                event.preventDefault();
                showHelp_1();
                break;
            case 'Escape':
                event.preventDefault();
                hideHelp_1();
                break;
            default:
                // eslint-disable-next-line no-console
                console.log('Key pressed ' + event.key);
        }
    }, true);
    var indexAction_1 = function () {
        // auto page navigation
        if (index_1 < 0 && prevLink_1) {
            // go to previous page (if available)
            prevLink_1.click();
        }
        else if (index_1 > lots_1.length - 1 && nextLink_1) {
            // go to next page (if available)
            nextLink_1.click();
        }
        else {
            lots_1[index_1].scrollIntoView();
        }
    };
    var addToWatchList_1 = function () {
        var _a, _b, _c;
        // find the right watchlist button
        var watchlistButton = (_c = (_b = (_a = lots_1[index_1].parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.nextElementSibling) === null || _c === void 0 ? void 0 : _c.querySelector('a.item-watch-up');
        if (watchlistButton) {
            watchlistButton.click();
        }
    };
    var openInNewTab_1 = function () {
        // find the url
        var url = lots_1[index_1].querySelector('a');
        if (url) {
            window.open(url.href, '_blank');
        }
    };
    var showHelp_1 = function () {
        var _a;
        (_a = document.querySelector('dialog.ShortcutsHelp')) === null || _a === void 0 ? void 0 : _a.showModal();
    };
    var hideHelp_1 = function () {
        var _a;
        (_a = document.querySelector('dialog.ShortcutsHelp')) === null || _a === void 0 ? void 0 : _a.close();
    };
    var createHelp_1 = function () {
        var helpDiv = createElement_1('dialog', {
            className: 'ShortcutsHelp',
        });
        var hintDiv = createElement_1('div', {
            className: 'ShortcutsHelp__hint',
        }, 'ESC to close');
        var title = createElement_1('div', {
            className: 'ShortcutsHelp__title',
        }, 'Keyboard Shortcuts Help');
        helpDiv.appendChild(hintDiv);
        helpDiv.appendChild(title);
        helpTopics_1.forEach(function (topic) {
            var section = createElement_1('div', {
                className: 'ShortcutsHelp__section',
            });
            var sectionTitle = createElement_1('div', {
                className: 'ShortcutsHelp__section-title',
            }, topic.section);
            section.appendChild(sectionTitle);
            helpDiv.appendChild(section);
            topic.items.forEach(function (item) {
                var itemDiv = createElement_1('div');
                var itemKey = createElement_1('span', {
                    className: 'ShortcutsHelp__shortcut',
                }, item.key);
                var itemValue = document.createTextNode(item.description);
                itemDiv.appendChild(itemKey);
                itemDiv.appendChild(itemValue);
                section.appendChild(itemDiv);
            });
        });
        return helpDiv;
    };
    var createElement_1 = function (type, config, text) {
        var theElement = document.createElement(type);
        if (config) {
            for (var key in config) {
                if (Object.prototype.hasOwnProperty.call(config, key)) {
                    var name_1 = key.toLowerCase();
                    if (key.toLowerCase() === 'classname') {
                        name_1 = 'class';
                    }
                    theElement.setAttribute(name_1, config[name_1]);
                }
            }
        }
        if (text) {
            theElement.insertAdjacentText('afterbegin', text);
        }
        return theElement;
    };
    var initScript = function () {
        // load new styles
        var head = document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        style.textContent = ".ShortcutsHelp {\n    animation: shortcuts-help-fade-in .25s ease-in-out;\n    background-color: #111;\n    border-radius: .25rem;\n    color: #fff;\n    font-size: 1.25rem;\n    left: 50%;\n    line-height: 17px;\n    padding: 20px;\n    position: absolute;\n    top: 50%;\n    transform: translate(-50%, -50%);\n    width: 350px;\n    z-index: 99999\n}\n\n.ShortcutsHelp__title {\n    border-bottom: 1px solid #444;\n    color: #999;\n    font-weight: 700;\n    margin-bottom: 9px;\n    padding-bottom: 9px\n}\n\n.ShortcutsHelp__hint {\n    color: #999;\n    float: right;\n}\n\n.ShortcutsHelp__section {\n    margin-bottom: 17px;\n    margin-top: 0\n}\n\n.ShortcutsHelp__section-title {\n    color: #999;\n    margin-bottom: 8px;\n    margin-top: 9px\n}\n\n.ShortcutsHelp__shortcut {\n    color: #2bb24c;\n    display: inline-block;\n    padding-right: 6px;\n    width: 55px\n}\n\n@keyframes shortcuts-help-fade-in {\n    from {\n        opacity: 0\n    }\n\n    to {\n        opacity: 1\n    }\n}\n\n@keyframes shortcuts-help-fade-out {\n    from {\n        opacity: 1\n    }\n\n    to {\n        opacity: 0\n    }\n}";
        head.appendChild(style);
        // create help div
        var helpDiv = createHelp_1();
        // attach to body
        document.body.appendChild(helpDiv);
    };
    initScript();
}
