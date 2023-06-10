// ==UserScript==
// @name         Amazon - Goodreads metadata
// @namespace    bricemciver
// @description  Shows the ratings from Goodreads on Amazon book pages
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
        const parentElem = image.parentElement;
        if (parentElem instanceof HTMLAnchorElement) {
          const link = parentElem.href;
          const ciArray = asinRegex.exec(link);
          const ciAsin = ciArray && ciArray.length > 1 ? ciArray[1] : '';
          // eslint-disable-next-line no-console
          console.log(`ASIN on book image: ${ciAsin}`);
          asinArray.push(ciAsin);
        }
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
        styles.forEach(item => {
          // add goodreads to links
          item.href = item.href.replace('amazon', 'goodreads');
          head.appendChild(item);
        });
        const meta = node.getElementById('ReviewsSection');
        if (meta) {
          // find our div
          const rating = meta.querySelector('div.RatingStatistics');
          if (rating) {
            // replace links
            Array.from(rating.getElementsByTagName('a')).forEach(item => {
              item.href = response.finalUrl + item.href.replace(item.baseURI, '');
              return item;
            });
            // replace styles
            Array.from(rating.getElementsByTagName('span')).forEach(item => {
              item.classList.replace('RatingStar--medium', 'RatingStar--small');
              item.classList.replace('RatingStars__medium', 'RatingStars__small');
            });
            Array.from(rating.getElementsByTagName('div'))
              .filter(item => item.classList.contains('RatingStatistics__rating'))
              .forEach(item => {
                item.style.marginBottom = '-0.8rem';
                item.style.fontSize = '2.2rem';
              });
            // create label div
            const labelCol = document.createElement('div');
            labelCol.classList.add('a-column', 'a-span12', 'a-spacing-top-small');
            const labelRow = document.createElement('div');
            labelRow.classList.add('a-row', 'a-spacing-small');
            labelRow.textContent = 'Goodreads';
            const lineBreak = document.createElement('br');
            labelCol.appendChild(labelRow);
            labelRow.appendChild(lineBreak);
            labelRow.appendChild(rating);
            insertPoint.appendChild(labelCol);
          }
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
}
