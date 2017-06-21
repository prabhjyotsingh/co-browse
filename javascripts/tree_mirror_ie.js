/**
 * Created by prabhu on 07/10/13.
 */

var TreeMirrorClient = (function() {
    function TreeMirrorClient(target, mirror, testingQueries) {
        try {
            //            console.log(target);
            this.target = target;
            this.mirror = mirror;
            this.nextId = 1;

            var rootId = this.serializeNode(target).id;
            var children = [];

            for(var child = target.firstChild ; child ; child = child.nextSibling)
                children.push(this.serializeNode(child, true));
            this.mirror.initialize(rootId, children);

        } catch(e) {
            console.log('Exception::tree_mirror::TreeMirrorClient()');
            console.log(e);
        }
    }

    TreeMirrorClient.prototype.rememberNode = function(node) {
        try {
            var id = this.nextId++;
            return id;
        } catch(e) {
            //            console.log('Exception::tree_mirror::TreeMirrorClient.prototype.rememberNode');
            //            console.log(e);
        }
    };

    TreeMirrorClient.prototype.serializeNode = function(node, recursive) {
        try {
            if(node === null)
                return null;

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
                    data.textContent = JQ(node).text();
                    break;

                case 1: //Node.ELEMENT_NODE:
                    var elm = node;
                    data.tagName = elm.tagName;
                    data.attributes = {};
                    for(var i = 0 ; i < elm.attributes.length ; i++) {
                        var attr = elm.attributes[i];
                        data.attributes[attr.name] = attr.value;
                    }

                    if(recursive && elm.childNodes.length) {
                        data.childNodes = [];

                        for(var child = elm.firstChild ; child ; child = child.nextSibling) {
                            data.childNodes.push(this.serializeNode(child, true));
                        }
                    }
                    try {
                        if(data.attributes['style']) {
                            var style = data.attributes['style'];

                            if(style && style.indexOf('background') > -1) {
                                var isQuoteRequired = false;
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
                                } else if(style.indexOf('background-image: url(\'') > -1) {
                                    style = style.split('background-image: url(\'');
                                } else if(style.indexOf('background-image: url(') > -1) {
                                    style = style.split('background-image: url(');
                                    isQuoteRequired = true;
                                }

                                else if(style.indexOf('background-image:url("') > -1) {
                                    style = style.split('background-image:url("');
                                } else if(style.indexOf('background-image:url(\'') > -1) {
                                    style = style.split('background-image:url(\'');
                                } else if(style.indexOf('background-image:url(') > -1) {
                                    style = style.split('background-image:url(');
                                    isQuoteRequired = true;
                                }

                                if(typeof style != "string") {
                                    if(isQuoteRequired) {
                                        style[0] = style[0] + 'background: url(';
                                    } else {
                                        style[0] = style[0] + 'background: url("';
                                    }

                                    if(style[1].indexOf('/') == 0 && style[1].indexOf('//') != 0) {
                                        style[1] = basePath + style[1];
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
                        }
                        switch(data.tagName.toLowerCase()) {
                            case 'link':
                                if(data['attributes']['href'] && data['attributes']['href'].indexOf('/') == 0 && data['attributes']['href'].indexOf('//') != 0) {
                                    data['attributes']['href'] = basePath + data['attributes']['href'];
                                }
                                if(data['attributes']['href'] && data['attributes']['href'].indexOf('http') != 0 && data['attributes']['href'].indexOf('//') != 0) {
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
                                if(data['attributes']['src'] && data['attributes']['src'].indexOf('/') == 0 && data['attributes']['src'].indexOf('//') != 0) {
                                    data['attributes']['src'] = basePath + data['attributes']['src'];
                                }
                                if(data['attributes']['src'] && data['attributes']['src'].indexOf('http') != 0 && data['attributes']['src'].indexOf('//') != 0) {
                                    data['attributes']['src'] = path + data['attributes']['src'];
                                }
                                if(data['attributes']['src'] && data['attributes']['src'].indexOf("//") == 0) {
                                    data['attributes']['src'] = protocall + data['attributes']['src'];
                                }
                                break;
                            case 'img':
                                if(data['attributes']['src'] && data['attributes']['src'].indexOf('/') == 0 && data['attributes']['src'].indexOf('//') != 0) {
                                    data['attributes']['src'] = basePath + data['attributes']['src'];
                                }
                                if(data['attributes']['src'] && data['attributes']['src'].indexOf('http') != 0 && data['attributes']['src'].indexOf('//') != 0) {
                                    data['attributes']['src'] = path + data['attributes']['src'];
                                }
                                if(data['attributes']['src'] && data['attributes']['src'].indexOf('//') == 0) {
                                    data['attributes']['src'] = protocall + data['attributes']['src'];
                                }
                                break;
                        }
                    } catch(e) {
                        //                        console.info("Error in serialize data");
                        //                        console.info(JSON.stringify(data));
                        //                        console.info(e);
                    }
                    break;
            }

            return data;
        } catch(e) {
            //            console.log('Exception::tree_mirror::TreeMirrorClient.prototype.serializeNode');
            //            console.log(e);
        }
    };

    return TreeMirrorClient;
})();