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

  if (Action.debugLogEnabled) {
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

function actionCountryOther(item) {
  var c = LaunchBar.executeAppleScript(
    'return text returned of (display dialog "Country Code:" default answer "' 
    + Action.preferences.country + '" giving up after 15 with icon note)');
  if (c && c.length > 0) {
    Action.preferences.country = c.trim();
  }
}

function actionPrefs(item) {
  LaunchBar.openURL('file:/' + encodeURIComponent(PREF_FILE), 'TextEdit');
}

