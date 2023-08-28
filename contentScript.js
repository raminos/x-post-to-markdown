const getUserNameAndHandle = (post) => {
  const userNameAndHandleDiv = post.querySelectorAll(
    "[data-testid=User-Name]"
  )[0];
  const userNameDiv = userNameAndHandleDiv.getElementsByTagName("a")[0];
  const handleDiv = userNameAndHandleDiv.getElementsByTagName("a")[1];
  return {
    userName: userNameDiv.innerText,
    handle: handleDiv.innerText,
    userHref: userNameDiv.href,
  };
};

const getPostContent = (post) => {
  const contentDiv = post.querySelectorAll("[data-testid=tweetText]")[0];
  // TODO: Does this work with long form tweets as well?
  return contentDiv.innerText;
};

const getPostTimestamp = (post) => {
  const timeElement = post.getElementsByTagName("time")[0];
  const time = timeElement.attributes.getNamedItem("datetime").value;
  return time;
};

const getPostData = (post) => {
  const { userName, handle, userHref } = getUserNameAndHandle(post);
  const content = getPostContent(post);
  const timestamp = getPostTimestamp(post);
  return {
    userName,
    handle,
    userHref,
    content,
    timestamp,
    postHref: window.location.href,
  };
};

const getMainPost = () => {
  const posts = document.documentElement.getElementsByTagName("article");
  const mainPost = posts?.[0];
  return mainPost;
};

const postDataToMarkdown = (postData) => {
  return `
**${postData.userName}**
[${postData.handle}](${postData.userHref})
${postData.timestamp.slice(0, -5)}

> ${postData.content.replaceAll("\n", "\n> ")}

[Source](${postData.postHref})
    `.trim();
};

const copyPostToClipboard = () => {
  const data = postDataToMarkdown(getPostData(getMainPost()));
  navigator.clipboard.writeText(data);
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.func === "copyPostToClipboard") {
    copyPostToClipboard();
    return;
  }
});
