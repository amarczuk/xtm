var AsciiShop = (function(app, moment) {
    var scope = app.scope = app.scope || {};
    
    scope.itemsPerPage = 50;
    scope.sort = 'id';
    scope.isLoading = false;

    var templates = {
        spinner: '<div class="spinner"><img src="img/spinner.gif"></div>',
        item: "<div class='product' id='{id}'> \
                <div class='face' style='font-size: {size}px'>{face}</div> \
                <div class='size'>{size}px</div> \
                <div class='price'>${price}</div> \
                <div class='date'>added {date}</div> \
               </div>",
        end: '<div class="text-center">~ end of catalogue ~</div>'
    };

    app.query = function(selector, all) {
        if (!all) {
            return document.querySelector(selector);
        }
        return Array.prototype.slice.apply(document.querySelectorAll(selector));
    };

    var getNextPageUrl = function() {
        var skip = (scope.nextPageToLoad - 1) * scope.itemsPerPage;
        return '/api/products/?limit=' + scope.itemsPerPage + '&skip=' + skip + '&sort=' + scope.sort;
    };

    // add spinner or mark the end of catalog
    var addSpinner = function() {
        var page = app.query('#page_' + scope.nextPageToLoad);
        page.innerHTML = (scope.isEnd) ? templates.end : templates.spinner;
    };

    /* adds div that will be filled with next page of faces
     * and attaches watch for it to be visible on
     * the screen which triggers products load
     */
    var addNextPageHolder = function() {
        var id = 'page_' + scope.nextPageToLoad;
        if (app.query(id)) {
            return;
        }
        var div = document.createElement('div');
        div.id = id;
        div.className = 'page';
        app.query('.products').appendChild(div);

        var off;
        var callback = function() {
            if (off) {
                off();
                off = null;
                addSpinner();
            }
            if (!app.loadNextPage()) {
                // try again if it's still loading next page
                setTimeout(callback, 200);
            }
        };

        if (scope.nextPageToLoad != 1) {
            // if not the first page wait for it to be visible
            off = app.template.watchVisible(div, callback);
        } else {
            addSpinner();
        }
    };

    var addProductsToThePage = function() {
        var products = app.query('.products');
        var page = app.query('#page_' + scope.nextPageToLoad);
        page.innerHTML = templates.spinner;

        page.insertAdjacentHTML('beforebegin', scope.currentPageProducts.join('\n'));
        products.removeChild(page);

        scope.nextPageToLoad++;
        addNextPageHolder();
    };

    app.loadNextPage = function() {
        if (scope.isLoading) {
            return false;
        }

        scope.isLoading = true;

        // render immediately if next page is available
        if (scope.nextPageProducts.length) {
            scope.currentPageProducts = scope.nextPageProducts.slice(0);
            scope.nextPageProducts = [];
            addProductsToThePage();
        }

        var transform = function(name, value) {
            switch (name) {
                case 'id':
                    return 'prod-' + value;
                case 'price':
                    return (value / 100).toFixed(2);
                case 'date':
                    var date = moment(new Date(value));
                    return (moment().diff(date, 'days') < 7) ? date.fromNow() : date.format('DD-MM-YYYY');
                default:
                    return value;
            }
        };

        app.request('get', getNextPageUrl())
            .then(function(results) {
                if (results.length < scope.itemsPerPage) {
                    scope.isEnd = true;
                }

                if (!results.length) {
                    scope.isLoading = false;
                    return 'skip';
                }

                if (!scope.currentPageProducts.length) {
                    scope.currentPageProducts = app.template.parse(results, templates.item, transform);
                    scope.currentPageProducts = app.ads.addAdverts(scope.currentPageProducts);

                    addProductsToThePage();

                    return (scope.isEnd) ? 'skip' : app.request('get', getNextPageUrl());
                }

                scope.nextPageProducts = app.template.parse(results, templates.item, transform);
                scope.nextPageProducts = app.ads.addAdverts(scope.nextPageProducts);

                scope.isLoading = false;
                return 'skip';
            })
            .then(function(results) {
                if (results == 'skip') {
                    scope.isLoading = false;
                    return;
                }

                if (results.length < scope.itemsPerPage) {
                    scope.isEnd = true;
                }

                if (results.length) {
                    // executed for the first page only
                    scope.nextPageProducts = app.template.parse(results, templates.item, transform);
                    scope.nextPageProducts = app.ads.addAdverts(scope.nextPageProducts);
                }

                scope.isLoading = false;
            })
            .catch(function(error) {
                // do not do that at work ;)
                alert(error.message);
                
                console.log(error);
                scope.isLoading = false;
            });

        return true;
    };

    app.filter = function(orderby) {
        scope.sort = orderby;
        app.init();
    };

    app.init = function() {
        if (!scope.currentPageProducts) {
            app.ads.loadAdverts();
        }

        scope.currentPageProducts = [];
        scope.nextPageProducts = [];
        scope.nextPageToLoad = 1;
        scope.isEnd = false;
        scope.adsAdded = 0;
        scope.lastAdPosition = 0;
        scope.isLoading = false;
        app.query('.products').innerHTML = '';

        addNextPageHolder();
        addSpinner();
        app.loadNextPage();
    };

    return app;
}(AsciiShop || {}, moment));