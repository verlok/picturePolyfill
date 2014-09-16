/*
 PicturePolyfill
 Responsive Images that work today (and mimic the proposed Picture element with span elements)
 Author: Andrea Verlicchi
 License: MIT/GPLv2
 Please "/dist/picturePolyfill.min.js" for production purposes
 */

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
				srcSetElements;

			if (srcset === null || srcset === '' || typeof srcset === 'undefined') {
				return ret;
			}

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
		 * Returns the proper src from the given srcset
		 * Get the first valid element from passed position to the left
		 * @param srcset
		 * @param pixelRatio
		 * @returns string || null
		 * @private
		 */
		_getSrcFromSrcset: function (srcset, pixelRatio) {
			var i = 0,
				array,
				len,
				breakPoint = -1;

			if (srcset === null || srcset === '' || typeof srcset === 'undefined') {
				return "";
			}

			array = this._getSrcsetArray(srcset);
			len = array.length;

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
		 * if so, get the matching srcset attribute, if any
		 * @param sourcesData
		 * @returns string
		 * @private
		 */
		_getSrcsetFromData: function (sourcesData) {
			var sourceData,
				media,
				src,
				srcset;

			for (var i = 0, len = sourcesData.length; i < len; i += 1) {
				sourceData = sourcesData[i];
				media = sourceData.media;
				srcset = sourceData.srcset;
				src = sourceData.src;
				if (!media || w.matchMedia(media).matches) {
					if (!!srcset) {
						return srcset;
					}
					if (!!src) {
						return src;
					}
					return "";
				}
			}
			return "";
		},

		/**
		 * Get the img tag inside picture, even in IE9 and IE8
		 * @param pictureElement
		 * @returns Array
		 * @private
		 */
		_getImgTagsInPicture: function (pictureElement) {
			var currentElement = pictureElement,
				imgTags;
			imgTags = pictureElement.getElementsByTagName('img');
			if (imgTags.length > 0) {
				return imgTags;
			}
			// Didn't find anything?
			// IE8 reads the img tag AFTER the picture tag...
			// So keep searching in next siblings, and when found it push it in imgTags
			do {
				currentElement = currentElement.nextSibling;
				if (currentElement === null) {
					return [];
				}
			} while (currentElement.tagName !== 'IMG');
			// Found, return currentElement in a 1 element array
			return [currentElement];
		},

		/**
		 * Set the src attribute of the first image element inside passed pictureElement
		 * please not that the img is required in the markup, as stated in the specs
		 * @param pictureElement {Node}
		 * @param attributes
		 */
		_setImgAttributes: function (pictureElement, attributes) {
			var imageElements = this._getImgTagsInPicture(pictureElement),
				imgEl, givenSrcAttribute, givenSrcsetAttribute,
				srcToSet, srcsetToSet;

			function _setAttributeIfDifferent(element, attribute, value) {
				if (element.getAttribute(attribute) !== value) {
					element.setAttribute(attribute, value);
				}
			}

			if (imageElements.length === 0) {
				return false;
			}

			// Set original img tag's src and srcset in a data attribute
			imgEl = imageElements[0];
			if (!imgEl.getAttribute('data-original-src')) {
				_setAttributeIfDifferent(imgEl, 'data-original-src', imgEl.getAttribute('src'));
				_setAttributeIfDifferent(imgEl, 'data-original-srcset', imgEl.getAttribute('srcset'));
			}

			// Set srcToSet and srcsetToSet depending on the given src/srcset attributes
			// If none are given, use original ones
			// If both ore one are given, use them (even if one is null)
			givenSrcAttribute = attributes.src;
			givenSrcsetAttribute = attributes.srcset;
			if (!givenSrcAttribute && !givenSrcsetAttribute) {
				srcToSet = imgEl.getAttribute('data-original-src');
				srcsetToSet = imgEl.getAttribute('data-original-srcset');
			} else {
				srcToSet = givenSrcAttribute;
				srcsetToSet = givenSrcsetAttribute;
			}
			_setAttributeIfDifferent(imgEl, 'src', srcToSet);
			_setAttributeIfDifferent(imgEl, 'srcset', srcsetToSet);

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
				srcsetAttribute,
				mqSupport,
				cacheIndex;

			// Do nothing if picture is supported
			if (!this.isUseful) {
				return 0;
			}

			// Default readFromCache parameter value
			if (typeof readFromCache === 'undefined') {
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
				if (!mqSupport || sourcesData.length === 0) {
					srcAttribute = pictureElement.getAttribute('data-default-src');
					srcsetAttribute = pictureElement.getAttribute('data-default-srcset');
				}
				else {
					srcsetAttribute = this._getSrcsetFromData(sourcesData);
					srcAttribute = this._getSrcFromSrcset(srcsetAttribute, this._pxRatio);
				}
				// Set the img source
				this._setImgAttributes(pictureElement, {
					src: srcAttribute,
					srcset: srcsetAttribute,
					alt: pictureElement.getAttribute('data-alt')
				});
			}

			return i;
		}
	};

}(window));

picturePolyfill.initialize();
picturePolyfill.parse();