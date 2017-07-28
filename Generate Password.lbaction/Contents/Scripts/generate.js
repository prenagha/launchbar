
var TYPES = "LUNS";

function setup() {
  // setup default preferences if missing
  // standard characters WITHOUT easy to mistake 0Oo, iI1lL
  // set a *Min value to -1 to mean NONE of those characters
  if (!Action.preferences.lowercase)
    Action.preferences.lowercase = 'abcdefghjkmnpqrstuvwxyz';
  if (!Action.preferences.uppercase)
    Action.preferences.uppercase = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  if (!Action.preferences.numbers)
    Action.preferences.numbers = '23456789';
  if (!Action.preferences.symbols)
    Action.preferences.symbols = '@#$%!.[]{}=+-_';
  if (!Action.preferences.minLength)
    Action.preferences.minLength = 15;
  if (!Action.preferences.lowercaseMin)
    Action.preferences.lowercaseMin = 2;
  if (!Action.preferences.uppercaseMin)
    Action.preferences.uppercaseMin = 2;
  if (!Action.preferences.numberMin)
    Action.preferences.numberMin = 2;
  if (!Action.preferences.symbolMin)
    Action.preferences.symbolMin = 1;
  if (!Action.preferences.showAlert)
    Action.preferences.showAlert = 'yes';
}

// return a random from the possible values
function rand(possible) {
  return possible.charAt(Math.floor(Math.random() * possible.length))
}

function run() {

  setup();
  var lowercaseMin = 0;
  var uppercaseMin = 0;
  var numberMin = 0;
  var symbolMin = 0;
  
  var type = "";
  var pwd = "";
  // don't start or end on a symbol
  while (pwd.length < Action.preferences.minLength
      || lowercaseMin < Action.preferences.lowercaseMin
      || uppercaseMin < Action.preferences.uppercaseMin
      || numberMin < Action.preferences.numberMin
      || symbolMin < Action.preferences.symbolMin
      || type === "S") {
    type = rand(TYPES);
    if ("L" === type && Action.preferences.lowercaseMin >= 0) {
      pwd += rand(Action.preferences.lowercase);
      lowercaseMin++;
    } else if ("U" === type && Action.preferences.uppercaseMin >= 0) {
      pwd += rand(Action.preferences.uppercase);
      uppercaseMin++;
    } else if ("N" === type && Action.preferences.numberMin >= 0) {
      pwd += rand(Action.preferences.numbers);
      numberMin++;
    } else if ("S" === type && Action.preferences.symbolMin >= 0 && pwd.length > 0) {
      pwd += rand(Action.preferences.symbols);
      symbolMin++;
    }    
  }
  LaunchBar.setClipboardString(pwd);
  if (Action.preferences.showAlert === 'yes')
    LaunchBar.alert("Generated Password Copied to Clipboard", pwd);
}
