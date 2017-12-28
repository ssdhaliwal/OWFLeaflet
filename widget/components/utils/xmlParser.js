// widget object wrapper
// https://www.w3.org/TR/xml/
// https://www.w3.org/XML/Test/xmlconf-20020606.htm
// https://www.w3.org/XML/Test/
var XMLObject = (function () {
    // static variables

    // static objects

    var XML = function (document, options) {
        this._config = {
            valueNode: "#value",
            textNode: "#text",
            attributeNode: "#attr",
            addNodeInfo: false,
            addKMLContainer: false
        };
        this._data = {};

        // static values
        this._nodeTypes = ["", "element", "attribute", "text", "cdata", "entity_ref", "entity", "instruction", "comment",
            "document", "doctype", "docfrag", "notation"
        ];

        this._initialize(document, options);
    }

    XML.prototype.getProperty = function(key) {
        var self = this;

        if (self._config.hasOwnProperty(key)) {
            return self._config[key];
        }
    }

    XML.prototype.setProperty = function(key, value) {
        var self = this;

        if (key && value) {
            self._config[key] = value;
        } else {
            if (key) {
                delete self._config[key];
            }
        }
    }

    XML.prototype._initialize = function (document, options) {
        var self = this;

        // part the options and update config
        $.each(options, function (index, item) {
            self.setProperty(index, item);
        });

        // store the content
        self.setProperty("document", document);

        // parse the content
        var parser = new DOMParser();
        self.setProperty("data", parser.parseFromString(document, "application/xml"));
    }

    XML.prototype._getElementInfo = function (node, output) {
        var self = this;

        // store value/text
        if (node.nodeType === 3) {
            if (node.nodeValue) {
                output[self.getProperty("valueNode")] = node.nodeValue;
            }
        } else
        if (node.children && (node.children.length === 0)) {
            if (node.textContent) {
                output[self.getProperty("textNode")] = node.textContent;
            }
        }

        // store attributes
        if (node.attributes && (node.attributes.length > 0)) {
            output[self.getProperty("attributeNode")] = {};
            $.each(node.attributes, function (index, item) {
                output[self.getProperty("attributeNode")][item.name] = item.value;
            });
        }
    }

    XML.prototype.toJSON = function (node, level, path, container) {
        var self = this;
        var result = {};

        // initialize the result for return
        node = (node === null) ? self.getProperty("data") : node;
        var nodeName = node.nodeName;

        if (self.getProperty("addKMLContainer")) {
            if (nodeName === "Document") {
                result.parentContainer = container;
                result.container = result;
            } else {
                result.container = container;
            }
        }

        if (self.getProperty("addNodeInfo")) {
            path += "/" + nodeName;
            result.path = path;
            result.level = level;
            result.nodeType = node.nodeType;
        }

        self._getElementInfo(node, result);
        if ((!node.children) || (node.children.length === 0)) {
            return result;
        }

        // adjust for next level/path
        level++;
        var childName = "";
        var nodeValue;
        $.each(node.children, function (index, item) {
            childName = item.nodeName;
            if (result.hasOwnProperty(childName)) {
                if (!Array.isArray(result[childName])) {
                    result[childName] = [result[childName]];
                }
            }

            nodeValue = self.toJSON(item, level, path, result.container);

            if (Array.isArray(result[childName])) {
                result[childName].push(nodeValue);
            } else {
                result[childName] = nodeValue;
            }
        });

        return result;
    }

    return XML;
})();