import Flutter
import UIKit

@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {
  var deeplinkChannel: FlutterMethodChannel?
  var launchedUrl: String?

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    // Capture URL if app was launched from a URL
    if let url = launchOptions?[.url] as? URL {
      launchedUrl = url.absoluteString
    }

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
    GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)

    if let engine = engineBridge.engine {
      deeplinkChannel = FlutterMethodChannel(name: "abibstack/deeplink", binaryMessenger: engine.binaryMessenger)

      deeplinkChannel?.setMethodCallHandler({ [weak self] (call: FlutterMethodCall, result: @escaping FlutterResult) in
        guard let self = self else { return }
        if call.method == "getInitialLink" {
          result(self.launchedUrl)
        } else {
          result(FlutterMethodNotImplemented)
        }
      })
    }
  }

  // Handle legacy openURL (pre-iOS 13) and inform Flutter
  override func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    launchedUrl = url.absoluteString
    deeplinkChannel?.invokeMethod("onNewLink", arguments: launchedUrl)
    return true
  }
}
