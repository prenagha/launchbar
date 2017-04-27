// move file to trash 
// idea from https://github.com/reklis/recycle
import Cocoa

let argCount = CommandLine.arguments.count
if argCount > 1 {
  var workspace = NSWorkspace.shared()
  var manager = FileManager.default
  for path in CommandLine.arguments[1..<argCount] {
    let url = NSURL(fileURLWithPath: path);
    do {
      try manager.trashItem(at: url as URL, resultingItemURL: nil)
    } catch {
      print("Cannot trash file", path)
      exit(1)
    }
  }
}
exit(0)