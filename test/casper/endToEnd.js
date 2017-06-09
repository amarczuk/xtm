/*=================
 * end-to-end test
 *=================*/

var cp;

casper.test.setUp(function(done) {

    var childProcess;
    try {
        childProcess = require("child_process");
    } catch (e) {
        this.log(e, "error");
    }

    var testDir = function() {
        var pathParts = fs.absolute(casper.test.currentTestFile).split('/');
        pathParts.pop();

        return pathParts.join('/') + "/";
    };


    casper.echo('Start web server...');

    if (childProcess) {
        cp = childProcess.spawn(
            "node",
            ["index.js"], 
            {cwd: testDir() + '../../'});
        cp.stdout.on('data', function(data) {
            casper.echo(data);
            done();
        });
        cp.stderr.on('data', function(data) {
            casper.echo(data);
            done();
        });
    }

});

casper.options.viewportSize = {width: 1600, height: 540};
casper.on('page.error', function(msg, trace) {
   this.echo('Error: ' + msg, 'ERROR');
   for(var i=0; i<trace.length; i++) {
       var step = trace[i];
       this.echo('   ' + step.file + ' (line ' + step.line + ')', 'ERROR');
   }
});

casper.test.begin('Load the page and navigate through', function(test) {
    casper.start('http://localhost:8000/', function() {
       // Wait for the first page of faces to load 
       this.waitForSelector('#page_2');
    });

    casper.then(function() {
        var faces = this.getElementsInfo('.products .product');
        test.assertEqual(faces.length, 52, '50 faces plus two adverts displayed');
        var ads = this.getElementsInfo('.products .ad');
        test.assertEqual(ads.length, 2, 'two adverts displayed');
    });

    casper.then(function() {
        this.scrollToBottom();
        this.waitForSelector('#page_3'); 
    });

    casper.then(function() {

        var isNextPageLoaded = function() {
            var faces = this.getElementsInfo('.products .product');
            var page3 = this.getElementsInfo('#page_3');
            return faces.length > 52 || page3.text.indexOf('~ end of catalogue ~') != -1;
        };
        test.assert(isNextPageLoaded.call(this), 'second page is loaded after scrolling to the bottom or end is reached');
    });

    casper.then(function() {
        if (cp) {
            casper.echo('Stop webserver...');
            cp.kill();
        }
        test.done();
    });
    
    casper.run();
});