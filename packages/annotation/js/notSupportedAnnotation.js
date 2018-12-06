/**
 * groupdocs.annotation Plugin
 * Copyright (c) 2018 Aspose Pty Ltd
 * Licensed under MIT.
 * @author Aspose Pty Ltd
 * @version 1.0.0
 */

(function ($) {

	/**
	* Create private variables.
	**/
	var cells = ["area", "point", "textStrikeout", "polyline", "textField", "watermark", "textReplacement", "arrow", "textRedaction", "resourcesRedaction", "textUnderline", "distance"];
	var diagramm = ["textStrikeout", "text", "textReplacement", "textUnderline", "watermark"];
	var word = [];
	var pdf = [];
	var image = ["textReplacement"];
	var slides = ["distance", "textReplacement"];
	var supportedImageFormats = [ "bmp", "jpeg", "jpg", "tiff", "tif", "png", "gif", "emf", "wmf", "dwg", "dicom", "djvu" ];
    /**
	 * Draw svg annotation	
	 */
    $.fn.notSupportedAnnotations = function () {
		var documentType = getDocumentFormat(documentGuid).format;
		var extension = documentGuid.substr( (documentGuid.lastIndexOf('.') +1) );
		if($.inArray(extension, supportedImageFormats) !== -1){
			documentType = "image";
		}
		var notSuuportedAnnotations = null;
        switch (documentType) {
			case "Microsoft Word":
				notSuuportedAnnotations = word;
				break;
			case "Microsoft Excel":
				notSuuportedAnnotations = cells;
				break;
			case "Microsoft Visio":
				notSuuportedAnnotations = diagramm;
				break;
			case "Portable Document Format":
				notSuuportedAnnotations = pdf;
				break;
			case "image":
				notSuuportedAnnotations = image;
				break;
			case "Microsoft PowerPoint":
				notSuuportedAnnotations = slides;
				break;
		}
		return notSuuportedAnnotations;
    }
	
})(jQuery);