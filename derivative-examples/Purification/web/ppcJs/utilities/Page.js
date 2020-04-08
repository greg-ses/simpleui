// ~/utilities/Page
// static page scope utilities

define(['dojo/_base/lang', 'dojo/_base/array', 'dojo/query', 'dojo/dom', 'dojo/dom-construct', 'dojo/dom-class', 'dojo/dom-style',
        'dojo/on', 'dojo/mouse', 'dojo/topic', 'dojo/_base/fx',
        'dijit/registry', './Compatibility', './Identity'],
function (lang, array, query, dom, construct, domClass, domStyle,
        on, mouse, topic, fx,
        registry, Compatibility, Identity) {
    return {
        /* hides loading overlay. Requires these two lines in page html
            <link rel="stylesheet" type="text/css" href="./ppcJs/themes/loadOverlay.css" />
            <div id="loadingOverlay" class="loadingOverlay loadingMessage">Loading...</div>
        */
        hideLoadOverlay: function (/*string*/nodeId, /*bool*/noFade) {
            if (noFade) {
                domStyle.set(dom.byId(nodeId), 'display', 'none');
            }
            else {
                // fade the overlay gracefully
                fx.fadeOut({
                    node: dom.byId(nodeId),
                    duration: 1000,
                    onEnd: function (node) {
                        domStyle.set(node, 'display', 'none');
                    }
                }).play();
            }
        },

        displayLoadOverlay: function (/*string*/nodeId) {
            domStyle.set(dom.byId(nodeId), { display: 'block', opacity: '1.0' });
        },

        // subscribes a DOM node as a pub/sub client for the topic
        subscribeContent: function (topicName, /*string*/nodeId) {
            this.nodeId = nodeId;

            this.updateContent = function (/*string*/content) {
                dom.byId(this.nodeId).innerHTML = content;
            };

            topic.subscribe(topicName, lang.hitch(this, this.updateContent));
        },

        // add cursor hover effect to a DOM node, add connection to handlerList
        addHoverBehavior: function (/*Array*/handlerList, node, /*optional*/hoverCssClass) {
            var hoverClass = hoverCssClass ? hoverCssClass : 'cursorHover';

            handlerList.push(on(node, mouse.enter, function (evt) {
                domStyle.set(evt.currentTarget, 'cursor', 'pointer');
                domClass.add(node, hoverClass);
            }
            ));

            handlerList.push(on(node, mouse.leave, function (evt) {
                domStyle.set(evt.currentTarget, 'cursor', 'auto');
                domClass.remove(node, hoverClass);
            }
            ));
        },

        showDijit: function (id) {
            if (id) {
                try {
                    domStyle.set(id.domNode, { visibility: 'visible' });
                }
                catch (error) { }
            }
        },

        hideDijit: function (id) {
            if (id) {
                try {
                    domStyle.set(id.domNode, { visibility: 'hidden' });
                }
                catch (error) { }
            }
        },

        showDomNode: function (id) {
            if (id) {
                var node = dom.byId(id);
                domStyle.set(node, { visibility: 'visible' });
            }
        },

        hideDomNode: function (id) {
            if (id) {
                var node = dom.byId(id);
                try {
                    domStyle.set(node, { visibility: 'hidden' });
                }
                catch (error) { }
            }
        },

        isVisible: function (id) {
            if (id) {
                var node = dom.byId(id);
                try {
                    return (domStyle.get(node, 'visibility') === 'visible');
                }
                catch (error) {
                    return null;
                }
            }
        },

        enableDijit: function (id) {
            if (id) {
                var widget = registry.byId(id);
                widget.set('disabled', false);
            }
        },

        disableDijit: function (id) {
            if (id) {
                var widget = registry.byId(id);
                widget.set('disabled', true);
            }
        },

        // destroy recursively all contained dijits
        // if preserveParentDomNode = true, destroy DOM node
        destroyRecursive: function (domNode, /*bool*/preserveParentDomNode) {
            var widgets = registry.findWidgets(domNode);
            array.forEach(widgets, function (widget) {
                if (Identity.isFunction(widget.destroyRecursive)) {
                    widget.destroyRecursive();
                }
                else {
                    widget.destroy();
                }
            });

            if (!preserveParentDomNode) {
                construct.destroy(domNode);
            }
        },

        // returns array of widgets in order of DOM nodes in parent DOM node
        getWidgetsByCssClass: function (domNode, cssClass) {
            var widgets = new Array();

            var widgetNodes = this.getNodesByCssClass(domNode, cssClass);
            array.forEach(widgetNodes, function (widgetNode) {
                widgets.push(registry.byNode(widgetNode));
            });

            return widgets;
        },

        getNodesByCssClass: function (domNode, cssClass) {
            var selector = '.' + cssClass;
            return query(selector, domNode);
        }
    };
});