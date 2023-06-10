// ==UserScript==
// @name         Amazon - Goodreads metadata
// @namespace    bricemciver
// @description  Shows the ratings from Goodreads on Amazon book pages
// @license      MIT
// @version      0.0.2
// @match        *://amazon.tld/*
// @match        *://*.amazon.tld/*
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// ==/UserScript==

const asinRegex = /\/([A-Z0-9]{10})/;

const findASIN = (): string[] => {
  const asinArray = [];
  const array = asinRegex.exec(document.location.pathname);
  const asin = array && array.length > 1 ? array[1] : '';
  // eslint-disable-next-line no-console
  console.log(`ASIN in pathname: ${asin}`);
  // determine if book
  const dp = document.getElementById('dp');
  if (dp?.className.includes('book')) {
    asinArray.push(asin);
  } else {
    // see if we are on a page with multiple books
    const images = document.getElementsByTagName('img');

    const coverImages = Array.from(images).filter(item => item.classList.contains('cover-image'));
    coverImages.forEach(image => {
      const ciArray = asinRegex.exec(image.src);
      const ciAsin = ciArray && ciArray.length > 1 ? ciArray[1] : '';
      // eslint-disable-next-line no-console
      console.log(`ASIN on book image: ${ciAsin}`);
      asinArray.push(ciAsin);
    });
  }

  return asinArray;
};

const findInsertPoint = (): Element[] => {
  // on book page
  const insertPoint: Element[] = [];
  const reviewElement = document.getElementById('averageCustomerReviews');
  if (reviewElement) {
    insertPoint.push(reviewElement);
  } else {
    // check for SHOP NOW button with review stars above. Return array
    const reviewArray = document.getElementsByClassName('pf-image-w');
    insertPoint.push(...Array.from(reviewArray));
  }
  return insertPoint;
};

const insertElement = (isbn: string, insertPoint: Element): void => {
  GM.xmlHttpRequest({
    method: 'GET',
    url: `https://www.goodreads.com/book/isbn/${isbn}`,
    onload(response) {
      const node = new DOMParser().parseFromString(response.responseText, 'text/html');
      // get styles we need
      const head = document.getElementsByTagName('head')[0];
      const styles = Array.from(node.getElementsByTagName('link')).filter(item => item.rel === 'stylesheet');
      styles.forEach(item => head.appendChild(item));
      const meta = node.getElementById('bookMeta');
      if (meta) {
        // replace links
        Array.from(meta.getElementsByTagName('a')).forEach(item => {
          item.href = response.finalUrl + item.href.replace(item.baseURI, '');
          return item;
        });
        insertPoint.appendChild(meta);
      }
    },
  });
};

const main = (): void => {
  const ASIN = findASIN();
  const insertPoint = findInsertPoint();
  for (let i = 0; i < ASIN.length && i < insertPoint.length; i++) {
    const insertPointElement = insertPoint[i].parentElement;
    if (insertPointElement) {
      insertElement(ASIN[i], insertPointElement);
    }
  }
};

main();
