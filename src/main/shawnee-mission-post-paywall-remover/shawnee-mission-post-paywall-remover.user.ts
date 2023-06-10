// ==UserScript==
// @name         Shawnee Mission Post Paywall Remover
// @namespace    bricemciver
// @description  Removes paywall restrictions from Shawnee Mission Post website
// @license      MIT
// @version      0.1
// @match        https://shawneemissionpost.com/*
// @match        https://bluevalleypost.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shawneemissionpost.com
// @grant        none
// ==/UserScript==
{
  Array.from(document.getElementsByClassName('not-logged-in')).forEach(element => element.classList.remove('not-logged-in'));
}
