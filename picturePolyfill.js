/* PicturePolyfill - Responsive Images that work today. (and mimic the proposed Picture element with span elements). Author: Andrea Verlicchi | License: MIT/GPLv2 */

var picturePolyfill = (function(w) {

	"use strict";

	var _cacheArray,
		_cacheIndex,
		_resizeTimer,
		_timeAfterResize = 100;

	if (!String.prototype.trim) {
		String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
	}

	/**
	 * Detects old browser checking if browser can append images to pictures
	 * @returns {boolean}
	 */
	function detectAppendImageSupport() {
		var newImgElement = document.createElement('img'),
			theFirstPictureElement = document.getElementsByTagName("picture")[0];

		try {
			if (theFirstPictureElement) {
				theFirstPictureElement.appendChild(newImgElement);
				theFirstPictureElement.removeChild(newImgElement);
			}
			return true;
		}
		catch(e) {
			return false;
		}
	}

	/**
	 * Append an image element to a picture element
	 * @param {Node} picture
	 * @param attributes
	 */
	function appendImage(picture, attributes) {
		var imageElement = document.createElement('img');
		imageElement.setAttribute('alt', attributes.alt);
		imageElement.setAttribute('src', attributes.src);
		picture.appendChild(imageElement);
	}

	/**
	 * Replaces the existing picture element with another picture element containing an image with the imgSrc source
	 * @param {Node} picture
	 * @param attributes
	 */
	function replacePictureAndAppendImage(picture, attributes) {
		var newPicture = document.createElement("picture");
		appendImage(newPicture, attributes.src, attributes.alt);
		picture.parentNode.replaceChild(newPicture, picture);
	}


	return {

		/**
		 * {integer} The device pixel ratio. 1 for standard displays, 2+ for HD displays
		 */
		_pixelRatio: (w.devicePixelRatio) ? Math.ceil(w.devicePixelRatio) : 1,

		/**
		 * {boolean} Detect if browser has media queries support
		 */
		_areMediaQueriesSupported: w.matchMedia && w.matchMedia("only all") !== null && w.matchMedia("only all").matches,

		/**
		 * {boolean} Detect if append image to picture is possible
		 */
		_isAppendImageSupported: detectAppendImageSupport(),

		/**
		 * {boolean} Detect if polyfill is necessary
		 */
		isNecessary: !w.HTMLPictureElement,

		/**
		 * Returns a hash density > sourceSet
		 * @param {string} srcset
		 * @returns {object}
		 */
		_getSrcsetHash: function(srcset) {
			var srcSetElement,
				source,
				density,
				hash = {},
				srcSetElements = srcset.split(',');

			for (var i=0, len=srcSetElements.length; i<len; i+=1) {
				srcSetElement = srcSetElements[i].trim().split(' ');
				switch(srcSetElement.length) {
					case 1:
						density = "1x";
						break;
					case 2:
						density = srcSetElement[1];
						break;
					default:
						density = srcSetElement[srcSetElement.length-1];
				}
				source = srcSetElement[0];
				hash[density] = source;
			}
			return hash;
		},

		/**
		 * Returns the proper src from the srcSet property
		 * Get the first valid element from passed position to the left
		 * @param {Array} srcsetHash
		 * @param {int} position
		 * @returns {string}
		 */
		_getSrcFromSrcsetHash: function(srcsetHash, position) {
			var ret;

			// Try direct access to position - best case
			ret = srcsetHash[position+'x'];
			if (ret) { return ret; }

			// Try looking for smaller images
			do {
				position-=1;
				ret = srcsetHash[position+'x'];
			}
			while (!ret && position>0);
			if (ret) { return ret; }

			// Still nothing? Get the first result in the hash and return it
			for (var key in srcsetHash) {
				return srcsetHash[key];
			}

			// Fallback
			return null;
		},

		/**
		 * Loop through every element of the sourcesData array, check if the media query applies and,
		 * if so, get the src element from the srcSet property based depending on pixel ratio
		 * @param sourcesData {Array}
		 * @returns {string}
		 */
		_getSrcFromSourcesData: function(sourcesData) {
			var matchedSrc;

			for (var i=0, len=sourcesData.length; i<len; i+=1) {
				var source = sourcesData[i],
					media = source.media,
					srcset = source.srcset;
				if (!media || w.matchMedia(media).matches) {
					matchedSrc = srcset ? this._getSrcFromSrcsetHash(srcset, picturePolyfill._pixelRatio) : source.src;
				}
			}
			return matchedSrc;
		},

		/**
		 * Set the src attribute of the first image element inside passed pictureElement
		 * if the image doesn't exist, creates it, sets its alt attribute, and appends it to pictureElement
		 * @param pictureElement {Node}
		 * @param attributes
		 */
		_createOrUpdateImage: function(pictureElement, attributes) {
			var imageElements = pictureElement.getElementsByTagName('img');

			// If image already exists, use it
			if (imageElements.length) {
				imageElements[0].setAttribute('src', attributes.src);
			}
			// Else create the image
			else {
				if (picturePolyfill._isAppendImageSupported) {
					appendImage(pictureElement, attributes);
				}
				else {
					replacePictureAndAppendImage(pictureElement, attributes);
				}
			}
		},

		/**
		 * Parses the picture element looking for sources elements, then
		 * generate the array or string for the SrcSetArray
		 * @param {Array} pictureElement the starting element to parse DOM into. If not passed, it parses the whole document.
		 */
		_getSources: function(pictureElement) {
			var sourcesData = [],
				foundSources = pictureElement.getElementsByTagName('source');

			for (var i=0, len = foundSources.length; i<len; i+=1) {
				var sourceElement = foundSources[i],
					srcset = sourceElement.getAttribute('srcset'),
					media = sourceElement.getAttribute('media'),
					src = sourceElement.getAttribute('src'),
					hash = {};
				if (media) { hash["media"] = media; }
				if (src) { hash["src"] = src; }
				if (srcset) { hash["srcset"] = picturePolyfill._getSrcsetHash(srcset); }
				sourcesData.push(hash);
			}
			return sourcesData;
		},

		/**
		 * Parses the DOM looking for elements containing the "data-picture" attribute, then
		 * generate the images or updates their src attribute.
		 * @param {Node} element (the starting element to parse DOM into. REQUIRED)
		 */
		parse: function(element) {
			var sourcesData,
				pictureElement,
				pictureElements,
				srcAttribute;

			if (!this.isNecessary) { return false; }

			pictureElements = (element || document).getElementsByTagName('picture');

			for (var i=0, len=pictureElements.length; i<len; i+=1) {
				pictureElement = pictureElements[i];
				if (!picturePolyfill._areMediaQueriesSupported) {
					srcAttribute = pictureElement.getAttribute("data-default-src");
				} else {
					sourcesData = _cacheArray[pictureElement.getAttribute('data-cache-index')];
					if (!sourcesData) {
						sourcesData = picturePolyfill._getSources(pictureElement);
						_cacheArray[_cacheIndex] = sourcesData;
						pictureElement.setAttribute('data-cache-index', _cacheIndex);
						_cacheIndex+=1;
					}
					srcAttribute = picturePolyfill._getSrcFromSourcesData(sourcesData);
				}
				picturePolyfill._createOrUpdateImage(pictureElement, {
					src: srcAttribute,
					alt: pictureElement.getAttribute('data-alt')
				});
			}

			return i;
		},

		/**
		 * Adds listeners to load and resize event
		 * @private
		 */
		_addListeners: function() {

			function parseDocument() {
				picturePolyfill.parse(document);
			}

			// Manage resize event only if they've passed 100 milliseconds between a resize event and another
			// to avoid the script to slow down browsers that animate resize or when browser edge is being manually dragged
			function parseDocumentAfterTimeout() {
				clearTimeout(_resizeTimer);
				_resizeTimer = setTimeout(parseDocument, _timeAfterResize);
			}

			if (w.addEventListener) {
				w.addEventListener('resize', parseDocumentAfterTimeout);
				w.addEventListener('DOMContentLoaded', function(){
					parseDocument();
					w.removeEventListener('load', parseDocument);
				});
				w.addEventListener('load', parseDocument);
			}
			else if (w.attachEvent) {
				w.attachEvent('onload', parseDocument);
				w.attachEvent('onresize', parseDocumentAfterTimeout);
			}
			this.areListenersActive = true;
		},

		/**
		 * Initialize  and resize event handlers
		 */
		initialize: function() {

			if (!this.isNecessary) { return false; }

			_cacheArray = [];
			_cacheIndex = 0;

			// Add listeners only once
			if (!this.areListenersActive) {	this._addListeners(); }
		}
	};

}(window));

picturePolyfill.initialize();