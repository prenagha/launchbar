var ALERT_ICON = 'font-awesome:fa-exclamation-triangle';
var WORD_ICON = 'font-awesome:fa-lock';
var RANDOM_ICON = 'font-awesome:fa-random';
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
    Action.preferences.symbols = '@#$%!.=+-_';
  if (!Action.preferences.minLength)
    Action.preferences.minLength = 15;
  if (!Action.preferences.lowercaseMin)
    Action.preferences.lowercaseMin = 1;
  if (!Action.preferences.uppercaseMin)
    Action.preferences.uppercaseMin = 1;
  if (!Action.preferences.numberMin)
    Action.preferences.numberMin = 1;
  if (!Action.preferences.symbolMin)
    Action.preferences.symbolMin = 1;
  if (!Action.preferences.hsxkpasswdPath)
    Action.preferences.hsxkpasswdPath="/usr/local/bin/hsxkpasswd";
  if (!Action.preferences.hsxkpasswdConfig)
    Action.preferences.hsxkpasswdConfig="hsxkpasswd-config.json";
}

// return a random from the possible values
function rand(possible) {
  return possible.charAt(Math.floor(Math.random() * possible.length))
}

function randomPass() {
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
  return pwd;
}

function run() {
  setup();
  var output = [];
  var firstPass = "";

  if (Action.preferences.hsxkpasswdPath.length > 0) {
    if (File.isExecutable(Action.preferences.hsxkpasswdPath)) {
      var pwds = LaunchBar.execute(
        Action.preferences.hsxkpasswdPath
        , '--config-file'
        ,  Action.preferences.hsxkpasswdConfig
        , '--warn'
        , 'NONE'
        , '4');
      pwds = pwds.split('\n');
      for (i=0; i<pwds.length; i++) {
        if (i==0) {
          firstPass = pwds[i].trim();
          output.push({title: pwds[i].trim()
            , badge: 'on clipboard'
            , icon: WORD_ICON});
        } else {
          output.push({title: pwds[i].trim(), icon: WORD_ICON});
        }
      }
    } else {
      output.push({title: "hsxkpasswd not found at " + Action.preferences.hsxkpasswdPath
        , file: Action.preferences.hsxkpasswdPath
        , badge: 'ERROR'
        , icon: ALERT_ICON
      });
      output.push({title: "hsxkpasswd on Github"
        , badge: 'NEXT STEP'
        , url: "https://github.com/bbusschots/hsxkpasswd"});
    }
  }

  var randPass = randomPass();
  output.push({title: randPass, icon: RANDOM_ICON});
  if (firstPass.length == 0)
    firstPass = randPass;
    
  LaunchBar.setClipboardString(firstPass);
  return output;
}
