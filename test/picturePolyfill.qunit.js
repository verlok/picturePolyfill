module( "hello", {
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

test( "Script initialization", function() {
	strictEqual( typeof window.picturePolyfill, 'function');
});