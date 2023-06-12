// ==UserScript==
// @name         Equip-Bid Keyboard Nav
// @namespace    bricemciver
// @description  Use Feedly-style navigation on Equip Bid auctions
// @author       Brice McIver
// @license      MIT
// @version      0.2
// @match        https://www.equip-bid.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=equip-bid.com
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @connect      equip-bid.com
// ==/UserScript==
{
  type HelpTopic = {
    section: string;
    items: { key: string; description: string }[];
  };

  const lotList = document.querySelector<HTMLDivElement>('div.lot-list');
  const lots = Array.from(lotList?.querySelectorAll<HTMLHeadingElement>('h4[id^="itemTitle"]') ?? []);
  const prevLink = document.querySelector<HTMLLIElement>('li.previous a');
  const nextLink = document.querySelector<HTMLLIElement>('li.next a');
  const helpTopics: HelpTopic[] = [
    { section: '', items: [{ key: '?', description: 'Keyboard shortcuts' }] },
    {
      section: 'Auction items',
      items: [
        { key: 'j', description: 'Scroll to next auction item' },
        { key: 'k', description: 'Scroll to previous auction item' },
      ],
    },
    {
      section: 'Selected item',
      items: [
        { key: 'w', description: 'Add item to watchlist' },
        { key: 'v', description: 'Open item in a new tab' },
      ],
    },
  ];
  let index = -1;

  window.addEventListener(
    'keydown',
    event => {
      if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
      }

      switch (event.key) {
        case 'J':
        case 'j':
          index++;
          // Cancel the default action to avoid it being handled twice
          event.preventDefault();
          indexAction();
          break;
        case 'K':
        case 'k':
          index--;
          // Cancel the default action to avoid it being handled twice
          event.preventDefault();
          indexAction();
          break;
        case 'W':
        case 'w':
          event.preventDefault();
          addToWatchList();
          break;
        case 'V':
        case 'v':
          event.preventDefault();
          openInNewTab();
          break;
        case '?':
          event.preventDefault();
          showHelp();
          break;
        case 'Escape':
          event.preventDefault();
          hideHelp();
          break;
        default:
          // eslint-disable-next-line no-console
          console.log('Key pressed ' + event.key);
      }
    },
    true
  );

  const indexAction = (): void => {
    // auto page navigation
    if (index < 0 && prevLink) {
      // go to previous page (if available)
      prevLink.click();
    } else if (index > lots.length - 1 && nextLink) {
      // go to next page (if available)
      nextLink.click();
    } else {
      lots[index].scrollIntoView();
    }
  };

  const addToWatchList = (): void => {
    // find the right watchlist button
    const watchlistButton =
      lots[index].parentElement?.parentElement?.nextElementSibling?.querySelector<HTMLAnchorElement>('a.item-watch-up');
    if (watchlistButton) {
      watchlistButton.click();
    }
  };

  const openInNewTab = (): void => {
    // find the url
    const url = lots[index].querySelector<HTMLAnchorElement>('a');
    if (url) {
      window.open(url.href, '_blank');
    }
  };

  const showHelp = (): void => {
    document.querySelector<HTMLDialogElement>('dialog.ShortcutsHelp')?.showModal();
  };

  const hideHelp = (): void => {
    document.querySelector<HTMLDialogElement>('dialog.ShortcutsHelp')?.close();
  };

  const createHelp = (): HTMLDialogElement => {
    const helpDiv = createElement('dialog', {
      className: 'ShortcutsHelp',
    });
    const hintDiv = createElement(
      'div',
      {
        className: 'ShortcutsHelp__hint',
      },
      'ESC to close'
    );
    const title = createElement(
      'div',
      {
        className: 'ShortcutsHelp__title',
      },
      'Keyboard Shortcuts Help'
    );
    helpDiv.appendChild(hintDiv);
    helpDiv.appendChild(title);
    helpTopics.forEach(topic => {
      const section = createElement('div', {
        className: 'ShortcutsHelp__section',
      });
      const sectionTitle = createElement(
        'div',
        {
          className: 'ShortcutsHelp__section-title',
        },
        topic.section
      );
      section.appendChild(sectionTitle);
      helpDiv.appendChild(section);
      topic.items.forEach(item => {
        const itemDiv = createElement('div');
        const itemKey = createElement(
          'span',
          {
            className: 'ShortcutsHelp__shortcut',
          },
          item.key
        );
        const itemValue = document.createTextNode(item.description);
        itemDiv.appendChild(itemKey);
        itemDiv.appendChild(itemValue);
        section.appendChild(itemDiv);
      });
    });
    return helpDiv;
  };

  const createElement = <K extends keyof HTMLElementTagNameMap>(
    type: K,
    config?: Record<string, string>,
    text?: string
  ): HTMLElementTagNameMap[K] => {
    const theElement = document.createElement(type);
    if (config) {
      for (const [key, value] of Object.entries(config)) {
        if (key.toLowerCase() === 'classname') {
          theElement.setAttribute('class', value);
        } else {
          theElement.setAttribute(key, value);
        }
      }
    }
    if (text) {
      theElement.insertAdjacentText('afterbegin', text);
    }
    return theElement;
  };

  const initScript = (): void => {
    // load new styles
    const head = document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.textContent = `.ShortcutsHelp {
    animation: shortcuts-help-fade-in .25s ease-in-out;
    background-color: #111;
    border-radius: .25rem;
    color: #fff;
    font-size: 1.25rem;
    left: 50%;
    line-height: 17px;
    padding: 20px;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 350px;
    z-index: 99999
}

.ShortcutsHelp__title {
    border-bottom: 1px solid #444;
    color: #999;
    font-weight: 700;
    margin-bottom: 9px;
    padding-bottom: 9px
}

.ShortcutsHelp__hint {
    color: #999;
    float: right;
}

.ShortcutsHelp__section {
    margin-bottom: 17px;
    margin-top: 0
}

.ShortcutsHelp__section-title {
    color: #999;
    margin-bottom: 8px;
    margin-top: 9px
}

.ShortcutsHelp__shortcut {
    color: #2bb24c;
    display: inline-block;
    padding-right: 6px;
    width: 55px
}

@keyframes shortcuts-help-fade-in {
    from {
        opacity: 0
    }

    to {
        opacity: 1
    }
}

@keyframes shortcuts-help-fade-out {
    from {
        opacity: 1
    }

    to {
        opacity: 0
    }
}`;
    head.appendChild(style);

    // create help div
    const helpDiv = createHelp();

    // attach to body
    document.body.appendChild(helpDiv);
  };

  initScript();
}
