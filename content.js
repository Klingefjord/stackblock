(() => {
  "use strict";

  const STORAGE_KEY = "stackblockEnabled";
  const CLASS = "stackblock-on";
  const X_HOME_CLASS = "stackblock-x-home";

  // Twitter feed is blocked at all times EXCEPT during lunch (12:00–12:59
  // local time), so you get to scroll on your break.
  const LUNCH_START_HOUR = 12; // inclusive
  const LUNCH_END_HOUR = 13; // exclusive

  const host = location.hostname;
  const isTwitter = /(^|\.)(twitter|x)\.com$/.test(host);

  function isLunchTime() {
    const h = new Date().getHours();
    return h >= LUNCH_START_HOUR && h < LUNCH_END_HOUR;
  }

  let userEnabled = true;

  function isXHome() {
    // Home feed lives at /home (and the bare root before it redirects).
    const p = location.pathname;
    return p === "/home" || p === "/";
  }

  // The home timeline has two tabs, "For you" and "Following". Switching
  // between them does NOT change the URL, so we read the currently-selected
  // tab from the DOM. We only block when "Following" is the active tab.
  function isFollowingTab() {
    const tabs = document.querySelectorAll('[role="tablist"] [role="tab"]');
    for (const tab of tabs) {
      if (tab.getAttribute("aria-selected") === "true") {
        return /following/i.test(tab.textContent || "");
      }
    }
    // Tab bar not found yet (still loading) — don't block until we're sure.
    return false;
  }

  function apply() {
    let on = userEnabled;
    // On Twitter/X the block additionally pauses during lunch.
    if (on && isTwitter && isLunchTime()) {
      on = false;
    }
    document.documentElement.classList.toggle(CLASS, on);
    if (isTwitter) {
      // Only on the /home route AND only while the Following tab is active.
      const blockX = isXHome() && isFollowingTab();
      document.documentElement.classList.toggle(X_HOME_CLASS, blockX);
    }
  }

  chrome.storage.sync.get([STORAGE_KEY], (res) => {
    userEnabled = res[STORAGE_KEY] === undefined ? true : res[STORAGE_KEY] !== false;
    apply();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes[STORAGE_KEY]) {
      userEnabled = changes[STORAGE_KEY].newValue !== false;
      apply();
    }
  });

  // Re-evaluate periodically so a tab left open crosses the lunch
  // boundary without needing a reload. Only matters on Twitter/X.
  if (isTwitter) {
    setInterval(apply, 60 * 1000);

    // X is a single-page app: the route changes without a reload, so
    // re-evaluate the /home scope on every client-side navigation.
    const reapply = () => apply();
    const wrap = (name) => {
      const orig = history[name];
      history[name] = function () {
        const r = orig.apply(this, arguments);
        reapply();
        return r;
      };
    };
    wrap("pushState");
    wrap("replaceState");
    window.addEventListener("popstate", reapply);

    // Switching between "For you" and "Following" changes no URL and fires
    // no history event — it only flips aria-selected in the DOM. Watch for
    // that (and for the feed mounting after navigation) so the block tracks
    // the active tab. Debounced to one apply() per animation frame.
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        apply();
      });
    });
    const startObserving = () => {
      if (document.body) {
        observer.observe(document.body, {
          subtree: true,
          attributes: true,
          attributeFilter: ["aria-selected"],
          childList: true,
        });
      } else {
        requestAnimationFrame(startObserving);
      }
    };
    startObserving();
  }
})();
