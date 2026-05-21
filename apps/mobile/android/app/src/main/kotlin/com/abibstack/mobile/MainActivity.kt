package com.exampleapp.mobile

import android.content.Intent
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
	private val CHANNEL = "exampleapp/deeplink"

	override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
		super.configureFlutterEngine(flutterEngine)

		MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
			when (call.method) {
				"getInitialLink" -> {
					val data = intent?.dataString
					result.success(data)
				}
				else -> result.notImplemented()
			}
		}
	}

	override fun onNewIntent(intent: Intent) {
		super.onNewIntent(intent)
		// Update internal intent so future getInitialLink reads latest
		setIntent(intent)

		val data = intent.dataString
		if (data != null) {
			try {
				MethodChannel(flutterEngine!!.dartExecutor!!.binaryMessenger, CHANNEL).invokeMethod("onNewLink", data)
			} catch (e: Exception) {
				// ignore if Flutter not yet ready
			}
		}
	}
}
