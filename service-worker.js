const ALLOWED_DOMAINS_REGEX = /twitter\.com|x\.com/i;

const clickHandler = (_info, tab) => {
  chrome.tabs.sendMessage(tab.id, { func: "copyPostToClipboard" });
};

const toggleContextMenus = (url) => {
  if (!ALLOWED_DOMAINS_REGEX.test(url)) {
    chrome.contextMenus.removeAll();
    return;
  }

  chrome.contextMenus.create(
    {
      id: "X_POST_TO_MARKDOWN_EXTENSION",
      title: "Copy as Markdown",
      contexts: ["page", "selection", "image", "link"],
    },
    () => chrome.runtime.lastError
  );

  chrome.contextMenus.onClicked.addListener(clickHandler);
};

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  toggleContextMenus(tab.url);
});
chrome.tabs.onCreated.addListener((tab) => toggleContextMenus(tab.url));
chrome.tabs.onUpdated.addListener((_tabId, _changeInfo, tab) =>
  toggleContextMenus(tab.url)
);
