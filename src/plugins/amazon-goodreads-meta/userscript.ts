const asinRegex = /^[A-Z0-9]{10}$/
const goodreadsRegex =
  /"aggregateRating":({"@type":"AggregateRating","ratingValue":.*?,"ratingCount":.*?,"reviewCount":.*?})/

// Marks an element as already enriched so repeated runs (e.g. from the
// MutationObserver) don't insert duplicate badges for the same book.
const PROCESSED_ATTR = 'data-goodreads-processed'

interface GoodreadsData {
  rating: string
  ratingCount: string
  reviewCount: string
  bookUrl: string
}

// Extract unique ASINs from the page. Handles both multi-book listing pages
// (e.g. /firstreads) and single product pages.
const extractASINs = (): string[] => {
  const asins = new Set<string>()

  // Multi-book listing: each book is a <bds-unified-book-faceout> custom element
  document.querySelectorAll<HTMLElement>('bds-unified-book-faceout').forEach((item) => {
    const asin = item.dataset.csaCItemId
    if (asin && asinRegex.test(asin)) {
      asins.add(asin)
    }
  })

  // Single product page metadata
  const asinMeta = document.querySelector<HTMLDivElement>('div[data-asin]')
  const single = asinMeta?.dataset.asin
  if (single && asinRegex.test(single)) {
    asins.add(single)
  }

  return Array.from(asins)
}

const fetchGoodreadsDataForASIN = (asin: string) => {
  return GM.xmlHttpRequest({
    method: 'GET',
    url: `https://www.goodreads.com/book/isbn/${asin}`,
  })
}

// Build the styled Goodreads badge element.
const buildBadge = (goodreadsData: GoodreadsData): HTMLDivElement => {
  const container = document.createElement('div')
  container.style.padding = '6px'
  container.style.margin = '5px 0'
  container.style.backgroundColor = '#f8f8f8'
  container.style.border = '1px solid #ddd'
  container.style.borderRadius = '3px'

  let content = `<div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 2px;">
          <span><img src="https://www.goodreads.com/favicon.ico" style="width: 16px; height: 16px; margin-right: 3px;" alt="Goodreads" />
          <a href="${goodreadsData.bookUrl}" target="_blank" rel="noopener" style="font-weight: bold;">Goodreads</a></span>`

  if (goodreadsData.rating) {
    content += `<span style="color: #000">${goodreadsData.rating} stars</span>`
  }

  if (goodreadsData.ratingCount) {
    content += `<span style="white-space: nowrap;">${goodreadsData.ratingCount} ratings</span>`
  }

  if (goodreadsData.reviewCount) {
    content += `<span style="white-space: nowrap;">${goodreadsData.reviewCount} reviews</span>`
  }

  content += '</div>'

  container.innerHTML = content
  return container
}

// Insert the Goodreads badge for a given ASIN.
const insertGoodreadsData = (asin: string, goodreadsData: GoodreadsData) => {
  // Multi-book listing: each book is a <bds-unified-book-faceout> custom element
  // that renders its contents (asynchronously) into a shadow root. Attach the
  // badge to the light-DOM host instead of reaching into the shadow DOM, so we
  // don't depend on the shadow structure or its render timing.
  const faceouts = document.querySelectorAll<HTMLElement>('bds-unified-book-faceout')
  for (const faceout of Array.from(faceouts)) {
    if (faceout.dataset.csaCItemId !== asin) {
      continue
    }
    if (faceout.parentElement?.querySelector(`:scope > [${PROCESSED_ATTR}="${asin}"]`)) {
      return
    }
    const badge = buildBadge(goodreadsData)
    badge.setAttribute(PROCESSED_ATTR, asin)
    faceout.insertAdjacentElement('afterend', badge)
    return
  }

  // Single product page: insert after the review summary block.
  const reviewElement = document.getElementById('reviewFeatureGroup')
  if (reviewElement && !document.querySelector(`[${PROCESSED_ATTR}="${asin}"]`)) {
    const badge = buildBadge(goodreadsData)
    badge.setAttribute(PROCESSED_ATTR, asin)
    reviewElement.parentNode?.insertBefore(badge, reviewElement.nextSibling)
  }
}

const processedAsins = new Set<string>()

const processAsins = async (asins: string[]) => {
  for (const asin of asins) {
    if (processedAsins.has(asin)) {
      continue
    }
    processedAsins.add(asin)
    try {
      const goodreadsData = await fetchGoodreadsDataForASIN(asin)
      const url = goodreadsData.finalUrl
      const aggregateMatch = goodreadsRegex.exec(goodreadsData.responseText)
      if (aggregateMatch && aggregateMatch.length > 1) {
        const aggregateData = JSON.parse(aggregateMatch[1])
        const aggregateGoodreadsData: GoodreadsData = {
          rating: aggregateData.ratingValue,
          ratingCount: aggregateData.ratingCount,
          reviewCount: aggregateData.reviewCount,
          bookUrl: url,
        }
        insertGoodreadsData(asin, aggregateGoodreadsData)
      }
    } catch (error) {
      // Allow a later run to retry this ASIN if the request failed.
      processedAsins.delete(asin)
      console.error('Error fetching Goodreads data:', error)
    }
  }
}

// Main entry point. Runs once now and again whenever new books render in, since
// the book faceouts on listing pages can be added/hydrated after page load.
const init = () => {
  const run = () => {
    const asins = extractASINs()
    if (asins.length > 0) {
      processAsins(asins).catch((error) => console.error('Error in Goodreads script:', error))
    }
  }

  run()

  const observer = new MutationObserver(() => run())
  observer.observe(document.body, { childList: true, subtree: true })
}

init()
