// move file to trash 
// idea from https://github.com/reklis/recycle
import Cocoa

let argCount = Process.arguments.count
if argCount > 1 {
  var workspace = NSWorkspace.sharedWorkspace()
  var manager = NSFileManager.defaultManager()
  for path in Process.arguments[1..<argCount] {
    let url = NSURL(fileURLWithPath: path);
    do {
      try manager.trashItemAtURL(url, resultingItemURL: nil)
    } catch {
      print("Cannot trash file", path)
      exit(1)
    }
  }
}
exit(0)