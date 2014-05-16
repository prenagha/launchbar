
var baseAPI = 'https://feedwrangler.net/api/v2/';

function auth() {
    if (Action.preferences.token != undefined && Action.preferences.token.length > 5) {
      return Action.preferences.token;
    }
    Action.preferences.token = '';
    
    // The Action.preferences object is persistent across runs of the action. 
    // ~/Library/Application Support/LaunchBar/Action Support/com.renaghan.launchbar.FeedWrangler/Preferences.plist
    if (Action.preferences.email == undefined) {
      Action.preferences.email = '';
    }
    if (Action.preferences.password == undefined) {
      Action.preferences.password = '';
    }
    if (Action.preferences.clientKey == undefined) {
      Action.preferences.clientKey = '';
    }
    if (Action.preferences.quick == undefined) {
      Action.preferences.quick = 'view';
    }
    if (Action.preferences.email == ''
    || Action.preferences.password == ''
    || Action.preferences.clientKey == '' ) {
      LaunchBar.log('Prefs not set yet');
      return null;
    }

    var url = baseAPI + 'users/authorize?email=' + encodeURIComponent(Action.preferences.email)
      + '&password=' + encodeURIComponent(Action.preferences.password)
      + '&client_key=' + encodeURIComponent(Action.preferences.clientKey);
    LaunchBar.debugLog('authorize: ' + url);
    try {
      var result = HTTP.getJSON(url, 5.0);
      if (result && result.data && result.data.access_token) {
        LaunchBar.debugLog('access_token: ' + result.data.access_token);
        Action.preferences.token = result.data.access_token;
        Action.preferences.password = '';
        return result.data.access_token;
      } else if (result && result.data && result.data.error) {
        LaunchBar.alert('Unable to authorize with FeedWrangler: ' + result.data.error);
      } else {
        LaunchBar.alert('Unable to authorize with FeedWrangler. Unknown error.');
      }
    } catch (ex) {
      LaunchBar.alert('Unable to authorize with FeedWrangler. Exception.', ex);
    }
    return null;
}

function run() {
    var token = auth();
    if (!token) {
      var pref = '/Users/' + LaunchBar.userName + '/Library/Application Support/LaunchBar/Action Support/com.renaghan.launchbar.FeedWrangler/Preferences.plist';
      LaunchBar.alert('Please add/update the preferences file with your FeedWrangler email, password, and clientKey ' + pref);
      return [{'title':'Please Update Preferences', 'subtitle': pref, 'path':pref}];
    }
  
    var url = baseAPI + 'feed_items/list?read=false&access_token=' + encodeURIComponent(token);
    LaunchBar.debugLog('list: ' + url);
    try {
      var result = HTTP.getJSON(url, 5.0);
      if (result && result.data && result.data.feed_items) {
        LaunchBar.debugLog('unread count: ' + result.data.count);
        var items = [];
        var readThru = 0;
        for (var i = 0; i < result.data.feed_items.length; i++) { 
          var item = result.data.feed_items[i];
          if (item.created_at > readThru) {
            readThru = item.created_at;
          }
          var children = [];
          children.push({'title':'View', 'subtitle':item.title, 'url':item.url
            ,'action':'view'
            ,'actionArgument':{'id' : item.feed_item_id.toString(), 'url': item.url}});
          if (!item.read_later) {
            children.push({'title':'Read Later', 'subtitle':item.title, 'url':item.url
              ,'icon':'SharingServices_com.apple.share.System.add-to-safari-reading-list'
              ,'action':'readlater', 'actionArgument':item.feed_item_id.toString()});
          }
          if (!item.starred) {
            children.push({'title':'Star', 'subtitle':item.title, 'url':item.url
              ,'icon':'PhotoAlbumFlagged'
              ,'action':'star', 'actionArgument':item.feed_item_id.toString()});
          }
          if (!item.read) {
            children.push({'title':'Mark Read', 'subtitle':item.title, 'url':item.url
              ,'icon':'ReminderChecked'
              ,'action':'markread', 'actionArgument':item.feed_item_id.toString()});
          }
          items.push({'title':item.title, 'subtitle':item.feed_name, 'url':item.url
            ,'action':'quick'
            ,'actionArgument':{'id' : item.feed_item_id.toString(), 'url': item.url}
            ,'icon':'FeedWrangler512c', 'children':children});
        }
        if (items.length > 0) {
          items.push({'title':'** Mark All Read **', 'icon':'ReminderChecked',
            'action':'markallread', 'actionArgument': readThru.toString()});
        } else {
          LaunchBar.displayInLargeType({'string':'FeedWrangler has no unread items'});        
        }
        return items;
      } else if (result && result.data && result.data.error) {
        LaunchBar.alert('Error getting news from FeedWrangler: ' + result.data.error);
      } else {
        LaunchBar.alert('Error getting news from FeedWrangler. Unknown error.');
      }
    } catch (ex) {
      LaunchBar.alert('Error getting news from FeedWrangler. Exception.', ex);
    }
}

function quick(arg) {
  if ((Action.preferences.quick == 'readlater' && !LaunchBar.options.controlKey)
      || LaunchBar.options.controlKey) {
	  readlater(arg.id);
	  remainActive();
  } else {
    view(arg);
  }
}

function view(arg) {
  updateItem(id, "read=true");
  LaunchBar.openURL(arg.url);
}

function readlater(id) {
  updateItem(id, "read=true&read_later=true");
  remainActive()
}

function star(id) {
  updateItem(id, "read=true&starred=true");
  remainActive()
}

function markread(id) {
  updateItem(id, "read=true");
  remainActive();
}

function remainActive() {
  //If I uncomment and run this line then it causes LB to hang and I have to force quit
  //For now using LBKeepWindowActive=true globally in Info.plist
  //LaunchBar.executeAppleScript('tell application "LaunchBar"' , 'remain active' ,'end tell');
}

function updateItem(id, what) {
    var token = auth();
    if (!token) {
      LaunchBar.alert('Missing token for update');
      return;
    }
    var url = baseAPI + 'feed_items/update?access_token=' + encodeURIComponent(token)
      + "&feed_item_id=" + encodeURIComponent(id) + "&" + what;
    LaunchBar.debugLog('update: ' + url);
    try {
      var result = HTTP.getJSON(url, 5.0);
      if (result && result.data && result.data.feed_item) {
        return;
      } else if (result && result.data && result.data.error) {
        LaunchBar.alert('Error updating FeedWrangler: ' + result.data.error);
      } else {
        LaunchBar.alert('Error updating FeedWrangler. Unknown error.');
      }
    } catch (ex) {
      LaunchBar.alert('Error updating FeedWrangler. Exception.', ex);
    }
}

function markallread(readThru) {
    var token = auth();
    if (!token) {
      LaunchBar.alert('Missing token for all read');
      return;
    }
    var url = baseAPI + 'feed_items/mark_all_read?access_token=' + encodeURIComponent(token)
      + "&created_on_before=" + encodeURIComponent(readThru);
    LaunchBar.debugLog('allRead: ' + url);
    try {
      var result = HTTP.getJSON(url, 5.0);
      if (result && result.data && result.data.count) {
        return null;
      } else if (result && result.data && result.data.error) {
        LaunchBar.alert('Error all read FeedWrangler: ' + result.data.error);
      } else {
        LaunchBar.alert('Error all read FeedWrangler. Unknown error.');
      }
    } catch (ex) {
      LaunchBar.alert('Error all read FeedWrangler. Exception.', ex);
    }
}
