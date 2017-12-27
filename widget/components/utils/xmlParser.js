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

    XML.prototype._initialize = function (document, options) {
        var self = this;

        // part the options and update config
        $.each(options, function (index, item) {
            self._config[index] = item;
        });

        // store the content
        self._config.document = document;

        // parse the content
        var parser = new DOMParser();
        self._data = parser.parseFromString(document, "application/xml");
    }

    XML.prototype._getElementInfo = function (node, output) {
        var self = this;

        // store value/text
        if (node.nodeType === 3) {
            if (node.nodeValue) {
                output[self._config.valueNode] = node.nodeValue;
            }
        } else
        if (node.children.length === 0) {
            if (node.textContent) {
                output[self._config.textNode] = node.textContent;
            }
        }

        // store attributes
        if (node.attributes && (node.attributes.length > 0)) {
            output[self._config.attributeNode] = {};
            $.each(node.attributes, function (index, item) {
                output[self._config.attributeNode][item.name] = item.value;
            });
        }
    }

    XML.prototype.toJSON = function (node, level, path, container) {
        var self = this;
        var result = {};

        // initialize the result for return
        node = (node === null) ? self._data : node;
        var nodeName = node.nodeName;
        var prevContainer = container;

        if (self._config.addKMLContainer) {
            if (!container) {
                if (nodeName === "Document") {
                    container = node;
                    node.container = undefined;
                }
            } else {
                if (nodeName === "Document") {
                    node.prevContainer = container;
                    container = node;
                }
            }

            result.container = container;
        }

        if (self._config.addNodeInfo) {
            path += "/" + nodeName;
            result.path = path;
            result.level = level;
            result.nodeType = node.nodeType;
        }

        self._getElementInfo(node, result);

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

            // process children if any
            if (item.children.length > 0) {
                nodeValue = self.toJSON(item, level, path, container);
            } else {
                nodeValue = {};

                if (self._config.addKMLContainer) {
                    nodeValue.container = container;
                }

                if (self._config.addNodeInfo) {
                    nodeValue.path = path + "/" + childName;
                    nodeValue.level = level + 1;
                    nodeValue.nodeType = item.nodeType;
                }

                self._getElementInfo(item, nodeValue);
            }

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