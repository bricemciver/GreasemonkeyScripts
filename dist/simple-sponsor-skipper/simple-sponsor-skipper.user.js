// ==UserScript==
// @name Simple Sponsor Skipper
// @author mthsk
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @description Skips annoying intros, sponsors and w/e on YouTube and its frontends like Invidious and CloudTube using the SponsorBlock API.
// @license AGPL-3.0-or-later
// @version 2024.06
// @grant GM.getValue
// @grant GM.setValue
// @grant GM.notification
// @grant GM.openInTab
// @grant GM.registerMenuCommand
// @grant GM.xmlHttpRequest
// @connect sponsor.ajay.app
// @match *://m.youtube.com/*
// @match *://youtu.be/*
// @match *://www.youtube.com/*
// @match *://www.youtube-nocookie.com/embed/*
// @match *://odysee.com/*
// @match *://yt.artemislena.eu/*
// @match *://tube.cadence.moe/*
// @match *://y.com.sb/*
// @match *://invidious.esmailelbob.xyz/*
// @match *://invidious.flokinet.to/*
// @match *://inv.frail.com.br/*
// @match *://invidious.garudalinux.org/*
// @match *://invidious.kavin.rocks/*
// @match *://inv.nadeko.net/*
// @match *://invidious.namazso.eu/*
// @match *://iv.nboeck.de/*
// @match *://invidious.nerdvpn.de/*
// @match *://youtube.owacon.moe/*
// @match *://inv.pistasjis.net/*
// @match *://invidious.projectsegfau.lt/*
// @match *://inv.bp.projectsegfau.lt/*
// @match *://inv.in.projectsegfau.lt/*
// @match *://inv.us.projectsegfau.lt/*
// @match *://vid.puffyan.us/*
// @match *://invidious.sethforprivacy.com/*
// @match *://invidious.slipfox.xyz/*
// @match *://invidious.snopyta.org/*
// @match *://inv.vern.cc/*
// @match *://invidious.weblibre.org/*
// @match *://youchu.be/*
// @match *://yewtu.be/*
// @allFrames true
// @run-at document-start
// @icon https://icons.duckduckgo.com/ip3/sponsor.ajay.app.ico
// ==/UserScript==

// ==UserScript==
// @name Simple Sponsor Skipper
// @author mthsk
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @description Skips annoying intros, sponsors and w/e on YouTube and its frontends like Invidious and CloudTube using the SponsorBlock API.
// @license AGPL-3.0-or-later
// @version 2024.06
// @grant GM.getValue
// @grant GM.setValue
// @grant GM.notification
// @grant GM.openInTab
// @grant GM.registerMenuCommand
// @grant GM.xmlHttpRequest
// @connect sponsor.ajay.app
// @match *://m.youtube.com/*
// @match *://youtu.be/*
// @match *://www.youtube.com/*
// @match *://www.youtube-nocookie.com/embed/*
// @match *://odysee.com/*
// @match *://yt.artemislena.eu/*
// @match *://tube.cadence.moe/*
// @match *://y.com.sb/*
// @match *://invidious.esmailelbob.xyz/*
// @match *://invidious.flokinet.to/*
// @match *://inv.frail.com.br/*
// @match *://invidious.garudalinux.org/*
// @match *://invidious.kavin.rocks/*
// @match *://inv.nadeko.net/*
// @match *://invidious.namazso.eu/*
// @match *://iv.nboeck.de/*
// @match *://invidious.nerdvpn.de/*
// @match *://youtube.owacon.moe/*
// @match *://inv.pistasjis.net/*
// @match *://invidious.projectsegfau.lt/*
// @match *://inv.bp.projectsegfau.lt/*
// @match *://inv.in.projectsegfau.lt/*
// @match *://inv.us.projectsegfau.lt/*
// @match *://vid.puffyan.us/*
// @match *://invidious.sethforprivacy.com/*
// @match *://invidious.slipfox.xyz/*
// @match *://invidious.snopyta.org/*
// @match *://inv.vern.cc/*
// @match *://invidious.weblibre.org/*
// @match *://youchu.be/*
// @match *://yewtu.be/*
// @allFrames true
// @run-at document-start
// @icon https://icons.duckduckgo.com/ip3/sponsor.ajay.app.ico
// ==/UserScript==

/* jshint esversion: 6 */
"use strict";
(() => {
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

  // src/main/simple-sponsor-skipper/simple-sponsor-skipper.user.ts
  var SimpleSponsorSkipper;
  ((SimpleSponsorSkipper2) => {
    const SPONSORBLOCK_HOSTNAME = "sponsor.ajay.app";
    const CATEGORY_LIST = [
      "sponsor",
      "intro",
      "outro",
      "interaction",
      "selfpromo",
      "preview",
      "music_offtopic",
      "filler"
    ];
    const DEFAULT_DELAY = 3e3;
    let s3settings;
    const info = (message) => {
      console.info(`${(/* @__PURE__ */ new Date()).toTimeString().split(" ")[0]} - ${message}`);
    };
    const go = (videoId) => __async(null, null, function* () {
      var _a, _b, _c, _d;
      console.debug("New video ID: " + videoId);
      const inst = s3settings.instance || SPONSORBLOCK_HOSTNAME;
      let segurl = "";
      let result = [];
      let rBefore = -1;
      let rPoi = -1;
      const cat = encodeURIComponent(
        JSON.stringify(shuffle(s3settings.categories))
      );
      if (s3settings.disable_hashing) {
        segurl = `https://${inst}/api/skipSegments?videoID=${videoId}&categories=${cat}`;
      } else {
        const vidsha256 = yield sha256(videoId);
        console.debug("SHA256 hash: " + vidsha256);
        segurl = `https://${inst}/api/skipSegments/${vidsha256.substring(0, 4)}?categories=${cat}`;
      }
      console.debug(segurl);
      const resp = yield GM.xmlHttpRequest({
        method: "GET",
        url: segurl,
        headers: {
          Accept: "application/json"
        }
      });
      try {
        const response = s3settings.disable_hashing ? JSON.parse(
          `[{"videoID":"${videoId}","segments":${resp.responseText}}]`
        ) : JSON.parse(resp.responseText);
        for (const video of response) {
          if (video.videoID === videoId) {
            rBefore = video.segments.length;
            result = processSegments(video.segments);
            if (((_a = result.at(-1)) == null ? void 0 : _a.category) === "poi_highlight") {
              rPoi = (_c = (_b = result.at(-1)) == null ? void 0 : _b.segment[0]) != null ? _c : -1;
              result.splice(-1, 1);
            }
            break;
          }
        }
      } catch (e) {
        console.debug(e);
        result = [];
      }
      let x = 0;
      let prevTime = -1;
      const favicon = (_d = document.head.querySelector(
        "link[rel=icon][href]"
      )) == null ? void 0 : _d.href;
      const PLR_SELECTOR = "#movie_player video, video#player_html5_api, video#player, video#video, video#vjs_video_3_html5_api";
      const getPlayer = () => {
        return new Promise((resolve) => {
          const plTimer = globalThis.setInterval(() => {
            const plr = document.body.querySelector(PLR_SELECTOR);
            if (!!plr && plr.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
              globalThis.clearInterval(plTimer);
              resolve(plr);
            }
          }, 10);
        });
      };
      const player = yield getPlayer();
      const poiNotification = {
        title: "Point of interest found!",
        text: `This video has a highlight segment at ${durationString(rPoi)}.
Click here to skip to it.
­
${document.title} (Video ID: ${videoId})`,
        onclick: () => player.currentTime = rPoi,
        silent: true,
        timeout: 5e3,
        image: favicon
      };
      const pfunc = () => {
        if (s3settings.notifications && !!rPoi && player.currentTime < rPoi) {
          GM.notification(poiNotification);
        }
      };
      if (!result.length) {
        if (s3settings.notifications && !!rPoi) {
          GM.notification(poiNotification);
          player.addEventListener("play", pfunc);
        }
        return;
      }
      if (s3settings.notifications && globalThis.self === window.top) {
        let ntxt = "";
        if (result.length === rBefore) {
          ntxt = "Received " + result.length;
          if (result.length > 1) {
            ntxt += " segments.";
          } else {
            ntxt += " segment.";
          }
        } else {
          ntxt = `Received ${rBefore} segments, ${result.length} after processed.`;
        }
        let newDuration = result[0].videoDuration;
        newDuration -= result.reduce(
          (total, segment) => total + (segment.segment[1] - segment.segment[0]),
          0
        );
        ntxt += "\nDuration: " + durationString(newDuration);
        const noti = {
          title: "Skippable segments found!",
          text: `${ntxt}
­
${document.title} (Video ID: ${videoId})`,
          silent: true,
          timeout: 5e3,
          image: favicon
        };
        if (rPoi >= 0) {
          noti.text = noti.text.replace(
            "\n­\n",
            `
­
This video has a highlight segment at ${durationString(rPoi)}.
Click here to skip to it.
­
`
          );
          noti.onclick = () => player.currentTime = rPoi;
        }
        GM.notification(noti);
      }
      const vfunc = () => {
        if (location.hostname !== "odysee.com" && !location.pathname.includes(videoId) && !location.search.includes("v=" + videoId)) {
          player.removeEventListener("timeupdate", vfunc);
          player.removeEventListener("play", pfunc);
          return;
        }
        if (!player.paused && x < result.length && player.currentTime >= result[x].segment[0]) {
          if (player.currentTime < result[x].segment[1]) {
            player.currentTime = result[x].segment[1];
            if (s3settings.notifications) {
              GM.notification({
                title: `Skipped ${result[x].category.replace("music_offtopic", "non-music").replace("selfpromo", "self-promotion")} segment`,
                text: `Segment ${x + 1} out of ${result.length}
­
${document.title} (Video ID: ${videoId})`,
                silent: true,
                timeout: 5e3,
                image: favicon
              });
            }
            console.info(
              `Skipping ${result[x].category} segment (${x + 1} out of ${result.length}) from ${result[x].segment[0]} to ${result[x].segment[1]}`
            );
          }
          x++;
        } else if (player.currentTime < prevTime) {
          for (let s = 0; s < result.length; s++) {
            if (player.currentTime < result[s].segment[1]) {
              x = s;
              console.debug("Next segment is " + s);
              break;
            }
          }
        }
        prevTime = player.currentTime;
      };
      player.addEventListener("timeupdate", vfunc);
      player.addEventListener("play", pfunc);
    });
    const durationString = (scs) => {
      const durDate = /* @__PURE__ */ new Date(0);
      durDate.setSeconds(scs);
      const durHour = Math.floor(durDate.getTime() / 1e3 / 60 / 60);
      const durMin = durDate.getUTCMinutes();
      const durSec = durDate.getUTCSeconds();
      return `${(durHour > 0 ? durHour + ":" : "") + (durHour === 0 || durMin > 9 ? durMin : "0" + durMin)}:${durSec > 9 ? durSec : "0" + durSec}`;
    };
    const processSegments = (segments) => {
      if (typeof segments === "object") {
        const newSegments = [];
        let highlight = null;
        let hUpvotes = s3settings.upvotes - 1;
        for (let x = 0; x < segments.length; x++) {
          if (segments[x].category === "poi_highlight" && segments[x].votes > hUpvotes) {
            highlight = segments[x];
            hUpvotes = segments[x].upvotes;
          } else if (x > 0 && newSegments[newSegments.length - 1].segment[1] >= segments[x].segment[0] && newSegments[newSegments.length - 1].segment[1] < segments[x].segment[1] && segments[x].votes >= s3settings.upvotes) {
            newSegments[newSegments.length - 1].segment[1] = segments[x].segment[1];
            newSegments[newSegments.length - 1].category = "combined";
            console.debug(x + " combined with " + (newSegments.length - 1));
          } else if (segments[x].votes < s3settings.upvotes || x > 0 && newSegments[newSegments.length - 1].segment[1] >= segments[x].segment[0] && newSegments[newSegments.length - 1].segment[1] >= segments[x].segment[1]) {
            console.debug("Ignoring segment " + x);
          } else {
            newSegments.push(segments[x]);
            console.debug(`${newSegments.length - 1} added`);
          }
        }
        if (highlight) {
          newSegments.push(highlight);
        }
        return newSegments;
      } else {
        return [];
      }
    };
    const sha256 = (message) => __async(null, null, function* () {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = yield crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    });
    const shuffle = (array) => {
      let currentIndex = array.length, randomIndex;
      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex]
        ];
      }
      return array;
    };
    const createDialog = () => {
      const docHtml = document.getElementsByTagName("html")[0];
      const wrapper = document.createElement("div");
      wrapper.style.textAlign = "center";
      const header = document.createElement("h1");
      header.textContent = "Simple Sponsor Skipper";
      wrapper.appendChild(header);
      wrapper.appendChild(document.createElement("br"));
      const form = document.createElement("form");
      const formDiv = document.createElement("div");
      createCheckboxInput(formDiv, "sponsor", "Skip sponsor segments");
      formDiv.appendChild(document.createElement("br"));
      createCheckboxInput(formDiv, "intro", "Skip intro segments");
      formDiv.appendChild(document.createElement("br"));
      createCheckboxInput(formDiv, "outro", "Skip outro segments");
      formDiv.appendChild(document.createElement("br"));
      createCheckboxInput(
        formDiv,
        "interaction",
        "Skip interaction reminder segments"
      );
      formDiv.appendChild(document.createElement("br"));
      createCheckboxInput(formDiv, "selfpromo", "Skip self-promotion segments");
      formDiv.appendChild(document.createElement("br"));
      createCheckboxInput(formDiv, "preview", "Skip preview segments");
      formDiv.appendChild(document.createElement("br"));
      createCheckboxInput(
        formDiv,
        "music_offtopic",
        "Skip non-music segments in music videos"
      );
      formDiv.appendChild(document.createElement("br"));
      createCheckboxInput(
        formDiv,
        "filler",
        "Skip filler segments (WARNING: very aggressive!)"
      );
      formDiv.appendChild(document.createElement("br"));
      createNumberInput(formDiv, "upvotes", "Minimum segment upvotes");
      formDiv.appendChild(document.createElement("br"));
      createCheckboxInput(
        formDiv,
        "notifications",
        "Enable desktop notifications"
      );
      formDiv.appendChild(document.createElement("br"));
      createCheckboxInput(
        formDiv,
        "disable_hashing",
        "Disable Video ID Hashing (Pale Moon Compatibility Fix)"
      );
      formDiv.appendChild(document.createElement("br"));
      createDatalist(formDiv, "instance", "Database Instance:", "instances", [
        { value: "sponsor.ajay.app", label: "sponsor.ajay.app (Official)" },
        { value: "sponsorblock.kavin.rocks", label: "sponsorblock.kavin.rocks" },
        { value: "sponsorblock.gleesh.net", label: "sponsorblock.gleesh.net" },
        { value: "sb.theairplan.com", label: "sb.theairplan.com" }
      ]);
      formDiv.appendChild(document.createElement("br"));
      createSelectInput(formDiv, "darkmode", "Theme:", [
        { value: "-1", label: "auto" },
        { value: "0", label: "light" },
        { value: "1", label: "dark" }
      ]);
      form.appendChild(formDiv);
      form.appendChild(document.createElement("br"));
      const btnDiv = document.createElement("div");
      const btnSave = document.createElement("button");
      btnSave.id = "btnsave";
      btnSave.textContent = "Save settings";
      btnSave.type = "button";
      btnSave.style.marginRight = "1em";
      btnDiv.appendChild(btnSave);
      const btnClose = document.createElement("button");
      btnClose.type = "button";
      btnClose.id = "btnclose";
      btnClose.style.marginLeft = "1em";
      btnClose.textContent = "Close";
      btnDiv.appendChild(btnClose);
      form.appendChild(btnDiv);
      wrapper.appendChild(form);
      docHtml.appendChild(wrapper);
      return docHtml;
    };
    const createCheckboxInput = (parent, id, message) => {
      const input = document.createElement("input");
      input.id = id;
      input.type = "checkbox";
      const label = document.createElement("label");
      label.htmlFor = id;
      label.textContent = message;
      parent.appendChild(input);
      parent.appendChild(label);
    };
    const createNumberInput = (parent, id, message) => {
      const label = document.createElement("label");
      label.htmlFor = id;
      label.textContent = message;
      const input = document.createElement("input");
      input.id = id;
      input.type = "number";
      parent.appendChild(label);
      parent.appendChild(input);
    };
    const createDatalist = (parent, id, message, listId, options) => {
      const label = document.createElement("label");
      label.htmlFor = id;
      label.textContent = message;
      const input = document.createElement("input");
      input.id = id;
      input.type = "text";
      const datalist = document.createElement("datalist");
      datalist.id = listId;
      for (const option of options) {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        datalist.appendChild(optionElement);
      }
      parent.appendChild(label);
      parent.appendChild(input);
      parent.appendChild(datalist);
    };
    const createSelectInput = (parent, id, message, options) => {
      const label = document.createElement("label");
      label.htmlFor = id;
      label.textContent = message;
      const select = document.createElement("select");
      select.id = id;
      for (const option of options) {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        select.appendChild(optionElement);
      }
      parent.appendChild(label);
      parent.appendChild(select);
    };
    const loadEventListener = () => {
      var _a, _b;
      const docHtml = createDialog();
      docHtml.style = "";
      const headStyle = document.createElement("style");
      (_a = headStyle.sheet) == null ? void 0 : _a.insertRule(
        "body { background-color: white; color: black; }"
      );
      (_b = headStyle.sheet) == null ? void 0 : _b.insertRule(
        ".dark-theme { background-color: black; color: white; }"
      );
      document.head.appendChild(headStyle);
      document.title = "Simple Sponsor Skipper Configuration";
      for (const input of CATEGORY_LIST) {
        const checkboxInput = document.querySelector(`input#${input}`);
        if (checkboxInput) {
          checkboxInput.checked = s3settings.categories.includes(input);
        }
      }
      const upvotesInput = document.querySelector("input#upvotes");
      if (upvotesInput) {
        upvotesInput.value = s3settings.upvotes.toString();
      }
      const notificationsInput = document.querySelector(
        "input#notifications"
      );
      if (notificationsInput) {
        notificationsInput.checked = s3settings.notifications;
      }
      const disableHashingInput = document.querySelector(
        "input#disable_hashing"
      );
      if (disableHashingInput) {
        disableHashingInput.checked = s3settings.disable_hashing;
      }
      const instanceInput = document.querySelector("input#instance");
      if (instanceInput) {
        instanceInput.value = s3settings.instance || SPONSORBLOCK_HOSTNAME;
      }
      const darkmodeInput = document.querySelector("input#darkmode");
      if (darkmodeInput) {
        darkmodeInput.value = (s3settings.darkmode || -1).toString();
        darkmodeInput.addEventListener("change", (e) => {
          var _a2;
          const val = Number.parseInt(e.target.value, 10);
          if (val === 1 || val === -1 && ((_a2 = globalThis.matchMedia) == null ? void 0 : _a2.call(globalThis, "(prefers-color-scheme: dark)").matches)) {
            document.body.classList.add("dark-theme");
          } else {
            document.body.classList.remove("dark-theme");
          }
        });
        darkmodeInput.dispatchEvent(new Event("change"));
      }
      const btnSave = document.querySelector("button#btnsave");
      if (btnSave) {
        btnSave.addEventListener("click", () => __async(null, null, function* () {
          var _a2, _b2, _c, _d;
          s3settings.categories = [];
          for (const category of CATEGORY_LIST) {
            const checkboxCategory = document.querySelector(`input#${category}`);
            if (checkboxCategory == null ? void 0 : checkboxCategory.checked) {
              s3settings.categories.push(category);
            }
          }
          if (s3settings.categories.length === 0) {
            s3settings.categories = ["sponsor"];
          }
          if (notificationsInput == null ? void 0 : notificationsInput.checked) {
            s3settings.categories.push("poi_highlight");
          }
          s3settings.upvotes = Number.parseInt((_a2 = upvotesInput == null ? void 0 : upvotesInput.value) != null ? _a2 : "-2", 10) || -2;
          s3settings.notifications = (_b2 = notificationsInput == null ? void 0 : notificationsInput.checked) != null ? _b2 : false;
          s3settings.disable_hashing = (_c = disableHashingInput == null ? void 0 : disableHashingInput.checked) != null ? _c : false;
          if (instanceInput && (instanceInput == null ? void 0 : instanceInput.value.trim()) !== "") {
            s3settings.instance = instanceInput == null ? void 0 : instanceInput.value.trim();
          }
          s3settings.darkmode = Number.parseInt((_d = darkmodeInput == null ? void 0 : darkmodeInput.value) != null ? _d : "-1", 10) || -1;
          yield GM.setValue("s3settings", s3settings);
          info("Simple Sponsor Skipper: Settings saved!");
          btnSave.textContent = "Saved!";
          btnSave.disabled = true;
          setTimeout(() => {
            btnSave.textContent = "Save settings";
            btnSave.disabled = false;
          }, DEFAULT_DELAY);
        }));
      }
      const btnClose = document.querySelector("button#btnclose");
      if (btnClose) {
        btnClose.addEventListener(
          "click",
          () => location.replace(
            `${location.protocol}//${location.host}${location.pathname}${location.search}`
          )
        );
      }
    };
    SimpleSponsorSkipper2.main = () => __async(null, null, function* () {
      if (GM.registerMenuCommand === void 0) {
        GM.registerMenuCommand = () => {
          info(
            "Simple Sponsor Skipper: Menu comments are not currently supported by your Script Manager."
          );
        };
      }
      if (GM.notification === void 0) {
        GM.notification = () => {
          info(
            "Simple Sponsor Skipper: Notifications are not currently supported by your Script Manager."
          );
        };
      }
      s3settings = yield GM.getValue("s3settings");
      if (!!s3settings && Object.keys(s3settings).length > 0) {
        info("Simple Sponsor Skipper: Settings loaded!");
      } else {
        s3settings = {
          categories: [
            "preview",
            "sponsor",
            "outro",
            "music_offtopic",
            "selfpromo",
            "poi_highlight",
            "interaction",
            "intro"
          ],
          upvotes: -2,
          notifications: true,
          disable_hashing: false,
          instance: SPONSORBLOCK_HOSTNAME,
          darkmode: -1
        };
        if (navigator.userAgent.toLowerCase().includes("pale moon") || navigator.userAgent.toLowerCase().includes("mypal") || navigator.userAgent.toLowerCase().includes("male poon")) {
          s3settings.disable_hashing = true;
        }
        yield GM.setValue("s3settings", s3settings);
        info("Simple Sponsor Skipper: Default settings saved!");
        GM.notification({
          title: "Simple Sponsor Skipper",
          text: "It looks like this is your first time using Simple Sponsor Skipper.\n­\nClick here to open the configuration menu!",
          timeout: 1e4,
          silent: true,
          onclick() {
            GM.openInTab(
              `${document.location.protocol}//${document.location.host.replace("youtube-nocookie.com", "youtube.com")}${document.location.pathname.replace("/embed/", "/watch?v=").replace("/v/", "/watch?v=")}${document.location.search.replace("?", "&").replace("&v=", "?v=")}#s3config`
            );
          }
        });
      }
      if (location.hash.toLowerCase() === "#s3config") {
        let loadevent = "DOMContentLoaded";
        if (location.hostname === "odysee.com") {
          loadevent = "load";
        }
        globalThis.addEventListener(loadevent, loadEventListener);
      } else {
        let oldVidId = "";
        let params = new URLSearchParams(location.search);
        if (params.has("v")) {
          oldVidId = params.get("v");
          go(oldVidId);
        } else if (location.pathname.startsWith("/embed/") || location.pathname.startsWith("/v/")) {
          oldVidId = location.pathname.replace("/v/", "").replace("/embed/", "").split("/")[0];
          go(oldVidId);
        }
        window.addEventListener("load", function() {
          const observer = new MutationObserver((mutations) => {
            if (location.hostname === "odysee.com") {
              for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                  if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node;
                    if (element.id === "vjs_video_3") {
                      const thumb = document.body.querySelector(
                        "div.content__cover"
                      );
                      if (thumb) {
                        let videoUrl = thumb.style.backgroundImage;
                        videoUrl = videoUrl.substring(videoUrl.indexOf('"') + 1).split('"')[0];
                        if (videoUrl.includes("ytimg.com") || videoUrl.includes("img.youtube.com")) {
                          go(videoUrl.split("/vi/").pop().split("/")[0]);
                        } else if (!new RegExp(/\.(webp|jpeg|jpg|gif|png)$/).test(
                          videoUrl.toLowerCase()
                        )) {
                          go(videoUrl.split("/").pop());
                        }
                      }
                      break;
                    }
                  }
                }
              }
            } else {
              params = new URLSearchParams(location.search);
              if (params.has("v") && params.get("v") !== oldVidId) {
                oldVidId = params.get("v");
                go(oldVidId);
              } else if ((location.pathname.startsWith("/embed/") || location.pathname.startsWith("/v/")) && !location.pathname.includes(oldVidId)) {
                oldVidId = location.pathname.replace("/v/", "").replace("/embed/", "").split("/")[0];
                go(oldVidId);
              } else if (!params.has("v") && !location.pathname.includes("/embed/") && !location.pathname.includes("/v/")) {
                oldVidId = "";
              }
            }
          });
          const config = {
            childList: true,
            subtree: true
          };
          observer.observe(document.body, config);
        });
      }
      if (globalThis.self === window.top) {
        GM.registerMenuCommand("Configuration", function() {
          globalThis.location.replace(
            `${globalThis.location.protocol}//${globalThis.location.host}${globalThis.location.pathname}${globalThis.location.search}#s3config`
          );
          globalThis.location.reload();
        });
      }
    });
  })(SimpleSponsorSkipper || (SimpleSponsorSkipper = {}));
  SimpleSponsorSkipper.main();
})();
//# sourceMappingURL=simple-sponsor-skipper.user.js.map
