/*
 * TODO: Also read the srcset property on the img tag, in every test!
 *
 * TODO: Test no double ajax calls: IMG with empty src="" + data-default-src set
 * */

module("picturePolyfill", {
	setup: function () {
		// Nothing here!
	},
	teardown: function () {
		$('#testContainer').remove();
	}
});

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (obj, start) {
		for (var i = (start || 0), j = this.length; i < j; i++) {
			if (this[i] === obj) {
				return i;
			}
		}
		return -1;
	}
}

test("main object is declared and exposed", function () {
	strictEqual(typeof window.picturePolyfill, 'object', "picturePolyfill should be an object");
	strictEqual(typeof window.picturePolyfill.parse, 'function', "picturePolyfill.parse() should be a function");
	strictEqual(typeof window.picturePolyfill.initialize, 'function', "picturePolyfill.initialize() should be a function");
});

test("_getSrcFromSrcset correct behaviour, correct data, correct calls", function () {
	var srcset = "http://placehold.it/1x1 0.25x, http://placehold.it/2x2 0.5x, http://placehold.it/4x4, " +
		"http://placehold.it/6x6 1.5x, http://placehold.it/8x8 2x, http://placehold.it/10x10 2.5x, " +
		"http://placehold.it/12x12 3x";
	// Skipping tests on browsers that doesn't support trim
	if (typeof "".trim === "undefined") {
		ok(true);
	}
	else {
		// Correct calls
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, 1), 'http://placehold.it/4x4', "Single density element doesn't match");
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, 1.5), 'http://placehold.it/6x6', "1.5 density element doesn't match");
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, 2), 'http://placehold.it/8x8', "Double density element doesn't match");
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, 3), 'http://placehold.it/12x12', "Triple density element doesn't match");
	}
});

test("_getSrcFromSrcset correct behaviour, correct data, out of bounds and infra-bounds calls", function () {
	var errMsg, srcset = "http://placehold.it/4x4, http://placehold.it/8x8 2x, http://placehold.it/12x12 3x";

	// Skipping tests on browsers that doesn't support trim
	if (typeof "".trim === "undefined") {
		ok(true);
	}
	else {
		// Extra bounds calls
		errMsg = "Out of upper bound call should return upper in-bound value";
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, 3.5), 'http://placehold.it/12x12', errMsg);
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, 4), 'http://placehold.it/12x12', errMsg);

		errMsg = "Out of lower bound call should return lower in-bound value";
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, .11), 'http://placehold.it/4x4', errMsg);
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, -1), 'http://placehold.it/4x4', errMsg);
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, 0), 'http://placehold.it/4x4', errMsg);

		// Infra-bound calls
		errMsg = "Infra-bound call should return immediate upper value";
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, 1.5), 'http://placehold.it/8x8', errMsg);
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, 1.75), 'http://placehold.it/8x8', errMsg);
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, 2.5), 'http://placehold.it/12x12', errMsg);
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, 2.25), 'http://placehold.it/12x12', errMsg);
	}
});

test("_getSrcFromSrcset correct behaviour, empty srcset", function () {
	var errMsg, srcset;

	// Skipping tests on browsers that doesn't support trim
	if (typeof "".trim === "undefined") {
		ok(true);
	}
	else {
		srcset = "";
		errMsg = "If srcset is empty, empty value must be returned";
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, -1), "", errMsg);
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, 0), "", errMsg);
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, 1), "", errMsg);

		srcset = null;
		errMsg = "If srcset is null, null value must be returned";
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, -1), "", errMsg);
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, 0), "", errMsg);
		strictEqual(picturePolyfill._getSrcFromSrcset(srcset, 1), "", errMsg);
	}
});


test("_getSrcsetArray correct behaviour, correct srcset format", function () {
	if (!picturePolyfill._mqSupport) {
		ok(true);
	}
	else {
		var srcset, expected;

		// Single
		srcset = "http://placehold.it/4x4";
		expected = [
			{pxr: 1, src: "http://placehold.it/4x4"}
		];
		deepEqual(picturePolyfill._getSrcsetArray(srcset), expected, "Srcset formatted like src should return a single element with ratio 1");

		// Single 2x
		srcset = "http://placehold.it/8x8 2x";
		expected = [
			{pxr: 2, src: "http://placehold.it/8x8"}
		];
		deepEqual(picturePolyfill._getSrcsetArray(srcset), expected, "Single 2x input should return a single element with ratio 2");

		// Double with 1x
		srcset = "http://placehold.it/4x4 1x, http://placehold.it/8x8 2x";
		expected = [
			{pxr: 1, src: "http://placehold.it/4x4"},
			{pxr: 2, src: "http://placehold.it/8x8"}
		];
		deepEqual(picturePolyfill._getSrcsetArray(srcset), expected, "Double with 1x");

		// Double
		srcset = "http://placehold.it/4x4, http://placehold.it/8x8 2x";
		expected = [
			{pxr: 1, src: "http://placehold.it/4x4"},
			{pxr: 2, src: "http://placehold.it/8x8"}
		];
		deepEqual(picturePolyfill._getSrcsetArray(srcset), expected, "Double");

		// Triple
		srcset = "http://placehold.it/4x4, http://placehold.it/8x8 2x, http://placehold.it/12x12 3x";
		expected = [
			{pxr: 1, src: "http://placehold.it/4x4"},
			{pxr: 2, src: "http://placehold.it/8x8"},
			{pxr: 3, src: "http://placehold.it/12x12"}
		];
		deepEqual(picturePolyfill._getSrcsetArray(srcset), expected, "Triple");

		// Triple with decimals
		srcset = "http://placehold.it/4x4, http://placehold.it/6x6 1.5x, http://placehold.it/8x8 2x";
		expected = [
			{pxr: 1, src: "http://placehold.it/4x4"},
			{pxr: 1.5, src: "http://placehold.it/6x6"},
			{pxr: 2, src: "http://placehold.it/8x8"}
		];
		deepEqual(picturePolyfill._getSrcsetArray(srcset), expected, "Triple with decimals");

		// Double with 1x and 3x
		srcset = "http://placehold.it/4x4, http://placehold.it/12x12 3x";
		expected = [
			{pxr: 1, src: "http://placehold.it/4x4"},
			{pxr: 3, src: "http://placehold.it/12x12"}
		];
		deepEqual(picturePolyfill._getSrcsetArray(srcset), expected, "Double with 1x and 3x");

		// Double with .5x and 1x
		srcset = "http://placehold.it/2x2 .5x, http://placehold.it/4x4";
		expected = [
			{pxr: 0.5, src: "http://placehold.it/2x2"},
			{pxr: 1, src: "http://placehold.it/4x4"}
		];
		deepEqual(picturePolyfill._getSrcsetArray(srcset), expected, "Double with .5x and 1x");

		// Double with 0.5x and 1x, leading 0
		srcset = "http://placehold.it/2x2 0.5x, http://placehold.it/4x4";
		expected = [
			{pxr: 0.5, src: "http://placehold.it/2x2"},
			{pxr: 1, src: "http://placehold.it/4x4"}
		];
		deepEqual(picturePolyfill._getSrcsetArray(srcset), expected, "Double with 0.5x and 1x, leading 0");
	}
});

test("_getSrcsetArray correct behaviour, messy srcset format", function () {
	if (!picturePolyfill._mqSupport) {
		ok(true);
	}
	else {
		var srcset, expected;

		// Double with 1x and 2x -- EXTRA SPACES IN THE MIDDLE
		srcset = "http://placehold.it/4x4,   http://placehold.it/8x8 2x";
		expected = [
			{pxr: 1, src: "http://placehold.it/4x4"},
			{pxr: 2, src: "http://placehold.it/8x8"}
		];
		deepEqual(picturePolyfill._getSrcsetArray(srcset), expected, "Double with 1x and 2x -- EXTRA SPACES IN THE MIDDLE");

		// Double with 1x and 3x -- EXTRA SPACES EVERYWHERE
		srcset = "http://placehold.it/4x4   ,   http://placehold.it/12x12 3x";
		expected = [
			{pxr: 1, src: "http://placehold.it/4x4"},
			{pxr: 3, src: "http://placehold.it/12x12"}
		];
		deepEqual(picturePolyfill._getSrcsetArray(srcset), expected, "Double with 1x and 3x -- EXTRA SPACES EVERYWHERE");

		// Single 2x with extra spaces
		srcset = "http://placehold.it/8x8    2x";
		expected = [
			{pxr: 2, src: "http://placehold.it/8x8"}
		];
		deepEqual(picturePolyfill._getSrcsetArray(srcset), expected, "Single 2x with extra spaces");
	}
});

test("_getSrcsetArray correct behaviour, empty srcset value", function () {
	if (!picturePolyfill._mqSupport) {
		ok(true);
	}
	else {
		var srcset, expected;

		// Empty srcset
		srcset = "";
		deepEqual(picturePolyfill._getSrcsetArray(srcset), []);

		// Null srcset
		srcset = null;
		deepEqual(picturePolyfill._getSrcsetArray(srcset), []);
	}
});


test("_getSrcsetFromData behaves correctly", function () {
	if (!picturePolyfill._mqSupport) {
		ok(true);
	}
	else {
		// Normal case

		var sourcesData = [
			{
				media: "(min-width: 300px)",
				srcset: [
					{pxr: 1, src: "300.gif"},
					{pxr: 2, src: "600.gif"}
				]
			},
			{
				media: "(min-width: 200px)",
				srcset: [
					{pxr: 1, src: "200.gif"},
					{pxr: 2, src: "400.gif"}
				]
			},
			{
				media: "(min-width: 100px)",
				srcset: [
					{pxr: 1, src: "100.gif"},
					{pxr: 2, src: "200.gif"}
				]
			},
			{
				srcset: [
					{pxr: 1, src: "50.gif"},
					{pxr: 2, src: "100.gif"}
				]
			}
		];

		var negative = {matches: false};
		var positive = {matches: true};

		var matchMediaStub = this.stub(window, 'matchMedia');

		// Testing width < 100px

		matchMediaStub.withArgs("(min-width: 300px)").returns(negative);
		matchMediaStub.withArgs("(min-width: 200px)").returns(negative);
		matchMediaStub.withArgs("(min-width: 100px)").returns(negative);
		matchMediaStub.withArgs(null).returns(positive);
		deepEqual(picturePolyfill._getSrcsetFromData(sourcesData), [
			{pxr: 1, src: "50.gif"},
			{pxr: 2, src: "100.gif"}
		]);

		// Testing width @ 100px

		matchMediaStub.withArgs("(min-width: 100px)").returns(positive);
		deepEqual(picturePolyfill._getSrcsetFromData(sourcesData), [
			{pxr: 1, src: "100.gif"},
			{pxr: 2, src: "200.gif"}
		]);

		// Testing width @ 200px

		matchMediaStub.withArgs("(min-width: 200px)").returns(positive);
		deepEqual(picturePolyfill._getSrcsetFromData(sourcesData), [
			{pxr: 1, src: "200.gif"},
			{pxr: 2, src: "400.gif"}
		]);

		// Testing width @ 300px

		matchMediaStub.withArgs("(min-width: 300px)").returns(positive);
		deepEqual(picturePolyfill._getSrcsetFromData(sourcesData), [
			{pxr: 1, src: "300.gif"},
			{pxr: 2, src: "600.gif"}
		]);


	}
});

test("_getSourcesData correctly parses sources", function () {
	if (!picturePolyfill._mqSupport) {
		ok(true);
	}
	else {
		var pictureEl1, pictureEl2, returned1, returned2, expected1, expected2;
		// PREPARE THE DOM
		$('body').append('<div id="testContainer">\
			<div id="innerA">\
				<picture id="first" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/1x1">\
					<source srcset="http://placehold.it/9x9, http://placehold.it/18x18 2x" media="(min-width: 1441px)"/>\
					<source srcset="http://placehold.it/7x7, http://placehold.it/14x14 2x" media="(min-width: 1025px)"/>\
					<source srcset="http://placehold.it/5x5, http://placehold.it/10x10 2x" media="(min-width: 481px)"/>\
					<source srcset="http://placehold.it/4x4, http://placehold.it/8x8 2x"/>\
					<img src="http://placehold.it/1x1" alt="A beautiful responsive image"/>\
				</picture>\
			</div>\
			<div id="innerB">\
				<picture id="second" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/1x1">\
					<source src="http://placehold.it/9x9" media="(min-width: 1441px)"/>\
					<source src="http://placehold.it/7x7" media="(min-width: 1025px)"/>\
					<source src="http://placehold.it/5x5" media="(min-width: 481px)"/>\
					<source src="http://placehold.it/4x4"/>\
					<img src="http://placehold.it/1x1" alt="A beautiful responsive image"/>\
				</picture>\
			</div>\
		</div>');

		picturePolyfill.initialize();

		// Get the elements
		pictureEl1 = document.getElementById('first');
		pictureEl2 = document.getElementById('second');

		// Set expectations
		expected1 = [
			{"srcset": "http://placehold.it/9x9, http://placehold.it/18x18 2x", "media": "(min-width: 1441px)"},
			{"srcset": "http://placehold.it/7x7, http://placehold.it/14x14 2x", "media": "(min-width: 1025px)"},
			{"srcset": "http://placehold.it/5x5, http://placehold.it/10x10 2x", "media": "(min-width: 481px)"},
			{"srcset": "http://placehold.it/4x4, http://placehold.it/8x8 2x"}
		];
		expected2 = [
			{"src": "http://placehold.it/9x9", "media": "(min-width: 1441px)"},
			{"src": "http://placehold.it/7x7", "media": "(min-width: 1025px)"},
			{"src": "http://placehold.it/5x5", "media": "(min-width: 481px)"},
			{"src": "http://placehold.it/4x4"}
		];

		// Get the results
		returned1 = picturePolyfill._getSourcesData(pictureEl1);
		returned2 = picturePolyfill._getSourcesData(pictureEl2);

		// Compare them!
		deepEqual(returned1, expected1);
		deepEqual(returned2, expected2);
	}
});

test("_getAttrsList and _getAttrs do their thing", function () {
	var source, attributesList, attributes;
	$('body').append('<div id="testContainer" title="Hey!" data-foo="Bar"></div>');
	source = document.getElementById('testContainer');
	// Check attrs list
	attributesList = picturePolyfill._getAttrsList(source);
	ok(attributesList.indexOf('id') > -1);
	ok(attributesList.indexOf('title') > -1);
	ok(attributesList.indexOf('data-foo') > -1);
	// Check attrs values
	attributes = picturePolyfill._getAttrs(source, attributesList);
	strictEqual(attributes['id'], "testContainer");
	strictEqual(attributes['title'], "Hey!");
	strictEqual(attributes['data-foo'], "Bar");
});

test("parse() is called at DOM ready", function () {
	if (!document.createEvent) {
		ok(true);
	}
	else {
		this.spy(picturePolyfill, "parse");
		var evt = document.createEvent("Event");
		evt.initEvent("DOMContentLoaded", true, true);
		document.dispatchEvent(evt);
		ok(picturePolyfill.parse.calledOnce);
	}
});

test("parse() is called at resize", function () {
	if (!document.createEvent) {
		ok(true);
	}
	else {
		this.spy(picturePolyfill, "parse");
		var evt = document.createEvent('UIEvents');
		evt.initUIEvent('resize', true, false, window, 0);
		window.dispatchEvent(evt);
		this.clock.tick(100);
		ok(picturePolyfill.parse.calledOnce);
	}
});

test("parse() won't do anything if img tag is missing", function () {
	$('body').append('<div id="testContainer">\
		<div id="innerA">\
			<picture id="first" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/1x1">\
				<source srcset="http://placehold.it/4x4, http://placehold.it/8x8 2x"/>\
			</picture>\
		</div>\
	</div>');

	picturePolyfill.initialize();
	picturePolyfill.parse();

	var images = $('picture').find('img');
	strictEqual(images.length, 0, "No images should be in the document")
});


test("parse() only parses passed element", function () {
	$('body').append('<div id="testContainer">\
		<div id="innerA">\
			<picture id="first" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/1x1">\
				<source srcset="http://placehold.it/4x4, http://placehold.it/8x8 2x"/>\
				<img src="http://placehold.it/1x1" alt="A beautiful responsive image"/>\
			</picture>\
		</div>\
		<div id="innerB">\
			<picture id="second" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/2x2">\
				<source src="http://placehold.it/4x4"/>\
				<img src="http://placehold.it/1x1" alt="A beautiful responsive image"/>\
			</picture>\
		</div>\
	</div>');

	picturePolyfill.initialize();

	// Setting spies

	this.spy(picturePolyfill, "_setImgAttributes");

	// Testing number of calls when calling parse() on the whole document or on a single element

	picturePolyfill.parse();
	ok(picturePolyfill._setImgAttributes.calledTwice);

	picturePolyfill._setImgAttributes.reset();

	picturePolyfill.parse(document.getElementById('innerA'));
	ok(picturePolyfill._setImgAttributes.calledOnce);
});

test("parse() resulting image sources - with MQ support", function () {

	var images, img1src, img2src;

	$('body').append('<div id="testContainer">\
		<div id="innerA">\
			<picture id="first" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/1x1">\
				<source srcset="http://placehold.it/4x4, http://placehold.it/8x8 2x"/>\
				<img src="http://placehold.it/1x1" alt="A beautiful responsive image"/>\
			</picture>\
		</div>\
		<div id="innerB">\
			<picture id="second" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/2x2">\
				<source src="http://placehold.it/4x4"/>\
				<img src="http://placehold.it/1x1" alt="A beautiful responsive image"/>\
			</picture>\
		</div>\
	</div>');

	if (!picturePolyfill._mqSupport) { // EXCLUDING OLD IE FROM THIS TESTS
		ok(true);
	}
	else {
		picturePolyfill.initialize();

		// Media query support: yes, pixel density: 1

		picturePolyfill._pxRatio = 1;
		picturePolyfill.parse();

		images = document.getElementsByTagName('img');
		img1src = images[0].getAttribute('src');
		img2src = images[1].getAttribute('src');

		strictEqual(img1src, 'http://placehold.it/4x4');
		strictEqual(img2src, 'http://placehold.it/4x4');

		// Media query support: yes, pixel density: 2

		picturePolyfill._pxRatio = 2;
		picturePolyfill.parse();

		images = document.getElementsByTagName('img');
		img1src = images[0].getAttribute('src');
		img2src = images[1].getAttribute('src');

		strictEqual(img1src, 'http://placehold.it/8x8');
		strictEqual(img2src, 'http://placehold.it/4x4');
	}
});

test("parse() resulting image sources - without MQ support", function () {

	var images, img1src, img2src;

	$('body').append('<div id="testContainer">\
		<div id="innerA">\
			<picture id="first" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/1x1">\
				<source srcset="http://placehold.it/4x4, http://placehold.it/8x8 2x"/>\
				<img src="http://placehold.it/1x1" alt="A beautiful responsive image"/>\
			</picture>\
		</div>\
		<div id="innerB">\
			<picture id="second" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/2x2">\
				<source src="http://placehold.it/4x4"/>\
				<img src="http://placehold.it/1x1" alt="A beautiful responsive image"/>\
			</picture>\
		</div>\
	</div>');

	if (!picturePolyfill._mqSupport) { // EXCLUDING OLD IE FROM THIS TESTS - but why?!
		ok(true);
	}
	else {
		picturePolyfill.initialize();

		// Media query support: no, pixel density: indifferent

		var initial_areMediaQueriesSupported = picturePolyfill._mqSupport,
			initial_pixelRatio = picturePolyfill._pxRatio;

		picturePolyfill._pxRatio = null;
		picturePolyfill._mqSupport = false;
		picturePolyfill.parse();

		images = document.getElementsByTagName('img');
		img1src = images[0].getAttribute('src');
		img2src = images[1].getAttribute('src');

		strictEqual(img1src, 'http://placehold.it/1x1');
		strictEqual(img2src, 'http://placehold.it/2x2');

		// Restoring initial values

		picturePolyfill._mqSupport = initial_areMediaQueriesSupported;
		picturePolyfill._pxRatio = initial_pixelRatio;

	}


});

test("parse() after a DOM injection (without MQ support)", function () {

	var images, img1src, img2src, $ajaxResponse;

	$('body').append('<div id="testContainer">\
		<div id="staticPictures">\
			<picture id="first" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/4x4">\
				<source srcset="http://placehold.it/4x4, http://placehold.it/8x8 2x"/>\
				<img src="http://placehold.it/4x4" alt="A beautiful responsive image"/>\
			</picture>\
		</div>\
		<div id="ajaxSection">\
		</div>\
	</div>');

	$ajaxResponse = $('<picture id="second" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/4x4/B15">\
		<source srcset="http://placehold.it/4x4/B15, http://placehold.it/8x8/B15 2x"/>\
		<img src="http://placehold.it/4x4/B15" alt="A beautiful responsive image"/>\
	</picture>');

	this.spy(picturePolyfill, "parse");

	picturePolyfill.initialize();

	// Media query support: no, pixel density: indifferent

	var initial_areMediaQueriesSupported = picturePolyfill._mqSupport,
		initial_pixelRatio = picturePolyfill._pxRatio;

	picturePolyfill._pxRatio = null;
	picturePolyfill._mqSupport = false;
	picturePolyfill.parse();

	strictEqual(picturePolyfill.parse.getCalls().length, 1, "Parse has not been called exactly once");

	images = document.getElementsByTagName('img');
	strictEqual(images.length, 1);

	img1src = images[0].getAttribute('src');
	strictEqual(img1src, 'http://placehold.it/4x4');

	$('#ajaxSection').append($ajaxResponse);

	var ajaxSection = document.getElementById('ajaxSection');
	picturePolyfill.parse(ajaxSection);

	strictEqual(picturePolyfill.parse.getCalls().length, 2, "Parse has not been called exactly twice");

	images = document.getElementsByTagName('img');
	strictEqual(images.length, 2);

	img1src = images[0].getAttribute('src');
	img2src = images[1].getAttribute('src');

	strictEqual(img1src, 'http://placehold.it/4x4');
	strictEqual(img2src, 'http://placehold.it/4x4/B15');

	// Restoring initial values

	picturePolyfill._mqSupport = initial_areMediaQueriesSupported;
	picturePolyfill._pxRatio = initial_pixelRatio;

});

test("parse() with readFromCache true, then false", function () {

	var images, img1src, img2src, img1srcset, img2srcset;

	$('body').append('<div id="testContainer">\
		<div id="innerA">\
			<picture id="first" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/2x2">\
				<source srcset="http://placehold.it/4x4, http://placehold.it/8x8 2x"/>\
				<img src="http://placehold.it/1x1" alt="A beautiful responsive image"/>\
			</picture>\
		</div>\
		<div id="innerB">\
			<picture id="second" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/2x2">\
				<source src="http://placehold.it/4x4"/>\
				<img src="http://placehold.it/1x1" alt="A beautiful responsive image"/>\
			</picture>\
		</div>\
	</div>');

	if (!picturePolyfill._mqSupport) { // EXCLUDING OLD IE FROM THIS TESTS
		ok(true);
	}
	else {
		picturePolyfill.initialize();

		// Media query support: no, pixel density: indifferent

		var initial_areMediaQueriesSupported = picturePolyfill._mqSupport,
			initial_pixelRatio = picturePolyfill._pxRatio;

		picturePolyfill._pxRatio = 2;
		//picturePolyfill._mqSupport = true;

		// Parse with readFromCache true (default value)

		picturePolyfill.parse(document);

		images = document.getElementsByTagName('img');

		img1src = images[0].getAttribute('src');
		img2src = images[1].getAttribute('src');
		img1srcset = images[0].getAttribute('srcset');
		img2srcset = images[1].getAttribute('srcset');

		var errMsg = "Parsing the first time readFromCache true should give the expected results";
		if (picturePolyfill._mqSupport) {
			strictEqual(img1src, 'http://placehold.it/8x8', errMsg);
			strictEqual(img2src, 'http://placehold.it/4x4', errMsg);
			strictEqual(img1srcset, 'http://placehold.it/4x4, http://placehold.it/8x8 2x', errMsg);
			strictEqual(img2srcset, 'http://placehold.it/4x4', errMsg);
		}
		else {
			strictEqual(img1src, 'http://placehold.it/2x2', errMsg);
			strictEqual(img2src, 'http://placehold.it/2x2', errMsg);
			strictEqual(img1srcset, 'http://placehold.it/2x2', errMsg);
			strictEqual(img2srcset, 'http://placehold.it/2x2', errMsg);
		}

		// CHANGING THE DOM

		var $sources = $('picture').find('source');
		$sources.eq(0).attr('srcset', 'http://placehold.it/333x333, http://placehold.it/666x666 2x');
		$sources.eq(1).attr('src', 'http://placehold.it/222x222');

		// Parsing again with readFromCache true should present the same results of before

		picturePolyfill.parse(document);

		img1src = images[0].getAttribute('src');
		img2src = images[1].getAttribute('src');
		img1srcset = images[0].getAttribute('srcset');
		img2srcset = images[1].getAttribute('srcset');

		errMsg = "Parsing again with readFromCache true should present the same img src and srcset of before";
		if (picturePolyfill._mqSupport) {
			strictEqual(img1src, 'http://placehold.it/8x8', errMsg);
			strictEqual(img2src, 'http://placehold.it/4x4', errMsg);
			strictEqual(img1srcset, 'http://placehold.it/4x4, http://placehold.it/8x8 2x', errMsg);
			strictEqual(img2srcset, 'http://placehold.it/4x4', errMsg);
		}
		else {
			strictEqual(img1src, 'http://placehold.it/2x2', errMsg);
			strictEqual(img2src, 'http://placehold.it/2x2', errMsg);
			strictEqual(img1srcset, 'http://placehold.it/2x2', errMsg);
			strictEqual(img2srcset, 'http://placehold.it/2x2', errMsg);
		}


		// Parse with readFromCache false should change the value of the images src attribute

		picturePolyfill.parse(document, false);

		img1src = images[0].getAttribute('src');
		img2src = images[1].getAttribute('src');
		img1srcset = images[0].getAttribute('srcset');
		img2srcset = images[1].getAttribute('srcset');

		errMsg = "Parsing again with readFromCache false should refresh the resulting img src and srcset";
		strictEqual(img1src, 'http://placehold.it/666x666', errMsg);
		strictEqual(img2src, 'http://placehold.it/222x222', errMsg);
		strictEqual(img1srcset, 'http://placehold.it/333x333, http://placehold.it/666x666 2x', errMsg);
		strictEqual(img2srcset, 'http://placehold.it/222x222');
		// Restoring initial values

		picturePolyfill._mqSupport = initial_areMediaQueriesSupported;
		picturePolyfill._pxRatio = initial_pixelRatio;
	}
});

test("parse() with contained img having both src and srcset attributes set", function () {

	var images, img1src, img1srcset, img2src, img2srcset, errMsg;

	$('body').append('<div id="testContainer">\
		<picture id="first" data-alt="A" data-default-src="http://placehold.it/2x2">\
			<source media="(min-width:1px)" src="http://placehold.it/4x4" srcset="http://placehold.it/4x4, http://placehold.it/8x8 2x"/>\
			<img src="http://placehold.it/2x2" srcset="http://placehold.it/2x2, http://placehold.it/4x4 2x" alt="A"/>\
		</picture>\
		<picture id="second" data-alt="A" data-default-src="http://placehold.it/2x2">\
			<source media="(min-width:9999px)" src="http://placehold.it/4x4" srcset="http://placehold.it/4x4, http://placehold.it/8x8 2x"/>\
			<img src="http://placehold.it/2x2" srcset="http://placehold.it/2x2, http://placehold.it/4x4 2x" alt="A"/>\
		</picture>\
	</div>');

	picturePolyfill.initialize();

	var initial_pixelRatio = picturePolyfill._pxRatio;

	picturePolyfill._pxRatio = 2;

	// Matching sources
	picturePolyfill.parse(document);

	images = document.getElementsByTagName('img');

	img1src = images[0].getAttribute('src');
	img1srcset = images[0].getAttribute('srcset');

	errMsg = "Img src and srcset should have changed";
	if (picturePolyfill._mqSupport) {
		strictEqual(img1src, 'http://placehold.it/8x8', errMsg);
		strictEqual(img1srcset, 'http://placehold.it/4x4, http://placehold.it/8x8 2x', errMsg);
	}
	else {
		strictEqual(img1src, 'http://placehold.it/2x2', errMsg);
		strictEqual(img1srcset, null, errMsg);
	}

	// Not matching sources
	img2src = images[1].getAttribute('src');
	img2srcset = images[1].getAttribute('srcset');

	// TODO: FIX - CURRENTLY RETURNS NULL SRC AND SRCSET

	errMsg = "Img src and srcset shouldn't have changed";
	if (picturePolyfill._mqSupport) {
		strictEqual(img2src, 'http://placehold.it/2x2', errMsg);
		strictEqual(img2srcset, 'http://placehold.it/2x2, http://placehold.it/4x4 2x', errMsg);
	}
	else {
		strictEqual(img2src, 'http://placehold.it/2x2', errMsg);
		strictEqual(img2srcset, null, errMsg);
	}

	picturePolyfill._pxRatio = initial_pixelRatio;

});


test("call parse won't give errors when polyfill isn't required", function () {
	this.spy(picturePolyfill, "parse");
	picturePolyfill.initialize();

	var initial_isNecessary = picturePolyfill.isUseful;

	picturePolyfill.isUseful = false;
	picturePolyfill.parse();
	strictEqual(picturePolyfill.parse.exceptions[0], undefined);
	strictEqual(picturePolyfill.parse.getCall(0).returnValue, 0);

	picturePolyfill.isUseful = initial_isNecessary;
});