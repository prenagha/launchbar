
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
      Action.preferences.quick = 'quicklook';
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

    var quick = 'quicklook';  
    var quickBg = false;
    if ((Action.preferences.quick == 'readlater' && !LaunchBar.options.controlKey)
      || LaunchBar.options.controlKey) {
	    quick = 'readlater';
	    quickBg = true;
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
          children.push({'title':'Quick Look'
            ,'subtitle':item.title
            ,'url':item.url
            ,'quickLookURL':item.url
            ,'action':'quicklook'
            ,'feedId':item.feed_item_id});
          children.push({'title':'View'
            ,'subtitle':item.title
            ,'url':item.url
            ,'quickLookURL':item.url
            ,'action':'view'
            ,'feedId':item.feed_item_id});
          if (!item.read_later) {
            children.push({'title':'Read Later'
              ,'subtitle':item.title
              ,'url':item.url
              ,'icon':'SharingServices_com.apple.share.System.add-to-safari-reading-list'
              ,'actionRunsInBackground':true
              ,'action':'readlater'
              ,'feedId':item.feed_item_id});
          }
          if (!item.starred) {
            children.push({'title':'Star'
              ,'subtitle':item.title
              ,'url':item.url
              ,'quickLookURL':item.url
              ,'icon':'PhotoAlbumFlagged'
              ,'actionRunsInBackground':true
              ,'action':'star'
              ,'feedId':item.feed_item_id});
          }
          if (!item.read) {
            children.push({'title':'Mark Read'
              ,'subtitle':item.title
              ,'url':item.url
              ,'quickLookURL':item.url
              ,'icon':'ReminderChecked'
              ,'actionRunsInBackground':true
              ,'action':'markread'
              ,'feedId':item.feed_item_id});
          }
          items.push({'title':item.title
            ,'subtitle':item.feed_name
            ,'url':item.url
            ,'quickLookURL':item.url
            ,'actionRunsInBackground':quickBg
            ,'action':quick
            ,'feedId':item.feed_item_id
            ,'icon':'FeedWrangler512c'
            ,'children':children});
        }
        if (items.length > 0) {
          items.push({'title':'** Mark All Read **'
            ,'icon':'ReminderChecked'
            ,'action':'markallread'
            ,'readThru':readThru});
          return items;
        } else {
          return [{'title':'No unread items', 'icon':'NotFound.icns'}];
        }
      } else if (result && result.data && result.data.error) {
        LaunchBar.alert('Error getting news from FeedWrangler: ' + result.data.error);
      } else {
        LaunchBar.alert('Error getting news from FeedWrangler. Unknown error.');
      }
    } catch (ex) {
      LaunchBar.alert('Error getting news from FeedWrangler. Exception.', ex);
    }
}

function view(item) {
  updateItem(item, "read=true");
  LaunchBar.openURL(item.url);
}

function quicklook(item) {
  updateItem(item, "read=true");
  LaunchBar.openQuickLook(item.url);
}

function readlater(item) {
  updateItem(item, "read=true&read_later=true");
}

function star(item) {
  updateItem(item, "read=true&starred=true");
}

function markread(item) {
  updateItem(item, "read=true");
}

function updateItem(item, what) {
    var token = auth();
    if (!token) {
      LaunchBar.alert('Missing token for update');
      return;
    }
    var url = baseAPI + 'feed_items/update?access_token=' + encodeURIComponent(token)
      + "&feed_item_id=" + encodeURIComponent(item.feedId) + "&" + what;
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

function markallread(item) {
    var token = auth();
    if (!token) {
      LaunchBar.alert('Missing token for all read');
      return;
    }
    var url = baseAPI + 'feed_items/mark_all_read?access_token=' + encodeURIComponent(token)
      + "&created_on_before=" + encodeURIComponent(item.readThru);
    LaunchBar.debugLog('allRead: ' + url);
    try {
      var result = HTTP.getJSON(url, 5.0);
      if (result && result.data && result.data.count) {
        return;
      } else if (result && result.data && result.data.error) {
        LaunchBar.alert('Error all read FeedWrangler: ' + result.data.error);
      } else {
        LaunchBar.alert('Error all read FeedWrangler. Unknown error.');
      }
    } catch (ex) {
      LaunchBar.alert('Error all read FeedWrangler. Exception.', ex);
    }
}
