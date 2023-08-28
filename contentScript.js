const parseText = (
  node,
  options = { returnMarkdown: false },
  meta = { isBold: false, isItalic: false }
) => {
  if (!node) return "";

  if (
    node.nodeName === "SPAN" &&
    window.getComputedStyle(node).fontWeight === "700"
  ) {
    meta = { ...meta, isBold: true };
  }

  if (
    node.nodeName === "SPAN" &&
    window.getComputedStyle(node).fontStyle === "italic"
  ) {
    meta = { ...meta, isItalic: true };
  }

  if (node.nodeName === "#text") {
    if (meta.isBold && options.returnMarkdown) return `**${node.nodeValue}**`;
    if (meta.isItalic && options.returnMarkdown) return `_${node.nodeValue}_`;

    return node.nodeValue;
  }

  if (node.nodeName === "IMG") {
    return node.alt;
  }

  if (node.nodeName === "A" && options.returnMarkdown) {
    return `[${node.textContent}](${node.href})`;
  }

  let result = [];
  node.childNodes.forEach((child) => {
    result.push(parseText(child, options, meta));
  });

  return result.join("");
};

const getUserData = (post) => {
  const userNameAndHandleDiv = post.querySelectorAll(
    "[data-testid=User-Name]"
  )[0];
  const userNameDiv = userNameAndHandleDiv.getElementsByTagName("a")[0];
  const userHandleDiv = userNameAndHandleDiv.getElementsByTagName("a")[1];
  return {
    userName: parseText(userNameDiv),
    userHandle: userHandleDiv.textContent,
    userHref: userNameDiv.href,
  };
};

const getPostContent = (post) => {
  const contentDiv = post.querySelectorAll("[data-testid=tweetText]")[0];
  return parseText(contentDiv, { returnMarkdown: true });
};

const getPostTimestamp = (post) => {
  const timeElement = post.getElementsByTagName("time")[0];
  const time = timeElement.attributes.getNamedItem("datetime").value;
  return time;
};

const getPostHref = (post) => {
  if (window.location.href.includes("status")) {
    return window.location.href;
  }

  const buttonsGroup = post.querySelector("[role=group]");
  const analyticsLink = buttonsGroup.getElementsByTagName("a")[0];

  if (!analyticsLink) return undefined;

  return analyticsLink.href.replace("/analytics", "");
};

const getImageAttachmentHref = (attachmentElement) => {
  const videoElement = attachmentElement.getElementsByTagName("video")?.[0];
  if (videoElement) {
    return {
      type: "video-poster",
      href: videoElement.attributes.getNamedItem("poster").value,
    };
  }

  const photoElement = attachmentElement.getElementsByTagName("img")?.[0];
  if (photoElement) {
    return {
      type: "image",
      href: photoElement.attributes.getNamedItem("src").value,
    };
  }

  return undefined;
};

const getLinkAttachmentHref = (attachmentElement) => {
  const linkElement = attachmentElement.getElementsByTagName("a")?.[0];
  if (linkElement) {
    return {
      type: "link",
      href: linkElement.href,
    };
  }
};

const getPostAttachments = (post) => {
  const attachmentHrefs = [];
  const imageAttachments = post.querySelectorAll("[data-testid=tweetPhoto]");
  imageAttachments.forEach((imageAttachment) => {
    attachmentHrefs.push(getImageAttachmentHref(imageAttachment));
  });

  const linkAttachments = post.querySelectorAll('[data-testid="card.wrapper"]');
  linkAttachments.forEach((linkAttachment) => {
    attachmentHrefs.push(getLinkAttachmentHref(linkAttachment));
  });

  return attachmentHrefs;
};

const getPostData = (post) => {
  const { userName, userHandle, userHref } = getUserData(post);
  return {
    userName,
    userHandle,
    userHref,
    content: getPostContent(post),
    timestamp: getPostTimestamp(post),
    postHref: getPostHref(post),
    attachments: getPostAttachments(post),
  };
};

const attachmentToMarkdown = (attachment) => {
  if (attachment.type === "image") {
    return `> ![Post Image](${attachment.href})\n`;
  }
  if (attachment.type === "video-poster") {
    return `> ![Post Video Poster](${attachment.href})\n`;
  }
  if (attachment.type === "link") {
    return `> [Post Link](${attachment.href})`;
  }

  return "";
};

const attachmentsToMarkdown = (attachments) => {
  return attachments
    .map((attachment, index) => {
      let result = attachmentToMarkdown(attachment);

      if (index === 0) {
        result = "> \n" + result;
      }
      return result;
    })
    .join("");
};

const postDataToMarkdown = (postData) => {
  return `
**${postData.userName}**
[${postData.userHandle}](${postData.userHref})
${postData.timestamp.slice(0, -5)}

> ${postData.content.replaceAll("\n", "\n> ")}
${attachmentsToMarkdown(postData.attachments)}
[Source](${postData.postHref})
    `.trim();
};

const findArticle = (element) => {
  if (element.tagName === "ARTICLE") {
    return element;
  }
  return element.closest("article");
};

const copyPostToClipboard = () => {
  const articleElement = findArticle(document.activeElement);
  if (!articleElement) return;

  const data = postDataToMarkdown(getPostData(articleElement));
  navigator.clipboard.writeText(data);
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.func === "copyPostToClipboard") {
    copyPostToClipboard();
    return;
  }
});
