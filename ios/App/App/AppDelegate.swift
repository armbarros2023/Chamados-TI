import UIKit
import Capacitor
import Security

class SecureBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginType(SecureSessionPlugin.self)
    }
}

@objc(SecureSessionPlugin)
class SecureSessionPlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "SecureSessionPlugin"
    let jsName = "SecureSession"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "save", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "load", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clear", returnType: CAPPluginReturnPromise)
    ]

    private let service = "com.arbtechinfo.chamadosti.secure-session"
    private let account = "refresh-token"

    @objc func save(_ call: CAPPluginCall) {
        guard let token = call.getString("refreshToken"), isValid(token) else {
            call.reject("Token de sessão inválido.")
            return
        }

        var addQuery = baseQuery()
        addQuery[kSecValueData as String] = Data(token.utf8)
        addQuery[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        let addStatus = SecItemAdd(addQuery as CFDictionary, nil)

        if addStatus == errSecDuplicateItem {
            let update = [kSecValueData as String: Data(token.utf8)]
            guard SecItemUpdate(baseQuery() as CFDictionary, update as CFDictionary) == errSecSuccess else {
                call.reject("Não foi possível proteger a sessão no dispositivo.")
                return
            }
        } else if addStatus != errSecSuccess {
            call.reject("Não foi possível proteger a sessão no dispositivo.")
            return
        }
        call.resolve()
    }

    @objc func load(_ call: CAPPluginCall) {
        var query = baseQuery()
        query[kSecReturnData as String] = true
        query[kSecMatchLimit as String] = kSecMatchLimitOne
        var result: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess, let data = result as? Data, let token = String(data: data, encoding: .utf8), isValid(token) else {
            if status == errSecSuccess { SecItemDelete(baseQuery() as CFDictionary) }
            call.resolve([:])
            return
        }
        call.resolve(["refreshToken": token])
    }

    @objc func clear(_ call: CAPPluginCall) {
        SecItemDelete(baseQuery() as CFDictionary)
        call.resolve()
    }

    private func baseQuery() -> [String: Any] {
        [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
    }

    private func isValid(_ token: String) -> Bool {
        token.range(of: "^[A-Za-z0-9_-]{64}$", options: .regularExpression) != nil
    }
}

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
