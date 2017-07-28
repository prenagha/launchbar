
var TYPES = "LUNS";

function setup() {
  // setup default preferences if missing
  // standard characters WITHOUT easy to mistake 0Oo, iI1lL
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
  if (!Action.preferences.numberCount)
    Action.preferences.numberCount = 2;
  if (!Action.preferences.symbolCount)
    Action.preferences.symbolCount = 1;
  if (!Action.preferences.showAlert)
    Action.preferences.showAlert = 'yes';
}

// return a random from the possible values
function rand(possible) {
  return possible.charAt(Math.floor(Math.random() * possible.length))
}

function run() {

  setup();
  var numberCount = 0;
  var symbolCount = 0;
  
  var type = "";
  var pwd = "";
  // don't start or end on a symbol
  while (pwd.length < Action.preferences.minLength
      || numberCount < Action.preferences.numberCount
      || symbolCount < Action.preferences.symbolCount
      || type === "S") {
    type = rand(TYPES);
    if ("L" === type) {
      pwd += rand(Action.preferences.lowercase);
    } else if ("U" === type) {
      pwd += rand(Action.preferences.uppercase);
    } else if ("N" === type && numberCount < Action.preferences.numberCount) {
      pwd += rand(Action.preferences.numbers);
      numberCount++;
    } else if (pwd.length > 0 && "S" === type && symbolCount < Action.preferences.symbolCount) {
      pwd += rand(Action.preferences.symbols);
      symbolCount++;
    }    
  }
  LaunchBar.setClipboardString(pwd);
  if (Action.preferences.showAlert === 'yes')
    LaunchBar.alert("Generated Password Copied to Clipboard", pwd);
}
