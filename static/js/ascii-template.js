var AsciiShop = (function(app) {
    var scope = app.scope = app.scope || {};
    
    var template = {};

    var replace = function(bindings, string, transform) {
        var doTransformation = typeof transform == 'function';
        for (var name in bindings) {
            if (!bindings.hasOwnProperty(name)) {
                continue;
            }
            var value = (doTransformation) ? transform(name, bindings[name]) : bindings[name];
            string = string.replace(new RegExp('\\{' + name + '\\}', 'g'), value);
        }
        return string;
    };

    // the simplest templating system ever :)
    template.parse = function(items, template, transform) {
        if (!Array.isArray(items)) {
            return replace(items, template, transform);
        }

        var out = [];
        items.forEach(function(item) {
            out.push(replace(item, template, transform));
        });

        return out;
    };

    template.isVisible = function(element) {
        var posY = (function() {
            var test = element, top = 0;

            while(!!test && test.tagName.toLowerCase() !== "body") {
                top += test.offsetTop;
                test = test.offsetParent;
            }
            return top;
        })();

        var viewPortHeight = (function() {
            var documentElement = document.documentElement;

            if (!!window.innerWidth) { 
                return window.innerHeight; 
            } else if ( documentElement && !isNaN(documentElement.clientHeight) ) { 
                return documentElement.clientHeight; 
            }

            return 0;
        })();

        var scrollY = (window.pageYOffset) ? window.pageYOffset : Math.max(document.documentElement.scrollTop, document.body.scrollTop);

        return (posY < viewPortHeight + scrollY && posY > scrollY);
    };

    var elementsToWatch = [];
    var offFn = [];
    var timeOff = null;
    var checkElements = function() {
        if (timeOff) {
            clearTimeout(timeOff);
        }

        timeOff = setTimeout(function() {
            for (var index in elementsToWatch) {
                if (template.isVisible(elementsToWatch[index].element)) {
                    setTimeout(elementsToWatch[index].callback, 0);
                }
            }
        }, 100);
    };

    template.unWatchAll = function() {
        var offArray = offFn.slice(0);
        offArray.forEach(function(off) {
            off();
        });

        offArray = [];
    };

    template.watchVisible = function(element, callback) {
        var value = {element: element, callback: callback};
        elementsToWatch.push(value);
        if (elementsToWatch.length == 1) {
            window.addEventListener('scroll', checkElements);
        }
        var off = function() {
            var index = elementsToWatch.indexOf(value);
            var removed = elementsToWatch.splice(index, 1);
            offFn.splice(offFn.indexOf(off), 1);

            if (!elementsToWatch.length) {
                window.removeEventListener('scroll', checkElements);
            }
            return removed[0].element;
        };
        offFn.push(off);
        return off;
    };

    app.template = template;

    return app;
}(AsciiShop || {}));