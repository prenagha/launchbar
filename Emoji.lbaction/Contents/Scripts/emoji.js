
function skinTone() {
  if (!Action.preferences.skinTone)
    Action.preferences.skinTone = ""; //light_skin_tone
  return Action.preferences.skinTone;
}

function hair() {
  if (!Action.preferences.hair)
    Action.preferences.hair = ""; //white_hair
  return Action.preferences.hair;
}

function favorites() {
  // space separated
  // use the base emoji not the skin tone or other variation
  if (!Action.preferences.favorites)
    Action.preferences.favorites = ""; //😉 ☘️
  return Action.preferences.favorites;
}

function frequentMinimum() {
  if (!Action.preferences.frequentMinimum)
    Action.preferences.frequentMinimum = 1;
  return Action.preferences.frequentMinimum;
}

function pruneCount() {
  if (!Action.preferences.pruneCount)
    Action.preferences.pruneCount = 1;
  return Action.preferences.pruneCount;
}

function getJsonData(result, fileName) {
  const path = Action.path + "/Contents/Data/" + fileName + ".json";
  if (!File.exists(path)) {
    result.push(err('Cannot find json file: ' + fileName, path));
    return {};
  }
  try {
    var data = File.readJSON(path);
    //result.push(inf('Json loaded ok ' + path, Object.keys(data).length));
    return data;
  } catch (error) {
    result.unshift(err('Cannot load json data: ' + error, path));
    return {};
  }
}

function usagesFile() {
  return Action.supportPath + "/usage.json";
}

function readUsages(result) {
  const path = usagesFile();
  if (!File.exists(path)) return {};
  try {
    return File.readJSON(path);
  } catch (error) {
    result.unshift(err('Cannot read json usage data: ' + error, path));
    return {};
  }
}

function writeUsages(result, usages) {
  const path = usagesFile();
  try {
    File.writeJSON(usages, path);
  } catch (error) {
    result.unshift(err('Cannot write json usage data: ' + error, path));
  }
}

function inf(msg, detail) {
  LaunchBar.log(msg);
  return {
    "title":    msg,
    "icon":     'font-awesome:fa-check',
    "subtitle": detail ? detail.toString() : "",
    "alwaysShowSubtitle": detail ? true : false
  };
}

function err(msg, detail) {
  const m = 'ERROR: ' + msg;
  LaunchBar.log(m);
  return {
    "title":     m,
    "icon":      'font-awesome:fa-exclamation-triangle',
    "subtitle" : detail ? detail.toString() : "",
    "alwaysShowSubtitle": detail ? true : false
  };
}

function compareFrequent(a, b) {
  var cmp = b.counter - a.counter;
  if (cmp != 0) return cmp;
  cmp = b.last.localeCompare(a.last);
  if (cmp != 0) return cmp;
  return a.emoji.localeCompare(b.emoji);
}

function runWithString(input) {
  var result = [];

  // load the JSON data files
  var emojiKeywords = getJsonData(result, "emoji-en-US");
  var emojiUnicode = getJsonData(result, "data-by-emoji");
  var emojiComponents = getJsonData(result, "data-emoji-components");
  var usages = readUsages(result);

  if (result.length > 0) return result;

  // process usages into frequency which we will then sort
  var frequents = [];
  for (const [emoji, usage] of Object.entries(usages)) {
    frequents.push({
      "counter": usage.counter,
      "last":    usage.last,
      "emoji":   emoji
    });
  }

  // add pref favorites if any to become top usages
  const favs = favorites().split(" ");
  const now = new Date().toISOString();
  var f = 0;
  for (const fav of favs) {
    f++;
    frequents.push({
      "counter": Number.MAX_SAFE_INTEGER - f,
      "last":    now,
      "emoji":   fav
    });
  }

  // sort usages by count DESC, newest date last used, emoji
  frequents.sort(compareFrequent);

  const query = input ? input.trim().toLowerCase() : "";

  if (query.indexOf("admin") === 0) {
    result.push({
      "title": "Open preferences file",
      "icon": "font-awesome:fa-wrench",
      "action": "openPreferences"
    }); 
    result.push({
      "title": "Open usages file",
      "icon": "font-awesome:fa-history",
      "action": "openUsages"
    });
    result.push({
      "title": "Prune usages",
      "icon": "font-awesome:fa-eraser",
      "action": "pruneUsages"
    });    
    result.push({
      "title": "Backup usages",
      "icon": "font-awesome:fa-clone",
      "action": "backupUsages"
    });   
    result.push({
      "title": "Reset usages",
      "icon": "font-awesome:fa-trash",
      "action": "resetUsages"
    });
  } else {
    // find any frequent usages that match
    // empty query will match all frequent usages
    const freqMin = frequentMinimum();
    for (const frequent of frequents) {
      if (!query && frequent.counter < freqMin) continue;
      const keywords = emojiKeywords[frequent.emoji];
      const matchedResult = emojiMatchResult(result, query, emojiUnicode, emojiComponents,
        frequent.emoji, keywords, frequent.counter.toString());
    }
  
    // if query not empty, check against all other emoji
    if (query) {
      for (const [emoji, keywords] of Object.entries(emojiKeywords)) {
        // skip if a frequent usage as already processed
        if (usages[emoji]) continue;
        const matchedResult = emojiMatchResult(result, query, emojiUnicode, emojiComponents, 
          emoji, keywords, null);
      }
    }
  }

  if (result.length === 0)
    result.push(inf("---", ""));

  return result;
}

// check if an emoji matches query and if so add as a result
function emojiMatchResult(result, query, emojiUnicode, emojiComponents, emoji, keywords, badge) {
  const {match, keyword} = emojiMatch(query, keywords);
  if (match)
    return emojiResult(result, emojiUnicode, emojiComponents, emoji, keyword, badge);
  return null;
}

// check if query matches emoji keywords
// return matched keyword if a match, otherwise null
function emojiMatch(query, keywords) {
  if (!keywords) return {"match": false, "keyword": null};
  // empty query everything matches
  if (!query) return {"match": true, "keyword": null};
  for (const keyword of keywords) {
    if (keyword.indexOf(query) >= 0) return {"match": true, "keyword": keyword};
  }
  return {"match": false, "keyword": null};
}

// array of code point integers from string
function toCodePoints(str) {
  if (!str) return [];
  const points = [];  
  for (const codePoint of str) {
    points.push(codePoint.codePointAt(0));
  }
  return points;
}

// create string from code point integer array
function fromCodePoints(points) {
  if (!points || points.length === 0) return "";
  return String.fromCodePoint(...points);
}

// space separated hex string from unicode code point array
function toCodePointString(points) {
  if (!points || points.length === 0) return "";
  var str = "";
  for (const codePoint of points) {
    if (str.length > 0) str += " ";
    str += codePoint.toString(16);
  }
  return str;
}

// do the arrays have same code points including order
function arraysEqualPoints(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// does array end with another array
function arrayEndsWith(array, endsWith) {
  if (!array 
   || !endsWith
   || array.length < endsWith.length)
   return false;
  return arraysEqualPoints(array.slice(-1 * endsWith.length), endsWith);
}

// zero width joiner
const JOINER_CODE = parseInt("200d", 16);
const MALE_SUFFIX = [];
MALE_SUFFIX.push(JOINER_CODE);
MALE_SUFFIX.push(...toCodePoints("♂️"));
const FEMALE_SUFFIX = [];
FEMALE_SUFFIX.push(JOINER_CODE);
FEMALE_SUFFIX.push(...toCodePoints("♀️"));
const GENDERS = [];
GENDERS.push(MALE_SUFFIX);
GENDERS.push(FEMALE_SUFFIX);

// does emoji have gender suffix
function getGender(emojiCodes) {
  for (var i = 0; i < GENDERS.length; ++i) {
    const gender = GENDERS[i];
    if (arrayEndsWith(emojiCodes, gender)) return gender;
  }
  return [];
}

function titleCase(str) {
  if (!str) return "";
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

// add a matched emoji as a LaunchBar result
function emojiResult(result, emojiUnicode, emojiComponents, emoji, keyword, badge) {
  const info = emojiUnicode[emoji];
  const match = {
    "title":    titleCase(info.name),
    "icon":     emoji,
    "subtitle": (keyword?keyword:""),
    "action":   'selectedEmoji',
    "actionArgument": {
      "emoji":   emoji,
      "name":    info.name
    }
  };
  if (badge) match["badge"] = badge;
  // if emoji supports skin tone and we have a pref skin tone
  // then apply skin tone to emoji
  const skinToneName = skinTone();
  if (skinToneName && skinToneName.length > 0 && info.skin_tone_support) {
    const skinTone = emojiComponents[skinToneName];
    const skinToneCodes = toCodePoints(skinTone);
    const emojiCodes = toCodePoints(emoji);
    // show original emoji and skin tone as badge
    if (!badge) match["badge"] = emoji + " " + skinTone;
    const gender = getGender(emojiCodes);
    if (gender.length > 0) {
      // if gendered then skin tone goes before gender
      emojiCodes.splice(emojiCodes.length - gender.length, 0, ...skinToneCodes);
    } else {
      // otherwise just add skin tone at the end
      emojiCodes.push(...skinToneCodes);
    }
    const variation = fromCodePoints(emojiCodes);
    match["subtitle"] = (keyword?keyword:"") /*+ " " + toCodePointString(emojiCodes) */;
    match["icon"] = variation;
    match["actionArgument"]["variation"] = variation;
  }
  result.push(match);
  return match;
}

// called after search result is selected
// add selection as new usage
// paste selection to front application
function selectedEmoji(selection) {
  const result = [];
  const usages = readUsages(result);
  if (result.length > 0) return result;

  var usage = usages[selection.emoji]
  if (!usage) {
    usage = {
      "counter": 0
    };
    usages[selection.emoji] = usage;
  }
  usage["counter"] = usage.counter + 1;
  usage["last"] = new Date().toISOString();
  usage["name"] = selection.name;

  writeUsages(result, usages);
  if (result.length > 0) return result;

  LaunchBar.paste(selection.variation ? selection.variation : selection.emoji);
}

function openPreferences() {
  LaunchBar.openURL("file://" + Action.supportPath + "/Preferences.plist");
}

function openUsages() {
  LaunchBar.openURL("file://" + usagesFile());
}

function backupUsages() {
  var dt = new Date().toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replaceAll("T", "-")
    .replaceAll(".", "-")
    .replaceAll("Z", "");
  const bku = "usage-" + dt + ".json";
  const bk  = Action.supportPath + "/" + bku;
  File.writeJSON(readUsages(), bk);
  LaunchBar.displayNotification({
    title: "Backup Emoji Usages ✅",
    string: bku,
    url:    "file://" + bk
  });
}

function pruneUsages() {
  backupUsages();
  const usages = readUsages();
  const pruned = {};
  var del = 0;
  const pCount = pruneCount();
  for (const [emoji, usage] of Object.entries(usages)) {
    if (usage.counter <= pCount) {
      del++;
      continue;
    }  
    pruned[emoji] = {
      "counter": usage.counter,
      "last":    usage.last
    };
  }
  File.writeJSON(pruned, usagesFile());
  LaunchBar.displayNotification({
    title: "Pruned Emoji Usages ✅",
    string: del + " emoji removed",
    url:    "file://" + usagesFile()
  });
}

function resetUsages() {
  backupUsages();
  File.writeJSON({}, usagesFile());
  LaunchBar.displayNotification({
    title: "Reset Emoji Usages ✅",
    string: usagesFile(),
    url: "file://" + usagesFile()
  });
}
