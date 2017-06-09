/*
 * Unit tests for ascii-template.js
 */


describe('Template', function() {

    afterEach(function() {
        simple.restore();
        AsciiShop.template.unWatchAll();
    });

    describe('Parsing', function() {

        it('Simple replace', function() {
            expect(AsciiShop.template.parse({two: 'two', four: 'four'}, 'one, {two}, {three}'))
                .toBe('one, two, {three}'); 
        });   

        it('Replace and transform', function() {
            var transform = function(name, value) {
                if (name == 'two') {
                    return 2;
                }
                return value;
            };

            expect(AsciiShop.template.parse({two: 'two', three: 'three'}, 'one, {two}, {three}', transform))
                .toBe('one, 2, three');
        });
    });

    describe('Scrolling', function() {

        var scroll = function() {
            var event = document.createEvent("HTMLEvents");
            event.initEvent("scroll", true, true);
            event.eventName = "scroll";
            window.dispatchEvent(event);
        };

        it('watchVisible - one listener', function(done) {
            var element = document.createElement('div');
            simple.mock(AsciiShop.template, 'isVisible').returnWith(true);
            var off;
            var callback = function() {
                var el = off();
                expect(el).toBe(element);
                done();
            };

            off = AsciiShop.template.watchVisible(element, callback);
            
            scroll();
        });

        it('watchVisible - multiple listeners', function(done) {
            var elements = [];
            simple.mock(AsciiShop.template, 'isVisible').returnWith(true);
            var max = Math.floor(Math.random() * 10) + 1;
            var called = 0;
            var off = [];
            var callback = function() {
                var el = off[called]();
                expect(el).toBe(elements[called]);
                
                called++;
                if (called == max ) {
                    done();
                }
            };

            for (var i = 1; i <= max; i++) {
                var element = document.createElement('div');
                elements.push(element);
                off.push(AsciiShop.template.watchVisible(element, callback));
            }

            scroll();
        });
    });

});