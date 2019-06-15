// ==UserScript==
// @name          Amazon - Add to Goodreads widget
// @description   Places an "Add to Goodreads" widget on Amazon book pages
// @version       0.0.2
// @include       *://amazon.tld/*
// @include       *://*.amazon.tld/*
// @author        bricem
// @namespace     bricem.scripts
// ==/UserScript==

function findISBN() {
    var bookSource = document.getElementById("dp-container").innerHTML;
    // Look for 13 digit ISBN first
    var isbn13 = bookSource.match(/ISBN.+(\d{13})/);
    // if we don't find it, search for 10 digit one
    var retVal = (!isbn13) ? bookSource.match(/ISBN.+(\d{10})/) : isbn13;
    console.log(retVal);
    return retVal ? retVal[1] : null;
}

function findInsertPoint() {
    return document.evaluate("//div[@id='averageCustomerReviews']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function findTitle() {
    return document.evaluate("//h1[@id='title']/span", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function insertElement(isbn, title, insertPoint) {
    var elem = document.createElement("div");
    elem.id = "gr_add_to_books";
    elem.innerHTML = ['<div class="gr_custom_each_container_">',
        '<a target="_blank" style="border:none" href="https://www.goodreads.com/book/isbn/',
        isbn,
        '"><img alt="',
        title,
        '" src="https://www.goodreads.com/images/atmb_add_book-70x25.png" /></a>',
        '</div>'].join('');
    var script = document.createElement("script");
    script.src = "https://www.goodreads.com/book/add_to_books_widget_frame/" + isbn + "?atmb_widget%5Bbutton%5D=atmb_widget_1.png";
    insertPoint.appendChild(elem);
    insertPoint.appendChild(script);
}

function main() {
    var ISBN = findISBN();
    var title = findTitle();
    var insertPoint = findInsertPoint();
    if (ISBN && title && insertPoint) {
        insertElement(ISBN, title, insertPoint);
    }
}

main();