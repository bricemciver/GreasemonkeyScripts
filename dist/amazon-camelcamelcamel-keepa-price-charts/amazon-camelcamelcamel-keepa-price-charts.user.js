// ==UserScript==
// @name Amazon CamelCamelCamel + Keepa Price Charts
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @description Add CamelCamelCamel and Keepa price charts to Amazon product pages.
// @author miki.it
// @license MIT
// @version 2.0.0
// @match https://www.amazon.com/*
// @match  https://www.amazon.co.uk/*
// @match https://www.amazon.de/*
// @match https://www.amazon.fr/*
// @match https://www.amazon.it/*
// @match https://www.amazon.es/*
// @match https://www.amazon.ca/*
// @match https://www.amazon.co.jp/*
// @match https://www.amazon.in/*
// @match https://www.amazon.com.br/*
// @match https://www.amazon.com.mx/*
// @match https://www.amazon.com.au/*
// @match https://www.amazon.nl/*
// @match https://www.amazon.sg/*
// @match https://www.amazon.ae/*
// @match https://www.amazon.sa/*
// @match https://www.amazon.se/*
// @match https://www.amazon.pl/*
// @match https://www.amazon.com.tr/*
// @match https://www.amazon.eg/*
// @match https://www.amazon.com.be/*
// @icon https://icons.duckduckgo.com/ip3/amazon.com.ico
// @grant GM_addStyle
// @run-at document-idle
// @no-frames true
// ==/UserScript==

// ==UserScript==
// @name Amazon CamelCamelCamel + Keepa Price Charts
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @description Add CamelCamelCamel and Keepa price charts to Amazon product pages.
// @author miki.it
// @license MIT
// @version 2.0.0
// @match https://www.amazon.com/*
// @match  https://www.amazon.co.uk/*
// @match https://www.amazon.de/*
// @match https://www.amazon.fr/*
// @match https://www.amazon.it/*
// @match https://www.amazon.es/*
// @match https://www.amazon.ca/*
// @match https://www.amazon.co.jp/*
// @match https://www.amazon.in/*
// @match https://www.amazon.com.br/*
// @match https://www.amazon.com.mx/*
// @match https://www.amazon.com.au/*
// @match https://www.amazon.nl/*
// @match https://www.amazon.sg/*
// @match https://www.amazon.ae/*
// @match https://www.amazon.sa/*
// @match https://www.amazon.se/*
// @match https://www.amazon.pl/*
// @match https://www.amazon.com.tr/*
// @match https://www.amazon.eg/*
// @match https://www.amazon.com.be/*
// @icon https://icons.duckduckgo.com/ip3/amazon.com.ico
// @grant GM_addStyle
// @run-at document-idle
// @no-frames true
// ==/UserScript==

/* jshint esversion: 6 */
"use strict";
(() => {
  // src/main/amazon-camelcamelcamel-keepa-price-charts/amazon-camelcamelcamel-keepa-price-charts.user.ts
  var AmazonCamelCamelCamelKeepaPriceCharts;
  ((AmazonCamelCamelCamelKeepaPriceCharts2) => {
    const SCRIPT_ID = "ccc-keepa-charts";
    const DEBUG = false;
    const CAMEL_COUNTRY_MAP = {
      com: "us",
      "co.uk": "uk",
      de: "de",
      fr: "fr",
      it: "it",
      es: "es",
      ca: "ca",
      "co.jp": "jp",
      "com.au": "au",
      "com.br": "br",
      "com.mx": "mx",
      in: "in",
      nl: "nl",
      se: "se",
      sg: "sg",
      pl: "pl",
      "com.be": "be",
      "com.tr": "tr",
      ae: "ae",
      sa: "sa",
      eg: "eg"
    };
    const KEEPA_DOMAIN_MAP = {
      com: 1,
      "co.uk": 2,
      de: 3,
      fr: 4,
      "co.jp": 5,
      ca: 6,
      it: 8,
      es: 9,
      in: 10,
      "com.mx": 11,
      "com.br": 12,
      "com.au": 13,
      nl: 14,
      "com.tr": 15,
      ae: 16,
      sg: 17,
      sa: 18,
      se: 19,
      pl: 20,
      eg: 21,
      "com.be": 22
    };
    const PARENT_SELECTORS = [
      "#bottomRow",
      "#sims_fbt",
      ".bucketDivider",
      "#elevatorBottom",
      "#ATFCriticalFeaturesDataContainer",
      "#hover-zoom-end",
      ".a-fixed-left-grid",
      ".twisterMediaMatrix"
    ];
    const STANDARD_DELAY = 500;
    const log = (...args) => {
      if (DEBUG) {
        console.log(`[${SCRIPT_ID}]`, ...args);
      }
    };
    const warn = (...args) => {
      console.warn(`[${SCRIPT_ID}]`, ...args);
    };
    const getTLD = () => {
      const hostname = globalThis.location.hostname;
      const match = new RegExp(/amazon\.([a-z]{2,3}(?:\.[a-z]{2})?)$/).exec(
        hostname
      );
      if (!match) {
        return null;
      }
      return match[1];
    };
    const getASIN = () => {
      var _a, _b;
      const asinInput = document.getElementById(
        "ASIN"
      );
      if (asinInput == null ? void 0 : asinInput.value) {
        log("ASIN found via #ASIN input");
        return asinInput.value;
      }
      const productDiv = document.getElementById("dp");
      if ((_a = productDiv == null ? void 0 : productDiv.dataset) == null ? void 0 : _a.asin) {
        log("ASIN found via #dp data-asin");
        return productDiv.dataset.asin;
      }
      const dataAsinElement = document.querySelector(
        'input[data-asin]:not([data-asin=""], div[data-asin]:not([data-asin=""])'
      );
      if ((_b = dataAsinElement == null ? void 0 : dataAsinElement.dataset) == null ? void 0 : _b.asin) {
        log("ASIN found via [data-asin] selector");
        return dataAsinElement.dataset.asin;
      }
      const urlMatch = new RegExp(
        /\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i
      ).exec(globalThis.location.pathname);
      if (urlMatch) {
        log("ASIN found via URL pattern");
        return urlMatch[1];
      }
      const canonical = document.querySelector(
        'link[rel="canonical"]'
      );
      if (canonical) {
        const canonicalMatch = new RegExp(/\/dp\/([A-Z0-9]{10})/i).exec(
          canonical.href
        );
        if (canonicalMatch) {
          log("ASIN found via canonical link");
          return canonicalMatch[1];
        }
      }
      const ldJsonScripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      );
      for (const script of Array.from(ldJsonScripts)) {
        try {
          const data = JSON.parse(script.textContent || "");
          if (data == null ? void 0 : data.sku) {
            log("ASIN found via LD+JSON");
            return data.sku;
          }
        } catch (e) {
          log("Error parsing LD+JSON for ASIN:", e);
        }
      }
      return null;
    };
    const findParentElement = () => {
      for (const selector of PARENT_SELECTORS) {
        const element = document.querySelector(selector);
        if (element) {
          log("Parent element found:", selector);
          return element;
        }
      }
      return null;
    };
    const isProductPage = () => {
      const pathMatch = /\/(dp|gp\/product|gp\/aw\/d)\//.test(
        globalThis.location.pathname
      );
      return pathMatch || document.getElementById("dp") !== null || document.getElementById("ppd") !== null;
    };
    const addStyles = () => {
      const css = `
                #${SCRIPT_ID}-container {
                    margin: 16px 0;
                    max-width: 632px;
                    padding: 10px 16px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background: #fafafa;
                }
     
                #${SCRIPT_ID}-container .chart-wrapper {
                    margin-bottom: 12px;
                    text-align: center;
                }
     
                #${SCRIPT_ID}-container .chart-wrapper:last-child {
                    margin-bottom: 0;
                }
     
                #${SCRIPT_ID}-container .chart-title {
                    font-size: 14px;
                    font-weight: bold;
                    margin-bottom: 8px;
                    color: #333;
                }
     
                #${SCRIPT_ID}-container .chart-link {
                    display: inline-block;
                    text-decoration: none;
                }
     
                #${SCRIPT_ID}-container .chart-img {
                    max-width: 600px;
                    height: auto;
                    border-radius: 4px;
                    transition: opacity 0.3s ease;
                }
     
                #${SCRIPT_ID}-container .chart-img.loading {
                    opacity: 0.5;
                }
     
                #${SCRIPT_ID}-container .chart-img.error {
                    display: none;
                }
     
                #${SCRIPT_ID}-container .chart-error {
                    display: none;
                    color: #c00;
                    font-size: 12px;
                    padding: 20px;
                    background: #fff0f0;
                    border-radius: 4px;
                }
     
                #${SCRIPT_ID}-container .chart-wrapper.has-error .chart-error {
                    display: block;
                }
     
                #${SCRIPT_ID}-container .collapse-toggle {
                    cursor: pointer;
                    user-select: none;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: bold;
                    margin-bottom: 12px;
                    color: #0066c0;
                }
     
                #${SCRIPT_ID}-container .collapse-toggle:hover {
                    color: #c45500;
                    text-decoration: underline;
                }
     
                #${SCRIPT_ID}-container .collapse-toggle::before {
                    content: '▼';
                    font-size: 10px;
                    transition: transform 0.2s ease;
                }
     
                #${SCRIPT_ID}-container.collapsed .collapse-toggle::before {
                    transform: rotate(-90deg);
                }
     
                #${SCRIPT_ID}-container.collapsed .charts-content {
                    display: none;
                }
     
                #${SCRIPT_ID}-container.collapsed .collapse-toggle {
                    margin-bottom: 0;
                }
            `;
      if (typeof GM_addStyle === "undefined") {
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
      } else {
        GM_addStyle(css);
      }
    };
    const createChartElement = (title, linkUrl, imageUrl, altText, id, visible = true) => {
      const wrapper = document.createElement("div");
      wrapper.className = "chart-wrapper";
      wrapper.setAttribute("id", id);
      if (!visible) {
        wrapper.style.display = "none";
      }
      const titleDiv = document.createElement("div");
      titleDiv.className = "chart-title";
      titleDiv.textContent = title;
      const link = document.createElement("a");
      link.className = "chart-link";
      link.href = linkUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.title = `View on ${title}`;
      const img = document.createElement("img");
      img.className = "chart-img loading";
      img.alt = altText;
      if (visible) {
        img.loading = "lazy";
      }
      const errorDiv = document.createElement("div");
      errorDiv.className = "chart-error";
      errorDiv.textContent = `Unable to load ${title} chart. Click title to view on site.`;
      img.addEventListener("load", () => {
        img.classList.remove("loading");
      });
      img.addEventListener("error", () => {
        img.classList.add("error");
        wrapper.classList.add("has-error");
        log(`Failed to load image: ${imageUrl}`);
      });
      img.src = imageUrl;
      link.appendChild(img);
      wrapper.appendChild(titleDiv);
      wrapper.appendChild(link);
      wrapper.appendChild(errorDiv);
      return wrapper;
    };
    const addCamelChart = (camelCountry, asin, refresh, chartsContent) => {
      var _a;
      const camelChart = createChartElement(
        "CamelCamelCamel",
        `https://${camelCountry}.camelcamelcamel.com/product/${asin}`,
        `https://charts.camelcamelcamel.com/${camelCountry}/${asin}/amazon-new-used.png?force=1&zero=0&w=600&h=400&desired=false&legend=1&ilt=1&tp=all&fo=0`,
        `CamelCamelCamel price history for ${asin}`,
        "camelChart",
        !refresh
      );
      if (refresh) {
        const currentChart = document.getElementById("camelChart");
        if (currentChart) {
          (_a = currentChart.parentNode) == null ? void 0 : _a.append(camelChart);
          setTimeout(() => {
            currentChart.style.display = "none";
            camelChart.style.display = "initial";
            currentChart.remove();
          }, STANDARD_DELAY);
        }
      } else {
        chartsContent.appendChild(camelChart);
      }
    };
    const addKeepaChart = (keepaDomain, asin, tld, refresh, chartsContent) => {
      var _a;
      const keepaChart = createChartElement(
        "Keepa",
        `https://keepa.com/#!product/${keepaDomain}-${asin}`,
        `https://graph.keepa.com/pricehistory.png?used=1&asin=${asin}&domain=${tld}`,
        `Keepa price history for ${asin}`,
        "keepaChart",
        !refresh
      );
      if (refresh) {
        const currentChart = document.getElementById("keepaChart");
        if (currentChart) {
          (_a = currentChart.parentNode) == null ? void 0 : _a.append(keepaChart);
          setTimeout(() => {
            currentChart.style.display = "none";
            keepaChart.style.display = "initial";
            currentChart.remove();
          }, STANDARD_DELAY);
        }
      } else {
        chartsContent.appendChild(keepaChart);
      }
    };
    const createContainer = (camelCountry, asin, refresh, keepaDomain, tld) => {
      const container = document.createElement("div");
      container.id = `${SCRIPT_ID}-container`;
      const toggle = document.createElement("div");
      toggle.className = "collapse-toggle";
      toggle.textContent = "Price History Charts";
      toggle.addEventListener("click", () => {
        container.classList.toggle("collapsed");
        try {
          localStorage.setItem(
            `${SCRIPT_ID}-collapsed`,
            container.classList.contains("collapsed") ? "true" : "false"
          );
        } catch (e) {
          log("Error saving collapsed state:", e);
        }
      });
      try {
        if (localStorage.getItem(`${SCRIPT_ID}-collapsed`) === "true") {
          container.classList.add("collapsed");
        }
      } catch (e) {
        log("Error restoring collapsed state:", e);
      }
      const chartsContent = document.createElement("div");
      chartsContent.className = "charts-content";
      if (camelCountry) {
        addCamelChart(camelCountry, asin, refresh, chartsContent);
      }
      if (keepaDomain) {
        addKeepaChart(keepaDomain, asin, tld, refresh, chartsContent);
      }
      container.appendChild(toggle);
      container.appendChild(chartsContent);
      return container;
    };
    const injectCharts = (refresh = false) => {
      if (!refresh && document.getElementById(`${SCRIPT_ID}-container`)) {
        log("Charts already injected");
        return;
      }
      if (!isProductPage()) {
        log("Not a product page, skipping");
        return;
      }
      const asin = getASIN();
      if (!asin) {
        warn("Could not find ASIN on this page");
        return;
      }
      const tld = getTLD();
      if (!tld) {
        warn("Could not determine Amazon TLD");
        return;
      }
      const camelCountry = CAMEL_COUNTRY_MAP[tld];
      const keepaDomain = KEEPA_DOMAIN_MAP[tld];
      if (!camelCountry && !keepaDomain) {
        warn(`Unsupported Amazon region: ${tld}`);
        return;
      }
      const parentElement = findParentElement();
      if (!parentElement) {
        warn("Could not find suitable parent element");
        return;
      }
      log(`Injecting charts for ASIN: ${asin}, TLD: ${tld}`);
      addStyles();
      const container = createContainer(
        camelCountry,
        asin,
        refresh,
        keepaDomain,
        tld
      );
      if (!refresh) {
        parentElement.insertBefore(container, parentElement.firstChild);
      }
      log("Charts injected successfully");
    };
    const init = (refresh = false) => {
      injectCharts(refresh);
      if (!document.getElementById(`${SCRIPT_ID}-container`) && isProductPage()) {
        log("Setting up MutationObserver for dynamic content");
        let attempts = 0;
        const maxAttempts = 10;
        const observer = new MutationObserver((_mutations, obs) => {
          attempts++;
          if (document.getElementById(`${SCRIPT_ID}-container`)) {
            obs.disconnect();
            return;
          }
          if (attempts >= maxAttempts) {
            obs.disconnect();
            warn("Max attempts reached, giving up");
            return;
          }
          injectCharts();
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        setTimeout(() => observer.disconnect(), 1e4);
      }
    };
    AmazonCamelCamelCamelKeepaPriceCharts2.main = () => {
      let lastUrl = location.href;
      const urlObserver = new MutationObserver(() => {
        if (location.href !== lastUrl) {
          lastUrl = location.href;
          log("URL changed, reinitializing");
          setTimeout(function() {
            init(true);
          }, STANDARD_DELAY);
        }
      });
      urlObserver.observe(document.body, { childList: true, subtree: true });
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", (_ev) => init());
      } else {
        init();
      }
    };
  })(AmazonCamelCamelCamelKeepaPriceCharts || (AmazonCamelCamelCamelKeepaPriceCharts = {}));
  AmazonCamelCamelCamelKeepaPriceCharts.main();
})();
//# sourceMappingURL=amazon-camelcamelcamel-keepa-price-charts.user.js.map
