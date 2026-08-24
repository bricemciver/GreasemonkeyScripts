# Facebook Birthday Wisher

A userscript that writes a varied, relationship-appropriate birthday wish on the timeline
of each friend whose birthday is today

## What it does

Adds a review panel to Facebook's birthdays page listing everyone with a birthday today,
each with a message already drafted. You skim the drafts, adjust anything that does not
fit, and send. The script fills Facebook's own composer on each card and posts, pausing a
random interval between people.

The messages are the point. Rather than rotating a handful of fixed strings, each friend
is assigned a relationship tier that decides both which pool they draw from and which
emoji are allowed — a coworker never gets the party emoji. Templates support
`{first}`, `{full}`, `{emoji}` and `[either|or]` alternation, so a short pool yields a
lot of distinct wording. Every sent message is remembered, so nobody receives the same
one twice within a configurable number of years, and two friends who share a birthday
never get the same words on the same day.

Selection is deterministic — a hash of the friend, the year and a per-friend reroll
counter. Reloading the page re-renders the same drafts instead of reshuffling them, and
**Reroll** is how you ask for a different one.

## Features

- **Relationship tiers**: close, family, coworker, default — each with its own message
  pool and emoji set, assignable per friend from the panel
- **No repeats**: a template a friend has already received is off-limits for N years
  (default 3), falling back to the least recently used when a pool runs dry
- **Same-day variety**: a day's wishes exhaust the pool before any template repeats
- **Review before sending**: drafts are editable in the panel; uncheck anyone to skip
- **Dry run**: fills every composer and posts nothing, so a full run can be rehearsed
- **Skip list**: mark someone "Never wish" and they are passed over permanently
- **Double-post protection**: a confirmed send is recorded, so reloading cannot re-send
- **Human pacing**: randomised delay between posts, a daily cap, and an optional
  allowed-hours window
- **Auto mode**: opt-in, posts without review, still subject to every limit above
- **Persistent settings**: pools, tiers, history and limits live in userscript storage

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or
   [Greasemonkey](https://www.greasespot.net/)
2. Download the userscript from
   <https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/facebook-birthday-wisher.user.js>

## How to Use

1. **Go to the birthdays page**: <https://www.facebook.com/friends/birthdays/>
2. **Rehearse first**: the script ships in dry run. Click **Insert drafts** — each
   composer fills in and nothing is posted. Reload the page to clear the drafts.
3. **Set relationships**: use the tier dropdown beside each name. The draft updates
   immediately. **Reroll** draws a different message; **Never wish** adds a permanent skip.
4. **Write your own messages**: **Settings** holds one textarea per tier, one template
   per line. Use `{first}`, `{full}`, `{emoji}` and `[either|or]`.
5. **Go live**: turn off **Dry run** in settings. The button becomes **Send all** and the
   header badge turns red. Edit any draft in the panel before sending.
6. **Optional — auto mode**: set mode to "send automatically" with dry run off, and the
   run starts on its own whenever the birthdays page loads.

Settings are also reachable from the userscript manager's menu.

## Notes

Automating posts is against
[Meta's Terms of Service](https://www.facebook.com/terms), and auto-posting is the sort
of behaviour Meta
[restricts accounts](https://transparency.meta.com/enforcement/taking-action/restricting-accounts/)
for. The daily cap and the randomised delays exist to keep a run looking like a person
working through their list; the risk is still yours. Review mode and dry run are the
defaults for the same reason.

If the panel stops appearing, Facebook has changed its markup. The page contract this
script depends on is documented at the top of `userscript.ts`, along with the date it was
last verified — start there.
