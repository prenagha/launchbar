
var TIMEOUT = {timeout: 10.0};
var ACTION_INFO = 'https://raw.githubusercontent.com/prenagha/launchbar/master/Forecast.lbaction/Contents/Info.plist';
var LB_INFO = 'http://sw-update.obdev.at/update-feeds/launchbar-6.plist';
var LB_DOWNLOAD = 'http://www.obdev.at/products/launchbar/download.html';
var ALERT_ICON = '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns';
var CAUTION = 'Caution.icns';
var CHECK = "GreenCheckmark.tiff";

function setup() {
  if (Action.preferences.ActionsDir)
    return;
  // load up an initial preferences object with defaults if first time run
  Action.preferences.ActionsDir = LaunchBar.homeDirectory + "/Library/Application Support/LaunchBar/Actions";
  var urls = {"com.example.action1": "https://example.com/action1.lbaction"
    , "com.example.action2": "SKIP" };
  Action.preferences.LBUpdate = urls;
}

function run(arg) {
  setup();
  var actionsDir = Action.preferences.ActionsDir;
  
  var items = [];
  var good = [];
  var bad = [];
  var error = [];
  loadResult(items, good, bad, error, checkLaunchBar());
    
  if (File.exists(actionsDir)
   && File.isDirectory(actionsDir) 
   && File.isReadable(actionsDir)) {
    LaunchBar.debugLog('Actions dir ' + actionsDir);
    var actions = File.getDirectoryContents(actionsDir);
    actions.forEach(function(actionPackage) {
      loadResult(items, good, bad, error, checkAction(actionsDir, actionPackage));
    });
  } else {
    error.push({'title': 'Actions dir not accessible'
      ,'subtitle':actionsDir
      ,'alwaysShowsSubtitle': true
      ,'icon':ALERT_ICON});
  }

  error.push({'title': 'Edit Preferences', icon: "Pref_Advanced.icns", action: "editPref"});
  items.push({'title': 'Error', badge: ""+(error.length-1), icon:ALERT_ICON, children: error});
  items.push({'title': 'Newer versions available', badge: ""+bad.length, icon:CAUTION, children: bad});
  items.push({'title': 'Up to date', badge: ""+good.length, icon:CHECK, children: good});
  
  return items;
}

function editPref() {
  LaunchBar.openURL('file://' + encodeURI(Action.supportPath + '/Preferences.plist'));
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

function checkAction(actionsDir, actionPackage) {
  LaunchBar.debugLog("Checking action " + actionPackage);
  var actionFile = actionsDir + "/" + actionPackage;
  if (!actionPackage 
   || typeof(actionPackage) != "string"
   || !actionPackage.endsWith(".lbaction"))
    return;
  var plistFile = actionsDir + "/" + actionPackage + "/Contents/Info.plist";
  if (!File.exists(plistFile)) {
    return {'title': actionPackage + ': Error local Info.plist does not exist ' + plistFile
      ,'path':actionFile
      ,'icon':ALERT_ICON};
  }
  if (!File.isReadable(plistFile)) {
    return {'title': actionPackage + ': Error local Info.plist not readable ' + plistFile
      ,'path':actionFile
      ,'icon':ALERT_ICON};
  }
    
  var plist = File.readPlist(plistFile);
  var updateURL = getUpdateURL(actionPackage, plist);
  if (updateURL == "SKIP") {
    LaunchBar.debugLog("Skipping " + actionPackage);
    return {};
  }
  if (!updateURL || !updateURL.startsWith('http')) {
    return {'title': plist.CFBundleName + ': Update URL missing ' + updateURL
      ,'icon':ALERT_ICON
      ,'path':actionFile
      ,'url':plist.LBDescription.LBWebsite};
  }

  updateURL = encodeURI(updateURL);
  LaunchBar.debugLog(actionPackage + ' URL ' + updateURL);

  var result = {};
  try {  
    result = HTTP.getPlist(updateURL, TIMEOUT);
  } catch (exception) {
    LaunchBar.log('Error ' + actionPackage + ' -- ' + exception);
    return {'title':plist.CFBundleName + ': HTTP Error remote plist ' + exception + ' -- ' + updateURL
      ,'icon':ALERT_ICON
      ,'path':actionFile
      ,'url':updateURL};
  }

  if (!result) {
    return {'title': plist.CFBundleName + ': Error remote plist empty result -- ' + updateURL
      ,'icon':ALERT_ICON
      ,'path':actionFile
      ,'url':updateURL};
  }
  if (result.error) {
    return {'title': plist.CFBundleName + ': Error result remote plist ' + result.error
        + (result.response && result.response.status ? " -- " + result.response.status : "")
        + (result.response && result.response.localizedStatus ? " --  " + result.response.localizedStatus : "")
      ,'icon':ALERT_ICON
      ,'path':actionFile
      ,'url':updateURL};
  }
  if (!result.data || result.data.length < 1) {
    return {'title': plist.CFBundleName + ': Error remote plist empty data ' + updateURL
      ,'icon':ALERT_ICON
      ,'path':actionFile
      ,'url':updateURL};
  }
    
  if (plist.CFBundleVersion != result.data.CFBundleVersion) {
    return {'title': plist.CFBundleName + ': Newer version available'
        +  '   ' + plist.CFBundleVersion + ' ➔ ' + result.data.CFBundleVersion
      ,'icon':CAUTION
      ,children: getActionChildren(actionFile, plist, result.data)};
  } else {
    return {'title': plist.CFBundleName + ': up to date'
      ,'badge' : plist.CFBundleVersion
      ,'icon': CHECK
      ,children: getActionChildren(actionFile, plist, result.data)};
  }
  
  return [];
}

function getActionChildren(actionFile, currPlist, plist) {
  var items = [];
  if (plist.LBDescription && plist.LBDescription.LBWebsite) {
    items.push({'title': 'Open ' + plist.CFBundleName + ' web site'
      ,'subtitle':plist.LBDescription.LBWebsite
      ,'icon':'com.apple.Safari'
      ,'url': plist.LBDescription.LBWebsite});
  }
  if (plist.LBDescription && plist.LBDescription.LBChangelog && plist.LBDescription.LBChangelog.startsWith('http')) {
    items.push({'title': 'Open version ' + plist.CFBundleVersion + ' change log'
      ,'subtitle':plist.LBDescription.LBChangelog
      ,'icon':'Text.icns'
      ,'url': plist.LBDescription.LBChangelog});
  }
  if (plist.LBDescription && plist.LBDescription.LBChangelog && !plist.LBDescription.LBChangelog.startsWith('http')) {
    var changes = [{title: plist.LBDescription.LBChangelog, icon:'Text.icns'}];
    items.push({'title': 'Version ' + plist.CFBundleVersion + ' change log'
      ,'icon':'Text.icns'
      ,'children': changes});
  }
  if (plist.LBDescription && plist.LBDescription.LBDownload) {
    items.push({'title': 'Download version ' + plist.CFBundleVersion
      ,'subtitle':plist.LBDescription.LBDownload
      ,'icon':'Pref_SoftwareUpdate.icns'
      ,'url': plist.LBDescription.LBDownload});
  }
  items.push({'title': 'Installed version ' + currPlist.CFBundleVersion
    ,'subtitle':actionFile
    ,'path': actionFile});
  return items;
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
        ,'url':LB_INFO};
    }
    if (result.error) {
      return {'title':'Error checking LaunchBar version - ' + result.error
        ,'subtitle':result.error
        ,'alwaysShowsSubtitle': true
        ,'icon':ALERT_ICON
        ,'url':LB_INFO};
    }
    if (!result.data || result.data.length < 1) {
      return {'title':'Error checking LaunchBar version - empty data'
        ,'subtitle':'Empty Plist result data from ' + LB_INFO
        ,'alwaysShowsSubtitle': true
        ,'icon':ALERT_ICON
        ,'url':LB_INFO};
    }
    if (result.data[0].BundleVersion && result.data[0].BundleVersion != LaunchBar.version) {
      return {'title':'LaunchBar: Newer version available   ' 
          + LaunchBar.shortVersion + ' ➔ ' + result.data[0].BundleShortVersionString
        ,'icon':CAUTION
        ,'url':LB_DOWNLOAD};
    } else {
      return {'title':'LaunchBar: up to date'
        ,'badge': LaunchBar.shortVersion
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
