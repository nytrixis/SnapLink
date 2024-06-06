/**
  Functionality needed:
  - Setup UI
  - Add URL
  - Remove URL
  - Clear all URLs
  - Count URLs
  - Update UI
  - Listen to changes in sync storage
**/

const MAX_BUTTON_ITEMS = 999;

let snapLink = (function(storageObject) {

  let storage = storageObject;

  let badgeText = function(c) {
    if (c > MAX_BUTTON_ITEMS) {
      return `${MAX_BUTTON_ITEMS}+`;
    }
    return c.toString();
  };

  let getCountsHandler = function(counts_callback) {
    return function() {
      storage.get(function(items) {
        let counts = 0;
        for (let key in items) {
          if ((typeof key === 'string') && (key !== 'count')) {
            counts += 1;
          }
        }
        counts_callback(counts);
      });
    };
  };


  let createNewURLItemFromTab = function(tab) {
      let urlData = {"title": tab.title, 'timestamp': new Date().getTime()};
      let urlItem = {'url': tab.url, 'data': urlData};
      return urlItem;
  };

  let isValidSyncItem = function(syncItem) {
    if (Object.keys(syncItem).length != 1) {
      return false;
    }
    for (let key in syncItem) {
      if(typeof syncItem[key] !== "object"){
        return false;
      }
      if (!('title' in syncItem[key])) {
        return false;
      }
    }
    return true;
  };

  let getValidSyncItems = function(callback) {
    storage.get(function(items) {
      links.innerHTML = '';
      let syncItems = new Array();

      for (let key in items) {
        let syncItem = {}; 
        syncItem[key] = items[key];
        // console.log(key, syncItem);
        if (isValidSyncItem(syncItem)) {
          // console.log(key, items[key]);
          syncItem = items[key];
          syncItem.key = key;
          syncItems.push(syncItem);
        }
      }

      callback(syncItems);
    });

  };

  return {
    // storage: storage,
    getCountsHandler: getCountsHandler,
    getValidSyncItems: getValidSyncItems,

    setBadge: getCountsHandler(function(counts) {
      chrome.action.setBadgeText({
        'text': badgeText(counts),
      });
    }),

    addURLFromTabHandler: function(success_callback) {
      return function() {
        chrome.tabs.query({"active": true, 'currentWindow': true}, function(
          tabs) {

          if (!tabs.length) 
            {return;}
          let tab = tabs[0];

          let urlItem = createNewURLItemFromTab(tab);
          success_callback(urlItem);
        });
      };
    },

    addURLHandler: function(success_callback, exists_callback) {
      return function(urlItem) {
        storage.get(urlItem.url, function(urlItemFound) {
          if (isValidSyncItem(urlItemFound)) {
            exists_callback(urlItem);
          } else {
            let syncItem = {};
            syncItem[urlItem.url] = urlItem.data;
            storage.set(syncItem, success_callback);
          }
        });
      };
    },

    removeURLHandler: function(success_callback, failed_callback) {
      return function(url) {
        storage.get(url, function(urlItemFound) {
          if (urlItemFound) {
            storage.remove(url, success_callback);
          } else {
            failed_callback(url);
          }
        });
      };
    },

    clearAllHandler: function(success_callback) {
      return function() {
        let confirmVal = confirm('Are you sure you want to delete all links?');
        if (confirmVal === true) {
          storage.clear(success_callback);
        }
      };
    },
  };
  
});
