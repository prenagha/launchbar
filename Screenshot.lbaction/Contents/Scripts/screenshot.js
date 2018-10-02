/* orig idea from https://github.com/hlissner/launchbar6-scripts */

function run() {
    var d = new Date();
    var df = "" + d.getFullYear() + (d.getMonth()+1) + d.getDate() 
        + "_" + d.getHours() + d.getMinutes() + d.getSeconds()
        + "_" + d.getMilliseconds();
    var path = LaunchBar.homeDirectory + '/Downloads/sc_' + df + '.png';
    var opt = '/Applications/ImageAlpha.app/Contents/MacOS/pngquant';
    try {
        LaunchBar.execute('/usr/sbin/screencapture', '-i', path);
        if (!File.exists(path))
          return;
        if (File.exists(opt)) {
            var orig = LaunchBar.homeDirectory 
                + '/Downloads/sc_' + df + '_orig.png';
            LaunchBar.execute('/bin/cp', '-p', path, orig);
            LaunchBar.execute(opt, '--force', '--ext', '.png', path);
        }
        
        // copy the optimized image to the clipboard
        LaunchBar.executeAppleScript('tell app "Finder" to set the clipboard to POSIX file "' + path + '"');
        
        // move original image to Trash
        LaunchBar.execute(Action.path + '/Contents/Scripts/trash', orig);
        
    } catch (exception) {
        LaunchBar.log('Screenshot Error ' + exception + ' -- ' + path);
        LaunchBar.alert('Screenshot Error', exception);
        return;
    }

    // this action runs in background so screencapture can work
    // when it is done tell LB to select the screenshot file which
    // will make LB reappear
    LaunchBar.openCommandURL('select?file='+encodeURIComponent(path));
    return;
}
