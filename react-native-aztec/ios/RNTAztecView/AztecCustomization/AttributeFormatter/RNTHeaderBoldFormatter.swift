import Aztec

/// AttributeFormatter to use for Gutenberg Heading blocks. Since
/// Heding blocks are bold by default we are giving them a tiny bit
/// of shadow and letter spacing to make them bolder.
class RNTHeaderBoldFormatter: AttributeFormatter {
    
    private enum Shadow {
        enum DefaultOffset {
            static let width: CGFloat = 0.75
            static let height: CGFloat = 0.0
        }
        
        static let blurRadiusNoBlur: CGFloat = 0.0
        
        // Creates a no blur NSShadow instance with given offset values
        static func shadow(width: CGFloat = DefaultOffset.width, height: CGFloat = DefaultOffset.height) -> NSShadow {
            let shadow = NSShadow()
            shadow.shadowBlurRadius = Shadow.blurRadiusNoBlur
            shadow.shadowOffset = CGSize(width: width, height: height)
            shadow.shadowColor = UIColor.black
            return shadow
        }
        
        // Calculate Shadow offset due to font size
        static func offset(with fontSize: CGFloat) -> CGFloat {
            if fontSize >= 22 {
                return 0.82
            } else if fontSize >= 20 && fontSize < 22 {
                return 0.78
            } else if fontSize >= 18 && fontSize < 20 {
                return 0.75
            } else if fontSize >= 16 && fontSize < 18 {
                return 0.72
            } else {
                return 0.7
            }
        }
    }

    private let htmlRepresentationKey: NSAttributedString.Key = .boldHtmlRepresentation
    
    func apply(to attributes: [NSAttributedString.Key: Any], andStore representation: HTMLRepresentation?) -> [NSAttributedString.Key: Any] {
        var resultingAttributes = attributes
        guard let font = resultingAttributes[.font] as? UIFont else {
            resultingAttributes[.shadow] = Shadow.shadow()
            resultingAttributes[.kern] =  Shadow.DefaultOffset.width
            return resultingAttributes
        }
        //Calculate letter spacing and shadow offset with respect to the font size
        let shadowOffsetWidth = Shadow.offset(with: font.pointSize)
        resultingAttributes[.shadow] = Shadow.shadow(width: shadowOffsetWidth)
        resultingAttributes[.kern] = shadowOffsetWidth
        resultingAttributes[.boldHtmlRepresentation] = representation
        
        return resultingAttributes
    }
    
    func remove(from attributes: [NSAttributedString.Key: Any]) -> [NSAttributedString.Key: Any] {
        var resultingAttributes = attributes
        
        resultingAttributes.removeValue(forKey: .shadow)
        resultingAttributes.removeValue(forKey: .kern)

        resultingAttributes.removeValue(forKey: .boldHtmlRepresentation)
        
        return resultingAttributes
    }

    func present(in attributes: [NSAttributedString.Key: Any]) -> Bool {
        return attributes[.shadow] != nil
    }
    
    func applicationRange(for range: NSRange, in text: NSAttributedString) -> NSRange {
        return range
    }
}
