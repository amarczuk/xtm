/*
 * Unit tests for ascii-request.js
 */

describe('Make request', function() {

    afterEach(function() {
        simple.restore();
    });

    var getXhrMock = function(content, status) {
        var xhr = {
            open: function() {},
            readyState: '',
            status: '',
            responseText: '',
            send: function() {
                this.onreadystatechange();
            },
            onreadystatechange: function() {}
        };
        simple.mock(xhr, 'open').returnWith(true);
        simple.mock(xhr, 'readyState', XMLHttpRequest.DONE || 4);
        simple.mock(xhr, 'status', status);
        simple.mock(xhr, 'responseText', content);
        simple.mock(xhr, 'send').callOriginal();
        simple.mock(window, 'XMLHttpRequest').returnWith(xhr);

        return xhr;
    };

    it('Returns array of objects', function(done) {
        var xhr = getXhrMock('{"one": 1, "two": 2}\n{"three": 3, "four": 4}\n', 200);

        AsciiShop.request('get', 'url', 'data')
            .then(function(result) {
                expect(result).toEqual([{"one": 1, "two": 2}, {"three": 3, "four": 4}]);
                done();
            })
            .catch(function(error) {
                fail('Error returned: ' + error.message);
            });
    });

    it('Rejects if request fails', function(done) {
        var xhr = getXhrMock('{"one": 1, "two": 2}\n{"three": 3, "four": 4}\n', 400);

        AsciiShop.request('get', 'url', 'data')
            .then(function(result) {
                fail('callback called');
            })
            .catch(function(error) {
                expect(error.message).toEqual('Request failed with status: 400');
                done();
            });
    });

    it('Rejects if cannot parse the response', function(done) {
        var xhr = getXhrMock('{I am not valid JSON}', 200);

        AsciiShop.request('get', 'url', 'data')
            .then(function(result) {
                fail('callback called');
            })
            .catch(function(error) {
                expect(error.message).toEqual('Response is not a valid JSON');
                done();
            });
    });

});