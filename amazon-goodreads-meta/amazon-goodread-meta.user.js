// ==UserScript==
// @name          Amazon - Goodreads metadata
// @description   Shows the ratings from Goodreads on Amazon book pages
// @version       0.0.1
// @include       *://amazon.tld/*
// @include       *://*.amazon.tld/*
// @license       MIT
// @author        bricem
// @namespace     bricem.scripts
// @grant         GM_xmlhttpRequest
// ==/UserScript==

const asinRegex = /\/([A-Z0-9]{10})/

const findASIN = () => {
  const array = asinRegex.exec(document.location.pathname)
  const asin = array && array.length > 1 ? array[1] : ''
  console.log(`ASIN in pathname: ${asin}`)
  // determine if book
  const dp = document.getElementById('dp')
  if (dp && dp.className.includes('book')) {
      return asin
  }
  // see if we are on a page with muliple books
  const coverImages = document.getElementsByClassName('cover-image')
  if (coverImages) {
      return Array.prototype.map.call(coverImages, (item) => {
          const ciArray = asinRegex.exec(item.src)
          const ciAsin = ciArray && ciArray.length > 1 ? ciArray[1] : ''
          console.log(`ASIN on book image: ${ciAsin}`)
          return ciAsin
      })
  }
  return ''
}

const findInsertPoint = () => {
    // on book page
    let insertPoint = document.getElementById('averageCustomerReviews')
    if (insertPoint) {
        return insertPoint
    }
    // check for SHOP NOW button with review stars above. Return array
    insertPoint = document.getElementsByClassName('pf-image-w')
    if (insertPoint) {
        return insertPoint
    }
    return ''
}

const insertElement = (isbn, insertPoint) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url: `https://www.goodreads.com/book/isbn/${isbn}`,
      onload: (response) => {
        const node = new DOMParser().parseFromString(response.responseText, 'text/html')
        // get styles we need
        const head = document.getElementsByTagName('head')[0];
        const styles = Array.prototype.filter.call(node.getElementsByTagName('link'), (item) => item.rel === 'stylesheet')
        Array.prototype.forEach.call(styles, (item) => head.appendChild(item))
        const meta = node.getElementById('bookMeta')
        // replace links
        Array.prototype.map.call(meta.getElementsByTagName('a'), (item) => {
            item.href = response.finalUrl + item.href.replace(item.baseURI, '')
            return item
        })
        insertPoint.appendChild(meta)
      }
    });
}

const main = () => {
  const ASIN = findASIN()
  const insertPoint = findInsertPoint()
  if (ASIN && insertPoint) {
    if (Array.isArray(ASIN)) {
        for (let i = 0; i < ASIN.length; i++) {
            insertElement(ASIN[i], insertPoint[i].parentElement)
        }
    } else {
        insertElement(ASIN, insertPoint)
    }
  }
}

main()
