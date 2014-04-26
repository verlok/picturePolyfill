module("picturePolyfill", {
	setup: function() {
		// Nothing here!
	},
	teardown: function() {
		$('#testContainer').remove();
	}
});

if(!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(obj, start) {
		for (var i = (start || 0), j = this.length; i < j; i++) {
			if (this[i] === obj) { return i; }
		}
		return -1;
	}
}

test("main object is declared and exposed", function() {
	strictEqual(typeof window.picturePolyfill,            'object',   "picturePolyfill should be an object");
	strictEqual(typeof window.picturePolyfill.parse,      'function', "picturePolyfill.parse() should be a function")
	strictEqual(typeof window.picturePolyfill.initialize, 'function', "picturePolyfill.initialize() should be a function")
});

test("_getSrcFromArray correct behaviour, correct data, correct calls", function() {
	var srcsetArray;
	// Get 1, 2 or 3 from 1x, 2x, 3x hash
	srcsetArray = [
		{"pxr":0.25, "src":"http://placehold.it/1x1"},
		{"pxr":0.5,  "src":"http://placehold.it/2x2"},
		{"pxr":1,    "src":"http://placehold.it/4x4"},
		{"pxr":1.5,  "src":"http://placehold.it/6x6"},
		{"pxr":2,    "src":"http://placehold.it/8x8"},
		{"pxr":2.5,  "src":"http://placehold.it/10x10"},
		{"pxr":3,    "src":"http://placehold.it/12x12"}
	];
	// Correct calls
	strictEqual(picturePolyfill._getSrcFromArray(srcsetArray, 1),   'http://placehold.it/4x4',   "Single density element doesn't match");
	strictEqual(picturePolyfill._getSrcFromArray(srcsetArray, 1.5), 'http://placehold.it/6x6',   "1.5 density element doesn't match");
	strictEqual(picturePolyfill._getSrcFromArray(srcsetArray, 2),   'http://placehold.it/8x8',   "Double density element doesn't match");
	strictEqual(picturePolyfill._getSrcFromArray(srcsetArray, 3),   'http://placehold.it/12x12', "Triple density element doesn't match");
});

test("_getSrcFromArray correct behaviour, correct data, out of bound calls", function() {
	var srcsetArray;
	// Get 1, 2 or 3 from 1x, 3x hash
	srcsetArray = [
		{"pxr":1,    "src":"http://placehold.it/4x4"},
		{"pxr":2,    "src":"http://placehold.it/8x8"},
		{"pxr":3,    "src":"http://placehold.it/12x12"}
	];
	// Extra bounds calls
	strictEqual(picturePolyfill._getSrcFromArray(srcsetArray, 3.5), 'http://placehold.it/12x12', "Out of upper bound call should return upper in-bound value");
	strictEqual(picturePolyfill._getSrcFromArray(srcsetArray, 4),   'http://placehold.it/12x12', "Out of upper bound call should return upper in-bound value");
	strictEqual(picturePolyfill._getSrcFromArray(srcsetArray, .11), 'http://placehold.it/4x4',   "Out of lower bound call should return lower in-bound value");
	strictEqual(picturePolyfill._getSrcFromArray(srcsetArray, -1),  'http://placehold.it/4x4',   "Out or lower bound call should return lower in-bound value");
	strictEqual(picturePolyfill._getSrcFromArray(srcsetArray, 0),   'http://placehold.it/4x4',   "Out or lower bound call should return lower in-bound value");
});

test("_getSrcFromArray correct behaviour, correct data, infra-bound calls", function() {
	var srcsetArray;
	// Get 1, 2 or 3 from 1x, 3x hash
	srcsetArray = [
		{"pxr":1,    "src":"http://placehold.it/4x4"},
		{"pxr":2,    "src":"http://placehold.it/8x8"},
		{"pxr":3,    "src":"http://placehold.it/12x12"}
	];
	// Infra-bound calls
	strictEqual(picturePolyfill._getSrcFromArray(srcsetArray, 1.5),  'http://placehold.it/8x8',   "Infra-bound call should return immediate upper value");
	strictEqual(picturePolyfill._getSrcFromArray(srcsetArray, 1.75), 'http://placehold.it/8x8',   "Infra-bound call should return immediate upper value");
	strictEqual(picturePolyfill._getSrcFromArray(srcsetArray, 2.5),  'http://placehold.it/12x12', "Infra-bound call should return immediate upper value");
	strictEqual(picturePolyfill._getSrcFromArray(srcsetArray, 2.25), 'http://placehold.it/12x12', "Infra-bound call should return immediate upper value");
});

test("_getSrcFromArray correct behaviour, empty array", function() {
	var srcsetArray;
	// Get 1, 2 or 3 from 1x, 3x hash
	srcsetArray = [];
	// Correct calls
	strictEqual(picturePolyfill._getSrcFromArray(srcsetArray, -1), null, "If array is empty, null value must be returned");
	strictEqual(picturePolyfill._getSrcFromArray(srcsetArray,  0), null, "If array is empty, null value must be returned");
	strictEqual(picturePolyfill._getSrcFromArray(srcsetArray,  1), null, "If array is empty, null value must be returned");
	strictEqual(picturePolyfill._getSrcFromArray(srcsetArray,  2), null, "If array is empty, null value must be returned");
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
			{pxr: 1,   src: "http://placehold.it/4x4"},
			{pxr: 1.5, src: "http://placehold.it/6x6"},
			{pxr: 2,   src: "http://placehold.it/8x8"}
		];
		deepEqual(picturePolyfill._getSrcsetArray(srcset), expected, "Triple with decimals");

		// Double with 1x and 3x
		srcset = "http://placehold.it/4x4, http://placehold.it/12x12 3x";
		expected = [
			{pxr: 1,   src: "http://placehold.it/4x4"},
			{pxr: 3,   src: "http://placehold.it/12x12"}
		];
		deepEqual(picturePolyfill._getSrcsetArray(srcset), expected, "Double with 1x and 3x");

		// Double with .5x and 1x
		srcset = "http://placehold.it/2x2 .5x, http://placehold.it/4x4";
		expected = [
			{pxr: 0.5, src: "http://placehold.it/2x2"},
			{pxr: 1,   src: "http://placehold.it/4x4"}
		];
		deepEqual(picturePolyfill._getSrcsetArray(srcset), expected, "Double with .5x and 1x");

		// Double with 0.5x and 1x, leading 0
		srcset = "http://placehold.it/2x2 0.5x, http://placehold.it/4x4";
		expected = [
			{pxr: 0.5, src: "http://placehold.it/2x2"},
			{pxr: 1,   src: "http://placehold.it/4x4"}
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

test("_getSrcFromData behaves correctly", function() {
	if (!picturePolyfill._mqSupport) {
		ok(true);
	}
	else {
		// Normal case
		var sourcesData = [
			{
				srcset: [
					{pxr: 1, src: "a.gif"},
					{pxr: 2, src: "b.gif"}
				]
			}
		];
		picturePolyfill._pxRatio = 1;
		strictEqual(picturePolyfill._getSrcFromData(sourcesData), "a.gif");
		picturePolyfill._pxRatio = 2;
		strictEqual(picturePolyfill._getSrcFromData(sourcesData), "b.gif");
		picturePolyfill._pxRatio = 3;
		strictEqual(picturePolyfill._getSrcFromData(sourcesData), "b.gif");
		// With more MQs
		sourcesData.push({
			media: "(min-width: 1px)",
			srcset: [
				{pxr: 1, src: "c.gif"},
				{pxr: 2, src: "d.gif"}
			]
		});
		picturePolyfill._pxRatio = 1;
		strictEqual(picturePolyfill._getSrcFromData(sourcesData), "c.gif");
		picturePolyfill._pxRatio = 2;
		strictEqual(picturePolyfill._getSrcFromData(sourcesData), "d.gif");
		picturePolyfill._pxRatio = 3;
		strictEqual(picturePolyfill._getSrcFromData(sourcesData), "d.gif");
	}
});

test("_getSourcesData correctly parses sources", function() {
	if (!picturePolyfill._mqSupport) {
		ok(true);
	}
	else {
		var pictureEl1, pictureEl2, returned1, returned2, expected1, expected2;
		// PREPARE THE DOM
		$('body').append('<div id="testContainer">\
			<div id="innerA">\
				<picture id="first" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/1x1">\
					<source srcset="http://placehold.it/4x4, http://placehold.it/8x8 2x"/>\
					<source srcset="http://placehold.it/5x5, http://placehold.it/10x10 2x" media="(min-width: 481px)"/>\
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

		picturePolyfill.initialize();

		// Get the elements
		pictureEl1 = document.getElementById('first');
		pictureEl2 = document.getElementById('second');

		// Set expectations
		expected1 = [
			{"srcset": [{"pxr":1,"src":"http://placehold.it/4x4"}, {"pxr":2,"src":"http://placehold.it/8x8"}]},
			{"srcset": [{"pxr":1,"src":"http://placehold.it/5x5"}, {"pxr":2,"src":"http://placehold.it/10x10"}], "media":"(min-width: 481px)"},
			{"srcset": [{"pxr":1,"src":"http://placehold.it/7x7"}, {"pxr":2,"src":"http://placehold.it/14x14"}], "media":"(min-width: 1025px)"},
			{"srcset": [{"pxr":1,"src":"http://placehold.it/9x9"}, {"pxr":2,"src":"http://placehold.it/18x18"}], "media":"(min-width: 1441px)"}
		];
		expected2 = [
			{"src":"http://placehold.it/4x4"},
			{"src":"http://placehold.it/5x5", "media":"(min-width: 481px)"},
			{"src":"http://placehold.it/7x7", "media":"(min-width: 1025px)"},
			{"src":"http://placehold.it/9x9", "media":"(min-width: 1441px)"}
		];

		// Get the results
		returned1 = picturePolyfill._getSourcesData(pictureEl1);
		returned2 = picturePolyfill._getSourcesData(pictureEl2);

		// Compare them!
		deepEqual(returned1, expected1);
		deepEqual(returned2, expected2);
	}
});


test("_appendImg() actually appends an image", function() {
	var target, newImg;
	$('body').append('<div id="testContainer"></div>');
	target = document.getElementById('testContainer');
	picturePolyfill._appendImg(target, {
		src: 'http://placehold.it/1x1',
		alt: 'A brand new image'
	});
	newImg = target.getElementsByTagName('img')[0];
	strictEqual(newImg.getAttribute('src'), 'http://placehold.it/1x1');
	strictEqual(newImg.getAttribute('alt'), 'A brand new image');
});

test("_setAttrs adds all the attributes to an element", function() {
	var target, attributes;
	$('body').append('<div id="testContainer"></div>');
	target = document.getElementById('testContainer');
	attributes = {
		"title": "Hey!",
		"data-foo": "Bar"
	};
	picturePolyfill._setAttrs(target, attributes);
	strictEqual(target.getAttribute('title'), "Hey!");
	strictEqual(target.getAttribute('data-foo'), "Bar");
});

test("_getAttrsList and _getAttrs do their thing", function() {
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

test("_replacePicture creates a picture and the right image", function() {
	var original, pictures, images;
	$('body').append('<div id="testContainer">\
		<picture id="myPic" title="A title" data-foo="Bar">\
		<source src="http://placehold.it/2x2" />\
		</picture>\
	</div>');
	original = document.getElementById('myPic');
	picturePolyfill._replacePicture(original, {
		src: 'http://placehold.it/1x1',
		alt: 'Hey!'
	});
	pictures = document.getElementsByTagName('picture');
	strictEqual(pictures.length, 1);
	strictEqual(pictures[0].getAttribute('title'), "A title");
	strictEqual(pictures[0].getAttribute('data-foo'), "Bar");
	images = pictures[0].getElementsByTagName('img');
	strictEqual(images.length, 1);
	strictEqual(images[0].getAttribute('src'), 'http://placehold.it/1x1');
	strictEqual(images[0].getAttribute('alt'), 'Hey!');
});


test("_setImg should first create then update an image", function() {
	var testContainer, images;

	$('body').append('<div id="testContainer"></div>');
	testContainer = document.getElementById('testContainer');

	// No images at start
	strictEqual(testContainer.getElementsByTagName('img').length, 0);

	// First creation check
	picturePolyfill._setImg(testContainer, {src: 'http://placehold.it/1x1', alt: 'An image'});
	testContainer = document.getElementById('testContainer'); // retrieve again, might have been replaced
	images = testContainer.getElementsByTagName('img');
	strictEqual(images.length, 1);
	strictEqual(images[0].getAttribute('src'), 'http://placehold.it/1x1');
	strictEqual(images[0].getAttribute('alt'), 'An image');

	// Update check
	testContainer = document.getElementById('testContainer');
	picturePolyfill._setImg(testContainer, {src: 'http://placehold.it/2x2', alt: 'Another image'});
	testContainer = document.getElementById('testContainer'); // retrieve again, might have been replaced
	images = testContainer.getElementsByTagName('img');
	strictEqual(images.length, 1); // length is always 1
	strictEqual(images[0].getAttribute('src'), 'http://placehold.it/2x2'); //src is changes
	strictEqual(images[0].getAttribute('alt'), 'An image'); //alt didn't change

});

test("_setImg() should copy picture's width and height attributes to image", function() {
	var testContainer, images;

	$('body').append('<picture id="testContainer" width="666" height="69"></picture>');
	testContainer = document.getElementById('testContainer');

	// Check img width and height
	picturePolyfill._setImg(testContainer, {src: 'http://placehold.it/1x1', alt: 'An image'});
	testContainer = document.getElementById('testContainer');
	images = testContainer.getElementsByTagName('img');
	strictEqual(images.length, 1);

	strictEqual(images[0].getAttribute('width'), '666');
	strictEqual(images[0].getAttribute('height'), '69');
});

test("parse() is called at DOM ready", function() {
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

test("parse() is called at resize", function() {
	if (!document.createEvent) {
		ok(true);
	}
	else {
		this.spy(picturePolyfill, "parse");
		var evt = document.createEvent('UIEvents');
		evt.initUIEvent('resize', true, false,window,0);
		window.dispatchEvent(evt);
		this.clock.tick(100);
		ok(picturePolyfill.parse.calledOnce);
	}
});

test("parse() only parses passed element", function() {
	$('body').append('<div id="testContainer">\
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

	picturePolyfill.initialize();

	// Setting spies

	this.spy(picturePolyfill, "_setImg");

	// Testing number of calls when calling parse() on the whole document or on a single element

	picturePolyfill.parse();
	ok(picturePolyfill._setImg.calledTwice);

	picturePolyfill._setImg.reset();

	picturePolyfill.parse(document.getElementById('innerA'));
	ok(picturePolyfill._setImg.calledOnce);
});

test("parse() resulting image sources - with MQ support", function(){

	var images, img1src, img2src;

	$('body').append('<div id="testContainer">\
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

test("parse() resulting image sources - without MQ support", function(){

	var images, img1src, img2src;

	$('body').append('<div id="testContainer">\
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

});

test("_getSourcesData, _getSrcFromData, _getSrcFromArray mustn't be called from non MQ browsers", function() {

	$('body').append('<div id="testContainer">\
		<picture id="first" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/1x1">\
			<source srcset="http://placehold.it/4x4, http://placehold.it/8x8 2x"/>\
			<noscript><img src="http://placehold.it/1x1" alt="A beautiful responsive image"/></noscript>\
		</picture>\
	</div>');

	this.spy(picturePolyfill, "_getSourcesData");
	this.spy(picturePolyfill, "_getSrcFromData");
	this.spy(picturePolyfill, "_getSrcFromArray");

	picturePolyfill.initialize();

	var initial_mqSupport = picturePolyfill._mqSupport;

	picturePolyfill._mqSupport = false;
	picturePolyfill.parse();

	ok(picturePolyfill._getSourcesData.notCalled);
	ok(picturePolyfill._getSrcFromData.notCalled);
	ok(picturePolyfill._getSrcFromArray.notCalled);

	if (initial_mqSupport) {
		picturePolyfill._mqSupport = true;
		picturePolyfill.parse();
		ok(picturePolyfill._getSourcesData.called);
		ok(picturePolyfill._getSrcFromData.called);
		ok(picturePolyfill._getSrcFromArray.called);
	}

	picturePolyfill._mqSupport = initial_mqSupport;

});

test("parse() after a DOM injection (without MQ support)", function(){

	var images, img1src, img2src, $ajaxResponse;

	$('body').append('<div id="testContainer">\
		<div id="staticPictures">\
			<picture id="first" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/1x1">\
				<source srcset="http://placehold.it/4x4, http://placehold.it/8x8 2x"/>\
				<noscript><img src="http://placehold.it/1x1" alt="A beautiful responsive image"/></noscript>\
			</picture>\
		</div>\
		<div id="ajaxSection">\
		</div>\
	</div>');

	$ajaxResponse = $('<picture id="second" data-alt="A beautiful responsive image" data-default-src="http://placehold.it/2x2">\
		<source srcset="http://placehold.it/4x4, http://placehold.it/8x8 2x"/>\
		<noscript><img src="http://placehold.it/1x1" alt="A beautiful responsive image"/></noscript>\
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
	strictEqual(img1src, 'http://placehold.it/1x1');

	$('#ajaxSection').append($ajaxResponse);

	var ajaxSection = document.getElementById('ajaxSection');
	picturePolyfill.parse(ajaxSection);

	strictEqual(picturePolyfill.parse.getCalls().length, 2, "Parse has not been called exactly twice");

	images = document.getElementsByTagName('img');
	strictEqual(images.length, 2);

	img1src = images[0].getAttribute('src');
	img2src = images[1].getAttribute('src');

	strictEqual(img1src, 'http://placehold.it/1x1');
	strictEqual(img2src, 'http://placehold.it/2x2');

	// Restoring initial values

	picturePolyfill._mqSupport = initial_areMediaQueriesSupported;
	picturePolyfill._pxRatio = initial_pixelRatio;

});

test("call parse won't give errors when polyfill isn't required", function() {
	this.spy(picturePolyfill, "parse");
	picturePolyfill.initialize();

	var initial_isNecessary = picturePolyfill.isUseful;

	picturePolyfill.isUseful = false;
	picturePolyfill.parse();
	strictEqual(picturePolyfill.parse.exceptions[0], undefined);
	strictEqual(picturePolyfill.parse.getCall(0).returnValue, 0);

	picturePolyfill.isUseful = initial_isNecessary;
});