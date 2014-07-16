String.prototype.localizationTable = 'default';

include('forecast.js');
include('location.js');
include('search.js');
include('settings.js');
include('moment.js');
include('moment-timezone.js');

function runWithString(string) {
  return locationSearch(string);
}

function runWithItem(item) {
  return locationSearch(item.title);
}

function runWithURL(url, details) {
  if (details && details.queryParameters && details.queryParameters.q)
    return locationSearch(details.queryParameters.q);
}

function run() {
  var items = [];
  var loc = selectedLoc();
  if (loc == null) {
    items.push({'title':'locationNotFound'.localize(),'icon':'NotFound.icns'});
  } else {
    items = items.concat(forecast(loc));
  }
  items.push({'title':'Locations'.localize()
    ,'icon':DEFAULT_ICON
    ,'action':'actionLocations'
    ,'actionReturnsItems':true});
  return items;
}

function actionLocations(item) {
  var items = getLocations();
  return items.concat(getSettings());
}
