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
// @name         Equip Bid info
// @namespace    http://tampermonkey.net/
// @version      2024-03-07
// @description  try to take over the world!
// @author       You
// @match        https://www.equip-bid.com/auction/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=equip-bid.com
// @grant        none
// ==/UserScript==
{
    var bidRegex_1 = /lot_current_bid_lot_equip-bid_(\d+)_(\d+)/;
    var linkRegex_1 = /\/auction\/\d+\/item\/(\d+)/;
    var getImageData = function (item) { return __awaiter(void 0, void 0, void 0, function () {
        var response, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, window.fetch("https://www.equip-bid.com/auction/".concat(item.auctionId, "/item/").concat(item.lot))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    json = _a.sent();
                    return [2 /*return*/, json];
            }
        });
    }); };
    var gatherData_1 = function () {
        var infoArray = [];
        // scan the HTML for interesting data and store in an array of objects
        // use the current bid (which should be there in both logged in and logged out scenarios)
        var currentBids = document.querySelectorAll('span[id^="lot_current_bid_lot_equip-bid_"]');
        currentBids.forEach(function (span) {
            var _a, _b, _c;
            var item = {};
            // get the auction and item ids
            var matches = span.id.match(bidRegex_1);
            if (matches) {
                item.auctionId = matches[1];
                item.itemId = matches[2];
            }
            // Grab the current bid
            item.currentBid = span.textContent;
            // Get the next required bid
            item.nextBid = (_a = document.getElementById("lot_next_required_bid_lot_equip-bid_".concat(item.auctionId, "_").concat(item.itemId))) === null || _a === void 0 ? void 0 : _a.textContent;
            // Get your max bid
            item.userMaxBid = (_b = document.getElementById("lot_your_max_bid_lot_equip-bid_".concat(item.auctionId, "_").concat(item.itemId))) === null || _b === void 0 ? void 0 : _b.textContent;
            // Get current high bidder
            item.highBidder = (_c = document.getElementById("lot_current_high_bidder_list_lot_equip-bid_".concat(item.auctionId, "_").concat(item.itemId))) === null || _c === void 0 ? void 0 : _c.textContent;
            // Get item title and lot
            var detail = document.querySelector("h4[id=\"itemTitle".concat(item.itemId, "\"]"));
            var link = detail === null || detail === void 0 ? void 0 : detail.children[0];
            var title = link === null || link === void 0 ? void 0 : link.children[0];
            var linkMatch = link === null || link === void 0 ? void 0 : link.href.match(linkRegex_1);
            if (linkMatch) {
                item.lot = linkMatch[1];
            }
            item.title = title === null || title === void 0 ? void 0 : title.textContent;
            infoArray.push(item);
        });
    };
    (function () {
        'use strict';
        gatherData_1();
    })();
}
