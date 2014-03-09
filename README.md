# picturePolyfill
A Responsive Images approach that you can use today that mimics the [proposed picture element](http://www.w3.org/TR/2013/WD-html-picture-element-20130226/) using a single `span` (for safety sake) with a JSON notation of `source`, with `media` and `srcset` attributes.

* Author: Andrea Verlicchi (c) 2014
* License: MIT/GPLv2

### **[DEMO](http://verlok.github.io/picturePolyfill/)** 

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
	{                                "srcset": "img/320x320.gif"},
	{"media": "(min-width: 321px)",  "srcset": "img/768x768.gif"},
	{"media": "(min-width: 481px)",  "srcset": "img/768x768.gif"},
	{"media": "(min-width: 769px)",  "srcset": "img/1024x1024.gif", "standard": true},
	{"media": "(min-width: 1025px)", "srcset": "img/1280x1280.gif"},
	{"media": "(min-width: 1281px)", "srcset": "img/1440x1440.gif"},
	{"media": "(min-width: 1441px)", "srcset": "img/1920x1920.gif"}
]'>
	<noscript>
		<img src="img/1280x1280.gif" alt="A beautiful image"/>
	</noscript>
</span>
```

### The `data-picture` attribute array

The `data-picture` attribute accepts an array. In each element, it accepts:
* `media`: any and all CSS3 media queries—such as `min-width` or `max-width`
* `srcset`: the image URL (string) at the corresponding `media`, or an array of image URLs. To support only standard displays, just pass in a string. To support HD (Retina) displays, pass an array of values: the first value for standard displays, the second value for HD displays (Retina; double density), and more for triple and quad density.
* `standard`: a boolean value, `true` if you want this to be the image picked by browsers without media query support (like IE 8 or below). If srcset is an array, these browser will always load the first `srcset` element.

**Note:** As the `data-picture` attribute array is read from left to right, the array elements with `media` property set to `min-width` must be placed in increasing `min-width` order, e.g. 321px, 481px, 769px, etc.

### Notes on the markup above...

* The `data-picture` attribute must contain a JSON array which can contain any number of elements. The above example may contain more than the average situation may call for. I recommend to generate this array using a helper on a server side language (like PHP or similar).
* The `span[data-picture]` element's `data-alt` attribute is used as alternate text for the `img` element that picturePolyfill generates upon a successful.
* It's generally a good idea to leave one element of the `data-picture` array with no `media` qualifier, so it'll apply everywhere - typically a mobile-optimized image is ideal here.
* Each element of the `data-picture` array can have an optional `media` attribute to make it apply in specific media settings. Both media types and queries can be used, like a native `media` attribute, but support for media _queries_ depends on the browser (unsupporting browsers fail silently).
* The `noscript` element wraps the fallback image for non-JavaScript environments and search engines, and including this wrapper prevents browsers from fetching the fallback image during page load (causing unnecessary overhead).

### About the real `picture` element

Some developers are [wondering](http://www.linkedin.com/groupItem?view=&gid=2071438&type=member&item=5846510553693986816&commentID=5848302870645993472): **will I have to re-code my HTML** when the real `picture` element will be standard and supported?

Please note that there's a version of picturePolyfill, under the [usingPictureMarkup](https://github.com/verlok/picturePolyfill/tree/master/usingPictureMarkup) folder, which makes it possible to **use the real `picture` + `source` tags today**, but this version is supporting Internet Explorer 10 and above (no support for versions 8 and 9).

If you need to support IE 8 and 9 the answer is yes, recoding will be necessary when the real `picture` tag will be a standard.

What I suggest is to **generate the responsive images markup** using some function written in a **server side language** (like PHP or similar), with a simple configuration to **switch** to make it generate the `span[data-picture]` element today (required by picturePolyfill) or the real `picture` element when fully supported.


### How the `img` is appended and updated

Upon finding a matching media in the `data-picture` array, picturePolyfill will generate an `img` element and inside that span. 
The `img`'s `src` attribute is updated at browser resize, after a small delay (100ms) to prevent the script to be executed too many times during smooth (animated or manually dragged) browser resize.

## Server-side scaling/cropping tool

Responsive images can be quite complicated to be served on your website if you have to: pre-scale them at many different resolutions; name them; and maybe change their size when developing a new release of your site. 

It's then a good practice to have a server-side picture scaling service (like [pixtulate](http://www.pixtulate.com/)) to scale the images for you, just in time, starting from only one big image.

If you want to use an image server, you can code your HTML like the following:

```html
<a href="#someLink2">
	<span data-alt="A beautiful responsive image" data-picture='[
		{                                "srcset": "http://demo.api.pixtulate.com/demo/large-2.jpg?w=320"}, 
		{"media": "(min-width: 481px)",  "srcset": "http://demo.api.pixtulate.com/demo/large-2.jpg?w=512"}, 
		{"media": "(min-width: 1025px)", "srcset": "http://demo.api.pixtulate.com/demo/large-2.jpg?w=640"}, 
		{"media": "(min-width: 1281px)", "srcset": "http://demo.api.pixtulate.com/demo/large-2.jpg?w=960"},
		{"media": "(min-width: 1921px)", "srcset": "http://demo.api.pixtulate.com/demo/large-2.jpg?w=1400"}
		]'>
		<noscript>
			<img src="img/1280x1280.gif" alt="A beautiful responsive image"/>
		</noscript>
	</span>
</a>
```

Use an array in the srcset property and double size images to support HD/retina displays, as you can see in the "With HD (Retina) images support" section of this readme.

[Take a look at the demo](http://verlok.github.io/picturePolyfill/).


## Usage

To use picturePolyfill, just insert the script tag at the end of your html file, just right the closure of the `body` tag.
If picturePolyfill is put in the head of the document of deferred until after load is fired, images will not load unless the browser window is resized.

```html
<html>
	<head>
		Your HEAD content
	</head>
	<body>
		Your BODY + your responsive images markup, as described
		<script src="picturePolyfill.min.js"></script>
	</body>
</html>
```

### Later calls

picturePolyfill is intentionally exposed to the global space, so you can call it later, as you need it.	

* **AJAX calls**: after your new DOM has been injected on the page, just call `window.picturePolyfill()`
* **document ready**: if you insert the `<script>` tag at the bottom of your markup, just before the closure of the `body` tag, you won't have to call picturePolyfill manually. If you can't do that, to use the script at the document ready (e.g. using jQuery's `$(document).ready()` function), just call `window.picturePolyfill()`
* **Browser resize**: the browser resize event is already managed by the script, it will update the images source 100ms after each resize event.


## Browser support

**picturePolyfill** supports all modern browsers and Internet Explorer 8 and above.

**Note**: The `matchMedia` polyfill (included in the `/external` folder) is necessary to support the `media` property across browsers (such as IE9), even in browsers that support media queries, although it is becoming more widely supported in new browsers. If you don't include matchMediaPolyfill, the script will load the `standard` picture format.

### Internet Explorer desktop versions

* **IE 10 and above**: Fully supported, as in all other modern browsers
* **IE 9**: Supported, including the `matchMedia` polyfill provided in external/matchMedia.js
* **IE 8**: Supported, but as the browser has no support for CSS3 Media Queries, the script will load the element (of the `data-picture` attribute array) which has the `standard` property set to true, or the last element of the array.
* **IE 7 and below are intentionally not supported** (missing JSON, missing querySelectorAll). Script will fail silently without throwing any javascript errors.

**Note**: Internet Explorer 7 finally disappeared along with all its bugs. The most used Internet Explorer versions today (march 2014) are 11, 8, 10, then 9.

## Size and delivery

Currently, `picturePolyfill.js` compresses to around 620bytes (~0.6kb), after minify and gzip. To minify, you might try these online tools: [Uglify](http://marijnhaverbeke.nl/uglifyjs), [Yahoo Compressor](http://refresh-sf.com/yui/), or [Closure Compiler](http://closure-compiler.appspot.com/home). Serve with gzip compression.


## Inspiration

picturePolyfill was inspired by [picturefill](https://github.com/scottjehl/picturefill/)