// we wont use it yet maybe later -> on click the icon

(function () {
	console.log('APP', chrome.extension, chrome.tabs, chrome)
	chrome.extension.onConnect.addListener(function(port) {
		console.log('port onConnect - ', port);

		//on port disconnect
		port.onDisconnect.addListener(function(port) {
			console.log('port onDisconnect - ', port);
		});

		//Message from devtools
		port.onMessage.addListener(function (msg) {
			console.log('port onMessage - ', msg);
		});

		//Send tab info to devtools as a handshake
		chrome.tabs.getSelected(null, function(tab) {
			console.log('port tab getSelected - ', tab);
		});
	});

	/**
	 * on message from content script we forward it to devtools panels
	 */
	chrome.extension.onMessage.addListener(function (msg, sender) {
		console.log('extension onMessage - ', msg, sender);
	});

	chrome.tabs.onUpdated.addListener(function (info, changeInfo, tab) {
		console.log('tab onUpdated - ', info, changeInfo, tab);
	});

	var channel = chrome.extension.connect();

	if (window.top === window) {
		channel.postMessage({ name : "getSettings" });
		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) { console.log('current tab query', tabs)});
		chrome.tabs.executeScript(null, {file: "/js/inject/decorate.js"});
	}
})();
chrome.browserAction.onClicked.addListener(function () {
	console.log('Clicked',arguments)
	alert('clicked')
	// chrome.browserAction.setIcon(object details, function callback)
});