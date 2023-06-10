// ==UserScript==
// @name          Google Mail - Default to All Mail
// @namespace     bricemciver
// @description   Redirects your initial Google Mail view to All Mail
// @license       MIT
// @version       0.0.1
// @match         *://mail.google.tld/*
// ==/UserScript==
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
// if new tab or user is navigating to GMail, default to All Mail
// if (!document.referrer) {
//   window.location.hash = "#all";
// }
//# sourceMappingURL=google-mail-default-to-all-mail.user.js.map