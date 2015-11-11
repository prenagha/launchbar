
var HOST = "http://cscerdevnor001.fsg.amer.csc.com";
var JIRA_HOST = HOST + ":8080";
var CRUCIBLE_HOST = HOST + ":8060";

function run(arg) {
  if (!arg || arg === null || typeof(arg) != 'string' || arg.length === 0)
    return;
  
  var url = "";
  if (arg.match(/^\d+$/)) {
    url = JIRA_HOST + "/browse/ER-" + arg;
  } else if (arg.match(/^ER-\d+$/i)) {
    url = JIRA_HOST + "/browse/" + arg;
  } else if (arg.match(/^CR-\d+$/i)) {
    url = CRUCIBLE_HOST + "/cru/" + arg;
  } else {
    var term = encodeURIComponent(arg);
    url = JIRA_HOST + "/issues/?jql=(summary%20~%20%22" 
      + term + "%22%20or%20description%20~%20%22" 
      + term + "%22)%20and%20status%20!%3D%20Closed%20order%20by%20key%20desc";
  }
      
  LaunchBar.debugLog("URL " + url);
  LaunchBar.openURL(url);
}
