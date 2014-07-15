
var ALERT_ICON = '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns';
var imap = {};
imap['clear-day'] = 'Sun.png';
imap['clear-night'] = 'Moon.png';
imap['rain'] = 'Cloud-Rain.png';
imap['snow'] = 'Snowflake.png';
imap['sleet'] = 'Cloud-Hail-Alt.png';
imap['wind'] = 'Wind.png';
imap['fog'] = 'Cloud-Fog.png';
imap['cloudy'] = 'Cloud.png';
imap['partly-cloudy-day'] = 'Cloud-Sun.png';
imap['partly-cloudy-night'] = 'Cloud-Moon.png';
imap['hail'] = 'Cloud-Hail.png';
imap['thunderstorm'] = 'Umbrella.png';
imap['tornado'] = 'Tornado.png';

function getAPIKey() {
  if (Action.preferences.apiKey == undefined) {
    Action.preferences.apiKey = '';
  }
  if (Action.preferences.apiKey.length == 0) {
    var pref = Action.supportPath + '/Preferences.plist';
    LaunchBar.alert('Please add your forecast.io API Key to the preferences file. Press enter to open the forecast.io website');
    LaunchBar.openURL('https://developer.forecast.io');
    var key = LaunchBar.executeAppleScript(
      'return text returned of (display dialog "forecast.io API Key:" default answer "" giving up after 120 with icon note)');
    Action.preferences.apiKey = key && key != undefined ? key.trim() : '';
  }
  return Action.preferences.apiKey;
}

function getIcon(i) {
  var icon = imap[i];
  if (!icon || icon == undefined || icon.length == 0) {
    LaunchBar.log('Need weather icon map for ' + i);
    return 'NotFound.icns';
  }
  return icon;
}

function getLocalTime(offset, t) {
  return moment.unix(t).zone(offset).format('HH:mm');
}

var sparks = '▁▂▃▄▅▆▇█'
function getSparkline(values) {
}

function getPrecipLevel(much) {
  if (!much || much == undefined || much == 0.0)
    return '';
  if (much >= 0.4)
    return 'heavy';
  if (much >= 0.1)
    return 'moderate';
  if (much >= 0.017)
    return 'light';
  return 'very light';
}

function getTemps(real, app) {
  var d = Math.abs(real - app);
  if (d > 5)
    return Math.round(real) + '°/' + Math.round(app) + '°';
  return Math.round(real) + '°';
}

function forecast(loc) {
  var name = loc.name;
  var latitude = loc.latitude;
  var longitude = loc.longitude;
  try {
    var items = [];
    var apiKey = getAPIKey();
    if (apiKey.length == 0)
      return;

    var url = 'https://api.forecast.io/forecast/' + apiKey + '/' + latitude + ',' + longitude;
    var furl = 'https://forecast.io/' + latitude + ',' + longitude;
    var result = HTTP.getJSON(url, 5.0);
    if (result && result.data && result.data.error)
      items.push({'title':'Forecast Error: ' + result.data.error
        ,'subtitle':url
        ,'icon':ALERT_ICON
        ,'url':url});
    if (result && result.data && result.data.timezone ) {
      if (result.data.alerts) {
        for (var i = 0; i < result.data.alerts.length; i++) {
          var a = result.data.alerts[i];
          items.push({
             'title':a.title
            ,'subtitle': 'expires ' + moment.unix(a.expires).tz(result.data.timezone).format('h:mm a')
            ,'icon':ALERT_ICON
            ,'url':a.uri
            ,'text':a.description
          });
        }
      }
            
      var hourDetails = [];
      if (result.data.hourly) {
        for (var i = 1; i < result.data.hourly.data.length; i++) {
          if (i >= 12)
            break;
          var d = result.data.hourly.data[i];
          hourDetails.push({
             'title':moment.unix(d.time).tz(result.data.timezone).format('h a') 
             + (d.precipProbability>0?' ' + Math.round(d.precipProbability*100)+'%':'')
             + ' ' + d.summary
             + ' ' + getTemps(d.temperature,d.apparentTemperature)
            ,'icon':getIcon(d.icon)});
        }
      } else {
        LaunchBar.log('Hourly forecast not available');
      }

      var todayDetails = [];
      var todaySummary = '';
      var week = [];
      if (result.data.daily) {
        var t = result.data.daily.data[0];
        todayDetails = dayDetail(result.data.timezone,t);
        todaySummary = ', ' + t.summary.substring(0, t.summary.length-1)
          + ' ' + getTemps(t.temperatureMax,t.apparentTemperatureMax) ;
        for (var i=1; i < result.data.daily.data.length; i++) {
          var d = result.data.daily.data[i];
          week.push({
            'title':moment.unix(d.time).tz(result.data.timezone).format('ddd') + ' '
              + d.summary.substring(0, d.summary.length-1) + ' '
              + getTemps(d.temperatureMax,d.apparentTemperatureMax) 
            ,'icon':getIcon(d.icon)
            ,'url':furl
            ,'children':dayDetail(result.data.timezone,d)
          });
        }        
      } else {
        LaunchBar.log('Daily forecast not available');
      }
            
      var nowTitle = null;
      var nowIcon = null;
      var nowTemp = null;
      var nowTime = new Date().getTime()/1000;
      if (result.data.currently) {
        var currently = result.data.currently;
        nowTitle = currently.summary;
        nowIcon = currently.icon;
        nowTemp = getTemps(currently.temperature, currently.apparentTemperature);
        nowTime = currently.time;
      } else {
        LaunchBar.log('Current forecast not available');
      }
      if (result.data.minutely) {
        var minutely = result.data.minutely;
        nowTitle = minutely.summary.substring(0, minutely.summary.length-1);
        nowIcon = minutely.icon;
      } else {
        LaunchBar.log('Next hour forecast not available');
      }
      var nowDetails = todayDetails.concat(hourDetails);
      items.push({
         'title':nowTitle + ' ' + nowTemp + todaySummary
        ,'icon':getIcon(nowIcon)
        ,'url':furl
        ,'children':nowDetails
      });
      items.push({
         'title':name + ' ' + moment().tz(result.data.timezone).format('h:mm a')
        ,'icon':loc.icon
        ,'url':url
      });
      items = items.concat(week);      
    }
    if (items.length == 0)
      items.push({'title':'Forecast not available','icon':'NotFound.icns','url':url});
    if (Action.debugLogEnabled) {
      items.push({'title':'forecast.io API call','url':url,'icon':'forecastio.png'});
    }
    return items;
  } catch (exception) {
    LaunchBar.log('Error forecast ' + exception);
    LaunchBar.alert('Error forecast', exception);
  }
}

function dayDetail(tz, d) {
  var details = [];
  details.push({'title': 'Low ' + getTemps(d.temperatureMin,d.apparentTemperatureMin) 
     + ' at ' + moment.unix(d.temperatureMinTime).tz(tz).format('h a')
    ,'icon':'Temperature-25.png'});
  details.push({'title':'Sunrise ' + moment.unix(d.sunriseTime).tz(tz).format('h:mm a')
    ,'icon':'Sunrise.png'});
  if (d.precipProbability > 0.0) {
    details.push({'title': Math.round(d.precipProbability * 100) + '% chance '
        + getPrecipLevel(d.precipIntensityMax) + ' ' + d.precipType
      ,'icon':getIcon(d.precipType)});
  }
  if (d.windSpeed > 5) {
    details.push({'title':'Wind ' + Math.round(d.windSpeed) + ' mph','icon':'Wind.png'});
  }
  details.push({'title': 'High ' + getTemps(d.temperatureMax,d.apparentTemperatureMax) 
     + ' at ' + moment.unix(d.temperatureMaxTime).tz(tz).format('h a')
    ,'icon':'Temperature-75.png'});                
  details.push({'title':'Sunset ' + moment.unix(d.sunsetTime).tz(tz).format('h:mm a')
    ,'icon':'Sunset.png'});
  return details;
}
