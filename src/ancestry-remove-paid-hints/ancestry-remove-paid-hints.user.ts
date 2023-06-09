// ==UserScript==
// @name Ancestry.com - Remove paid hints
// @description Removes paid hints on the "All Hints" page and on individual person pages
// @version 0.0.3
// @match *://*.ancestry.com/*
// @match *://*.ancestry.de/*
// @author Brice McIver
// @license MIT
// @grant GM_xmlhttpRequest
// @run-at document-end
// ==/UserScript==

const findId = (href: string) => {
  let id = "";
  let dbid = RegExp(/dbid=(\d*)&/).exec(href);
  if (dbid && dbid.length > 1) {
    id = dbid[1];
  }
  if (!dbid) {
    dbid = RegExp(/otid=(\d*)&/).exec(href);
    if (dbid && dbid.length > 1) {
      id = dbid[1];
    }
  }
  if (!dbid) {
    id = href;
  }
  return id;
};

const removeTreeByClass = (
  targetNode: Element,
  className1: string,
  className2: string
) => {
  let pNode = targetNode.parentElement;
  while (
    pNode &&
    (!pNode.className ||
      (pNode.className.indexOf(className1) === -1 &&
        pNode.className.indexOf(className2) === -1))
  ) {
    pNode = pNode.parentElement;
  }
  if (pNode) {
    pNode.remove();
  }
};

const addDbidFromJoinPage = () => {
  // If we do end up on join page, add that dbid to the list of paid databases
  if (window.location.pathname.indexOf("join") !== -1) {
    const dbid = findId(window.location.href);
    localStorage.setItem(dbid, "true");
  }
};

const removeFromLocalStorage = (response: GM.Response<HTMLAnchorElement>) => {
  const link = response.context?.href;
  if (link) {
    localStorage.removeItem(findId(link));
  }
};

const addLinkToDb = (response: GM.Response<HTMLAnchorElement>) => {
  const link = response.context?.href;
  if (link) {
    const dbid = findId(link);

    if (response.finalUrl.includes("join")) {
      removeTreeByClass(response.context, "typeContent", "hntTabHintCard");
      localStorage.setItem(dbid, "true");
    } else {
      localStorage.setItem(dbid, "false");
    }
  }
};

const removePaidHints = () => {
  // Options for the observer (which mutations to observe)
  const config = { attributes: true, subtree: true };

  // Callback function to execute when mutations are observed
  const callback: MutationCallback = (mutationsList: MutationRecord[]) => {
    for (const mutation of mutationsList) {
      if (mutation.attributeName === "href") {
        const element = mutation.target as HTMLAnchorElement;
        if (
          element.href.includes("phstart=default&usePUBJs=true") &&
          element.className.includes("ancBtn")
        ) {
          // check if we have seen this database before before trying network call
          let dbid = findId(element.href);
          const paidInd = localStorage.getItem(dbid);
          if ("true" === paidInd) {
            removeTreeByClass(element, "typeContent", "hntTabHintCard");
          } else if (paidInd == null) {
            GM.xmlHttpRequest({
              method: "GET",
              url: element.href,
              context: element,
              onload: (response) => addLinkToDb(response),
              ontimeout: (response) => removeFromLocalStorage(response),
              onerror: (response) => removeFromLocalStorage(response),
              onabort: (response) => removeFromLocalStorage(response),
            });
          }
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);
  observer.observe(document.body, config);
};

addDbidFromJoinPage();
removePaidHints();
