include('moment-with-locales.js');

var ALERT_ICON = '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns';
var PREFS = Action.preferences;
var PREFS_RESET = false;
var PLUGIN = false;
//grab first set of numbers, if 10 or 11 long then we have a phone
var PHONE_NBR = /1?\W*([2-9][0-8]\d)\W*([2-9]\d{2})\W*(\d{4})/;
//grab next set of numbers, if any, assume that is PIN
var PHONE_CODE = /\d[\d -]+/;
//remove anything not a number from PIN
var NOT_NBR = /\D/g;


function setupPreferences() {
  if (PREFS_RESET || !Action.preferences.icalBuddyPath) {
    Action.preferences.icalBuddyPath = "/usr/local/bin/icalBuddy";
    Action.preferences.icalBuddyCommand = "eventsToday+1";
    Action.preferences.icalBuddyPropertySeparator = "^";
    var opts = [
       "--noCalendarNames"
      ,"--noRelativeDates"
      ,"--includeOnlyEventsFromNowOn"
      ,"--maxNumNoteChars" , "100"
      ,"--dateFormat", "%Y-%m-%d"
      ,"--timeFormat", "%H:%M:%S %z"
      ,"--propertyOrder", "title,datetime,location,url,notes"
      ,"--propertySeparators", "a" + Action.preferences.icalBuddyPropertySeparator + "a"
      ,"--bullet", ""
      //,"--includeCals", "Personal,Work"
      ,"--includeEventProps", "title,datetime,location,url,notes"
      ,"--notesNewlineReplacement" , " "
    ];
    Action.preferences.icalBuddyOptions = opts;
    Action.preferences.pluginFile = "";
  }
  if (!Action.preferences.momentJsFormatToday)
    Action.preferences.momentJsFormatToday = "h:mm a";
  if (!Action.preferences.momentJsFormat)
    Action.preferences.momentJsFormat = "ddd h:mm a";
  if (!Action.preferences.momentJsFormatAllDay)
    Action.preferences.momentJsFormatAllDay = "ddd";
    
  if (Action.preferences.pluginFile && Action.preferences.pluginFile.length > 5) {
    LaunchBar.log("Loading plugin from " + Action.preferences.pluginFile);
    include(Action.preferences.pluginFile);
    PLUGIN = true;
  }
}

function updatePreferences() {
  return[
    {title: 'Edit Preferences', icon: "Pref_Advanced.icns", action: "editPreferences"}
   ,{title: 'iCalBuddy Website', url: 'http://hasseg.org/icalBuddy/', icon:'icalb.png'}
   ,{title: 'iCalBuddy Calendar List', action: 'calendarList', icon:'icalb.png'}
   ,{title: 'MomentJs Date Time Formats', url: 'http://momentjs.com/docs/#/displaying/format/'}   
  ];
}

function editPreferences() {
  LaunchBar.openURL('file://' + encodeURI(Action.supportPath + '/Preferences.plist'));
}

function calendarList() {
  try {
    var output = LaunchBar.execute(Action.preferences.icalBuddyPath, 'calendars');
    return output;
  } catch (exception) {
    LaunchBar.log('Error ' + exception);
    LaunchBar.alert('Error', exception);
  }
}

function checkBuddy() {
  var err = [];
  if (!File.exists(PREFS.icalBuddyPath)) {
    err.push({title:'icalBuddy not found at ' + Action.preferences.icalBuddyPath
      ,icon: ALERT_ICON, url: 'http://hasseg.org/icalBuddy/'});
  } else if (!File.isExecutable(PREFS.icalBuddyPath)) {
    err.push({title:'icalBuddy not executable', path: Action.preferences.icalBuddyPath, icon: ALERT_ICON});
  } 
  return err.concat(updatePreferences());
}

function run() {
  try {
    setupPreferences();
    var err = checkBuddy();
    if (err.length > 4)
      return err;
    
    moment.locale(LaunchBar.currentLocale);
    var now = moment();
    
    var items = [];              
    var args = [];
    args.push(Action.preferences.icalBuddyPath);
    args = args.concat(Action.preferences.icalBuddyOptions);
    args.push(Action.preferences.icalBuddyCommand);
    LaunchBar.debugLog('Execute ' + args);
    var output = LaunchBar.execute.apply(LaunchBar, args);
    LaunchBar.debugLog('Output ' + output);
    var lines = output.split("\n");
    var event = {name:"",location:"",url:"",notes:"",start:"",end:"",phone:"",allDay:false};
    for (var i = 0; i < lines.length; i++) {
      var fields = lines[i].split(Action.preferences.icalBuddyPropertySeparator);
      // extra lines are continuations of the location field
      if (fields.length == 1) {
        var l = lines[i].trim();
        if (l.length > 1)
          event.location += ", " + l;
        continue;
      }
      
      if (event.name.length > 0) {
        items.push({
           title: t
          ,subtitle: event.phone.length > 0 ? event.phone : event.location
          ,icon: icon(now, event)
          ,children: eventChildren(event)
        });
      }
      
      event = {name:"",location:"",url:"",notes:"",start:"",end:"",phone:"",allDay:false};
      for (var f=0; f<fields.length; f++) {
        if (f === 0) {
          event.name = fields[f].trim();
          continue;
        } else if (f === 1) {
          var dt = fields[f].substring(0,10);
          if (fields[f].length <=10) {
            event.allDay = true;
            event.start = moment(dt, "YYYY-MM-DD");
            event.end = event.start;
          } else {
            var st = fields[f].substring(13,28);
            var en = fields[f].substring(29,45);
            event.start = moment(dt + " " + st, "YYYY-MM-DD HH:mm:ss Z");
            event.end = moment(dt + " " + en, "YYYY-MM-DD HH:mm:ss Z");
          }
          continue;
        }
        
        var c = fields[f].indexOf(":");
        var fn = fields[f].substring(0,c);
        if (fn === "location") {
          event.location = fields[f].substring((c+2)).trim();
        } else if (fn === "url") {
          event.url = fields[f].substring((c+2)).trim();
        } else if (fn === "notes") {
          event.notes = fields[f].substring((c+2)).trim();
        }
      }
      if (PLUGIN) {
        event = pluginParse(event);
      } else {
        event = parse(event);
      }
      if (!event || event == {} || !event.name || event.name.length == 0)
        continue;

      var t = "";     
      if (event.allDay) {
        t = event.start.format(Action.preferences.momentJsFormatAllDay);
      } else if (now.isSame(event.start,'day')) {
        t =  event.start.format(Action.preferences.momentJsFormatToday);
      } else {
        t = event.start.format(Action.preferences.momentJsFormat);
      }
      t += " " + event.name;
    }

    if (event.name.length > 0) {
      items.push({
         title: t
        ,subtitle: event.phone.length > 0 ? event.phone : event.location
        ,icon: icon(now, event)
        ,children: eventChildren(event)
      });
    }
    
    if (LaunchBar.options.alternateKey)
      return items.concat(updatePreferences());
    return items;
    
  } catch (exception) {
    LaunchBar.log('Error ' + exception);
    LaunchBar.alert('Error', exception);
  }
}

function icon(now, event) {
  if (now.isSame(event.start,'day')) {
    return (event.phone.length > 0 ? 'MobilePhone' : 'CalendarRule')
  } else {
    return "Calendar";
  }
}

//
// parse and filter the event data as you wish
// input is the event object with properties (name, start, end, location, url, notes)
// all properties are not null, default is ""
// method should return same
// tell caller that event is filtered out by returning null
// override with your own parse method by creating plugin.js in Action.supportDir
// with method pluginParse
//
function parse(event) {

  // look for a phone in the location field first
  event.phone = parsePhone(event.location);
  
  // if not look in the name
  if (event.phone.length == 0)
    event.phone = parsePhone(event.name);
  
  return event;
}

function parsePhone(str) {
  if (!str || str.length < 10)
    return "";
    
  var match = PHONE_NBR.exec(str);
  if (match == null)
    return "";
  var phone = "(" + match[1] + ") " + match[2] + "-" + match[3];
  var remain = str.substring(str.indexOf(match[0]) + match[0].length);
  var pmatch = PHONE_CODE.exec(remain);
  if (pmatch == null)
    return phone;
  return phone + " ,, " + pmatch[0].replace(NOT_NBR, "") + " #";
}

// remove a section of a string
function strDelete(str, start, end) {
}

function eventChildren(event) {
  var items = [];
  
  if (event.phone.length > 0) {
    items.push({title: 'Dial ' + event.phone, subtitle: event.location, 
      actionArgument: event.phone, action: 'dial', icon: 'MobilePhone'});
    items.push({title: 'Big Display', 
      subtitle: (event.location.length == 0 ? event.phone : event.location), 
      actionArgument: (event.location.length == 0 ? event.phone : event.location)
      , action: 'big', icon: 'MobilePhone'});
  }
  if (event.phone.length == 0 && event.location.length > 0) {
    items.push({title: 'Open Map', subtitle: event.location, 
      actionArgument: event.location, action: 'maps', icon: 'com.apple.Maps'});
  }
  if (event.url.length > 0) {
    items.push({title: 'Open URL', subtitle: event.url, url: event.url});
  }
  if (event.notes.length > 0) {
    items.push({title: event.notes, subtitle: 'Notes'});
  }
  return items;
}

function maps(str) {
  LaunchBar.openURL("http://maps.apple.com/?q=" + encodeURIComponent(str), "com.apple.Maps");
}

function dial(str) {
  LaunchBar.performAction("Call With iPhone", str);
  big(str);
}

function big(str) {
  LaunchBar.displayInLargeType({string: str});
}
