(function () {
	var status = 0;

	/**
	 * Notify tabs about devtools message
	 * Tabs will drop different tab's message
	 * @param msg
	 */
	function messageToAllTabs (msg) {
		chrome.tabs.query({
			"status": "complete",
			"currentWindow": true,
			"url": "*://ncore.cc/*"
		}, function (tabs) {
			for (var i in tabs) {
				//Sending Message to content scripts
				msg.tabId = tabs[i].id;

				chrome.tabs.sendMessage(tabs[i].id, msg);
			}
		});
	}

	function updateTabs () {
		chrome.tabs.query({
			//"status": "complete",
			"url": "*://ncore.cc/*"
		}, function (tabs) {
			for (var i in tabs) {
				updateIcon(
		            tabs[i].id,
		            false
		        );
		        chrome.browserAction.onClicked.removeListener(openUrl);
			}
		});
	}

	function updateIcon (tabid, disabled) {
		chrome.browserAction.setIcon({
            path: '/img/icons/' + (!disabled ? 'icon128.png' : 'icon-disabled-128.png'),
            tabId: tabid
        });
	}

	function openUrl (tab) {
		chrome.tabs.create({ url: 'https://ncore.cc/torrents.php' })
	}

	chrome.runtime.onMessage.addListener(function(request) {
	  console.log('background.js onMessage', request)
	  if (request.type && request.type === 'ncore_bg_call' && request.name === 'updateIcon') {
	  	updateTabs();
	  }
	});

	chrome.browserAction.onClicked.addListener(openUrl)
	/*chrome.browserAction.onClicked.addListener(function(tab) {
		console.log(tab)
		var currentStatus = status >= statusData.length ? 0 : status++;
			
		chrome.tabs.sendMessage(tab.id, {
			type: 'message_type',
			value: statusData[currentStatus].name
		});
		messageToAllTabs({
			type: 'message_type',
			value: statusData[currentStatus].name
		});
	});*/

	function init () {}

	init();
})()