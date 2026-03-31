// ==UserScript==
// @name         Ancestry.com - Remove paid hints
// @namespace    https://github.com/bricemciver/GreasemonekeyScripts
// @version      1.0.1
// @author       Brice McIver
// @description  Removes paid hints on the "All Hints" page and on individual person pages
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ancestry.com
// @match        https://*.ancestry.com/hints/tree/*
// @match        https://*.ancestry.de/hints/tree/*
// @match        https://*.ancestry.com/cs/offers/join*
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

(function() {
var familyTreeSources = [
		62476,
		9289,
		1030,
		1006
	];
	var handleOfferPage = (db, link) => {
		const dbidMatch = RegExp(/[?&]dbid=(\d+)/).exec(link.href);
		if (dbidMatch) {
			const dbid = Number.parseInt(dbidMatch[1], 10);
			const getRequest = db.transaction("collections_os", "readonly").objectStore("collections_os").get(dbid);
			getRequest.onsuccess = () => {
				const result = getRequest.result;
				const putOS = db.transaction("collections_os", "readwrite").objectStore("collections_os");
				if (result) putOS.put({
					dbid,
					name: result.name,
					tree: result.tree,
					paid: true,
					visible: false
				});
				else putOS.put({
					dbid,
					name: "",
					tree: false,
					paid: true,
					visible: false
				});
			};
		}
	};
	var initDB = () => new Promise((resolve, reject) => {
		const openRequest = window.indexedDB.open("collections_db", 1);
		openRequest.onerror = () => {
			const errorMessage = `Database failed to open: ${openRequest?.error?.message ?? "Unknown error"}`;
			console.error(errorMessage);
			reject(new Error(errorMessage));
		};
		openRequest.onsuccess = () => {
			resolve(openRequest.result);
		};
		openRequest.onupgradeneeded = () => {
			const tmpDb = openRequest.result;
			const objectStore = tmpDb.createObjectStore("collections_os", { keyPath: "dbid" });
			objectStore.createIndex("name", "name", { unique: true });
			objectStore.createIndex("paid", "paid", { unique: false });
			objectStore.createIndex("tree", "tree", { unique: false });
			objectStore.createIndex("visible", "visible", { unique: false });
			console.log("Database setup complete");
			resolve(tmpDb);
		};
	});
	var evalLink = (db, link) => {
		const linkText = link.textContent;
		if (linkText) {
			if (linkText !== "Review" && linkText.indexOf("	") === -1 && linkText.indexOf("\n") === -1) {
				const dbidMatch = RegExp(/[?&]dbid=(\d+)/).exec(link.href);
				if (dbidMatch) {
					const dbid = Number.parseInt(dbidMatch[1], 10);
					const getRequest = db.transaction("collections_os", "readonly").objectStore("collections_os").get(dbid);
					getRequest.onsuccess = () => {
						const result = getRequest.result;
						let hide = false;
						if (!result) GM.xmlHttpRequest({
							method: "GET",
							url: link.href,
							onreadystatechange(response) {
								if (response.readyState === Tampermonkey.ReadyState.HeadersReceived) {
									const location = response.finalUrl;
									if (location) {
										const denyMatch = RegExp(/offers\/join/).exec(location);
										const putOS = db.transaction("collections_os", "readwrite").objectStore("collections_os");
										const isTree = familyTreeSources.indexOf(dbid) !== -1;
										if (denyMatch) {
											putOS.add({
												dbid,
												name: link.textContent,
												paid: true,
												visible: false,
												tree: isTree
											});
											hide = true;
										} else if (isTree) {
											putOS.add({
												dbid,
												name: link.textContent,
												paid: false,
												visible: false,
												tree: true
											});
											hide = true;
										} else putOS.add({
											dbid,
											name: link.textContent,
											paid: false,
											visible: true,
											tree: false
										});
									}
								}
							}
						});
						else hide = !result.visible;
						if (hide) {
							const li = link.closest("li[role='group']");
							const section = link.closest("section");
							if (li) {
								li.remove();
								if (section && section.querySelectorAll("li[role='group']").length === 1) section.remove();
							}
						}
					};
				}
			}
		}
	};
	var scanHints = (db, element) => {
		const sseLinks = element.querySelectorAll("a[href*='sse.dll']");
		for (const link of sseLinks) evalLink(db, link);
		const familyTreeLinks = element.querySelectorAll("a[href*='/family-tree/tree/']");
		for (const link of familyTreeLinks) {
			const li = link.closest("li[role='group']");
			const section = link.closest("section");
			if (li) {
				li.remove();
				if (section && section.querySelectorAll("li[role='group']").length === 1) section.remove();
			}
		}
	};
	var mutationObserverSetup = (db) => {
		const config = {
			childList: true,
			subtree: true
		};
		const callback = (mutationList) => {
			for (const mutation of mutationList) if (mutation.type === "childList") for (const addedNode of mutation.addedNodes) {
				const element = addedNode;
				if (element.innerHTML && (element.innerHTML.indexOf("sse.dll") !== -1 || element.innerHTML.indexOf("/family-tree/tree/") !== -1)) scanHints(db, element);
			}
		};
		new MutationObserver(callback).observe(document, config);
	};
	var main = async () => {
		const db = await initDB();
		if (db instanceof IDBDatabase) if (window.location.href.indexOf("offers/join") !== -1) handleOfferPage(db, window.location);
		else mutationObserverSetup(db);
	};
	main();
})();