//was comited on Sep 18, 2013
//was downloaded on Oct 4, 2013
//http://code.google.com/p/mutation-summary/source/browse/util/tree-mirror.js

var TreeMirror = (function() {

    var svgTAGS = [ 'altGlyph',
                    'altGlyphDef',
                    'altGlyphItem',
                    'animate',
                    'animateColor',
                    'animateMotion',
                    'animateTransform',
                    'animation',
                    'audio',
                    'canvas',
                    'circle',
                    'clipPath',
                    'color-profile',
                    'cursor',
                    'defs',
                    'desc',
                    'discard',
                    'line',
                    'ellipse',
                    'feBlend',
                    'g',
                    'linearGradient',
                    'path',
                    'polygon',
                    'rect',
                    'svg'];


    function TreeMirror(root, delegate) {
        this.root = root;
        this.delegate = delegate;
        this.idMap = {};
    }

    TreeMirror.prototype.initialize = function(rootId, children) {
        var _this = this;
        try {
            _this.idMap[rootId] = _this.root;
            for(var i = 0 ; i < children.length ; i++) {
                _this.deserializeNode(children[i], _this.root);
            }
        } catch(e) {
            //                console.log("error in TreeMirror.prototype.initialize = function(rootId, children) {");
        }
    };

    TreeMirror.prototype.applyChanged = function(removed, addedOrMoved, attributes, text) {
        var _this = this;
        // NOTE: Applying the changes can result in an attempting to add a child
        // to a parent which is presently an ancestor of the parent. This can occur
        // based on random ordering of moves. The way we handle this is to first
        // remove all changed nodes from their parents, then apply.
        JQ.each(addedOrMoved, function(i, data) {
            try {
                var node = _this.deserializeNode(data);
                var parent = _this.deserializeNode(data.parentNode);
                var previous = _this.deserializeNode(data.previousSibling);
                if(node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            } catch(e) {
                //                    console.log('JQ.each(addedOrMoved, function(i, data) {');
            }
        });

        JQ.each(removed, function(i, data) {
            try {
                var node = _this.deserializeNode(data);
                if(node && node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            } catch(e) {
                //                    console.log("JQ.each(removed, function(i, data) {");
            }
        });

        JQ.each(addedOrMoved, function(i, data) {
            var node = _this.deserializeNode(data);
            var parent = _this.deserializeNode(data.parentNode);
            var previous = _this.deserializeNode(data.previousSibling);
            try {
                parent.insertBefore(node, previous ? previous.nextSibling : parent.firstChild);
            } catch(e) {
                //                    console.log("JQ.each(addedOrMoved, function(i, data) {");
            }
        });

        JQ.each(attributes, function(i, data) {
            try {
                var node = _this.deserializeNode(data);
                if(node) {
                    JQ.each(Object.keys(data.attributes), function(i, attrName) {
                        var newVal = data.attributes[attrName];
                        if(newVal === null) {
                            try {

                                switch(node.tagName) {
                                    case 'INPUT':
                                        switch(JQ(node).attr('type')) {
                                            case 'checkbox':
                                            case 'radio':
                                                if(attrName == 'checked') {
                                                    node.checked = false;
                                                    node.__chk = node.checked;
                                                }
                                                break;
                                        }
                                        break;

                                    default :
                                        node.removeAttribute(attrName);
                                }
                            } catch(e) {

                            }
                        } else {
                            try {
                                if(!_this.delegate || !_this.delegate.setAttribute ||
                                   !_this.delegate.setAttribute(node, attrName, newVal)) {
                                    switch(node.tagName) {
                                        case 'INPUT':
                                            switch(JQ(node).attr('type')) {
                                                case 'checkbox':
                                                case 'radio':
                                                    if(attrName == 'checked') {
                                                        node.checked = true;
                                                        node.__chk = node.checked;
                                                    }
                                                    break;
                                                case 'password':
                                                    if(attrName == 'value') {
                                                        JQ(node).val("");
                                                        JQ(node).html("");
                                                    }
                                                    break;
                                                default :
                                                    JQ.each(data.attributes, function(key, val) {
                                                        if(key == 'value') {
                                                            if(node != currentInputBox) {
                                                                JQ(node).val(val);
//                                                                JQ(node).html(val);            this causes script injection so removing it.
                                                            }
                                                        } else {
                                                            JQ(node).attr(key, val);
                                                        }
                                                    });
                                            }
                                            break;

                                        case 'TEXTAREA':
                                            if(attrName == 'value') {
//                                                JQ(node).html(newVal);     this causes script injection so removing it.
                                                JQ(node).val(newVal);
                                            }
                                            break;

                                        case 'OPTION':
                                            var parent = JQ(node).parents('select');
                                            if(JQ(parent).attr('disabled')) {
                                                break;
                                            }
                                            var sel = JQ(node);
                                            parent.val('');
                                            sel.attr('selected', 'selected');
                                            var value = sel.val() || sel.name();
                                            parent.val(value);
                                            setTimeout(function() {
                                                parent.find('option').not(sel).removeAttr('selected');
                                            }, 500);
                                            break;

                                        case 'SELECT':
                                            if(JQ(node).attr('disabled')) {
                                                JQ(node).val('');
                                                break;
                                            }
                                            break;


                                        default :
                                            node.setAttribute(attrName, newVal);

                                    }
                                }
                            } catch(e) {
                                //                                    console.info('Got invalid HTML for node
                                // attribute::', attrName);
                            }
                        }
                    });
                }
            } catch(e) {
                //                    console.log('JQ.each(attributes, function(i, data) {');
            }
        });

        JQ.each(text, function(i, data) {
            try {
                var node = _this.deserializeNode(data);
                node.textContent = data.textContent;
            } catch(e) {
                //                    console.log("JQ.each(text, function(i, data) {");
            }
        });

        JQ.each(removed, function(i, node) {
            delete _this.idMap[node.id];
        });
    };

    TreeMirror.prototype.deserializeNode = function(nodeData, parent) {
        var _this = this;

        if(nodeData === null) {
            return null;
        }

        var node = _this.idMap[nodeData.id];
        try {
            if(node) {
                return node;
            }

            var doc = _this.root.ownerDocument;
            if(doc === null) {
                doc = _this.root;
            }

            switch(nodeData.nodeType) {
                /*
                 case 10: //Node.DOCUMENT_TYPE_NODE
                 var docType = node;
                 data.name = docType.name;
                 data.publicId = docType.publicId;
                 data.systemId = docType.systemId;
                 break;

                 case 8: //Node.COMMENT_NODE:
                 case 3: //Node.TEXT_NODE:
                 data.textContent = node.textContent;
                 break;

                 case 1: //Node.ELEMENT_NODE:
                 */
                case 8: //Node.COMMENT_NODE:
                    node = doc.createComment(nodeData.textContent);
                    break;

                case 3: //Node.TEXT_NODE:
                    node = doc.createTextNode(nodeData.textContent);
                    break;

                case 10: //Node.DOCUMENT_TYPE_NODE
                    try {
                        node = doc.implementation.createDocumentType(nodeData.name, nodeData.publicId,
                                                                     nodeData.systemId);
                    } catch(E) {

                    }
                    break;

                case 1: //Node.ELEMENT_NODE:
                    if(_this.delegate && _this.delegate.createElement) {
                        node = this.delegate.createElement(nodeData.tagName);
                    }
                    if(!node) {

                        if(svgTAGS.indexOf(nodeData.tagName) != -1){
                            node = doc.createElementNS("http://www.w3.org/2000/svg", nodeData.tagName);
                        }
                        else{
                            node = doc.createElement(nodeData.tagName);
                        }
                    }

                    JQ.each(Object.keys(nodeData.attributes), function(i, name) {
                        try {
                            if(!_this.delegate || !_this.delegate.setAttribute ||
                               !_this.delegate.setAttribute(node, name, nodeData.attributes[name])) {
                                (
                                    node
                                ).setAttribute(name, nodeData.attributes[name]);
                            }
                        } catch(e) {
                            //                                console.info('Got invalid HTML for node attribute::',
                            // nodeData.attributes);
                        }
                    });

                    break;
            }

            if(!node) {
                return;//throw "ouch";
            }

            _this.idMap[nodeData.id] = node;

            if(parent) {
                parent.appendChild(node);
            }

            if(nodeData.childNodes) {
                for(var i = 0 ; i < nodeData.childNodes.length ; i++) {
                    _this.deserializeNode(nodeData.childNodes[i], node);
                }
            }
        } catch(e) {
            //                console.log('TreeMirror.prototype.deserializeNode = function(nodeData, parent) {');
        }

        return node;
    };
    return TreeMirror;
})();

var TreeMirrorClient = (function() {

    var pointers = {};
    pointers['adminCompareTo'] = 'position: absolute; z-index: 9999; height: 30px; width: 30px; background-color: orange; opacity:0.5';
    var responseIds = [];

    function TreeMirrorClient(target, mirror, testingQueries) {
        var _this = this;
        this.target = target;
        this.mirror = mirror;
        this.nextId = 1;
        this.knownNodes = new MutationSummary.NodeMap();

        var rootId = this.serializeNode(target).id;
        var children = [];
        for(var child = target.firstChild ; child ; child = child.nextSibling) {
            children.push(this.serializeNode(child, true));
        }

        this.mirror.initialize(rootId, children);

        var self = this;

        var queries = [{all : true}];

        if(testingQueries) {
            queries = queries.concat(testingQueries);
        }

        this.mutationSummary = new MutationSummary({
                                                       rootNode : target,
                                                       callback : function(summaries) {
                                                           _this.applyChanged(summaries);
                                                       },
                                                       queries  : queries
                                                   });
    }

    TreeMirrorClient.prototype.disconnect = function() {
        if(this.mutationSummary) {
            this.mutationSummary.disconnect();
            this.mutationSummary = undefined;
        }
    };

    TreeMirrorClient.prototype.rememberNode = function(node) {
        var id = this.nextId++;
        this.knownNodes.set(node, id);
        return id;
    };

    TreeMirrorClient.prototype.forgetNode = function(node) {
        this.knownNodes.del(node);
    };

    TreeMirrorClient.prototype.serializeNode = function(node, recursive) {
        if(node === null) {
            return null;
        }

        var id = this.knownNodes.get(node);
        if(id !== undefined) {
            return {id : id};
        }

        var data = {
            nodeType : node.nodeType,
            id       : this.rememberNode(node)
        };

        switch(data.nodeType) {
            case 10: //Node.DOCUMENT_TYPE_NODE
                var docType = node;
                data.name = docType.name;
                data.publicId = docType.publicId;
                data.systemId = docType.systemId;
                break;

            case 8: //Node.COMMENT_NODE:
            case 3: //Node.TEXT_NODE:
                data.textContent = node.textContent;
                if(clientMask){
//                    if(responseIds.indexOf(data.id) != -1){
//                        data.textContent = maskText;
//                    }
                    Object.keys(maskConfig).forEach(function(key){
                        if(node.parentNode.attributes && node.parentNode.attributes[key] && maskConfig[key].indexOf(node.parentNode.attributes[key].value) != -1){
                            data.textContent = maskText;
                        }
                    });
                }
                break;

            case 1: //Node.ELEMENT_NODE:
                try {
                    var elm = node;
                    data.tagName = elm.tagName;
                    data.attributes = {};
                    for(var i = 0 ; i < elm.attributes.length ; i++) {
                        var attr = elm.attributes[i];
                        data.attributes[attr.name] = attr.value;
                            if(clientMask && Utils.attributeBlackList[attr.name]) {
                                data.attributes[attr.name] = '';
                            }
                    }
                    if(data['tagName'] && Utils.contains(Utils.tagBlackList, data['tagName'].toLowerCase())) {
                        data['id'] = 999999;
                        data['tagName'] = 'no-script';
                        data['attributes'] = {style : 'display: none;'};
                        data['childNodes'] = undefined;
                    }
                    if(clientMask) {
                        {
                            if(attrsToBlock){
                                if(attrsToBlock['*']){
                                    for(var u = 0 ; u < attrsToBlock['*'].length ; u++) {
                                        data['attributes'][attrsToBlock['*'][u]] = '';
                                    }
                                }
                                var keys = Object.keys(attrsToBlock);
                                if(keys.indexOf('*')!=-1){
                                    keys.splice(keys.indexOf('*'),1);
                                }
                                for(var j=0; j < keys.length; j++){
                                    if(data['attributes'][keys[j]] && data['attributes'][keys[j]] == attrsToBlock[keys[j]].value){
                                        for(var n=0;n< attrsToBlock[keys[j]].attrs.length;n++){
                                            data['attributes'][attrsToBlock[keys[j]].attrs[n]] = '';
                                        }
                                    }
                                }
                            }

                            Object.keys(maskConfig).forEach(function(key) {
                                if(data.attributes[key] && maskConfig[key].indexOf(node.attributes[key].value) != -1) {
                                    if(Utils.inputTags.indexOf(data['tagName'].toLowerCase()) > -1) {
                                        data['attributes']['value'] = '****';
                                        data['attributes']['disabled'] = 'disabled';
                                        if(data['tagName'] &&
                                           data['tagName'].toLowerCase() ==
                                           "select" &&
                                           data['childNodes']) {
                                            data['childNodes'] = [];
                                        }
                                    } else {
                                        responseIds.push(data.id)
                                    }
                                }
                            });
                        }
                    }
                    if(recursive && elm.childNodes.length) {
                        data.childNodes = [];

                        for(var child = elm.firstChild ; child ; child = child.nextSibling) {
                            data.childNodes.push(this.serializeNode(child, true));
                        }

                    }

                    if(data.attributes['style']) {
                        var style = data.attributes['style'];

                        if(style && style.indexOf('background') > -1) {
                            var isQuoteRequired = false;
                            var isBackgroundImage=false;
                            if(style.indexOf('background: url("') > -1) {
                                style = style.split('background: url("');
                            } else if(style.indexOf('background: url(\'') > -1) {
                                style = style.split('background: url(\'');
                            } else if(style.indexOf('background: url(') > -1) {
                                style = style.split('background: url(');
                                isQuoteRequired = true;
                            }

                            else if(style.indexOf('background:url("') > -1) {
                                style = style.split('background:url("');
                            } else if(style.indexOf('background:url(\'') > -1) {
                                style = style.split('background:url(\'');
                            } else if(style.indexOf('background:url(') > -1) {
                                style = style.split('background:url(');
                                isQuoteRequired = true;
                            }

                            else if(style.indexOf('background-image: url("') > -1) {
                                style = style.split('background-image: url("');
                                isBackgroundImage=true;
                            } else if(style.indexOf('background-image: url(\'') > -1) {
                                style = style.split('background-image: url(\'');
                                isBackgroundImage=true;
                            } else if(style.indexOf('background-image: url(') > -1) {
                                style = style.split('background-image: url(');
                                isQuoteRequired = true;
                                isBackgroundImage=true;
                            }

                            else if(style.indexOf('background-image:url("') > -1) {
                                style = style.split('background-image:url("');
                                isBackgroundImage=true;
                            } else if(style.indexOf('background-image:url(\'') > -1) {
                                style = style.split('background-image:url(\'');
                                isBackgroundImage=true;
                            } else if(style.indexOf('background-image:url(') > -1) {
                                style = style.split('background-image:url(');
                                isQuoteRequired = true;
                                isBackgroundImage=true;
                            }

                            if(typeof style != "string") {
                                if(isQuoteRequired) {
                                    if(isBackgroundImage){
                                        style[0] = style[0] + 'background-image: url(';
                                    }
                                    else {
                                        style[0] = style[0] + 'background: url(';
                                    }
                                } else {
                                    if(isBackgroundImage){
                                        style[0] = style[0] + 'background-image: url("';
                                    }
                                    else {
                                        style[0] = style[0] + 'background: url("';
                                    }
                                }

                                if(style[1].indexOf('/') == 0 && style[1].indexOf('//') != 0) {
                                    style[1] = basePathURl + style[1];
                                }
                                if(style[1].indexOf('http') != 0 && style[1].indexOf('//') != 0) {
                                    style[1] = path + style[1];
                                }
                                if(style[1].indexOf("//") == 0) {
                                    style[1] = protocall + style[1];
                                }
                                style = style[0] + style[1];
                                data.attributes['style'] = style;
                            }
                        }
                            if(data['attributes']['style'] && data['attributes']['style'].indexOf(pointers.adminCompareTo) > -1) {
                                delete data['attributes']['style'];
                            }
                        }
                        switch(data.tagName.toLowerCase()) {
                            case 'link':
                                if(data['attributes']['href'] &&
                                   data['attributes']['href'].indexOf('/') ==
                                   0 &&
                                   data['attributes']['href'].indexOf('//') !=
                                   0) {
                                    data['attributes']['href'] = basePathURl + data['attributes']['href'];
                                }
                                if(data['attributes']['href'] &&
                                   data['attributes']['href'].indexOf('http') !=
                                   0 &&
                                   data['attributes']['href'].indexOf('//') !=
                                   0) {
                                    data['attributes']['href'] = path + data['attributes']['href'];
                                }
                                if(data['attributes']['href'] && data['attributes']['href'].indexOf("//") == 0) {
                                    data['attributes']['href'] = protocall + data['attributes']['href'];
                                }
                                data['attributes']['href'] = decodeURI(data['attributes']['href']);
                                data['attributes']['href'] = encodeURI(data['attributes']['href']);
                                //to get CSS from proxy server
                                if(isProxyCssNeeded == 'true') {
                                    data['attributes']['href'] = CDN + 'getCss.css?css=' + data['attributes']['href'];
                                }
                                break;
                            case 'iframe':
                            case 'input':
                            case 'img':
                                if(data['attributes']['src'] &&
                                   data['attributes']['src'].indexOf('/') ==
                                   0 &&
                                   data['attributes']['src'].indexOf('//') !=
                                   0) {
                                    data['attributes']['src'] = basePathURl + data['attributes']['src'];
                                }
                                if(data['attributes']['src'] &&
                                   data['attributes']['src'].indexOf('http') !=
                                   0 &&
                                   data['attributes']['src'].indexOf('//') !=
                                   0 &&
                                   data['attributes']['src'].indexOf('data:') !=
                                   0) {
                                    data['attributes']['src'] = path + data['attributes']['src'];
                                }
                                if(data['attributes']['src'] && data['attributes']['src'].indexOf('//') == 0) {
                                    data['attributes']['src'] = protocall + data['attributes']['src'];
                                }
                                break;
                        }
                } catch(e) {
                    //                        console.info("Error in serialize data", JSON.stringify(data));
                    //                        console.info("Error as ", e);
                }
                break;
        }
        return data;
    };

    TreeMirrorClient.prototype.serializeAddedAndMoved = function(added, reparented, reordered) {
        var _this = this;
        var all = added.concat(reparented).concat(reordered);

        var parentMap = new MutationSummary.NodeMap();

        all.forEach(function(node) {
            var parent = node.parentNode;
            var children = parentMap.get(parent);
            if(!children) {
                children = new MutationSummary.NodeMap();
                parentMap.set(parent, children);
            }

            children.set(node, true);
        });

        var moved = [];

        parentMap.keys().forEach(function(parent) {
            var children = parentMap.get(parent);

            var keys = children.keys();
            while(keys.length) {
                var node = keys[0];
                while(node.previousSibling && children.has(node.previousSibling)) {
                    node = node.previousSibling;
                }

                while(node && children.has(node)) {
                    var data = _this.serializeNode(node);
                    data.previousSibling = _this.serializeNode(node.previousSibling);
                    data.parentNode = _this.serializeNode(node.parentNode);
                    moved.push(data);
                    children.del(node);
                    node = node.nextSibling;
                }

                var keys = children.keys();
            }
        });

        return moved;
    };

    TreeMirrorClient.prototype.serializeAttributeChanges = function(attributeChanged) {
        var _this = this;
        var map = new MutationSummary.NodeMap();

        Object.keys(attributeChanged).forEach(function(attrName) {
            attributeChanged[attrName].forEach(function(element) {
                var record = map.get(element);
                if(!record) {
                    record = _this.serializeNode(element);
                    record.attributes = {};
                    map.set(element, record);
                }
                record.attributes[attrName] = element.getAttribute(attrName);

                if(clientMask) {
                    if(Utils.attributeBlackList[attrName]) {
                        record.attributes[attrName] = '';
                    }

                    if(attrsToBlock){
                        if(attrsToBlock['*']){
                            for(var u = 0 ; u < attrsToBlock['*'].length ; u++) {
                                record['attributes'][attrsToBlock['*'][u]] = '';
                            }
                        }
                        var keys = Object.keys(attrsToBlock);
                        if(keys.indexOf('*')!=-1){
                            keys.splice(keys.indexOf('*'),1);
                        }
                        for(var j=0; j < keys.length; j++){
                            if(record['attributes'][keys[j]] && record['attributes'][keys[j]] == attrsToBlock[keys[j]].value){
                                for(var n=0;n< attrsToBlock[keys[j]].attrs.length;n++){
                                    record['attributes'][attrsToBlock[keys[j]].attrs[n]] = '';
                                }
                            }
                        }
                    }

                if(record.attributes['style'] && (record.attributes['style'].indexOf(pointers.adminCompareTo) > -1)) {
                    delete record.attributes['style'];
                }

                     Object.keys(maskConfig).forEach(function(key){
                         if(element.getAttribute(key) && maskConfig[key].indexOf(element.getAttribute(key)) != -1){
                             if(Utils.inputTags.indexOf(element['tagName'].toLowerCase()) > -1)
                             {
                                 record.attributes['value'] = '****';
                                 record.attributes['disabled'] = 'disabled';
                                 if(record['tagName'] &&
                                    record['tagName'].toLowerCase() ==
                                    "select" &&
                                    record['childNodes']) {
                                     record['childNodes'] = [];
                                 }
                             }
                             else {
                                 responseIds.push(record.id)
                             }
                         }
                     });
                 }

                var style = record.attributes[attrName];
                if(style && (style.indexOf('background: url("') > -1 || style.indexOf('background: url(\'') > -1)) {
                    if(style.indexOf('background: url("') > -1 )
                        style = style.split('background: url("');
                    else  style = style.split('background: url(\'');
                    style[0] = 'background: url("';
                    if(style[1].indexOf('/') == 0 && style[1].indexOf('//') != 0) {
                        style[1] = style[0] + basePathURl + style[1];
                    }
                    else if(style[1].indexOf('http') != 0 && style[1].indexOf('//') != 0) {
                        style[1] = style[0] + path + style[1];
                    }
                    else if(style[1].indexOf("//") == 0) {
                        style[1] = style[0] + protocall + style[1];
                    }
                    style = style[1];
                    record.attributes[attrName] = style
                }
                else if(style && (style.indexOf('background-image: url("') > -1 || style.indexOf('background-image: url(\'') > -1)) {
                    if(style.indexOf('background-image: url("') > -1)
                        style = style.split('background-image: url("');
                    else  style = style.split('background-image: url(\'');

                    style[0] = 'background-image: url("';
                    if(style[1].indexOf('/') == 0 && style[1].indexOf('//') != 0) {
                        style[1] = style[0] + basePathURl + style[1];
                    }
                    else if(style[1].indexOf('http') != 0 && style[1].indexOf('//') != 0) {
                        style[1] = style[0] + path + style[1];
                    }
                    else if(style[1].indexOf("//") == 0) {
                        style[1] = style[0] + protocall + style[1];
                    }
                    style = style[1];
                    record.attributes[attrName] = style
                }
            });
        });

        return map.keys().map(function(node) {
            return map.get(node);
        });
    };

    TreeMirrorClient.prototype.applyChanged = function(summaries) {
        var _this = this;
        var summary = summaries[0];

        var removed = summary.removed.map(function(node) {
            return _this.serializeNode(node);
        });

        var moved = this.serializeAddedAndMoved(summary.added, summary.reparented, summary.reordered);

        var attributes = this.serializeAttributeChanges(summary.attributeChanged);

        var text = summary.characterDataChanged.map(function(node) {
            var data = _this.serializeNode(node);
            data.textContent = node.textContent;
            if(clientMask){
                Object.keys(maskConfig).forEach(function(key) {
                    if(node.parentNode.attributes && node.parentNode.attributes[key] && maskConfig[key].indexOf(node.parentNode.attributes[key].value) != -1) {
                        data.textContent = maskText;
                    }
                });
            }
            return data;
        });

        this.mirror.applyChanged(removed, moved, attributes, text);

        summary.removed.forEach(function(node) {
            _this.forgetNode(node);
        });
    };
    return TreeMirrorClient;
})();
