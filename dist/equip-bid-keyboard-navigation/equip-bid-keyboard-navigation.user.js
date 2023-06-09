// ==UserScript==
// @name         Equip-Bid Keyboard Nav
// @version      0.1
// @description  Use Feedly-style navigation on site
// @author       Brice McIver
// @match        https://www.equip-bid.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=equip-bid.com
// @grant        GM_xmlhttpRequest
// @connect      equip-bid.com
// ==/UserScript==
var _a;
const lotList = document.querySelector("div.lot-list");
const lots = Array.from((_a = lotList === null || lotList === void 0 ? void 0 : lotList.querySelectorAll('h4[id^="itemTitle"]')) !== null && _a !== void 0 ? _a : []);
const prevLink = document.querySelector("li.previous a");
const nextLink = document.querySelector("li.next a");
const helpTopics = [
    { section: "", items: [{ key: "?", description: "Keyboard shortcuts" }] },
    {
        section: "Auction items",
        items: [
            { key: "j", description: "Scroll to next auction item" },
            { key: "k", description: "Scroll to previous auction item" },
        ],
    },
    {
        section: "Selected item",
        items: [
            { key: "w", description: "Add item to watchlist" },
            { key: "v", description: "Open item in a new tab" },
        ],
    },
];
let index = -1;
window.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }
    switch (event.key) {
        case "J":
        case "j":
            index++;
            // Cancel the default action to avoid it being handled twice
            event.preventDefault();
            indexAction();
            break;
        case "K":
        case "k":
            index--;
            // Cancel the default action to avoid it being handled twice
            event.preventDefault();
            indexAction();
            break;
        case "W":
        case "w":
            event.preventDefault();
            addToWatchList();
            break;
        case "V":
        case "v":
            event.preventDefault();
            openInNewTab();
            break;
        case "?":
            event.preventDefault();
            showHelp();
            break;
        case "Escape":
            event.preventDefault();
            hideHelp();
            break;
        default:
            console.log("Key pressed " + event.key);
    }
}, true);
const indexAction = () => {
    // auto page navigation
    if (index < 0 && prevLink) {
        // go to previous page (if available)
        prevLink.click();
    }
    else if (index > lots.length - 1 && nextLink) {
        // go to next page (if available)
        nextLink.click();
    }
    else {
        lots[index].scrollIntoView();
    }
};
const addToWatchList = () => {
    var _a, _b, _c;
    // find the right watchlist button
    const watchlistButton = (_c = (_b = (_a = lots[index].parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.nextElementSibling) === null || _c === void 0 ? void 0 : _c.querySelector("a.item-watch-up");
    if (watchlistButton) {
        watchlistButton.click();
    }
};
const openInNewTab = () => {
    // find the url
    const url = lots[index].querySelector("a");
    if (url) {
        window.open(url.href, "_blank");
    }
};
const showHelp = () => {
    var _a;
    (_a = document
        .querySelector("dialog.ShortcutsHelp")) === null || _a === void 0 ? void 0 : _a.showModal();
};
const hideHelp = () => {
    var _a;
    (_a = document.querySelector("dialog.ShortcutsHelp")) === null || _a === void 0 ? void 0 : _a.close();
};
const createHelp = () => {
    const helpDiv = createElement("dialog", {
        className: "ShortcutsHelp",
    });
    const hintDiv = createElement("div", {
        className: "ShortcutsHelp__hint",
    }, "ESC to close");
    const title = createElement("div", {
        className: "ShortcutsHelp__title",
    }, "Keyboard Shortcuts Help");
    helpDiv.appendChild(hintDiv);
    helpDiv.appendChild(title);
    helpTopics.forEach((topic) => {
        const section = createElement("div", {
            className: "ShortcutsHelp__section",
        });
        const sectionTitle = createElement("div", {
            className: "ShortcutsHelp__section-title",
        }, topic.section);
        section.appendChild(sectionTitle);
        helpDiv.appendChild(section);
        topic.items.forEach((item) => {
            const itemDiv = createElement("div");
            const itemKey = createElement("span", {
                className: "ShortcutsHelp__shortcut",
            }, item.key);
            const itemValue = document.createTextNode(item.description);
            itemDiv.appendChild(itemKey);
            itemDiv.appendChild(itemValue);
            section.appendChild(itemDiv);
        });
    });
    return helpDiv;
};
function createElement(type, config, text) {
    const theElement = document.createElement(type);
    if (config) {
        for (const [key, value] of Object.entries(config)) {
            if (key.toLowerCase() === "classname") {
                theElement.setAttribute("class", value);
            }
            else {
                theElement.setAttribute(key, value);
            }
        }
    }
    if (text) {
        theElement.insertAdjacentText("afterbegin", text);
    }
    return theElement;
}
const initScript = () => {
    // load new styles
    const head = document.getElementsByTagName("head")[0];
    if (head) {
        const style = document.createElement("style");
        style.setAttribute("type", "text/css");
        style.textContent = `.ShortcutsHelp {
    animation: shortcuts-help-fade-in .25s ease-in-out;
    background-color: #111;
    border-radius: .25rem;
    color: #fff;
    font-size: 1.25rem;
    left: 50%;
    line-height: 17px;
    padding: 20px;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 350px;
    z-index: 99999
}

.ShortcutsHelp__title {
    border-bottom: 1px solid #444;
    color: #999;
    font-weight: 700;
    margin-bottom: 9px;
    padding-bottom: 9px
}

.ShortcutsHelp__hint {
    color: #999;
    float: right;
}

.ShortcutsHelp__section {
    margin-bottom: 17px;
    margin-top: 0
}

.ShortcutsHelp__section-title {
    color: #999;
    margin-bottom: 8px;
    margin-top: 9px
}

.ShortcutsHelp__shortcut {
    color: #2bb24c;
    display: inline-block;
    padding-right: 6px;
    width: 55px
}

@keyframes shortcuts-help-fade-in {
    from {
        opacity: 0
    }

    to {
        opacity: 1
    }
}

@keyframes shortcuts-help-fade-out {
    from {
        opacity: 1
    }

    to {
        opacity: 0
    }
}`;
        head.appendChild(style);
    }
    // create help div
    const helpDiv = createHelp();
    // attach to body
    document.body.appendChild(helpDiv);
};
initScript();
export {};
//# sourceMappingURL=equip-bid-keyboard-navigation.user.js.map