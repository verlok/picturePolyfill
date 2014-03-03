# picturePolyfill
A Responsive Images approach that you can use today that mimics the [proposed picture element](http://www.w3.org/TR/2013/WD-html-picture-element-20130226/) using a single `span` (for safety sake) with a JSON notation of `source`, with `media` and `srcset` attributes.

* Author: Andrea Verlicchi (c) 2014
* License: MIT/GPLv2

**Demo URL:** [http://verlok.github.io/picturePolyfill/](http://verlok.github.io/picturePolyfill/)

**Note:** picturePolyfill works best in browsers that support CSS3 media queries. The demo page references (externally) the [matchMedia polyfill](https://github.com/paulirish/matchMedia.js/) which makes matchMedia work in `media-query`-supporting browsers that don't support `matchMedia`. The `matchMedia` polyfill is not required for `picturePolyfill` to work, but it's required to support the `media` property specified in the data-picture attribute. In non-media query-supporting browsers, the `matchMedia` polyfill will allow for querying native media types, such as `screen`, `print`, etc.

## picturePolyfill advantages

While many other solutions exist, picturePolyfill has the added benefits:
* performance for the user in only being served one image
* easy support to HD (Retina) displays
* no need to prefix HD media queries with the `-webkit-` prefix
* small html markup thanks to the possibility to specify multiple values in the `srcset` property
* ability to select a standard image for the browsers that don't support media queries, using the `standard` property
* it doesn't execute while a smooth (animated or manually dragged) browser resize is in progress, making the script performant and avoiding useless http requests to mid-breakpoints images that the user might not need

## Markup pattern and explanation

### With HD (Retina) images support

To support HD (Retina) images, mark up your responsive images like this.

```html
	<span data-alt="A beautiful image" data-picture='[
		{                                "srcset": ["img/320x320.gif",   "img/320x320x2.gif"]},
		{"media": "(min-width: 321px)",  "srcset": ["img/768x768.gif",   "img/768x768x2.gif"]},
		{"media": "(min-width: 481px)",  "srcset": ["img/768x768.gif",   "img/768x768x2.gif"]},
		{"media": "(min-width: 769px)",  "srcset": ["img/1024x1024.gif", "img/1024x1024x2.gif"], "standard": true},
		{"media": "(min-width: 1025px)", "srcset": ["img/1280x1280.gif", "img/1280x1280x2.gif"]},
		{"media": "(min-width: 1281px)", "srcset": ["img/1440x1440.gif", "img/1440x1440x2.gif"]},
		{"media": "(min-width: 1441px)", "srcset": ["img/1920x1920.gif", "img/1920x1920x2.gif"]}
	]'>
		<noscript>
			<img src="img/1280x1280.gif" alt="A beautiful image"/>
		</noscript>
	</span>
```

### Without HD (Retina) support

If you don't need to support HD (Retina) images, you can mark up your responsive images like this.

```html
	<span data-alt="A beautiful image" data-picture='[
		{                                "srcset": ["img/320x320.gif"]},
		{"media": "(min-width: 321px)",  "srcset": ["img/768x768.gif"]},
		{"media": "(min-width: 481px)",  "srcset": ["img/768x768.gif"]},
		{"media": "(min-width: 769px)",  "srcset": ["img/1024x1024.gif"], "standard": true},
		{"media": "(min-width: 1025px)", "srcset": ["img/1280x1280.gif"]},
		{"media": "(min-width: 1281px)", "srcset": ["img/1440x1440.gif"]},
		{"media": "(min-width: 1441px)", "srcset": ["img/1920x1920.gif"]}
	]'>
		<noscript>
			<img src="img/1280x1280.gif" alt="A beautiful image"/>
		</noscript>
	</span>
```

### The `data-picture` attribute array

The `data-picture` attribute accepts an array. In each element, it accepts:
* `media`: any and all CSS3 media queries—such as `min-width` or `max-width`
* `srcset`: an array of urls to images. To support only standard displays, pass an array of only one value. To support HD (Retina) displays, pass more values: the first value for standard displays, the second value for HD displays (Retina; double density), and more for triple and quad density.
* `standard`: a boolean value, `true` if you want this to be the image picked by browsers without media query support (like IE 8 or below), these browser will always load the first `srcset` element.

### Notes on the markup above...

* The `data-picture` attribute must contain a JSON array which can contain any number of elements. The above example may contain more than the average situation may call for. I recommend to generate this array using a helper on a server side language (like PHP or similar).
* The `span[data-picture]` element's `data-alt` attribute is used as alternate text for the `img` element that picturePolyfill generates upon a successful.
* It's generally a good idea to leave one element of the `data-picture` array with no `media` qualifier, so it'll apply everywhere - typically a mobile-optimized image is ideal here.
* Each element of the `data-picture` array can have an optional `media` attribute to make it apply in specific media settings. Both media types and queries can be used, like a native `media` attribute, but support for media _queries_ depends on the browser (unsupporting browsers fail silently).
* The `matchMedia` polyfill (included in the `/external` folder) is necessary to support the `media` property across browsers (such as IE9), even in browsers that support media queries, although it is becoming more widely supported in new browsers.
* The `noscript` element wraps the fallback image for non-JavaScript environments and search engines, and including this wrapper prevents browsers from fetching the fallback image during page load (causing unnecessary overhead).

### How the `img` is appended and updated

Upon finding a matching media in the `data-picture` array, picturePolyfill will generate an `img` element and inside that span. 
The `img`'s `src` attribute is updated at browser resize, after a small delay (100ms) to prevent the script to be executed too many times during smooth (animated or manually dragged) browser resize.

## Usage

To use picturePolyfill, just insert the script tag at the end of your html file, just right the closure of the `body` tag.
If picturePolyfill is put in the head of the document of deferred until after load is fired, images will not load unless the browser window is resized.

```html
	<html>
		<head>
			YOUR HEAD ...
		</head>
		<body>
			YOUR HTML ...
			<script src="picturePolyfill.js"></script>
		</body>
	</html>
```

### Later calls

picturePolyfill is intentionally exposed to the global space, so you can

* *AJAX calls*: after your new DOM has been injected on the page, just call `window.picturePolyfill()`
* *document ready*: if you can't insert the script at the bottom of the page, to use the script at the document ready (e.g. using jQuery's `$(document).ready()` function), just call `window.picturePolyfill()`
* *Browser resize*: the browser resize event is already managed by the script, it will update the images source 100ms after each resize event.


## Support

picturePolyfill supports a wide range of browsers, provided that you stick with the markup conventions provided.
Talking about Internet Explorer, it supports IE 8 and above.

### About IE 8 desktop

Internet Explorer 8 has no support for CSS3 Media Queries, so using picturePolyfill IE will receive the `data-picture` array element having the `standard` property set to true, or the last element of the `data-picture` attribute array.


## Size and delivery

Currently, `picturePolyfill.js` compresses to around 609bytes (~0.5kb), after minify and gzip. To minify, you might try these online tools: [Uglify](http://marijnhaverbeke.nl/uglifyjs), [Yahoo Compressor](http://refresh-sf.com/yui/), or [Closure Compiler](http://closure-compiler.appspot.com/home). Serve with gzip compression.


## Inspiration

picturePolyfill was inspired by [picturefill](https://github.com/scottjehl/picturefill/)