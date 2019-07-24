// ==UserScript==
// @name Ancestry.com - Remove paid hints
// @description Removes paid hints on the "All Hints" page and on individual person pages
// @version 0.0.3
// @match *://*.ancestry.com/*
// @match *://*.ancestry.de/*
// @author bricem
// @namespace bricem.scripts
// @license MIT
// @grant GM_xmlhttpRequest
// @run-at document-end
// ==/UserScript==

function findId(href) {
    let dbid = href.match(/dbid=(\d*)\&/);
    if (dbid && dbid.length > 1) {
        dbid = dbid[1];
    }
    if (!dbid) {
        dbid = href.match(/otid=(\d*)\&/);
        if (dbid && dbid.length > 1) {
            dbid = dbid[1];
        }
    }
    if (!dbid) {
        dbid = href;
    }
    return dbid;
}

function removeTreeByClass(targetNode, className1, className2) {
    let pNode = targetNode.parentNode;
    debugger;
    while (pNode != null && (!pNode.className || (pNode.className.indexOf(className1) == -1 && pNode.className.indexOf(className2) == -1))) {
        pNode = pNode.parentNode;
    }
    if (pNode) {
        pNode.parentNode.removeChild(pNode);
    }
}

function addDbidFromJoinPage() {
  // If we do end up on join page, add that dbid to the list of paid databases
  if (window.location.pathname.indexOf('join') !== -1) {
    let dbid = findId(window.location.href);
    localStorage.setItem(dbid, "true");
  }
}

function removePaidHints() {
    // Options for the observer (which mutations to observe)
    const config = { attributes: true, subtree: true };

    const myInit = {
        method: 'GET',
        redirect: 'manual',
        mode: 'cors'
    };

    // Callback function to execute when mutations are observed
    const callback = function (mutationsList, observer) {
        for (var mutation of mutationsList) {
            if (mutation.attributeName == 'href' &&
                mutation.target.href.indexOf("phstart=default&usePUBJs=true") !== -1 &&
                mutation.target.className.indexOf("ancBtn") !== -1) {
                // check if we have seen this database before before trying network call
                let dbid = findId(mutation.target.href);
                let paidInd = localStorage.getItem(dbid);
                if ("true" === paidInd) {
                    removeTreeByClass(mutation.target, "typeContent", "hntTabHintCard");
                } else if (paidInd == null) {
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: mutation.target.href,
                        context: mutation.target,
                        onload: function (response) {
                            let dbid = findId(response.context.href);
                            if (response.finalUrl && response.finalUrl.indexOf("join") !== -1) {
                                removeTreeByClass(response.context, "typeContent", "hntTabHintCard");
                                localStorage.setItem(dbid, "true");
                            } else {
                                localStorage.setItem(dbid, "false");
                            }
                        },
                        ontimeout: function (response) {
                            let dbid = findId(response.context.href);
                            localStorage.removeItem(dbid);
                        },
                        onerror: function (response) {
                            let dbid = findId(response.context.href);
                            localStorage.removeItem(dbid);
                        },
                        onabort: function (response) {
                            let dbid = findId(response.context.href);
                            localStorage.removeItem(dbid);
                        },
                    });
                }
            }
        }
    };

    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);
    observer.observe(document.body, config);
}

addDbidFromJoinPage();
removePaidHints();
