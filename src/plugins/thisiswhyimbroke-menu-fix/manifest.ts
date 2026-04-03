import type { MonkeyUserScript } from "vite-plugin-monkey";
export function manifest(): MonkeyUserScript {
  return {
    name: "ThisIsWhyImBroke Menu Fix",
    namespace: "https://github.com/bricemciver/GreasemonkeyScripts",
    version: "1.0.0",
    license: "MIT",
    description:
      'Makes the long "Gifts by Recipient / Occasion / Category" nav dropdowns scrollable',
    match: "https://www.thisiswhyimbroke.com/*",
    icon: "https://icons.duckduckgo.com/ip3/thisiswhyimbroke.com.ico",
    grant: ["GM_addStyle"],
    supportURL: "https://github.com/bricemciver/GreasemonkeyScripts/issues",
    "run-at": "document-end",
  };
}
