/**
 * groupdocs.signature Plugin
 * Copyright (c) 2018 Aspose Pty Ltd
 * Licensed under MIT.
 * @author Aspose Pty Ltd
 * @version 1.0.0
 */
$(document).ready(function () {
	var userMouseClick = ('ontouch' in document.documentElement)  ? 'touch click' : 'click';
	
    //////////////////////////////////////////////////
    // enter text event
    //////////////////////////////////////////////////  
    $("body").on("keyup input", "#gd-qr-text", $.debounce(500, function(e){
			var opticalProperties = $.fn.opticalCodeGenerator.getProperties();
			opticalProperties.imageGuid = "";		
			saveDrawnOpticalCode(opticalProperties);
		})
	);
	
	//////////////////////////////////////////////////
    // Close new optical code signature adding
    //////////////////////////////////////////////////  
	$("body").on(userMouseClick, "#gd-close-signature", function () {
        $("#gd-add-optical-signature").remove();
    });
	
	//////////////////////////////////////////////////
    // Add new optical code signature into the list
    //////////////////////////////////////////////////  
	$("body").on(userMouseClick, ".gd-add-optical", function () {
		var opticalProperties = $.fn.opticalCodeGenerator.getProperties();			
		opticalProperties.imageGuid = signature.signatureGuid;
		opticalProperties.temp = false;
		saveDrawnOpticalCode(opticalProperties);
		$("#gd-add-optical-signature").remove();  
    });
	
});
 
(function( $ ) {

	/**
	* Create private variables.
	**/
	var paramValues = {	
		text : 'gd-qr-text'		
	}

	$.fn.opticalCodeGenerator = function(e) {
		if($(this).find("#gd-qr-text").length == 0 && $(this)[0] == $("#gd-signature-context-panel")[0]){
			var title = "";
			if (signature.signatureType == "qrCode")
			{
				title = "QR Code";
			} else {
				title = "Bar Code";
			}
			$(this).find('.gd-signature-context-pane-wrapper').prepend($.fn.opticalCodeGenerator.baseHtml(title));
		}
	}

	$.extend(true, $.fn.opticalCodeGenerator, {

        getProperties : function(){
			var text = $(this).find('#' + paramValues.text).val();			
			var properties = {text: text, temp: true};
			return properties;
		},

		baseHtml : function(title){
			var html = 	'<div id="gd-add-optical-signature">' +
							'<div class="gd-signature-list-title">'+
								'<div class="gd-signature-context-panel-title">New ' + title +'</div>'+
                				'<i class="fas fa-times" id="gd-close-signature"></i>'+
							'</div>'+
							'<div id="gd-qr-container">' +
								'<div id="gd-qr-preview-container">' +
									'<i class="fa fa-qrcode"></i>'+
								'</div>' +
								'<div class="new-signature-input-group">'+
									'<input type="text" id="gd-qr-text" class="gd-qr-property" placeholder="QR code"/>' +
									'<div class="gd-add-optical"><i class="fas fa-plus"></i></div>'+
								'</div>'+
							'</div>' +
						'</div>';
			return html;
		}
	});

})(jQuery);

/**
 * Save drawn QR-Code signature
 * @param {Object} properties - Optical properties
 */
function saveDrawnOpticalCode(properties) {
	// current document guid is taken from the viewer.js globals
	var data = {properties: properties, signatureType: signature.signatureType};
	$('#gd-modal-spinner').show();
	// sign the document
	$.ajax({
		type: 'POST',
		url: getApplicationPath("saveOpticalCode"),
		data: JSON.stringify(data),
		contentType: 'application/json',
		success: function(returnedData) {				
			if(returnedData.message != undefined){
				// open error popup
				printMessage(returnedData.message);
				return;
			}				
			// set curent signature data
			signature.signatureGuid = returnedData.imageGuid;
			signature.imageHeight = returnedData.height;
			signature.imageWidth = returnedData.width;
			$("#gd-qr-preview-container").html("");
			var prevewImage = '<image class="gd-signature-thumbnail-image" src="data:image/png;base64,' + returnedData.encodedImage + '" alt></image>';
			$("#gd-qr-preview-container").append(prevewImage);	
			loadSignaturesTree('');
		},
		error: function(xhr, status, error) {
			var err = eval("(" + xhr.responseText + ")");
			console.log(err.Message);
			$('#gd-modal-spinner').hide();
			// open error popup
			printMessage(err.message);
		}
	});
}