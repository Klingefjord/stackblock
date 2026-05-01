# stackblock

A small Chrome / Arc extension that hides the noisy parts of
[substack.com/home](https://substack.com/home):

- The main **Notes feed** (the big middle column of post / note cards)
- The right-sidebar recommendation widgets (**Up next**, **New Bestsellers**, etc.)

The left navigation and the **Search Substack** input stay visible.
Toggle the blocker on or off from the extension popup.

## Install (Arc / Chrome / any Chromium browser)

1. Clone or download this repo.
2. Open `chrome://extensions` (in Arc: `arc://extensions`).
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select this folder.
5. Pin the extension to the toolbar if you'd like easy access to the toggle.

## How it works

It's a CSS-only hider gated by an `html.stackblock-on` class. A tiny
content script reads `chrome.storage.sync` and toggles the class; the
popup writes to that same key.

The two CSS rules that do the work (see `content.css`):

```css
/* Hide the Notes feed */
[role="region"][aria-label="Notes feed"] { display: none !important; }

/* Hide every right-sidebar card except the one with the search input */
.reader2-inbox-sidebar > *:not(:has(input[aria-label="Global search"])) {
  display: none !important;
}
```

Both selectors anchor on stable, semantic markup (ARIA labels and one
non-hashed Substack class). The `pencraft` hash-suffixed classes that
Substack ships are deliberately avoided — they change between deploys.

## Scope

The extension only runs on `substack.com` (the reader app). It does not
run on individual newsletter sites at `<pub>.substack.com` or on custom
domains.
