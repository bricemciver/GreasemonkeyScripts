// ==UserScript==
// @name         Convert HTML to Bootstrap List Group Items
// @namespace    http://tampermonkey.net/
// @version      2024-04-17
// @description  Converts HTML entries to Bootstrap list group items
// @author       You
// @match        https://www.equip-bid.com/auction/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=equip-bid.com
// @grant        none
// ==/UserScript==

let currentIndex = 0;

const addFocusStyling = () => {
  const styleEl = document.createElement('style');
  document.head.appendChild(styleEl);
  styleEl.sheet?.insertRule('li.list-group-item.focused{outline: Highlight auto 1px; outline:-webkit-focus-ring-color auto 1px;}');
};

const retrieveNextPage = (href: string) => {
  // fetch the next page
  fetch(href)
    .then(response => response.text())
    .then(data => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, 'text/html');
      const entries = doc.querySelectorAll<HTMLDivElement>('div.lot-divider');
      if (!entries.length) return;

      const listGroup = document.querySelector<HTMLUListElement>('div.lot-list > ul.list-group');
      if (!listGroup) return;

      entries.forEach(entry => {
        const listGroupItem = document.createElement('li');
        listGroupItem.classList.add('list-group-item');
        if (entry.previousElementSibling?.previousElementSibling?.previousElementSibling) {
          listGroupItem.appendChild(entry.previousElementSibling?.previousElementSibling?.previousElementSibling);
        }
        if (entry.previousElementSibling?.previousElementSibling) {
          listGroupItem.appendChild(entry.previousElementSibling?.previousElementSibling);
        }
        if (entry.previousElementSibling) {
          listGroupItem.appendChild(entry.previousElementSibling);
        }
        entry.nextElementSibling?.remove();
        entry.remove();
        listGroup.appendChild(listGroupItem);
      });

      keyboardNavigation();
    });
};

// Add keyboard navigation
const keyboardNavigation = () => {
  const listGroup = document.querySelector<HTMLUListElement>('div.lot-list > ul.list-group');
  if (!listGroup) return;

  const listGroupItems = Array.from(listGroup.querySelectorAll<HTMLLIElement>('li.list-group-item'));
  // get next link
  const next = document.querySelector<HTMLAnchorElement>('li.next > a');

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'k') {
      event.preventDefault();
      // clear previous focused tag
      listGroupItems[currentIndex].classList.remove('focused');
      currentIndex = currentIndex - 1;
      if (currentIndex < 0) {
        currentIndex = 0;
      } else {
        // scroll into view
        listGroupItems[currentIndex].scrollIntoView({ block: 'center' });
        // focus next tag
        listGroupItems[currentIndex].classList.add('focused');
      }
    }
    if (event.key === 'j') {
      event.preventDefault();
      // clear previous focused tag
      listGroupItems[currentIndex].classList.remove('focused');
      currentIndex = currentIndex + 1;
      if (currentIndex >= listGroupItems.length) {
        if (next) {
          retrieveNextPage(next.href);
        } else {
          currentIndex = listGroupItems.length - 1;
        }
      } else {
        // scroll into view
        listGroupItems[currentIndex].scrollIntoView({ block: 'center' });
        // focus next tag
        listGroupItems[currentIndex].classList.add('focused');
      }
    }
  };

  document.documentElement.addEventListener('keydown', handleKeyDown);
  // scroll into view
  listGroupItems[currentIndex].scrollIntoView({ block: 'center' });
  // focus next tag
  listGroupItems[currentIndex].classList.add('focused');
};

const processEntries = () => {
  const entries = document.querySelectorAll<HTMLDivElement>('div.lot-divider');
  if (!entries.length) return;

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group');
  entries.forEach(entry => {
    const listGroupItem = document.createElement('li');
    listGroupItem.classList.add('list-group-item');
    if (entry.previousElementSibling?.previousElementSibling?.previousElementSibling) {
      listGroupItem.appendChild(entry.previousElementSibling?.previousElementSibling?.previousElementSibling);
    }
    if (entry.previousElementSibling?.previousElementSibling) {
      listGroupItem.appendChild(entry.previousElementSibling?.previousElementSibling);
    }
    if (entry.previousElementSibling) {
      listGroupItem.appendChild(entry.previousElementSibling);
    }
    entry.nextElementSibling?.remove();
    entry.remove();
    listGroup.appendChild(listGroupItem);
  });

  const lotList = document.querySelector<HTMLDivElement>('div.lot-list > hr');
  if (!lotList) return;

  lotList.insertAdjacentElement('afterend', listGroup);

  keyboardNavigation();
};

addFocusStyling();
processEntries();
