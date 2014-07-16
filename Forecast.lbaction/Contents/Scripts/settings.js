var PREF_FILE = Action.supportPath + '/Preferences.plist';

var langs = {};
langs['en'] = 'English';
langs['de'] = 'German';
langs['es'] = 'Spanish';
langs['fr'] = 'French';
langs['nl'] = 'Dutch';
langs['tet'] = 'Tetum';

if (Action.preferences.units == undefined) {
  Action.preferences.units = 'auto';
}

if (Action.preferences.lang == undefined) {
  Action.preferences.lang = 'en';
  var l = langs[LaunchBar.currentLocale];
  if (l && l != undefined && l.length > 0)
    Action.preferences.lang = LaunchBar.currentLocale;
}

if (Action.preferences.country == undefined) {
  Action.preferences.country = 'US';
}

if (Action.preferences.debug == undefined) {
  Action.preferences.debug = false;
}

function getSettings() {
  var items = [];

  var units = [];
  units.push({'title':'United States','units':'us'
    ,'icon':'us.icns','action':'actionUnits'});
  units.push({'title':'SI, Standard International, Metric','units':'si'
    ,'icon':'si.png','action':'actionUnits'});
  units.push({'title':'Canada','units':'ca'
    ,'subtitle':'Like SI but windSpeed is in km/h'
    ,'icon':'canada.icns','action':'actionUnits'});
  units.push({'title':'United Kingdom','units':'uk'
    ,'subtitle':'Like SI but windSpeed is in miles per hour'
    ,'icon':'uk.icns','action':'actionUnits'});
  units.push({'title':'Automatic based on location','units':'auto'
    ,'icon':FOLLOW_ICON,'action':'actionUnits'});
  items.push({'title':'Forecast Units - ' + Action.preferences.units.toUpperCase()
    ,'subtitle':'Set units for forecast.io data, see https://developer.forecast.io/docs/v2'
    ,'url':'https://developer.forecast.io/docs/v2'
    ,'icon':'Temperature-25.png'
    ,'children':units});
  
  var langs = [];
  langs.push({'title':'English','lang':'en'
    ,'icon':'us.icns','action':'actionLang'});
  langs.push({'title':'German','lang':'de'
    ,'icon':'germany.icns','action':'actionLang'});
  langs.push({'title':'French','lang':'fr'
    ,'icon':'france.icns','action':'actionLang'});
  langs.push({'title':'Spanish','lang':'sp'
    ,'icon':'spain.icns','action':'actionLang'});
  langs.push({'title':'Dutch','lang':'nl'
    ,'icon':'netherlands.icns','action':'actionLang'});
  langs.push({'title':'Tetum','lang':'tet'
    ,'icon':'indonesia.icns','action':'actionLang'});
  langs.push({'title':'Other'
    ,'url':'https://github.com/darkskyapp/forecast-io-translations'
    ,'icon':'forecastio.png'});
  items.push({'title':'Forecast Language - ' + Action.preferences.lang.toUpperCase()
    ,'subtitle':'Set language for forecast.io data, see https://developer.forecast.io/docs/v2'
    ,'url':'https://developer.forecast.io/docs/v2'
    ,'icon':'Temperature-25.png'
    ,'children':langs});
  
  var cty = [];
  cty.push({'title':'United States','country':'US'
    ,'icon':'us.icns','action':'actionCountry'});
  cty.push({'title':'Canada','country':'CA'
    ,'icon':'canada.icns','action':'actionCountry'});
  cty.push({'title':'Germany','country':'DE'
    ,'icon':'germany.icns','action':'actionCountry'});
  cty.push({'title':'France','country':'FR'
    ,'icon':'france.icns','action':'actionCountry'});
  cty.push({'title':'Spain','country':'ES'
    ,'icon':'spain.icns','action':'actionCountry'});
  cty.push({'title':'Other Country'
    ,'actionRunsInBackground':true
    ,'icon':'Text.icns','action':'actionCountryOther'});
  items.push({'title':'Location Search Country - ' + Action.preferences.country
    ,'subtitle':'Set ISO country(ies , separated) for location search, see https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2'
    ,'url':'https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2'
    ,'icon':FOLLOW_ICON
    ,'children':cty});

  items.push({'title':'forecast.io API Key - ' + Action.preferences.apiKey
    ,'subtitle':'https://developer.forecast.io'
    ,'url':'https://developer.forecast.io'
    ,'actionRunsInBackground':true
    ,'icon':'Text.icns','action':'actionKey'});

  items.push({'title':'Debug Mode - ' + Action.preferences.debug
    ,'subtitle':'Toggle debug mode, adds items that link to API calls'
    ,'icon':'com.apple.systempreferences','action':'actionDebug'});

  if (isDebug()) {
    items.push({'title':'Edit preferences file'.localize()
      ,'actionRunsInBackground':true
      ,'path':PREF_FILE
      ,'icon':'com.apple.systempreferences'
      ,'action':'actionPrefs'});
  }
  
  return {'title':'Settings'
    ,'icon':'com.apple.systempreferences'
    ,'children':items
  };
}

function actionUnits(item) {
  Action.preferences.units = item.units;
}

function actionLang(item) {
  Action.preferences.lang = item.lang;
}

function actionCountry(item) {
  Action.preferences.country = item.country;
}

function actionDebug(item) {
  Action.preferences.debug = !Action.preferences.debug;
}

function actionCountryOther(item) {
  var c = LaunchBar.executeAppleScript(
    'return text returned of (display dialog "Country Code:" default answer "' 
    + Action.preferences.country + '" giving up after 15 with icon note)');
  if (c && c.length > 0) {
    Action.preferences.country = c.trim();
  }
}

function actionKey(item) {
  var k = LaunchBar.executeAppleScript(
    'return text returned of (display dialog "forecast.io API Key:" default answer "' 
    + Action.preferences.apiKey + '" giving up after 15 with icon note)');
  if (k && k.length > 0) {
    Action.preferences.apiKey = k.trim();
  }
}

function actionPrefs(item) {
  LaunchBar.openURL('file:/' + encodeURIComponent(PREF_FILE), 'TextEdit');
}

