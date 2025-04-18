// ==UserScript==
// @name Equip-Bid Restyle
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @description Enhancements to the Equip-Bid auction website
// @license MIT
// @version 0.1
// @match https://www.equip-bid.com/*
// @icon https://icons.duckduckgo.com/ip3/equip-bid.com.ico
// @grant GM_xmlhttpRequest
// @connect equip-bid.com
// ==/UserScript==

/* jshint esversion: 6 */
"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/main/equip-bid-restyle/equip-bid-restyle.user.ts
  var require_equip_bid_restyle_user = __commonJS({
    "src/main/equip-bid-restyle/equip-bid-restyle.user.ts"(exports) {
      var EquipBidRestyle;
      ((EquipBidRestyle2) => {
        const createCarousel = (id, images) => {
          const carousel = document.createElement("div");
          carousel.classList.add("carousel", "slide");
          carousel.id = id;
          carousel.setAttribute("data-ride", "carousel");
          carousel.setAttribute("data-interval", "false");
          const indicators = document.createElement("ol");
          indicators.classList.add("carousel-indicators");
          const inner = document.createElement("div");
          inner.classList.add("carousel-inner");
          inner.role = "listbox";
          images.forEach((image, index) => {
            const indicator = document.createElement("li");
            indicator.setAttribute("data-target", `#${id}`);
            indicator.setAttribute("data-slide-to", index.toString());
            if (index == 0) {
              indicator.classList.add("active");
            }
            indicators.append(indicator);
            const item = document.createElement("div");
            item.classList.add("item");
            if (index == 0) {
              item.classList.add("active");
            }
            const img = document.createElement("img");
            img.src = image;
            img.style.objectFit = "contain";
            img.style.height = "202px";
            img.style.margin = "auto";
            item.append(img);
            inner.append(item);
          });
          const leftControl = document.createElement("a");
          leftControl.classList.add("left", "carousel-control");
          leftControl.href = `#${id}`;
          leftControl.setAttribute("role", "button");
          leftControl.setAttribute("data-slide", "prev");
          const leftIcon = document.createElement("span");
          leftIcon.classList.add("glyphicon", "glyphicon-chevron-left");
          leftIcon.setAttribute("aria-hidden", "true");
          const leftText = document.createElement("span");
          leftText.classList.add("sr-only");
          leftText.textContent = "Previous";
          leftControl.append(leftIcon);
          leftControl.append(leftText);
          const rightControl = document.createElement("a");
          rightControl.classList.add("right", "carousel-control");
          rightControl.href = `#${id}`;
          rightControl.setAttribute("role", "button");
          rightControl.setAttribute("data-slide", "next");
          const rightIcon = document.createElement("span");
          rightIcon.classList.add("glyphicon", "glyphicon-chevron-right");
          rightIcon.setAttribute("aria-hidden", "true");
          const rightText = document.createElement("span");
          rightText.classList.add("sr-only");
          rightText.textContent = "Next";
          rightControl.append(rightIcon);
          rightControl.append(rightText);
          carousel.append(indicators);
          carousel.append(inner);
          carousel.append(leftControl);
          carousel.append(rightControl);
          return carousel;
        };
        const addShortcutsEntry = (label, keyName) => {
          const entry = document.createElement("div");
          entry.style.justifyContent = "start";
          entry.style.gap = ".8rem";
          entry.style.flexDirection = "row";
          entry.style.alignItems = "center";
          entry.style.display = "flex";
          const term = document.createElement("dt");
          term.style.order = "2";
          term.style.justifyContent = "start";
          term.style.gap = ".4rem";
          term.style.flexDirection = "row";
          term.style.alignItems = "center";
          term.style.display = "flex";
          const key = document.createElement("div");
          key.style.alignItems = "center";
          key.style.display = "inline-flex";
          key.style.border = "1px solid #d9d9d9";
          key.style.borderRadius = ".4rem";
          key.style.justifyContent = "center";
          key.style.minWidth = "2rem";
          key.style.minHeight = "2rem";
          key.style.padding = "0 .4rem";
          key.style.color = "#757575";
          key.style.fontSize = "1.2rem";
          key.style.lineHeight = "1.6rem";
          key.style.margin = "0";
          key.textContent = keyName;
          const details = document.createElement("dd");
          details.style.order = "1";
          details.style.width = "28rem";
          details.style.flex = "0 0 auto";
          details.style.color = "#9e9e9e";
          details.style.fontSize = "1.4rem";
          details.style.lineHeight = "2rem";
          details.style.margin = "0";
          details.textContent = label;
          term.append(key);
          entry.append(term);
          entry.append(details);
          return entry;
        };
        const createBody = (entries) => {
          const body = document.createElement("div");
          body.style.overflowX = "visible";
          body.style.overflowY = "auto";
          body.style.padding = "0 2.4rem";
          const list = document.createElement("dl");
          list.style.margin = "0 0 2.4rem 0";
          list.style.justifyContent = "start";
          list.style.gap = ".4rem";
          list.style.flexDirection = "column";
          list.style.alignItems = "stretch";
          list.style.display = "flex";
          for (const entry of entries) {
            list.append(addShortcutsEntry(entry.label, entry.keyName));
          }
          body.append(list);
          return body;
        };
        const createClose = () => {
          const close = document.createElement("button");
          close.type = "button";
          close.setAttribute("aria-label", "Close");
          close.style.position = "absolute";
          close.style.top = ".4rem";
          close.style.right = ".4rem";
          close.style.padding = "11px";
          close.style.minWidth = "0";
          close.style.fontSize = "1.3rem";
          close.style.lineHeight = "1.6rem";
          close.style.color = "#757575";
          close.style.backgroundColor = "transparent";
          close.style.alignItems = "center";
          close.style.display = "inline-flex";
          close.style.gap = ".8rem";
          close.style.justifyContent = "center";
          close.style.fontFamily = "inherit";
          close.style.fontWeight = "700";
          close.style.textDecoration = "none";
          close.style.margin = "0";
          close.style.border = "1px solid transparent";
          close.style.borderRadius = ".4rem";
          close.style.cursor = "pointer";
          close.style.textAlign = "center";
          close.style.verticalAlign = "top";
          close.style.letterSpacing = "0";
          close.style.boxShadow = "none";
          close.style.outline = "0";
          close.style.transition = "background-color .02s ease-in-out, border-color .02s ease-in-out, color .02s ease-in-out";
          close.onclick = () => {
            const modal = document.querySelector("dialog.shortcuts-dialog");
            modal == null ? void 0 : modal.close();
          };
          const times = document.createElement("span");
          times.innerHTML = "&times;";
          times.style.width = "16px";
          times.style.height = "16px";
          times.style.alignItems = "center";
          times.style.display = "inline-flex";
          times.style.justifyContent = "center";
          close.append(times);
          return close;
        };
        const createHeader = (title) => {
          const header = document.createElement("div");
          header.style.padding = "2.4rem";
          const text = document.createElement("h2");
          text.id = "keyboardShortcuts";
          text.style.paddingRight = "2.4rem";
          text.style.fontSize = "2rem";
          text.style.fontWeight = "700";
          text.style.lineHeight = "2.4rem";
          text.style.letterSpacing = "-0.8px";
          text.style.color = "#333333";
          text.style.margin = "0";
          text.style.textTransform = "none";
          text.textContent = title;
          header.append(text);
          return header;
        };
        const createModal = (id, title, entries) => {
          const modal = document.createElement("dialog");
          modal.id = id;
          modal.setAttribute("aria-labelledby", "keyboardShortcuts");
          modal.classList.add("ShortcutsHelp");
          modal.append(createHeader(title));
          modal.append(createBody(entries));
          modal.append(createClose());
          return modal;
        };
        EquipBidRestyle2.createShortcutsModal = () => {
          const modal = createModal("shortcuts-dialog", "Keyboard shortcuts", [
            {
              label: "Keyboard shortcuts",
              keyName: "?"
            },
            {
              label: "Next item",
              keyName: "J"
            },
            {
              label: "Previous item",
              keyName: "K"
            },
            {
              label: "Next page",
              keyName: "N"
            },
            {
              label: "Previous page",
              keyName: "P"
            },
            {
              label: "Next image",
              keyName: "→"
            },
            {
              label: "Previous image",
              keyName: "←"
            },
            {
              label: "Add to/Remove from Watchlist",
              keyName: "W"
            }
          ]);
          document.body.append(modal);
          document.addEventListener("keydown", (event) => {
            if (event.key == "?") {
              modal.open ? modal.close() : modal.showModal();
            }
            if (event.key == "Escape" && modal.open) {
              modal.close();
            }
          });
        };
        const scrollPictures = (direction) => {
          let focusedEntry = document.querySelector(".lot-list .list-group li.list-group-item.focused");
          if (!focusedEntry) {
            focusedEntry = document.querySelector(".lot-list .list-group li.list-group-item:nth-child(1)");
            if (!focusedEntry) {
              return;
            }
            focusedEntry.classList.add("focused");
            focusedEntry.scrollIntoView({ block: "center" });
          }
          const link = direction == "right" ? focusedEntry.querySelector("a.right") : focusedEntry.querySelector("a.left");
          link == null ? void 0 : link.click();
        };
        const addToWatchlist = () => {
          const focusedEntry = document.querySelector(".lot-list .list-group li.list-group-item.focused");
          if (!focusedEntry) {
            console.log("No focused entry to add to watchlist");
            return;
          }
          const watchlistButton = focusedEntry.querySelector("a.item-watch-up, a.item-watch-dn");
          if (!watchlistButton) {
            console.log("Unable to find a watchlist button for the focused entry");
            return;
          }
          watchlistButton.click();
        };
        const selectItem = (direction) => {
          let focusedEntry = document.querySelector(".lot-list .list-group li.list-group-item.focused");
          if (!focusedEntry) {
            focusedEntry = document.querySelector(".lot-list .list-group li.list-group-item:nth-child(1)");
            if (!focusedEntry) {
              return;
            }
            focusedEntry.classList.add("focused");
            focusedEntry.scrollIntoView({ block: "center" });
            return;
          }
          const selectedItem = direction == "next" ? focusedEntry.nextElementSibling : focusedEntry.previousElementSibling;
          if (!selectedItem) {
            return;
          }
          selectedItem.classList.add("focused");
          focusedEntry.classList.remove("focused");
          selectedItem.scrollIntoView({ block: "center" });
        };
        const modifyContainerRule = (rule) => {
          rule.style.width = "100%";
          rule.style.paddingRight = "1.2rem";
          rule.style.paddingLeft = "1.2rem";
          rule.style.marginRight = "auto";
          rule.style.marginLeft = "auto";
        };
        const handleInnerRules = (innerRules, sheet, i, minRuleInserted) => {
          for (const innerRule of Array.from(innerRules)) {
            if (innerRule instanceof CSSStyleRule && innerRule.selectorText === ".container") {
              if (!minRuleInserted) {
                sheet.insertRule("@media (min-width: 576px) { .container { max-width:540px } }", i);
                minRuleInserted = true;
              }
              innerRule.style.maxWidth = innerRule.style.width;
              innerRule.style.removeProperty("width");
            }
          }
          return minRuleInserted;
        };
        const addAdditionalStyles = (sheet) => {
          sheet.insertRule("@media (min-width: 1400px) { .container { max-width:1320px } }");
          sheet.insertRule(
            "dialog.ShortcutsHelp { width: 540px; border: 0; display: inline-flex; flex-direction: column; padding: 0; max-height: 80vh; max-width: 100%; outline: none; text-align: left; vertical-align: middle; background-color: #ffffff; border-radius: .8rem; box-shadow: 0px 2px 15px rgba(0, 0, 0, 0.15), 0px 2px 8px rgba(0, 0, 0, 0.08); min-width: 400px; position: relative;}"
          );
          sheet.insertRule(
            "li.list-group-item.focused { border-color: rgba(82, 168, 236, .8); outline: 0; box-shadow: 0 0 8px rgba(82, 168, 236, .6); margin: 0}"
          );
        };
        EquipBidRestyle2.updateStyles = () => {
          let minRuleInserted = false;
          for (const sheet of Array.from(document.styleSheets)) {
            try {
              const rules = sheet.cssRules;
              for (let i = 0; i < rules.length; i++) {
                const rule = rules[i];
                if (rule instanceof CSSStyleRule && rule.selectorText === ".container") {
                  modifyContainerRule(rule);
                }
                if (rule instanceof CSSMediaRule) {
                  minRuleInserted = handleInnerRules(rule.cssRules, sheet, i, minRuleInserted);
                }
              }
              if (minRuleInserted) {
                addAdditionalStyles(sheet);
              }
            } catch (e) {
              console.log("Security error");
              continue;
            }
          }
        };
        EquipBidRestyle2.collectItems = () => {
          var _a;
          const lotList = document.querySelector("div.lot-list");
          if (!lotList) {
            console.warn("No lot list found");
            return;
          }
          Array.from(lotList.querySelectorAll("div small a")).filter((item) => item.textContent == "Click for Details and More Images").forEach((item) => {
            var _a2, _b;
            return (_b = (_a2 = item.parentElement) == null ? void 0 : _a2.parentElement) == null ? void 0 : _b.remove();
          });
          Array.from(lotList.querySelectorAll(".lot-divider + div")).forEach((item) => item.remove());
          Array.from(lotList.querySelectorAll(".lot-divider")).forEach((item) => item.remove());
          const allRows = lotList.querySelectorAll("hr ~ div");
          const unorderedList = document.createElement("ul");
          unorderedList.classList.add("list-group");
          let listItem = null;
          allRows.forEach((row) => {
            if (row.querySelector("h4[data-auction-title]")) {
              listItem = document.createElement("li");
              listItem.classList.add("list-group-item");
            }
            if (listItem) {
              listItem.append(row);
            }
            if (row.querySelector("small.categories")) {
              if (listItem) {
                unorderedList.append(listItem);
              }
              listItem = null;
            }
          });
          (_a = lotList.querySelector("hr")) == null ? void 0 : _a.insertAdjacentElement("afterend", unorderedList);
        };
        const getDetails = (href) => __async(exports, null, function* () {
          let bidCount = "";
          let gallery = [];
          return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
              method: "GET",
              url: href,
              onload: function(response) {
                const datasource = RegExp(/dataSource: (\[\{.*\}\])/).exec(response.responseText);
                if (datasource) {
                  const jsonDatasource = JSON.parse(datasource[1]);
                  gallery = jsonDatasource.map((obj) => ({
                    image: obj.image
                  }));
                }
                const bidCountMatch = RegExp(/lot_bid_history_count.*>(.*)<\/span>/).exec(response.responseText);
                if (bidCountMatch) {
                  bidCount = bidCountMatch[1];
                }
                resolve({
                  gallery,
                  bidCount
                });
              },
              ontimeout: () => reject(new Error("Timeout")),
              onerror: (error) => reject(new Error(error.responseText)),
              onabort: () => reject(new Error("AbortError"))
            });
          });
        });
        EquipBidRestyle2.additionalDetails = () => __async(exports, null, function* () {
          const allItems = document.querySelectorAll(".lot-list > ul > li");
          const promises = Array.from(allItems).map((listItem) => __async(exports, null, function* () {
            var _a;
            const detailAnchor = listItem.querySelector("a");
            if (!detailAnchor) return;
            const detailLink = detailAnchor.href;
            const detailsObj = yield getDetails(detailLink);
            const id = (_a = listItem.querySelector("h4[id]")) == null ? void 0 : _a.id;
            const img = listItem.querySelector("img");
            const carousel = createCarousel(
              `carousel-${id}`,
              detailsObj.gallery.map((obj) => obj.image)
            );
            img == null ? void 0 : img.replaceWith(carousel);
            const highBidder = Array.from(listItem.querySelectorAll("small")).filter((item) => {
              var _a2;
              return (_a2 = item.textContent) == null ? void 0 : _a2.includes("High Bidder");
            })[0];
            if (highBidder) {
              highBidder.innerHTML = highBidder.innerHTML.replace("High Bidder", `${detailsObj.bidCount} - High Bidder`);
            }
          }));
          yield Promise.all(promises);
        });
        EquipBidRestyle2.addListeners = () => {
          const allListeners = (event) => {
            if (event.key == "ArrowRight") {
              scrollPictures("right");
            }
            if (event.key == "ArrowLeft") {
              scrollPictures("left");
            }
            if (event.key == "j") {
              selectItem("next");
            }
            if (event.key == "k") {
              selectItem("previous");
            }
            if (event.key == "n") {
              const nextButton = document.querySelector("li.next > a");
              nextButton == null ? void 0 : nextButton.click();
            }
            if (event.key == "p") {
              const prevButton = document.querySelector("li.previous > a");
              prevButton == null ? void 0 : prevButton.click();
            }
            if (event.key == "w") {
              addToWatchlist();
            }
          };
          document.removeEventListener("keydown", allListeners);
          document.addEventListener("keydown", allListeners);
        };
      })(EquipBidRestyle || (EquipBidRestyle = {}));
      EquipBidRestyle.updateStyles();
      EquipBidRestyle.createShortcutsModal();
      EquipBidRestyle.collectItems();
      EquipBidRestyle.additionalDetails();
      EquipBidRestyle.addListeners();
    }
  });
  require_equip_bid_restyle_user();
})();
//# sourceMappingURL=equip-bid-restyle.user.js.map
