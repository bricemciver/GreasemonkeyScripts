// ==UserScript==
// @name         WME Drive End Times
// @namespace    bricemciver
// @description  Add end times to the list of archived drives in the Waze Map Editor.
// @licnse       MIT
// @version      0.1
// @match        https://www.waze.com/editor/
// @grant        none
// @run-at       document-idle
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
// (function () {
//   'use strict';
//   // find the function in the Waze javascript and replace
//   if (window.JST['templates/archive-sessions']) {
//     window.JST['templates/archive-sessions'] = function (e) {
//       return function () {
//         var e, t, i, n, s, r, o;
//         t = window.HAML.escape;
//         e = window.HAML.cleanValue;
//         i = [];
//         if (this.sessions.isEmpty()) {
//           i.push("<p class='message'>\n  <strong>");
//           i.push('    ' + t(e(this.t('user.drives.no_drives'))));
//           i.push("  </strong>\n</p>\n<p class='message'>");
//           i.push('  ' + t(e(this.t('user.drives.no_drives_explanation'))));
//           i.push('</p>');
//         } else {
//           i.push("<p class='message'>");
//           i.push('  ' + t(e(this.t('user.drives.subtitle') + ':')));
//           i.push("</p>\n<ul class='result-list'>");
//           r = this.sessions;
//           for (n = 0, s = r.length; s > n; n++) {
//             o = r[n];
//             i.push(
//               "  <li class='" +
//                 ['result', 'session', '' + t(e(o.hasFullSession ? 'session-available' : void 0))]
//                   .sort()
//                   .join(' ')
//                   .replace(/^\s+|\s+$/g, '') +
//                 "' data-id='" +
//                 t(e(o.id)) +
//                 "'>\n"
//             );
//             i.push(
//               "    <p class='title'>" +
//                 t(e(this.h.dateString(o.startTime))) +
//                 ' - ' +
//                 new Date(o.endTime).toLocaleTimeString('en-us', {
//                   hour: '2-digit',
//                   minute: '2-digit',
//                   hour12: false,
//                 }) +
//                 '</p>\n'
//             );
//             i.push("    <p class='additional-info clearfix'>\n");
//             i.push('      <span>' + t(e(this.h.lengthString(o.totalRoadMeters))) + '</span>\n');
//             i.push('      <span>' + t(e(this.h.durationString(o.startTime, o.endTime))) + '</span>\n');
//             i.push('    </p>\n');
//             i.push('  </li>');
//           }
//           i.push('</ul>');
//         }
//         return i
//           .join('\n')
//           .replace(/\s([\w-]+)='\x93true'/gm, ' $1')
//           .replace(/\s([\w-]+)='\x93false'/gm, '')
//           .replace(/\s(?:id|class)=(['"])(\1)/gm, '');
//       }.call(window.HAML.context(e));
//     };
//   }
// })();
//# sourceMappingURL=WME%20Drive%20End%20Times.user.js.map