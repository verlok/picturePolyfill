/* PicturePolyfill - Responsive Images that work today. (and mimic the proposed Picture element with span elements). Author: Andrea Verlicchi | License: MIT/GPLv2 */

var picturePolyfill = (function(w) {

	"use strict";

	var timerId, cacheArray, cacheIndex;

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
	 * @param {string} imgSrc
	 * @param {string} imgAlt
	 */
	function appendImage(picture, imgSrc, imgAlt) {
		var imageElement = document.createElement('img');
		imageElement.setAttribute('alt', imgAlt);
		imageElement.setAttribute('src', imgSrc);
		picture.appendChild(imageElement);
	}

	/**
	 * Replaces the existing picture element with another picture element containing an image with the imgSrc source
	 * @param {Node} picture
	 * @param {string} imgSrc
	 * @param {string} imgAlt
	 */
	function replacePictureAndAppendImage(picture, imgSrc, imgAlt) {
		var newPicture = document.createElement("picture");
		appendImage(newPicture, imgSrc, imgAlt);
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
		 * @param {Array} srcsetArray
		 * @param {int} position
		 * @returns {string}
		 */
		_getSrcFromSrcsetArray: function(srcsetArray, position) {
			var ret;
			do {
				ret = srcsetArray[position+'x'];
				position-=1;
			}
			while (ret===undefined && position>0);
			return ret;
		},

		/**
		 * Loop through every element of the sourcesData array, check if the media query applies and,
		 * if so, get the src element from the srcSet property based depending on pixel ratio
		 * @param sourcesData {Array}
		 * @returns {string}
		 */
		_getSrcAttributeFromSourcesData: function(sourcesData) {
			var matchedSrc;

			for (var i=0, len=sourcesData.length; i<len; i+=1) {
				var sourceData = sourcesData[i],
					media = sourceData.media,
					srcset = sourceData.srcset;
				if (!media || w.matchMedia(media).matches) {
					matchedSrc = srcset ? this._getSrcFromSrcsetArray(srcset, picturePolyfill._pixelRatio) : sourceData.src;
				}
			}
			return matchedSrc;
		},

		/**
		 * Set the src attribute of the first image element inside passed pictureElement
		 * if the image doesn't exist, creates it, sets its alt attribute, and appends it to pictureElement
		 * @param pictureElement {Node}
		 * @param sourcesData {Array}
		 */
		_createOrUpdateImage: function(pictureElement, sourcesData) {
			var srcAttribute, altAttribute,
				imageElements = pictureElement.getElementsByTagName('img');

			srcAttribute = (!picturePolyfill._areMediaQueriesSupported || !sourcesData.length) ?
				pictureElement.getAttribute("data-default-src") :
				picturePolyfill._getSrcAttributeFromSourcesData(sourcesData);

			// If image already exists, use it
			if (imageElements.length) {
				imageElements[0].setAttribute('src', srcAttribute);
			}
			// Else create the image
			else {
				altAttribute = pictureElement.getAttribute('data-alt');
				if (picturePolyfill._isAppendImageSupported) {
					appendImage(pictureElement, srcAttribute, altAttribute);
				}
				else {
					replacePictureAndAppendImage(pictureElement, srcAttribute, altAttribute);
				}
			}
		},

		/**
		 * Parses the picture element looking for sources elements, then
		 * generate the array or string for the SrcSetArray
		 * @param {Array} pictureElement the starting element to parse DOM into. If not passed, it parses the whole document.
		 */
		_parseSources: function(pictureElement) {
			var sourcesData = [],
				foundSources = pictureElement.getElementsByTagName('source');

			for (var i=0, len = foundSources.length; i<len; i+=1) {
				var sourceElement = foundSources[i],
					srcset = sourceElement.getAttribute('srcset');
				sourcesData.push({
					'media': sourceElement.getAttribute('media'),
					'src': sourceElement.getAttribute('src'),
					'srcset': srcset ? picturePolyfill._getSrcsetHash(srcset) : null
				});
			}
			return sourcesData;
		},

		/**
		 * Parses the DOM looking for elements containing the "data-picture" attribute, then
		 * generate the images or updates their src attribute.
		 * @param {Node} element (the starting element to parse DOM into. REQUIRED)
		 */
		parsePictures: function(element) {
			var sourcesData,
				pictureElement,
				pictureElements;

			if (!this.isNecessary) {
				return false;
			}

			pictureElements = (element || document).getElementsByTagName('picture');

			for (var i=0, len=pictureElements.length; i<len; i+=1) {
				pictureElement = pictureElements[i];
				sourcesData = cacheArray[pictureElement.getAttribute('data-cache-index')];
				if (!sourcesData) {
					sourcesData = picturePolyfill._parseSources(pictureElement);
					cacheArray[cacheIndex] = sourcesData;
					pictureElement.setAttribute('data-cache-index', cacheIndex);
					cacheIndex+=1;
				}
				picturePolyfill._createOrUpdateImage(pictureElement, sourcesData);
			}
		},

		/**
		 * Initialize  and resize event handlers
		 */
		initialize: function() {

			if (!this.isNecessary) {
				return false;
			}

			cacheArray = [];
			cacheIndex = 0;

			function parseWholeDocument() {
				picturePolyfill.parsePictures(document);
			}

			if (w.addEventListener) {
				// Manage resize event only if they've passed 100 milliseconds between a resize event and another
				// to avoid the script to slow down browsers that animate resize or when browser edge is being manually dragged
				w.addEventListener('resize', function() {
					clearTimeout(timerId);
					timerId = setTimeout(parseWholeDocument, 100);
				});
				w.addEventListener('DOMContentLoaded', function(){
					parseWholeDocument();
					w.removeEventListener('load', parseWholeDocument);
				});
				w.addEventListener('load', parseWholeDocument);
			}
			else if (w.attachEvent) {
				w.attachEvent('onload', parseWholeDocument);
			}

		}
	};

}(window));

//picturePolyfill.initialize();