# picturePolyfill 4

A Responsive Images approach that you can use today that uses the **[real `picture` element](http://www.w3.org/TR/2013/WD-html-picture-element-20130226/)** along with children `source` elements with `media`, `src` and `srcset` attributes.

* Author: Andrea Verlicchi (c) 2014
* License: MIT/GPLv2

### **[DEMO](http://verlok.github.io/picturePolyfill/)** 

## picturePolyfill advantages

PicturePolyfill is fast and easy to use because:

* **markup & go**: it uses the picture tag, easy to markup, and future-proof
* **loading performance**: it serves only one image to your website users, no double HTTP requests are made
* **computing performance**: it's designed and coded keeping performance in mind. For example:
    * it **doesn't execute repeatedly** while a smooth/animated browser resize is in progress, avoiding useless DOM parsing and useless HTTP requests to mid-breakpoints images that the user might not need)
	* it **caches che `source` elements data**, making the script much more performing [see tests](http://jsperf.com/picturepolyfill-test-cached-vs-not-cached) 
* **support to HD (Retina) displays** easily made via the `srcset` attribute of `source` tags
* it's **solid**, because its code is all covered by tests

### Differences with picturefill

picturePolyfill only polyfills the `picture` tag, whereas picturefill polyfills also the `img` tag with `srcset` + `sizes` attributes. Go for picturefill if you need to polyfill that too. If you don't, stick with picturePolyfill because it's a much smaller and faster script.

## Markup pattern and explanation

### With HD (Retina) images support

To support HD (Retina) images, mark up your responsive images like this.

```html
<picture data-alt="A beautiful responsive image" data-default-src="img/960x960.gif">
	<source media="(min-width: 1441px)" srcset="img/960x960.gif, img/960x960x2.gif 2x"/>
	<source media="(min-width: 1025px)" srcset="img/720x720.gif, img/720x720x2.gif 2x"/>
	<source media="(min-width: 481px)"  srcset="img/512x512.gif,  img/512x512x2.gif 2x"/>
	<source srcset="img/480x480.gif, img/480x480x2.gif 2x"/>
	<img src="" alt="A beautiful responsive image"/>
</picture>
```

### Without HD (Retina) support

If you don't need to support HD (Retina) images, you can mark up your responsive images like this.

```html
<picture data-alt="A beautiful responsive image" data-default-src="img/960x960.gif">
	<source media="(min-width: 1441px)" srcset="img/960x960.gif"/>
	<source media="(min-width: 1025px)" srcset="img/720x720.gif"/>
	<source media="(min-width: 481px)"  srcset="img/512x512.gif"/>
	<source srcset="img/480x480.gif"/>
	<img src="" alt="A beautiful responsive image"/>
</picture>
```

### Notes about the markup

* `picture` tag:
 * `data-default-src` attribute: the image URL that you want to load in IE Desktop < 10.
 * `data-alt` attribute: the alternative text that will be set in the `img` tag

* `source` tags:
 * `media` attribute: any media query, but it's advised to use a `min-width` media query to follow the "mobile first" approach.
 * `src` attribute: the image URL at the corresponding `media`
 * `srcset` attribute: comma separated URLs and scale at the corresponding `media`, e.g. `img/768x768.gif, img/768x768x2.gif 2x`

* `img` tag:
 * one `img` tag inside the `picture` tag is required by the [specs](http://www.w3.org/html/wg/drafts/html/master/embedded-content.html#the-picture-element)
 * you can still use an empty `src` in the `img` to avoid a double http call in browsers that don't natively support the `picture` tag.


**NEW in version 4.0.0**! The **`source` tags order** is important! The parser exits at first matching `media` so be sure to place the higher `min-width` queries at the begin of the tags list!

### How the `img` is updated

The script searches in the `source` tags and selects the last matching `media`'s `src` or `srcset`. 
When found, picturePolyfill will update the `img` element's `src` and `srcset` attributes inside the `picture` tag, with the matching ones. 
The `img`'s `src` attribute is then updated at browser resize (see _computing performance_ section above to read about performance at browser resize).

## Server-side scaling/cropping tool

Responsive images can be quite complicated to be served on your website if you have to: pre-scale them at many different resolutions; name them; and maybe change their size when developing a new release of your site. 

It's then a good practice to have a server-side picture scaling service (like [pixtulate](http://www.pixtulate.com/)) to scale the images for you, just in time, starting from only one big image.

If you want to use an image server, you can code your HTML like the following:

```html
<picture data-alt="A beautiful responsive image" data-default-src="http://demo.api.pixtulate.com/demo/large-2.jpg?w=1440">
	<source media="(min-width: 1441px)" srcset="http://demo.api.pixtulate.com/demo/large-2.jpg?w=960, http://demo.api.pixtulate.com/demo/large-2.jpg?w=1920 2x"/>
	<source media="(min-width: 1025px)" srcset="http://demo.api.pixtulate.com/demo/large-2.jpg?w=720, http://demo.api.pixtulate.com/demo/large-2.jpg?w=1440 2x"/>
	<source media="(min-width: 481px)"  srcset="http://demo.api.pixtulate.com/demo/large-2.jpg?w=512, http://demo.api.pixtulate.com/demo/large-2.jpg?w=1024 2x"/>
	<source srcset="http://demo.api.pixtulate.com/demo/large-2.jpg?w=480, http://demo.api.pixtulate.com/demo/large-2.jpg?w=960 2x"/>
	<img src="" alt="A beautiful responsive image"/>
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

You can either include the `script in the `head` section of your `HTML` pages, OR just before the closure of the `body` tag.`


### In the `head` section

```html
<html>
	<head>
		...
		<script src="picturePolyfill.min.js" defer></script>
	</head>
	<body>
		...
	</body>
</html>
```

**Note:** Including the `defer` attribute in the `script` tag will prevent the script download to block page rendering while in progress.

### At the end of the `body` section

```html
<html>
	<head>
		...
	</head>
	<body>
		...
		<script src="picturePolyfill.min.js"></script>
	</body>
</html>
```

## Execution

PicturePolyfill executes either automatically and by code, calling the parse() function.

* it executes automatically **at page load**, on the whole `document`
* it executes automatically **at browser resize**, on the whole `document`
* it can be **manually executed**, if you:
    * call `picturePolyfill.parse()` to execute it on the whole `document`
    * call `picturePolyfill.parse(element)` to execute from the `element` DOM node below

### After DOM has changed (AJAX calls, etc.)

PicturePolyfill is intentionally exposed to the global namespace, so you can call it as you need it.

**Example:** if some of your AJAX calls change a portion of your DOM injecting new `picture` nodes, after your new DOM has changed just call `picturePolyfill.parse()` (or `picturePolyfill.parse(element)`) to make picturePolyfill parse only the changed portion of the DOM.

Calling `picturePolyfill.parse(element)` (where `element` is a specific DOM node) is faster if you know the parent node where the DOM changed.

## Browser support

PicturePolyfill supports all modern browsers and **down to Internet Explorer 7**.

* On **Modern Browsers, Internet Explorer 10 and above**: the images will be loaded depending on the matched media query
* On **Internet Explorer 7 to 9**: the content of the `data-default-src` attribute will be used to reference the image source.

## Size and delivery

Currently, `picturePolyfill.js` compresses to around 1300bytes (~1.2kb) after minify and gzip. To minify, you might try these online tools: [Uglify](http://marijnhaverbeke.nl/uglifyjs), [Yahoo Compressor](http://refresh-sf.com/yui/), or [Closure Compiler](http://closure-compiler.appspot.com/home). Serve with gzip compression.
