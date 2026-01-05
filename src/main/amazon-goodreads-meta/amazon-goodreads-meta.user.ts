namespace AmazonGoodreadsMeta {
  const asinRegex = /^[A-Z0-9]{10}$/;
  const goodreadsRegex =
    /"aggregateRating":({"@type":"AggregateRating","ratingValue":.*?,"ratingCount":.*?,"reviewCount":.*?})/;

  interface GoodreadsData {
    rating: string;
    ratingCount: string;
    reviewCount: string;
    bookUrl: string;
  }

  // Extract ASIN from Amazon URL or page
  const extractASINs = () => {
    const asins: string[] = [];
    // Check if a multi-book page
    const books = document.querySelectorAll<HTMLElement>(
      "bds-unified-book-faceout",
    );
    for (const item of Array.from(books)) {
      const asin = item.dataset.csaCItemId;
      if (asin && asinRegex.test(asin)) {
        asins.push(asin);
      }
    }

    // Try to extract from page meta data
    const asinMeta = document.querySelector<HTMLDivElement>("div[data-asin]");
    if (asinMeta) {
      const asin = asinMeta.dataset.asin;
      if (asin && asinRegex.test(asin)) {
        asins.push(asin);
      }
    }

    return asins;
  };

  const fetchGoodreadsDataForASIN = (asin: string) => {
    return GM.xmlHttpRequest({
      method: "GET",
      url: `https://www.goodreads.com/book/isbn/${asin}`,
    });
  };

  // Insert Goodreads data into the Amazon page
  const insertGoodreadsData = (asin: string, goodreadsData: GoodreadsData) => {
    // Create a styled container for Goodreads data
    const container = document.createElement("div");
    container.style.padding = "6px";
    container.style.margin = "5px 0";
    container.style.backgroundColor = "#f8f8f8";
    container.style.border = "1px solid #ddd";
    container.style.borderRadius = "3px";

    // Create content
    let content = `<div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 2px;">
          <span><img src="https://www.goodreads.com/favicon.ico" style="width: 16px; height: 16px; margin-right: 3px;" alt="Goodreads" />
          <a href="${goodreadsData.bookUrl}" target="_blank" style="font-weight: bold;">Goodreads</a></span>`;

    if (goodreadsData.rating) {
      content += `<span style="color: #000">${goodreadsData.rating} stars</span>`;
    }

    if (goodreadsData.ratingCount) {
      content += `<span style="white-space: nowrap;">${goodreadsData.ratingCount} ratings</span>`;
    }

    if (goodreadsData.reviewCount) {
      content += `<span style="white-space: nowrap;">${goodreadsData.reviewCount} reviews</span>`;
    }

    content += "</div>";

    container.innerHTML = content;

    // Find insertion point on Amazon page
    // Check if the page is a multi-book page
    const currentBooks = document.querySelectorAll<HTMLElement>("bds-unified-book-faceout");
    for (const book of Array.from(currentBooks)) {
      // Book info is in the shadow root, so we need to access it
      const bookInfoDiv = book.shadowRoot?.querySelector<HTMLDivElement>(
        "div[data-csa-c-item-id]",
      );
      if (bookInfoDiv) {
        const bookAsin = bookInfoDiv.dataset.csaCItemId;
        if (bookAsin && bookAsin === asin) {
          // insert as a multi-book
          const ratings = book.shadowRoot?.querySelector("div.star-rating");
          if (ratings) {
            ratings.parentNode?.insertBefore(container, ratings.nextSibling);
            break;
          }
        }
      }
    }
    // insert as a single book
    const reviewElement = document.getElementById("reviewFeatureGroup");
    if (reviewElement) {
      reviewElement.parentNode?.insertBefore(
        container,
        reviewElement.nextSibling,
      );
    }
  };

  const processAsins = async (asins: string[]) => {
    for (const asin of asins) {
      try {
        const goodreadsData = await fetchGoodreadsDataForASIN(asin);
        const url = goodreadsData.finalUrl;
        const aggregateMatch = goodreadsRegex.exec(goodreadsData.responseText);
        if (aggregateMatch && aggregateMatch.length > 1) {
          const aggregateData = JSON.parse(aggregateMatch[1]);
          const aggregateGoodreadsData: GoodreadsData = {
            rating: aggregateData.ratingValue,
            ratingCount: aggregateData.ratingCount,
            reviewCount: aggregateData.reviewCount,
            bookUrl: url,
          };
          insertGoodreadsData(asin, aggregateGoodreadsData);
        }
      } catch (error) {
        console.error("Error fetching Goodreads data:", error);
      }
    }
  };

  // Main function to initialize the script
  export const init = async () => {
    const asins = extractASINs();
    if (!asins || asins.length === 0) {
      return;
    }

    try {
      await processAsins(asins);
    } catch (error) {
      console.error("Error in Goodreads script:", error);
    }
  };
}

AmazonGoodreadsMeta.init();
