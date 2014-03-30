# picturePolyfill
A Responsive Images approach that you can use today that uses the **[real `picture` element](http://www.w3.org/TR/2013/WD-html-picture-element-20130226/)** along with children `source` elements with `media`, `src` and `srcset` attributes.

* Author: Andrea Verlicchi (c) 2014
* License: MIT/GPLv2

### **[DEMO](http://verlok.github.io/picturePolyfill/)** 

## picturePolyfill advantages

PicturePolyfill is fast and easy to use because:

* **markup & go**: it uses the picture tag, easy to markup, and futureproof
* **loading performance**: it serves only one image to your website users, no double HTTP requests are made
* **computing performance**: it's designed and coded keeping performance in mind. For example:
    * it **doesn't execute repeatedly** while a smooth/animated browser resize is in progress, avoiding useless DOM parsing and useless HTTP requests to mid-breakpoints images that the user might not need)
	* it **caches che `source` elements data**, making the script much more perfoming [see tests](http://jsperf.com/picturepolyfill-test-cached-vs-not-cached) 
* **support to HD (Retina) displays** easily made via the `srcset` attribute of `source` tags

### Differences with picturefill

picturePolyfill is better than picturefill because:

* it's **15x faster** on IE 10, **8x faster** on mobile Safari, **6x faster** on Firefox and Safari, **4x faster** on Chrome and Opera [see performance test](http://jsperf.com/picturepolyfill-204-vs-picturefill-121-performance-test)
* it uses the **real `picture` markup**
* it gives you the ability to **choose a default image** that you want to show on Internet Explorer desktop, without the need to add any comment

## Markup pattern and explanation

### With HD (Retina) images support

To support HD (Retina) images, mark up your responsive images like this.

```html
<picture data-alt="A beautiful responsive image" data-default-src="img/1440x1440.gif">
	<source srcset="img/480x480.gif,   img/480x480x2.gif 2x"/>
	<source srcset="img/768x768.gif,   img/768x768x2.gif 2x"   media="(min-width: 481px)"/>
	<source srcset="img/1440x1440.gif, img/1440x1440x2.gif 2x" media="(min-width: 1025px)"/>
	<source srcset="img/1920x1920.gif, img/1920x1920x2.gif 2x" media="(min-width: 1441px)"/>
	<noscript>
		<img src="img/768x768.gif" alt="A beautiful responsive image"/>
	</noscript>
</picture>
```

### Without HD (Retina) support

If you don't need to support HD (Retina) images, you can mark up your responsive images like this.

```html
<picture data-alt="A beautiful responsive image" data-default-src="img/1440x1440.gif">
	<source src="img/480x480.gif"/>
	<source src="img/768x768.gif"   media="(min-width: 481px)"/>
	<source src="img/1440x1440.gif" media="(min-width: 1025px)"/>
	<source src="img/1920x1920.gif" media="(min-width: 1441px)"/>
	<noscript>
		<img src="img/768x768.gif" alt="A beautiful responsive image"/>
	</noscript>
</picture>
```

### Notes about the markup

`picture` tag:
* `data-default-src` attribute: the image URL that you want to load in IE Desktop < 10.
* `data-alt` attribute: the alternative text that will be set in the `img` tag

`source` tags:
* `media` attribute: any media query, but it's adviced to use a `min-width` media query to follow the "mobile first" approach.
* `src` attribute: the image URL at the corresponding `media`
* `srcset` attribute: comma separated URLs and scale at the corresponding `media`, e.g. `img/768x768.gif, img/768x768x2.gif 2x`

`noscript` tag:
* This should wrap the fallback image for non-JavaScript environments and search engines. You *could* avoid wrapping the `img` tag in `noscript`, but this will make browsers to fetch the fallback image during page load, causing unnecessary overhead.

### How the `img` is appended and updated

The script searches in the `source` tags and selects the last matching `media`'s `src` or `srcset`. When found, picturePolyfill will generate an `img` element inside the `picture` tag, with the corresponding `src` and `alt` attributes. 
The `img`'s `src` attribute is then updated at browser resize (see _computing performance_ section above to read about performance at browser resize).

## Server-side scaling/cropping tool

Responsive images can be quite complicated to be served on your website if you have to: pre-scale them at many different resolutions; name them; and maybe change their size when developing a new release of your site. 

It's then a good practice to have a server-side picture scaling service (like [pixtulate](http://www.pixtulate.com/)) to scale the images for you, just in time, starting from only one big image.

If you want to use an image server, you can code your HTML like the following:

```html
<picture data-alt="A beautiful responsive image" data-default-src="http://demo.api.pixtulate.com/demo/large-2.jpg?w=1440">
	<source src="http://demo.api.pixtulate.com/demo/large-2.jpg?w=480"/>
	<source src="http://demo.api.pixtulate.com/demo/large-2.jpg?w=512" media="(min-width: 481px)"/>
	<source src="http://demo.api.pixtulate.com/demo/large-2.jpg?w=720" media="(min-width: 1025px)"/>
	<source src="http://demo.api.pixtulate.com/demo/large-2.jpg?w=960" media="(min-width: 1441px)"/>
	<noscript>
		<img src="http://demo.api.pixtulate.com/demo/large-2.jpg?w=1440" alt="A beautiful responsive image"/>
	</noscript>
</picture>
```

Note that you should serve double resolution images (double width and double height) for HD/retina displays, as you can see in the "With HD (Retina) images support" section of this readme.

[Take a look at the demo](http://verlok.github.io/picturePolyfill/).


## Installation

### Manually

* Download picturePolyfill from GitHub
* Include the minified file in your project script directory

### Using bower

You can install the latest version of picturePolyfill using [bower](http://www.bower.io)

```Shell
bower install picturePolyfill
```

## Inclusion

To use picturePolyfill, just include the script tag at the end of your html file, in the `head` section of your `HTML` pages, OR just before the closure of the `body` tag.

Including the `defer` attribute in the `script` tag will prevent the script download to block page rendering while in progress.

### In the `head` section

```html
<html>
	<head>
		Your HEAD content
		<script src="picturePolyfill.min.js" defer></script>
	</head>
	<body>
		Your BODY content
	</body>
</html>
```

### At the end of the `body` section

```html
<html>
	<head>
		Your HEAD content
	</head>
	<body>
		Your BODY content
		<script src="picturePolyfill.min.js"></script>
	</body>
</html>
```

## Execution

PicturePolyfill executes either automatically and programmatically.

* it executes automatically **at page load**, on the whole `document`
* it executes automatically **at browser resize**, on the whole `document`
* it can be **programmatically executed**, if you:
    * call `window.picturePolyfill()` to execute it on the whole `document`
    * call `window.picturePolyfill(element)` to execute from the `element` DOM node below

Calling `picturePolyfill()` and passing in a specific node is particularly useful **if your DOM has changed** and you know the parent node where the change occured.

### After DOM has changed (AJAX calls, etc.)

**Example:** if some of your AJAX calls change a portion of your DOM injecting new `picture` nodes, after your new DOM has changed just call `picturePolyfill.parse()` (or `picturePolyfill.parse(element)`) to make picturePolyfill parse only the changed portion of the DOM.

## Browser support

PicturePolyfill supports all modern browsers and **down to Internet Explorer 7** (it wasn't tested on IE6).

* On **Modern Browsers, Internet Explorer 10 and above**: the images will be loaded depending on the matched media query
* On **Internet Explorer 7 to 9**: the content of the `data-default-src` attribute will be used to reference the image source.


## Size and delivery

Currently, `picturePolyfill.js` compresses to around 1300bytes (~1.2kb) after minify and gzip. To minify, you might try these online tools: [Uglify](http://marijnhaverbeke.nl/uglifyjs), [Yahoo Compressor](http://refresh-sf.com/yui/), or [Closure Compiler](http://closure-compiler.appspot.com/home). Serve with gzip compression.