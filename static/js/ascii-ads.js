var AsciiShop = (function(app) {
    var scope = app.scope = app.scope || {};
    var ads = {};

    var templates = {
        advert: '<img class="ad" src="/ad/?r={code}">',
        productAdvert: '<div class="product"><img class="ad" src="/ad/?r={code}"></div>'
    };

    var getNextAdvertCode = function() {
        var advert = Math.floor(Math.random()*1000);
        // make sure we don't have same kittens twice in a row
        // from the backend redirection: n = (r % 16) + 1
        // without this knowledge I would need to do the request
        // and get the url from headers
        while (scope.lastAd == (advert % 16) + 1) {
            advert = Math.floor(Math.random()*1000);
        }

        scope.lastAd = (advert % 16) + 1;
        return advert;
    };

    ads.addAdverts = function(products) {
        var adPosition = 20;
        if (scope.lastAdPosition) {
            adPosition = 20 - (scope.itemsPerPage - (scope.lastAdPosition));
        }

        for (scope.adsAdded = 0; adPosition <= products.length; scope.adsAdded++) {
            products.splice(adPosition, 0, app.template.parse({code: getNextAdvertCode()}, templates.productAdvert));
            adPosition += 21;
        }

        scope.lastAdPosition = adPosition - (scope.adsAdded - 1) - 21;

        return products;
    };

    ads.loadAdverts = function() {
        var adverts = app.query('.advert', true);
        if (!adverts || !adverts.length) return;

        adverts.forEach(function(ad) {
            ad.innerHTML = app.template.parse({code: getNextAdvertCode()}, templates.advert);
        });
    };

    app.ads = ads;
    return app;
}(AsciiShop || {}));