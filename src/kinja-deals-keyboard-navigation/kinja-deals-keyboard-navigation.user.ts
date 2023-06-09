// ==UserScript==
// @name Kinja Deals Keyboard Navigation
// @description Use 'j' and 'k' keys for navigation of post content
// @match *://*.theinventory.com/*
// @version 0.0.7
// @author Brice McIver
// @license MIT
// @grant none
// ==/UserScript==

const headTags: Element[] = [];
let pos = -1;

const addGlobalStyle = (css: string) => {
  const head = document.getElementsByTagName("head")[0];
  if (!head) {
    return;
  }
  const style = document.createElement("style");
  style.innerHTML = css;
  head.appendChild(style);
};

const keyPressed = (event: KeyboardEvent) => {
  if (event.code === "KeyK" || event.code === "KeyJ") {
    if (headTags[pos]) {
      headTags[pos].className = headTags[pos].className.replace(
        " selected",
        ""
      );
    }
    if ("KeyK" === event.code) {
      pos--;
    }
    if ("KeyJ" === event.code) {
      pos++;
    }
    // wrap around
    if (pos >= headTags.length) {
      pos = 0;
    }
    if (pos < 0) {
      pos = headTags.length - 1;
    }
    headTags[pos].className = headTags[pos].className + " selected";
    headTags[pos].scrollIntoView();
    window.scrollBy(0, -17);
  }
};

const removeCruft = () => {
  document
    .querySelectorAll(".js_movable_ad_slot")
    .forEach((element) => element.remove());
  document
    .querySelectorAll(".connatix-container")
    .forEach((element) => element.remove());
  document
    .querySelectorAll(":contains('G/O Media may get a commission')")
    .forEach((element) => element.closest("aside")?.remove());
  document
    .querySelectorAll("#sidebar_wrapper")
    .forEach((element) => element.closest("aside")?.remove());
};

const createEntries = (containerDiv: Element) => {
  if (containerDiv?.children) {
    let newElement: Element;
    Array.from(containerDiv.children).forEach((element) => {
      // this is the beginning or end or a section
      if (element.tagName === "HR" || element.tagName === "H3") {
        if (newElement) {
          element.insertAdjacentElement("beforebegin", newElement);
        }
        newElement = document.createElement("div");
        newElement.className = "inlineFrame";
      } else if (newElement) {
        newElement.append(element);
      }
    });
  }
};

const addListeners = (containerDiv: Element) => {
  // get all section headers
  headTags.push(containerDiv);
  headTags.push(
    ...Array.from(containerDiv.querySelectorAll("div.inlineFrame, h3, h4"))
  );
  document.addEventListener("keydown", keyPressed);
};

// remove unneeded content
removeCruft();

// find main content
const mainDiv = document.querySelector(
  ".js_post-content #js_movable-ads-post-contents"
);
if (mainDiv) {
  // add necessary styles
  addGlobalStyle(
    "div.inlineFrame { margin-top:17px; margin-bottom:17px; padding:33px; border-radius:3px; border: 1px solid rgba(0,0,0,0.05) }"
  );
  addGlobalStyle(
    "div.inlineFrame.selected { border: 1px solid rgba(0, 0, 0, 0.15) }"
  );
  addGlobalStyle("main { width:100% !important }");

  // create entries
  createEntries(mainDiv);

  // add keyboard navigation
  addListeners(mainDiv);
}