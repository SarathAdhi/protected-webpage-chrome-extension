chrome.tabs.onUpdated.addListener(function () {
  // chrome.storage.sync.set({ password: "" });
  // chrome.storage.sync.set({ urls: "" });

  chrome.tabs.query({ active: true }, async (tabs) => {
    let url = tabs[0].url;
    let preUrls = [];

    let value = await chrome.storage.sync.get(["urls"]);
    if (value.urls) preUrls = JSON.parse(value.urls);

    console.log({ preUrls });

    const isUrlExist = preUrls.some(
      (preUrl) => url.includes(preUrl.link) && preUrl.check
    );

    if (isUrlExist) {
      console.log("blocked");

      chrome.tabs.sendMessage(tabs[0].id, {
        name: "block",
        url,
      });
    } else {
      console.log("not blocked");
    }

    return true;
  });

  return true;
});
