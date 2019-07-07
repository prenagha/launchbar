var EXISTS_FILTER = function(x){return (x && x!== undefined && x !== false)};
var LOC_FILE = Action.supportPath + '/locations.json';
var HOME_ICON = '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/HomeFolderIcon.icns';
var DEFAULT_ICON = 'ABLocation.icns';
var FOLLOW_NBR = 9999;
var FOLLOW_ICON = '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/MagnifyingGlassIcon.icns';
var FOLLOW_NAME = 'Follow-Me';
var FOLLOW_SUB = 'Dynamic location that follows your current whereabouts';
var PLANE_ICON = 'airplane.png';

function getLocations() {
  var kids = [];
  var locs = readLocations();
  var followMe = false;
  for (var i = 0; i < locs.length; i++) {
    var loc = locs[i];
    var admin = [];
    if (loc.latitude == FOLLOW_NBR)
      followMe = true;
    admin.push({'title':'Forecast'
      ,'name':loc.name,'latitude':loc.latitude,'longitude':loc.longitude,'ico':loc.icon
      ,'icon':'Sun-Low.png'
      ,'actionReturnsItems':true
      ,'action':'actionForecast'});
    admin.push({'title':'Set as Default Location'
      ,'name':loc.name,'latitude':loc.latitude,'longitude':loc.longitude,'ico':loc.icon
      ,'icon':loc.icon
      ,'actionRunsInBackground':true
      ,'action':'actionSelect'});
    admin.push({'title':'Rename ' + loc.name
      ,'name':loc.name,'latitude':loc.latitude,'longitude':loc.longitude,'ico':loc.icon
      ,'icon':'Text.icns'
      ,'actionRunsInBackground':true
      ,'action':'actionRename'});
    admin.push({'title':'Change Icon'
      ,'name':loc.name,'latitude':loc.latitude,'longitude':loc.longitude,'ico':loc.icon
      ,'icon':'Text.icns'
      ,'actionRunsInBackground':true
      ,'action':'actionIcon'});
    admin.push({'title':'Set Home Icon'
      ,'name':loc.name,'latitude':loc.latitude,'longitude':loc.longitude,'ico':loc.icon
      ,'icon':HOME_ICON
      ,'action':'actionHome'});
    admin.push({'title':'Set Airplane Icon'
      ,'name':loc.name,'latitude':loc.latitude,'longitude':loc.longitude,'ico':loc.icon
      ,'icon':PLANE_ICON
      ,'action':'actionPlane'});
    admin.push({'title':'Remove ' + loc.name
      ,'name':loc.name,'latitude':loc.latitude,'longitude':loc.longitude,'ico':loc.icon
      ,'actionRunsInBackground':true
      ,'icon':'/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/TrashIcon.icns'
      ,'action':'actionRemove'});
    kids.push({'title':loc.name
      ,'name':loc.name,'latitude':loc.latitude,'longitude':loc.longitude,'ico':loc.icon
      ,'subtitle':(loc.latitude == FOLLOW_NBR?FOLLOW_SUB:'Latitude ' + loc.latitude + ' Longitude:' + loc.longitude)
      ,'actionRunsInBackground':true
      ,'icon':loc.icon
      ,'action':'actionSelect'
      ,'children':admin});
  }  
  
	if (!followMe) {
		kids.push({'title':'Add Follow-Me Current Location'
			,'subtitle':FOLLOW_SUB
			,'name':FOLLOW_NAME,'latitude':FOLLOW_NBR,'longitude':FOLLOW_NBR,'ico':FOLLOW_ICON
			,'icon':FOLLOW_ICON
			,'actionRunsInBackground':true
			,'action':'actionSelect'});
	}
	var curr = getCurrentLocation();
	if (curr == null) {
		kids.push({'title':'Current Location not available','icon':'NotFound.icns'});
	} else {
		var f = [];
		f.push({'title':'Forecast'
			,'name':curr.name,'latitude':curr.latitude,'longitude':curr.longitude,'ico':curr.icon
			,'icon':'Sun-Low.png'
			,'actionReturnsItems':true
			,'action':'actionForecast'});

		kids.push({'title':'Add ' + curr.name + ' Location'
			,'name':curr.name,'latitude':curr.latitude,'longitude':curr.longitude,'ico':curr.icon
			,'icon':DEFAULT_ICON
			,'actionRunsInBackground':true
			,'children':f
			,'action':'actionSelect'});
	}

  if (isDebug()) {
    kids.push({'title':'Edit locations.json'
      ,'actionRunsInBackground':true
      ,'path':LOC_FILE
      ,'action':'actionJSON'});
  }
  return kids;
}


function selectedLoc() {
  var locs = readLocations();
  if (locs && locs != undefined && locs.length > 0) {
    var loc = locs[0];
    if (loc.latitude == FOLLOW_NBR) {
      var curr = getCurrentLocation();
      if (curr == null)
        return null;
      curr.icon = loc.icon;
      return curr;
    } else {
      return loc;
    }
  }
}

function actionSelect(item) {
  locationAdd(item.name, item.latitude, item.longitude, item.ico);
}

function actionForecast(item) {
  return forecast({'name':item.name, 'latitude':item.latitude, 'longitude':item.longitude, 'icon':item.ico});
}

function actionRename(item) {
  var n = LaunchBar.executeAppleScript(
    'return text returned of (display dialog "Name:" default answer "' + item.name + '" giving up after 15 with icon note)');
  if (n && n.length > 0) {
    var locs = readLocations();
    for (var i=0; i < locs.length; i++) {
      var loc = locs[i];
      if (loc.latitude == item.latitude && loc.longitude == item.longitude) {
        loc.name = n.trim();
        writeLocations(locs);
        break;
      }
    }
  }
}

function actionIcon(item) {
  var ico = LaunchBar.executeAppleScript(
    'return text returned of (display dialog "Icon:" default answer "' + item.icon + '" giving up after 15 with icon note)');
  if (ico && ico.length > 0) {
    var locs = readLocations();
    for (var i=0; i < locs.length; i++) {
      var loc = locs[i];
      if (loc.latitude == item.latitude && loc.longitude == item.longitude) {
        loc.icon = ico.trim();
        writeLocations(locs);
        break;
      }
    }
  }
}

function actionHome(item) {
  var locs = readLocations();
  for (var i=0; i < locs.length; i++) {
    var loc = locs[i];
    if (loc.latitude == item.latitude && loc.longitude == item.longitude) {
      loc.icon = HOME_ICON;  
      writeLocations(locs);
      break;
    }
  }
}

function actionPlane(item) {
  var locs = readLocations();
  for (var i=0; i < locs.length; i++) {
    var loc = locs[i];
    if (loc.latitude == item.latitude && loc.longitude == item.longitude) {
      loc.icon = PLANE_ICON;  
      writeLocations(locs);
      break;
    }
  }
}

function actionRemove(item) {
  var locs = readLocations();
  for (var i=0; i < locs.length; i++) {
    var loc = locs[i];
    if (loc.latitude == item.latitude && loc.longitude == item.longitude) {
      locs[i] = false;
      writeLocations(locs);
      break;
    }
  }
}

function actionJSON(item) {
  LaunchBar.openURL('file:/' + encodeURIComponent(LOC_FILE), 'TextEdit');
}

// add a new location to the top (selected) position
function locationAdd(name, latitude, longitude, icon) {
  var locs = [];
  locs.push({'name':name,'latitude':latitude,'longitude':longitude
    ,'icon':(icon && icon != undefined && icon.length > 0?icon:DEFAULT_ICON)});
  locs = locs.concat(readLocations());
  writeLocations(locs);
}

function readLocations() {
  // locations file is a json Array, of object containing name,latitude,longitude
  if (File.exists(LOC_FILE)) {
    try {
      return File.readJSON(LOC_FILE);
    } catch (exception) {
      LaunchBar.log('Error readLocations ' + exception);
      LaunchBar.alert('Error readLocations', exception);
    }
  } else {
    writeLocations([]);
  }
  return [];  
}

function writeLocations(locations) {
  var locs = locations.filter(EXISTS_FILTER);
  // remove duplicates
  for (var i=0; i < locs.length; i++) {
    var loc = locs[i];
    for (var j=i+1; j < locs.length; j++) {
      var other = locs[j];
      if (other !== false && loc.latitude == other.latitude && loc.longitude == other.longitude) {
        locs[j] = false;
      }
    }    
  }
  try {
    File.writeJSON(locs.filter(EXISTS_FILTER), LOC_FILE);
  } catch (exception) {
    LaunchBar.log('Error writeLocations ' + exception);
    LaunchBar.alert('Error writeLocations', exception);
  }
  return loc;
}
