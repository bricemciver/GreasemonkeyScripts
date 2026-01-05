namespace SimpleSponsorSkipper {
  const SPONSORBLOCK_HOSTNAME = "sponsor.ajay.app";

  const CATEGORY_LIST = [
    "sponsor",
    "intro",
    "outro",
    "interaction",
    "selfpromo",
    "preview",
    "music_offtopic",
    "filler",
  ];

  const DEFAULT_DELAY = 3000; // ms

  interface S3Settings {
    categories: string[];
    upvotes: number;
    notifications: boolean;
    disable_hashing: boolean;
    instance: string;
    darkmode: number;
  }

  type Segment = {
    category: string;
    segment: [number, number];
    votes: number;
    upvotes: number;
    videoDuration: number;
  };

  let s3settings: S3Settings;

  const info = (message: string) => {
    console.info(`${new Date().toTimeString().split(" ")[0]} - ${message}`);
  };

  const go = async (videoId: string) => {
    console.debug("New video ID: " + videoId);

    const inst = s3settings.instance || SPONSORBLOCK_HOSTNAME;
    let segurl = "";
    let result: Segment[] = [];
    let rBefore = -1;
    let rPoi = -1;
    const cat = encodeURIComponent(
      JSON.stringify(shuffle(s3settings.categories)),
    );

    if (s3settings.disable_hashing) {
      segurl = `https://${inst}/api/skipSegments?videoID=${videoId}&categories=${cat}`;
    } else {
      const vidsha256 = await sha256(videoId);
      console.debug("SHA256 hash: " + vidsha256);
      segurl = `https://${inst}/api/skipSegments/${vidsha256.substring(0, 4)}?categories=${cat}`;
    }
    console.debug(segurl);

    const resp = await GM.xmlHttpRequest({
      method: "GET",
      url: segurl,
      headers: {
        Accept: "application/json",
      },
    });
    try {
      const response = s3settings.disable_hashing
        ? JSON.parse(
            `[{"videoID":"${videoId}","segments":${resp.responseText}}]`,
          )
        : JSON.parse(resp.responseText);

      for (const video of response) {
        if (video.videoID === videoId) {
          rBefore = video.segments.length;
          result = processSegments(video.segments);
          if (result.at(-1)?.category === "poi_highlight") {
            rPoi = result.at(-1)?.segment[0] ?? -1;
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
    const favicon = document.head.querySelector<HTMLLinkElement>(
      "link[rel=icon][href]",
    )?.href;

    const PLR_SELECTOR =
      "#movie_player video, video#player_html5_api, video#player, video#video, video#vjs_video_3_html5_api";

    const getPlayer = () => {
      return new Promise<HTMLVideoElement>((resolve) => {
        const plTimer = globalThis.setInterval(() => {
          const plr =
            document.body.querySelector<HTMLVideoElement>(PLR_SELECTOR);
          if (!!plr && plr.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
            globalThis.clearInterval(plTimer);
            resolve(plr);
          }
        }, 10);
      });
    };

    const player = await getPlayer();

    const poiNotification = {
      title: "Point of interest found!",
      text: `This video has a highlight segment at ${durationString(rPoi)}.\nClick here to skip to it.\n\u00AD\n${document.title} (Video ID: ${videoId})`,
      onclick: () => (player.currentTime = rPoi),
      silent: true,
      timeout: 5000,
      image: favicon,
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
        0,
      );
      ntxt += "\nDuration: " + durationString(newDuration);
      const noti: Tampermonkey.NotificationDetails = {
        title: "Skippable segments found!",
        text: `${ntxt}\n\u00AD\n${document.title} (Video ID: ${videoId})`,
        silent: true,
        timeout: 5000,
        image: favicon,
      };
      if (rPoi >= 0) {
        noti.text = noti.text.replace(
          "\n\u00AD\n",
          `\n\u00AD\nThis video has a highlight segment at ${durationString(rPoi)}.\nClick here to skip to it.\n\u00AD\n`,
        );
        noti.onclick = () => (player.currentTime = rPoi);
      }
      GM.notification(noti);
    }
    const vfunc = () => {
      if (
        location.hostname !== "odysee.com" &&
        !location.pathname.includes(videoId) &&
        !location.search.includes("v=" + videoId)
      ) {
        player.removeEventListener("timeupdate", vfunc);
        player.removeEventListener("play", pfunc);
        return;
      }

      if (
        !player.paused &&
        x < result.length &&
        player.currentTime >= result[x].segment[0]
      ) {
        if (player.currentTime < result[x].segment[1]) {
          player.currentTime = result[x].segment[1];
          if (s3settings.notifications) {
            GM.notification({
              title: `Skipped ${result[x].category.replace("music_offtopic", "non-music").replace("selfpromo", "self-promotion")} segment`,
              text: `Segment ${x + 1} out of ${result.length}\n\u00AD\n${document.title} (Video ID: ${videoId})`,
              silent: true,
              timeout: 5000,
              image: favicon,
            });
          }
          console.info(
            `Skipping ${result[x].category} segment (${x + 1} out of ${result.length}) from ${result[x].segment[0]} to ${result[x].segment[1]}`,
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
  };

  const durationString = (scs: number) => {
    const durDate = new Date(0);
    durDate.setSeconds(scs);
    const durHour = Math.floor(durDate.getTime() / 1000 / 60 / 60);
    const durMin = durDate.getUTCMinutes();
    const durSec = durDate.getUTCSeconds();

    return `${(durHour > 0 ? durHour + ":" : "") + (durHour === 0 || durMin > 9 ? durMin : "0" + durMin)}:${durSec > 9 ? durSec : "0" + durSec}`;
  };

  const processSegments = (segments) => {
    if (typeof segments === "object") {
      const newSegments: Segment[] = [];
      let highlight = null;
      let hUpvotes = s3settings.upvotes - 1;
      for (let x = 0; x < segments.length; x++) {
        if (
          segments[x].category === "poi_highlight" &&
          segments[x].votes > hUpvotes
        ) {
          highlight = segments[x];
          hUpvotes = segments[x].upvotes;
        } else if (
          x > 0 &&
          newSegments[newSegments.length - 1].segment[1] >=
            segments[x].segment[0] &&
          newSegments[newSegments.length - 1].segment[1] <
            segments[x].segment[1] &&
          segments[x].votes >= s3settings.upvotes
        ) {
          newSegments[newSegments.length - 1].segment[1] =
            segments[x].segment[1];
          newSegments[newSegments.length - 1].category = "combined";
          console.debug(x + " combined with " + (newSegments.length - 1));
        } else if (
          segments[x].votes < s3settings.upvotes ||
          (x > 0 &&
            newSegments[newSegments.length - 1].segment[1] >=
              segments[x].segment[0] &&
            newSegments[newSegments.length - 1].segment[1] >=
              segments[x].segment[1])
        ) {
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

  const sha256 = async (message: string) => {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const shuffle = (array: string[]) => {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
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
      "Skip interaction reminder segments",
    );
    formDiv.appendChild(document.createElement("br"));
    createCheckboxInput(formDiv, "selfpromo", "Skip self-promotion segments");
    formDiv.appendChild(document.createElement("br"));
    createCheckboxInput(formDiv, "preview", "Skip preview segments");
    formDiv.appendChild(document.createElement("br"));
    createCheckboxInput(
      formDiv,
      "music_offtopic",
      "Skip non-music segments in music videos",
    );
    formDiv.appendChild(document.createElement("br"));
    createCheckboxInput(
      formDiv,
      "filler",
      "Skip filler segments (WARNING: very aggressive!)",
    );
    formDiv.appendChild(document.createElement("br"));
    createNumberInput(formDiv, "upvotes", "Minimum segment upvotes");
    formDiv.appendChild(document.createElement("br"));
    createCheckboxInput(
      formDiv,
      "notifications",
      "Enable desktop notifications",
    );
    formDiv.appendChild(document.createElement("br"));
    createCheckboxInput(
      formDiv,
      "disable_hashing",
      "Disable Video ID Hashing (Pale Moon Compatibility Fix)",
    );
    formDiv.appendChild(document.createElement("br"));
    createDatalist(formDiv, "instance", "Database Instance:", "instances", [
      { value: "sponsor.ajay.app", label: "sponsor.ajay.app (Official)" },
      { value: "sponsorblock.kavin.rocks", label: "sponsorblock.kavin.rocks" },
      { value: "sponsorblock.gleesh.net", label: "sponsorblock.gleesh.net" },
      { value: "sb.theairplan.com", label: "sb.theairplan.com" },
    ]);
    formDiv.appendChild(document.createElement("br"));
    createSelectInput(formDiv, "darkmode", "Theme:", [
      { value: "-1", label: "auto" },
      { value: "0", label: "light" },
      { value: "1", label: "dark" },
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

  const createCheckboxInput = (
    parent: HTMLElement,
    id: string,
    message: string,
  ) => {
    const input = document.createElement("input");
    input.id = id;
    input.type = "checkbox";
    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = message;
    parent.appendChild(input);
    parent.appendChild(label);
  };

  const createNumberInput = (
    parent: HTMLElement,
    id: string,
    message: string,
  ) => {
    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = message;
    const input = document.createElement("input");
    input.id = id;
    input.type = "number";
    parent.appendChild(label);
    parent.appendChild(input);
  };

  const createDatalist = (
    parent: HTMLElement,
    id: string,
    message: string,
    listId: string,
    options: { value: string; label: string }[],
  ) => {
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

  const createSelectInput = (
    parent: HTMLElement,
    id: string,
    message: string,
    options: { value: string; label: string }[],
  ) => {
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
    const docHtml = createDialog();
    docHtml.style = "";
    const headStyle = document.createElement("style");
    headStyle.sheet?.insertRule(
      "body { background-color: white; color: black; }",
    );
    headStyle.sheet?.insertRule(
      ".dark-theme { background-color: black; color: white; }",
    );
    document.head.appendChild(headStyle);
    document.title = "Simple Sponsor Skipper Configuration";
    for (const input of CATEGORY_LIST) {
      const checkboxInput =
        document.querySelector<HTMLInputElement>(`input#${input}`);
      if (checkboxInput)  {
        checkboxInput.checked = s3settings.categories.includes(input);
      }
    }
    const upvotesInput =
      document.querySelector<HTMLInputElement>("input#upvotes");
    if (upvotesInput) {
      upvotesInput.value = s3settings.upvotes.toString();
    }
    const notificationsInput = document.querySelector<HTMLInputElement>(
      "input#notifications",
    );
    if (notificationsInput) {
      notificationsInput.checked = s3settings.notifications;
    }
    const disableHashingInput = document.querySelector<HTMLInputElement>(
      "input#disable_hashing",
    );
    if (disableHashingInput) {
      disableHashingInput.checked = s3settings.disable_hashing;
    }
    const instanceInput =
      document.querySelector<HTMLInputElement>("input#instance");
    if (instanceInput) {
      instanceInput.value = s3settings.instance || SPONSORBLOCK_HOSTNAME;
    }
    const darkmodeInput =
      document.querySelector<HTMLInputElement>("input#darkmode");
    if (darkmodeInput) {
      darkmodeInput.value = (s3settings.darkmode || -1).toString();
      darkmodeInput.addEventListener("change", (e) => {
        const val = Number.parseInt((e.target as any).value, 10);
        if (
          val === 1 ||
          (val === -1 &&
            globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches)
        ) {
          document.body.classList.add("dark-theme");
        } else {
          document.body.classList.remove("dark-theme");
        }
      });
      darkmodeInput.dispatchEvent(new Event("change"));
    }

    const btnSave = document.querySelector<HTMLButtonElement>("button#btnsave");
    if (btnSave) {
      btnSave.addEventListener("click", async () => {
        // segment categories
        s3settings.categories = [];
        for (const category of CATEGORY_LIST) {
          const checkboxCategory = document.querySelector<HTMLInputElement>(`input#${category}`);
          if (checkboxCategory?.checked) {
            s3settings.categories.push(category);
          }
        }
        if (s3settings.categories.length === 0) {
          s3settings.categories = ["sponsor"];
        }
        if (notificationsInput?.checked) {
          s3settings.categories.push("poi_highlight");
        }
        // end
        s3settings.upvotes = Number.parseInt(upvotesInput?.value ?? "-2", 10) || -2;
        s3settings.notifications = notificationsInput?.checked ?? false;
        s3settings.disable_hashing = disableHashingInput?.checked ?? false;
        if (instanceInput && instanceInput?.value.trim() !== "") {
          s3settings.instance = instanceInput?.value.trim();
        }
        s3settings.darkmode = Number.parseInt(darkmodeInput?.value ?? "-1", 10) || -1;
        await GM.setValue("s3settings", s3settings);
        info("Simple Sponsor Skipper: Settings saved!");
        btnSave.textContent = "Saved!";
        btnSave.disabled = true;
        setTimeout(() => {
          btnSave.textContent = "Save settings";
          btnSave.disabled = false;
        }, DEFAULT_DELAY);
      });
    }
    const btnClose =
      document.querySelector<HTMLButtonElement>("button#btnclose");
    if (btnClose) {
      btnClose.addEventListener("click", () =>
        location.replace(
          `${location.protocol}//${location.host}${location.pathname}${location.search}`,
        ),
      );
    }
  };

  export const main = async () => {
    if (GM.registerMenuCommand === undefined) {
      //safari
      (GM as any).registerMenuCommand = () => {
        info(
          "Simple Sponsor Skipper: Menu comments are not currently supported by your Script Manager.",
        );
      };
    }

    if (GM.notification === undefined) {
      //safari
      (GM as any).notification = () => {
        info(
          "Simple Sponsor Skipper: Notifications are not currently supported by your Script Manager.",
        );
      };
    }

    s3settings = await GM.getValue("s3settings");
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
          "intro",
        ],
        upvotes: -2,
        notifications: true,
        disable_hashing: false,
        instance: SPONSORBLOCK_HOSTNAME,
        darkmode: -1,
      };
      if (
        navigator.userAgent.toLowerCase().includes("pale moon") ||
        navigator.userAgent.toLowerCase().includes("mypal") ||
        navigator.userAgent.toLowerCase().includes("male poon")
      ) {
        s3settings.disable_hashing = true;
      }
      await GM.setValue("s3settings", s3settings);
      info("Simple Sponsor Skipper: Default settings saved!");
      GM.notification({
        title: "Simple Sponsor Skipper",
        text: "It looks like this is your first time using Simple Sponsor Skipper.\n\u00AD\nClick here to open the configuration menu!",
        timeout: 10000,
        silent: true,
        onclick() {
          GM.openInTab(
            `${document.location.protocol}//${document.location.host.replace("youtube-nocookie.com", "youtube.com")}${document.location.pathname.replace("/embed/", "/watch?v=").replace("/v/", "/watch?v=")}${document.location.search.replace("?", "&").replace("&v=", "?v=")}#s3config`,
          );
        },
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
      } else if (
        location.pathname.startsWith("/embed/") ||
        location.pathname.startsWith("/v/")
      ) {
        oldVidId = location.pathname
          .replace("/v/", "")
          .replace("/embed/", "")
          .split("/")[0];
        go(oldVidId);
      }

      window.addEventListener("load", function () {
        const observer = new MutationObserver((mutations) => {
          if (location.hostname === "odysee.com") {
            for (const mutation of mutations) {
              for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  if (element.id === "vjs_video_3") {
                    const thumb =
                      document.body.querySelector<HTMLDivElement>(
                        "div.content__cover",
                      );
                    if (thumb) {
                      let videoUrl = thumb.style.backgroundImage;
                      videoUrl = videoUrl
                        .substring(videoUrl.indexOf('\"') + 1)
                        .split('\"')[0];
                      if (
                        videoUrl.includes("ytimg.com") ||
                        videoUrl.includes("img.youtube.com")
                      ) {
                        go(videoUrl.split("/vi/").pop().split("/")[0]);
                      } else if (
                        !new RegExp(/\.(webp|jpeg|jpg|gif|png)$/).test(
                          videoUrl.toLowerCase(),
                        )
                      ) {
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
            } else if (
              (location.pathname.startsWith("/embed/") ||
                location.pathname.startsWith("/v/")) &&
              !location.pathname.includes(oldVidId)
            ) {
              oldVidId = location.pathname
                .replace("/v/", "")
                .replace("/embed/", "")
                .split("/")[0];
              go(oldVidId);
            } else if (
              !params.has("v") &&
              !location.pathname.includes("/embed/") &&
              !location.pathname.includes("/v/")
            ) {
              oldVidId = "";
            }
          }
        });

        const config = {
          childList: true,
          subtree: true,
        };

        observer.observe(document.body, config);
      });
    }
    if (globalThis.self === window.top) {
      GM.registerMenuCommand("Configuration", function () {
        globalThis.location.replace(
          `${globalThis.location.protocol}//${globalThis.location.host}${globalThis.location.pathname}${globalThis.location.search}#s3config`,
        );
        globalThis.location.reload();
      });
    }
  };
}
SimpleSponsorSkipper.main();
