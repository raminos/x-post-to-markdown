const clickHandler = (info, tab) => {
  chrome.tabs.sendMessage(tab.id, { func: "copyPostToClipboard" });
};

chrome.contextMenus.create({
  id: "SCRAPE_X_POST_EXTENSION",
  title: "Copy X Post as Markdown",
  contexts: ["page", "selection", "image", "link"],
});

chrome.contextMenus.onClicked.addListener(clickHandler);
