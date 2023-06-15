"use strict";
// ==UserScript==
// @name         eBay Seller Hider
// @namespace    bricemciver
// @description  Hide items from low/poor feedback eBay sellers and sponsored items
// @author       Brice McIver
// @license      MIT
// @version      0.0.5
// @match        *://*.ebay.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ebay.com
// ==/UserScript==
{
    var filterReviews_1 = true;
    var reviewMin_1 = 10;
    var filterFeedback_1 = true;
    var feedbackMin_1 = 95.0;
    var hideSponsored_1 = true;
    var sponsorClass_1 = '';
    var hideItem_1 = function (seller) {
        var _a, _b;
        var itemRegExp = RegExp(/\((.*)\) (.*)%/).exec(seller.innerText);
        if (itemRegExp) {
            var reviews = itemRegExp[1], feedback = itemRegExp[2];
            var reviewsNum = parseInt(reviews.replace(',', ''), 10);
            var feedbackNum = parseFloat(feedback);
            var parent_1 = seller.parentElement;
            while (parent_1 && parent_1.tagName !== 'LI') {
                parent_1 = parent_1.parentElement;
            }
            if (parent_1) {
                parent_1.style.display =
                    (filterReviews_1 && reviewsNum < reviewMin_1) || (filterFeedback_1 && feedbackNum < feedbackMin_1) ? 'none' : 'list-item';
                // don't bother looking for sponsored posts if already hidden
                if (hideSponsored_1 && parent_1.style.display === 'list-item') {
                    var hideSponsoredPost = false;
                    var sponsoredSpan = Array.from(parent_1.querySelectorAll('span')).find(function (item) { return item.textContent === 'Sponsored'; });
                    if (sponsoredSpan) {
                        var labelAttr = (_b = (_a = sponsoredSpan.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.getAttribute('aria-labelledBy');
                        if (labelAttr && labelAttr === sponsorClass_1) {
                            hideSponsoredPost = true;
                        }
                    }
                    parent_1.style.display = hideSponsoredPost ? 'none' : 'list-item';
                }
            }
        }
    };
    var createHeader_1 = function () {
        var header = document.createElement('div');
        var headerTitle = document.createElement('h3');
        headerTitle.classList.add('x-refine__item');
        headerTitle.textContent = 'Sellers';
        header.append(headerTitle);
        return header;
    };
    var createCheckboxEventListener_1 = function (valueName, checkbox) {
        if (valueName === 'reviewMin') {
            localStorage.setItem('filterReviews', checkbox.checked ? 'true' : 'false');
            updateFilter_1();
        }
        if (valueName === 'feedbackMin') {
            localStorage.setItem('filterFeedback', checkbox.checked ? 'true' : 'false');
            updateFilter_1();
        }
        if (valueName === 'hideSponsored') {
            localStorage.setItem('hideSponsored', checkbox.checked ? 'true' : 'false');
            updateFilter_1();
        }
    };
    var createCheckbox_1 = function (text, valueName) {
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.ariaLabel = text;
        checkbox.classList.add('cbx', 'x-refine__multi-select-checkbox');
        checkbox.autocomplete = 'off';
        checkbox.ariaHidden = 'true';
        checkbox.tabIndex = -1;
        checkbox.role = 'presentation';
        if ((valueName === 'reviewMin' && filterReviews_1) ||
            (valueName === 'feedbackMin' && filterFeedback_1) ||
            (valueName === 'hideSponsored' && hideSponsored_1)) {
            checkbox.setAttribute('checked', 'true');
        }
        checkbox.addEventListener('input', function () { return createCheckboxEventListener_1(valueName, checkbox); });
        return checkbox;
    };
    var createListItem_1 = function (text, valueName, value) {
        var listItem = document.createElement('li');
        listItem.classList.add('x-refine__main__list--value');
        var selectItem = document.createElement('div');
        selectItem.classList.add('x-refine__multi-select');
        var checkbox = createCheckbox_1(text, valueName);
        var checkboxText = document.createElement('span');
        checkboxText.classList.add('cbx', 'x-refine__multi-select-cbx');
        checkboxText.innerText = text;
        if (value) {
            var input = document.createElement('input');
            input.type = 'text';
            input.pattern = 'd*';
            input.value = value;
            input.addEventListener('change', function (evt) {
                var target = evt.target;
                if (target) {
                    localStorage.setItem(valueName, target.value);
                    updateFilter_1();
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
    var createGroup_1 = function () {
        var group = document.createElement('div');
        group.classList.add('x-refine__group');
        var listHeader = document.createElement('ul');
        listHeader.classList.add('x-refine__main__value');
        listHeader.style.clear = 'both';
        listHeader.append(createListItem_1('# of Reviews over ', 'reviewMin', reviewMin_1.toString()));
        listHeader.append(createListItem_1('Feedback over ', 'feedbackMin', feedbackMin_1.toString()));
        listHeader.append(createListItem_1('Hide sponsored', 'hideSponsored'));
        group.append(listHeader);
        return group;
    };
    var getPresets_1 = function () {
        var _a, _b;
        filterReviews_1 = localStorage.getItem('filterReviews') !== 'false';
        reviewMin_1 = parseInt((_a = localStorage.getItem('reviewMin')) !== null && _a !== void 0 ? _a : '10', 10);
        filterFeedback_1 = localStorage.getItem('filterFeedback') !== 'false';
        feedbackMin_1 = parseFloat((_b = localStorage.getItem('feedbackMin')) !== null && _b !== void 0 ? _b : '95.0');
        hideSponsored_1 = localStorage.getItem('hideSponsored') !== 'false';
    };
    var addFilter = function () {
        var menu = document.querySelector('.x-refine__left__nav');
        if (menu) {
            var list = document.createElement('li');
            list.classList.add('x-refine__main__list');
            list.append(createHeader_1());
            list.append(createGroup_1());
            menu.prepend(list);
        }
    };
    var updateFilter_1 = function () {
        getPresets_1();
        var sellers = document.querySelectorAll('span.s-item__seller-info-text');
        for (var _i = 0, _a = Array.from(sellers); _i < _a.length; _i++) {
            var seller = _a[_i];
            hideItem_1(seller);
        }
    };
    var findSponsoredClass = function () {
        var _a;
        // get inserted style
        var styleBlock = Array.from(document.head.getElementsByTagName('style')).find(function (item) { return item.type === 'text/css'; });
        if (styleBlock) {
            var cssRuleList = (_a = styleBlock.sheet) === null || _a === void 0 ? void 0 : _a.cssRules;
            if (cssRuleList) {
                var rule = Array.from(cssRuleList).find(function (item) { return item.cssText.includes('inline') && item.cssText.includes('span.'); });
                if (rule) {
                    var regex = /\.([a-zA-Z0-9_-]+)\s*\{/;
                    var match = regex.exec(rule.cssText);
                    if (match) {
                        sponsorClass_1 = match[1];
                    }
                }
            }
        }
    };
    getPresets_1();
    addFilter();
    updateFilter_1();
    findSponsoredClass();
}
