/* PicturePolyfill - Responsive Images that work today. (and mimic the proposed Picture element with span elements). Author: Andrea Verlicchi | License: MIT/GPLv2 */

(function(w) {

	"use strict";

	var timerId,
		pixelRatio,
		areMediaQueriesSupported,
		isAppendImageSupported;

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

	/**
	 * Returns a hash density > sourceSet
	 * @param {string} srcsetAttribute
	 * @returns {object}
	 */
	function getSrcsetHash(srcsetAttribute) {
		var srcSetElement,
			source,
			density,
			hash = {},
			srcSetElements = srcsetAttribute.split(',');

		for (var i=0, len=srcSetElements.length; i<len; i+=1) {
			srcSetElement = srcSetElements[i].trim().split(' ');
			density = srcSetElement[1] ? srcSetElement[1].trim() : "1x";
			source = srcSetElement[0].trim();
			hash[density] = source;
		}
		return hash;
	}

	/**
	 * Returns the proper src from the srcSet property
	 * Get the first valid element from passed position to the left
	 * @param {Array} srcsetArray
	 * @param {int} position
	 * @returns {string}
	 */
	function getSrcFromSrcsetArray(srcsetArray, position) {
		var ret;
		do {
			ret = srcsetArray[position+'x'];
			position-=1;
		}
		while (ret===undefined && position>0);
		return ret;
	}

	/**
	 * Loop through every element of the dataPicture array, check if the media query applies and,
	 * if so, get the src element from the srcSet property based depending on pixel ratio
	 * @param sourcesData {Array}
	 * @returns {string}
	 */
	function getSrcAttributeFromSourcesData(sourcesData) {
		var matchedSrc;

		for (var i=0, len=sourcesData.length; i<len; i+=1) {
			var sourceData = sourcesData[i],
				media = sourceData.media,
				srcset = sourceData.srcset;
			if (!media || w.matchMedia(media).matches) {
				matchedSrc = srcset ? getSrcFromSrcsetArray(srcset, pixelRatio) : sourceData.src;
			}
		}
		return matchedSrc;
	}

	/**
	 * Set the src attribute of the first image element inside passed pictureElement
	 * if the image doesn't exist, creates it, sets its alt attribute, and appends it to pictureElement
	 * @param pictureElement {Node}
     * @param sourcesData {Array}
	 */
	function createOrUpdateImage(pictureElement, sourcesData) {
		var srcAttribute, altAttribute,
			imageElements = pictureElement.getElementsByTagName('img');

		srcAttribute = (!areMediaQueriesSupported || !sourcesData.length) ?
			pictureElement.getAttribute("data-default-src") :
			getSrcAttributeFromSourcesData(sourcesData);

		// If image already exists, use it
		if (imageElements.length) {
			imageElements[0].setAttribute('src', srcAttribute);
		}
		// Else create the image
		else {
			altAttribute = pictureElement.getAttribute('data-alt');
			if (isAppendImageSupported) {
				appendImage(pictureElement, srcAttribute, altAttribute);
			}
			else {
				replacePictureAndAppendImage(pictureElement, srcAttribute, altAttribute);
			}
		}
	}

	/**
	 * Parses the picture element looking for sources elements, then
	 * generate the array or string for the SrcSetArray
	 * @param {Array} pictureElement the starting element to parse DOM into. If not passed, it parses the whole document.
	 */
	function parseSources(pictureElement) {
		var sourcesData = [],
			foundSources = pictureElement.getElementsByTagName('source');

		for (var i=0, len = foundSources.length; i<len; i+=1) {
			var sourceElement = foundSources[i],
				srcset = sourceElement.getAttribute('srcset');
			sourcesData.push({
				'media': sourceElement.getAttribute('media'),
				'src': sourceElement.getAttribute('src'),
				'srcset': srcset ? getSrcsetHash(srcset) : null
			});
		}
		return sourcesData;
	}

	/**
	 * Parses the DOM looking for elements containing the "data-picture" attribute, then
	 * generate the images or updates their src attribute.
	 * @param {Node} element (the starting element to parse DOM into. If not passed, it parses the whole document)
	 */
	function parsePictures(element) {
		var sourcesData,
			pictureElement,
			pictureElements = element.getElementsByTagName('picture');

		for (var i=0, len=pictureElements.length; i<len; i+=1) {
			pictureElement = pictureElements[i];
			sourcesData = parseSources(pictureElement); //NEXT STEP: store sources data somewhere to avoid parsing it every time
			createOrUpdateImage(pictureElement, sourcesData);
		}
	}

	/**
	 * Initialize  and resize event handlers
	 */
	function initialize() {

		function parseWholeDocument() {
			parsePictures(document);
		}

		pixelRatio = (w.devicePixelRatio) ? Math.ceil(w.devicePixelRatio) : 1;
		areMediaQueriesSupported = w.matchMedia && w.matchMedia("only all") !== null && w.matchMedia("only all").matches;
		isAppendImageSupported = detectAppendImageSupport();

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

	initialize();

	// Exposing picturePolyfill to the global environment,
	// to gain the ability to call picturePolyfill on a slice of DOM (eg: after an AJAX call)
	w.picturePolyfill = parsePictures;

}(window));