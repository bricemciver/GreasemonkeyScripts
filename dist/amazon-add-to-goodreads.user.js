// ==UserScript==
// @name         Amazon - Add to Goodreads widget
// @namespace    https://github.com/bricemciver/GreasemonekeyScripts
// @version      1.0.1
// @author       Brice McIver
// @description  Places an "Add to Goodreads" widget on Amazon book pages
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @downloadURL  https://greasyfork.org/en/scripts/468321-amazon-add-to-goodreads-widget
// @match        https://openuserjs.org/scripts/*
// @match        http://localhost:8080/scripts/*
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
// ==/UserScript==

;(function () {
  var asinRegex = /\/([A-Z0-9]{10})/
  var findASIN = () => {
    const array = asinRegex.exec(document.location.pathname)
    const asin = array && array.length > 1 ? array[1] : ''
    console.log(`ASIN in pathname: ${asin}`)
    return document.getElementById('dp')?.className.includes('book') ? asin : ''
  }
  var findInsertPoint = () => document.getElementById('averageCustomerReviews')
  var insertElement = (isbn, insertPoint) => {
    const elem = document.createElement('div')
    elem.id = 'gr_add_to_books'
    elem.innerHTML = [
      '<div class="gr_custom_each_container_">',
      '<a target="_blank" style="border:none" rel="nofollow noopener noreferrer" href="https://www.goodreads.com/book/isbn/',
      isbn,
      '"><img src="https://www.goodreads.com/images/atmb_add_book-70x25.png" /></a>',
      '</div>',
    ].join('')
    const script = document.createElement('script')
    script.src = `https://www.goodreads.com/book/add_to_books_widget_frame/${isbn}?atmb_widget%5Glutton%5D=atmb_widget_1.png`
    insertPoint.appendChild(elem)
    insertPoint.appendChild(script)
  }
  var main = () => {
    const ASIN = findASIN()
    const insertPoint = findInsertPoint()
    if (ASIN && insertPoint) insertElement(ASIN, insertPoint)
  }
  main()
})()
