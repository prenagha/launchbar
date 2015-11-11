
function run(arg) {
  var term = encodeURIComponent(arg);
  var url = "http://cscerdevnor001.fsg.amer.csc.com:8080/issues/?jql=(summary%20~%20%22" + term + "%22%20or%20description%20~%20%22" + term + "%22)%20and%20status%20!%3D%20Closed%20order%20by%20key%20desc";
  LaunchBar.debugLog("URL " + url);
  LaunchBar.openURL(url);
}
