
var TIMEOUT = {timeout: 10.0};
var ACTION_INFO = 'https://raw.githubusercontent.com/prenagha/launchbar/master/Forecast.lbaction/Contents/Info.plist';
var LB_INFO = 'http://sw-update.obdev.at/update-feeds/launchbar-6.plist';
var LB_DOWNLOAD = 'http://www.obdev.at/products/launchbar/download.html';
var ALERT_ICON = '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns';
var CAUTION = 'Caution.icns';
var CHECK = "GreenCheckmark.tiff";

function run(arg) {
  var items = [];
  var good = [];
  var bad = [];
  var error = [];
  loadResult(items, good, bad, error, checkLaunchBar());

  var downloadDir = LaunchBar.homeDirectory + "/Downloads";
  if (Action.preferences.DownloadDir) {
    if (Action.preferences.DownloadDir == "SKIP") {
      downloadDir = "";
    } else {
      downloadDir = Action.preferences.DownloadDir;
    }
  }
  if (downloadDir != "") {
    if (File.exists(downloadDir) 
     && File.isDirectory(downloadDir) 
     && File.isWritable(downloadDir)) {
     LaunchBar.debugLog("Download dir " + downloadDir);
    } else {
      error.push({'title': 'Download dir not accessible'
        ,'subtitle':downloadDir
        ,'alwaysShowsSubtitle': true
        ,'icon':ALERT_ICON});
      downloadDir = "";
    }
  }
    
  var actionsDir = LaunchBar.homeDirectory + "/Library/Application Support/LaunchBar/Actions";  
  if (Action.preferences.ActionsDir)
    actionsDir = Action.preferences.ActionsDir;

  if (File.exists(actionsDir)
   && File.isDirectory(actionsDir) 
   && File.isReadable(actionsDir)) {
    LaunchBar.debugLog('Actions dir ' + actionsDir);
    var actions = File.getDirectoryContents(actionsDir);
    actions.forEach(function(actionPackage) {
      loadResult(items, good, bad, error, checkAction(actionsDir, actionPackage, downloadDir));
    });
  } else {
    error.push({'title': 'Actions dir not accessible'
      ,'subtitle':actionsDir
      ,'alwaysShowsSubtitle': true
      ,'icon':ALERT_ICON});
  }

  items.push({'title': 'Error', badge: ""+error.length, icon:ALERT_ICON, children: error});
  items.push({'title': 'Newer versions available', badge: ""+bad.length, icon:CAUTION, children: bad});
  items.push({'title': 'Up to date', badge: ""+good.length, icon:CHECK, children: good});
  return items;
}

function loadResult(items, good, bad, error, item) {
  if (!item || !item.title)
    return;
  if (item.icon && item.icon == CHECK) {
    good.push(item);
    return;
  }
  if (item.icon && item.icon == CAUTION) {
    bad.push(item);
    return;
  }
  if (item.icon && item.icon == ALERT_ICON) {
    error.push(item);
    return;
  }
  items.push(item);
}

function checkAction(actionsDir, actionPackage, downloadDir) {
  LaunchBar.debugLog("Checking action " + actionPackage);
  if (!actionPackage || !actionPackage.endsWith(".lbaction"))
    return;
  var plistFile = actionsDir + "/" + actionPackage + "/Contents/Info.plist";
  if (!File.exists(plistFile)) {
    return {'title': actionPackage + ': Error Info.plist does not exist'
      ,'subtitle':plistFile
      ,'alwaysShowsSubtitle': true
      ,'path':actionsDir + "/" + actionPackage
      ,'icon':ALERT_ICON};
  }
  if (!File.isReadable(plistFile)) {
    return {'title': actionPackage + ': Error Info.plist not readable'
      ,'subtitle':plistFile
      ,'alwaysShowsSubtitle': true
      ,'path':actionsDir + "/" + actionPackage
      ,'icon':ALERT_ICON};
  }
    
  var plist = File.readPlist(plistFile);
  var updateURL = getUpdateURL(actionPackage, plist);
  if (updateURL == "SKIP") {
    LaunchBar.debugLog("Skipping " + actionPackage);
    return {};
  }
  if (!updateURL || !updateURL.startsWith('http')) {
    return {'title': plist.CFBundleName + ': Update URL missing'
      ,'subtitle': updateURL
      ,'alwaysShowsSubtitle':true
      ,'icon':ALERT_ICON
      ,'path':actionsDir + "/" + actionPackage
      ,'url':plist.LBDescription.LBWebsite};
  }

  updateURL = encodeURI(updateURL);
  LaunchBar.debugLog(actionPackage + ' URL ' + updateURL);

  var result = {};
  try {  
    result = HTTP.getPlist(updateURL, TIMEOUT);
  } catch (exception) {
    LaunchBar.log('Error ' + actionPackage + ' -- ' + exception);
    return {'title':plist.CFBundleName + ': HTTP Error remote plist ' + exception
      ,'subtitle':updateURL
      ,'alwaysShowsSubtitle': true
      ,'icon':ALERT_ICON
      ,'path':actionsDir + "/" + actionPackage
      ,'url':updateURL};
  }

  if (!result) {
    return {'title': plist.CFBundleName + ': Error remote plist empty result'
      ,'subtitle':updateURL
      ,'alwaysShowsSubtitle': true
      ,'icon':ALERT_ICON
      ,'path':actionsDir + "/" + actionPackage
      ,'url':updateURL};
  }
  if (result.error) {
    return {'title': plist.CFBundleName + ': Error result remote plist ' + result.error
      ,'subtitle': result.error 
        + (result.response && result.response.status ? " -- " + result.response.status : "")
        + (result.response && result.response.localizedStatus ? " --  " + result.response.localizedStatus : "")
      ,'alwaysShowsSubtitle': true
      ,'icon':ALERT_ICON
      ,'path':actionsDir + "/" + actionPackage
      ,'url':updateURL};
  }
  if (!result.data || result.data.length < 1) {
    return {'title': plist.CFBundleName + ': Error remote plist empty data'
      ,'subtitle': updateURL
      ,'alwaysShowsSubtitle': true
      ,'icon':ALERT_ICON
      ,'path':actionsDir + "/" + actionPackage
      ,'url':updateURL};
  }
    
  if (plist.CFBundleVersion != result.data.CFBundleVersion) {
  
    var downloadMsg = "";
    var downloadFile = "";
    if (downloadDir != ""
     && result.data.LBDescription
     && result.data.LBDescription.LBDownload
     && result.data.LBDescription.LBDownload.startsWith('http')) {
      var downloadURL = encodeURI(result.data.LBDescription.LBDownload);
      LaunchBar.debugLog('Download ' + actionPackage + ' from ' + downloadURL);
      var d = HTTP.getData(downloadURL);
      if (d.response.status == 200 && d.data != undefined) {
        var ver = result.data.CFBundleVersion.replace(/[^a-zA-Z0-9]/g,'_');
        var parts = downloadURL.split('/');
        var last = parts[parts.length-1].replace(/\?.*$/,'');
        downloadFile = downloadDir + '/' + ver + '_' + last;
        LaunchBar.debugLog("Write download to " + downloadFile);
        File.writeData(d.data, downloadFile);
      } else if (d.error != undefined) {
        downloadMsg = 'Unable to download ' + d.error + ' -- ' + downloadURL;
      } else {
        downloadMsg = 'Unable to download ' + d.response.localizedStatus + ' -- ' + downloadURL;
      }
    }
  
    return {'title': plist.CFBundleName + ': Newer version '
        + (downloadFile == '' ? 'available' : 'downloaded')
        + (downloadMsg = '' ? '': ' ' + downloadMsg)
        +  '   ' + plist.CFBundleVersion + ' ➔ ' + result.data.CFBundleVersion
      ,'icon':CAUTION
      ,'path': (downloadFile = '' ? null : downloadFile)
      ,'url': plist.LBDescription.LBWebsite
      };
  } else {
    return {'title': plist.CFBundleName + ': up to date'
      ,'badge' : plist.CFBundleVersion
      ,'icon': CHECK
      ,'url':plist.LBDescription.LBWebsite};
  }
  
  return [];
}

function getUpdateURL(actionPackage, plist) {
  if (Action.preferences
   && Action.preferences.LBUpdate
   && Action.preferences.LBUpdate[plist.CFBundleIdentifier] 
   && Action.preferences.LBUpdate[plist.CFBundleIdentifier] == "SKIP")
    return "SKIP";

  if (Action.preferences
   && Action.preferences.LBUpdate
   && Action.preferences.LBUpdate[plist.CFBundleIdentifier] 
   && Action.preferences.LBUpdate[plist.CFBundleIdentifier].startsWith('http'))
    return Action.preferences.LBUpdate[plist.CFBundleIdentifier];

  if (plist.LBDescription
   && plist.LBDescription.LBUpdate
   && plist.LBDescription.LBUpdate.startsWith('http'))
    return plist.LBDescription.LBUpdate;
    
  return "";
}

function checkLaunchBar() {
  try {
    var result = HTTP.getPlist(LB_INFO, TIMEOUT);
    if (!result) {
      return {'title':'Error checking LaunchBar version - empty result'
        ,'subtitle':'Empty Plist result from ' + LB_INFO
        ,'alwaysShowsSubtitle': true
        ,'icon':ALERT_ICON
        ,'quickLookURL':LB_INFO
        ,'url':LB_INFO};
    }
    if (result.error) {
      return {'title':'Error checking LaunchBar version - ' + result.error
        ,'subtitle':result.error
        ,'alwaysShowsSubtitle': true
        ,'icon':ALERT_ICON
        ,'quickLookURL':LB_INFO
        ,'url':LB_INFO};
    }
    if (!result.data || result.data.length < 1) {
      return {'title':'Error checking LaunchBar version - empty data'
        ,'subtitle':'Empty Plist result data from ' + LB_INFO
        ,'alwaysShowsSubtitle': true
        ,'icon':ALERT_ICON
        ,'quickLookURL':LB_INFO
        ,'url':LB_INFO};
    }
    if (result.data[0].BundleVersion && result.data[0].BundleVersion != LaunchBar.version) {
      return {'title':'LaunchBar: Newer version available   ' 
          + LaunchBar.shortVersion + ' ➔ ' + result.data[0].BundleShortVersionString
        ,'quickLookURL':LB_DOWNLOAD
        ,'icon':CAUTION
        ,'url':LB_DOWNLOAD};
    } else {
      return {'title':'LaunchBar: up to date'
        ,'badge': LaunchBar.shortVersion
        ,'quickLookURL':LB_DOWNLOAD
        ,'icon':CHECK
        ,'url':LB_DOWNLOAD};
    }
  } catch (exception) {
    LaunchBar.log('Error checkLaunchBar ' + exception);
    return {'title':'HTTP Error checking LaunchBar version'
      ,'subtitle':exception
      ,'alwaysShowsSubtitle': true
      ,'icon':ALERT_ICON
      ,'url':LB_INFO};
  }
  return {};
}

function getUpdatePlist(updateURL) {
  var items = [];
  try {
    var result = HTTP.getPlist(updateURL, TIMEOUT);
    if (result && result.data) {
      if (result.data.CFBundleVersion > Action.version) {
        items.push({'title':'Newer version of Forecast action is available'
          ,'subtitle':'Newest is ' + result.data.CFBundleVersion 
            + ' you have ' + Action.version
          ,'icon':'Sun-Low.png'
          ,'url':'https://github.com/prenagha/launchbar/'});
      } else {
        items.push({'title':'Forecast action is up to date'
          ,'subtitle':'Newest is ' + result.data.CFBundleVersion 
            + ' you have ' + Action.version
          ,'icon':'Sun-Low.png'
          ,'url':'https://github.com/prenagha/launchbar/'});
      }
    } else if (result && result.error != undefined) {
      items.push({'title':'Error checking Forecast action version - ' + result.error
        ,'subtitle':result.error
        ,'icon':ALERT_ICON
        ,'url':ACTION_INFO});
    }
  } catch (exception) {
    LaunchBar.log('Error checkVersion ' + exception);
    LaunchBar.alert('Error checkVersion', exception);
  }

  return items;
}
