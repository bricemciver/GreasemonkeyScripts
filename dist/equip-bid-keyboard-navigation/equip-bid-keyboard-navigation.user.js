"use strict";
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
    var indexAction_1 = function (action) {
        // auto page navigation
        if (index_1 === 0 && prevLink_1 && action === 'minus') {
            // go to previous page (if available)
            prevLink_1.click();
        }
        else if (index_1 > lots_1.length - 2 && nextLink_1 && action === 'plus') {
            // go to next page (if available)
            nextLink_1.click();
        }
        else if (action === 'plus') {
            lots_1[index_1].classList.remove('row_selected');
            index_1++;
            lots_1[index_1].classList.add('row_selected');
            lots_1[index_1].scrollIntoView({
                block: 'center',
            });
        }
        else if (action === 'minus') {
            lots_1[index_1].classList.remove('row_selected');
            index_1--;
            lots_1[index_1].classList.add('row_selected');
            lots_1[index_1].scrollIntoView({
                block: 'center',
            });
        }
    };
    var addToWatchList_1 = function () {
        // find the right watchlist button
        var watchlistButton = lots_1[index_1].querySelector('a.item-watch-up');
        if (watchlistButton) {
            watchlistButton.click();
        }
    };
    var openInNewTab_1 = function () {
        // find the url
        var url = lots_1[index_1].getAttribute('data-url');
        if (url) {
            window.open(url, '_blank');
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
        var helpDiv = document.createElement('dialog');
        helpDiv.classList.add('ShortcutsHelp');
        var hintDiv = document.createElement('div');
        hintDiv.classList.add('ShortcutsHelp__hint');
        hintDiv.insertAdjacentText('afterbegin', 'ESC to close');
        var title = document.createElement('div');
        title.classList.add('ShortcutsHelp__title');
        title.insertAdjacentText('afterbegin', 'Keyboard Shortcuts Help');
        helpDiv.appendChild(hintDiv);
        helpDiv.appendChild(title);
        helpTopics_1.forEach(function (topic) {
            var section = document.createElement('div');
            section.classList.add('ShortcutsHelp__section');
            var sectionTitle = document.createElement('div');
            sectionTitle.classList.add('ShortcutsHelp__section-title');
            sectionTitle.insertAdjacentText('afterbegin', topic.section);
            section.appendChild(sectionTitle);
            helpDiv.appendChild(section);
            topic.items.forEach(function (item) {
                var itemDiv = document.createElement('div');
                var itemKey = document.createElement('span');
                itemKey.classList.add('ShortcutsHelp__shortcut');
                itemKey.insertAdjacentText('afterbegin', item.key);
                var itemValue = document.createTextNode(item.description);
                itemDiv.appendChild(itemKey);
                itemDiv.appendChild(itemValue);
                section.appendChild(itemDiv);
            });
        });
        return helpDiv;
    };
    var initScript = function () {
        // load new styles
        var head = document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        head.appendChild(style);
        if (style.sheet) {
            style.sheet.insertRule(".ShortcutsHelp {\n        animation: shortcuts-help-fade-in .25s ease-in-out;\n        background-color: #111;\n        border-radius: .25rem;\n        color: #fff;\n        font-size: 1.25rem;\n        left: 50%;\n        line-height: 17px;\n        padding: 20px;\n        position: absolute;\n        top: 50%;\n        transform: translate(-50%, -50%);\n        width: 350px;\n        z-index: 99999\n    }");
            style.sheet.insertRule(".ShortcutsHelp__title {\n      border-bottom: 1px solid #444;\n      color: #999;\n      font-weight: 700;\n      margin-bottom: 9px;\n      padding-bottom: 9px\n  }");
            style.sheet.insertRule(".ShortcutsHelp__hint {\n    color: #999;\n    float: right;\n}");
            style.sheet.insertRule(".ShortcutsHelp__section {\n    margin-bottom: 17px;\n    margin-top: 0\n}");
            style.sheet.insertRule(".ShortcutsHelp__section-title {\n    color: #999;\n    margin-bottom: 8px;\n    margin-top: 9px\n}");
            style.sheet.insertRule(".ShortcutsHelp__shortcut {\n    color: #2bb24c;\n    display: inline-block;\n    padding-right: 6px;\n    width: 55px\n}");
            style.sheet.insertRule("@keyframes shortcuts-help-fade-in {\n    from {\n        opacity: 0\n    }\n\n    to {\n        opacity: 1\n    }\n}");
            style.sheet.insertRule("@keyframes shortcuts-help-fade-out {\n    from {\n        opacity: 1\n    }\n\n    to {\n        opacity: 0\n    }\n}");
        }
        // create help div
        var helpDiv = createHelp_1();
        // attach to body
        document.body.appendChild(helpDiv);
        if (lotList_1) {
            makeLotItemsIntoCards_1(lotList_1);
        }
    };
    var makeLotItemsIntoCards_1 = function (lotList) {
        var newNode = null;
        for (var _i = 0, _a = Array.from(lotList.children); _i < _a.length; _i++) {
            var child = _a[_i];
            if (child.tagName === 'HR' || child.classList.contains('lot-divider')) {
                // this is the boundary for our content
                // create a new node and insert it after the boundary
                newNode = document.createElement('div');
                newNode.classList.add('well');
                child.after(newNode);
            }
            else if (newNode) {
                // if we have a node, move content from the lotList into the well
                // add href to wrapper div
                if (!newNode.getAttribute('data-url') && newNode.querySelector('a[href]')) {
                    var url = newNode.querySelector('a[href]');
                    if (url) {
                        newNode.setAttribute('data-url', url.href);
                    }
                }
                newNode.appendChild(child);
            }
        }
        lots_1 = Array.from(document.querySelectorAll('div.well'));
    };
    var lotList_1 = document.querySelector('div.lot-list');
    var lots_1 = [];
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
    var index_1 = 0;
    window.addEventListener('keydown', function (event) {
        if (event.code === 'KeyJ') {
            indexAction_1('plus');
        }
        if (event.code === 'KeyK') {
            indexAction_1('minus');
        }
        if (event.code === 'KeyW') {
            addToWatchList_1();
        }
        if (event.code === 'KeyV') {
            openInNewTab_1();
        }
        if (event.code === 'Slash' && event.shiftKey) {
            showHelp_1();
        }
        if (event.code === 'Escape') {
            hideHelp_1();
        }
    });
    initScript();
}
