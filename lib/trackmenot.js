/*******************************************************************************    
    This file is part of TrackMeNot (Chrome version).

    TrackMeNot is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation,  version 2 of the License.

    TrackMeNot is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 ********************************************************************************/
var Request = require("request").Request;
var tabs = require('tabs');
var URL = require("url").URL;
var data = require("self").data;
var ss = require("simple-storage");
var widgets = require("widget");
var panels = require("panel");
var pageMod = require("page-mod");
var timer = require("timer"); 
var {Cc, Ci} = require("chrome");
var prefs = require("sdk/preferences/service");
var windows = require("windows").browserWindows;
var notifications = require("notifications");
var _ = require("l10n").get;
var sp = require("sdk/simple-prefs");
let { setTimeout } = require('sdk/timers');





if(!TRACKMENOT) var TRACKMENOT = {};

TRACKMENOT.TMNSearch = function() {
    var tmn_tab_id = -1;
    var tmn_tab = null;
    var useTab = false;
    var enabled = true;
    var debug_ = true;
    var load_full_pages = false;
    var stop_when = "start"
    var useIncrementals = false;
    var incQueries = [];
    var searchEngines = "google";
    var engine = 'google';
    var TMNQueries = {};
    var branch =  "extensions.trackmenot."
    var feedList = _("tmn.rss.default-feeds");// 'http://www.techmeme.com/index.xml|http://rss.slashdot.org/Slashdot/slashdot|http://feeds.nytimes.com/nyt/rss/HomePage';
    var tmnLogs = [];
    var disableLogs = false;
    var saveLogs =  true;
    var kwBlackList = [];
    var useBlackList = true;
    var useDHSList = false;
    var useNOISE = true;
    var typeoffeeds = [];
    var zeitgeist = ["facebook","youtube","myspace","craigslist","ebay","yahoo","walmart","netflix",
			"amazon","home depot","best buy","Kentucky Derby","NCIS","Offshore Drilling",
			"Halle Berry","iPad Cases","Dorothy Provine","Emeril","Conan O'Brien","Blackberry",
			"Free Comic Book Day"," American Idol","Palm","Montreal Canadiens","George Clooney",
			"Crib Recall","Auto Financing","Katie Holmes","Madea's Big Happy Family",
			"Old Navy Coupon","Sandra Bullock","Dancing With the Stars","M.I.A.","Matt Damon",
			"Santa Clara County","Joey Lawrence","Southwest Airlines","Malcolm X","Milwaukee Bucks",
			"Goldman Sachs","Hugh Hefner","Tito Ortiz","David McLaughlin","Box Jellyfish","Amtrak",
			"Molly Ringwald","Einstein Horse","Oil Spill"," Bret Michaels","Mississippi Tornado",
			"Stephen Hawking","Kelley Blue Book","Hertz","Mariah Carey","Taiwan Earthquake",
			"Justin Bieber","Public Bike Rental","BlackBerry Pearl","NFL Draft","Jillian Michaels",
			"Face Transplant","Dell","Jack in the Box","Rebbie Jackson","Xbox","Pampers",
			"William Shatner","Earth Day","American Idol","Heather Locklear","McAfee Anti-Virus",
			"PETA","Rihanna","South Park","Tiger Woods","Kate Gosselin","Unemployment","Dukan Diet",
			"Oil Rig Explosion","Crystal Bowersox","New 100 Dollar Bill","Beastie Boys",
			"Melanie Griffith","Borders","Tara Reid","7-Eleven","Dorothy Height","Volcanic Ash",
			"Space Shuttle Discovery","Gang Starr","Star Trek","Michael Douglas","NASCAR",
			"Isla Fisher","Beef Recall","Rolling Stone Magazine","ACM Awards","NASA Space Shuttle",
			"Boston Marathon","Iraq","Jennifer Aniston"]
    var tmn_timeout = 6000;
    var prev_engine = "None"
    var burstEngine = '';
    var burstTimeout = 6000;
    var burstEnabled = true;
    var tmn_searchTimer =null;
    var burstCount = 0;
    var tmn_id = 0;
    var tmn_logged_id = 0;
    var tmn_mode = 'timed';
    var tmn_errTimeout = null;
    var tmn_scheduledSearch = false;
    var tmn_query='No query sent yet';
    var currentTMNURL = '';
    var tmn_option_tab = null;
    var worker_tab, worker_opt;
    var search_script = [data.url("jquery.js"),data.url("tmn_search.js")];
    var noise_req = null;
    
    var skipex =new Array(   
    /calendar/i,/advanced/i,/click /i,/terms/i,/Groups/i,
    /Images/,/Maps/,/search/i,/cache/i,/similar/i,/&#169;/,
    /sign in/i,/help[^Ss]/i,/download/i,/print/i,/Books/i,/rss/i,
    /google/i,/bing/i,/yahoo/i,/aol/i,/html/i,/ask/i,/xRank/,
    /permalink/i,/aggregator/i,/trackback/,/comment/i,/More/,
    /business solutions/i,/result/i,/ view /i,/Legal/,/See all/,
    /links/i,/submit/i,/Sites/i,/ click/i,/Blogs/,/See your mess/,
    /feedback/i,/sponsored/i,/preferences/i,/privacy/i,/News/,
    /Finance/,/Reader/,/Documents/,/windows live/i,/tell us/i,
    /shopping/i,/Photos/,/Video/,/Scholar/,/AOL/,/advertis/i,
    /Webmasters/,/MapQuest/,/Movies/,/Music/,/Yellow Pages/,
    /jobs/i,/answers/i,/options/i,/customize/i,/settings/i,
    /Developers/,/cashback/,/Health/,/Products/,/QnABeta/,
    /<more>/,/Travel/,/Personals/,/Local/,/Trademarks/,
    /cache/i,/similar/i,/login/i,/mail/i,/feed/i
)

	var testAd_google = function(anchorClass,anchorlink) {
            return ( anchorlink
                && (anchorClass=='l'  || anchorClass=='l vst')
                && anchorlink.indexOf('http')==0 
                && anchorlink.indexOf('https')!=0);
    }
	
	var testAd_yahoo= function(anchorClass,anchorlink) {
           return ( anchorClass=='\"yschttl spt\"' || anchorClass=='yschttl spt');
    }

	var  testAd_aol = function(anchorClass,anchorlink) {
           return (anchorClass=='\"find\"' || anchorClass=='find'
                && anchorlink.indexOf('https')!=0 && anchorlink.indexOf('aol')<0 );
    }
	
	var testAd_bing = function(anchorClass,anchorlink) {
           return ( anchorlink
                && anchorlink.indexOf('http')==0 
                && anchorlink.indexOf('https')!=0 
                && anchorlink.indexOf('msn')<0 
                && anchorlink.indexOf('live')<0 
                && anchorlink.indexOf('bing')<0 
                && anchorlink.indexOf('microsoft')<0
                && anchorlink.indexOf('WindowsLiveTranslator')<0 )    }
	
	var  testAd_baidu = function(anchorClass,anchorlink) {
                       return ( anchorlink
                && anchorlink.indexOf('baidu')<0 
                && anchorlink.indexOf('https')!=0  );
    }
      	
		
	var getButton_google =" var getButton = function(  ) {var button = getElementsByAttrValue(document,'button', 'name', 'btnG' );		if ( !button ) button = getElementsByAttrValue(document,'button', 'name', 'btnK' );return button;}"        
	var getButton_yahoo= " var getButton = function(  ) {return getElementsByAttrValue(document,'input', 'class', 'sbb' ); } "         
	var  getButton_bing= " var getButton = function(  ) {return document.getElementById('sb_form_go');}  "     
	var getButton_aol = " var getButton = function (  ) {return document.getElementById('csbbtn1');   }"
	var getButton_baidu = " var getButton = function (  ){ return getElementsByAttrValue(document,'input', 'value', '????' ); }"  


  
  	SearchBox_google = "var searchbox = function( ) { return getElementsByAttrValue(document,'input', 'name', 'q' ); } "       
	 SearchBox_yahoo = "var searchbox = function(  ) { return document.getElementById('yschsp');}"        
	 SearchBox_bing= "var searchbox = function(  ) {return document.getElementById('sb_form_q'); } "      
	 SearchBox_aol= "var searchbox = function(  ) {return document.getElementById('csbquery1');  }"
	 SearchBox_baidu= "var searchbox = function(  ) {return document.getElementById('kw');}"         
    

    var  suggest_google =  ['gsr' , 'td', function ( elt ) {
            return (elt.hasAttribute('class') && elt.getAttribute('class') == 'gac_c' )
        }]
        
	var suggest_yahoo = ['atgl' , 'a', function ( elt ) {
            return elt.hasAttribute('gossiptext')
        }]
		
    var suggest_bing = ['sa_drw' , 'li', function ( elt ) {
            return (elt.hasAttribute('class') && elt.getAttribute('class') == 'sa_sg' )
        }]
        
	var suggest_baidu = ['st' , 'tr', function ( elt ) {
            return (elt.hasAttribute('class') && elt.getAttribute('class') == 'ml' )
        }]
		
	var suggest_aol = ['ACC' , 'a', function ( elt ) {
            return (elt.hasAttribute('class') && elt.getAttribute('class') == 'acs')
        }]

  	        
																												


var engines = [
		{'id':'google','name':'Google Search', 'urlmap':"https://www.google.com/search?hl=en&q=|", 'regexmap':"^(https?:\/\/[a-z]+\.google\.(co\\.|com\\.)?[a-z]{2,3}\/(search){1}[\?]?.*?[&\?]{1}q=)([^&]*)(.*)$", "host":"(www\.google\.(co\.|com\.)?[a-z]{2,3})$","testad":"var testad = function(ac,al) {return ( al&& (ac=='l'  || ac=='l vst')&& al.indexOf('http')==0 && al.indexOf('https')!=0);}",'box':SearchBox_google,'button':getButton_google} ,
		{'id':'yahoo','name':'Yahoo! Search', 'urlmap':"http://search.yahoo.com/search;_ylt=" +getYahooId()+"?ei=UTF-8&fr=sfp&fr2=sfp&p=|&fspl=1", 'regexmap':"^(http:\/\/[a-z.]*?search\.yahoo\.com\/search.*?p=)([^&]*)(.*)$", "host":"([a-z.]*?search\.yahoo\.com)$","testad":"var testad = function(ac,al) {return ( ac=='\"yschttl spt\"' || ac=='yschttl spt');}",'box':SearchBox_yahoo,'button':getButton_yahoo},
		{'id':'bing','name':'Bing Search', 'urlmap':"http://www.bing.com/search?q=|", 'regexmap':"^(http:\/\/www\.bing\.com\/search\?[^&]*q=)([^&]*)(.*)$", "host":"(www\.bing\.com)$","testad":"var testad = function(ac,al) {return ( al&& al.indexOf('http')==0&& al.indexOf('https')!=0 && al.indexOf('msn')<0 && al.indexOf('live')<0  && al.indexOf('bing')<0&& al.indexOf('microsoft')<0 && al.indexOf('WindowsLiveTranslator')<0 )    }",'box':SearchBox_bing,'button':getButton_bing},
		{'id':'baidu','name':'Baidu Search', 'urlmap':"http://www.baidu.com/s?wd=|", 'regexmap':"^(http:\/\/www\.baidu\.com\/s\?.*?wd=)([^&]*)(.*)$", "host":"(www\.baidu\.com)$","testad":"var testad = function(ac,al) {return ( al&& al.indexOf('baidu')<0 && al.indexOf('https')!=0  );}",'box':SearchBox_baidu,'button':getButton_baidu},
		{'id':'aol','name':'Aol Search', 'urlmap':"http://search.aol.com/aol/search?q=|", 'regexmap':"^(http:\/\/[a-z0-9.]*?search\.aol\.com\/aol\/search\?.*?q=)([^&]*)(.*)$", "host":"([a-z0-9.]*?search\.aol\.com)$","testad":"var testad = function(ac,al){return(ac=='\"find\"'||ac=='find'&& al.indexOf('https')!=0 && al.indexOf('aol')<0 );}",'box':SearchBox_aol,'button':getButton_aol}
	]
	
	
    

    function getEngIndexById( id) {
		 for (var i=0; i< engines.length; i++) {
			if (engines[i].id == id) return i
		}
		return -1
	}
	
	function getEngineById( id) {
		return engines.filter(function(a) {return a.id ==id})[0] 
	}
		 	
    
    var tmn_panel = panels.Panel({
        width:115,
        height:125,
        contentURL: data.url("tmn_menu.html"),
        contentScriptFile: [data.url("jquery.js"),data.url("jquery.watermark.js"),data.url("menu-script.js")],
        onShow: sendOptionParameters
    });
     
    function sendLogToOption() {
        worker_opt.port.emit("TMNSendLogs",{logs:tmnLogs})
    }
	
	function addEngine(param) {
		var name = param.name;
		var urlmap = param.urlmap;
		var new_engine = {}
		new_engine.name = name;
		new_engine.id = name.toLowerCase();
		var map = urlmap.replace('trackmenot','|');
		new_engine.urlmap = map;
		var query_params = map.split('|');
		var kw_param = query_params[0].split('?')[1].split('&').pop();
		new_engine.regexmap = '^('+ map.replace(/\//g,"\\/").replace(/\./g,"\\.").split('?')[0] + "\\?.*?[&\\?]{1}" +kw_param+")([^&]*)(.*)$"
		engines.push(new_engine);
		debug("Added engine : "+ new_engine.name + " url map is " + new_engine.urlmap )
		ss.storage.engines = JSON.stringify(engines) ;
		worker_opt.port.emit("TMNSendEngines",engines);
		sendOptionToTab();
	}
	
	function delEngine(param) {
		var del_engine = param.engine;
		var index = getEngIndexById(del_engine);
		engines.splice(index,1)
		ss.storage.engines = JSON.stringify(engines) ;
		searchEngines = searchEngines.split(',').filter(function(a) {return a!= del_engine}).join(',');
		saveOptions();
		worker_opt.port.emit("TMNSendEngines",engines);
		sendOptionToTab();
	}
	
	
	function sendEnginesToOption() {
        worker_opt.port.emit("TMNSendEngines",engines)
    }
    
    function sendQueriesToOption() {
        var allqueries = "";
        for each( var arr in TMNQueries) {
            if (arr && arr.length) {
                for each (var elt in arr)
                if ( elt&&  elt.words && elt.words.length) allqueries+= elt.words.join(',');
                else allqueries+= elt+",";   
            }
        }
        worker_opt.port.emit("TMNSendQueries",{queries:allqueries})
    }
     
     	       
    var widget = widgets.Widget({
        id: "tmn_widget",
        label: "TMN",
        width: 150,
        contentURL: data.url("tmn_widget.html"),
        contentScriptFile: [data.url("jquery.js"),data.url("widget-script.js")],
        panel: tmn_panel
    });
    
    function sendOptionParameters() {
        debug("Sending perameters")
        var panel_inputs = {"options":getOptions(), "query" : tmn_query, "engine":prev_engine }
        tmn_panel.port.emit("TMNSendOption",panel_inputs) 
        tmn_panel.port.on("TMNOpenOption",openOptionWindow)
        tmn_panel.port.on("TMNSaveOptions",saveOptionFromTab)
    }
    
    function openOptionWindow() {
        tabs.open({
            url: data.url("options.html"),
            onReady:  runScript
        });
    }
    

    sp.on("tmnOptionPref", function() {
      openOptionWindow()
    });
        
    function runScript(tab) {
        worker_opt = tab.attach({
            contentScriptFile: [data.url("jquery.js"),data.url("option-script.js")]
        });
        sendOptionToTab();
        worker_opt.port.on("TMNSaveOptions",saveOptionFromTab)
        worker_opt.port.on("TMNOptionsShowLog", sendLogToOption)
        worker_opt.port.on("TMNOptionsShowQueries", sendQueriesToOption)
        worker_opt.port.on("TMNOptionsClearLog", clearLog)
        worker_opt.port.on("TMNValideFeeds", validateFeeds)
    		worker_opt.port.on("TMNAddEngine",addEngine)
    		worker_opt.port.on("TMNDelEngine",delEngine)
    }
    
    function validateFeeds(param) {
        TMNQueries.rss = [];
        feedList= param.feeds;
        var feeds = feedList.split('|');
        for (var i=0;i<feeds.length;i++)
            doRssFetch(feeds[i]);	
        saveOptions();
    }
	

    function sendOptionToTab() {
        var tab_inputs = {"options":getOptions()}
		sendEnginesToOption();
        worker_opt.port.emit("TMNSetOptionsMenu",tab_inputs)
    }
    function clearLog() {
        tmnLogs = [];
        sendLogToOption();
    }
    
    function saveOptionFromTab(options) {
        if( enabled != options.enabled){
            if (options.enabled) restartTMN();
            else stopTMN();
        }
        debug("useTab: " + options.useTab)
        tmn_timeout = options.timeout;
        searchEngines = options.searchEngines;
        burstEnabled = options.burstMode;
        disableLogs = options.disableLogs;
        saveLogs = options.saveLogs;
        useBlackList = options.use_black_list;
        if ( useDHSList!= options.use_dhs_list) {
            if ( options.use_dhs_list ) {
                readDHSList();
                typeoffeeds.push('dhs');
            } else {
                typeoffeeds.splice(typeoffeeds.indexOf('dhs'),1)
                TMNQueries.dhs = null;
            }
            useDHSList = options.use_dhs_list;
        }
        if ( useNOISE != options.use_noise) {
	  if ( options.use_noise ) {
	    typeoffeeds.push('noise');
	    TMNQueries.noise = [];
	    if (!noise_req) getNOISE();
	  } else {
	    typeoffeeds.splice(typeoffeeds.indexOf('noise'),1)
	    TMNQueries.noise = null;
	  }
	  useNOISE = options.use_noise;
	}
        
        kwBlackList = options.kw_black_list.split(',');
        debug("Searched engines: "+ searchEngines)
        changeTabStatus(options.useTab); 
        saveOptions();
    }
    
    
    function changeTabStatus(useT) {
        if ( useT == useTab) return;
        if ( useT ) {
            useTab  = useT;   
            createTab() ;
        } else {           
            useTab  = useT;   
            deleteTab();
        }          
    } 

    
 
  	 
    function getYahooId() {
        var id = "A0geu";
        while (id.length < 24) {
            var lower = Math.random()< .5;
            var num = parseInt(Math.random()* 38);
            if (num == 37){
                id += '_';
                continue;
            }
            if (num == 36){
                id += '.';
                continue;
            }
            if (num < 10){
                id += String.fromCharCode(num + 48);
                continue;
            }
            num += lower ?  87 : 55;
            id += String.fromCharCode(num);
        }
        //cout("GENERATED ID="+id);
        return id;
    }
      
    function trim(s)  {
        return s.replace(/\n/g,'');
    }
	
    function cerr(msg, e){
        var txt = "[ERROR] "+msg;
        if (e){
            txt += "\n" + e;
            if (e.message)txt+=" | "+e.message;
        } else txt += " / No Exception";
        cout(txt);
    }
	    
    function  cout (msg) {
        console.log(msg);
    } 
    
    function  debug (msg) {
        if (debug_)
            console.log("DEBUG: " +msg);
    }   
    
    function roll(min,max){
        return Math.floor(Math.random()*(max+1))+min;
    }
    
    function randomElt(array) {
		cout("Array length: "+array.length)
        var index = roll(0,array.length-1);
        return array[index]
    }
	

	
    function monitorBurst() {
        pageMod.PageMod({
            //include: /.[a-z]+\.(google|yahoo|bing|baidu)\.(co\\.|com\\.)?[a-z]{2,3}.*/,
            include: ["*"],
            contentScriptFile: data.url("stoping-script.js"),
            contentScriptWhen : stop_when,
            onAttach: function onAttach(worker) {
                if (!worker.tab) return
                var url = worker.tab.url;  
                var result = checkForSearchUrl(url);
                if (!result) {
                    if ( tmn_tab && worker.tab.index == tmn_tab.index) {
                        debug("TMN tab tryign to visit: "+ url)
                        worker.port.emit("TMNStopLoading");	
                    }			
                    return;
                }

                //
                // -- EXTRACT DATA FROM THE URL
                var pre   = result[1];
                var query = result[2];
                var post  = result[3];
                var eng   = result[4];
                var asearch  = pre+'|'+post;
                if (!tmn_tab || worker.tab.index != tmn_tab.index ) {
                    debug("Worker find a match for url: "+ url + " on engine "+ eng +"!")
                    if (burstEnabled)  enterBurst ( eng )
					var engine = getEngineById(eng)
                    if ( engine && engine.urlmap != asearch ) {
                        engine.urlmap = asearch;          
                        ss.storage.engines = JSON.stringify(engines) ;
                        var logEntry = createLog('URLmap', eng, null,null,null, asearch)
                        log(logEntry);
                        debug("Updated url fr search engine "+ eng + ", new url is "+asearch);
                    }
                } 
            }
        }); 
        
    }
    
    function checkForSearchUrl(url) {
        var result = null;
        for (var i=0;i< engines.length; i++){
			var eng = engines[i]
            var regex = eng.regexmap;
            debug("  regex: "+regex+"  ->\n                   "+url);
            result = url.match(regex);
			
            if (result)  {
                cout(regex + " MATCHED! on "+eng.id );
                break; 
            }
        }
        if (!result)return null;
        
        if (result.length !=4 ){
            if (result.length ==6 && eng.id == "google"  ) {
                result.splice(2,2);
                result.push(eng.id);
                return result;
            }
            cout("REGEX_ERROR: "+url);
            /* for (var i in result)
    	        cout(" **** "+i+")"+result[i])*/
        }
        result.push(eng.id);    
        return result;
    }
	
	
    function iniTab(tab) {
        worker_tab = tab.attach({contentScriptFile: search_script});
        tab.on("activate",function() {  
            notifications.notify({
                text: "This tab is used by TrackMeNot to generate fake searches",
                iconURL: data.url("images/skin/tmn_lg.png")
            });
        } )
        worker_tab.port.on("TMNRequest",handleRequest);
        worker_tab.port.on("TMNUpdateURL",updateCurrentURL);
        worker_tab.port.on("close", preserveTMNTab); 
        worker_tab.port.on("TMNSetTabUrl", setTabURL);
		
        tmn_win_id = tab.windowId;
        tmn_tab = tab;
        ss.storage.tmn_tab_id = tmn_tab_id;
    }
  
    function setTabURL(param) {
        cout("Set tmn tab url to: "+ param.url)
        tmn_tab.url = param.url;
    }
  
    function updateTab(tab) {
        worker_tab = tab.attach({
            contentScriptFile: search_script           
        }) 
        tmn_tab = tab;
        worker_tab.port.on("TMNRequest",handleRequest);
        worker_tab.port.on("TMNUpdateURL",updateCurrentURL);
    }
    
    function getTMNTab() {
        debug("Trying to access to the tab: "+tmn_tab)
        if (tmn_tab !=null) return tmn_tab;
        return null;                
    }
    
    function deleteTab() {
        tmn_tab.close();
        tmn_tab = null;
    }
	
    function createTab() {
        if (!useTab) return null;
        if (getTMNTab()!= null) return getTMNTab();
        debug('Creating tab for TrackMeNot')
        try {
            tabs.open({
                url: 'about:blank',
                title: 'tmn_tab',
                inBackground: true,
                onOpen: iniTab,
                onReady : updateTab,
                onClose: preserveTMNTab
            });
        } catch (ex) {
            cerr('Can no create TMN tab:' , ex);
            return null;
        }
        return 1;
    }
	
 

    function isBursting(){
        return burstEnabled && burstCount>0;
    }
	
	
    function chooseEngine( engines)  {
        return engines[Math.floor(Math.random()*engines.length)]
    }
 

  
    function randomQuery()  {
        var qtype = randomElt(typeoffeeds)
        cout(qtype)
        var queries = [];
        if ( qtype != 'zeitgeist' && qtype!='extracted' && qtype !='noise') {
            var queryset = TMNQueries[qtype];
            queries = randomElt(queryset).words;
        } else queries = TMNQueries[qtype];
        var term = randomElt(queries);
        if (!term || trim(term).length<1)
            throw new Error("queryIdx="+queryIdx+" getQuery.term='"+term+"'");
	else {
	    if (qtype == "noise") {
	        TMNQueries.noise.splice(TMNQueries.noise.indexOf(term),1);
	    }
	}
        return trim(term);
    }
    
    function extractQueries(html)    {
        var forbiddenChar = new RegExp("^[ @#<>\"\\\/,;'�{}:?%|\^~`=]", "g");
        var splitRegExp = new RegExp('^[\\[\\]\\(\\)\\"\']', "g");
      
        if (!html) { 
            cout("NO HTML!"); 
            return;
        }
  
        var phrases = new Array();

        // Parse the HTML into phrases
        var l = html.split(/((<\?tr>)|(<br>)|(<\/?p>))/i);
        for (var i = 0;i < l.length; i++) {
            if( !l[i] || l[i] == "undefined") continue;
            l[i] = l[i].replace(/(<([^>]+)>)/ig," ");	       
            //if (/([a-z]+ [a-z]+)/i.test(l[i])) {
            //var reg = /([a-z]{4,} [a-z]{4,} [a-z]{4,} ([a-z]{4,} ?) {0,3})/i;
            var matches = l[i].split(" ");//reg.exec(l[i]);
            if (!matches || matches.length<2) continue;
            var newQuery = trim(matches[1]);
            // if ( phrases.length >0 ) newQuery.unshift(" ");
            if( newQuery && phrases.indexOf(newQuery)<0 )
                phrases.push(newQuery);
        }
        var queryToAdd = phrases.join(" ");
        TMNQueries.extracted = [].concat(TMNQueries.extracted);
        while (TMNQueries.extracted.length > 200 ) {
            var rand = roll(0,TMNQueries.extracted.length-1);
            TMNQueries.extracted.splice(rand , 1);
        }
        cout(TMNQueries.extracted) 
        addQuery(queryToAdd,TMNQueries.extracted);
    }
      
    function isBlackList( term ) {
        if ( !useBlackList ) return false;
        var words = term.split(/\W/g);
        for ( var i=0; i< words.length; i++) {
            if ( kwBlackList.indexOf(words[i].toLowerCase()) >= 0)
                return true;
        }
        return false;
    }
    
    function queryOk(a)    {  
        for ( i = 0;i < skipex.length; i++) {
            if (skipex[i].test(a))
                return false
        }
        return true;
    }
      
    function addQuery(term, queryList) {
        var noniso = new RegExp("[^a-zA-Z0-9_.\ \\u00C0-\\u00FF+]+","g");
           
        term = term.replace(noniso,'') 
        term = trim(term);
           
        if ( isBlackList(term) )
            return false;
           
        if (!term || (term.length<3) || (queryList.indexOf(term) >0) ) 
            return false;
    
        if (term.indexOf("\"\"")>-1 || term.indexOf("--")>-1)
            return false;
    
        // test for negation of a single term (eg '-prison') 
        if (term.indexOf("-")==0 && term.indexOf(" ")<0)
            return false;
    
        if (!queryOk(term)) 
            return false;
    
        queryList.push(term);
        //gtmn._cout("adding("+gtmn._queries.length+"): "+term);
    
        return true;
    }
      
	
    // returns # of keywords added
    function filterKeyWords(rssTitles, feedUrl) {
        var addStr = ""; //tmp-debugging
        var forbiddenChar = new RegExp("[ @#<>\"\\\/,;'�{}:?%|\^~`=]+", "g");
        var splitRegExp = new RegExp('[\\[\\]\\(\\)\\"\']+', "g");          
        var wordArray = rssTitles.split(forbiddenChar);

        for (var i=0; i < wordArray.length; i++)  {
            if ( !wordArray[i].match('-----') ) { 
                var word = wordArray[i].split(splitRegExp)[0];
                if (word && word.length>2) {
                    W: while (i < (wordArray.length)  && wordArray[i+1] && !(wordArray[i+1].match('-----')
                        || wordArray[i+1].match(splitRegExp)))   {
                        var nextWord = wordArray[i+1];   // added new check here -dch
                        if ( nextWord != nextWord.toLowerCase())  {
                            nextWord=trim(nextWord.toLowerCase().replace(/\s/g,'').replace(/[(<>"'�&]/g,''));
                            if (nextWord.length>1)  {
                                word += ' '+nextWord;
                            }
                        }
                        i++;
                    } 
                    word = word.replace(/-----/g,'')
                    addStr += word+", "; //tmp
                }
            }
        }	  
        return addStr;
    }
	        
			
    // returns # of keywords added
    function addRssTitles(xmlData, feedUrl) {
        var rssTitles = ""; 

        if (!xmlData) return 0;  // only for asynchs? -dch

        var feedTitles = xmlData.getElementsByTagName("title");
        if (!feedTitles|| feedTitles.length<2)  {
            cerr("no items("+feedTitles+") for rss-feed: "+feedUrl);
            return 0;
        }         
        var feedObject = {};
        feedObject.name = feedTitles[0].firstChild.nodeValue;
        feedObject.words = [];
        cout('ADD RSS title : '+ feedTitles[0].firstChild.nodeValue);
        for (var i=1; i<feedTitles.length; i++){    
            if ( feedTitles[i].firstChild ) {
                rssTitles = feedTitles[i].firstChild.nodeValue;
                rssTitles += " ----- "; 
            }        
            var queryToAdd = filterKeyWords(rssTitles,  feedUrl);
            addQuery(queryToAdd,feedObject.words); 
        } 
        //cout(feedObject.name + " : " + feedObject.words)
        TMNQueries.rss.push(feedObject);

        return 1;
    }
  
  
    function  readDHSList() {
        TMNQueries.dhs = [];
        var i = 0;
        var req = Request({
            url: data.url("dhs_keywords.json"),
			overrideMimeType: "application/json",
            onComplete: function (response) { 
                if (response.status ==200 ) {
                    var keywords = response.json.keywords;
                    for each(var cat in keywords)   {
                        TMNQueries.dhs[i] = {};
                        TMNQueries.dhs[i].category_name = cat.category_name;
                        TMNQueries.dhs[i].words = [];
                        for each (var word in cat.category_words)
                        TMNQueries.dhs[i].words.push(word.name)
                        i++;
                    }
                    return;
                } else {
                    var logEntry = createLog('error', "Can not load DHS list");
                    log(logEntry);
                }
            }
        });
        req.get();
    }
  
    function getNOISE() {
      if (!TMNQueries.noise) {
	  debug("NOISE disabled");
	  noise_req = null;
	  return;
      } else if (TMNQueries.noise.length < 50) {
        noise_req = Request({
	    url: "http://disman.tl/cgi-bin/noise.fcgi",
	    onComplete: function(resp) {
	        if (resp.status == 200 && resp.text.length < 100) {
		    TMNQueries.noise.push(resp.text);
		    debug("NOISE " + TMNQueries.noise.length + " text: " + resp.text);
		}
		setTimeout(getNOISE,1000);
	    }
	});
        noise_req.get();
      } else {
	setTimeout(getNOISE,10000);
      }
    }
		    
  
    function doRssFetch(feedUrl){		
        if (!feedUrl)  return;
        
        var req = Request({
            url: feedUrl,
            onComplete: function (response) {  
                if (response.status == 200) {
                    //cout(response.text);   
                    var parser = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);
                    var doc = parser.parseFromString(response.text,'text/xml');
                    addRssTitles(doc, feedUrl);
                }  
            }
        });
        req.get();
    }
			
    function getSubQuery(queryWords) {
        var incQuery = "";
        var randomArray = new Array();
        for (var k = 0; k < queryWords.length ; k++) {
            randomIndex = roll(0,queryWords.length-1);
            if ( randomArray.indexOf(randomIndex) < 0)
                randomArray.push(randomIndex);
        }
        randomArray.sort()	
        for ( k = 0; k < randomArray.length-1 && k < 5; k++) {
            incQuery += queryWords[randomArray[k]]+' ';
        }	
        incQuery += queryWords[randomArray[k]];
        if (incQueries)
            incQueries.push(trim(incQuery));
    }
					
			
    function getQuery() {		
        var term = randomQuery();		
        if (term.indexOf('\n') > 0) { // yuck, replace w' chomp(); 
            while (true) {
                for (var i = 0;i < term.length; i++) {
                    if (term.charAt(i)=='\n') {
                        term = term.substring(0,i)+' '+term.substring(i+1,term.length);
                        continue;
                    }
                }
                break;
            }
        }
        return term;
    }
	
    function updateIcon (url)    {
        var Uri = new URL(url);
        var iconURL = "http://" + Uri.host +"/favicon.ico";
        widget.port.emit("UpdateIcon", iconURL)
    }	
	
    function createLog(type,engine,mode,query,id,asearch) {
        var logEntry = {  'type' : type, "engine" : engine };
        if (mode) logEntry.mode =tmn_mode
        if (query)  logEntry.query = query
        if (id)  logEntry.id = id
        if (asearch) logEntry.newUrl =  asearch		 
        return logEntry;
    }
      
    
    function updateOnErr() {
        widget.label  = 'Error'
        widget.tooltip =  'TMN Error'       
        widget.port.emit("UpdateText", 'TMN Error')
    }
    	
    function updateOnSend ( queryToSend ) {
        tmn_query = queryToSend;
        widget.label  = queryToSend
        widget.tooltip =  engine+" '"+queryToSend+"'"  
        if (!burstEnabled || burstCount == 0)    
            widget.port.emit("UpdateText", " TMN: '"+queryToSend+"'") 
        else 
            widget.port.emit("UpdateText", " TMN (" + burstCount +"): '"+queryToSend+"'")   
    }           
  
    function doSearch(){               
        var newquery = getQuery();	  	  
        try { 
            if (incQueries && incQueries.length > 0)
                sendQuery(null);
            else {
                newquery = getQuery();     
                /*queryWords = newquery.split(' ');
                if (queryWords.length > 3 )   {
                    getSubQuery(queryWords);
                    if (useIncrementals)   {
                        var unsatisfiedNumber = roll(1,4);
                        for (var n = 0; n < unsatisfiedNumber-1; n++)
                            getSubQuery(queryWords);
                    }	
                    // not sure what is going on here? -dch
                    if (incQueries && incQueries.length > 0)
                        newquery = incQueries.pop();
                }*/
                sendQuery(newquery);
            }
        } catch (e) {
            cerr("error in doSearch",e);
        }	  
    }
    
    
    function sendQuery(queryToSend)  { 
        tmn_scheduledSearch = false;
        var url =  getEngineById(engine).urlmap;
        var isIncr = (queryToSend == null);
        if (queryToSend == null){ 
            if (incQueries && incQueries.length > 0) 
                queryToSend = incQueries.pop();
            else  {
                if (!queryToSend) cout('sendQuery error! queryToSendis null')
                return;
            }
        } else
	  debug("queryToSend: " + queryToSend);
        if (Math.random() < 0.9) queryToSend = queryToSend.toLowerCase();
        if (queryToSend[0]==' ' ) queryToSend = queryToSend.substr(1); //remove the first space ;
        updateIcon(url)
        if ( useTab ) {  
            if (  getTMNTab() == null ) createTab();   
            var TMNReq = {
                tmnQuery: queryToSend, 
                tmnEngine: getEngineById(engine),
				allEngines: engines,				
                tmnUrlMap: url,
                tmnMode: tmn_mode, 
                tmnID : tmn_id++ 
            }
            debug('Sending messaget to the tab '); 
            try {
                worker_tab.port.emit("TMNTabRequest", TMNReq)	;
                debug('Message sent to the tab'); 
            } catch(ex) {
                cout("Error : "+ex)
                cout("Creating a new tab")
                deleteTab();
                timer.setTimeout(function() {worker_tab.port.emit("TMNTabRequest", TMNReq)},1000)	;
            }
 
        } else { 

            var queryURL = queryToURL(url ,queryToSend);
            debug("The encoded URL is " + queryURL)
			
            updateOnSend(queryToSend)                  
            var req = Request({
                url: queryURL,
                onComplete: function (response) { 
                    timer.clearTimeout(tmn_errTimeout);
                    if (response.status >= 200 && response.status<400) {
                        timer.clearTimeout(tmn_errTimeout);
                        reschedule();
                        var logEntry = createLog('query', engine, tmn_mode,  queryToSend, tmn_id++);
                        extractQueries(response.text);
                    } else {
                        var logEntry = createLog('error', engine, tmn_mode,  queryToSend, tmn_id);
                        rescheduleOnError(); 
                    }
                    log(logEntry);
                }
            });
            
            req.get();
            debug("Querry sent to :"+queryURL)
            currentTMNURL = queryURL;
        }
    }
    
    
    function queryToURL ( url, query) {
        if (Math.random() < 0.9)
            query = query.toLowerCase();
        var urlQuery = url.replace('|',query);
        urlQuery = urlQuery.replace(/ /g,'+');
        var encodedUrl = encodeURI(urlQuery);
        encodedUrl = encodedUrl.replace(/%253/g,"%3"); 
        
        return encodedUrl;
    }

    function updateCurrentURL(taburl) {		  
        currentTMNURL = taburl.url;  
        debug("currentTMNURL is :"+currentTMNURL)     
    }


	
    function rescheduleOnError () {
        var pauseAfterError = Math.max(2*tmn_timeout, 60000);
        tmn_mode = 'recovery';
        burstCount=0;
        cout("[INFO] Trying again in "+(pauseAfterError/1000)+ "s")
        log({
            'type' : 'ERROR' , 
            'message': 'next search in '+(pauseAfterError/1000)+ "s", 
            'engine':engine
        });
        updateOnErr();
	        
        // reschedule after long pause
        if (enabled )
            scheduleNextSearch(pauseAfterError);            
        return false;
    }
	       
    function reschedule() {
        var delay =  tmn_timeout;	  
         
        if(tmn_scheduledSearch) return; 
        else tmn_scheduledSearch = true;
                        
        if (isBursting())  { // schedule for burs 
            delay = Math.min(delay,burstTimeout);
            scheduleNextSearch(delay);
            tmn_mode = 'burst';
            burstCount--;
        } else  { // Not bursting, schedule per usual
            tmn_mode = 'timed';
            scheduleNextSearch(delay);
        }
    }
	
    function scheduleNextSearch(delay) {  
        if (!enabled) return;    
        if (delay > 0) {
            if (!isBursting()) { // randomize to approach target frequency
                var offset = delay*(Math.random()/2);
                delay = parseInt(delay) + offset;
            } else  { // just simple randomize during a burst           
                delay += delay*(Math.random()-.5);
            }
        }
        if (isBursting())   engine = burstEngine;
        else engine = chooseEngine(searchEngines.split(',')); 		     
        debug('NextSearchScheduled on: '+engine);
        tmn_errTimeout = timer.setTimeout(rescheduleOnError, delay*3);
        tmn_searchTimer = timer.setTimeout(doSearch, delay);
    }
	  
    function enterBurst ( burst_engine ) {
        if (!burstEnabled) return;
        cout("Entering burst mode for engine: "+burst_engine)
        var logMessage = {
            'type':'info', 
            'message':'User made a search, start burst', 
            'engine':burst_engine
        } ;
        log(logMessage);
        burstEngine = burst_engine;
        burstCount = roll(3,10);   
    }
	  
    function deleteTabWithUrl(tabURL) {
        for each (var tab in tabs)
        if (tab.url == tabURL) {
            tab.close();
            return;
        }
    }
    
    
    function saveOptions() {
        //ss.storage.kw_black_list = kwBlackList.join(",");
        var options = getOptions();	
        ss.storage.options_tmn = JSON.stringify(options);	
        ss.storage.tmn_id = tmn_id;
        ss.storage.gen_queries = JSON.stringify(TMNQueries);
        
    }
	
	

        
    function getOptions() {
        var options = {};
        options.enabled = enabled;
        options.timeout = tmn_timeout;
        options.searchEngines = searchEngines;	
        options.useTab = useTab;
        options.burstMode = burstEnabled;
        options.feedList = feedList;
        options.use_black_list = useBlackList;
        options.use_dhs_list = useDHSList;
	options.use_noise = useNOISE;
        options.kw_black_list = kwBlackList.join(",");
        options.saveLogs= saveLogs;
        options.disableLogs = disableLogs;
        return options;
    }
      

    function initOptions() {
        enabled = true;
        timeout = 6000;
        burstMode = true;
        searchEngines = "google,yahoo,bing";
        useTab = false; 
        useBlackList = true;
        useDHSList = false;
	useNOISE = true;
        kwBlackList= ['porn', 'pornographie']; 
        saveLogs =  true;
        disableLogs  = false;
    }
	  
    function restoreOptions () {
        if (!ss.storage.options_tmn) {
            initOptions();
            cout("Init: "+ enabled)
            return;
        }
  
        try {
            var options = JSON.parse(ss.storage.options_tmn);
            enabled = options.enabled;
            debug("Restore: "+ enabled)
            useBlackList = options.use_black_list;
            useDHSList = options.use_dhs_list;
	    useNOISE = options.use_noise;
            tmn_timeout = options.timeout;
            burstEnabled = options.burstMode;
            searchEngines = options.searchEngines;
            disableLogs = options.disableLogs;
            saveLogs =  options.saveLogs;
            useTab  = options.useTab;
            if (ss.storage.gen_queries) TMNQueries = JSON.parse(ss.storage.gen_queries);
            feedList = options.feedList;
            if (ss.storage.tmn_id) tmn_id = ss.storage.tmn_id;
            if (ss.storage.logs_tmn) tmnLogs =  JSON.parse( ss.storage.logs_tmn );
            if (ss.storage.engines) engines = JSON.parse( ss.storage.engines);
            if (ss.storage.last_tmn_url && ss.storage.last_tmn_url != '' ) deleteTabWithUrl( ss.storage.last_tmn_url);
            if (options.kw_black_list && opions.kw_black_list.length > 0)  kwBlackList = options.kw_black_list.split(",");   
        } catch (ex) {
            cout('No option recorded: '+ex)	
        }
    }
	  

    function toggleTMN() {
        enabled = !enabled
        return enabled;                       
    }
    
    function restartTMN() {
        createTab(); 
        enabled = true;          
        widget.label  = 'On'
        widget.tooltip =  'On' 
        widget.port.emit("UpdateText", 'TMN: On')  
        scheduleNextSearch(4000);
    }
    
        
    function stopTMN () {    
        enabled = false;  
        saveOptions();
  		
        if ( useTab ) deleteTab(); 
        widget.label  = 'Off'
        widget.tooltip =  'Off' 
        widget.port.emit("UpdateText", 'TMN: Off')  
        timer.clearTimeout(tmn_searchTimer);
        timer.clearTimeout(tmn_errTimeout);
    }
 
    function preserveTMNTab() {
        if ( useTab && enabled) {
            tmn_tab = null;
            cout('TMN tab has been deleted by the user, reload it');
            createTab();
            return;  
        }
    }
    function formatNum ( val) {
        if (val < 10) return '0'+val;
        return val   
    }
    
    function _readPrefs()    {
        options.timeout = prefs.get(branch+"timeout");  
        options.enabled = prefs.get(branch+"enabled");  
        options.disableLogs = prefs.get(branch+"logDisabled");  
        options.saveLogs = prefs.get(branch+"logPreserved");  
        options.burstMode = prefs.get(branch+"burstEnabled");  
        options.searchEngines = prefs.get(branch+"searchEngines");  
  
        var rssFeeds = prefs.get(branch+"rssFeedList");
        if (rssFeeds && rssFeeds.length>0)  
          options.feedList = rssFeeds;        
	  }
    
    function addTMNContentHandler() {
	      		var i = 0;
	      		var prefBranch = null;
	      		while (true) {
	      		try {
	      			if( prefs.get("browser.contentHandlers.types." + i + ".title") == "TrackMeNot")
	      					return
	      			i++;
	      			} catch (e) {	
	      			if (prefs) {
	      				prefs.set("browser.contentHandlers.types."+i+".title", "TrackMeNot");
	      				prefs.set("browser.contentHandlers.types."+i+".type", "application/vnd.mozilla.maybe.feed");
	      				prefs.set("browser.contentHandlers.types."+i+".uri", "chrome://trackmenot/content/tmn_feed.html?tmn_feed=%s");
	      			}
              }
	      		}	
		} 
    		
    function log (entry) {
        if (disableLogs) return;
        try  {
            if (entry != null)  {
                if (entry.type== 'query') {
                    if( entry.id && entry.id==tmn_logged_id) return;
                    tmn_logged_id = entry.id;
                }
                var now = new Date();
                entry.date = formatNum(now.getHours())+":"+ formatNum(now.getMinutes())+":"+ formatNum(now.getSeconds())+
                    '   '+(now.getMonth()+1) + '/' + now.getDate()+ '/' + now.getFullYear() ;
            }
        }
        catch(ex){
            cout("[ERROR] "+ ex +" / "+ ex.message +  "\nlogging msg");
        }
        tmnLogs.unshift(entry);
        ss.storage.logs_tmn = JSON.stringify(tmnLogs);
    }

    function sendClickEvent() {
        try {
            worker_tab.port.emit("TMNClickResult",{"tmn_engine":getEngineById(prev_engine)});
        }catch(ex){
            cout(ex)
        }
    }
      
    function handleRequest(request, sender, sendResponse) {
        if (request.tmnLog) {
            debug("Background logging : " + request.tmnLog);
            var logtext = JSON.parse(request.tmnLog);
            log(logtext);
            return;   
        } 
        if (request.updateStatus) {
            updateOnSend(request.updateStatus);
            return;
        }
        

    
        debug( "Recieved message: "+ request.tmn)  
        switch (request.tmn) {
            case "pageLoaded": //Remove timer and then reschedule;  
                prev_engine = engine;       
                timer.clearTimeout(tmn_errTimeout);
                if (Math.random() < 0.3) {
                    var time = roll(1000, 5000)              
                    timer.setTimeout(sendClickEvent , time);
                }
                reschedule();
                var html = request.html;
                extractQueries(html);
                break;
            default:
    }
} 
       
	
return {

  
    startTMN : function () {    
        restoreOptions();
        
        typeoffeeds.push('zeitgeist');
        TMNQueries.zeitgeist = zeitgeist;
        
        if (TMNQueries.extracted && TMNQueries.extracted.length >0) {
            typeoffeeds.push('extracted');       
        }
        
        if (!load_full_pages) stop_when = "start"
        else stop_when = "end"

        
        typeoffeeds.push('rss');
        TMNQueries.rss = [];  
        var feeds = feedList.split('|');
        for (var i=0;i<feeds.length;i++)
            doRssFetch(feeds[i]);

        if ( useDHSList ) {
            readDHSList();
            typeoffeeds.push('dhs');
        }
        
        if ( useNOISE ) {
	    typeoffeeds.push('noise');
	    TMNQueries.noise = [];
	    getNOISE();
	}
        
        var engines = searchEngines.split(',');           
        engine = chooseEngine(engines);
        monitorBurst();

	  
        if (enabled) {           
            widget.label  = 'On'
            widget.tooltip =  'On';
            widget.port.emit("UpdateText", 'TMN: On')    
            createTab(); 
            scheduleNextSearch(4000);
        } else {
            widget.label  = 'Off'
            widget.tooltip =  'Off' 
            widget.port.emit("UpdateText", 'TMN: Off')     
        }
        
        windows.on('close',function() {
            deleteTab();
            if (!saveLogs) 
                ss.storage.logs_tmn = "";
        });
	  
    },

   
 
  
}
  
}();

TRACKMENOT.TMNSearch.startTMN()

