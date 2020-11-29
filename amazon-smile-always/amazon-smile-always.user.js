// ==UserScript==
// @name         Amazon Smile Always
// @namespace    bricem.scripts
// @version      0.0.1
// @description  Smile Always implementation as a user script. Based on https://github.com/Jdhaimson/smilealways
// @author       bricem, Josh Haimson, and Dan Elitzer
// @match        http://www.amazon.com/*
// @match        https://www.amazon.com/*
// @match        http://www.amazon.de/*
// @match        https://www.amazon.de/*
// @match        http://www.amazon.co.uk/*
// @match        https://www.amazon.co.uk/*
// @license      GPL2
// @grant        none
// @run-at       document-start
// ==/UserScript==

const getRelativeRedirectUrl = (amazonurl, url) => {
  const relativeUrl = url.split(amazonurl)[1];
  const noRedirectIndicator = "sa-no-redirect=1";
  const paramStart = "?";
  const paramStartRegex = "\\" + paramStart;
  let newurl = null;

  // check to see if there are already GET variables in the url
  if (relativeUrl.match(paramStartRegex) != null) {
    newurl = `${relativeUrl}&${noRedirectIndicator}`;
  } else {
    newurl = relativeUrl + paramStart + noRedirectIndicator;
  }
  return newurl;
};

const redirectToSmile = (scheme, amazonurl, url, country) => {
  let smileurl = "smile.amazon.com";
  if (country === "de") {
    smileurl = "smile.amazon.de";
  } else if (country === "uk") {
    smileurl = "smile.amazon.co.uk";
  }
  // redirect to amazon smile append the rest of the url
  return scheme + smileurl + getRelativeRedirectUrl(amazonurl, url);
};

const detectRedirect = () => {
  const url = window.location.href;
  const domain = window.location.hostname;
  let amazonurl = "www.amazon.com";
  let country = "com";
  if (domain.includes("amazon.de")) {
    amazonurl = "www.amazon.de";
    country = "de";
  } else if (domain.includes("amazon.co.uk")) {
    amazonurl = "www.amazon.co.uk";
    country = "uk";
  }

  const https = "https://";
  // ignore links with these strings in them
  const filterArray = [
    "(sa-no-redirect=)",
    "(redirect=true)",
    "(redirect.html)",
    "(r.html)",
    "(f.html)",
    "(/dmusic/cloudplayer)",
    "(/photos)",
    "(/wishlist)",
    "(/clouddrive)",
    "(/ap/)",
    "(aws.amazon.)",
    "(read.amazon.)",
    "(login.amazon.)",
    "(payments.amazon.)",
    "(http://)", //all Amazon pages now redirect to HTTPS, also fixes conflict with HTTPS Everywhere extension
  ];
  const filter = filterArray.join("|");

  // Don't try and redirect pages that are in our filter
  if (url.match(filter) !== null) {
    return;
  }

  window.location.href = redirectToSmile(https, amazonurl, url, country);
};

detectRedirect();
