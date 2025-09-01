namespace EquipBidRestyle {
  const createCarousel = (id: string, images: string[]) => {
    const carousel = document.createElement('div')
    carousel.classList.add('carousel', 'slide')
    carousel.id = id
    carousel.setAttribute('data-ride', 'carousel')
    carousel.setAttribute('data-interval', 'false')
    const indicators = document.createElement('ol')
    indicators.classList.add('carousel-indicators')
    const inner = document.createElement('div')
    inner.classList.add('carousel-inner')
    inner.role = 'listbox'
    images.forEach((image, index) => {
      // create indicators
      const indicator = document.createElement('li')
      indicator.setAttribute('data-target', `#${id}`)
      indicator.setAttribute('data-slide-to', index.toString())
      if (index === 0) {
        indicator.classList.add('active')
      }
      indicators.append(indicator)

      const item = document.createElement('div')
      item.classList.add('item')
      if (index === 0) {
        item.classList.add('active')
      }
      const img = document.createElement('img')
      img.src = image
      img.style.objectFit = 'contain'
      img.style.height = '202px'
      img.style.margin = 'auto'
      item.append(img)
      inner.append(item)
    })
    const leftControl = document.createElement('a')
    leftControl.classList.add('left', 'carousel-control')
    leftControl.href = `#${id}`
    leftControl.setAttribute('role', 'button')
    leftControl.setAttribute('data-slide', 'prev')
    const leftIcon = document.createElement('span')
    leftIcon.classList.add('glyphicon', 'glyphicon-chevron-left')
    leftIcon.setAttribute('aria-hidden', 'true')
    const leftText = document.createElement('span')
    leftText.classList.add('sr-only')
    leftText.textContent = 'Previous'
    leftControl.append(leftIcon)
    leftControl.append(leftText)
    const rightControl = document.createElement('a')
    rightControl.classList.add('right', 'carousel-control')
    rightControl.href = `#${id}`
    rightControl.setAttribute('role', 'button')
    rightControl.setAttribute('data-slide', 'next')
    const rightIcon = document.createElement('span')
    rightIcon.classList.add('glyphicon', 'glyphicon-chevron-right')
    rightIcon.setAttribute('aria-hidden', 'true')
    const rightText = document.createElement('span')
    rightText.classList.add('sr-only')
    rightText.textContent = 'Next'
    rightControl.append(rightIcon)
    rightControl.append(rightText)

    carousel.append(indicators)
    carousel.append(inner)
    carousel.append(leftControl)
    carousel.append(rightControl)

    return carousel
  }

  const addShortcutsEntry = (label: string, keyName: string) => {
    const entry = document.createElement('div')
    entry.style.justifyContent = 'start'
    entry.style.gap = '.8rem'
    entry.style.flexDirection = 'row'
    entry.style.alignItems = 'center'
    entry.style.display = 'flex'
    const term = document.createElement('dt')
    term.style.order = '2'
    term.style.justifyContent = 'start'
    term.style.gap = '.4rem'
    term.style.flexDirection = 'row'
    term.style.alignItems = 'center'
    term.style.display = 'flex'
    const key = document.createElement('div')
    key.style.alignItems = 'center'
    key.style.display = 'inline-flex'
    key.style.border = '1px solid #d9d9d9'
    key.style.borderRadius = '.4rem'
    key.style.justifyContent = 'center'
    key.style.minWidth = '2rem'
    key.style.minHeight = '2rem'
    key.style.padding = '0 .4rem'
    key.style.color = '#757575'
    key.style.fontSize = '1.2rem'
    key.style.lineHeight = '1.6rem'
    key.style.margin = '0'
    key.textContent = keyName
    const details = document.createElement('dd')
    details.style.order = '1'
    details.style.width = '28rem'
    details.style.flex = '0 0 auto'
    details.style.color = '#9e9e9e'
    details.style.fontSize = '1.4rem'
    details.style.lineHeight = '2rem'
    details.style.margin = '0'
    details.textContent = label
    term.append(key)
    entry.append(term)
    entry.append(details)
    return entry
  }

  const createBody = (entries: { label: string; keyName: string }[]) => {
    const body = document.createElement('div')
    body.style.overflowX = 'visible'
    body.style.overflowY = 'auto'
    body.style.padding = '0 2.4rem'

    const list = document.createElement('dl')
    list.style.margin = '0 0 2.4rem 0'
    list.style.justifyContent = 'start'
    list.style.gap = '.4rem'
    list.style.flexDirection = 'column'
    list.style.alignItems = 'stretch'
    list.style.display = 'flex'
    for (const entry of entries) {
      list.append(addShortcutsEntry(entry.label, entry.keyName))
    }
    body.append(list)
    return body
  }

  const createClose = () => {
    // <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    const close = document.createElement('button')
    close.type = 'button'
    close.setAttribute('aria-label', 'Close')
    close.style.position = 'absolute'
    close.style.top = '.4rem'
    close.style.right = '.4rem'
    close.style.padding = '11px'
    close.style.minWidth = '0'
    close.style.fontSize = '1.3rem'
    close.style.lineHeight = '1.6rem'
    close.style.color = '#757575'
    close.style.backgroundColor = 'transparent'
    close.style.alignItems = 'center'
    close.style.display = 'inline-flex'
    close.style.gap = '.8rem'
    close.style.justifyContent = 'center'
    close.style.fontFamily = 'inherit'
    close.style.fontWeight = '700'
    close.style.textDecoration = 'none'
    close.style.margin = '0'
    close.style.border = '1px solid transparent'
    close.style.borderRadius = '.4rem'
    close.style.cursor = 'pointer'
    close.style.textAlign = 'center'
    close.style.verticalAlign = 'top'
    close.style.letterSpacing = '0'
    close.style.boxShadow = 'none'
    close.style.outline = '0'
    close.style.transition = 'background-color .02s ease-in-out, border-color .02s ease-in-out, color .02s ease-in-out'
    close.onclick = () => {
      const modal = document.querySelector<HTMLDialogElement>('dialog.shortcuts-dialog')
      modal?.close()
    }
    const times = document.createElement('span')
    times.innerHTML = '&times;'
    times.style.width = '16px'
    times.style.height = '16px'
    times.style.alignItems = 'center'
    times.style.display = 'inline-flex'
    times.style.justifyContent = 'center'
    close.append(times)
    return close
  }

  const createHeader = (title: string) => {
    const header = document.createElement('div')
    header.style.padding = '2.4rem'

    const text = document.createElement('h2')
    text.id = 'keyboardShortcuts'
    text.style.paddingRight = '2.4rem'
    text.style.fontSize = '2rem'
    text.style.fontWeight = '700'
    text.style.lineHeight = '2.4rem'
    text.style.letterSpacing = '-0.8px'
    text.style.color = '#333333'
    text.style.margin = '0'
    text.style.textTransform = 'none'
    text.textContent = title
    header.append(text)
    return header
  }

  const createModal = (id: string, title: string, entries: { label: string; keyName: string }[]) => {
    const modal = document.createElement('dialog')
    modal.id = id
    modal.setAttribute('aria-labelledby', 'keyboardShortcuts')
    modal.classList.add('ShortcutsHelp')
    modal.append(createHeader(title))
    modal.append(createBody(entries))
    modal.append(createClose())
    return modal
  }

  export const createShortcutsModal = () => {
    const modal = createModal('shortcuts-dialog', 'Keyboard shortcuts', [
      {
        label: 'Keyboard shortcuts',
        keyName: '?',
      },
      {
        label: 'Next item',
        keyName: 'J',
      },
      {
        label: 'Previous item',
        keyName: 'K',
      },
      {
        label: 'Next page',
        keyName: 'N',
      },
      {
        label: 'Previous page',
        keyName: 'P',
      },
      {
        label: 'Next image',
        keyName: '→',
      },
      {
        label: 'Previous image',
        keyName: '←',
      },
      { label: 'Add to/Remove from Watchlist', keyName: 'W' },
    ])
    document.body.append(modal)
    document.addEventListener('keydown', event => {
      if (event.key === '?') {
        modal.open ? modal.close() : modal.showModal()
      }
      if (event.key === 'Escape' && modal.open) {
        modal.close()
      }
    })
  }

  const scrollPictures = (direction: 'right' | 'left') => {
    // find the focused entry
    let focusedEntry = document.querySelector<HTMLLIElement>('.lot-list .list-group li.list-group-item.focused')
    if (!focusedEntry) {
      // if nothing is focused yet, select the first item
      focusedEntry = document.querySelector<HTMLLIElement>('.lot-list .list-group li.list-group-item:nth-child(1)')
      if (!focusedEntry) {
        return
      }
      focusedEntry.classList.add('focused')
      // scroll the new item into view
      focusedEntry.scrollIntoView({ block: 'center' })
    }
    // get the correct button
    const link =
      direction === 'right'
        ? focusedEntry.querySelector<HTMLAnchorElement>('a.right')
        : focusedEntry.querySelector<HTMLAnchorElement>('a.left')
    link?.click()
  }

  const addToWatchlist = () => {
    // find the focused entry
    const focusedEntry = document.querySelector<HTMLLIElement>('.lot-list .list-group li.list-group-item.focused')
    if (!focusedEntry) {
      console.log('No focused entry to add to watchlist')
      return
    }
    // get the watchlist button
    const watchlistButton = focusedEntry.querySelector<HTMLAnchorElement>('a.item-watch-up, a.item-watch-dn')
    if (!watchlistButton) {
      console.log('Unable to find a watchlist button for the focused entry')
      return
    }
    watchlistButton.click()
  }

  const selectItem = (direction: 'next' | 'previous') => {
    // find the focused entry
    let focusedEntry = document.querySelector<HTMLLIElement>('.lot-list .list-group li.list-group-item.focused')
    if (!focusedEntry) {
      // if nothing is focused yet, select the first item and scroll to it
      focusedEntry = document.querySelector<HTMLLIElement>('.lot-list .list-group li.list-group-item:nth-child(1)')
      if (!focusedEntry) {
        return
      }
      focusedEntry.classList.add('focused')
      // scroll the new item into view
      focusedEntry.scrollIntoView({ block: 'center' })
      return
    }
    const selectedItem = direction === 'next' ? focusedEntry.nextElementSibling : focusedEntry.previousElementSibling
    if (!selectedItem) {
      // reached end of that direction, break
      return
    }
    // focus the selected element
    selectedItem.classList.add('focused')
    // unfocus the current element
    focusedEntry.classList.remove('focused')
    // scroll the new item into view
    selectedItem.scrollIntoView({ block: 'center' })
  }

  const modifyContainerRule = (rule: CSSStyleRule) => {
    rule.style.width = '100%'
    rule.style.paddingRight = '1.2rem'
    rule.style.paddingLeft = '1.2rem'
    rule.style.marginRight = 'auto'
    rule.style.marginLeft = 'auto'
  }

  const handleInnerRules = (innerRules: CSSRuleList, sheet: CSSStyleSheet, i: number, minRuleInserted: boolean) => {
    let isRuleInserted = minRuleInserted
    for (const innerRule of Array.from(innerRules)) {
      if (innerRule instanceof CSSStyleRule && innerRule.selectorText === '.container') {
        if (!isRuleInserted) {
          sheet.insertRule('@media (min-width: 576px) { .container { max-width:540px } }', i)
          isRuleInserted = true
        }
        innerRule.style.maxWidth = innerRule.style.width
        innerRule.style.removeProperty('width')
      }
    }
    return isRuleInserted
  }

  const addAdditionalStyles = (sheet: CSSStyleSheet) => {
    sheet.insertRule('@media (min-width: 1400px) { .container { max-width:1320px } }')
    sheet.insertRule(
      'dialog.ShortcutsHelp { width: 540px; border: 0; display: inline-flex; flex-direction: column; padding: 0; max-height: 80vh; max-width: 100%; outline: none; text-align: left; vertical-align: middle; background-color: #ffffff; border-radius: .8rem; box-shadow: 0px 2px 15px rgba(0, 0, 0, 0.15), 0px 2px 8px rgba(0, 0, 0, 0.08); min-width: 400px; position: relative;}',
    )
    sheet.insertRule(
      'li.list-group-item.focused { border-color: rgba(82, 168, 236, .8); outline: 0; box-shadow: 0 0 8px rgba(82, 168, 236, .6); margin: 0}',
    )
  }

  export const updateStyles = () => {
    let minRuleInserted = false
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        const rules = sheet.cssRules
        for (let i = 0; i < rules.length; i++) {
          const rule = rules[i]
          if (rule instanceof CSSStyleRule && rule.selectorText === '.container') {
            modifyContainerRule(rule)
          }
          if (rule instanceof CSSMediaRule) {
            minRuleInserted = handleInnerRules(rule.cssRules, sheet, i, minRuleInserted)
          }
        }
        if (minRuleInserted) {
          addAdditionalStyles(sheet)
        }
      } catch {
        console.log('Security error')
      }
    }
  }

  export const collectItems = () => {
    const lotList = document.querySelector('div.lot-list')
    if (!lotList) {
      console.warn('No lot list found')
      return
    }

    // remove unneeded items
    for (const item of Array.from(lotList.querySelectorAll('div small a')).filter(
      item => item.textContent === 'Click for Details and More Images',
    )) {
      item.parentElement?.parentElement?.remove()
    }

    // remove lot dividers
    for (const item of Array.from(lotList.querySelectorAll('.lot-divider + div'))) {
      item.remove()
    }
    for (const item of Array.from(lotList.querySelectorAll('.lot-divider'))) {
      item.remove()
    }
    // make the rows of divs into an list of items
    const allRows = lotList.querySelectorAll('hr ~ div')
    const unorderedList = document.createElement('ul')
    unorderedList.classList.add('list-group')
    let listItem: HTMLLIElement | null = null
    for (const row of allRows) {
      if (row.querySelector('h4[data-auction-title]')) {
        // This is the first row of a group
        // Create a new container
        listItem = document.createElement('li')
        listItem.classList.add('list-group-item')
      }
      if (listItem) {
        listItem.append(row)
      }
      if (row.querySelector('small.categories')) {
        // This is the last row of a group
        // Add to list
        if (listItem) {
          unorderedList.append(listItem)
        }
        listItem = null
      }
    }
    lotList.querySelector('hr')?.insertAdjacentElement('afterend', unorderedList)
  }

  const getDetails = async (href: string) => {
    let bidCount = ''
    let gallery: { image: string }[] = []
    return new Promise<{ bidCount: string; gallery: { image: string }[] }>((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: href,
        onload: response => {
          // get gallery datasource
          const datasource = RegExp(/dataSource: (\[\{.*\}\])/).exec(response.responseText)
          if (datasource) {
            const jsonDatasource = JSON.parse(datasource[1])
            // just keep the image
            gallery = jsonDatasource.map((obj: { image: string }) => ({
              image: obj.image,
            }))
          }

          // get bid count
          const bidCountMatch = RegExp(/lot_bid_history_count.*>(.*)<\/span>/).exec(response.responseText)
          if (bidCountMatch) {
            bidCount = bidCountMatch[1]
          }

          resolve({
            gallery: gallery,
            bidCount: bidCount,
          })
        },
        ontimeout: () => reject(new Error('Timeout')),
        onerror: error => reject(new Error(error.responseText)),
        onabort: () => reject(new Error('AbortError')),
      })
    })
  }

  export const additionalDetails = async () => {
    const allItems = document.querySelectorAll('.lot-list > ul > li')
    // Create an array of promises for each item
    const promises = Array.from(allItems).map(async listItem => {
      // get detail link
      const detailAnchor = listItem.querySelector('a')
      if (!detailAnchor) return // Skip if no anchor

      const detailLink = detailAnchor.href
      const detailsObj = await getDetails(detailLink)

      // get ID
      const id = listItem.querySelector('h4[id]')?.id
      // get image
      const img = listItem.querySelector('img')

      // replace img with carousel
      const carousel = createCarousel(
        `carousel-${id}`,
        detailsObj.gallery.map(obj => obj.image),
      )
      img?.replaceWith(carousel)

      // add # of bids to object
      const highBidder = Array.from(listItem.querySelectorAll('small')).filter(item => item.textContent?.includes('High Bidder'))[0]

      if (highBidder) {
        highBidder.innerHTML = highBidder.innerHTML.replace('High Bidder', `${detailsObj.bidCount} - High Bidder`)
      }
    })
    // Wait for all operations to complete
    await Promise.all(promises)
  }

  // If reaching a default auction listing page, sort by lot title and open items
  export const defaultSort = () => {
    // Check if we are on a default auction listing page (no query parameters)
    if (window.location.search === '' && window.location.hash === '' && window.location.pathname.includes('/auction/')) {
      window.location.href += '?page=1&item_status=open&lot_sort_field=title&search=Search'
    }
  }

  export const addListeners = () => {
    const allListeners = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        scrollPictures('right')
      }
      if (event.key === 'ArrowLeft') {
        scrollPictures('left')
      }
      if (event.key === 'j') {
        selectItem('next')
      }
      if (event.key === 'k') {
        selectItem('previous')
      }
      if (event.key === 'n') {
        const nextButton = document.querySelector<HTMLAnchorElement>('li.next > a')
        nextButton?.click()
      }
      if (event.key === 'p') {
        const prevButton = document.querySelector<HTMLAnchorElement>('li.previous > a')
        prevButton?.click()
      }
      if (event.key === 'w') {
        addToWatchlist()
      }
    }

    document.removeEventListener('keydown', allListeners)
    document.addEventListener('keydown', allListeners)
  }
}

EquipBidRestyle.defaultSort()
EquipBidRestyle.updateStyles()
EquipBidRestyle.createShortcutsModal()
EquipBidRestyle.collectItems()
EquipBidRestyle.additionalDetails()
EquipBidRestyle.addListeners()
