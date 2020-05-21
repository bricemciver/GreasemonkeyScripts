// ==UserScript==
// @name eBay Seller Hider
// @description Hide items from low/poor feedback eBay sellers and sponsored items
// @version 0.0.1
// @match *://*.ebay.com/*
// @author bricem
// @namespace bricem.scripts
// @license MIT
// ==/UserScript==

'use strict'

let filterReviews = true
let reviewMin = 10
let filterFeedback = true
let feedbackMin = 95
let hideSponsored = true

const hideItem = (seller) => {
    let [,reviews, feedback] = seller.innerText && seller.innerText.match(/\((.*)\) (.*)%/)
    reviews = parseInt(reviews, 10)
    feedback = parseInt(feedback, 10)
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

const createCheckboxSvg = () => {
    const checkboxSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    checkboxSvg.setAttribute('class', 'x-refine-svg-icon')
    checkboxSvg.setAttribute('aria-hidden', 'true')
    checkboxSvg.setAttribute('focusable', 'false')
    const selected = document.createElementNS('http://www.w3.org/2000/svg', 'use')
    selected.setAttribute('class', 'x-refine-svg-icon--selected')
    selected.setAttribute('href', '#svg-icon-checkbox--checked')
    const unselected = document.createElementNS('http://www.w3.org/2000/svg', 'use')
    unselected.setAttribute('class', 'x-refine-svg-icon--unselected')
    unselected.setAttribute('href', '#svg-icon-checkbox--unchecked')
    checkboxSvg.append(selected)
    checkboxSvg.append(unselected)
    return checkboxSvg
}

const createListItem = (text, valueName, value) => {
    const listItem = document.createElement('li')
    listItem.className = 'x-refine__main__list--value'
    const selectItem = document.createElement('div')
    selectItem.className = 'x-refine__multi-select'
    const selectSvg = document.createElement('div')
    selectSvg.className = 'x-refine__select__svg'
    const checkbox = document.createElement('input')
    checkbox.setAttribute('type', 'checkbox')
    checkbox.className = 'cbx x-refine__multi-select-checkbox'
    checkbox.setAttribute('aria-label', text)
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
    const checkboxTextDiv = document.createElement('div')
    const checkboxText = document.createElement('span')
    checkboxText.className = 'cbx x-refine__multi-select-cbx'
    checkboxText.innerText = text
    checkboxTextDiv.append(checkboxText)
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
      checkboxTextDiv.append(input)
    }
    selectSvg.append(checkbox)
    selectSvg.append(createCheckboxSvg())
    selectSvg.append(checkboxTextDiv)
    selectItem.append(selectSvg)
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
    feedbackMin = parseInt(feedbackMin, 10) || 95
    hideSponsored = localStorage.getItem('hideSponsored') === 'false' ? false : true
}

const addFilter = () => {
    const menu = document.querySelector('ul.x-refine__left__nav')
    const list = document.createElement('li')
    list.className = 'x-refine__main__list'
    list.append(createHeader())
    list.append(createGroup())
    menu.prepend(list)
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
    var sellers = document.querySelectorAll('div.s-item__title--tagblock')
    sellers.forEach((seller) => {
       let parent = seller.parentNode
       while (parent.tagName !== 'LI') {
         parent = parent.parentNode
       }
       parent.style.display = hideSponsored ? 'none' : 'list-item'
    })
}

getPresets()
addFilter()
updateFilter()
filterSponsored()
