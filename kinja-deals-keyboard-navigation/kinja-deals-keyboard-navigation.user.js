// ==UserScript==
// @name Kinja Deals Keyboard Navigation
// @description Use 'j' and 'k' key navigation of post content
// @match *://*.theinventory.com/*
// @version 0.0.1
// @author bricem
// @namespace bricem.scripts
// @grant none
// ==/UserScript==

function keyPressed(event) {
    if ((event.code == 'KeyK') || (event.code == 'KeyJ')) {
        if ('KeyK' == event.code) {
            pos--;
        }
        if ('KeyJ' == event.code) {
            pos++;
        }
        if (pos >= headTags.length) {
            pos = headTags.length - 1;
        }
        if (pos < -1) {
            pos = -1;
        }
        let clientRects = (pos == -1) ? mainDiv.getBoundingClientRect() : headTags[pos].getBoundingClientRect();
        let scrollY = clientRects.top;
        if (scrollY < 0) {
            scrollY -= 110;
        } else {
            scrollY -= 50;
        }
        window.scrollBy(clientRects.left, scrollY);
    }
}

function removeCruft() {
    if (mainDiv) {
        // remove unneeded content
        mainDiv.querySelectorAll('span.twitter-embed').forEach(function (element) {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        mainDiv.querySelectorAll('aside.inset--story').forEach(function (element) {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    }
}

function addListeners() {
    // get all section headers
    headTags = mainDiv.querySelectorAll('.align--center, .align--left');
    document.addEventListener('keydown', keyPressed);
}

// find main content
let mainDiv = document.querySelectorAll('div.entry-content')[0];

// remove unneeded content
removeCruft();

// add keyboard navigation
let pos = 0;
let headTags = [];
addListeners();
