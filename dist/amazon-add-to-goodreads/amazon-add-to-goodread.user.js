"use strict";
// ==UserScript==
// @name          Amazon - Add to Goodreads widget
// @description   Places an "Add to Goodreads" widget on Amazon book pages
// @version       0.0.5
// @include       *://amazon.tld/*
// @include       *://*.amazon.tld/*
// @license       MIT
// @author        Brice McIver
// ==/UserScript==
Object.defineProperty(exports, "__esModule", { value: true });
const asinRegex = /\/([A-Z0-9]{10})/;
const findASIN = () => {
    const array = asinRegex.exec(document.location.pathname);
    const asin = array && array.length > 1 ? array[1] : "";
    console.log(`ASIN in pathname: ${asin}`);
    // determine if book
    const dp = document.getElementById("dp");
    return (dp === null || dp === void 0 ? void 0 : dp.className.includes("book")) ? asin : "";
};
const findInsertPoint = () => document.getElementById("averageCustomerReviews");
const insertElement = (isbn, insertPoint) => {
    const elem = document.createElement("div");
    elem.id = "gr_add_to_books";
    elem.innerHTML = [
        '<div class="gr_custom_each_container_">',
        '<a target="_blank" style="border:none" rel="nofollow noopener noreferrer" href="https://www.goodreads.com/book/isbn/',
        isbn,
        '"><img src="https://www.goodreads.com/images/atmb_add_book-70x25.png" /></a>',
        "</div>",
    ].join("");
    const script = document.createElement("script");
    script.src =
        "https://www.goodreads.com/book/add_to_books_widget_frame/" +
            isbn +
            "?atmb_widget%5Glutton%5D=atmb_widget_1.png";
    insertPoint.appendChild(elem);
    insertPoint.appendChild(script);
};
const main = () => {
    const ASIN = findASIN();
    const insertPoint = findInsertPoint();
    if (ASIN && insertPoint) {
        insertElement(ASIN, insertPoint);
    }
};
main();
//# sourceMappingURL=amazon-add-to-goodread.user.js.map