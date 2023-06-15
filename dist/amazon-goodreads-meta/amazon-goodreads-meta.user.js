"use strict";
// ==UserScript==
// @name         Amazon - Goodreads metadata
// @namespace    bricemciver
// @description  Shows the ratings from Goodreads on Amazon book pages
// @author       Brice McIver
// @license      MIT
// @version      0.0.2
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
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// ==/UserScript==
{
    var asinRegex_1 = /\/([A-Z0-9]{10})/;
    var findASIN_1 = function () {
        var asinArray = [];
        var array = asinRegex_1.exec(document.location.pathname);
        var asin = array && array.length > 1 ? array[1] : '';
        // eslint-disable-next-line no-console
        console.log("ASIN in pathname: ".concat(asin));
        // determine if book
        var dp = document.getElementById('dp');
        if (dp === null || dp === void 0 ? void 0 : dp.className.includes('book')) {
            asinArray.push(asin);
        }
        else {
            // see if we are on a page with multiple books
            var images = document.getElementsByTagName('img');
            var coverImages = Array.from(images).filter(function (item) { return item.classList.contains('cover-image'); });
            coverImages.forEach(function (image) {
                var parentElem = image.parentElement;
                if (parentElem instanceof HTMLAnchorElement) {
                    var link = parentElem.href;
                    var ciArray = asinRegex_1.exec(link);
                    var ciAsin = ciArray && ciArray.length > 1 ? ciArray[1] : '';
                    // eslint-disable-next-line no-console
                    console.log("ASIN on book image: ".concat(ciAsin));
                    asinArray.push(ciAsin);
                }
            });
        }
        return asinArray;
    };
    var findInsertPoint_1 = function () {
        // on book page
        var insertPoint = [];
        var reviewElement = document.getElementById('averageCustomerReviews');
        if (reviewElement) {
            insertPoint.push(reviewElement);
        }
        else {
            // check for SHOP NOW button with review stars above. Return array
            var reviewArray = document.getElementsByClassName('pf-image-w');
            insertPoint.push.apply(insertPoint, Array.from(reviewArray));
        }
        return insertPoint;
    };
    var insertElement_1 = function (isbn, insertPoint) {
        GM.xmlHttpRequest({
            method: 'GET',
            url: "https://www.goodreads.com/book/isbn/".concat(isbn),
            onload: function (response) {
                var node = new DOMParser().parseFromString(response.responseText, 'text/html');
                // get styles we need
                var head = document.getElementsByTagName('head')[0];
                var styles = Array.from(node.getElementsByTagName('link')).filter(function (item) { return item.rel === 'stylesheet'; });
                styles.forEach(function (item) {
                    // add goodreads to links
                    item.href = item.href.replace('amazon', 'goodreads');
                    head.appendChild(item);
                });
                var meta = node.getElementById('ReviewsSection');
                if (meta) {
                    // find our div
                    var rating = meta.querySelector('div.RatingStatistics');
                    if (rating) {
                        // replace links
                        Array.from(rating.getElementsByTagName('a')).forEach(function (item) {
                            item.href = response.finalUrl + item.href.replace(item.baseURI, '');
                            return item;
                        });
                        // replace styles
                        Array.from(rating.getElementsByTagName('span')).forEach(function (item) {
                            item.classList.replace('RatingStar--medium', 'RatingStar--small');
                            item.classList.replace('RatingStars__medium', 'RatingStars__small');
                        });
                        Array.from(rating.getElementsByTagName('div'))
                            .filter(function (item) { return item.classList.contains('RatingStatistics__rating'); })
                            .forEach(function (item) {
                            item.style.marginBottom = '-0.8rem';
                            item.style.fontSize = '2.2rem';
                        });
                        // create label div
                        var labelCol = document.createElement('div');
                        labelCol.classList.add('a-column', 'a-span12', 'a-spacing-top-small');
                        var labelRow = document.createElement('div');
                        labelRow.classList.add('a-row', 'a-spacing-small');
                        labelRow.textContent = 'Goodreads';
                        var lineBreak = document.createElement('br');
                        labelCol.appendChild(labelRow);
                        labelRow.appendChild(lineBreak);
                        labelRow.appendChild(rating);
                        insertPoint.appendChild(labelCol);
                    }
                }
            },
        });
    };
    var main = function () {
        var ASIN = findASIN_1();
        var insertPoint = findInsertPoint_1();
        for (var i = 0; i < ASIN.length && i < insertPoint.length; i++) {
            var insertPointElement = insertPoint[i].parentElement;
            if (insertPointElement) {
                insertElement_1(ASIN[i], insertPointElement);
            }
        }
    };
    main();
}
