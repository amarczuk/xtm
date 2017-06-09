var AsciiShop = (function(app) {
    var scope = app.scope = app.scope || {};
    
    app.request = function(method, url, payload) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            XMLHttpRequest.DONE = XMLHttpRequest.DONE || 4;
            xhr.open(method, url, true);
            xhr.onreadystatechange = function () {
                // there were 3 approaches I've considered:
                // 1. split incoming data immediately when streamed and send for processing
                // 2. wait until streaming is finished, loop over individual lines and parse JSON objects
                // 3. as above but construct one JSON object and parse it once
                //
                // I've decided to go with the last one as to benefit from the 1. response would need
                // to be thousands objects long. Second one introduces unknown size loop with individual
                // JSON strings to parse which can lock browser for longer than fast regexp
                // and parsing longer (if it's not enormous) string only once.

                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status !== 200) {
                        reject(new Error('Request failed with status: ' + xhr.status));
                        return;
                    }

                    try {
                        var json = '[' + xhr.responseText.trim().replace(/\n/g, ',') + ']';
                        resolve(JSON.parse(json));
                    } catch(error) {
                        reject(new Error('Response is not a valid JSON'));
                    }
                }
            };

            xhr.send(payload);
        });
    };

    return app;
}(AsciiShop || {}));