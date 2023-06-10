// ==UserScript==
// @name         eBay Seller Hider
// @namespace    bricemciver
// @description  Hide items from low/poor feedback eBay sellers and sponsored items
// @license      MIT
// @version      0.0.5
// @match        *://*.ebay.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ebay.com
// ==/UserScript==
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let filterReviews = true;
    let reviewMin = 10;
    let filterFeedback = true;
    let feedbackMin = 95.0;
    let hideSponsored = true;
    const hideItem = (seller) => {
        const itemRegExp = RegExp(/\((.*)\) (.*)%/).exec(seller.innerText);
        if (itemRegExp) {
            const [, reviews, feedback] = itemRegExp;
            const reviewsNum = parseInt(reviews.replace(',', ''), 10);
            const feedbackNum = parseFloat(feedback);
            let parent = seller.parentElement;
            while (parent && parent.tagName !== 'LI') {
                parent = parent.parentElement;
            }
            if (parent) {
                parent.style.display =
                    (filterReviews && reviewsNum < reviewMin) || (filterFeedback && feedbackNum < feedbackMin) ? 'none' : 'list-item';
            }
        }
    };
    const createHeader = () => {
        const header = document.createElement('div');
        const headerTitle = document.createElement('h3');
        headerTitle.classList.add('x-refine__item');
        headerTitle.textContent = 'Sellers';
        header.append(headerTitle);
        return header;
    };
    const createCheckboxEventListener = (valueName, checkbox) => {
        if (valueName === 'reviewMin') {
            localStorage.setItem('filterReviews', checkbox.checked ? 'true' : 'false');
            updateFilter();
        }
        if (valueName === 'feedbackMin') {
            localStorage.setItem('filterFeedback', checkbox.checked ? 'true' : 'false');
            updateFilter();
        }
        if (valueName === 'hideSponsored') {
            localStorage.setItem('hideSponsored', checkbox.checked ? 'true' : 'false');
            filterSponsored();
        }
    };
    const createCheckbox = (text, valueName) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.ariaLabel = text;
        checkbox.classList.add('cbx', 'x-refine__multi-select-checkbox');
        checkbox.autocomplete = 'off';
        checkbox.ariaHidden = 'true';
        checkbox.tabIndex = -1;
        checkbox.role = 'presentation';
        if ((valueName === 'reviewMin' && filterReviews) ||
            (valueName === 'feedbackMin' && filterFeedback) ||
            (valueName === 'hideSponsored' && hideSponsored)) {
            checkbox.setAttribute('checked', 'true');
        }
        checkbox.addEventListener('input', () => createCheckboxEventListener(valueName, checkbox));
        return checkbox;
    };
    const createListItem = (text, valueName, value) => {
        const listItem = document.createElement('li');
        listItem.classList.add('x-refine__main__list--value');
        const selectItem = document.createElement('div');
        selectItem.classList.add('x-refine__multi-select');
        const checkbox = createCheckbox(text, valueName);
        const checkboxText = document.createElement('span');
        checkboxText.classList.add('cbx', 'x-refine__multi-select-cbx');
        checkboxText.innerText = text;
        if (value) {
            const input = document.createElement('input');
            input.type = 'text';
            input.pattern = 'd*';
            input.value = value;
            input.addEventListener('change', evt => {
                const target = evt.target;
                if (target) {
                    localStorage.setItem(valueName, target.value);
                    updateFilter();
                }
            });
            input.style.height = '22px';
            input.style.width = '50px';
            input.style.margin = '-3px 0 0 8px';
            input.style.padding = '3px';
            input.style.float = 'right';
            input.style.fontSize = '11px';
            checkboxText.append(input);
        }
        selectItem.append(checkbox);
        selectItem.append(checkboxText);
        listItem.append(selectItem);
        return listItem;
    };
    const createGroup = () => {
        const group = document.createElement('div');
        group.classList.add('x-refine__group');
        const listHeader = document.createElement('ul');
        listHeader.classList.add('x-refine__main__value');
        listHeader.style.clear = 'both';
        listHeader.append(createListItem('# of Reviews over ', 'reviewMin', reviewMin.toString()));
        listHeader.append(createListItem('Feedback over ', 'feedbackMin', feedbackMin.toString()));
        listHeader.append(createListItem('Hide sponsored', 'hideSponsored', 'false'));
        group.append(listHeader);
        return group;
    };
    const getPresets = () => {
        var _a, _b;
        filterReviews = localStorage.getItem('filterReviews') !== 'false';
        reviewMin = parseInt((_a = localStorage.getItem('reviewMin')) !== null && _a !== void 0 ? _a : '10', 10);
        filterFeedback = localStorage.getItem('filterFeedback') !== 'false';
        feedbackMin = parseFloat((_b = localStorage.getItem('feedbackMin')) !== null && _b !== void 0 ? _b : '95.0');
        hideSponsored = localStorage.getItem('hideSponsored') !== 'false';
    };
    const addFilter = () => {
        const menu = document.querySelector('.x-refine__left__nav');
        if (menu) {
            const list = document.createElement('li');
            list.classList.add('x-refine__main__list');
            list.append(createHeader());
            list.append(createGroup());
            menu.prepend(list);
        }
    };
    const updateFilter = () => {
        getPresets();
        const sellers = document.querySelectorAll('span.s-item__seller-info-text');
        for (const seller of Array.from(sellers)) {
            hideItem(seller);
        }
    };
    const filterSponsored = () => {
        getPresets();
        const sellers = document.querySelectorAll('div.s-item__title--tagblock > span[role="text"]');
        sellers.forEach(seller => {
            // look at children to determine text
            const labels = {};
            for (const element of Array.from(seller.children)) {
                const node = element;
                // group by class
                if (!labels[node.className]) {
                    labels[node.className] = '';
                }
                labels[node.className] += node.innerText;
            }
            if (Object.values(labels).some(label => label.startsWith('SPONSORED'))) {
                let parent = seller.parentElement;
                while (parent && parent.tagName !== 'LI') {
                    parent = parent.parentElement;
                }
                if (parent) {
                    parent.style.display = hideSponsored ? 'none' : 'list-item';
                }
            }
        });
    };
    getPresets();
    addFilter();
    updateFilter();
    filterSponsored();
});
//# sourceMappingURL=ebay-seller-hider.user.js.map