/* PicturePolyfill - Responsive Images that work today. (and mimic the proposed Picture element with span elements). Author: Andrea Verlicchi | License: MIT/GPLv2 */

(function(w) {

	"use strict";

	var timerId,
		pixelRatio,
		mediaQueriesSupported,
		browserCanAppendImagesToPictures;

	/**
	 * Detects if browser can append images to pictures
	 * @returns {boolean}
	 */
	function detectIfBrowserCanAppendImagesToPictures() {
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
	 * Replaces the existing picture element with another picture element containing an image with the imgSrc source
	 * @param picture
	 * @param imgSrc
	 * @param imgAlt
	 */
	function replacePictureWithPictureAndImg(picture, imgSrc, imgAlt) {
		var newImage = document.createElement("img"),
			newPicture = document.createElement("picture");
		newImage.setAttribute('src', imgSrc);
		newImage.setAttribute('alt', imgAlt);
		newPicture.appendChild(newImage);
		picture.parentNode.replaceChild(newPicture, picture);
	}

	/**
	 * Returns a hash density > sourceSet
	 * @param srcSetAttribute
	 * @returns {{}}
	 */
	function getSrcSetHash(srcSetAttribute) {
		var srcSetElement,
			source,
			density,
			hash = {},
			srcSetElements = srcSetAttribute.split(',');

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
	 * @param srcSetArray
	 * @param position
	 * @returns {string}
	 */
	function getSrcFromSrcSetArray(srcSetArray, position) {
		var ret;
		do {
			ret = srcSetArray[position+'x'];
			position-=1;
		}
		while (ret===undefined && position>0);
		return ret;
	}

	/**
	 * Loop through every element of the dataPicture array, check if the media query applies and,
	 * if so, get the src element from the srcSet property based depending on pixel ratio
	 * @param dataPicture {element}
	 * @returns {string}
	 */
	function getSrcAttributeFromData(dataPicture) {
		var media,
			matchedSrc;

		for (var i=0, len=dataPicture.length; i<len; i+=1) {
			media = dataPicture[i].media;
			if (!media || w.matchMedia(media).matches) {
				matchedSrc = getSrcFromSrcSetArray(dataPicture[i].srcset, pixelRatio);
			}
		}
		return matchedSrc;
	}

	/**
	 * Set the src attribute of the first image element inside passed pictureElement
	 * if the image doesn't exist, creates it, sets its alt attribute, and appends it to pictureElement
	 * @param pictureElement
     * @param sourcesData
	 */
	function createOrUpdateImage(pictureElement, sourcesData) {
		var imageElement, srcAttribute, altAttribute,
			imageElements = pictureElement.getElementsByTagName('img');

		srcAttribute = (!mediaQueriesSupported || !sourcesData.length) ?
			pictureElement.getAttribute("data-default-src") :
			getSrcAttributeFromData(sourcesData);

		// If image already exists, use it
		if (imageElements.length) {
			imageElements[0].setAttribute('src', srcAttribute);
		}
		// Else create the image
		else {
			altAttribute = pictureElement.getAttribute('data-alt');
			if (browserCanAppendImagesToPictures) {
				imageElement = document.createElement('img');
				imageElement.setAttribute('alt', altAttribute);
				imageElement.setAttribute('src', srcAttribute);
				pictureElement.appendChild(imageElement);
			}
			else {
				replacePictureWithPictureAndImg(pictureElement, srcAttribute, altAttribute );
			}
		}
	}

	/**
	 * Parses the picture element looking for sources elements, then
	 * generate the array or string for the SrcSetArray
	 * @param pictureElement the starting element to parse DOM into. If not passed, it parses the whole document.
	 */
	function parseSources(pictureElement) {
		var sourcesData = [],
			foundSources = pictureElement.getElementsByTagName('source');

		for (var i=0, len = foundSources.length; i<len; i+=1) {
			var sourceElement = foundSources[i];
			var media = sourceElement.getAttribute('media');
			var srcset = getSrcSetHash(sourceElement.getAttribute('srcset'));
			sourcesData.push({
				'media': media,
				'srcset': srcset
			});
		}
		return sourcesData;
	}

	/**
	 * Parses the DOM looking for elements containing the "data-picture" attribute, then
	 * generate the images or updates their src attribute.
	 * @param element the starting element to parse DOM into. If not passed, it parses the whole document.
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

		function picturePolyfillDocument() {
			parsePictures(document);
		}

		pixelRatio = (w.devicePixelRatio) ? Math.ceil(w.devicePixelRatio) : 1;
		mediaQueriesSupported = w.matchMedia && w.matchMedia("only all") !== null && w.matchMedia("only all").matches;
		browserCanAppendImagesToPictures = detectIfBrowserCanAppendImagesToPictures();

		if (w.addEventListener) {
			// Manage resize event only if they've passed 100 milliseconds between a resize event and another
			// to avoid the script to slow down browsers that animate resize or when browser edge is being manually dragged
			w.addEventListener('resize', function() {
				clearTimeout(timerId);
				timerId = setTimeout(picturePolyfillDocument, 100);
			});
			w.addEventListener('DOMContentLoaded', function(){
				picturePolyfillDocument();
				w.removeEventListener('load', picturePolyfillDocument);
			});
			w.addEventListener('load', picturePolyfillDocument);
		}
		else if (w.attachEvent) {
			w.attachEvent('onload', picturePolyfillDocument);
		}
	}

	initialize();

	// Exposing picturePolyfill to the global environment,
	// to gain the ability to call picturePolyfill on a slice of DOM (eg: after an AJAX call)
	w.picturePolyfill = parsePictures;

}(this));