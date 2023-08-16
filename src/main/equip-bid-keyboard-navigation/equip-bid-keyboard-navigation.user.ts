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
  const indexAction = (action: 'plus' | 'minus'): void => {
    // auto page navigation
    if (index === 0 && prevLink && action === 'minus') {
      // go to previous page (if available)
      prevLink.click();
    } else if (index > lots.length - 2 && nextLink && action === 'plus') {
      // go to next page (if available)
      nextLink.click();
    } else if (action === 'plus') {
      lots[index].classList.remove('row_selected');
      index++;
      lots[index].classList.add('row_selected');
      lots[index].scrollIntoView({
        block: 'center',
      });
    } else if (action === 'minus') {
      lots[index].classList.remove('row_selected');
      index--;
      lots[index].classList.add('row_selected');
      lots[index].scrollIntoView({
        block: 'center',
      });
    }
  };

  const addToWatchList = (): void => {
    // find the right watchlist button
    const watchlistButton = lots[index].querySelector<HTMLAnchorElement>('a.item-watch-up');
    if (watchlistButton) {
      watchlistButton.click();
    }
  };

  const openInNewTab = (): void => {
    // find the url
    const url = lots[index].getAttribute('data-url');
    if (url) {
      window.open(url, '_blank');
    }
  };

  const showHelp = (): void => {
    document.querySelector<HTMLDialogElement>('dialog.ShortcutsHelp')?.showModal();
  };

  const hideHelp = (): void => {
    document.querySelector<HTMLDialogElement>('dialog.ShortcutsHelp')?.close();
  };

  const createHelp = (): HTMLDialogElement => {
    const helpDiv = document.createElement('dialog');
    helpDiv.classList.add('ShortcutsHelp');
    const hintDiv = document.createElement('div');
    hintDiv.classList.add('ShortcutsHelp__hint');
    hintDiv.insertAdjacentText('afterbegin', 'ESC to close');
    const title = document.createElement('div');
    title.classList.add('ShortcutsHelp__title');
    title.insertAdjacentText('afterbegin', 'Keyboard Shortcuts Help');
    helpDiv.appendChild(hintDiv);
    helpDiv.appendChild(title);
    helpTopics.forEach(topic => {
      const section = document.createElement('div');
      section.classList.add('ShortcutsHelp__section');
      const sectionTitle = document.createElement('div');
      sectionTitle.classList.add('ShortcutsHelp__section-title');
      sectionTitle.insertAdjacentText('afterbegin', topic.section);
      section.appendChild(sectionTitle);
      helpDiv.appendChild(section);
      topic.items.forEach(item => {
        const itemDiv = document.createElement('div');
        const itemKey = document.createElement('span');
        itemKey.classList.add('ShortcutsHelp__shortcut');
        itemKey.insertAdjacentText('afterbegin', item.key);
        const itemValue = document.createTextNode(item.description);
        itemDiv.appendChild(itemKey);
        itemDiv.appendChild(itemValue);
        section.appendChild(itemDiv);
      });
    });
    return helpDiv;
  };

  const initScript = (): void => {
    // load new styles
    const head = document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    head.appendChild(style);
    if (style.sheet) {
      style.sheet.insertRule(`.ShortcutsHelp {
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
    }`);
      style.sheet.insertRule(`.ShortcutsHelp__title {
      border-bottom: 1px solid #444;
      color: #999;
      font-weight: 700;
      margin-bottom: 9px;
      padding-bottom: 9px
  }`);
      style.sheet.insertRule(`.ShortcutsHelp__hint {
    color: #999;
    float: right;
}`);
      style.sheet.insertRule(`.ShortcutsHelp__section {
    margin-bottom: 17px;
    margin-top: 0
}`);
      style.sheet.insertRule(`.ShortcutsHelp__section-title {
    color: #999;
    margin-bottom: 8px;
    margin-top: 9px
}`);
      style.sheet.insertRule(`.ShortcutsHelp__shortcut {
    color: #2bb24c;
    display: inline-block;
    padding-right: 6px;
    width: 55px
}`);
      style.sheet.insertRule(`@keyframes shortcuts-help-fade-in {
    from {
        opacity: 0
    }

    to {
        opacity: 1
    }
}`);
      style.sheet.insertRule(`@keyframes shortcuts-help-fade-out {
    from {
        opacity: 1
    }

    to {
        opacity: 0
    }
}`);
    }

    // create help div
    const helpDiv = createHelp();

    // attach to body
    document.body.appendChild(helpDiv);

    if (lotList) {
      makeLotItemsIntoCards(lotList);
    }
  };

  type HelpTopic = {
    section: string;
    items: { key: string; description: string }[];
  };

  const makeLotItemsIntoCards = (lotList: HTMLDivElement) => {
    let newNode: HTMLDivElement | null = null;
    for (const child of Array.from(lotList.children)) {
      if (child.tagName === 'HR' || child.classList.contains('lot-divider')) {
        // this is the boundary for our content
        // create a new node and insert it after the boundary
        newNode = document.createElement('div');
        newNode.classList.add('well');
        child.after(newNode);
      } else if (newNode) {
        // if we have a node, move content from the lotList into the well
        // add href to wrapper div
        if (!newNode.getAttribute('data-url') && newNode.querySelector<HTMLAnchorElement>('a[href]')) {
          const url = newNode.querySelector<HTMLAnchorElement>('a[href]');
          if (url) {
            newNode.setAttribute('data-url', url.href);
          }
        }
        newNode.appendChild(child);
      }
    }
    lots = Array.from(document.querySelectorAll<HTMLDivElement>('div.well'));
  };

  const lotList = document.querySelector<HTMLDivElement>('div.lot-list');
  let lots: HTMLDivElement[] = [];
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
  let index = 0;

  window.addEventListener('keydown', event => {
    if (event.code === 'KeyJ') {
      indexAction('plus');
    }
    if (event.code === 'KeyK') {
      indexAction('minus');
    }
    if (event.code === 'KeyW') {
      addToWatchList();
    }
    if (event.code === 'KeyV') {
      openInNewTab();
    }
    if (event.code === 'Slash' && event.shiftKey) {
      showHelp();
    }
    if (event.code === 'Escape') {
      hideHelp();
    }
  });

  initScript();
}
