module("picturePolyfill", {
	setup: function() {
		// Nothing here!
	},
	teardown: function() {
		$('#container').remove();
	}
});

test("main object is declared and exposed", function() {
	strictEqual(typeof window.picturePolyfill, 'object');
});

test("parses elements at DOMContentLoaded", function() {
	if (document.createEvent) {
		this.spy(picturePolyfill, "parse");
		var evt = document.createEvent("Event");
		evt.initEvent("DOMContentLoaded", true, true);
		document.dispatchEvent(evt);
		ok(picturePolyfill.parse.calledOnce);
	}
	else {
		ok(true);
	}
});

test("parses elements at resize", function() {
	if(document.createEvent) {
		this.spy(picturePolyfill, "parse");
		var evt = document.createEvent('UIEvents');
		evt.initUIEvent('resize', true, false,window,0);
		window.dispatchEvent(evt);
		this.clock.tick(100);
		ok(picturePolyfill.parse.calledOnce);
	}
	else {
		ok(true);
	}
});

if (!!("".trim)) {
	test("_getSrcsetHash correct behaviour, correct srcset format", function() {
		var srcset;
		// Single
		srcset = "http://placehold.it/4x4";
		deepEqual(picturePolyfill._getSrcsetHash(srcset), {
			"1x": "http://placehold.it/4x4"
		});
		// Single 2x
		srcset = "http://placehold.it/4x4 2x";
		deepEqual(picturePolyfill._getSrcsetHash(srcset), {
			"2x": "http://placehold.it/4x4"
		});
		// Double
		srcset = "http://placehold.it/4x4, http://placehold.it/8x8 2x";
		deepEqual(picturePolyfill._getSrcsetHash(srcset), {
			"1x": "http://placehold.it/4x4",
			"2x": "http://placehold.it/8x8"
		});
		// Triple
		srcset = "http://placehold.it/4x4, http://placehold.it/8x8 2x, http://placehold.it/12x12 3x";
		deepEqual(picturePolyfill._getSrcsetHash(srcset), {
			"1x": "http://placehold.it/4x4",
			"2x": "http://placehold.it/8x8",
			"3x": "http://placehold.it/12x12"
		});
		// Double with 1x and 3x
		srcset = "http://placehold.it/4x4, http://placehold.it/12x12 3x";
		deepEqual(picturePolyfill._getSrcsetHash(srcset), {
			"1x": "http://placehold.it/4x4",
			"3x": "http://placehold.it/12x12"
		});
	});
}

if (!!("".trim)) {
	test("_getSrcsetHash correct behaviour, messy srcset format", function () {
		var srcset;
		// Double with 1x and 2x -- EXTRA SPACES IN MIDDLE
		srcset = "http://placehold.it/4x4,  http://placehold.it/8x8 2x";
		deepEqual(picturePolyfill._getSrcsetHash(srcset), {
			"1x": "http://placehold.it/4x4",
			"2x": "http://placehold.it/8x8"
		});
		// Triple with 1x and 3x -- EXTRA SPACES EVERYWHERE
		srcset = "http://placehold.it/4x4   ,   http://placehold.it/12x12 3x";
		deepEqual(picturePolyfill._getSrcsetHash(srcset), {
			"1x": "http://placehold.it/4x4",
			"3x": "http://placehold.it/12x12"
		});
		// Single 2x with extra spaces
		srcset = "http://placehold.it/8x8   2x";
		deepEqual(picturePolyfill._getSrcsetHash(srcset), {
			"2x": "http://placehold.it/8x8"
		});
	});
}

test("_getSrcFromSrcsetHash correct behaviour, correct data", function() {
	var srcsetHash;
	// Get 1, 2 or 3 from 1x, 2x, 3x hash
	srcsetHash = {
		"1x": "http://placehold.it/4x4",
		"2x": "http://placehold.it/8x8",
		"3x": "http://placehold.it/12x12"
	};
	// Correct calls
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 1), 'http://placehold.it/4x4');
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 2), 'http://placehold.it/8x8');
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 3), 'http://placehold.it/12x12');
	// Extra bounds calls
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 4),  'http://placehold.it/12x12');
	// Impossible calls (.5 is rounded to 1, <1 is impossible)
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, .5), 'http://placehold.it/4x4');
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, -1), 'http://placehold.it/4x4');
});

test("_getSrcFromSrcsetHash correct behaviour, missing middle data", function() {
	var srcsetHash;
	// Get 1, 2 or 3 from 1x, 3x hash
	srcsetHash = {
		"1x": "http://placehold.it/4x4",
		"3x": "http://placehold.it/12x12"
	};
	// Correct calls
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 1), 'http://placehold.it/4x4');
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 3), 'http://placehold.it/12x12');
	// Extra bounds calls
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 4),  'http://placehold.it/12x12');
	// In the hole call
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 2), 'http://placehold.it/4x4');
	// Impossible calls (.5 is rounded to 1, <1 is impossible)
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, .5), 'http://placehold.it/4x4');
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, -1), 'http://placehold.it/4x4');
});

test("_getSrcFromSrcsetHash correct behaviour, missing first data", function() {
	var srcsetHash;
	// Get 1, 2 or 3 from 1x, 3x hash
	srcsetHash = {
		"2x": "http://placehold.it/8x8",
		"3x": "http://placehold.it/12x12"
	};
	// Correct calls
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 2), 'http://placehold.it/8x8');
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 3), 'http://placehold.it/12x12');
	// Extra bounds calls
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 4),  'http://placehold.it/12x12');
	// In the hole call
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 1), 'http://placehold.it/8x8');
	// Impossible calls (.5 is rounded to 1, <1 is impossible)
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, .5), 'http://placehold.it/8x8');
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, -1), 'http://placehold.it/8x8');
});

test("_getSrcFromSrcsetHash correct behaviour, empty hash", function() {
	var srcsetHash;
	// Get 1, 2 or 3 from 1x, 3x hash
	srcsetHash = {};
	// Correct calls
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, -1), null);
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash,  0), null);
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash,  1), null);
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash,  2), null);
});

test("_getSrcFromSourcesData behaves correctly", function() {
	if (picturePolyfill._areMediaQueriesSupported) {
		// Normal case
		var sourcesData = [
			{
				srcset: {
					"1x": "a.gif",
					"2x": "b.gif"
				}
			}
		];
		picturePolyfill._pixelRatio = 1;
		strictEqual(picturePolyfill._getSrcFromSourcesData(sourcesData), "a.gif");
		picturePolyfill._pixelRatio = 2;
		strictEqual(picturePolyfill._getSrcFromSourcesData(sourcesData), "b.gif");
		picturePolyfill._pixelRatio = 3;
		strictEqual(picturePolyfill._getSrcFromSourcesData(sourcesData), "b.gif");
		// With more MQs
		sourcesData.push({
			media: "(min-width: 1px)",
			srcset: {
				"1x": "c.gif",
				"2x": "d.gif"
			}
		});
		picturePolyfill._pixelRatio = 1;
		strictEqual(picturePolyfill._getSrcFromSourcesData(sourcesData), "c.gif");
		picturePolyfill._pixelRatio = 2;
		strictEqual(picturePolyfill._getSrcFromSourcesData(sourcesData), "d.gif");
		picturePolyfill._pixelRatio = 3;
		strictEqual(picturePolyfill._getSrcFromSourcesData(sourcesData), "d.gif");
	}
	else {
		ok(true);
	}

});

test("_createOrUpdateImage actually creates an image", function() {
	$('body').append('<div id="container">\
		<picture id="first" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/1x1">\
			<source srcset="http://placehold.it/4x4, http://placehold.it/8x8 2x"/>\
			<noscript><img src="http://placehold.it/1x1" alt="A beautiful responsive image"/></noscript>\
		</picture>\
	</div>');
	var pictureEl1 = document.getElementById('first');
	strictEqual(pictureEl1.getElementsByTagName('img').length, 0);
	picturePolyfill._createOrUpdateImage(pictureEl1, {src: 'http://placehold.it/1x1', alt: 'An image'});
	pictureEl1 = document.getElementById('first'); //retrieve it again, it might have been replaced
	strictEqual(pictureEl1.getElementsByTagName('img').length, 1);
	var imgEl = pictureEl1.getElementsByTagName('img')[0];
	strictEqual(imgEl.getAttribute('src'), 'http://placehold.it/1x1');
	strictEqual(imgEl.getAttribute('alt'), 'An image');
	picturePolyfill._createOrUpdateImage(pictureEl1, {src: 'http://placehold.it/2x2', alt: 'An image'});
	strictEqual(pictureEl1.getElementsByTagName('img').length, 1);
	imgEl = pictureEl1.getElementsByTagName('img')[0];
	strictEqual(imgEl.getAttribute('src'), 'http://placehold.it/2x2');
	strictEqual(imgEl.getAttribute('alt'), 'An image');
});

test("_getSourcesData correctly parses sources", function() {
	var pictureEl1, pictureEl2, returned1, returned2, expected1, expected2;
	if (picturePolyfill._areMediaQueriesSupported) {
		// PREPARE THE DOM
		$('body').append('<div id="container">\
			<div id="innerA">\
				<picture id="first" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/1x1">\
					<source srcset="http://placehold.it/4x4, http://placehold.it/8x8 2x"/>\
					<source srcset="http://placehold.it/5x5, http://placehold.it/5x5 2x" media="(min-width: 481px)"/>\
					<source srcset="http://placehold.it/7x7, http://placehold.it/14x14 2x" media="(min-width: 1025px)"/>\
					<source srcset="http://placehold.it/9x9, http://placehold.it/18x18 2x" media="(min-width: 1441px)"/>\
					<noscript><img src="http://placehold.it/1x1" alt="A beautiful responsive image"/></noscript>\
				</picture>\
			</div>\
			<div id="innerB">\
				<picture id="second" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/1x1">\
					<source src="http://placehold.it/4x4"/>\
					<source src="http://placehold.it/5x5" media="(min-width: 481px)"/>\
					<source src="http://placehold.it/7x7" media="(min-width: 1025px)"/>\
					<source src="http://placehold.it/9x9" media="(min-width: 1441px)"/>\
					<noscript><img src="http://placehold.it/1x1" alt="A beautiful responsive image"/></noscript>\
				</picture>\
			</div>\
		</div>');
		// Get the elements
		pictureEl1 = document.getElementById('first');
		pictureEl2 = document.getElementById('second');
		// Set expectations
		expected1 = [ { "srcset": { "1x": "http://placehold.it/4x4", "2x": "http://placehold.it/8x8" } }, { "media": "(min-width: 481px)", "srcset": { "1x": "http://placehold.it/5x5", "2x": "http://placehold.it/5x5" } }, { "media": "(min-width: 1025px)", "srcset": { "1x": "http://placehold.it/7x7", "2x": "http://placehold.it/14x14" } }, { "media": "(min-width: 1441px)", "srcset": { "1x": "http://placehold.it/9x9", "2x": "http://placehold.it/18x18" } } ];
		expected2 = [ { "src": "http://placehold.it/4x4" }, { "media": "(min-width: 481px)", "src": "http://placehold.it/5x5" }, { "media": "(min-width: 1025px)", "src": "http://placehold.it/7x7" }, { "media": "(min-width: 1441px)", "src": "http://placehold.it/9x9" } ];
		// Get the results
		returned1 = picturePolyfill._getSourcesData(pictureEl1);
		returned2 = picturePolyfill._getSourcesData(pictureEl2);
		// Compare them!
		deepEqual(returned1, expected1);
		deepEqual(returned2, expected2);
	}
	else {
		ok(true);
	}
});

test("parse() correct behaviour - with MQ support", function(){

	var images, img1src, img2src;

	$('body').append('<div id="container">\
		<div id="innerA">\
			<picture id="first" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/1x1">\
				<source srcset="http://placehold.it/4x4, http://placehold.it/8x8 2x"/>\
				<noscript><img src="http://placehold.it/1x1" alt="A beautiful responsive image"/></noscript>\
			</picture>\
		</div>\
		<div id="innerB">\
			<picture id="second" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/2x2">\
				<source src="http://placehold.it/4x4"/>\
				<noscript><img src="http://placehold.it/1x1" alt="A beautiful responsive image"/></noscript>\
			</picture>\
		</div>\
	</div>');

	// Testing number of calls when calling parse() on the whole document or on a single element

	this.spy(picturePolyfill, "_createOrUpdateImage");
	picturePolyfill.parse();
	ok(picturePolyfill._createOrUpdateImage.calledTwice);

	picturePolyfill._createOrUpdateImage.reset();
	picturePolyfill.parse(document.getElementById('innerA'));
	ok(picturePolyfill._createOrUpdateImage.calledOnce);

	// Testing number of created images

	images = document.getElementsByTagName('img');
	equal(images.length, 2);

	// Testing resulting image sources

	if (picturePolyfill._areMediaQueriesSupported) {

		// Media query support: yes, pixel density: 1

		picturePolyfill._pixelRatio = 1;
		picturePolyfill.parse();

		images = document.getElementsByTagName('img');
		img1src = images[0].getAttribute('src');
		img2src = images[1].getAttribute('src');

		strictEqual(img1src, 'http://placehold.it/4x4');
		strictEqual(img2src, 'http://placehold.it/4x4');

		// Media query support: yes, pixel density: 2

		picturePolyfill._pixelRatio = 2;
		picturePolyfill.parse();

		images = document.getElementsByTagName('img');
		img1src = images[0].getAttribute('src');
		img2src = images[1].getAttribute('src');

		strictEqual(img1src, 'http://placehold.it/8x8');
		strictEqual(img2src, 'http://placehold.it/4x4');
	}
});


test("parse() correct behaviour - without MQ support", function(){

	var images, img1src, img2src;

	$('body').append('<div id="container">\
		<div id="innerA">\
			<picture id="first" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/1x1">\
				<source srcset="http://placehold.it/4x4, http://placehold.it/8x8 2x"/>\
				<noscript><img src="http://placehold.it/1x1" alt="A beautiful responsive image"/></noscript>\
			</picture>\
		</div>\
		<div id="innerB">\
			<picture id="second" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/2x2">\
				<source src="http://placehold.it/4x4"/>\
				<noscript><img src="http://placehold.it/1x1" alt="A beautiful responsive image"/></noscript>\
			</picture>\
		</div>\
	</div>');

	// Testing number of calls when calling parse() on the whole document or on a single element

	this.spy(picturePolyfill, "_createOrUpdateImage");
	picturePolyfill.parse();
	ok(picturePolyfill._createOrUpdateImage.calledTwice);

	picturePolyfill._createOrUpdateImage.reset();
	picturePolyfill.parse(document.getElementById('innerA'));
	ok(picturePolyfill._createOrUpdateImage.calledOnce);

	// Testing number of created images

	images = document.getElementsByTagName('img');
	equal(images.length, 2);

	// Media query support: no, pixel density: indifferent

	var initial_areMediaQueriesSupported = picturePolyfill._areMediaQueriesSupported,
		initial_pixelRatio = picturePolyfill._pixelRatio;

	picturePolyfill._pixelRatio = null;
	picturePolyfill._areMediaQueriesSupported = false;
	picturePolyfill.parse();

	images = document.getElementsByTagName('img');
	img1src = images[0].getAttribute('src');
	img2src = images[1].getAttribute('src');

	strictEqual(img1src, 'http://placehold.it/1x1');
	strictEqual(img2src, 'http://placehold.it/2x2');

	// Restoring initial values

	picturePolyfill._areMediaQueriesSupported = initial_areMediaQueriesSupported;
	picturePolyfill._pixelRatio = initial_pixelRatio;

});


test("call parse won't give errors when polyfill isn't required", function() {
	this.spy(picturePolyfill, "parse");
	picturePolyfill.isNecessary = false;
	picturePolyfill.parse();
	strictEqual(picturePolyfill.parse.exceptions[0], undefined);
	picturePolyfill.isNecessary = true;
});