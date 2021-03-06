const {Cc, Ci, Cu, Cr} = require("chrome");
var firefox=false;
var fennec=false;
var seamonkey=false;
var thunderbird=false;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
//Cu.import("resource:///modules/iteratorUtils.jsm");
function SaveToDrive(urlfile)
{
	var urlbase=require("tabs").activeTab.url;
	var data = require("sdk/self").data;
	var plusonejs=data.url("plusone.js");
	var pageDrive=require("sdk/page-mod");
	var page=pageDrive.PageMod({
		include: urlbase,
  		contentScriptFile: data.url("savetodrive.js"),
		onAttach: function(worker){
			worker.port.emit("addButton",urlfile,plusonejs);
			worker.port.on("stop",function(){
				
				page.destroy();
			});
		}
	});
	require("tabs").activeTab.reload();

	

}
function thunderUI(doc)
{
	document=doc.document;
	var context=document.getElementById("mailContext");
	var menuitem=document.createElement("menuitem");
	var tabmail=document.getElementById("tabmail");
	menuitem.setAttribute("id", "save-to-drive-thunderbird");
	menuitem.setAttribute("label", "Save to Drive");
	menuitem.addEventListener("command", function(){
		/*var promptService=Cc["@mozilla.org/embedcomp/prompt-service;1"].
                getService(Ci.nsIPromptService);
		//promptService.alert(null,"Save to Drive","Welcome to testing");
		var input = {value: "Bob"};
		var urlbase=promptService.prompt(null,"Save to Drive","Insert the URL of the file\nPlease check that the server accepts CORS",input,null,{value: false});
		var url="data:text/html, <html><head><title>Save to Drive</title><script src=\"https://https://apis.google.com/js/plusone.js\"</head><body><div class=\"g-savetodrive\" data-src=\""+input.value+"\" data-filename=\"SaveToDrive File\" data-sitename=\"Save to Drive\"></div></body></html>";*/
		
		tabmail.openTab("contentTab",{contentPage: "http://drive.google.com"});


	}, true);
	context.appendChild(menuitem);
	
}
function seaUI(doc)
{
	document=doc.document;
	var context=document.getElementById("contentAreaContextMenu");
	var menuitem=document.createElement("menuitem");
	menuitem.setAttribute("id","save-to-drive-seamonkey");
	menuitem.setAttribute("label","Save to Drive");
	menuitem.addEventListener("command", function()
	{
		doc.open("http://drive.google.com","Save to Drive","_blank");	
	
	},true);
	context.appendChild(menuitem);
}
exports.main=function(options)
{
	if(options.loadReason=="install"){
		require("tabs").open("http://sites.google.com/site/divelmedia"); //Welcome page
	}
	//Checking system options
	var system=require("sdk/system/xul-app");
	if(system.name=="Fennec")
	{
		fennec=true;
	}else if(system.name=="Firefox")
	{
		firefox=true;
	}else if(system.name=="SeaMonkey")
	{
		seamonkey=true;
	}else if(system.name=="Thunderbird")
	{
		thunderbird=true;
	}
	//Creating UI
	if(firefox)
	{
		var mm = require("context-menu");
		var menuItem = mm.Item({
		  label: "Save to Drive",
		  context: mm.SelectorContext("a"),
		  contentScript: 'self.on("click", function (node) {' +
				 '  self.postMessage(node.href);' +
				 '});',
		  onMessage: function (urlfile) {
		    SaveToDrive(urlfile);
		  }
		});

	}
	if(fennec)
	{
		const utils = require('api-utils/window/utils');
		const recent = utils.getMostRecentBrowserWindow();
		let selector =  recent.NativeWindow.contextmenus.SelectorContext("a");
		recent.NativeWindow.contextmenus.add("Save to Drive",selector,function (target){
			SaveToDrive(target.href);
		});
	}
	if(thunderbird)
	{
		/*var messenger = Cc["@mozilla.org/messenger;1"].getService(Ci.nsIMessenger);
         	messenger.launchExternalURL("http://sites.google.com/site/divelmedia");*/
		let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
		var interfaz = {
		  onOpenWindow: function(aWindow) {
		    // Wait for the window to finish loading
		    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindow);
		    domWindow.addEventListener("load", function() {
		      domWindow.removeEventListener("load", arguments.callee, false);
		      thunderUI(domWindow);
		    }, false);
		  },
		 
		  onCloseWindow: function(aWindow) {},
		  onWindowTitleChange: function(aWindow, aTitle) {}
		};
		  // Load into any existing windows
		  let windows = wm.getEnumerator("mail:3pane"); //navigator:browser in Firefox and Fennec
		  while (windows.hasMoreElements()) {
		    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
		    thunderUI(domWindow);
		  }

		  // Load into any new windows
		  wm.addListener(interfaz);
		


	}
	if(seamonkey)
	{
		let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
		var interfaz = {
		  onOpenWindow: function(aWindow) {
		    // Wait for the window to finish loading
		    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindow);
		    domWindow.addEventListener("load", function() {
		      domWindow.removeEventListener("load", arguments.callee, false);
		      seaUI(domWindow);
		    }, false);
		  },
		 
		  onCloseWindow: function(aWindow) {},
		  onWindowTitleChange: function(aWindow, aTitle) {}
		};
		  // Load into any existing windows
		  let windows = wm.getEnumerator("navigator:browser"); //keep it void for all windows
		  while (windows.hasMoreElements()) {
		    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
		    seaUI(domWindow);
		  }

		  // Load into any new windows
		  wm.addListener(interfaz);


	}

}
