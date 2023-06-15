"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// ==UserScript==
// @name         Ancestry.com - Remove paid hints
// @namespace    bricemciver
// @description  Removes paid hints on the "All Hints" page and on individual person pages
// @author       Brice McIver
// @license      MIT
// @version      0.0.3
// @match        https://*.ancestry.com/hints/tree/*
// @match        https://*.ancestry.de/hints/tree/*
// @match        https://*.ancestry.com/cs/offers/join*
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ancestry.com
// @run-at       document-start
// ==/UserScript==
{
    var familyTreeSources_1 = [62476, 9289, 1030, 1006];
    var handleOfferPage_1 = function (db, link) {
        // extract dbid
        var dbidRegex = /[?&]dbid=(\d+)/;
        var dbidMatch = RegExp(dbidRegex).exec(link.href);
        if (dbidMatch) {
            var dbid_1 = parseInt(dbidMatch[1], 10);
            // since we're on the offer page, we know it's paid
            var getRequest = db.transaction('collections_os', 'readonly').objectStore('collections_os').get(dbid_1);
            getRequest.onsuccess = function (event) {
                var target = event.target;
                if (target) {
                    var result = target.result;
                    var putOS = db.transaction('collections_os', 'readwrite').objectStore('collections_os');
                    if (result) {
                        putOS.put({ dbid: dbid_1, name: result.name, tree: result.tree, paid: true, visible: false });
                    }
                    else {
                        putOS.put({ dbid: dbid_1, name: '', tree: false, paid: true, visible: false });
                    }
                }
            };
        }
    };
    var initDB_1 = function () {
        return new Promise(function (resolve, reject) {
            var openRequest = window.indexedDB.open('collections_db', 1);
            // error handler signifies that the database didn't open successfully
            openRequest.onerror = function (event) {
                console.error('Database failed to open');
                reject(event);
            };
            // success handler signifies that the database opened successfully
            openRequest.onsuccess = function (_event) {
                // Store the opened database object in the db variable. This is used a lot below
                resolve(openRequest.result);
            };
            // Set up the database tables if this has not already been done
            openRequest.onupgradeneeded = function (event) {
                // Grab a reference to the opened database
                var eventTarget = event.target;
                if (eventTarget) {
                    var tmpDb = eventTarget.result;
                    // Create an objectStore in our database to store notes and an auto-incrementing key
                    // An objectStore is similar to a 'table' in a relational database
                    var objectStore = tmpDb.createObjectStore('collections_os', {
                        keyPath: 'dbid',
                    });
                    // Define what data items the objectStore will contain
                    objectStore.createIndex('name', 'name', { unique: true });
                    objectStore.createIndex('paid', 'paid', { unique: false });
                    objectStore.createIndex('tree', 'tree', { unique: false });
                    objectStore.createIndex('visible', 'visible', { unique: false });
                    // eslint-disable-next-line no-console
                    console.log('Database setup complete');
                    resolve(tmpDb);
                }
            };
        });
    };
    var evalLink_1 = function (db, link) {
        // Make sure link has test
        var linkText = link.textContent;
        if (linkText) {
            // Skip review button links
            if (linkText !== 'Review' && linkText.indexOf('\t') === -1 && linkText.indexOf('\n') === -1) {
                // extract dbid
                var dbidRegex = /[?&]dbid=(\d+)/;
                var dbidMatch = RegExp(dbidRegex).exec(link.href);
                if (dbidMatch) {
                    var dbid_2 = parseInt(dbidMatch[1], 10);
                    // see if database has info
                    // start db transaction
                    var getRequest = db.transaction('collections_os', 'readonly').objectStore('collections_os').get(dbid_2);
                    getRequest.onsuccess = function (event) {
                        var target = event.target;
                        if (target) {
                            var result = target.result;
                            var hide_1 = false;
                            // if no result, query link and add data to the database
                            if (!result) {
                                GM.xmlHttpRequest({
                                    method: 'GET',
                                    url: link.href,
                                    onreadystatechange: function (response) {
                                        if (response.readyState === 2) {
                                            // HeadersReceived
                                            var location_1 = response.finalUrl;
                                            if (location_1) {
                                                // find out if this is a paid link
                                                var denyRegex = /offers\/join/;
                                                var denyMatch = RegExp(denyRegex).exec(location_1);
                                                var putOS = db.transaction('collections_os', 'readwrite').objectStore('collections_os');
                                                var isTree = familyTreeSources_1.indexOf(dbid_2) !== -1;
                                                if (denyMatch) {
                                                    // if match, add to paid collection database
                                                    putOS.add({ dbid: dbid_2, name: link.textContent, paid: true, visible: false, tree: isTree });
                                                    hide_1 = true;
                                                }
                                                else if (isTree) {
                                                    // by default, hide tree results
                                                    putOS.add({ dbid: dbid_2, name: link.textContent, paid: false, visible: false, tree: true });
                                                    hide_1 = true;
                                                }
                                                else {
                                                    // add to database as a free link so we don't re-query
                                                    putOS.add({ dbid: dbid_2, name: link.textContent, paid: false, visible: true, tree: false });
                                                }
                                            }
                                        }
                                    },
                                });
                            }
                            else {
                                hide_1 = !result.visible;
                            }
                            if (hide_1) {
                                // remove hint from view
                                var li = link.closest("li[role='group']");
                                var section = link.closest('section');
                                if (li) {
                                    li.remove();
                                    if (section && section.querySelectorAll("li[role='group']").length === 1) {
                                        section.remove();
                                    }
                                }
                            }
                        }
                    };
                }
            }
        }
    };
    var scanHints_1 = function (db, element) {
        // get links
        var sseLinks = element.querySelectorAll("a[href*='sse.dll']");
        sseLinks.forEach(function (link) { return evalLink_1(db, link); });
        // remove family tree
        var familyTreeLinks = element.querySelectorAll("a[href*='/family-tree/tree/']");
        familyTreeLinks.forEach(function (link) {
            // remove hint from view
            var li = link.closest("li[role='group']");
            var section = link.closest('section');
            if (li) {
                li.remove();
                if (section && section.querySelectorAll("li[role='group']").length === 1) {
                    section.remove();
                }
            }
        });
    };
    var mutationObserverSetup_1 = function (db) {
        // Options for the observer (which mutations to observe)
        var config = { childList: true, subtree: true };
        // Callback function to execute when mutations are observed
        var callback = function (mutationList, _observer) {
            for (var _i = 0, mutationList_1 = mutationList; _i < mutationList_1.length; _i++) {
                var mutation = mutationList_1[_i];
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function (node) {
                        var element = node;
                        if (element.innerHTML &&
                            (element.innerHTML.indexOf('sse.dll') !== -1 || element.innerHTML.indexOf('/family-tree/tree/') !== -1)) {
                            scanHints_1(db, element);
                        }
                    });
                }
            }
        };
        // Create an observer instance linked to the callback function
        var observer = new MutationObserver(callback);
        // Start observing the target node for configured mutations
        observer.observe(document, config);
    };
    var main = function () { return __awaiter(void 0, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initDB_1()];
                case 1:
                    db = _a.sent();
                    if (db instanceof IDBDatabase) {
                        // see if we're on offer page and handle it
                        if (window.location.href.indexOf('offers/join') !== -1) {
                            handleOfferPage_1(db, window.location);
                        }
                        else {
                            mutationObserverSetup_1(db);
                        }
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    main().catch(function (_error) { return ({}); });
}
