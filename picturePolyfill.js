/* PicturePolyfill - Responsive Images that work today. (and mimic the proposed Picture element with span elements). Author: Andrea Verlicchi | License: MIT/GPLv2 */

(function(w) {

	"use strict";

	var timerId,
		pixelRatio = Math.ceil(w.devicePixelRatio || 1), // The pixel density (2 is for HD aka Retina displays)
		mediaQueriesSupported = w.matchMedia && w.matchMedia("only all") !== null && w.matchMedia("only all").matches;


	/**
	 * Returns a hash density > src
	 */

	function getSrcSetHash(srcSetAttribute) {
		var hash = {},
			sources = srcSetAttribute.split(',');
		
		for (var i=0, len=sources.length; i<len; i+=1) {
			var srcAndDensity = sources[i].trim().split(' ');
			var src = srcAndDensity[0].trim();
			var density = (parseInt(srcAndDensity[1], 10) || 1).toString();
			hash[density] = src;
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
		while (srcSetArray[position]===undefined && position>0) {
			position-=1;
		}
		return srcSetArray[position];
	}


	/**
	 * Loop through every element of the dataPicture array, check if the media query applies and,
	 * if so, get the src element from the srcSet property based depending on pixel ratio
	 * @param dataPicture {element}
	 * @returns {string}
	 */

	function getSrcAttributeFromData(dataPicture) {
		var media, matchedSrc;

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
	 * @param srcAttribute
	 */

	function createOrUpdateImage(pictureElement, srcAttribute) {
		var imageElements, imageElement;
		imageElements = pictureElement.getElementsByTagName('img');

		// If image already exist, use it
		if (imageElements.length) {
			imageElements[0].setAttribute('src', srcAttribute);
		}
		// Else create the image
		else {
			imageElement = document.createElement('img');
			imageElement.setAttribute('alt', pictureElement.getAttribute('data-alt'));
			imageElement.setAttribute('src', srcAttribute);
			pictureElement.appendChild(imageElement);
		}
	}


	/**
	 * Parses the picture element looking for sources elements, then
	 * generate the array or string for the SrcSetArray 
	 * @param element the starting element to parse DOM into. If not passed, it parses the whole document.
	 */

	function parseSources(pictureElement) {
		var arr = [],
			sourceElements = pictureElement.getElementsByTagName('source');

		for (var i=0, len = sourceElements.length; i<len; i+=1) {
			var sourceElement = sourceElements[i];
			var media = sourceElement.getAttribute('media');
			var srcset = getSrcSetHash(sourceElement.getAttribute('srcset'));
			arr.push({
				'media': media,
				'srcset': srcset
			});
		}

		return arr;
	}

	/**
	 * Parses the DOM looking for elements containing the "data-picture" attribute, then
	 * generate the images or updates their src attribute.
	 * @param element the starting element to parse DOM into. If not passed, it parses the whole document.
	 */

	function parsePictures(element) {
		var pictureData, pictureElement,
			pictureElements = element.getElementsByTagName('picture');

		// Finding all the elements with data-image
		for (var i=0, len=pictureElements.length; i<len; i+=1) {
			pictureElement = pictureElements[i];
			//try {
				pictureData = parseSources(pictureElement);
				// Take the source from the matched media, or standard media
				// Update the image, or create it
				createOrUpdateImage(pictureElement, (mediaQueriesSupported && pictureData.length>0) ?
					getSrcAttributeFromData(pictureData) :
					pictureElement.getAttribute("data-defaultsrc"));
			//}
			//catch (e) {
				//w.console.log(e);
			//}
		}
	}

	/**
	 * Private function to call w.picturePolyfill on the whole document
	 */
	function picturePolyfillDocument() {
		w.picturePolyfill(document);
	}

	/**
	 * Expose the function to the global environment, if browser is supported, else empty function
	 * @type {Function}
	 */
	
	w.picturePolyfill = (!document.querySelectorAll) ? function(){} : function(element){
		parsePictures(element || document);
	};


	/**
	 * Manage resize event calling the parsePictures function
	 * only if they've passed 100 milliseconds between a resize event and another
	 * to avoid the script to slower the browser on animated resize or browser edge dragging
	 */

	if (w.addEventListener) {
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

}(this));