/* PicturePolyfill - Responsive Images that work today. (and mimic the proposed Picture element with span elements). Author: Andrea Verlicchi | License: MIT/GPLv2 */

/*
 * TODO:
 * ALSO MANAGE SRCSET, IT MIGHT BE ALREADY SUPPORTED BY THE BROWSER
 * SO NO NEED TO SET SRC INDIVIDUALLY
 * 1. TEST SRCSET SUPPORT SOMEHOW
 * 2. IF SRCSET IS SUPPORTED, SET BOTH SRC AND SRCSET IN THE IMG TAG, ELSE SRC ONLY
 * */

var picturePolyfill = (function (w) {

	"use strict";

	var cacheArray,
		cacheLatestIndex,
		resizeTimer,
		timeAfterResize = 100,
		areListenersActive = false;

	return {

		/**
		 * Get all the "attributes" from an "element" and returns them as a hash
		 * @param element
		 * @param attributes
		 * @returns {{}}
		 * @private
		 */
		_getAttrs: function (element, attributes) {
			var ret = {}, attributeName, attributeValue;
			for (var i = 0, len = attributes.length; i < len; i += 1) {
				attributeName = attributes[i];
				attributeValue = element.getAttribute(attributeName);
				if (attributeValue) {
					ret[attributeName] = attributeValue;
				}
			}
			return ret;
		},

		/**
		 * Gets the attributes list from an "element"
		 * @param element
		 * @returns {Array}
		 * @private
		 */
		_getAttrsList: function (element) {
			var arr = [];
			for (var i = 0, attributes = element.attributes, l = attributes.length; i < l; i++) {
				arr.push(attributes.item(i).nodeName);
			}
			return arr;
		},

		/**
		 * Returns a sorted array of object representing the elements of a srcset attribute,
		 * where pxr is the pixel ratio and src is the source for that ratio
		 * @param srcset
		 * @returns {Array}
		 * @private
		 */
		_getSrcsetArray: function (srcset) {
			var srcSetElement,
				source,
				density,
				ret = [],
				srcSetElements = srcset.split(',');

			for (var i = 0, len = srcSetElements.length; i < len; i += 1) {
				srcSetElement = srcSetElements[i].trim().split(' ');
				if (srcSetElement.length === 1) {
					density = 1;
				}
				else {
					density = parseFloat(srcSetElement[srcSetElement.length - 1], 10);
				}
				source = srcSetElement[0];
				ret.push({pxr: density, src: source});
			}

			return ret.sort(function (hash1, hash2) {
				var pxr1 = hash1.pxr, pxr2 = hash2.pxr;
				if (pxr1 < pxr2) {
					return -1;
				}
				if (pxr1 > pxr2) {
					return  1;
				}
				return 0;
			});
		},

		/**
		 * Returns the proper src from the srcset array obtained by _getSrcsetArray
		 * Get the first valid element from passed position to the left
		 * @param array
		 * @param pixelRatio
		 * @returns string || null
		 * @private
		 */
		_getSrcFromArray: function (array, pixelRatio) {
			var i = 0,
				len = array.length,
				breakPoint = -1;
			if (!len) {
				return null;
			}
			do {
				if (array[i].pxr >= pixelRatio || i === len - 1) {
					breakPoint = i;
				}
				i += 1;
			} while (!(breakPoint > -1 || i >= len));
			return array[breakPoint].src;
		},

		/**
		 * Loop through every element of the sourcesData array, check if the media query applies and,
		 * if so, get the src element from the srcSet property based depending on pixel ratio
		 * @param sourcesData
		 * @returns {string||undefined}
		 * @private
		 */
		_getSrcFromData: function (sourcesData) {
			var sourceData,
				media,
				srcset;

			for (var i = 0, len = sourcesData.length; i < len; i += 1) {
				sourceData = sourcesData[i];
				media = sourceData.media;
				srcset = sourceData.srcset;
				if (!media || w.matchMedia(media).matches) {
					return (srcset) ? this._getSrcFromArray(srcset, this._pxRatio) : sourceData.src;
				}
			}
			return null;
		},

		/**
		 * Set the src attribute of the first image element inside passed pictureElement
		 * if the image doesn't exist, creates it, sets its alt attribute, and appends it to pictureElement
		 * @param pictureElement {Node}
		 * @param attributes
		 */
		_setImgSrc: function (pictureElement, attributes) {
			var imageElements = pictureElement.getElementsByTagName('img'),
				imgEl, originalImgSrc, originalImgSrcset, givenSrcAttribute,
				srcToSet, srcsetToSet;

			if (imageElements.length === 0) {
				return false;
			}

			imgEl = imageElements[0];
			originalImgSrc = imgEl.getAttribute('data-original-src');
			originalImgSrcset = imgEl.getAttribute('data-original-srcset');
			givenSrcAttribute = attributes.src;

			// Set original img tag's src and srcset in a data attribute
			if (!originalImgSrc) {
				imgEl.setAttribute('data-original-src', imgEl.getAttribute('src'));
				imgEl.setAttribute('data-original-srcset', imgEl.getAttribute('srcset'));
			}

			// Set srcToSet and srcsetToSet depending on the given src attribute
			// If the given src is empty, use the original img src and srcset
			if (!givenSrcAttribute) {
				srcToSet = originalImgSrc;
				srcsetToSet = originalImgSrcset;
			}
			else {
				srcToSet = givenSrcAttribute;
				srcsetToSet = attributes.srcset;
			}

			if (imgEl.getAttribute('src') !== srcToSet) {
				imgEl.setAttribute('src', srcToSet);
			}
			if (!!srcsetToSet && imgEl.getAttribute('srcset') !== srcsetToSet) {
				imgEl.setAttribute('srcset', srcsetToSet);
			}


		},

		/**
		 * Parses the picture element looking for sources elements, then
		 * generate the array or string for the SrcSetArray
		 * @param {Array} pictureElement the starting element to parse DOM into. If not passed, it parses the whole document.
		 */
		_getSourcesData: function (pictureElement) {
			var sourcesData = [],
				sourceElement,
				sourceData,
				foundSources = pictureElement.getElementsByTagName('source');

			for (var i = 0, len = foundSources.length; i < len; i += 1) {
				sourceElement = foundSources[i];
				sourceData = this._getAttrs(sourceElement, this._getAttrsList(sourceElement));
				if (sourceData.srcset) {
					sourceData.srcset = this._getSrcsetArray(sourceData.srcset);
				}
				sourcesData.push(sourceData);
			}
			return sourcesData;
		},

		/**
		 * Adds listeners to load and resize event
		 * @private
		 */
		_addListeners: function () {

			if (!this.isUseful || areListenersActive) {
				return false;
			}

			function parseDocument() {
				picturePolyfill.parse(document);
			}

			// Manage resize event only if they've passed 100 milliseconds between a resize event and another
			// to avoid the script to slow down browsers that animate resize or when browser edge is being manually dragged
			function parseDocumentAfterTimeout() {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(parseDocument, timeAfterResize);
			}

			if (w.addEventListener) {
				w.addEventListener('resize', parseDocumentAfterTimeout);
				w.addEventListener('DOMContentLoaded', function () {
					parseDocument();
					w.removeEventListener('load', parseDocument);
				});
				w.addEventListener('load', parseDocument);
			}
			else if (w.attachEvent) {
				w.attachEvent('onload', parseDocument);
				w.attachEvent('onresize', parseDocumentAfterTimeout);
			}

			areListenersActive = true;
		},

		/**
		 * Initialize  and resize event handlers
		 */
		initialize: function () {

			/**
			 * The device pixel ratio. 1 for standard displays, 2+ for HD displays
			 * @type {number}
			 * @private
			 */
			this._pxRatio = w.devicePixelRatio || 1;

			/**
			 * Detect if browser has media queries support
			 * @type {boolean}
			 * @private
			 */
			this._mqSupport = !!w.matchMedia && w.matchMedia("only all") !== null && w.matchMedia("only all").matches;

			/**
			 * Detect if polyfill is necessary
			 * @type {boolean}
			 */
			this.isUseful = !w.HTMLPictureElement;

			/**
			 * Cache array, where all sources data is stored
			 * @type {Array}
			 * @private
			 */
			cacheArray = [];

			/**
			 * Cache index, incremental
			 * @type {number}
			 * @private
			 */
			cacheLatestIndex = 0;

			// Add listeners (listeners are added once)
			this._addListeners();
		},

		/**
		 * Parses the DOM looking for elements containing the "data-picture" attribute, then
		 * generate the images or updates their src attribute.
		 * @param {Node} element (the starting element to parse DOM into. REQUIRED)
		 */
		parse: function (element, readFromCache) {
			var sourcesData,
				pictureElement,
				pictureElements,
				srcAttribute,
				mqSupport,
				cacheIndex;

			// Do nothing if picture is supported
			if (!this.isUseful) {
				return 0;
			}

			// Default readFromCache parameter value
			if (readFromCache === null) {
				readFromCache = true;
			}

			pictureElements = (element || document).getElementsByTagName('picture');
			mqSupport = this._mqSupport;

			for (var i = 0, len = pictureElements.length; i < len; i += 1) {
				sourcesData = null;
				pictureElement = pictureElements[i];
				// Try to read sources data from cache
				if (readFromCache) {
					cacheIndex = pictureElement.getAttribute('data-cache-index');
					if (cacheIndex !== null) {
						sourcesData = cacheArray[cacheIndex];
					}
				}
				// If no sources are found in cache, try to read sources data from the picture element, then cache them
				if (!sourcesData) {
					sourcesData = this._getSourcesData(pictureElement);
					// Write in cache
					cacheArray[cacheLatestIndex] = sourcesData;
					pictureElement.setAttribute('data-cache-index', cacheLatestIndex);
					cacheLatestIndex += 1;
				}
				// If no sourcesData retrieved or media queries are not supported, read from the default src
				srcAttribute = (sourcesData.length === 0 || !mqSupport) ?
					pictureElement.getAttribute('data-default-src') :
					this._getSrcFromData(sourcesData);
				// Set the img source
				this._setImgSrc(pictureElement, {
					src: srcAttribute,
					alt: pictureElement.getAttribute('data-alt')
				});
			}

			return i;
		}
	};

}(window));

picturePolyfill.initialize();
picturePolyfill.parse();