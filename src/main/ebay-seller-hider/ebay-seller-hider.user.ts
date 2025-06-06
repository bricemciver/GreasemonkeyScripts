namespace EbaySellerHider {
  let filterReviews = true;
  let reviewMin = 10;
  let filterFeedback = true;
  let feedbackMin = 95.0;
  let hideSponsored = true;
  let sponsorClass = '';

  const hideItem = (seller: HTMLElement): void => {
    const itemRegExp = RegExp(/\((.*)\) (.*)%/).exec(seller.innerText);
    if (itemRegExp) {
      const [, reviews, feedback] = itemRegExp;

      const reviewsNum = Number.parseInt(reviews.replace(',', ''), 10);
      const feedbackNum = Number.parseFloat(feedback);
      let parent = seller.parentElement;
      while (parent && parent.tagName !== 'LI') {
        parent = parent.parentElement;
      }
      if (parent) {
        parent.style.display =
          (filterReviews && reviewsNum < reviewMin) || (filterFeedback && feedbackNum < feedbackMin) ? 'none' : 'list-item';
        // don't bother looking for sponsored posts if already hidden
        if (hideSponsored && parent.style.display === 'list-item') {
          let hideSponsoredPost = false;
          const sponsoredSpan = Array.from(parent.querySelectorAll('span')).find(item => item.textContent === 'Sponsored');
          if (sponsoredSpan) {
            const labelAttr = sponsoredSpan.parentElement?.parentElement?.getAttribute('aria-labelledBy');
            if (labelAttr && labelAttr === sponsorClass) {
              hideSponsoredPost = true;
            }
          }
          parent.style.display = hideSponsoredPost ? 'none' : 'list-item';
        }
      }
    }
  };

  const createHeader = (): HTMLDivElement => {
    const header = document.createElement('div');
    const headerTitle = document.createElement('h3');
    headerTitle.classList.add('x-refine__item');
    headerTitle.textContent = 'Sellers';
    header.append(headerTitle);
    return header;
  };

  const createCheckboxEventListener = (valueName: string, checkbox: HTMLInputElement): void => {
    if (valueName === 'reviewMin') {
      localStorage.setItem('filterReviews', checkbox.checked ? 'true' : 'false');
      updateFilter();
    }
    if (valueName === 'feedbackMin') {
      localStorage.setItem('filterFeedback', checkbox.checked ? 'true' : 'false');
      updateFilter();
    }
    if (valueName === 'hideSponsored') {
      localStorage.setItem('hideSponsored', checkbox.checked ? 'true' : 'false');
      updateFilter();
    }
  };

  const createCheckbox = (text: string, valueName: string): HTMLInputElement => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.ariaLabel = text;
    checkbox.classList.add('cbx', 'x-refine__multi-select-checkbox');
    checkbox.autocomplete = 'off';
    checkbox.ariaHidden = 'true';
    checkbox.tabIndex = -1;
    checkbox.role = 'presentation';
    if (
      (valueName === 'reviewMin' && filterReviews) ||
      (valueName === 'feedbackMin' && filterFeedback) ||
      (valueName === 'hideSponsored' && hideSponsored)
    ) {
      checkbox.setAttribute('checked', 'true');
    }
    checkbox.addEventListener('input', () => createCheckboxEventListener(valueName, checkbox));
    return checkbox;
  };

  const createListItem = (text: string, valueName: string, value?: string): HTMLLIElement => {
    const listItem = document.createElement('li');
    listItem.classList.add('x-refine__main__list--value');
    const selectItem = document.createElement('div');
    selectItem.classList.add('x-refine__multi-select');
    const checkbox = createCheckbox(text, valueName);
    const checkboxText = document.createElement('span');
    checkboxText.classList.add('cbx', 'x-refine__multi-select-cbx');
    checkboxText.innerText = text;
    if (value) {
      const input = document.createElement('input');
      input.type = 'text';
      input.pattern = 'd*';
      input.value = value;
      input.addEventListener('change', evt => {
        const target = evt.target as HTMLInputElement | null;
        if (target) {
          localStorage.setItem(valueName, target.value);
          updateFilter();
        }
      });
      input.style.height = '22px';
      input.style.width = '50px';
      input.style.margin = '-3px 0 0 8px';
      input.style.padding = '3px';
      input.style.float = 'right';
      input.style.fontSize = '11px';

      checkboxText.append(input);
    }
    selectItem.append(checkbox);
    selectItem.append(checkboxText);
    listItem.append(selectItem);
    return listItem;
  };

  const createGroup = (): HTMLDivElement => {
    const group = document.createElement('div');
    group.classList.add('x-refine__group');
    const listHeader = document.createElement('ul');
    listHeader.classList.add('x-refine__main__value');
    listHeader.style.clear = 'both';
    listHeader.append(createListItem('# of Reviews over ', 'reviewMin', reviewMin.toString()));
    listHeader.append(createListItem('Feedback over ', 'feedbackMin', feedbackMin.toString()));
    listHeader.append(createListItem('Hide sponsored', 'hideSponsored'));
    group.append(listHeader);
    return group;
  };

  export const getPresets = (): void => {
    filterReviews = localStorage.getItem('filterReviews') !== 'false';
    reviewMin = Number.parseInt(localStorage.getItem('reviewMin') ?? '10', 10);
    filterFeedback = localStorage.getItem('filterFeedback') !== 'false';
    feedbackMin = Number.parseFloat(localStorage.getItem('feedbackMin') ?? '95.0');
    hideSponsored = localStorage.getItem('hideSponsored') !== 'false';
  };

  export const addFilter = (): void => {
    const menu = document.querySelector('.x-refine__left__nav');
    if (menu) {
      const list = document.createElement('li');
      list.classList.add('x-refine__main__list');
      list.append(createHeader());
      list.append(createGroup());
      menu.prepend(list);
    }
  };

  export const updateFilter = (): void => {
    getPresets();
    const sellers = document.querySelectorAll('span.s-item__seller-info-text');
    for (const seller of Array.from(sellers)) {
      hideItem(seller as HTMLElement);
    }
  };

  export const findSponsoredClass = (): void => {
    // get inserted style
    const styleBlock = Array.from(document.head.getElementsByTagName('style')).find(item => item.sheet !== null);
    if (styleBlock) {
      const cssRuleList = styleBlock.sheet?.cssRules;
      if (cssRuleList) {
        const rule = Array.from(cssRuleList).find(item => item.cssText.includes('inline') && item.cssText.includes('span.'));
        if (rule) {
          const regex = /\.([a-zA-Z0-9_-]+)\s*\{/;
          const match = regex.exec(rule.cssText);
          if (match) {
            sponsorClass = match[1];
          }
        }
      }
    }
  };
}
EbaySellerHider.getPresets();
EbaySellerHider.addFilter();
EbaySellerHider.updateFilter();
EbaySellerHider.findSponsoredClass();
