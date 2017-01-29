chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	console.log("listening");	
    console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
    if (request.greeting == "hello"){
      var domInfo = {
      total:   document.querySelectorAll('img'),
      inputs:  document.querySelectorAll('input').length,
      buttons: document.querySelectorAll('button').length
    };

    var images = document.getElementsByTagName('img'); 
		var srcList = [];
		// var string = "foo",
    	substring = "gfycat.com";
		// string.includes(substring);
		for(var i = 0; i < images.length; i++) {
			if(images[i].src.indexOf(substring)!==-1)
	    		srcList.push(images[i].src);
		};
     console.log(srcList);
      sendResponse(srcList);
    }
  });