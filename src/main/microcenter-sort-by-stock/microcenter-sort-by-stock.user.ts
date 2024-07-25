namespace MicrocenterSortByStock {
  export const addOptionToMenu = () => {
    // find the menu
    const menu = document.querySelector<HTMLUListElement>('div.searchActions > div.sorting ul.dropdown-menu');
    if (menu) {
      // grab the first entry as a reference
      const firstEntry = menu.querySelector<HTMLAnchorElement>('li a');
      // create the new entry
      const stockSort = document.createElement('li');
      stockSort.classList.add('dropdown-itemLI');
      const stockSortLink = document.createElement('a');
      stockSortLink.classList.add('dropdown-item');
      // create the href based on the first entry
      if (firstEntry?.href.includes('sortby')) {
        const sortByIndex = firstEntry.href.indexOf('sortby');
        stockSortLink.href = firstEntry.href.substring(0, sortByIndex) + 'sortby=stock';
      } else {
        stockSortLink.href = firstEntry?.href + '&sortby=stock';
      }
      stockSortLink.textContent = 'Stock';
      stockSort.appendChild(stockSortLink);
      menu.appendChild(stockSort);
    }
  };

  export const isSortByStock = () => {
    return window.location.search.includes('sortby=stock');
  };

  export const sortByStock = () => {
    // Show "Stock" as the selected item in the sort by list
    const selectedItem = document.querySelector<HTMLSpanElement>('span.sortByText');
    if (selectedItem) {
      selectedItem.textContent = 'Stock';
    }
    // Get all of the entries on the page
    const entries = document.querySelectorAll<HTMLLIElement>('li.product_wrapper');
    // Sort the entries
    const sortedEntries = Array.from(entries).sort(stockSortFunc);
    // Replace the existing list with the new one
    const menu = document.querySelector<HTMLUListElement>('#productGrid > ul');
    menu?.replaceChildren(...sortedEntries);
  };

  const stockSortFunc = (entry1: HTMLLIElement, entry2: HTMLLIElement) => {
    let entry1Stock = 0;
    let entry2Stock = 0;
    // Get the stock from each entry
    let entry1StockLi = entry1.querySelector<HTMLSpanElement>('span.inventoryCnt')?.textContent;
    if (entry1StockLi) {
      entry1StockLi = entry1StockLi.replace(' IN STOCK', '');
      entry1Stock = entry1StockLi.includes('25+') ? 26 : Number.parseInt(entry1StockLi);
    }
    // Get the stock from each entry
    let entry2StockLi = entry2.querySelector<HTMLSpanElement>('span.inventoryCnt')?.textContent;
    if (entry2StockLi) {
      entry2StockLi = entry2StockLi.replace(' IN STOCK', '');
      entry2Stock = entry2StockLi.includes('25+') ? 26 : Number.parseInt(entry2StockLi);
    }
    return entry2Stock - entry1Stock;
  };
}
MicrocenterSortByStock.addOptionToMenu();
if (MicrocenterSortByStock.isSortByStock()) {
  MicrocenterSortByStock.sortByStock();
}
