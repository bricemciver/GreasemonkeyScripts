namespace AncestryPremiumContentBlocker {
  const CACHE_NAME = "ancestry-link-cache";
  const CACHE_DURATION = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
  const SIGNUP_INDICATORS = [
    "/account/signin",
    "/secure/login",
    "subscribe",
    "membership",
    "cs/offers",
  ];

  interface CachedResponse {
    url: string;
    isSignupPage: boolean;
    timestamp: number;
  }

  // Check if a URL points to a signup page
  const isSignupPage = (url: string, content: string): boolean => {
    return SIGNUP_INDICATORS.some(
      (indicator) =>
        url.toLowerCase().includes(indicator) ||
        content.toLowerCase().includes(indicator),
    );
  };

  // Get cached result for a URL
  const getCachedResult = async (
    url: string,
  ): Promise<CachedResponse | null> => {
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(url);

      if (!response) {
        return null;
      }

      const data: CachedResponse = await response.json();

      // Check if cache is expired
      if (Date.now() - data.timestamp > CACHE_DURATION) {
        await cache.delete(url);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Error reading cache:", e);
      return null;
    }
  };

  // Save result to cache
  const cacheResult = async (url: string, isSignup: boolean): Promise<void> => {
    try {
      const cache = await caches.open(CACHE_NAME);
      const data: CachedResponse = {
        url,
        isSignupPage: isSignup,
        timestamp: Date.now(),
      };

      const response = new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
      await cache.put(url, response);
    } catch (e) {
      console.error("Error writing to cache:", e);
    }
  };

  // Preload and check a single link
  const checkLink = async (link: HTMLAnchorElement): Promise<void> => {
    const url = link.href;

    // Skip non-HTTP links and external links
    if (!url.startsWith("http") || !url.includes("ancestry.com")) {
      return;
    }

    // Check cache first
    const cached = await getCachedResult(url);
    if (cached) {
      if (cached.isSignupPage) {
        disableLink(link);
      }
      return;
    }

    // Fetch the URL
    try {
      const response = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        credentials: "include",
      });

      const finalUrl = response.url;
      const isSignup = isSignupPage(finalUrl, "");

      // If HEAD request shows signup, verify with GET for content check
      if (!isSignup && response.ok) {
        const fullResponse = await fetch(url, {
          redirect: "follow",
          credentials: "include",
        });
        const text = await fullResponse.text();
        const isSignupContent = isSignupPage(fullResponse.url, text);
        await cacheResult(url, isSignupContent);
        if (isSignupContent) {
          disableLink(link);
        }
      } else {
        await cacheResult(url, isSignup);

        if (isSignup) {
          disableLink(link);
        }
      }
    } catch (e) {
      console.error(`Error checking link ${url}:`, e);
    }
  };

  // Disable a link visually and functionally
  const disableLink = (link: HTMLAnchorElement): void => {
    link.style.opacity = "0.5";
    link.style.cursor = "not-allowed";
    link.style.textDecoration = "line-through";
    link.style.pointerEvents = "none";
    link.title = "This link requires a subscription";

    // Prevent all click events
    link.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
      true,
    );

    // Add a visual indicator
    if (!link.querySelector(".signup-indicator")) {
      const indicator = document.createElement("span");
      indicator.className = "signup-indicator";
      indicator.textContent = " 🔒";
      indicator.style.fontSize = "0.8em";
      link.appendChild(indicator);
    }
  };

  // Process all links on the page
  const processLinks = async (): Promise<void> => {
    const links = document.querySelectorAll<HTMLAnchorElement>("a[href]");
    console.log(`Processing ${links.length} links on page`);

    // Process links with rate limiting to avoid overwhelming the server
    const batchSize = 5;
    for (let i = 0; i < links.length; i += batchSize) {
      const batch = Array.from(links).slice(i, i + batchSize);
      await Promise.all(batch.map((link) => checkLink(link)));

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    console.log("Finished processing links");
  };

  const processNode = (node: Node): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;

      // Check if the node itself is a link
      if (element.tagName === "A") {
            checkLink(element as HTMLAnchorElement);
          }
          // Check for links within the node
          const links = element.querySelectorAll("a[href]");
          for (const link of links) {
            checkLink(link as HTMLAnchorElement);
          }
    }
  };

  // Observer for dynamically added links
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        processNode(node);
      }
    }
  });

  // Initialize
  export const init = async (): Promise<void> => {
    console.log("Ancestry Link Checker initialized");

    // Process existing links
    await processLinks();

    // Watch for new links
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };
}
AncestryPremiumContentBlocker.init();
