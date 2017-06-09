/*
 * Unit tests for ascii-ads.js
 */

describe('Add adverts', function() {

    afterEach(function() {
        simple.restore();
        AsciiShop.scope.lastAdPosition = 0;
        AsciiShop.scope.lastAd = 0;
        AsciiShop.scope.adsAdded = 0;
        document.body.removeChild(document.querySelector('.products'));
    });

    beforeEach(function() {
        document.body.insertAdjacentHTML('beforeend', '<section class="products"></section>');
    });

    it('Loads adverts', function() {
        document.querySelector('.products').innerHTML = '<div class="advert"></div><div class="advert"></div>';
        AsciiShop.ads.loadAdverts();
        expect(document.querySelectorAll('img').length).toBe(2);
    });


    it('addAdvers - ads adverts every 20th element', function() {
        var getAdHash = function(ad) {
            return (parseInt(ad.replace(/.*r=(.*)\>/g, '$1'), 10) % 16) + 1;
        };

        var items = AsciiShop.scope.itemsPerPage + 1;
        var elements = Array(items).join('product ').trim().split(' ');
        elements = AsciiShop.ads.addAdverts(elements);
        expect(elements.length).toBe(items + 1);
        expect(elements[20]).not.toBe('product');
        var nr1 = getAdHash(elements[20]);
        expect(elements[41]).not.toBe('product');
        var nr2 = getAdHash(elements[41]);
        expect(nr2).not.toBe(nr1);

        //add to the next page should start adding from 10th element
        var elements2 = Array(items).join('product ').trim().split(' ');
        elements2 = AsciiShop.ads.addAdverts(elements2);

        expect(elements2.length).toBe(items + 2);
        expect(elements2[10]).not.toBe('product');
        var nr3 = getAdHash(elements2[10]);
        expect(nr3).not.toBe(nr2);
        expect(elements2[31]).not.toBe('product');
        var nr4 = getAdHash(elements2[31]);
        expect(nr4).not.toBe(nr3);
        expect(elements2[52]).not.toBe('product');
        var nr5 = getAdHash(elements2[52]);
        expect(nr5).not.toBe(nr4);
    });

});