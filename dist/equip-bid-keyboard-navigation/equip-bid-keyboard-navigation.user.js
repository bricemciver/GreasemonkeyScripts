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
            lots_1[index_1].classList.toggle('selected_lot', false);
            index_1++;
            lots_1[index_1].classList.toggle('selected_lot', true);
            lots_1[index_1].scrollIntoView({
                block: 'center',
            });
        }
        else if (action === 'minus') {
            lots_1[index_1].classList.toggle('selected_lot', false);
            index_1--;
            lots_1[index_1].classList.toggle('selected_lot', true);
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
            style.sheet.insertRule(".lot {\n    margin-bottom: 34px;\n    min-height: 136px;\n    padding: 33px;\n    color: #333;\n    border: 1px solid rgba(0,0,0,.05);\n    border-radius: 3px;\n    position: relative;\n    z-index: 2\n}");
            style.sheet.insertRule(".selected_lot {\n      outline: 5px auto -webkit-focus-ring-color;\n      outline-offset: -2px\n}");
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
        // copy list of children
        var children = Array.from(lotList.children);
        for (var i = 4; i < children.length; i++) {
            // find blocks of divs we want to enclose
            // search backwards to avoid out of index
            var row1 = children[i - 4];
            var row2 = children[i - 3];
            var row3 = children[i - 2];
            var row4 = children[i - 1];
            var row5 = children[i];
            if (row1.classList.contains('row') &&
                row2.classList.contains('row') &&
                row3.classList.contains('row') &&
                row4.classList.contains('hidden-md') &&
                row5.classList.contains('hidden-xs')) {
                // we found our block
                newNode = document.createElement('div');
                newNode.classList.add('lot');
                children.splice(i - 4, 5, newNode);
                newNode.append(row1, row2, row3);
                i = i - 4;
            }
        }
        // replace lotlist children with new list
        lotList.replaceChildren.apply(lotList, children);
        lots_1 = Array.from(document.querySelectorAll('div.lot'));
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
