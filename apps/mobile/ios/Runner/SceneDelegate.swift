import Flutter
import UIKit

class SceneDelegate: FlutterSceneDelegate {

	override func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
		guard let urlContext = URLContexts.first else { return }
		let url = urlContext.url

		if let appDelegate = UIApplication.shared.delegate as? AppDelegate {
			appDelegate.launchedUrl = url.absoluteString
			appDelegate.deeplinkChannel?.invokeMethod("onNewLink", arguments: url.absoluteString)
		}
	}

}
