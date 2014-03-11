/* PicturePolyfill - Responsive Images that work today. (and mimic the proposed Picture element with span elements). Author: Andrea Verlicchi | License: MIT/GPLv2 */

(function(w) {

	"use strict";

	var timerId,
		pixelRatio = w.devicePixelRatio || 1,          // The pixel density (2 is for HD aka Retina displays)
		mediaQueriesSupported = w.matchMedia && w.matchMedia("only all") !== null && w.matchMedia("only all").matches;


	/**
	 * Returns the proper src from the srcSet property
	 * If arrayOrString is a string, returns it
	 * else get the first valid element from passed position to the left
	 * @param arrayOrString
	 * @param position
	 * @returns {*}
	 */

	function getSrcFromSrcSet(arrayOrString, position) {
		if (typeof arrayOrString === 'string') {
			return arrayOrString;
		}
		while (arrayOrString[position]===undefined && position>0) {
			position-=1;
		}
		return arrayOrString[position];
	}


	/**
	 * Loop through every element of the dataPicture array, check if the media query applies and,
	 * if so, get the src element from the srcSet property based depending on pixel ratio
	 * @param dataPicture
	 * @returns {string}
	 */

	function getSrcAttributeFromData(dataPicture) {
		var media, matchedSrc;

		for (var i=0, len=dataPicture.length; i<len; i+=1) {
			media = dataPicture[i].media;
			if (!media || w.matchMedia(media).matches) {
				matchedSrc = getSrcFromSrcSet(dataPicture[i].srcset, pixelRatio-1);
			}
		}
		return matchedSrc;
	}


	/**
	 * Search for the "standard: true" image in the array
	 * @param dataPicture
	 * @returns {string}
	 */

	function getStandardImageFromData(dataPicture) {
		var dataElement;

		for (var i=0, len=dataPicture.length; i<len; i+=1) {
			dataElement = dataPicture[i];
			if (dataElement.standard) {
				break;
			}
		}
		return getSrcFromSrcSet(dataElement.srcset, 0);
	}

	/**
	 * Set the src attribute of the first image element inside passed imageHolder
	 * if the image doesn't exist, creates it, sets its alt attribute, and appends it to imageHolder
	 * @param imageHolder
	 * @param srcAttribute
	 */

	function createOrUpdateImage(imageHolder, srcAttribute) {
		var imageElements, imageElement;
		imageElements = imageHolder.getElementsByTagName('img');

		// If image already exist, use it
		if (imageElements.length) {
			imageElements[0].setAttribute('src', srcAttribute);
		}
		// Else create the image
		else {
			imageElement = document.createElement('img');
			imageElement.setAttribute('alt', imageHolder.getAttribute('data-alt'));
			imageElement.setAttribute('src', srcAttribute);
			imageHolder.appendChild(imageElement);
		}
	}

	/**
	 * Parses the DOM looking for elements containing the "data-picture" attribute, then
	 * generate the images or updates their src attribute.
	 * @param element the starting element to parse DOM into. If not passed, it parses the whole document.
	 */

	function parseDOM(element) {
		var pictureData, imageHolder,
			imageHolders = element.querySelectorAll('[data-picture]');

		// Finding all the elements with data-image
		for (var i=0, len=imageHolders.length; i<len; i+=1) {
			imageHolder = imageHolders[i];
			try {
				pictureData = JSON.parse(imageHolder.getAttribute('data-picture'));
				// Take the source from the matched media, or standard media
				// Update the image, or create it
				createOrUpdateImage(imageHolder, (mediaQueriesSupported) ?
					getSrcAttributeFromData(pictureData) :
					getStandardImageFromData(pictureData));
			}
			catch (e) {
				w.console.log(e);
			}
		}
	}

	/**
	 * Expose the function to the global environment, if browser is supported, else empty function
	 * @type {Function}
	 */
	
	w.picturePolyfill = (!document.querySelectorAll) ? function(){} : function(element){
		parseDOM(element || document);
	};

	/**
	 * Manage resize event calling the parseDOM function
	 * only if they've passed 100 milliseconds between a resize event and another
	 * to avoid the script to slower the browser on animated resize or browser edge dragging
	 */

	if (w.addEventListener) {
		w.addEventListener('resize', function() {
			clearTimeout(timerId);
			timerId = setTimeout(w.picturePolyfill, 100);
		});
		w.addEventListener('DOMContentLoaded', function(){
			w.picturePolyfill();
			w.removeEventListener('load', w.picturePolyfill);
		});
		w.addEventListener('load', w.picturePolyfill);
	}
	else if (w.attachEvent) {
		w.attachEvent('onload', w.picturePolyfill);
	}

}(this));