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
  const bidRegex = /lot_current_bid_lot_equip-bid_(\d+)_(\d+)/;
  const linkRegex = /\/auction\/\d+\/item\/(\d+)/;

  const getImageData = async (item: any) => {
    const response = await window.fetch(`https://www.equip-bid.com/auction/${item.auctionId}/item/${item.lot}`);
    const json = await response.json();
    return json;
  };

  const gatherData = () => {
    const infoArray = [];
    // scan the HTML for interesting data and store in an array of objects
    // use the current bid (which should be there in both logged in and logged out scenarios)
    const currentBids = document.querySelectorAll('span[id^="lot_current_bid_lot_equip-bid_"]');
    currentBids.forEach(span => {
      const item: any = {};
      // get the auction and item ids
      const matches = span.id.match(bidRegex);
      if (matches) {
        item.auctionId = matches[1];
        item.itemId = matches[2];
      }
      // Grab the current bid
      item.currentBid = span.textContent;
      // Get the next required bid
      item.nextBid = document.getElementById(`lot_next_required_bid_lot_equip-bid_${item.auctionId}_${item.itemId}`)?.textContent;
      // Get your max bid
      item.userMaxBid = document.getElementById(`lot_your_max_bid_lot_equip-bid_${item.auctionId}_${item.itemId}`)?.textContent;
      // Get current high bidder
      item.highBidder = document.getElementById(`lot_current_high_bidder_list_lot_equip-bid_${item.auctionId}_${item.itemId}`)?.textContent;
      // Get item title and lot
      const detail = document.querySelector(`h4[id="itemTitle${item.itemId}"]`);
      const link = detail?.children[0] as HTMLAnchorElement;
      const title = link?.children[0];
      const linkMatch = link?.href.match(linkRegex);
      if (linkMatch) {
        item.lot = linkMatch[1];
      }
      item.title = title?.textContent;

      infoArray.push(item);
    });
  };

  (function () {
    'use strict';

    gatherData();
  })();
}
