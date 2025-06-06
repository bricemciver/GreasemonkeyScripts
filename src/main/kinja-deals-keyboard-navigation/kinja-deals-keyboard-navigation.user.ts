namespace KinjaDealsKeyboardNavigation {
  const headTags: Element[] = [];
  let pos = -1;

  const addGlobalStyle = (css: string): void => {
    const head = document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.innerHTML = css;
    head.appendChild(style);
  };

  const keyPressed = (event: KeyboardEvent): void => {
    if (event.code === 'KeyK' || event.code === 'KeyJ') {
      if (headTags[pos]) {
        headTags[pos].className = headTags[pos].className.replace(' selected', '');
      }
      if ('KeyK' === event.code) {
        pos--;
      }
      if ('KeyJ' === event.code) {
        pos++;
      }
      // wrap around
      if (pos >= headTags.length) {
        pos = 0;
      }
      if (pos < 0) {
        pos = headTags.length - 1;
      }
      headTags[pos].className = `${headTags[pos].className} selected`;
      headTags[pos].scrollIntoView();
    }
  };

  export const removeCruft = (): void => {
    for (const element of document.querySelectorAll('.js_movable_ad_slot')) {
      element.remove();
    }
    for (const element of document.querySelectorAll('.connatix-container')) {
      element.remove();
    }
    for (const element of Array.from(document.getElementsByTagName('span')).filter(
      item => item.textContent === 'G/O Media may get a commission',
    )) {
      element.closest('aside')?.remove();
    }
    for (const element of document.querySelectorAll('#sidebar_wrapper')) {
      element.closest('aside')?.remove();
    }
  };

  const createEntries = (containerDiv: Element): void => {
    let newElement: Element | null = null;
    for (const element of Array.from(containerDiv.children)) {
      // this is the beginning or end or a section
      if (element.tagName === 'H2' && element.textContent?.length && element.textContent.length > 0) {
        newElement = document.createElement('div');
        newElement.className = 'inlineFrame';
        element.insertAdjacentElement('beforebegin', newElement);
        newElement.append(element);
      } else if (newElement) {
        newElement.append(element);
      }
    }
  };

  const addListeners = (containerDiv: Element): void => {
    // get all section headers
    headTags.push(containerDiv);
    headTags.push(...Array.from(containerDiv.querySelectorAll('div.inlineFrame, h3, h4')));
    document.addEventListener('keydown', keyPressed);
  };

  export const main = () => {
    // find main content
    const mainDiv = document.querySelector('.js_post-content .js_commerce-inset-grid');
    if (mainDiv) {
      // add necessary styles
      addGlobalStyle(
        'div.inlineFrame { margin-top:17px; margin-bottom:17px; padding:33px; border-radius:3px; border: 1px solid rgba(0,0,0,0.05) }',
      );
      addGlobalStyle('div.inlineFrame.selected { border: 1px solid rgba(0, 0, 0, 0.15) }');
      addGlobalStyle('main { width:100% !important }');

      if (mainDiv.parentElement) {
        // create entries
        createEntries(mainDiv.parentElement);

        // add keyboard navigation
        addListeners(mainDiv.parentElement);
      }
    }
  };
}
// remove unneeded content
KinjaDealsKeyboardNavigation.removeCruft();
KinjaDealsKeyboardNavigation.main();
