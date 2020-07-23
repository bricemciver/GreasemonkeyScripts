// ==UserScript==
// @name          Amazon - Add to Goodreads widget
// @description   Places an "Add to Goodreads" widget on Amazon book pages
// @version       0.0.3
// @include       *://amazon.tld/*
// @include       *://*.amazon.tld/*
// @license       MIT
// @author        bricem
// @namespace     bricem.scripts
// ==/UserScript==

const isbnRegex = /\d{10}/

const findISBN = () => {
  // check first if we're on a book page, if so use it
  const array = isbnRegex.exec(document.location.pathname)
  let isbn = (array) ? array[0] : ''
  // if it's blank, see if a book version of the current page exists, use that
  if (!isbn) {
    const links = document.querySelectorAll('#MediaMatrix a[href*=dp]')
    for (const link of links) {
        const res = isbnRegex.exec(link.href)
        if (res && res[0]) {
            isbn = res[0]
            break
        }
    }
  }
  console.log('ISBN:' + isbn)
  return isbn
}

const findInsertPoint = () => (
  document.evaluate(
    "//div[@id='averageCustomerReviews']",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue
)

const findTitle = () => (
  document.evaluate(
    "//h1[@id='title']/span",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue
)

const insertElement = (isbn, title, insertPoint) => {
  var elem = document.createElement("div")
  elem.id = "gr_add_to_books"
  elem.innerHTML = [
    '<div class="gr_custom_each_container_">',
    '<a target="_blank" style="border:none" href="https://www.goodreads.com/book/isbn/',
    isbn,
    '"><img alt="',
    title,
    '" src="https://www.goodreads.com/images/atmb_add_book-70x25.png" /></a>',
    "</div>",
  ].join("")
  var script = document.createElement("script")
  script.src =
    "https://www.goodreads.com/book/add_to_books_widget_frame/" +
    isbn +
    "?atmb_widget%5Bbutton%5D=atmb_widget_1.png"
  insertPoint.appendChild(elem)
  insertPoint.appendChild(script)
}

const main = () => {
  const ISBN = findISBN()
  const title = findTitle()
  const insertPoint = findInsertPoint()
  if (ISBN && title && insertPoint) {
    insertElement(ISBN, title, insertPoint);
  }
}

main()
