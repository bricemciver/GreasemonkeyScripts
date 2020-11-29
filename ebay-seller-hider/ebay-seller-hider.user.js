// ==UserScript==
// @name eBay Seller Hider
// @description Hide items from low/poor feedback eBay sellers and sponsored items
// @version 0.0.4
// @match *://*.ebay.com/*
// @author bricem
// @namespace bricem.scripts
// @license MIT
// ==/UserScript==

'use strict'

let filterReviews = true
let reviewMin = 10
let filterFeedback = true
let feedbackMin = 95.0
let hideSponsored = true

const hideItem = (seller) => {
    let [,reviews, feedback] = seller.innerText && seller.innerText.match(/\((.*)\) (.*)%/)
    reviews = reviews.replace(',', '')
    reviews = parseInt(reviews, 10)
    feedback = parseFloat(feedback)
    let parent = seller.parentNode
    while (parent.tagName !== 'LI') {
        parent = parent.parentNode
    }
    parent.style.display = ((filterReviews && reviews < reviewMin) || (filterFeedback && feedback < feedbackMin)) ? 'none' : 'list-item'
}

const createHeader = () => {
    const header = document.createElement('div')
    const headerTitle = document.createElement('h3')
    headerTitle.className = 'x-refine__item'
    headerTitle.textContent = 'Sellers'
    header.append(headerTitle)
    return header
}

const createListItem = (text, valueName, value) => {
    const listItem = document.createElement('li')
    listItem.className = 'x-refine__main__list--value'
    const selectItem = document.createElement('div')
    selectItem.className = 'x-refine__multi-select'
    const checkbox = document.createElement('input')
    checkbox.setAttribute('type', 'checkbox')
    checkbox.setAttribute('aria-label', text)
    checkbox.className = 'cbx x-refine__multi-select-checkbox'
    checkbox.setAttribute('autocomplete', 'off')
    checkbox.setAttribute('aria-hidden', 'true')
    checkbox.setAttribute('tab-index', '-1')
    checkbox.setAttribute('role', 'presentation')
    if ((valueName === 'reviewMin' && filterReviews) ||
        (valueName === 'feedbackMin' && filterFeedback) ||
        (valueName === 'hideSponsored' && hideSponsored)) {
        checkbox.setAttribute('checked', true)
    }
    checkbox.addEventListener('input', () => {
        if (valueName === 'reviewMin') {
            localStorage.setItem('filterReviews', checkbox.checked)
            updateFilter()
        }
        if (valueName === 'feedbackMin') {
            localStorage.setItem('filterFeedback', checkbox.checked)
            updateFilter()
        }
        if (valueName === 'hideSponsored') {
            localStorage.setItem('hideSponsored', checkbox.checked)
            filterSponsored()
        }
    })
    const checkboxText = document.createElement('span')
    checkboxText.className = 'cbx x-refine__multi-select-cbx'
    checkboxText.innerText = text
    if (value) {
      const input = document.createElement('input')
      input.setAttribute('type', 'text')
      input.setAttribute('pattern', '\d*')
      input.setAttribute('value', value)
      input.addEventListener('change', (evt) => {
          localStorage.setItem(valueName, evt.target.value)
          updateFilter()
      })
      input.setAttribute('style', 'height: 22px; width: 50px; margin: -3px 0 0 8px; padding: 3px; float:right; font-size: 11px')
      checkboxText.append(input)
    }
    selectItem.append(checkbox)
    selectItem.append(checkboxText)
    listItem.append(selectItem)
    return listItem
}

const createGroup = () => {
    const group = document.createElement('div')
    group.className = 'x-refine__group'
    const listHeader = document.createElement('ul')
    listHeader.className = 'x-refine__main__value'
    listHeader.style = 'clear:both'
    listHeader.append(createListItem('# of Reviews over ', 'reviewMin', reviewMin))
    listHeader.append(createListItem('Feedback over ', 'feedbackMin', feedbackMin))
    listHeader.append(createListItem('Hide sponsored', 'hideSponsored', false))
    group.append(listHeader)
    return group
}

const getPresets = () => {
    filterReviews = localStorage.getItem('filterReviews') === 'false' ? false : true
    reviewMin = localStorage.getItem('reviewMin')
    reviewMin = parseInt(reviewMin, 10) || 10
    filterFeedback = localStorage.getItem('filterFeedback') === 'false' ? false : true
    feedbackMin = localStorage.getItem('feedbackMin')
    feedbackMin = parseFloat(feedbackMin) || 95.0
    hideSponsored = localStorage.getItem('hideSponsored') === 'false' ? false : true
}

const addFilter = () => {
    const menu = document.querySelector('.x-refine__left__nav')
    if (menu) {
      const list = document.createElement('li')
      list.className = 'x-refine__main__list'
      list.append(createHeader())
      list.append(createGroup())
      menu.prepend(list)
    }
}

const updateFilter = () => {
    getPresets()
    var sellers = document.querySelectorAll('span.s-item__seller-info-text')
    sellers.forEach((seller) => {
        hideItem(seller)
    })
}

const filterSponsored = () => {
    getPresets()
    var sellers = document.querySelectorAll('div.s-item__title--tagblock > span[role="text"]')
    sellers.forEach((seller) => {
        // look at children to determine text
        const labels = {}
        for (let i = 0; i < seller.children.length; i++) {
            const node = seller.children[i]
            // group by class
            if (!labels[node.className]) {
                labels[node.className] = ''
            }
            labels[node.className] += node.innerText
        }
        if (Object.values(labels).some((label) => label.startsWith('SPONSORED'))) {
            let parent = seller.parentNode
            while (parent.tagName !== 'LI') {
               parent = parent.parentNode
            }
            parent.style.display = hideSponsored ? 'none' : 'list-item'
        }
    })
}

getPresets()
addFilter()
updateFilter()
filterSponsored()
