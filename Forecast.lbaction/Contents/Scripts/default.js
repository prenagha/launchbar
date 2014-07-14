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

function runWithString(string) {
  return go();
}

function runWithItem(item) {
  return go();
}

function runWithURL(url, details) {
  return go();
}

function run() {
  return go();
}

function getAPIKey() {
    if (Action.preferences.apiKey == undefined) {
      Action.preferences.apiKey = '';
    }
    if (Action.preferences.apiKey.length == 0) {
      var pref = Action.supportPath + '/Preferences.plist';
      LaunchBar.alert('Please add your forecast.io API Key to the preferences file. Press enter to open the forecast.io website and the preferences file');
      LaunchBar.openURL('https://developer.forecast.io');
      LaunchBar.debugLog('pref: ' + pref);
      LaunchBar.openURL('file:/' + encodeURIComponent(pref), 'TextEdit');
    }
    return Action.preferences.apiKey;
}

function getIcon(i) {
  var icon = imap[i];
  if (!icon || icon == undefined || icon.length == 0) {
    LaunchBar.log('Need icon map for ' + i);
    LaunchBar.alert('Need icon map for ' + i);
    return 'NotFound.icns';
  }
  return icon;
}

function getLocalTime(offset, t) {
      var here = new Date();
      var there;
      if (offset == (-1*here.getTimezoneOffset()/60)) {
        // same timezone as me
        there = new Date(t*1000);
      } else {
        there = new Date(t
        + (here.getTimezoneOffset() * 60 * 1000) // adjust back to UTC
        + (offset * 60 * 60 * 1000)); // adjust out to offset
      }
      var ap = 'am';
      var hour = there.getHours();
      if (hour >= 12)
        ap = 'pm';
      if (hour > 12)
        hour = hour - 12;
      return hour + ':' + (there.getMinutes()<10?'0':'') + there.getMinutes() + ' ' + ap;
}

function getDay(offset, t) {
      var here = new Date();
      var there;
      if (offset == (-1*here.getTimezoneOffset()/60)) {
        // same timezone as me
        there = new Date(t*1000);
      } else {
        there = new Date(t
        + (here.getTimezoneOffset() * 60 * 1000) // adjust back to UTC
        + (offset * 60 * 60 * 1000)); // adjust out to offset
      }
      var d = there.getDay();
      if (d == 0) return 'Sun';
      if (d == 1) return 'Mon';
      if (d == 2) return 'Tue';
      if (d == 3) return 'Wed';
      if (d == 4) return 'Thu';
      if (d == 5) return 'Fri';
      if (d == 6) return 'Sat';
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

function go() {
  try {
    var items = [];
    var apiKey = getAPIKey();
    if (apiKey.length == 0)
      return;
    LaunchBar.debugLog('Forecast API Key ' + apiKey);

    var locationName = 'Chevy Chase, MD';
    var latitude = 39.0017;
    var longitude = -77.0721;
    
    var url = 'https://api.forecast.io/forecast/' + apiKey + '/' + latitude + ',' + longitude;
    var furl = 'https://forecast.io/' + latitude + ',' + longitude;
    var result = HTTP.getJSON(url, 5.0);
    if (result && result.data ) {
      if (result.data.alerts) {
        for (var i = 0; i < result.data.alerts.length; i++) {
          var a = result.data.alerts[i];
          items.push({
             'title':a.title
            ,'subtitle': 'expires ' + getLocalTime(result.data.offset, a.expires)
            ,'icon':'/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns'
            ,'url':a.uri
          });
        }
      }
      if (result.data.currently) {
        var currently = result.data.currently;
        var title = currently.summary 
          + ' ' + getTemps(currently.temperature, currently.apparentTemperature)
          + ' ' + locationName;
        items.push({
           'title':title
          ,'subtitle': 'at ' + getLocalTime(result.data.offset, new Date().getTime()/1000)
          ,'icon':getIcon(currently.icon)
          ,'url':furl
        });
      } else {
        LaunchBar.log('Current forecast not available');
      }
      
      var hourly = [];
      if (result.data.hourly) {
        for (var i = 0; i < result.data.hourly.data.length; i++) {
          if (i >= 12)
            break;
          var d = result.data.hourly.data[i];
          hourly.push({
             'title':getLocalTime(result.data.offset, d.time) + ' ' + d.summary
               + ' ' + getTemps(d.temperature,d.apparentTemperature)
            ,'icon':getIcon(d.icon)
            ,'url':furl
          });
        }
      } else {
        LaunchBar.log('Hourly forecast not available');
      }
            
      if (result.data.minutely) {
        var minutely = result.data.minutely;
        var end = 0;
        for (var i = 0; i < result.data.minutely.data.length; i++) {
          var d = result.data.minutely.data[i];
          if (d.time > end)
            end = d.time;
        }
        items.push({
           'title':minutely.summary
          ,'subtitle': 'until ' + getLocalTime(result.data.offset, end)
          ,'icon':getIcon(minutely.icon)
          ,'url':furl
          ,'children':hourly
        });
        
      } else {
        LaunchBar.log('Next hour forecast not available');
      }

      if (result.data.daily) {
        for (var i = 0; i < result.data.daily.data.length; i++) {
          var d = result.data.daily.data[i];
          var details = [];
          var precip = '';
            details.push({'title': 'Low ' + getTemps(d.temperatureMin,d.apparentTemperatureMin) 
               + ' at ' + getLocalTime(result.data.offset, d.temperatureMinTime)
              ,'icon':'Temperature-25.png','url':furl});
            details.push({'title':'Sunrise ' + getLocalTime(result.data.offset,d.sunriseTime)
              ,'icon':'Sunrise.png','url':furl});
           if (d.precipProbability > 0.0) {
              precip = Math.round(d.precipProbability * 100) + '% chance '
                + getPrecipLevel(d.precipIntensityMax) + ' ' + d.precipType;
              details.push({'title': precip,'icon':getIcon(d.precipType),'url':furl});
            }
            if (d.windSpeed > 5) {
              details.push({'title':'Wind ' + Math.round(d.windSpeed) + ' mph','icon':'Wind.png','url':furl});
            }
            details.push({'title': 'High ' + getTemps(d.temperatureMax,d.apparentTemperatureMax) 
               + ' at ' + getLocalTime(result.data.offset, d.temperatureMaxTime)
              ,'icon':'Temperature-75.png','url':furl});                
            details.push({'title':'Sunset ' + getLocalTime(result.data.offset,d.sunsetTime)
              ,'icon':'Sunset.png','url':furl});
          items.push({
             'title': getDay(result.data.offset,d.time) + ' ' + d.summary + ' ' + getTemps(d.temperatureMax,d.apparentTemperatureMax)
            ,'subtitle': precip
            ,'icon':getIcon(d.icon)
            ,'url':furl
            ,'children':details
          });
        }        
      } else {
        LaunchBar.log('Daily forecast not available');
      }

      if (Action.debugLogEnabled) {
        items.push({'title':'API Call Results','url':url});
        //LaunchBar.debugLog(JSON.stringify(items));
      }

    }
    return items;
  } catch (exception) {
    LaunchBar.log('Error ' + exception);
    LaunchBar.alert('Error', exception);
  }
}
