# picturePolyfill
A Responsive Images approach that you can use today that mimics the [proposed picture element](http://www.w3.org/TR/2013/WD-html-picture-element-20130226/) using a single `span` (for safety sake) with a JSON notation of `source`, with `media` and `srcset` attributes.

* Author: Andrea Verlicchi (c) 2014
* License: MIT/GPLv2

**Demo URL:** [http://verlok.github.io/picturePolyfill/](http://verlok.github.io/picturePolyfill/)

**Note:** picturePolyfill works best in browsers that support CSS3 media queries. The demo page references (externally) the [matchMedia polyfill](https://github.com/paulirish/matchMedia.js/) which makes matchMedia work in `media-query`-supporting browsers that don't support `matchMedia`. The `matchMedia` polyfill is not required for `picturePolyfill` to work, but it's required to support the `media` property specified in the data-picture attribute. In non-media query-supporting browsers, the `matchMedia` polyfill will allow for querying native media types, such as `screen`, `print`, etc.

## Size and delivery

Currently, `picturePolyfill.js` compresses to around 609bytes (~0.5kb), after minify and gzip. To minify, you might try these online tools: [Uglify](http://marijnhaverbeke.nl/uglifyjs), [Yahoo Compressor](http://refresh-sf.com/yui/), or [Closure Compiler](http://closure-compiler.appspot.com/home). Serve with gzip compression.

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
		{                                "src": "img/320x320.gif"},
		{"media": "(min-width: 321px)",  "src": "img/768x768.gif"},
		{"media": "(min-width: 481px)",  "src": "img/768x768.gif"},
		{"media": "(min-width: 769px)",  "src": "img/1024x1024.gif", "standard": true},
		{"media": "(min-width: 1025px)", "src": "img/1280x1280.gif"},
		{"media": "(min-width: 1281px)", "src": "img/1440x1440.gif"},
		{"media": "(min-width: 1441px)", "src": "img/1920x1920.gif"}
    ]'>
		<noscript>
			<img src="img/1280x1280.gif" alt="A beautiful image"/>
		</noscript>
    </span>
```

### The `data-picture` attribute array

The `data-picture` attribute accepts an array. In each element, it accepts:
* `media`: any and all CSS3 media queries—such as `min-width` or `max-width`
* `src`: the `src` attribute to be assigned to the image at the matched media query
* `srcset`: an array of `src` values to support HD (Retina) displays. The first value is for standard displays, the second for double density displays (Retina), and more if you want to support triple density (or above) displays 
* `standard`: a boolean value, true if you want this to be the image picked by browsers without media query support IE 8 or below


### Notes on the markup above...

* The `span[data-picture]` element's `data-alt` attribute is used as alternate text for the `img` element that picturePolyfill generates upon a successful.
* The `data-picture` attribute must contain an array (JSON) and can contain any number of elements. The above example may contain more than the average situation may call for.
* It's generally a good idea to leave one element of the `data-picture` array with no `media` qualifier, so it'll apply everywhere - typically a mobile-optimized image is ideal here.
* Each element of the `data-picture` array can have an optional `[media]` attribute to make it apply in specific media settings. Both media types and queries can be used, like a native `media` attribute, but support for media _queries_ depends on the browser (unsupporting browsers fail silently).
* The `matchMedia` polyfill (included in the `/external` folder) is necessary to support the `media` property across browsers (such as IE9), even in browsers that support media queries, although it is becoming more widely supported in new browsers.
* The `noscript` element wraps the fallback image for non-JavaScript environments and search engines, and including this wrapper prevents browsers from fetching the fallback image during page load (causing unnecessary overhead).

### How the `img` is appended and updated

Upon finding a matching media in the `data-picture` array, picturePolyfill will generate an `img` element and inside that span. 
The `img`'s `src` attribute is updated at browser resize, after a small delay (50ms) to prevent the script to be executed too many times during smooth (animated or manually dragged) browser resize.


## HD (Retina) images

picturePolyfill natively supports HD (Retina) images, you just have to specify the double density (HQ, Retina) image as second element of the srcset array.

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

While many other solutions exist, picturePolyfill has the added benefits:
* performance for the user in only being served one image
* small html markup thanks to multiple values in the `srcset` property
* no need to prefix media queries with the `-webkit-` prefix
* ability to select a standard image for the browsers that don't support media queries, using the `standard` property

## Supporting IE Desktop

Internet Explorer 8 and older have no support for CSS3 Media Queries, so in the examples above, IE will receive the `data-picture` array element having the `standard` property set to true, or the last element of the array.

## Deferred loading

If picturePolyfill is deferred until after load is fired, images will not load unless the browser window is resized.
picturePolyfill is intentionally exposed to the global space, in the unusual situation where you might want to defer loading of picturePolyfill you can explicitly call window.picturePolyfill().

## Support

picturePolyfill supports Internet Explorer 8+, provided that you stick with the markup conventions provided.

## Inspiration

picturePolyfill was inspired by [picturefill](https://github.com/scottjehl/picturefill/)