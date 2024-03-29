"use strict";
// ==UserScript==
// @name         Amazon - Add to Goodreads widget
// @namespace    bricemciver
// @description  Places an "Add to Goodreads" widget on Amazon book pages
// @author       Brice McIver
// @license      MIT
// @version      0.0.5
// @match        https://amazon.com/*
// @match        https://*.amazon.com/*
// @match        https://amazon.co.uk/*
// @match        https://*.amazon.co.uk/*
// @match        https://amazon.ca/*
// @match        https://*.amazon.ca/*
// @match        https://amazon.de/*
// @match        https://*.amazon.de/*
// @match        https://amazon.fr/*
// @match        https://*.amazon.fr/*
// @match        https://amazon.es/*
// @match        https://*.amazon.es/*
// @match        https://amazon.it/*
// @match        https://*.amazon.it/*
// @match        https://amazon.co.jp/*
// @match        https://*.amazon.co.jp/*
// @match        https://amazon.cn/*
// @match        https://*.amazon.cn/*
// @match        https://amazon.com.br/*
// @match        https://*.amazon.com.br/*
// @match        https://amazon.in/*
// @match        https://*.amazon.in/*
// @match        https://amazon.com.mx/*
// @match        https://*.amazon.com.mx/*
// @match        https://amazon.com.au/*
// @match        https://*.amazon.com.au/*
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// ==/UserScript==
{
    var asinRegex_1 = /\/([A-Z0-9]{10})/;
    var findASIN_1 = function () {
        var array = asinRegex_1.exec(document.location.pathname);
        var asin = array && array.length > 1 ? array[1] : '';
        // eslint-disable-next-line no-console
        console.log("ASIN in pathname: ".concat(asin));
        // determine if book
        var dp = document.getElementById('dp');
        return (dp === null || dp === void 0 ? void 0 : dp.className.includes('book')) ? asin : '';
    };
    var findInsertPoint_1 = function () { return document.getElementById('averageCustomerReviews'); };
    var insertElement_1 = function (isbn, insertPoint) {
        var elem = document.createElement('div');
        elem.id = 'gr_add_to_books';
        elem.innerHTML = [
            '<div class="gr_custom_each_container_">',
            '<a target="_blank" style="border:none" rel="nofollow noopener noreferrer" href="https://www.goodreads.com/book/isbn/',
            isbn,
            '"><img src="https://www.goodreads.com/images/atmb_add_book-70x25.png" /></a>',
            '</div>',
        ].join('');
        var script = document.createElement('script');
        script.src = 'https://www.goodreads.com/book/add_to_books_widget_frame/' + isbn + '?atmb_widget%5Glutton%5D=atmb_widget_1.png';
        insertPoint.appendChild(elem);
        insertPoint.appendChild(script);
    };
    var main = function () {
        var ASIN = findASIN_1();
        var insertPoint = findInsertPoint_1();
        if (ASIN && insertPoint) {
            insertElement_1(ASIN, insertPoint);
        }
    };
    main();
}
