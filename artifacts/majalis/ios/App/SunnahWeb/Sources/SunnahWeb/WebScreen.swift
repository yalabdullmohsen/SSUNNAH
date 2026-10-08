import SwiftUI
import WebKit

/// شاشة ويب لمسار من majlisilm.com داخل الهيكل الأصلي.
/// تشارك الكوكيز مع بقية التطبيق عبر `WKWebsiteDataStore.default()` فتبقى الجلسة واحدة.
public struct WebScreen: View {
    private let path: String
    private let policy: WebLinkPolicy
    private let onPush: (String) -> Void
    private let onPathChange: (String) -> Void

    @StateObject private var model = WebScreenModel()

    public init(
        path: String,
        policy: WebLinkPolicy = WebLinkPolicy(),
        onPush: @escaping (String) -> Void = { _ in },
        onPathChange: @escaping (String) -> Void = { _ in }
    ) {
        self.path = path
        self.policy = policy
        self.onPush = onPush
        self.onPathChange = onPathChange
    }

    public var body: some View {
        ZStack(alignment: .top) {
            WebViewRepresentable(
                url: policy.url(for: path),
                policy: policy,
                model: model,
                onPush: onPush,
                onPathChange: onPathChange
            )
            .opacity(model.failure == nil ? 1 : 0)

            if model.isLoading {
                ProgressView(value: model.progress)
                    .progressViewStyle(.linear)
                    .accessibilityLabel("جارٍ التحميل")
            }

            if model.failure != nil {
                VStack(spacing: 12) {
                    Image(systemName: "wifi.slash").font(.largeTitle)
                    Text("تعذّر تحميل الصفحة").font(.headline)
                    Text("تحقّق من الاتصال ثم أعد المحاولة.").font(.subheadline).foregroundStyle(.secondary)
                    Button("إعادة المحاولة") { model.reload() }.buttonStyle(.borderedProminent)
                }
                .padding()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
    }
}

@MainActor
final class WebScreenModel: ObservableObject {
    @Published var isLoading = false
    @Published var progress = 0.0
    @Published var failure: String?
    weak var webView: WKWebView?

    func reload() {
        failure = nil
        webView?.reload()
    }
}

struct WebViewRepresentable: UIViewRepresentable {
    let url: URL
    let policy: WebLinkPolicy
    let model: WebScreenModel
    let onPush: (String) -> Void
    let onPathChange: (String) -> Void

    /// علامة في User-Agent ليعرف الويب أنه داخل الهيكل الأصلي (فيخفي شريطه السفلي لاحقًا).
    static let userAgentMarker = "SunnahNative/1"

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.applicationNameForUserAgent = Self.userAgentMarker
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = false
        webView.scrollView.contentInsetAdjustmentBehavior = .automatic
        webView.isOpaque = false
        webView.backgroundColor = .systemBackground

        let refresh = UIRefreshControl()
        refresh.addTarget(context.coordinator, action: #selector(Coordinator.pullToRefresh(_:)), for: .valueChanged)
        webView.scrollView.refreshControl = refresh

        context.coordinator.observe(webView)
        model.webView = webView
        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        context.coordinator.parent = self
    }

    static func dismantleUIView(_ webView: WKWebView, coordinator: Coordinator) {
        coordinator.observations.removeAll()
        webView.stopLoading()
    }

    @MainActor
    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        var parent: WebViewRepresentable
        var observations: [NSKeyValueObservation] = []
        private var lastPath: String?

        init(_ parent: WebViewRepresentable) {
            self.parent = parent
        }

        func observe(_ webView: WKWebView) {
            observations = [
                webView.observe(\.estimatedProgress, options: [.new]) { [weak self] view, _ in
                    Task { @MainActor in self?.parent.model.progress = view.estimatedProgress }
                },
                webView.observe(\.isLoading, options: [.new]) { [weak self] view, _ in
                    Task { @MainActor in self?.parent.model.isLoading = view.isLoading }
                },
                // تنقّل الـSPA (pushState) لا يمر بمفوّض التنقّل؛ نراقب الرابط.
                webView.observe(\.url, options: [.new]) { [weak self] view, _ in
                    Task { @MainActor in self?.reportPath(view.url) }
                }
            ]
        }

        private func reportPath(_ url: URL?) {
            guard let url, let path = parent.policy.appPath(of: url), path != lastPath else { return }
            lastPath = path
            parent.onPathChange(path)
        }

        @objc func pullToRefresh(_ sender: UIRefreshControl) {
            parent.model.reload()
            sender.endRefreshing()
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor action: WKNavigationAction,
            decisionHandler: @escaping @MainActor (WKNavigationActionPolicy) -> Void
        ) {
            guard let url = action.request.url else { return decisionHandler(.cancel) }
            let decision = parent.policy.decide(
                url,
                currentPath: webView.url.flatMap(parent.policy.appPath(of:)),
                isMainFrame: action.targetFrame?.isMainFrame ?? true,
                isUserLink: action.navigationType == .linkActivated
            )
            switch decision {
            case .allow:
                decisionHandler(.allow)
            case .push(let path):
                decisionHandler(.cancel)
                parent.onPush(path)
            case .openExternally(let external):
                decisionHandler(.cancel)
                UIApplication.shared.open(external)
            case .cancel:
                decisionHandler(.cancel)
            }
        }

        /// target=_blank: يُعامل كنقرة رابط عادية بدل فتح نافذة جديدة.
        func webView(
            _ webView: WKWebView,
            createWebViewWith configuration: WKWebViewConfiguration,
            for action: WKNavigationAction,
            windowFeatures: WKWindowFeatures
        ) -> WKWebView? {
            guard let url = action.request.url else { return nil }
            switch parent.policy.decide(url, currentPath: nil, isMainFrame: true, isUserLink: true) {
            case .push(let path): parent.onPush(path)
            case .openExternally(let external): UIApplication.shared.open(external)
            case .allow, .cancel: break
            }
            return nil
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            parent.model.failure = nil
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            handle(error)
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            handle(error)
        }

        /// العملية المحتوى انتهت (ضغط ذاكرة): أعد التحميل بدل شاشة بيضاء.
        func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
            webView.reload()
        }

        private func handle(_ error: Error) {
            let nsError = error as NSError
            // الإلغاء (قرار .cancel أو تنقّل جديد) ليس فشلًا.
            if nsError.domain == NSURLErrorDomain && nsError.code == NSURLErrorCancelled { return }
            if nsError.domain == "WebKitErrorDomain" && nsError.code == 102 { return }
            parent.model.failure = nsError.localizedDescription
        }
    }
}
