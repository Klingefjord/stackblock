(() => {
  "use strict";

  const STORAGE_KEY = "stackblockEnabled";
  const CLASS = "stackblock-on";

  function apply(enabled) {
    const on = enabled !== false;
    document.documentElement.classList.toggle(CLASS, on);
  }

  chrome.storage.sync.get([STORAGE_KEY], (res) => {
    apply(res[STORAGE_KEY] === undefined ? true : res[STORAGE_KEY]);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes[STORAGE_KEY]) {
      apply(changes[STORAGE_KEY].newValue);
    }
  });
})();
