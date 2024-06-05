(() => {
  const familyTreeSources = [62476, 9289, 1030, 1006];

  const handleOfferPage = (db: IDBDatabase, link: Location) => {
    // extract dbid
    const dbidRegex = /[?&]dbid=(\d+)/;
    const dbidMatch = RegExp(dbidRegex).exec(link.href);
    if (dbidMatch) {
      const dbid = parseInt(dbidMatch[1], 10);
      // since we're on the offer page, we know it's paid
      const getRequest = db.transaction('collections_os', 'readonly').objectStore('collections_os').get(dbid);
      getRequest.onsuccess = event => {
        const target = event.target;
        if (target) {
          const result = (target as any).result;
          const putOS = db.transaction('collections_os', 'readwrite').objectStore('collections_os');
          if (result) {
            putOS.put({ dbid, name: result.name, tree: result.tree, paid: true, visible: false });
          } else {
            putOS.put({ dbid, name: '', tree: false, paid: true, visible: false });
          }
        }
      };
    }
  };

  const initDB = (): Promise<IDBDatabase | Event> =>
    new Promise((resolve, reject) => {
      const openRequest = window.indexedDB.open('collections_db', 1);

      // error handler signifies that the database didn't open successfully
      openRequest.onerror = event => {
        console.error('Database failed to open');
        reject(event);
      };

      // success handler signifies that the database opened successfully
      openRequest.onsuccess = _event => {
        // Store the opened database object in the db variable. This is used a lot below
        resolve(openRequest.result);
      };

      // Set up the database tables if this has not already been done
      openRequest.onupgradeneeded = event => {
        // Grab a reference to the opened database
        const eventTarget = event.target;
        if (eventTarget) {
          const tmpDb: IDBDatabase = (eventTarget as any).result;

          // Create an objectStore in our database to store notes and an auto-incrementing key
          // An objectStore is similar to a 'table' in a relational database
          const objectStore = tmpDb.createObjectStore('collections_os', {
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

  const evalLink = (db: IDBDatabase, link: HTMLAnchorElement): void => {
    // Make sure link has test
    const linkText = link.textContent;
    if (linkText) {
      // Skip review button links
      if (linkText !== 'Review' && linkText.indexOf('\t') === -1 && linkText.indexOf('\n') === -1) {
        // extract dbid
        const dbidRegex = /[?&]dbid=(\d+)/;
        const dbidMatch = RegExp(dbidRegex).exec(link.href);
        if (dbidMatch) {
          const dbid = parseInt(dbidMatch[1], 10);

          // see if database has info
          // start db transaction
          const getRequest = db.transaction('collections_os', 'readonly').objectStore('collections_os').get(dbid);
          getRequest.onsuccess = event => {
            const target = event.target;
            if (target) {
              const result = (target as any).result;
              let hide = false;
              // if no result, query link and add data to the database
              if (!result) {
                GM.xmlHttpRequest({
                  method: 'GET',
                  url: link.href,
                  onreadystatechange(response) {
                    if (response.readyState === Tampermonkey.ReadyState.HeadersReceived) {
                      // HeadersReceived
                      const location = response.finalUrl;
                      if (location) {
                        // find out if this is a paid link
                        const denyRegex = /offers\/join/;
                        const denyMatch = RegExp(denyRegex).exec(location);
                        const putOS = db.transaction('collections_os', 'readwrite').objectStore('collections_os');
                        const isTree = familyTreeSources.indexOf(dbid) !== -1;
                        if (denyMatch) {
                          // if match, add to paid collection database
                          putOS.add({ dbid, name: link.textContent, paid: true, visible: false, tree: isTree });
                          hide = true;
                        } else if (isTree) {
                          // by default, hide tree results
                          putOS.add({ dbid, name: link.textContent, paid: false, visible: false, tree: true });
                          hide = true;
                        } else {
                          // add to database as a free link so we don't re-query
                          putOS.add({ dbid, name: link.textContent, paid: false, visible: true, tree: false });
                        }
                      }
                    }
                  },
                });
              } else {
                hide = !result.visible;
              }
              if (hide) {
                // remove hint from view
                const li = link.closest("li[role='group']");
                const section = link.closest('section');
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

  const scanHints = (db: IDBDatabase, element: Element): void => {
    // get links
    const sseLinks = element.querySelectorAll<HTMLAnchorElement>("a[href*='sse.dll']");
    sseLinks.forEach(link => evalLink(db, link));

    // remove family tree
    const familyTreeLinks = element.querySelectorAll<HTMLAnchorElement>("a[href*='/family-tree/tree/']");
    familyTreeLinks.forEach(link => {
      // remove hint from view
      const li = link.closest("li[role='group']");
      const section = link.closest('section');
      if (li) {
        li.remove();
        if (section && section.querySelectorAll("li[role='group']").length === 1) {
          section.remove();
        }
      }
    });
  };

  const mutationObserverSetup = (db: IDBDatabase): void => {
    // Options for the observer (which mutations to observe)
    const config = { childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback: MutationCallback = (mutationList, _observer) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            const element = node as Element;
            if (
              element.innerHTML &&
              (element.innerHTML.indexOf('sse.dll') !== -1 || element.innerHTML.indexOf('/family-tree/tree/') !== -1)
            ) {
              scanHints(db, element);
            }
          });
        }
      }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(document, config);
  };

  const main = async (): Promise<void> => {
    const db = await initDB();
    if (db instanceof IDBDatabase) {
      // see if we're on offer page and handle it
      if (window.location.href.indexOf('offers/join') !== -1) {
        handleOfferPage(db, window.location);
      } else {
        mutationObserverSetup(db);
      }
    }
  };

  main().catch(_error => ({}));
})();
