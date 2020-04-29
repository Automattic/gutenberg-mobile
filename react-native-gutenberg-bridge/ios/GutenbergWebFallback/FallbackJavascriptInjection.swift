import WebKit

private struct File {
    enum FileError: Error {
        case sourceFileNotFound(String)
    }

    enum Extension: String {
        case css
        case js
        case json
    }
    private let name: String
    private let type: Extension
    private static let bundle = Bundle(for: Gutenberg.self)

    func getContent() throws -> String {
        guard let path = File.bundle.path(forResource: name, ofType: type.rawValue) else {
            throw FileError.sourceFileNotFound("\(name).\(type)")
        }
        return try String(contentsOfFile: path, encoding: .utf8)
    }
}

extension File {
    static let editorStyle = File(name: "editor-style-overrides", type: .css)
    static let wpBarsStyle = File(name: "wp-bar-override", type: .css)
    static let injectCss = File(name: "inject-css", type: .js)
    static let retrieveHtml = File(name: "retrieve-html-content", type: .js)
    static let insertBlock = File(name: "insert-block", type: .js)
    static let localStorage  = File(name: "local-storage-overrides", type: .json)
}

public struct FallbackJavascriptInjection {
    enum JSMessage: String, CaseIterable {
        case htmlPostContent
        case log
    }

    private let userContentScripts: [WKUserScript]
    private let injectLocalStorageScriptTemplate = "localStorage.setItem('WP_DATA_USER_%@','%@')"
    private let injectCssScriptTemplate = "window.injectCss(`%@`)"

    public let insertBlockScript: WKUserScript
    public let injectWPBarsCssScript: WKUserScript
    public let injectEditorCssScript: WKUserScript
    public let injectCssScript: WKUserScript
    public let injectLocalStorageScript: WKUserScript
    public let getHtmlContentScript = "window.getHTMLPostContent()".toJsScript()

    /// Init an instance of GutenbergWebJavascriptInjection or throws if any of the required sources doesn't exist.
    /// This helps to cach early any possible error due to missing source files.
    /// - Parameter blockHTML: The block HTML code to be injected.
    /// - Throws: Throws an error if any required source doesn't exist.
    public init(blockHTML: String, userId: String) throws {
        func script(with source: File, argument: String? = nil) throws -> WKUserScript {
            String(format: try source.getContent(), argument ?? []).toJsScript()
        }

        func getInjectCssScript(with source: File) throws -> WKUserScript {
            "window.injectCss(`\(try source.getContent())`)".toJsScript()
        }

        userContentScripts = [
            try script(with: .retrieveHtml),
        ]

        insertBlockScript = try script(with: .insertBlock, argument: blockHTML)
        injectCssScript = try script(with: .injectCss)
        injectWPBarsCssScript = try getInjectCssScript(with: .wpBarsStyle)
        injectEditorCssScript = try getInjectCssScript(with: .editorStyle)

        let localStorageJsonString = try File.localStorage.getContent()
            .removingSpacesAndNewLines()
        let scriptString = String(format: injectLocalStorageScriptTemplate, userId, localStorageJsonString)
        injectLocalStorageScript = scriptString.toJsScript()
    }

    func userContent(messageHandler handler: WKScriptMessageHandler, blockHTML: String) -> WKUserContentController {
        let userContent = WKUserContentController()
        userContent.addUserScripts(userContentScripts)
        JSMessage.allCases.forEach {
            userContent.add(handler, name: $0.rawValue)
        }
        return userContent
    }
}

private extension String {
    func toJsScript() -> WKUserScript {
        WKUserScript(source: self, injectionTime: .atDocumentEnd, forMainFrameOnly: false)
    }

    func removingSpacesAndNewLines() -> String {
        return replacingOccurrences(of: "\n", with: "").replacingOccurrences(of: " ", with: "")
    }
}

private extension WKUserContentController {
    func addUserScripts(_ scripts: [WKUserScript]) {
        scripts.forEach {
            addUserScript($0)
        }
    }
}
