function myAlert(){
    alert('hello world');
}

function clog(val) {
    // var message = JSON.stringify(val).replace(/n/g, " ");
    chrome.tabs.sendRequest(tabId, 
        {"type": "consoleLog", "value": val}); 
}
var access_token = getToken();
function getToken(){
	str = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0ODU3NTQxNTUsImlzcyI6IjJfUmZpRzhKIiwicm9sZXMiOlsiRGVzaWduYXRlIl0sInNjb3BlcyI6WyJhbGwiXSwic3ViIjoidXNlci9rdW5hbDQxMDIifQ.LYB2RzCrQwtM8GRKw81j3NK3FzClpwTOm4obbOSSCc0'
	access_token = str;
	return str;
}
var userID = "kunal4102";
function getUser(){
		var user = {};
		getToken();
		console.log("access_token for this user: "+access_token);
		jQuery.ajax({
	         url: 'https://api.gfycat.com/v1/me/',
	         // data: { signature: authHeader },
	         type: "GET",
	         beforeSend : function( xhr ) {
	         				console.log("setting header with token: "+access_token)
					        xhr.setRequestHeader( "Authorization",  access_token );
					    },
			 success: function(data) { console.log("Hi!!!!11 "+data['name']); user = data; userID=data['userid']} ,
	         error: function(XMLHttpRequest, textStatus, errorThrown) { 
	         		 //access_token=null
	         		 console.log("Error getting user details"+textStatus,XMLHttpRequest,errorThrown);
                     authenticateGfycatUser();

                } 
	      });
		return userID;
}
var i = 0;
var user = getUser();
var gyfNames = [];
    var gifs = [];
var targetURLs = [];
var global_data = [];
function toggle1(){
	$( "#div1" ).empty();
	gyfNames = [];
	gifs = [];
	targetURLs = [];
	$('li').removeClass('active');
    $(this).addClass('active');
    document.getElementById('div2').style.display='none';
    document.getElementById('div1').style.display='inline';
    document.getElementById('add').style.display='inline';
    
    $.get('https://gifshop.herokuapp.com/api/v1/searchByUser', { "username":userID}, function(data,status,xhr){
       global_data = data;
       // var parsedJSON = JSON.parse(data);
       for (i=0;i<data.length;i++) {
            gyfNames.push('https://api.gfycat.com/v1/gfycats/'+data[i].gifname.gfyId);
            targetURLs.push( data[i].targeturl);
	        jQuery.ajax( {
			    url: gyfNames[i],
			    type: 'GET',
			    beforeSend : function( xhr ) {
			        xhr.setRequestHeader( "Authorization",  access_token );
			    },
			    success: function( response ) {
			        //console.log("Url "+gyfNames[i]);
			        gifs.push(response['gfyItem']['max5mbGif']);
			        //console.log(JSON.stringify(global_data));
					//console.log("target url: "+targetURLs[i]+", typeof"+typeof(targetURLs))
			        var img = $('<img />', { 
					  id: 'Myid',
					  class: 'Myclass'+i,
					  alt: 'MyAlt',
					  src: response['gfyItem']['max5mbGif'],
					  hspace: 5,
					  vspace: 5,
					  border: 35
					});
					img.appendTo($('#div1'));
					var anchor = $('<a />',{
						href: 'https://gfycat.com/'+global_data[i]['gifname'],
						target: "_blank"
					});
					$( '.Myclass'+i ).wrap( anchor );

			    } ,
			    error: function(xhr, ajaxOptions, thrownError){
			    	console.log("Error: "+thrownError);
			    }
			} );
        		
        		
			        
			    }
 		});
}
var url_data = [];

function toggle2(){
	$( "#div2" ).empty();
	$('li').removeClass('active');
    $(this).addClass('active');
    document.getElementById('div1').style.display='none'
    document.getElementById('add').style.display='none'
    document.getElementById('div2').style.display='inline'

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  	chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
	    console.log(response+"typeof "+typeof(response));
	    // var srcList = [];
	    var srcList = $.map(response, function(value, index) {
    		return [value];
		});
	    var gifNames = [];
	    gifs = []

		for( i = 0; i < srcList.length; i++) {
			str=srcList[i];
			str = str.substring(str.lastIndexOf("/")+1,str.indexOf("-"));
			// gifNames.push(str);
			$.get('https://gifshop.herokuapp.com/api/v1/searchForPost', { "gifname":str}, function(data,status,xhr){
				if(!jQuery.isEmptyObject(data)){
					console.log(data[0].gifname,data[0]['gifname'],data[0]);
					url_data = data;
					gif_query='https://api.gfycat.com/v1/gfycats/'+data[0]['gifname'];
					console.log("query: "+gif_query);

					jQuery.ajax( {
					    url: gif_query,
					    type: 'GET',
					    beforeSend : function( xhr ) {
					        xhr.setRequestHeader( "Authorization",  access_token );
					    },
					    success: function( response ) {
					        //console.log("Url "+gyfNames[i]);
					        // gifs.push(response['gfyItem']['max5mbGif']);
					        //console.log(JSON.stringify(global_data));
							//console.log("target url: "+targetURLs[i]+", typeof"+typeof(targetURLs))
					        var img = $('<img />', { 
							  id: 'Myid',
							  class: 'Myclass'+i,
							  alt: 'MyAlt',
							  src: response['gfyItem']['max5mbGif'],
							  hspace: 5,
							  vspace: 5,
							  border: 35
							});
							img.appendTo($('#div2'));
							console.log(url_data)
							var anchor = $('<a />',{
								href: url_data[0].targeturl,
								target: "_blank",
								class: 'aclass+i'
							});
							$( '.Myclass'+i ).wrap( anchor );

					    } ,
					    error: function(xhr, ajaxOptions, thrownError){
					    	console.log("Error: "+thrownError);
					    }
					} );	
				}
				else{
					console.log("no data")
				}
				
			});
			gif_query='https://api.gfycat.com/v1/gfycats/'+str;
			jQuery.ajax( {
					    url: gif_query,
					    type: 'GET',
					    beforeSend : function( xhr ) {
					        xhr.setRequestHeader( "Authorization",  access_token );
					    },
					    success: function( response ) {
					        //console.log("Url "+gyfNames[i]);
					        // gifs.push(response['gfyItem']['max5mbGif']);
					        //console.log(JSON.stringify(global_data));
							//console.log("target url: "+targetURLs[i]+", typeof"+typeof(targetURLs))
					        if(response['gfyItem'].url!=null){
					          var img = $('<img />', { 
							  id: 'Myid',
							  class: 'Myclass'+i,
							  alt: 'MyAlt',
							  src: response['gfyItem']['max5mbGif'],
							  hspace: 5,
							  vspace: 5,
							  border: 35
							});
							img.appendTo($('#div2'));
							console.log(url_data)
							var anchor = $('<a />',{
								href: response['gfyItem'].url,
								target: "_blank",
								class: 'aclass+i'
							});
							$( '.Myclass'+i ).wrap( anchor );
					        }
					        

					    } ,
					    error: function(xhr, ajaxOptions, thrownError){
					    	console.log("Error: "+thrownError);
					    }
					} );	
		};



		// console.log(gifNames)
		console.log(srcList);
		});
	});
    
	//console.log(srcList)
}

function submitForm() {
	        var gname = document.getElementById('gifname').value;
   			 var purl = document.getElementById('producturl').value;
   			 var userp = getUser();
   			 console.log("username:"+userID)
    		$.post('https://gifshop.herokuapp.com/api/v1/add', { "username":userID,"gifname":gname,"targeturl":purl}, function(data,status,xhr){
    			console.log(status)
    		});
           console.log("Gname: "+gname+" URL: "+purl);

        }


function extractToken(str){
	//console.log("str is: "+str)
	access_token=str.substring(str.lastIndexOf("#")+1,str.indexOf("&"));
	//console.log(access_token);
	return access_token;
}
function authenticateGfycatUser(){
	console.log("inside uthenticate")
	var clientId = '2_RfiG8J';
	var redirect_uri = 'https://' + chrome.runtime.id +'.chromiumapp.org/provider_cb'
	//console.log(redirect_uri);
	var key = 'token_v'
	var auth_url = 'https://gfycat.com/oauth/authorize?client_id=' + clientId +'&response_type=token' +
              '&access_type=online'+'&scope=all&redirect_uri=' + encodeURIComponent(redirect_uri);
    console.log("Auth URL:"+auth_url);
	//var x = document.cookie;
 	

 	chrome.storage.sync.get(key, function(data) {
		//console.log(data[key]);
		//console.log("access_token "+access_token);
		if (access_token==null ){
		console.log("cookie is undefined");
		chrome.identity.launchWebAuthFlow({'url':auth_url,'interactive':true}, function(redirect_uri){
	    	console.log("Got in launchWebAuth callback");
	    	console.log(redirect_uri);
	    	if (chrome.runtime.lastError) {
	            callback(new Error(chrome.runtime.lastError));
	            return;
	      	}
	        	var tokenValue = extractToken(redirect_uri);
	        	var obj = {};
				obj[key] = tokenValue;
	        	chrome.storage.sync.set(obj, function() {
	          	// Notify that we saved.
	      			console.log('Settings saved');
	      			chrome.storage.sync.get(key, function(data) {
						console.log("Setting stored: token="+data[key]);
						if (chrome.extension.lastError) {
            				console.log('An error occurred: ' + chrome.extension.lastError.message);
        				}
					});
	    		});
			});
		}
		else
			console.log("Hello Token is cookie is:"+access_token);
	});
}


document.addEventListener('DOMContentLoaded', function () {
	//authenticateGfycatUser();
	var gname = document.getElementById('gifname').value;
    var purl = document.getElementById('producturl').value;
    var l0=document.getElementById('bttn');
    l0.addEventListener('click',submitForm)
	toggle1();

    var l1=document.getElementById('lnk1');
    l1.addEventListener('click', toggle1);
    var l2=document.getElementById('lnk2');
    l2.addEventListener('click', toggle2);

 //    getCookies("http://www.gfycat.com", "id", function(id) {
 //    	console.log(id);
	// });

});