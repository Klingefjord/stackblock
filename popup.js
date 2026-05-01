const STORAGE_KEY = "stackblockEnabled";
const toggle = document.getElementById("toggle");

chrome.storage.sync.get([STORAGE_KEY], (res) => {
  toggle.checked = res[STORAGE_KEY] === undefined ? true : !!res[STORAGE_KEY];
});

toggle.addEventListener("change", () => {
  chrome.storage.sync.set({ [STORAGE_KEY]: toggle.checked });
});
