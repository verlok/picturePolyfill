module("picturePolyfill", {
	setup: function() {
		$('body').append('<div id="container">\
			<div id="innerA">\
				<picture id="first" data-alt="A beautiful responsive image" data-default-src="default.gif">\
					<source srcset="img/480x480.gif, img/480x480x2.gif 2x"/>\
					<source srcset="img/512x512.gif, img/512x512x2.gif 2x" media="(min-width: 481px)"/>\
					<source srcset="img/720x720.gif, img/720x720x2.gif 2x" media="(min-width: 1025px)"/>\
					<source srcset="img/960x960.gif, img/960x960x2.gif 2x" media="(min-width: 1441px)"/>\
					<noscript>\
						<img src="img/960x960.gif" alt="A beautiful responsive image"/>\
					</noscript>\
				</picture>\
			</div>\
			<div id="innerB">\
				<picture id="second" data-alt="A beautiful responsive image" data-default-src="default.gif">\
					<source src="img/480x480.gif"/>\
					<source src="img/512x512.gif" media="(min-width: 481px)"/>\
					<source src="img/720x720.gif" media="(min-width: 1025px)"/>\
					<source src="img/960x960.gif" media="(min-width: 1441px)"/>\
					<noscript>\
						<img src="img/960x960.gif" alt="A beautiful responsive image"/>\
					</noscript>\
				</picture>\
			</div>\
		</div>');
	},
	teardown: function() {
		$('#container').remove();
	}
});

test("main object is declared and exposed", function() {
	strictEqual(typeof window.picturePolyfill, 'object');
});

test("parses elements at DOMContentLoaded", function() {
	picturePolyfill.initialize();
	this.spy(picturePolyfill, "parsePictures");
	var evt = document.createEvent("Event");
	evt.initEvent("DOMContentLoaded", true, true);
	document.dispatchEvent(evt);
	ok(picturePolyfill.parsePictures.calledOnce);
});

test("parses elements at resize", function() {
	picturePolyfill.initialize();
	this.spy(picturePolyfill, "parsePictures");
	var evt = document.createEvent('UIEvents');
	evt.initUIEvent('resize', true, false,window,0);
	window.dispatchEvent(evt);
	this.clock.tick(100);
	ok(picturePolyfill.parsePictures.calledOnce);
});

test("getSrcsetHash correct behaviour, correct srcset format", function() {
	var srcset;
	picturePolyfill.initialize();
	// Single
	srcset = "img/480x480.gif";
	deepEqual(picturePolyfill._getSrcsetHash(srcset), {
		"1x": "img/480x480.gif"
	});
	// Single 2x
	srcset = "img/480x480.gif 2x";
	deepEqual(picturePolyfill._getSrcsetHash(srcset), {
		"2x": "img/480x480.gif"
	});
	// Double
	srcset = "img/480x480.gif, img/480x480x2.gif 2x";
	deepEqual(picturePolyfill._getSrcsetHash(srcset), {
		"1x": "img/480x480.gif",
		"2x": "img/480x480x2.gif"
	});
	// Triple
	srcset = "img/480x480.gif, img/480x480x2.gif 2x, img/480x480x3.gif 3x";
	deepEqual(picturePolyfill._getSrcsetHash(srcset), {
		"1x": "img/480x480.gif",
		"2x": "img/480x480x2.gif",
		"3x": "img/480x480x3.gif"
	});
	// Double with 1x and 3x
	srcset = "img/480x480.gif, img/480x480x3.gif 3x";
	deepEqual(picturePolyfill._getSrcsetHash(srcset), {
		"1x": "img/480x480.gif",
		"3x": "img/480x480x3.gif"
	});
});


test("_getSrcsetHash correct behaviour, messy srcset format", function() {
	var srcset;
	picturePolyfill.initialize();
	// Double with 1x and 2x -- EXTRA SPACES IN MIDDLE
	srcset = "img/480x480.gif,  img/480x480x2.gif 2x";
	deepEqual(picturePolyfill._getSrcsetHash(srcset), {
		"1x": "img/480x480.gif",
		"2x": "img/480x480x2.gif"
	});
	// Triple with 1x and 3x -- EXTRA SPACES EVERYWHERE
	srcset = "    img/480x480.gif   ,   img/480x480x3.gif 3x  ";
	deepEqual(picturePolyfill._getSrcsetHash(srcset), {
		"1x": "img/480x480.gif",
		"3x": "img/480x480x3.gif"
	});
	// Single 2x with extra spaces
	srcset = "  img/480x480x2.gif   2x  ";
	deepEqual(picturePolyfill._getSrcsetHash(srcset), {
		"2x": "img/480x480x2.gif"
	});
});

test("_getSrcFromSrcsetHash correct behaviour, correct data", function() {
	var srcsetHash;
	picturePolyfill.initialize();
	// Get 1, 2 or 3 from 1x, 2x, 3x hash
	srcsetHash = {
		"1x": "img/480x480.gif",
		"2x": "img/480x480x2.gif",
		"3x": "img/480x480x3.gif"
	};
	// Correct calls
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 1), 'img/480x480.gif');
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 2), 'img/480x480x2.gif');
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 3), 'img/480x480x3.gif');
	// Extra bounds calls
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 4),  'img/480x480x3.gif');
	// Impossible calls (.5 is rounded to 1, <1 is impossible)
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, .5), 'img/480x480.gif');
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, -1), 'img/480x480.gif');
});

test("_getSrcFromSrcsetHash correct behaviour, missing middle data", function() {
	var srcsetHash;
	picturePolyfill.initialize();
	// Get 1, 2 or 3 from 1x, 3x hash
	srcsetHash = {
		"1x": "img/480x480.gif",
		"3x": "img/480x480x3.gif"
	};
	// Correct calls
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 1), 'img/480x480.gif');
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 3), 'img/480x480x3.gif');
	// Extra bounds calls
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 4),  'img/480x480x3.gif');
	// In the hole call
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 2), 'img/480x480.gif');
	// Impossible calls (.5 is rounded to 1, <1 is impossible)
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, .5), 'img/480x480.gif');
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, -1), 'img/480x480.gif');
});

test("_getSrcFromSrcsetHash correct behaviour, missing first data", function() {
	var srcsetHash;
	picturePolyfill.initialize();
	// Get 1, 2 or 3 from 1x, 3x hash
	srcsetHash = {
		"2x": "img/480x480x2.gif",
		"3x": "img/480x480x3.gif"
	};
	// Correct calls
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 2), 'img/480x480x2.gif');
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 3), 'img/480x480x3.gif');
	// Extra bounds calls
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 4),  'img/480x480x3.gif');
	// In the hole call
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, 1), 'img/480x480x2.gif');
	// Impossible calls (.5 is rounded to 1, <1 is impossible)
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, .5), 'img/480x480x2.gif');
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, -1), 'img/480x480x2.gif');
});

test("_getSrcFromSrcsetHash correct behaviour, empty hash", function() {
	var srcsetHash;
	picturePolyfill.initialize();
	// Get 1, 2 or 3 from 1x, 3x hash
	srcsetHash = {};
	// Correct calls
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash, -1), null);
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash,  0), null);
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash,  1), null);
	strictEqual(picturePolyfill._getSrcFromSrcsetHash(srcsetHash,  2), null);
});

test("_getSrcAttributeFromSourcesData behaves correctly", function() {
	var sourcesData;
	picturePolyfill.initialize();
	// Normal case
	sourcesData = [
		{
			srcset: {
				"1x": "a.gif",
				"2x": "b.gif"
			}
		}
	];
	picturePolyfill._pixelRatio = 1;
	strictEqual(picturePolyfill._getSrcAttributeFromSourcesData(sourcesData), "a.gif");
	picturePolyfill._pixelRatio = 2;
	strictEqual(picturePolyfill._getSrcAttributeFromSourcesData(sourcesData), "b.gif");
	// With more MQs
	sourcesData.push({
		media: "(min-width: 1px)",
		srcset: {
			"1x": "c.gif",
			"2x": "d.gif"
		}
	});
	picturePolyfill._pixelRatio = 1;
	strictEqual(picturePolyfill._getSrcAttributeFromSourcesData(sourcesData), "c.gif");
	picturePolyfill._pixelRatio = 2;
	strictEqual(picturePolyfill._getSrcAttributeFromSourcesData(sourcesData), "d.gif");
});

test("_createOrUpdateImage actually creates an image", function() {

	var pictureEl1 = document.getElementById('first');
	var pictureEl2 = document.getElementById('second');
	var sourcesData = [
		{
			srcset: {
				"1x": "a.gif",
				"2x": "b.gif"
			}
		}
	];

	picturePolyfill.initialize();
	picturePolyfill._areMediaQueriesSupported = false;

	strictEqual(pictureEl1.getElementsByTagName('img').length, 0);
	picturePolyfill._createOrUpdateImage(pictureEl1, sourcesData);
	strictEqual(pictureEl1.getElementsByTagName('img').length, 1);
	picturePolyfill._createOrUpdateImage(pictureEl1, sourcesData);
	strictEqual(pictureEl1.getElementsByTagName('img').length, 1);
	strictEqual(pictureEl1.getElementsByTagName('img')[0].getAttribute('src'), 'default.gif');

	picturePolyfill._areMediaQueriesSupported = true;

	picturePolyfill._pixelRatio = 1;
	strictEqual(pictureEl2.getElementsByTagName('img').length, 0);
	picturePolyfill._createOrUpdateImage(pictureEl2, sourcesData);
	strictEqual(pictureEl2.getElementsByTagName('img').length, 1);
	picturePolyfill._createOrUpdateImage(pictureEl2, sourcesData);
	strictEqual(pictureEl2.getElementsByTagName('img').length, 1);
	strictEqual(pictureEl2.getElementsByTagName('img')[0].getAttribute('src'), 'a.gif');

	picturePolyfill._pixelRatio = 2;
	picturePolyfill._createOrUpdateImage(pictureEl2, sourcesData);
	strictEqual(pictureEl2.getElementsByTagName('img').length, 1);
	strictEqual(pictureEl2.getElementsByTagName('img')[0].getAttribute('src'), 'b.gif');
});

test("_parseSources correctly parses sources", function() {
	var pictureEl1 = document.getElementById('first');
	var pictureEl2 = document.getElementById('second');
	var expected1 = [
		{
			"srcset":{
				"1x":"img/480x480.gif",
				"2x":"img/480x480x2.gif"
			}
		},
		{
			"media":"(min-width: 481px)",
			"srcset":{
				"1x":"img/512x512.gif",
				"2x":"img/512x512x2.gif"
			}
		},
		{
			"media":"(min-width: 1025px)",
			"srcset":{
				"1x":"img/720x720.gif",
				"2x":"img/720x720x2.gif"
			}
		},
		{
			"media":"(min-width: 1441px)",
			"srcset":{
				"1x":"img/960x960.gif",
				"2x":"img/960x960x2.gif"
			}
		}
	];
	var expected2 = [
		{
			"src":"img/480x480.gif"
		},
		{
			"media":"(min-width: 481px)",
			"src":"img/512x512.gif"
		},
		{
			"media":"(min-width: 1025px)",
			"src":"img/720x720.gif"
		},
		{
			"media":"(min-width: 1441px)",
			"src":"img/960x960.gif"
		}
	];
	picturePolyfill.initialize();
	deepEqual(expected1, picturePolyfill._parseSources(pictureEl1));
	deepEqual(expected2, picturePolyfill._parseSources(pictureEl2));
});

test("parsePictures correct behaviour", function(){
	picturePolyfill.initialize();
	this.spy(picturePolyfill, "_createOrUpdateImage");

	picturePolyfill.parsePictures();
	ok(picturePolyfill._createOrUpdateImage.calledTwice);

	picturePolyfill._createOrUpdateImage.reset();
	picturePolyfill.parsePictures(document.getElementById('innerA'));
	ok(picturePolyfill._createOrUpdateImage.calledOnce);

});

test("call parsePictures won't give errors when polyfill isn't required", function() {
	picturePolyfill.initialize();
	picturePolyfill.isNecessary = false;
	picturePolyfill.initialize();
	this.spy(picturePolyfill, "parsePictures");
	picturePolyfill.parsePictures();
	strictEqual(picturePolyfill.parsePictures.exceptions[0], undefined);
	picturePolyfill.isNecessary = true;
});