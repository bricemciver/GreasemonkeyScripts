namespace AmazonCamelCamelCamelKeepaPriceCharts {
  const SCRIPT_ID = "ccc-keepa-charts";
  const DEBUG = false;

  // Domain mappings for CamelCamelCamel
  const CAMEL_COUNTRY_MAP: Record<string, string> = {
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
    eg: "eg",
  };

  // Domain IDs for Keepa API
  const KEEPA_DOMAIN_MAP: Record<string, number> = {
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
    "com.be": 22,
  };

  // Possible parent elements to attach charts (in order of preference)
  const PARENT_SELECTORS = [
    "#bottomRow",
    "#sims_fbt",
    ".bucketDivider",
    "#elevatorBottom",
    "#ATFCriticalFeaturesDataContainer",
    "#hover-zoom-end",
    ".a-fixed-left-grid",
    ".twisterMediaMatrix",
  ];

  const STANDARD_DELAY = 500; // ms

  const log = (...args: unknown[]) => {
    if (DEBUG) {
      console.log(`[${SCRIPT_ID}]`, ...args);
    }
  };

  const warn = (...args: unknown[]) => {
    console.warn(`[${SCRIPT_ID}]`, ...args);
  };

  /**
   * Extract TLD from current hostname
   * Handles compound TLDs like co.uk, co.jp, com.au, etc.
   */
  const getTLD = (): string | null => {
    const hostname = globalThis.location.hostname;
    const match = new RegExp(/amazon\.([a-z]{2,3}(?:\.[a-z]{2})?)$/).exec(
      hostname,
    );
    if (!match) {
      return null;
    }
    return match[1];
  };

  /**
   * Get ASIN using multiple detection methods
   */
  const getASIN = (): string | null => {
    // Method 1: Hidden input field
    const asinInput = document.getElementById(
      "ASIN",
    ) as HTMLInputElement | null;
    if (asinInput?.value) {
      log("ASIN found via #ASIN input");
      return asinInput.value;
    }

    // Method 2: data-asin attribute on product element
    const productDiv = document.getElementById("dp");
    if (productDiv?.dataset?.asin) {
      log("ASIN found via #dp data-asin");
      return productDiv.dataset.asin;
    }

    // Method 3: Any element with data-asin (first non-empty)
    const dataAsinElement = document.querySelector<
      HTMLInputElement | HTMLDivElement
    >(
      'input[data-asin]:not([data-asin=""], div[data-asin]:not([data-asin=""])',
    );
    if (dataAsinElement?.dataset?.asin) {
      log("ASIN found via [data-asin] selector");
      return dataAsinElement.dataset.asin;
    }

    // Method 4: URL pattern /dp/ASIN or /gp/product/ASIN
    const urlMatch = new RegExp(
      /\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i,
    ).exec(globalThis.location.pathname);
    if (urlMatch) {
      log("ASIN found via URL pattern");
      return urlMatch[1];
    }

    // Method 5: Canonical link
    const canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (canonical) {
      const canonicalMatch = new RegExp(/\/dp\/([A-Z0-9]{10})/i).exec(
        canonical.href,
      );
      if (canonicalMatch) {
        log("ASIN found via canonical link");
        return canonicalMatch[1];
      }
    }

    // Method 6: Detail page JSON (LD+JSON)
    const ldJsonScripts = document.querySelectorAll<HTMLScriptElement>(
      'script[type="application/ld+json"]',
    );
    for (const script of Array.from(ldJsonScripts)) {
      try {
        const data = JSON.parse(script.textContent || "");
        if (data?.sku) {
          log("ASIN found via LD+JSON");
          return data.sku;
        }
      } catch (e) {
        log("Error parsing LD+JSON for ASIN:", e);
      }
    }

    return null;
  };

  /**
   * Find suitable parent element for chart injection
   */
  const findParentElement = (): Element | null => {
    for (const selector of PARENT_SELECTORS) {
      const element = document.querySelector(selector);
      if (element) {
        log("Parent element found:", selector);
        return element;
      }
    }
    return null;
  };

  /**
   * Check if we're on a product page
   */
  const isProductPage = () => {
    const pathMatch = /\/(dp|gp\/product|gp\/aw\/d)\//.test(
      globalThis.location.pathname,
    );
    return (
      pathMatch ||
      document.getElementById("dp") !== null ||
      document.getElementById("ppd") !== null
    );
  };

  /**
   * Add styles for the chart container
   */
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

  /**
   * Create chart element with loading/error states
   */
  const createChartElement = (
    title: string,
    linkUrl: string,
    imageUrl: string,
    altText: string,
    id: string,
    visible = true,
  ): HTMLDivElement => {
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

    // Set src after event listeners
    img.src = imageUrl;

    link.appendChild(img);
    wrapper.appendChild(titleDiv);
    wrapper.appendChild(link);
    wrapper.appendChild(errorDiv);

    return wrapper;
  };

  const addCamelChart = (
    camelCountry: string,
    asin: string,
    refresh: boolean,
    chartsContent: HTMLDivElement,
  ) => {
    const camelChart = createChartElement(
      "CamelCamelCamel",
      `https://${camelCountry}.camelcamelcamel.com/product/${asin}`,
      `https://charts.camelcamelcamel.com/${camelCountry}/${asin}/amazon-new-used.png?force=1&zero=0&w=600&h=400&desired=false&legend=1&ilt=1&tp=all&fo=0`,
      `CamelCamelCamel price history for ${asin}`,
      "camelChart",
      !refresh,
    );
    if (refresh) {
      const currentChart = document.getElementById("camelChart");
      if (currentChart) {
        currentChart.parentNode?.append(camelChart);

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

  const addKeepaChart = (
    keepaDomain: number,
    asin: string,
    tld: string,
    refresh: boolean,
    chartsContent: HTMLDivElement,
  ) => {
    const keepaChart = createChartElement(
      "Keepa",
      `https://keepa.com/#!product/${keepaDomain}-${asin}`,
      `https://graph.keepa.com/pricehistory.png?used=1&asin=${asin}&domain=${tld}`,
      `Keepa price history for ${asin}`,
      "keepaChart",
      !refresh,
    );
    if (refresh) {
      const currentChart = document.getElementById("keepaChart");
      if (currentChart) {
        currentChart.parentNode?.append(keepaChart);

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

  const createContainer = (
    camelCountry: string,
    asin: string,
    refresh: boolean,
    keepaDomain: number,
    tld: string,
  ) => {
    const container = document.createElement("div");
    container.id = `${SCRIPT_ID}-container`;

    // Create collapsible header
    const toggle = document.createElement("div");
    toggle.className = "collapse-toggle";
    toggle.textContent = "Price History Charts";
    toggle.addEventListener("click", () => {
      container.classList.toggle("collapsed");
      // Save preference
      try {
        localStorage.setItem(
          `${SCRIPT_ID}-collapsed`,
          container.classList.contains("collapsed") ? "true" : "false",
        );
      } catch (e) {
        log("Error saving collapsed state:", e);
        // Ignore storage errors
      }
    });

    // Restore collapsed state
    try {
      if (localStorage.getItem(`${SCRIPT_ID}-collapsed`) === "true") {
        container.classList.add("collapsed");
      }
    } catch (e) {
      log("Error restoring collapsed state:", e);
      // Ignore storage errors
    }

    const chartsContent = document.createElement("div");
    chartsContent.className = "charts-content";

    // Add CamelCamelCamel chart
    if (camelCountry) {
      addCamelChart(camelCountry, asin, refresh, chartsContent);
    }

    // Add Keepa chart
    if (keepaDomain) {
      addKeepaChart(keepaDomain, asin, tld, refresh, chartsContent);
    }

    container.appendChild(toggle);
    container.appendChild(chartsContent);
    return container;
  };

  /**
   * Main function to inject charts
   */
  const injectCharts = (refresh = false) => {
    // Prevent duplicate injection
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

    // Create main container
    const container = createContainer(
      camelCountry,
      asin,
      refresh,
      keepaDomain,
      tld,
    );

    if (!refresh) {
      // Insert at beginning of parent element
      parentElement.insertBefore(container, parentElement.firstChild);
    }

    log("Charts injected successfully");
  };

  /**
   * Initialize with retry logic for dynamic content
   */
  const init = (refresh = false) => {
    // Try immediately
    injectCharts(refresh);

    // If charts weren't injected, set up observer for dynamic content
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
        subtree: true,
      });

      // Cleanup after 10 seconds regardless
      setTimeout(() => observer.disconnect(), 10000);
    }
  };

  export const main = () => {
    // Handle SPA navigation (Amazon sometimes uses pushState)
    let lastUrl = location.href;
    const urlObserver = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        log("URL changed, reinitializing");
        // Small delay to let page update
        setTimeout(function () {
          init(true);
        }, STANDARD_DELAY);
      }
    });

    urlObserver.observe(document.body, { childList: true, subtree: true });

    // Start
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", (_ev) => init());
    } else {
      init();
    }
  };
}
AmazonCamelCamelCamelKeepaPriceCharts.main();
