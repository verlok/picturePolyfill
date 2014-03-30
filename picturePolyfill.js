/* PicturePolyfill - Responsive Images that work today. (and mimic the proposed Picture element with span elements). Author: Andrea Verlicchi | License: MIT/GPLv2 */

var picturePolyfill = (function(w) {

	"use strict";

	var _cacheArray,
		_cacheIndex,
		_resizeTimer,
		_timeAfterResize = 100,
		_areListenersActive = false;

	/**
	 * Detects old browser checking if browser can append images to pictures
	 * @returns {boolean}
	 */
	function _detectAppendImageSupport() {
		var newImg = document.createElement('img'),
			pictures, firstPicture;

		pictures = document.getElementsByTagName('picture');
		firstPicture = pictures[0];

		if (!pictures.length) {
			// Can't determine support if no pictures are in the page. Worst case will do.
			return false;
		}

		try {
			firstPicture.appendChild(newImg);
			firstPicture.removeChild(newImg);
			return true;
		}
		catch(e) {
			return false;
		}
	}

	return {

		/**
		 * Appends an image element to a picture element
		 * @param picture
		 * @param attributes
		 * @private
		 */
		_appendImg: function(picture, attributes) {
			var imageElement = document.createElement('img');
			this._setAttrs(imageElement, attributes);
			picture.appendChild(imageElement);
		},

		/**
		 * Set all the "attributes" to an "element"
		 * @param element
		 * @param attributes
		 * @private
		 */
		_setAttrs: function(element, attributes) {
			for (var attributeName in attributes) {
				element.setAttribute(attributeName, attributes[attributeName]);
			}
		},

		/**
		 * Get all the "attributes" from an "element" and returns them as a hash
		 * @param element
		 * @param attributes
		 * @returns {{}}
		 * @private
		 */
		_getAttrs: function(element, attributes) {
			var ret = {}, attributeName, attributeValue;
			for (var i=0, len=attributes.length; i<len; i+=1) {
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
		_getAttrsList: function(element) {
			var arr = [];
			for (var i=0, attributes=element.attributes, l=attributes.length; i<l; i++){
				arr.push(attributes.item(i).nodeName);
			}
			return arr;
		},

		/**
		 * Replaces the existing picture element with another picture element containing an image with the imgSrc source
		 * @param picture
		 * @param attributes
		 * @private
		 */
		_replacePicture: function(picture, attributes) {
			var newPicture = document.createElement("picture"),
				pictureAttributes = this._getAttrs(picture, this._getAttrsList(picture));
			this._appendImg(newPicture, attributes);
			this._setAttrs(newPicture, pictureAttributes);
			picture.parentNode.replaceChild(newPicture, picture);
		},

		/**
		 * Returns a hash density > sourceSet
		 * @param srcset
		 * @returns {{}}
		 * @private
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
		 * @param srcsetHash
		 * @param position
		 * @returns {*}
		 * @private
		 */
		_getSrcFromHash: function(srcsetHash, position) {
			var ret, key;

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
			for (key in srcsetHash) {
				return srcsetHash[key];
			}

			// Fallback
			return null;
		},

		/**
		 * Loop through every element of the sourcesData array, check if the media query applies and,
		 * if so, get the src element from the srcSet property based depending on pixel ratio
		 * @param sourcesData
		 * @returns {string||undefined}
		 * @private
		 */
		_getSrcFromData: function(sourcesData) {
			var matchedSrc,
				sourceData,
				media,
				srcset;

			for (var i=0, len=sourcesData.length; i<len; i+=1) {
				sourceData = sourcesData[i];
				media = sourceData.media;
				srcset = sourceData.srcset;
				if (!media || w.matchMedia(media).matches) {
					matchedSrc = srcset ? this._getSrcFromHash(srcset, this._pr) : sourceData.src;
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
		_setImg: function(pictureElement, attributes) {
			var imageElements = pictureElement.getElementsByTagName('img');

			// If image already exists, use it
			if (imageElements.length) {
				imageElements[0].setAttribute('src', attributes.src);
			}
			// Else create the image
			else {
				if (this._appendSupport) {
					this._appendImg(pictureElement, attributes);
				}
				else {
					this._replacePicture(pictureElement, attributes);
				}
			}
		},

		/**
		 * Parses the picture element looking for sources elements, then
		 * generate the array or string for the SrcSetArray
		 * @param {Array} pictureElement the starting element to parse DOM into. If not passed, it parses the whole document.
		 */
		_getSourcesData: function(pictureElement) {
			var sourcesData = [],
				sourceElement,
				sourceData,
				foundSources = pictureElement.getElementsByTagName('source');

			for (var i=0, len = foundSources.length; i<len; i+=1) {
				sourceElement = foundSources[i];
				sourceData = this._getAttrs(sourceElement, this._getAttrsList(sourceElement));
				if (sourceData.srcset) {
					sourceData.srcset = this._getSrcsetHash(sourceData.srcset);
				}
				sourcesData.push(sourceData);
			}
			return sourcesData;
		},

		/**
		 * Adds listeners to load and resize event
		 * @private
		 */
		_addListeners: function() {

			if (!this.isUseful || _areListenersActive) { return false; }

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

			_areListenersActive = true;
		},

		/**
		 * Initialize  and resize event handlers
		 */
		initialize: function() {

			/**
			 * The device pixel ratio. 1 for standard displays, 2+ for HD displays
			 * @type {number}
			 * @private
			 */
			this._pr = (w.devicePixelRatio) ? Math.ceil(w.devicePixelRatio) : 1;

			/**
			 * Detect if browser has media queries support
			 * @type {boolean}
			 * @private
			 */
			this._mqSupport = !!w.matchMedia && w.matchMedia("only all") !== null && w.matchMedia("only all").matches;

			/**
			 * Detect if append image to picture is possible
			 * @type {boolean}
			 * @private
			 */
			this._appendSupport = _detectAppendImageSupport();

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
			_cacheArray = [];

			/**
			 * Cache index, incremental
			 * @type {number}
			 * @private
			 */
			_cacheIndex = 0;

			// Add listeners (listeners are added once)
			this._addListeners();
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

			if (!this.isUseful) { return 0; }

			pictureElements = (element || document).getElementsByTagName('picture');

			for (var i=0, len=pictureElements.length; i<len; i+=1) {
				pictureElement = pictureElements[i];
				if (!this._mqSupport) {
					srcAttribute = pictureElement.getAttribute("data-default-src");
				} else {
					sourcesData = _cacheArray[pictureElement.getAttribute('data-cache-index')];
					if (!sourcesData) {
						sourcesData = this._getSourcesData(pictureElement);
						_cacheArray[_cacheIndex] = sourcesData;
						pictureElement.setAttribute('data-cache-index', _cacheIndex);
						_cacheIndex+=1;
					}
					srcAttribute = this._getSrcFromData(sourcesData);
				}
				this._setImg(pictureElement, {
					src: srcAttribute,
					alt: pictureElement.getAttribute('data-alt')
				});
			}

			return i;
		}
	};

}(window));

picturePolyfill.initialize();