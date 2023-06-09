// ==UserScript==
// @name          Google Mail - Default to All Mail
// @description   Redirects your initial Google Mail view to All Mail
// @version       0.0.1
// @include       *://mail.google.tld/*
// @license       MIT
// @author        Brice McIver
// ==/UserScript==

// if new tab or user is navigating to GMail, default to All Mail
if (!document.referrer) {
  window.location.hash = "#all";
}
