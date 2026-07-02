const asinRegex = /^[A-Z0-9]{10}$/
const goodreadsRegex =
  /"aggregateRating":({"@type":"AggregateRating","ratingValue":.*?,"ratingCount":.*?,"reviewCount":.*?})/

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
  for (const faceout of faceouts) {
    if (faceout.dataset.csaCItemId !== asin) {
      continue
    }
    const wrapper = faceout.parentElement
    if (!wrapper) {
      continue
    }
    const badge = buildBadge(goodreadsData)

    // Cards in a row (carousels, shelves) have differently-sized text blocks, so
    // a badge placed directly after the faceout ends up at a ragged height. When
    // the faceout sits in its own per-card wrapper, lay that wrapper out as a
    // full-height column and let the badge take the leftover space, so every
    // badge bottom-aligns across the row. Skip this when the wrapper holds more
    // than one faceout (i.e. it's the shared row container, not a single card).
    const isSingleCardWrapper = wrapper.querySelectorAll('bds-unified-book-faceout').length === 1
    if (isSingleCardWrapper) {
      wrapper.style.display = 'flex'
      wrapper.style.flexDirection = 'column'
      wrapper.style.height = '100%'
      badge.style.marginTop = 'auto'
    }

    faceout.insertAdjacentElement('afterend', badge)
    return
  }

  // Single product page: insert after the review summary block.
  const reviewElement = document.getElementById('reviewFeatureGroup')
  if (reviewElement) {
    reviewElement.parentNode?.insertBefore(buildBadge(goodreadsData), reviewElement.nextSibling)
  }
}

// ASINs we've handled (in flight, succeeded, or given up on) so the observer
// doesn't refetch them, and a count of transport failures per ASIN so a
// persistently-failing request isn't retried forever on every DOM mutation.
const processedAsins = new Set<string>()
const failedAttempts = new Map<string, number>()
const MAX_ATTEMPTS = 3

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
      // Allow a later run to retry this ASIN, but only up to MAX_ATTEMPTS so a
      // persistent failure doesn't flood Goodreads on every DOM mutation.
      const attempts = (failedAttempts.get(asin) ?? 0) + 1
      failedAttempts.set(asin, attempts)
      if (attempts < MAX_ATTEMPTS) {
        processedAsins.delete(asin)
      }
      console.error(`Error fetching Goodreads data (attempt ${attempts}/${MAX_ATTEMPTS}):`, error)
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

  // Coalesce the bursts of mutations Amazon pages emit (lazy images, carousels,
  // countdown widgets) into a single deferred run so we don't rescan the whole
  // document on every individual mutation.
  let scheduled = 0
  const observer = new MutationObserver(() => {
    if (scheduled) {
      return
    }
    scheduled = window.setTimeout(() => {
      scheduled = 0
      run()
    }, 500)
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

init()
