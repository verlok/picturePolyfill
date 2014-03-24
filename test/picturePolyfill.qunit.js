module("picturePolyfill", {
	setup: function() {
		$('body').append('<picture data-alt="A beautiful responsive image" data-default-src="img/960x960.gif">\
			<source srcset="img/480x480.gif, img/480x480x2.gif 2x"/>\
			<source srcset="img/512x512.gif, img/512x512x2.gif 2x" media="(min-width: 481px)"/>\
			<source srcset="img/720x720.gif, img/720x720x2.gif 2x" media="(min-width: 1025px)"/>\
			<source srcset="img/960x960.gif, img/960x960x2.gif 2x" media="(min-width: 1441px)"/>\
			<noscript>\
				<img src="img/960x960.gif" alt="A beautiful responsive image"/>\
			</noscript>\
		</picture>\
		<picture data-alt="A beautiful responsive image" data-default-src="img/960x960.gif">\
			<source src="img/480x480.gif"/>\
			<source src="img/512x512.gif" media="(min-width: 481px)"/>\
			<source src="img/720x720.gif" media="(min-width: 1025px)"/>\
			<source src="img/960x960.gif" media="(min-width: 1441px)"/>\
			<noscript>\
				<img src="img/960x960.gif" alt="A beautiful responsive image"/>\
			</noscript>\
		</picture>');
	},
	teardown: function() {
		$('picture').remove();
	}
});

test("main object is declared and exposed", function() {
	strictEqual( typeof window.picturePolyfill, 'object');
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

test("call parsePictures won't give errors when polyfill isn't required", function() {
	picturePolyfill.isNecessary = false;
	picturePolyfill.initialize();
	this.spy(picturePolyfill, "parsePictures");
	picturePolyfill.parsePictures();
	strictEqual(picturePolyfill.parsePictures.exceptions[0], undefined);
});

test("getSrcsetHash correct behaviour, correct srcset format", function() {
	var srcset;
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


test("getSrcsetHash correct behaviour, messy srcset format", function() {
	var srcset;
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

