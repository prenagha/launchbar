
function skinTone() {
  if (Action.preferences.skinTone == undefined)
    Action.preferences.skinTone = ""; //light_skin_tone
  return Action.preferences.skinTone;
}

function hair() {
  if (Action.preferences.hair == undefined)
    Action.preferences.hair = ""; //white_hair
  return Action.preferences.hair;
}

function favorites() {
  if (Action.preferences.favorites == undefined)
    Action.preferences.favorites = ""; //😉 ☘️
  return Action.preferences.favorites;
}

function frequentMinimum() {
  if (Action.preferences.frequentMinimum == undefined)
    Action.preferences.frequentMinimum = 1;
  return Action.preferences.frequentMinimum;
}

function pruneCount() {
  if (Action.preferences.pruneCount == undefined)
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

  const query = input == undefined || !input ? "" : input.trim().toLowerCase();

  if (query.indexOf("admin") === 0) {
    result.push({
      "title": "Open preferences",
      "icon": "font-awesome:fa-wrench",
      "action": "openPreferences"
    });
    result.push({
      "title": "Open usages",
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
      if (query.length === 0 && frequent.counter < freqMin) continue;
      const keywords = emojiKeywords[frequent.emoji];
      const match = emojiMatchResult(result, query, emojiUnicode, emojiComponents,
        frequent.emoji, keywords, frequent.counter.toString());
    }
  
    // if query not empty, check against all other emoji
    if (query.length > 0) {
      for (const [emoji, keywords] of Object.entries(emojiKeywords)) {
        // skip if a frequent usage as already processed
        if (usages[emoji]) continue;
        emojiMatchResult(result, query, emojiUnicode, emojiComponents, emoji,
          keywords, null);
      }
    }
  }

  if (result.length === 0)
    result.push(inf("---", ""));

  return result;
}

// check if an emoji matches query and if so add as a result
function emojiMatchResult(result, query, emojiUnicode, emojiComponents, emoji, keywords, badge) {
  const keyword = emojiMatch(query, keywords);
  if (keyword != undefined)
    return emojiResult(result, emojiUnicode, emojiComponents, emoji, keyword, badge);
  return null;
}

// check if query matches emoji keywords
// return matched query if a match, otherwise null
function emojiMatch(query, keywords) {
  if (!keywords) return null;
  if (query.length === 0) return "";
  for (const keyword of keywords) {
    if (keyword.indexOf(query) >= 0) return keyword;
  }
  return null;
}

// add a matched emoji as a LaunchBar result
function emojiResult(result, emojiUnicode, emojiComponents, emoji, keyword, badge) {
  const info = emojiUnicode[emoji];
  const match = {
    "title":    info.name,
    "icon":     emoji,
    "subtitle": keyword,
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
    // show original emoji and skin tone as badge
    if (!badge) match["badge"] = emoji + " " + skinTone;
    const variation = emoji + skinTone;
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
  if (usage == undefined) {
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
