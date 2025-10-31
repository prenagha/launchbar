
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

function readUsages(result) {
  const path = Action.supportPath + "/usage.json";
  if (!File.exists(path)) return {};
  try {
    return File.readJSON(path);
  } catch (error) {
    result.unshift(err('Cannot read json usage data: ' + error, path));
    return {};
  }
}

function writeUsages(result, usages) {
  const path = Action.supportPath + "/usage.json";
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
  var emojiKeywords = getJsonData(result, "emoji-en-US");
  var emojiUnicode = getJsonData(result, "data-by-emoji");
  var emojiComponents = getJsonData(result, "data-emoji-components");
  var usages = readUsages(result);

  if (result.length > 0) return result;

  var frequents = [];
  for (const [emoji, usage] of Object.entries(usages)) {
    frequents.push({
      "counter": usage.counter,
      "last":    usage.last,
      "emoji":   emoji
    });
  }
  
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
  frequents.sort(compareFrequent);
  
  const query = input == undefined || !input ? "" : input.trim().toLowerCase();

  for (const frequent of frequents) {
    const keywords = emojiKeywords[frequent.emoji];
    emojiMatchResult(result, query, emojiUnicode, emojiComponents, frequent.emoji, keywords); 
  }

  if (query.length > 0) {
    for (const [emoji, keywords] of Object.entries(emojiKeywords)) {
      if (usages[emoji]) continue;
      emojiMatchResult(result, query, emojiUnicode, emojiComponents, emoji, keywords);   
    }
  }
  
  if (result.length === 0)
    result.push(inf("---", ""));
  
  return result;
}

function emojiMatchResult(result, query, emojiUnicode, emojiComponents, emoji, keywords) {
  const keyword = emojiMatch(query, keywords);
  if (keyword != undefined)
    emojiResult(result, emojiUnicode, emojiComponents, emoji, keyword);   
}

function emojiMatch(query, keywords) {
  if (!keywords) return null;
  if (query.length === 0) return "";
  for (const keyword of keywords) {
    if (keyword.indexOf(query) >= 0) return keyword;
  }
  return null;
}

function emojiResult(result, emojiUnicode, emojiComponents, emoji, keyword) {
  const info = emojiUnicode[emoji];
  const match = {
    "title":    info.name,
    "icon":     emoji,
    "subtitle": keyword,
    "action":   'selectedEmoji',
    "actionArgument": {
      "name":    info.name,
      "slug":    info.slug,
      "emoji":   emoji
    }
  };
  const skinToneName = skinTone();
  if (skinToneName && skinToneName.length > 0 && info.skin_tone_support) {
    const skinTone = emojiComponents[skinToneName];
    match["badge"] = emoji + " " + skinTone;
    const variation = emoji + skinTone;
    match["icon"] = variation;          
    match["actionArgument"]["variation"] = variation;
   }
  result.push(match);
}

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

  writeUsages(result, usages);
  if (result.length > 0) return result;
  
  LaunchBar.paste(selection.variation ? selection.variation : selection.emoji);
}
