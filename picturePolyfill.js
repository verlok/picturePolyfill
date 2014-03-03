function responsiveImages() {

	var pictureElements = document.getElementsByTagName('picture'),
		pictureElement,
		imgElement, srcAttribute, i,
		pixelRatio = window.devicePixelRatio || 1;

	// Parse source elements and call parseSourceElement on each one
	function parseSourceElements(sourceElements, ignoreMedia) {
		var matchedSrc = null, i;
		for (i=0; i<sourceElements.length; i+=1) {
			// Get the right srcSet based on media queries
			matchedSrc = parseSourceElement(sourceElements[i], ignoreMedia) || matchedSrc;
		}
		return matchedSrc;
	}

	// Parse source element and get the proper src attribute
	function parseSourceElement(sourceElement, ignoreMedia) {
		var media, i, ratio, srcSetElements, srcSetElement, matchedSrc, srcSetAttribute;
		media = sourceElement.getAttribute('media');
		if (ignoreMedia || !media || matchMedia(media).matches) {
			srcSetAttribute = sourceElement.getAttribute('srcset');
			// Get the right source based on pixel ratio
			srcSetElements = srcSetAttribute.split(',');
			for (i=0; i<srcSetElements.length; i+=1) {
				srcSetElement = srcSetElements[i].trim().split(' ');
				ratio = parseInt(srcSetElement[1]) || 1;
				if (ratio === pixelRatio) {
					matchedSrc = srcSetElement[0];
				}
			}
		}
		return matchedSrc;
	}

	function getOrCreateImage(picture) {
		var imageElements, imageElement;
		imageElements = picture.getElementsByTagName('img');

		// If image already exist, return it
		if (imageElements.length) {
			imageElement = imageElements[0];
		}
		// Else create the image
		else {
			imageElement = document.createElement('img');
			imageElement.setAttribute('alt', picture.getAttribute('data-alt'));
			picture.appendChild(imageElement);
		}
		return imageElement;
	}

	// Loop through all picture elements
	for (i=0; i<pictureElements.length; i+=1) {

		pictureElement = pictureElements[i];
		
		// If browser doesn't support matchMedia - NOTE: Paul Irish's polyfill is provided in "external/matchMedia.js"
		srcAttribute = (false && window.matchMedia) ?
			parseSourceElements(pictureElement.getElementsByTagName('source'), false) :
			parseSourceElement(pictureElement.querySelector('source[data-default]'), true);
			
		// Fallback image
		// TODO: get from the options, to be passed in from an init function
		srcAttribute = srcAttribute || "http://placehold.it/1x1";

		// Select the image, or create it
		imgElement = getOrCreateImage(pictureElement);

		// Set the img source
		imgElement.setAttribute('src', srcAttribute);
	}
}

// On resize
window.addEventListener('resize', function() {
	responsiveImages();
});

// Execute the function right at page landing
responsiveImages();