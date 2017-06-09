/*
 * Unit tests for ascii-main.js
 */

describe('Main app', function() {

    beforeEach(function() {
        document.body.insertAdjacentHTML('beforeend', '<section class="products"></section>');
    });

    afterEach(function() {
        simple.restore();
        AsciiShop.template.unWatchAll();
        document.body.removeChild(document.querySelector('.products'));
    });

    it('query - returns selector', function() {
        var element = document.querySelector('.products');
        expect(AsciiShop.query('.products')).toBe(element);
    });

    it('query - returns multiple elements', function() {
        var products = document.querySelector('.products');
        products.innerHTML = '<div class="product"></div><div class="product"></div><div class="product"></div>';
        expect(AsciiShop.query('.product', true).length).toBe(3);
    });

    it('Load first page of products', function(done) {
        var products = [
            {id: 1, size: '1px', price: '1020', face: ':)', date: moment().subtract(2, 'days').toDate()},
            {id: 2, size: '2px', price: '10200', face: ':)', date: moment().subtract(2, 'weeks').toDate()},
            {id: 3, size: '3px', price: '120', face: ':)', date: moment().subtract(6, 'days').toDate()},
            {id: 4, size: '4px', price: '20', face: ':)', date: moment().subtract(2, 'years').toDate()}
        ];

        simple.mock(AsciiShop, 'request').resolveWith(products);
        AsciiShop.init();

        setTimeout(function() {
            var productsAdded = document.querySelectorAll('.product');
            expect(productsAdded.length)
                .toBe(4);
            expect(document.querySelector('#prod-' + products[0].id + ' > .price').innerHTML)
                .toBe('$10.20');
            expect(document.querySelector('#prod-' + products[0].id + ' > .date').innerHTML)
                .toBe('added ' + moment(products[0].date).fromNow());
            expect(document.querySelector('#prod-' + products[1].id + ' > .date').innerHTML)
                .toBe('added ' + moment(products[1].date).format('DD-MM-YYYY'));

            done();
        }, 500);
    });

    it('Load first page of products with Adverts', function(done) {
        var products = [];

        for (var i = 1; i < 50; i++) {
            products.push({id: i, size: '1px', price: '1020', face: ':)', date: moment().subtract(2, 'days').toDate()});
        }

        simple.mock(AsciiShop, 'request').resolveWith(products);
        AsciiShop.init();

        setTimeout(function() {
            var productNodes = document.querySelectorAll('.product');
            // 49 products + 2 adverts
            expect(productNodes.length)
                .toBe(51);
            expect(document.querySelectorAll('.product > img').length)
                .toBe(2);
            // first ad after 20 products
            expect(productNodes[20].querySelectorAll('img').length)
                .toBe(1);
            // second ad after another 20 products and 1 ad
            expect(productNodes[41].querySelectorAll('img').length)
                .toBe(1);

            done();
        }, 500);
    });

    it('Load two pages of products with Adverts', function(done) {
        var products1 = [];
        var products2 = [];

        for (var i = 1; i <= 50; i++) {
            products1.push({id: i, size: '1px', price: '1020', face: ':)', date: moment().subtract(2, 'days').toDate()});
        }

        for (var i = 1; i <= 45; i++) {
            products2.push({id: 100 + i, size: '2px', price: '20', face: ':/', date: moment().subtract(5, 'days').toDate()});
        }

        simple.mock(AsciiShop, 'request')
            .resolveWith(products1)
            .resolveWith(products2);

        AsciiShop.scope.itemsPerPage = 50;
        AsciiShop.init();
        
        var loadNextPage = function() {
            if (!AsciiShop.loadNextPage()) {
                setTimeout(loadNextPage, 100);
            }
        };
        loadNextPage();

        setTimeout(function() {
            var productNodes = document.querySelectorAll('.product');
            // 50 + 45 products + 4 adverts
            expect(productNodes.length)
                .toBe(99);
            expect(document.querySelectorAll('.product > img').length)
                .toBe(4);
            // first ad after 20 products
            expect(productNodes[20].querySelectorAll('img').length)
                .toBe(1);
            // second ad after another 20 products and 1 ad
            expect(productNodes[41].querySelectorAll('img').length)
                .toBe(1);
            // third ad after another 20 products and 2 ads
            expect(productNodes[62].querySelectorAll('img').length)
                .toBe(1);
            // fourth ad after another 20 products and 3 ads
            expect(productNodes[83].querySelectorAll('img').length)
                .toBe(1);

            done();
        }, 1000);
    });

});