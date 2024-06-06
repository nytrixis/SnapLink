const snapLinkObject = snapLink(chrome.storage.sync);

const snapLinkApp = (function(snapLinkObject){
  const addBtn = document.getElementById("addBtn");
  const clearBtn = document.getElementById("clearBtn");
  const msg = document.getElementById("message");
  const links = document.getElementById("links");
  const downloadBtn = document.getElementById("downloadAsJSON");
  const downloadContainer = document.getElementById('downloadContainer');

  const downloadAsJSON = function(){
    snapLinkObject.getValidSyncItems(function(syncItems){
      console.log("Downloading items");
      const downloadDataLink = document.createElement("a");
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(syncItems, 0, 2));
      downloadDataLink.setAttribute("style", "display: none");
      downloadDataLink.setAttribute("href", dataStr);
      downloadDataLink.setAttribute("download", "SnapLink-data.json");
      
      downloadContainer.appendChild(downloadDataLink);
      downloadDataLink.click();
      downloadDataLink.remove();
    });
  };

  const getTitle = function(title){
    return title;
  };

  const show_total_links = snapLinkObject.getCountsHandler(function(counts){
    msg.innerText = `Total Links:${counts}`;
  });

  const message = function(messageStr) {
    msg.innerText = messageStr;
    setTimeout(show_total_links, 1000);
  };

  const add_success = function(){
    console.log(`URL Item successfully added.`);
    init();
  };

  const add_exists = function(urlItem){
    console.log(`Add failed. URLItem ${urlItem} already exists.`);
    message("URL exists.");
  };

  const remove_success = function(){
    console.log(`URL successfully removed.`);
    init();
  };

  const remove_failed = function(url){
    console.log(`Remove failed. URL ${url} does not exist.`);
  };

  const clear_all_success = function(){
    console.log("Cleared all URLs.");
    init();
  };

  const addURL = snapLinkObject.addURLHandler(add_success, add_exists);
  const removeURL = snapLinkObject.removeURLHandler(remove_success, remove_failed);

  const removeAction = function(e){
    const linkId = e.target; 
    const linkDOMId = linkId.getAttribute("name"); 

    const parentNode = linkId.parentNode.parentNode; 
    if (parentNode) {
      var url = linkDOMId;
      parentNode.removeChild(linkId.parentNode);
      //console.log("Removed Child");
      removeURL(url);
    }
  };

  const clearAll = snapLinkObject.clearAllHandler(clear_all_success);
  const addURLFromTab = snapLinkObject.addURLFromTabHandler(addURL);

  addBtn.addEventListener("click", addURLFromTab);
  clearBtn.addEventListener("click", clearAll);
  downloadBtn.addEventListener("click", downloadAsJSON);

  const getIcon = function(url) {
    const domain = url.replace('http://', '').replace('https://', '').split(
      /[/?#]/)[0];
    const imgUrl = "http://www.google.com/s2/favicons?domain=" + domain;

    const img = document.createElement("img");
    img.setAttribute('src', imgUrl);
    return img.outerHTML;
  };

  const createLinkHTML = function(listItem, url) {
    const linkBtn = document.createElement("span");
    const itemDate = new Date(listItem.timestamp);
    const title = `${listItem.title}\nAdded on: ${itemDate}`;
    linkBtn.setAttribute("class", "removeBtn");
    linkBtn.setAttribute("name", url);
    const returnHTML = linkBtn.outerHTML + "<a target='_blank' href='" + url +
      "' title='"+title+"'>" + getIcon(url) + " " + getTitle(listItem.title) + "</a>";

    return returnHTML;
  };

  const init = function(){
    snapLinkObject.getValidSyncItems(function(syncItems){
      links.innerHTML = "";
      const counts = syncItems.length;
      //console.log(syncItems);
      message(`Loaded ${counts} links.`);

      syncItems.sort(function(a, b) {
        if (a.timestamp < b.timestamp) return -1;
        if (a.timestamp > b.timestamp) return 1;
        return 0;
      });

      syncItems.forEach(function(syncItem){
        //console.log(syncItem);
        const listItem = document.createElement("li");
        listItem.innerHTML = createLinkHTML(syncItem, syncItem.key);
        links.appendChild(listItem);

        listItem.getElementsByClassName("removeBtn")[0].addEventListener(
          "click", removeAction, false);

      });
      message("Finished!");

    });

  };

  return {
    init: init
  };

})(snapLinkObject);


snapLinkApp.init();
chrome.storage.sync.onChanged.addListener(snapLinkApp.init);

console.log("SnapLink Active");
