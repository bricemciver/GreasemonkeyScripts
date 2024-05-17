"use strict";
(() => {
  // src/main/breeze-sidebar-autosize/breeze-sidebar-autosize.user.ts
  var replaceCss = () => {
    const head = document.getElementsByTagName("head")[0];
    const style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.textContent = "@media (min-width: 992px) { .mainsail-ui .mainsail-side-nav.extra-wide { flex-basis: fit-content; max-width: fit-content; }}";
    head.appendChild(style);
  };
  replaceCss();
})();
//# sourceMappingURL=breeze-sidebar-autosize.user.js.map
