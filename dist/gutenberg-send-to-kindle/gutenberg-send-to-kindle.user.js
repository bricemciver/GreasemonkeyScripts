// ==UserScript==
// @name Gutenberg Send to Kindle
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @description Adds a 'Send to Kindle' button on Project Gutenberg ebook pages to send EPUB3 files directly to your Kindle device via Amazon
// @license MIT
// @version 0.1
// @match https://www.gutenberg.org/ebooks/*
// @match https://gutenberg.org/ebooks/*
// @icon https://icons.duckduckgo.com/ip3/gutenberg.org.ico
// @grant GM.xmlHttpRequest
// @connect amazon.com
// @connect gutenberg.org
// @run-at document-end
// ==/UserScript==

/* jshint esversion: 6 */
"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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

  // node_modules/uuid/dist/stringify.js
  var byteToHex = [];
  for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 256).toString(16).slice(1));
  }
  function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  }

  // node_modules/uuid/dist/rng.js
  var getRandomValues;
  var rnds8 = new Uint8Array(16);
  function rng() {
    if (!getRandomValues) {
      if (typeof crypto === "undefined" || !crypto.getRandomValues) {
        throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
      }
      getRandomValues = crypto.getRandomValues.bind(crypto);
    }
    return getRandomValues(rnds8);
  }

  // node_modules/uuid/dist/native.js
  var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
  var native_default = { randomUUID };

  // node_modules/uuid/dist/v4.js
  function _v4(options, buf, offset) {
    var _a, _b, _c;
    options = options || {};
    const rnds = (_c = (_b = options.random) != null ? _b : (_a = options.rng) == null ? void 0 : _a.call(options)) != null ? _c : rng();
    if (rnds.length < 16) {
      throw new Error("Random bytes length must be >= 16");
    }
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      if (offset < 0 || offset + 16 > buf.length) {
        throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
      }
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = rnds[i];
      }
      return buf;
    }
    return unsafeStringify(rnds);
  }
  function v4(options, buf, offset) {
    if (native_default.randomUUID && !buf && !options) {
      return native_default.randomUUID();
    }
    return _v4(options, buf, offset);
  }
  var v4_default = v4;

  // src/main/gutenberg-send-to-kindle/gutenberg-send-to-kindle.user.ts
  var GutenbergSendToKindle;
  ((GutenbergSendToKindle2) => {
    let HttpStatus;
    ((HttpStatus2) => {
      HttpStatus2[HttpStatus2["OK"] = 200] = "OK";
    })(HttpStatus || (HttpStatus = {}));
    const baseHeaders = {
      Origin: "https://www.amazon.com",
      Referer: "https://www.amazon.com/sendtokindle",
      "Content-Type": "application/json"
    };
    const CSRFPattern = /name=["']csrfToken["'][^>]*value=["']([^"']+)["']/i;
    const ContentLengthPattern = /content-length:\s*(\d+)/i;
    const EPUB_CONTENT_TYPE = "application/epub+zip";
    const TOAST_TIMEOUT_MS = 5e3;
    const AMAZON_SENDTOKINDLE_URL = "https://www.amazon.com/sendtokindle";
    const LevelToClassMap = {
      info: "gstk-toast--info",
      error: "gstk-toast--error",
      success: "gstk-toast--success"
    };
    let cachedCsrfToken = null;
    const ensureStatus = (response, expectedStatus = 200 /* OK */) => {
      if (response.status !== expectedStatus) {
        throw new Error(`Request returned status ${response.status}`);
      }
    };
    const parseJsonResponse = (responseText) => {
      try {
        return JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Failed to parse response: ${e}`);
      }
    };
    const getCsrfToken = () => __async(null, null, function* () {
      if (cachedCsrfToken) {
        log("Using cached CSRF token");
        return cachedCsrfToken;
      }
      log("Fetching CSRF token from Amazon sendtokindle page");
      const response = yield GM.xmlHttpRequest({
        method: "GET",
        url: AMAZON_SENDTOKINDLE_URL
      });
      const html = response.responseText || "";
      const signInSpanPattern = /<span[^>]*id=["']s2k-dnd-sign-in-button-text["'][^>]*>[\s\S]*?Sign\s*in[\s\S]*?<\/span>/i;
      if (signInSpanPattern.test(html)) {
        log("getCsrfToken: found s2k sign-in span in amazon page response — user not signed in");
        throw new Error("NOT_LOGGED_IN");
      }
      const m = CSRFPattern.exec(html);
      if (m == null ? void 0 : m[1]) {
        cachedCsrfToken = m[1];
        log("Retrieved CSRF token", { token: cachedCsrfToken });
        return cachedCsrfToken;
      }
      const excerpt = (html.substring(0, 1e3) || "").split(/\s+/).join(" ");
      log("Warning: Could not find CSRF token in Amazon page excerpt:", excerpt);
      throw new Error("CSRF_NOT_FOUND");
    });
    const log = (message, data) => {
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      if (data) {
        console.info(`[Gutenberg Send to Kindle ${timestamp}] ${message}`, data);
      } else {
        console.info(`[Gutenberg Send to Kindle ${timestamp}] ${message}`);
      }
    };
    const injectStyles = () => {
      var _a;
      const styleId = "gstk-injected-styles";
      if (document.getElementById(styleId)) {
        return;
      }
      const css = `
      .gstk-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 4px;
        z-index: 10000;
        font-size: 14px;
        max-width: 300px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        transition: opacity 0.2s ease;
      }
      .gstk-toast--error { background-color: #fee; color: #c00; border: 1px solid #fcc; }
      .gstk-toast--success { background-color: #efe; color: #060; border: 1px solid #cfc; }
      .gstk-toast--info { background-color: #eef; color: #006; border: 1px solid #ccf; }

      .gstk-button {
        padding: 8px 16px;
        background-color: #ff9900;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: background-color 0.2s;
      }
      .gstk-button:hover { background-color: #ff9933; }
    `;
      const styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.textContent = css;
      (_a = document.head) == null ? void 0 : _a.appendChild(styleEl);
    };
    const showMessage = (message, type = "info") => {
      const messageEl = document.createElement("div");
      const toastClass = LevelToClassMap[type] || "gstk-toast--info";
      messageEl.classList.add("gstk-toast", toastClass);
      messageEl.textContent = message;
      document.body.appendChild(messageEl);
      setTimeout(() => {
        messageEl.remove();
      }, TOAST_TIMEOUT_MS);
    };
    const getEpubInfo = () => {
      const epub3Candidates = Array.from(document.querySelectorAll('a[href*=".epub3."]'));
      let epubLink = null;
      const exactEpub3Text = "EPUB3 (E-readers incl. Send-to-Kindle)";
      for (const a of epub3Candidates) {
        if ((a.textContent || "").trim() === exactEpub3Text) {
          epubLink = a;
          log("EPUB3 link selected by exact text and href", { href: a.href });
          break;
        }
      }
      if (!epubLink) {
        log("No EPUB3 link found on page; aborting");
        return null;
      }
      const epubUrl = epubLink.href;
      const filename = epubUrl.split("/").pop() || "book.epub";
      let title = null;
      let author = null;
      try {
        const pageTitle = (document.title || "").split("|")[0].trim();
        const lastBy = pageTitle.toLowerCase().lastIndexOf(" by ");
        if (lastBy !== -1) {
          title = pageTitle.substring(0, lastBy).trim();
          author = pageTitle.substring(lastBy + 4).trim();
        }
        log("Title/author extracted from document.title", { title, author });
      } catch (e) {
        log("Failed to extract title/author from document.title", e);
      }
      log("Found EPUB info", {
        filename,
        title,
        author,
        epubUrl
      });
      return { url: epubUrl, filename, title, author };
    };
    const downloadEpub = (url) => __async(null, null, function* () {
      log(`Downloading EPUB from ${url}`);
      const response = yield GM.xmlHttpRequest({
        url,
        method: "GET",
        responseType: "arraybuffer"
      }).catch((e) => {
        log(`Failed to download EPUB: ${e}`);
        throw e;
      });
      log(`EPUB downloaded successfully, size: ${response.response.byteLength} bytes`);
      return response.response;
    });
    const headEpub = (url) => __async(null, null, function* () {
      log(`Performing HEAD request for EPUB: ${url}`);
      const response = yield GM.xmlHttpRequest({ method: "HEAD", url }).catch((e) => {
        log("HEAD request failed", e);
        return null;
      });
      const headers = (response == null ? void 0 : response.responseHeaders) || "";
      const m = new RegExp(ContentLengthPattern).exec(headers);
      if (m == null ? void 0 : m[1]) {
        const size = Number.parseInt(m[1], 10);
        log("HEAD returned Content-Length", size);
        return size;
      } else {
        log("HEAD did not return Content-Length");
        return null;
      }
    });
    const initSendToKindle = (fileSize, csrfToken) => __async(null, null, function* () {
      log("Initializing Send to Kindle", { fileSize });
      const payload = {
        fileSize,
        contentType: EPUB_CONTENT_TYPE,
        appVersion: "1.0",
        appName: "drag_drop_web",
        fileExtension: "epub"
      };
      log("Sending init request to Amazon (/sendtokindle/init)");
      const response = yield GM.xmlHttpRequest({
        method: "POST",
        url: `${AMAZON_SENDTOKINDLE_URL}/init`,
        headers: __spreadProps(__spreadValues({}, baseHeaders), {
          "anti-csrftoken-a2z": csrfToken,
          Accept: "*/*"
        }),
        data: JSON.stringify(payload)
      }).catch((e) => {
        log("Init request failed", e);
        throw e;
      });
      log("Init response status", response.status);
      ensureStatus(response);
      const data = parseJsonResponse(response.responseText);
      log("Init response received", data);
      if (data.statusCode !== 0) {
        throw new Error(`Init failed with status code: ${data.statusCode}`);
      }
      return data;
    });
    const uploadEpub = (uploadUrl, epubData, csrfToken) => __async(null, null, function* () {
      log("Uploading EPUB to Kindle", {
        uploadUrl,
        dataSize: epubData.byteLength
      });
      log("Sending upload request");
      const response = yield GM.xmlHttpRequest({
        method: "PUT",
        url: uploadUrl,
        headers: __spreadProps(__spreadValues({}, baseHeaders), {
          "Content-Type": EPUB_CONTENT_TYPE,
          "anti-csrftoken-a2z": csrfToken
        }),
        data: epubData,
        responseType: "arraybuffer"
      }).catch((e) => {
        log(`Upload request failed: ${e}`);
        throw e;
      });
      log("Upload response status", response.status);
      ensureStatus(response);
      const text = new TextDecoder().decode(response.response);
      const data = parseJsonResponse(text);
      log("Upload response received", data);
      return data;
    });
    const sendToKindle = (stkToken, title, author, contentLength, filename, csrfToken) => __async(null, null, function* () {
      log("Sending to Kindle", {
        stkToken,
        title,
        author,
        contentLength,
        filename
      });
      const payload = {
        stkToken,
        title,
        author,
        extName: "drag_drop_web",
        inputFormat: "epub",
        extVersion: "1.0",
        dataType: EPUB_CONTENT_TYPE,
        stkGuid: "",
        archive: true,
        fileSize: contentLength,
        forceConvert: "false",
        inputFileName: filename,
        batchId: v4_default()
      };
      log("Sending final send request (/sendtokindle/send-v2)");
      const response = yield GM.xmlHttpRequest({
        method: "POST",
        url: `${AMAZON_SENDTOKINDLE_URL}/send-v2`,
        headers: __spreadProps(__spreadValues({}, baseHeaders), {
          "anti-csrftoken-a2z": csrfToken,
          Accept: "*/*"
        }),
        data: JSON.stringify(payload)
      }).catch((e) => {
        log(`Send request failed: ${e}`);
        throw e;
      });
      log("Send response status", response.status);
      ensureStatus(response);
      const data = parseJsonResponse(response.responseText);
      log("Send response received", data);
      return data;
    });
    const sendEpubToKindle = () => __async(null, null, function* () {
      try {
        showMessage("Preparing to send to Kindle...", "info");
        log("Starting send to Kindle process");
        log("Retrieving EPUB info from page");
        const epubInfo = getEpubInfo();
        if (!epubInfo) {
          showMessage("Could not find EPUB3 version on this page", "error");
          log("Aborting: no EPUB3 found on page");
          return;
        }
        if (!epubInfo.title || !epubInfo.author) {
          showMessage("Sending cancelled — title/author required.", "error");
          return;
        }
        const headSize = yield headEpub(epubInfo.url);
        if (!headSize) {
          log("HEAD did not provide Content-Length; aborting send to Kindle.");
          showMessage("Unable to determine EPUB size; cannot send to Kindle.", "error");
          return;
        }
        log("Fetching CSRF token from Amazon (deferred until metadata ready)");
        let csrfToken;
        try {
          csrfToken = yield getCsrfToken();
        } catch (error) {
          let msg;
          if (error instanceof Error) {
            msg = error.message;
          } else {
            msg = String(error);
          }
          if (msg === "NOT_LOGGED_IN") {
            showMessage("You must be signed into Amazon for Send to Kindle to work. Please sign in and try again.", "error");
            log("User not signed into Amazon (CSRF fetch indicated login page)");
            return;
          }
          if (msg === "CSRF_NOT_FOUND") {
            showMessage("Could not read Amazon's security token. Try refreshing Amazon or logging in.", "error");
            log("CSRF token not found in Amazon page response", error);
            return;
          }
          showMessage("Unable to fetch security token from Amazon. Please refresh and try again.", "error");
          log("Failed to get CSRF token", error);
          return;
        }
        log("Step 1: Initializing Send to Kindle", { fileSize: headSize });
        const initData = yield initSendToKindle(headSize, csrfToken);
        log("Downloading EPUB after init to prepare upload");
        const epubData = yield downloadEpub(epubInfo.url);
        log("Step 2: Uploading EPUB");
        const uploadData = yield uploadEpub(initData.uploadUrl, epubData, csrfToken);
        log("Step 3: Sending to Kindle");
        const sendData = yield sendToKindle(
          initData.stkToken,
          epubInfo.title,
          epubInfo.author,
          uploadData["Content-Length"],
          epubInfo.filename,
          csrfToken
        );
        log("Send to Kindle completed successfully", sendData);
        showMessage(`Sent "${epubInfo.title}" to your Kindle!`, "success");
      } catch (error) {
        let errorMessage;
        if (error instanceof Error) {
          errorMessage = error.message;
        } else {
          errorMessage = String(error);
        }
        log("Error sending to Kindle", error);
        showMessage(`Error: ${errorMessage}`, "error");
      }
    });
    const addSendToKindleButton = () => {
      let epubLink = null;
      const epubLinks = document.querySelectorAll('a[class*="link"][title*="Download"]');
      for (const link of Array.from(epubLinks)) {
        if (link.textContent.includes("Send-to-Kindle")) {
          epubLink = link;
          break;
        }
      }
      if (!epubLink) {
        log("No EPUB3 version available on this page");
        return;
      }
      const buttonContainer = document.createElement("div");
      buttonContainer.style.cssText = `
      margin: 8px 0 8px 8px;
      display: inline-block;
    `;
      const button = document.createElement("button");
      button.textContent = "📧 Send to Kindle";
      button.classList.add("gstk-button");
      button.addEventListener("click", (e) => {
        e.preventDefault();
        button.disabled = true;
        button.textContent = "⏳ Sending...";
        sendEpubToKindle().finally(() => {
          button.disabled = false;
          button.textContent = "📧 Send to Kindle";
        });
      });
      buttonContainer.appendChild(button);
      epubLink.after(buttonContainer);
      log("Send to Kindle button added successfully");
    };
    GutenbergSendToKindle2.main = () => {
      injectStyles();
      addSendToKindleButton();
    };
  })(GutenbergSendToKindle || (GutenbergSendToKindle = {}));
  GutenbergSendToKindle.main();
})();
//# sourceMappingURL=gutenberg-send-to-kindle.user.js.map
