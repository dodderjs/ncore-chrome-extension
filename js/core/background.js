(function () {
	var status = 0,
		statusData = [
			{
				name: 'grid',
				icon: '/img/thumbnails.png'
			},
			{
				name: 'grid-line',
				icon: '/img/thumbnails-line.png',
			},
			{
				name: 'line',
				icon: '/img/lines.png'
			}];

	/**
	 * Notify tabs about devtools message
	 * Tabs will drop different tab's message
	 * @param msg
	 */
	function messageToAllTabs (msg) {
		chrome.tabs.query({
			"status": "complete",
			"currentWindow": true,
			"url": "*://*.ncore.cc/*"
		}, function (tabs) {
			for (var i in tabs) {
				//Sending Message to content scripts
				msg.tabId = tabs[i].id;

				chrome.tabs.sendMessage(tabs[i].id, msg);
			}
		});
	}

	function updateTabs (status) {
		chrome.tabs.query({
			"status": "complete",
			"currentWindow": true,
			"url": "*://*.ncore.cc/*"
		}, function (tabs) {
			for (var i in tabs) {
				chrome.browserAction.setIcon({
		            path: statusData[current].icon,
		            tabId: tabs[i].id
		        })
			}
		});
	}

	chrome.runtime.onMessage.addListener(function(request) {
	  console.log('background.js onMessage', request)
	});

	chrome.browserAction.onClicked.addListener(function(tab) {
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

		updateTabs(currentStatus);
	});

	function init () {

	}

	init();
})()