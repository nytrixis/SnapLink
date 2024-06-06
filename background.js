const snapLinkObject = snapLink(chrome.storage.sync);

const snapLinkApp = {
  add_success: function () {
    console.log(`URL Item successfully added.`);
  },
  add_exists: function (urlItem) {
    const urlJSON = JSON.stringify(urlItem);
    console.log(`Add failed. URLItem ${urlJSON} already exists.`);
  },
  remove_success: function () {
    console.log(`URL successfully removed.`);
  },
  remove_failed: function (url) {
    console.log(`Remove failed. URL ${url} does not exist.`);
  },
  clear_all_success: function () {
    console.log("Cleared all URLs.");
  },
};

snapLinkApp.addURL = snapLinkObject.addURLHandler(snapLinkApp.add_success, snapLinkApp.add_exists);
snapLinkApp.removeURL = snapLinkObject.removeURLHandler(snapLinkApp.remove_success, snapLinkApp.remove_failed);
snapLinkApp.clearAll = snapLinkObject.clearAllHandler(snapLinkApp.clear_all_success);
snapLinkApp.addURLFromTab = snapLinkObject.addURLFromTabHandler(snapLinkApp.addURL);

chrome.commands.onCommand.addListener(function (command) {
  console.log('Command:', command);
  if (command === "add-url") {
    console.log("Adding URL");
    snapLinkApp.addURLFromTab();
  }
});

chrome.runtime.onStartup.addListener(snapLinkObject.setBadge);
chrome.runtime.onInstalled.addListener(snapLinkObject.setBadge);
chrome.storage.onChanged.addListener(snapLinkObject.setBadge);
