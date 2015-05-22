(function () {
	console.log(window)
	window.postMessage({ type: "FROM_PAGE", text: "Hello from the webpage!" }, "*");
})();