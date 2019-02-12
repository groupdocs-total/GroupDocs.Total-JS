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
			if ($.fn.opticalCodeGenerator.checkText()) {
				activateAddButton(true);
				var opticalProperties = $.fn.opticalCodeGenerator.getProperties();
				opticalProperties.imageGuid = "";
				saveDrawnOpticalCode(opticalProperties);
			} else {
				activateAddButton(false);
				$("#gd-qr-preview-container").html("");
				changeListClass("gd-signature-list-wrapper-add");
			}
		})
	);

	//////////////////////////////////////////////////
    // Close new optical code signature adding
    //////////////////////////////////////////////////
	$("body").on(userMouseClick, "#gd-close-signature", function () {
		closeAddCode();
    });

	//////////////////////////////////////////////////
    // Add new optical code signature into the list
    //////////////////////////////////////////////////
	$("body").on(userMouseClick, ".gd-add-optical", function () {
		if ($.fn.opticalCodeGenerator.checkText() && $('.gd-add-optical').hasClass("active")) {
			var opticalProperties = $.fn.opticalCodeGenerator.getProperties();
			opticalProperties.imageGuid = signature.signatureGuid;
			opticalProperties.temp = false;
			saveDrawnOpticalCode(opticalProperties);
			closeAddCode();
		}
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
			$(this).find("#gd-qr-text").focus();
		}
	}

	$.extend(true, $.fn.opticalCodeGenerator, {

        getProperties : function(){
			var text = $(this).find('#' + paramValues.text).val();
			var properties = {text: text, temp: true};
			return properties;
		},

		checkText : function() {
			var text = $(this).find('#' + paramValues.text).val();
			if (text && text != "") {
				return true;
			} else {
				return false;
			}
		},

		baseHtml : function(title){
			var html = 	'<div id="gd-add-optical-signature">' +
							'<div class="gd-signature-list-title">'+
								'<div class="gd-signature-context-panel-title">New ' + title +'</div>'+
                				'<i class="fas fa-times" id="gd-close-signature"></i>'+
							'</div>'+
							'<div id="gd-qr-container">' +
								'<div id="gd-qr-preview-container" class="gd-qr-preview-container">' +
									'<i class="fa fa-qrcode"></i>'+
								'</div>' +
								'<div class="new-signature-input-group">'+
									'<input type="text" id="gd-qr-text" class="gd-qr-property" placeholder="QR code"/>' +
									'<div class="gd-add-optical inactive"><i class="fas fa-plus"></i></div>'+
								'</div>'+
							'</div>' +
						'</div>';
			return html;
		}
	});

})(jQuery);

function activateAddButton(option) {
	if (option) {
		$('.gd-add-optical').removeClass("inactive");
		$('.gd-add-optical').addClass("active");
	} else {
		$('.gd-add-optical').removeClass("active");
		$('.gd-add-optical').addClass("inactive");
	}
}

/**
 * Save drawn QR-Code signature
 * @param {Object} properties - Optical properties
 */
function saveDrawnOpticalCode(properties) {
	// current document guid is taken from the viewer.js globals
	var data = {properties: properties, signatureType: signature.signatureType};
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
			// set current signature data
			signature.signatureGuid = returnedData.imageGuid;
			signature.imageHeight = returnedData.height;
			signature.imageWidth = returnedData.width;
			$("#gd-qr-preview-container").html("");
			var prevewImage = '<image class="gd-signature-thumbnail-image" src="data:image/png;base64,' + returnedData.encodedImage + '" alt></image>';
			$("#gd-qr-preview-container").append(prevewImage);
			if (!properties.temp) {
                loadSignaturesTree('');
            } else {
                changeListClass("gd-signature-list-wrapper-add-img");
            }
		},
		error: function(xhr, status, error) {
			var err = eval("(" + xhr.responseText + ")");
			console.log(err.Message);
			// open error popup
			printMessage(err.message);
		}
	});
}