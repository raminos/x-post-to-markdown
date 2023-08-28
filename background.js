const clickHandler = (_info, tab) => {
  chrome.tabs.sendMessage(tab.id, { func: "copyPostToClipboard" });
};

chrome.contextMenus.create({
  id: "X_POST_TO_MARKDOWN_EXTENSION",
  title: "Copy as Markdown",
  contexts: ["page", "selection", "image", "link"],
});

chrome.contextMenus.onClicked.addListener(clickHandler);
