/**
 * groupdocs.signature Plugin
 * Copyright (c) 2018 Aspose Pty Ltd
 * Licensed under MIT.
 * @author Aspose Pty Ltd
 * @version 1.3.0
 */

/*
******************************************************************
******************************************************************
GLOBAL VARIABLES
******************************************************************
******************************************************************
*/
var signatureImageIndex = 0;
var signaturesList = [];
var currentDocumentGuid = "";
var signedDocumentGuid = "";
var signature = {
	id: "",
    signaturePassword:  "",
    signatureComment: "",
    signatureType: "",
    left: 0,
    top: 0,
    imageWidth: 0,
    imageHeight: 0,
    signatureGuid: "",
    reason: "",
    contact: "",
    address: "",
    date: "",
    pageNumber: 0,
    angle: 0,
	deleted: false
};
var draggableSignaturePosition={};
var userMouseClick = ('ontouch' in document.documentElement)  ? 'touch click' : 'click';
var contextMenuButtons = ["fas fa-arrows-alt fa-sm", "fas fa-trash-alt fa-sm gd-delete-signature"];
var mergedFonts = [];

$(document).ready(function(){

    /*
    ******************************************************************
    NAV BAR CONTROLS
    ******************************************************************
    */
    //////////////////////////////////////////////////
    // Get supported fonts
    //////////////////////////////////////////////////
    getFonts();
	//////////////////////////////////////////////////
    // Disable default download event
    //////////////////////////////////////////////////
    $('#gd-btn-download').off(userMouseClick);

    //////////////////////////////////////////////////
    // Sign document
    //////////////////////////////////////////////////
    $("#gd-nav-save").on(userMouseClick, function(){
        if (documentGuid && signaturesList.length > 0){
            sign();
        } else {
            printMessage("Please open document and add signature");
        }
    });

    //////////////////////////////////////////////////
    // Fix for tooltips of the dropdowns
    //////////////////////////////////////////////////
    $('#gd-download-val-container').on(userMouseClick, function(e){
        if($(this).hasClass('open')){
            $('#gd-btn-download-value').parent().find('.gd-tooltip').css('display', 'none');
        }else{
            $('#gd-btn-download-value').parent().find('.gd-tooltip').css('display', 'initial');
        }
    });

    //////////////////////////////////////////////////
    // Open sign context panel
    //////////////////////////////////////////////////
    $('.gd-tool').on(userMouseClick, function(e){
        if(typeof documentGuid == "undefined" || documentGuid == ""){
            printMessage("Please open document first");
        } else {
			closeAddCode();
            var button = $(this);
            var type = button.attr("signature-type");
            if (type) {
                signature.signatureType = type;
            }
            var typeTitle = button.attr("signature-type-title");
            var gd = $('#gd-signature-context-panel');
            if (button[0].className.includes("gd-tool-inactive")) {
                loadSignaturesTree('');
                if (isMobile()) {
                    $('.gd-tool-tooltip-mobile').hide();
                }
                $('#gd-signature-context-panel-title').html(typeTitle);
                gd.show();
                inactiveAll();
                button.removeClass("gd-tool-inactive");
                button.addClass("gd-tool-active");
            } else {
                if (isMobile()) {
                    $('.gd-tool-tooltip-mobile').show();
                }
                $('#gd-signature-context-panel-title').html("");
                gd.hide();
                button.removeClass("gd-tool-active");
                button.addClass("gd-tool-inactive");
            }
            gd.toggleClass(type);
        }
    });

    //////////////////////////////////////////////////
    // Upload signature event
    //////////////////////////////////////////////////
    $('#gd-signature-upload-input').on('change', function(e) {
        var uploadFiles = $(this).get(0).files;
        // upload file one by one
        for (var i = 0; i < uploadFiles.length; i++) {
            // upload local file
            uploadSignature(uploadFiles[i], i, "");
        }
        loadSignaturesTree('');
    });

    //////////////////////////////////////////////////
    // Export drawn image signature
    //////////////////////////////////////////////////
    $('.gd-modal-body').on(userMouseClick, '#bcPaint-export', function(){
        var drawnImage = $.fn.bcPaint.export();
        saveDrawnImage(drawnImage);
        toggleLightBox(false);
    });

    //////////////////////////////////////////////////
    // Download event
    //////////////////////////////////////////////////
    $('#gd-btn-download-value > li').bind(userMouseClick, function(e){
        download($(this));
    });

	//////////////////////////////////////////////////
    // Upload button click event
    //////////////////////////////////////////////////
    $('#gd-btn-upload').on(userMouseClick, function (e) {
        $(".gd-modal-dialog").removeClass("gd-signature-modal-dialog");
    });

	//////////////////////////////////////////////////
    //Signature click event
    //////////////////////////////////////////////////
	$('#gd-panzoom').on(userMouseClick, '.gd-draw-text', function(e){
	    if ($(this.parentElement).find(".gd-context-menu")[0].className.indexOf('hidden') > 0) {
            hideAllContextMenu();
            var id = this.parentElement['id'];
            var text = $(this.childNodes)[0].value;
            var guid = $(this)[0].attributes['image-guid'].value;
            var elem = $(this.parentElement).find(".gd-context-menu");
            elem.removeClass("hidden");
            $.fn.textGenerator.init(id, null, text, guid);
        }
        $(this.childNodes)[0].focus();
	});

	//////////////////////////////////////////////////
    //Signature click event
    //////////////////////////////////////////////////
	$('#gd-panzoom').on(userMouseClick, '.gd-signature-image', function(e){
	    if ($(this.parentElement).find(".gd-context-menu")[0].className.indexOf('hidden') > 0) {
            hideAllContextMenu();
            var elem = $(this.parentElement).find(".gd-context-menu");
            elem.removeClass("hidden");
        }
	});

	//////////////////////////////////////////////////
    // Delete signature click event
    //////////////////////////////////////////////////
	$('#gd-panzoom').on(userMouseClick, '.gd-delete-signature', function(e){
		e.preventDefault();
		e.stopPropagation();
		if (!confirm("Do you want to delete?")){
			return false;
		}
		var signatureId = parseInt($(e.target).data("id").replace ( /[^\d.]/g, '' ));
		e.target.parentElement.parentElement.remove();
		// get signature data to delete
		var signatureToRemove = $.grep(signaturesList, function (obj) { return obj.id === signatureId; })[0];
		// delete signature from the signatures list
		signaturesList.splice($.inArray(signatureToRemove, signaturesList), 1);
	});

    //////////////////////////////////////////////////
    // Header menu for mobile events
    //////////////////////////////////////////////////
    $('#gd-mobile-menu-open').on(userMouseClick, function (e) {
        $('#gd-left-bar-wrapper').show();
        $('.gd-tool-tooltip-mobile').show();
        $('#gd-mobile-menu-close').show();
        $('#gd-mobile-menu-open').hide();
    });

    $('#gd-mobile-menu-close').on(userMouseClick, function (e) {
        hideMobileMenu();
    });

	//////////////////////////////////////////////////
    // Close lightbox dialog event
    //////////////////////////////////////////////////
    $('.gd-lightbox-close').on(userMouseClick, function(){
		toggleLightBox(false)
	});

    //////////////////////////////////////////////////
    // Choose signature event by click
    //////////////////////////////////////////////////
    $('#gd-signature-list').on(userMouseClick, '.gd-signature-clickable', function (e) {
        var sign = $(this);
        selectSignature(sign);
    });

    //////////////////////////////////////////////////
    // Create new signature
    //////////////////////////////////////////////////
    $('#gd-new-signature').on(userMouseClick, function (e) {
		switch (signature.signatureType){
			case "hand":
				toggleLightBox(true, "Draw signature", getDrawSignHeader(), getDrawSignContent());
				$("#gd-draw-image").bcPaint();
				break;
			case "stamp":
				var html = $.fn.stampGenerator.addInitialShape();
				toggleLightBox(true, "Draw stamp", html.header);
				$.fn.stampGenerator.drawShape(0);
				break;
			case "barCode":
			case "qrCode":
				$("#gd-signature-context-panel").opticalCodeGenerator();
                changeListClass("gd-signature-list-wrapper-add");
				break;
            case "text":
                if (isMobile()) {
                    hideMobileMenu();
                }
                initSignature(getCurrentPageNumber());
                insertText();
				break;
            case "image":
                openUploadSignatures();
                break;
		}
    });
});


/**
 * Close add code panel
 */
function closeAddCode() {
    $("#gd-add-optical-signature").remove();
    changeListClass();
}

/**
 * For correct scroll, while new code panel added/removed
 *
 * @param addClass
 */
function changeListClass(addClass) {
    if (addClass) {
        if (addClass == "gd-signature-list-wrapper-add-img") {
            $("#gd-signature-list-wrapper").removeClass("gd-signature-list-wrapper-add");
        }
        $("#gd-signature-list-wrapper").addClass(addClass);
    } else {
        $("#gd-signature-list-wrapper").removeClass("gd-signature-list-wrapper-add-img");
        $("#gd-signature-list-wrapper").removeClass("gd-signature-list-wrapper-add");
    }
}

/**
 * Hide all menu. For mobile only.
 */
function hideMobileMenu() {
    $('#gd-left-bar-wrapper').hide();
    $('#gd-mobile-menu-open').show();
    $('#gd-mobile-menu-close').hide();
    $('#gd-signature-context-panel').hide();
    inactiveAll();
}

/*
******************************************************************
FUNCTIONS
******************************************************************
*/

/**
* Open window for upload signatures
*/
function openUploadSignatures() {
    $('#gd-signature-upload-input').show();
    $('#gd-signature-upload-input').focus();
    $('#gd-signature-upload-input').click();
    $('#gd-signature-upload-input').hide();
}

/**
 * Get html for lightbox header to create new image
 * @returns {string}
 */
function getDrawSignHeader() {
    return "";
}

/**
 * Get html for lightbox content to create new image
 * @returns {string}
 */
function getDrawSignContent() {
    return '<div id="gd-draw-image">' +
        // draw area will be here
        '</div>';
}

/**
 * Fade left bar menu
 * @param on
 */
function fadeLeftBar(on) {
    if (on) {
        $('#gd-left-bar-fade').show();
        $('#gd-left-bar-spinner').show();
    } else {
        $('#gd-left-bar-fade').hide();
        $('#gd-left-bar-spinner').hide();
    }
}

/**
 * Select signature from list
 * @param sign
 */
function selectSignature(sign) {
    signature.signatureGuid = sign.attr("data-guid");
    loadSignatureImage();
    $('#gd-signature-context-panel').hide();
    if (isMobile()) {
        $('#gd-left-bar-wrapper').hide();
        $('#gd-mobile-menu-open').show();
        $('#gd-mobile-menu-close').hide();
    }
    inactiveAll();
}

/**
 * Inactive all menu items in left bar
 */
function inactiveAll() {
    $.each($('.gd-tool'), function (index, elem) {
        var attribute = elem.attributes['signature-type'];
        $('#gd-signature-context-panel').removeClass(attribute.value);
    });
    $('.gd-tool-active').addClass("gd-tool-inactive");
    $('.gd-tool-active').removeClass("gd-tool-active");
}

/**
 * Delete saved signature
 * @param guid
 */
function deleteSignatureFile(guid) {
    var data = {guid: guid, signatureType: signature.signatureType};
    // show loading spinner
    fadeLeftBar(true);
    $.ajax({
        type: 'POST',
        url: getApplicationPath('deleteSignatureFile'),
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(returnedData) {
            if(returnedData.message != undefined){
                // open error popup
                toggleModalDialog(false, "");
                printMessage(returnedData.message);
                return;
            }
            // hide loading spinner
            fadeLeftBar(false);
            loadSignaturesTree('');
        },
        error: function(xhr, status, error) {
            // hide loading spinner
            fadeLeftBar(false);
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.message);
            // open error popup
            toggleModalDialog(false, "");
            printMessage(err.message);
        }
    });
}

/**
 * Load file tree
 * @param {string} dir - files location directory
 * @param {object} callback - function that will be executed after ajax call
 */
function loadSignaturesTree(dir, callback) {
    $('#gd-signature-list').html("");
    var data = {path: dir, signatureType: signature.signatureType};
    currentDirectory = dir;
    // show loading spinner
    fadeLeftBar(true);
    // get data
    $.ajax({
        type: 'POST',
        url: getApplicationPath('loadFileTree'),
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(returnedData) {
            // hide loading spinner
            fadeLeftBar(false);
            // open error popup
            if(returnedData.message != undefined){
                toggleModalDialog(false, "");
                printMessage(returnedData.message);
                return;
            }
            // append files to tree list
            $.each(returnedData, function(index, elem){
                // document name
                var name = elem.name;
                if (signature.signatureType == 'qrCode' || signature.signatureType == 'barCode') {
                    name = elem.text;
                }
                // document guid
                var guid = elem.guid;
                // append signature
                if(elem.isDirectory){
                    $('#gd-signature-list').append('<div class="gd-signature">'+
                        '<i class="fa fa-folder"></i>'+
                        '<div class="gd-signature-name" data-guid="' + guid + '">' + name + '</div>'+
                        '</div>');
                } else {
                    var imageBlock = name;
                    if (signature.signatureType != "digital") {
                        imageBlock = '<image class="gd-signature-thumbnail-image" src="data:image/png;base64,' + elem.image + '" alt></image>';
                    }

                    $('#gd-signature-list').append(
                        '<div data-guid="' + guid + '" id="gd-signature-item-' + index + '" class="gd-signature-item gd-signature-thumbnail ui-draggable ui-draggable-handle">' +
                        '<div data-guid="' + guid + '" class="gd-signature-clickable">' +
                        imageBlock +
                        '<label for="gd-signature-' + index + '" class="gd-signature-name">' + name + '</label>' +
                        '</div>' +
                        '<i class="fa fa-trash-o"></i>' +
                        '</div>');

                    if (!isMobile()) {
                        $('#gd-signature-item-' + index).draggable({
                            start: function() {
                                $('#gd-signature-list').removeClass("gd-signature-list-scroll");
                            },
                            stop: function () {
                                var sign = $(this);
                                draggableSignaturePosition.left = sign.position().left - sign[0].offsetWidth;
                                draggableSignaturePosition.top = sign.position().top - sign[0].offsetHeight;
                                selectSignature(sign);
                                $('#gd-signature-list').addClass("gd-signature-list-scroll");
                            }
                        });
                    }
                    $('#gd-signature-item-' + index).on(userMouseClick, '.fa-trash-o', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var signatureGuid = $(this).parent().attr("data-guid");
                        var signatureToRemove = $.grep(signaturesList, function (obj) { return obj.signatureGuid == signatureGuid; })[0];
                        if (signatureToRemove) {
                            printMessage("This signature has already been added to the document page(s). Please remove it from the page(s) first.");
                            return;
                        }
                        if (!confirm("Do you want to delete?")){
                            return false;
                        }
                        deleteSignatureFile(signatureGuid);
                    });
                }

            });

            // check if document was changed
            if(currentDocumentGuid != documentGuid){
                // if changed - drop signatures from previous signing
                signaturesList = [];
                signatureImageIndex = 0;
                currentDocumentGuid = documentGuid;
            }
        },
        error: function(xhr, status, error) {
            // hide loading spinner
            fadeLeftBar(false);
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.message);
            // open error popup
            toggleModalDialog(false, "");
            printMessage(err.message);
        }
    }).done(function(data){
        if(typeof callback == "function") {
            callback(data);
        }
    });
}

/**
 * Upload signature
 * @param {file} file - File for uploading
 * @param {int} index - Number of the file to upload
 * @param {string} url - URL of the file, set it if URL used instead of file
 */
function uploadSignature(file, index, url) {
    // prepare form data for uploading
    var formData = new FormData();
    // add local file for uploading
    formData.append("file", file);
    if (typeof url == "undefined") {
        url = "";
    }
    // add URL if set
    formData.append("url", url);
    formData.append("signatureType", signature.signatureType)
    formData.append("rewrite", rewrite);
    $.ajax({
        // callback function which updates upload progress bar
        xhr: function()
        {
            var xhr = new window.XMLHttpRequest();
            // upload progress
            xhr.upload.addEventListener("progress", function(event){
                if (event.lengthComputable) {
                    $(".gd-modal-close-action").off(userMouseClick);
                    $("#gd-open-document").prop("disabled", true);
                    // increase progress
                    $("#gd-pregress-bar-" + index).addClass("p"+ Math.round(event.loaded / event.total * 100));
                    if(event.loaded == event.total){
                        $("#gd-pregress-bar-" + index).fadeOut();
                        $("#gd-upload-complete-" + index).fadeIn();
                        $('.gd-modal-close-action').on(userMouseClick, closeModal);
                        $("#gd-open-document").prop("disabled", false);
                    }
                }
            }, false);
            return xhr;
        },
        type: 'POST',
        url: getApplicationPath('uploadDocument'),
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function(returnedData) {
            if(returnedData.message != undefined){
                toggleModalDialog(false, "");
                // open error popup
                printMessage(returnedData.message);
                return;
            }
            loadSignaturesTree('');
        },
        error: function(xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.Message);
            toggleModalDialog(false, "");
            // open error popup
            printMessage(err.message);
        }
    });
}

/**
 * Sign current document
 */
function sign() {
    if($(".gd-modal-body").children().length == 0){
        var spinner = '<div id="gd-modal-spinner"><i class="fa fa-circle-o-notch fa-spin"></i> &nbsp;Loading... Please wait.</div>';
        toggleModalDialog(true, "Signing document", spinner);
    }
    $('#gd-modal-spinner').show();
    currentDocumentGuid = documentGuid;
	var documentType = getDocumentFormat(documentGuid).format;
    // get signing action URL, depends from signature type
	var url = getApplicationPath('sign')
    // current document guid is taken from the viewer.js globals
    var data = {
        guid: documentGuid,
        password: password,
        signaturesData: signaturesList,
		documentType: documentType
    };
    // sign the document
    $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(returnedData) {
            $('#gd-modal-spinner').hide();
            var result = "";
            if(returnedData.message != undefined){
                // if password for signature certificate is incorrect return to previouse step and show error
                if(returnedData.message.toLowerCase().indexOf("password") != -1){
                    switchSlide(2, 3, "left");
                    $("#gd-next").html("NEXT");
                    $("#gd-password-required").html(returnedData.message);
                    $("#gd-password-required").show();
                } else {
                    // open error popup
                    printMessage(returnedData.message);
                }
                return;
            }
            signedDocumentGuid = returnedData.guid;
            // prepare signing results HTML
            result = '<div id="gd-modal-signed">Document signed successfully</div>';
            // show signing results
            switch(signaturesList[0].signatureType) {
                case "digital":
                    $("#gd-finish-step").html(result);
                    $("#gd-signing-footer").hide();
                    break;
                default:
                    $(".gd-modal-body").append(result);
                    $("#gd-modal-signed").toggleClass("gd-image-signed");
                    break;
            }
        },
        error: function(xhr, status, error) {
            $('#gd-modal-spinner').hide();
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.Message);
            // open error popup
            printMessage(err.message);
        }
    });
}

/**
 * Save drawn image signature
 * @param {string} image - Base64 encoded image
 */
function saveDrawnImage(image) {
    fadeAll(true);
    // current document guid is taken from the viewer.js globals
    var data = {image: image};
    // sign the document
    $.ajax({
        type: 'POST',
        url: getApplicationPath("saveImage"),
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(returnedData) {
            fadeAll(false);
            if(returnedData.message != undefined){
                // open error popup
                printMessage(returnedData.message);
                return;
            }
            // load signatures from storage
            loadSignaturesTree('');
        },
        error: function(xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.Message);
            fadeAll(false);
            // open error popup
            printMessage(err.message);
        }
    });
}

/**
 * Save drawn stamp signature
 */
function saveDrawnStamp(callback) {
    fadeAll(true);
    //get drawn stamp data
    stampData = $.fn.stampGenerator.getStampData();
    // initiate image
    var image = "";
    // draw empty canvas - required to resize and crop stamp for its real size
    var cropedCanvas = "<canvas id='gd-croped-stamp' width='" + stampData[stampData.length - 1].width + "' height='" + stampData[stampData.length - 1].height + "'></canvas>";
    // combine all stamp lines to one image
    $("#gd-lightbox-body").append(cropedCanvas);
    var ctxCroped = $("#gd-croped-stamp")[0].getContext("2d");
    // get drawn stamp padding from canvas border
    var biggestWidth = stampData[stampData.length - 1].width;
    // combine stamp lines
    $(".csg-preview").each(function(index, shape){
        // calculate stamp real size and paddings
        var offset = 0;
        if(index != 0){
            offset = biggestWidth - stampData[index - 1].width;
        }
        // crop canvas empty pixels
		if(offset != 0){
			offset = offset / 2;
		}
        ctxCroped.drawImage(shape, offset, offset);
        // remove old canvases
        $(shape).remove();
    });
    // get image from canvas
    image = $("#gd-croped-stamp")[0].toDataURL("image/png");
    // prepare data for ajax
    var data = {image: image, stampData: stampData};
    // save the stamp image and xml description in the storage
    $.ajax({
        type: 'POST',
        url: getApplicationPath("saveStamp"),
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(returnedData) {
            fadeAll(false);
            if(returnedData.message != undefined){
                // open error popup
                printMessage(returnedData.message);
                return;
            }
            // set signature data
            signature.signatureGuid = returnedData.guid;
            signature.imageHeight = stampData[0].height;
            signature.imageWidth = stampData[0].width;
            loadSignaturesTree('');
            $(".gd-signature-select").removeClass("gd-signing-disabled");
        },
        error: function(xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.Message);
            fadeAll(false);
            // open error popup
            printMessage(err.message);
        }
    }).done(function(data){
        if(typeof callback == "function") {
            callback(data);
        }
    });
}

/**
 * Save drawn Text signature
 * @param {Object} properties - Text properties
 */
function saveDrawnText(properties, callback) {
    if (!properties.text) {
        return;
    }
    var newId = null;
    if (properties && !properties.imageGuid) {
        newId = properties.id;
    }
    var data = {properties: properties};
    // sign the document
    $.ajax({
        type: 'POST',
        url: getApplicationPath("saveText"),
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(returnedData) {
            if(returnedData.message != undefined){
                // open error popup
                printMessage(returnedData.message);
                return;
            }

            if (newId) {
                var newSignature = $.grep(signaturesList, function (obj) { return newId == obj.id; })[0];
                if (newSignature) {
                    // set current signature data
                    newSignature.signatureGuid = returnedData.imageGuid;
                    newSignature.imageHeight = returnedData.height;
                    newSignature.imageWidth = returnedData.width;
                }
            }

            if ($('#gd-signature-context-panel')[0].style.display != 'none' &&
                $('#gd-text-sign')[0].className.indexOf('gd-tool-active') > 0) {
                signature.signatureType = 'text';
                loadSignaturesTree('');
            }
        },
        error: function(xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err ? err.message : error);
            // open error popup
            printMessage(err ? err.message : error);
        }
     }).done(function(data){
        if (typeof callback == "function" && data) {
            callback(data);
        }
    });
}

/**
 * Generate HTML content of the Digital sign modal
 */
function getHtmlDigitalSign() {
    // prepare signing steps HTML
    var uploadStep = getHtmlSignatureUploadModal();
    var signaturesSelectStep = getHtmlSignaturesSelectModal();
    var signatureInformationStep = getHtmlSignatureInformationModal();
    var footer = getHtmlSigningModalFooter(3);
    // generate signing modal HTML
    return '<section id="gd-sign-section" data-type="digital">' +
                '<div id="gd-modal-spinner"><i class="fa fa-circle-o-notch fa-spin"></i> &nbsp;Loading... Please wait.</div>'+
				'<div id="gd-upload-step" class="gd-slide" data-index="0">'+
					uploadStep+
				'</div>'+
                signaturesSelectStep+
                '<div id="gd-additional-info-step" class="gd-slide" data-index="2">'+
                    signatureInformationStep+
                '</div>'+
                '<div id="gd-review-step" class="gd-slide" data-index="3" data-last="true">'+
                    // entered date review will be here
                '</div>'+
                '<div id="gd-finish-step" class="gd-slide" data-index="4">'+
                    // Signing results will be here
                '</div>'+
                footer+
            '</section>';
}

/**
 * Get HTML content for signature information modal
 **/
function getHtmlSignatureInformationModal(){
    var documentFormat = getDocumentFormat(documentGuid, false);
    var inputs = "";
    // generate signature information imputs for depending from current document type
    if(documentFormat.format.indexOf("Portable Document") >= 0) {
        inputs = '<input id="gd-reason" type="text" placeholder="Reason">'+
            '<input id="gd-contact" type="text" placeholder="Contact">'+
            '<input id="gd-location" type="text" placeholder="Location">'+
            '<input id="gd-signature-password" type="password" placeholder="Password">'+
            '<i class="fa fa-calendar" aria-hidden="true"></i>'+
            '<input type="text" id="gd-datepicker" placeholder="Date">';
    } else if(documentFormat.format.indexOf("Word") >= 0 || documentFormat.format.indexOf("Excel")) {
        inputs = '<input id="gd-signature-comment" type="text" placeholder="Comment">'+
            '<input id="gd-signature-password" type="password" placeholder="Password">'+
            '<i class="fa fa-calendar" aria-hidden="true"></i>'+
            '<input type="text" id="gd-datepicker" placeholder="Date">';
    }
    return '<div class="gd-signing-label">'+
        '<div>2. Signature Information <i>Add additional information to sign your document</i></div>'+
        '</div>'+
        '<div class="gd-signature-information">'+
        '<div id="gd-password-required"></div>'+
        inputs+
        '</div>';
}

/**
 * Get HTML content for signature information review modal
 **/
function getHtmlReviewModal(){
    var documentFormat = getDocumentFormat(documentGuid, false);
    var info = "";
    var signatureName = signature.signatureGuid.split(/[\\\/]/).pop();
    if(documentFormat.format.indexOf("Portable Document") >= 0) {
        info = '<div>Signature: <i>' + signatureName + '</i></div>'+
            '<div>Reason: <i>' + signature.reason + '</i></div>'+
            '<div>Contact: <i>' + signature.contact + '</i></div>'+
            '<div>Location: <i>' + signature.address + '</i></div>'+
            '<div>Password: <i>' + signature.signaturePassword + '</i></div>'+
            '<div>Date: <i>' + signature.date + '</i></div>';
    } else if(documentFormat.format.indexOf("Word") >= 0 || documentFormat.format.indexOf("Excel")) {
        info = '<div>Signature: <i>' + signatureName + '</i></div>'+
            '<div>Comment: <i>' + signature.signatureComment + '</i></div>'+
            '<div>Password: <i>' + signature.signaturePassword + '</i></div>'+
            '<div>Date: <i>' + signature.date + '</i></div>';
    }
    return '<div class="gd-signing-label">'+
				'<div>3. Finish <i>Review signature info and confirm</i></div>'+
			'</div>'+
			'<div class="gd-signature-information-review">'+
				info+
			'</div>';
}

/**
 * Get HTML content for digital signing modal footer (signing steps navigation elements)
 **/
function getHtmlSigningModalFooter(numberOfSteps){
    var steps = "";
    for(var i = 2; i <= numberOfSteps; i++){
        steps = steps + '<li>'+
            '<a href="#" class="gd-pagination">' + i + '</a>'+
            '</li>';
    }
    return  '<div id="gd-signing-footer">'+
        '<div id="gd-back">BACK</div>'+
        '<ol class="gd-modal-pagination">' +
        '<li>'+
        '<a href="#" class="gd-pagination gd-pagination-active">1</a>'+
        '</li>'+
        steps+
        '</ol>'+
        '<div id="gd-next" class="gd-signature-select gd-signing-disabled">NEXT</div>'+
        '</div>';
}

/**
 * Set signature additional information data
 */
function setAdditionalInformation(){
    // save entered signature data on add additional information step
    signature.reason = $("#gd-reason").val();
    signature.contact = $("#gd-contact").val();
    signature.address = $("#gd-location").val();
    signature.date = $("#gd-datepicker").val();
    signature.signaturePassword = $("#gd-signature-password").val();
    signature.signatureComment = $("#gd-signature-comment").val();
    $("#gd-review-step").html(getHtmlReviewModal);
}

/**
 * Get current page number
 * @returns {number}
 */
function getCurrentPageNumber() {
    var pagesAttr = $('#gd-page-num').text().split('/');
    var currentPageNumber = parseInt(pagesAttr[0]);
    return currentPageNumber;
}

/**
 * Init signature properties
 *
 * @param currentPageNumber
 */
function initSignature(currentPageNumber) {
    signature.pageNumber = currentPageNumber;
    signature.deleted = false;
}

/**
 * Get selected signature image stream
 */
function loadSignatureImage() {
    var currentPageNumber = getCurrentPageNumber();
    // current document guid is taken from the viewer.js globals
	var data = { signatureType: signature.signatureType, guid: signature.signatureGuid, page: currentPageNumber, password: "" };
	fadeAll(true);
	// load signature image from the storage
	$.ajax({
		type: 'POST',
		url: getApplicationPath('loadSignatureImage'),
		data: JSON.stringify(data),
		contentType: 'application/json',
		success: function(returnedData) {
		    fadeAll(false);
			if(returnedData.message != undefined){
			    toggleModalDialog(false, "");
				// open error popup
				printMessage(returnedData.message);
				return;
			}
			// when ajax is done insert loaded image into the document page
			toggleModalDialog(false, "");
			// insert image over the selected document page
            initSignature(currentPageNumber);
            if ("text" == signature.signatureType) {
                insertText(returnedData.props);
            } else {
                insertImage(returnedData.data);
            }
		},
		error: function(xhr, status, error) {
		    fadeAll(false);
			var err = eval("(" + xhr.responseText + ")");
			console.log(err.Message);
			toggleModalDialog(false, "");
            // open error popup
			printMessage(err.message);
		}
	});
}

function insertText(properties) {
    hideAllContextMenu();
    var currentPageNumber = getCurrentPageNumber();
    // get HTML markup of the resize handles
    var resizeHandles = getHtmlResizeHandles();
    signature.id = signatureImageIndex;
    signaturesList.push(signature);
    // set document format
    var style = "";
    var addPositionClass;
    if (draggableSignaturePosition && draggableSignaturePosition.left && draggableSignaturePosition.top) {
        style += 'left: ' + draggableSignaturePosition.left + 'px; top: ' + draggableSignaturePosition.top + 'px;';
        if (draggableSignaturePosition.top < 10) {
            addPositionClass= "gd-context-menu-bottom";
        } else {
            addPositionClass = "gd-context-menu-top";
        }
        draggableSignaturePosition = {};
    } else {
        addPositionClass = "gd-context-menu-bottom";
    }
    var contextMenu = getContextMenu("gd-text-signature-" + signatureImageIndex, addPositionClass);
    if (signature.imageWidth) {
        style += "width: " + signature.imageWidth + "px;";
    } else if (properties && properties.width) {
        style += "width: " + properties.width + "px;";
    } else {
        style += isMobile() ? "width: 200px;" : "width: 100px;";
    }
    if (signature.imageHeight) {
        style += "height: " + signature.imageHeight + "px";
    } else if (properties && properties.height) {
        style += "height: " + properties.height + "px";
    } else {
        style += isMobile() ? "height: 100px;" : "height: 50px;";
    }
    var imageGuid = properties ? properties.imageGuid : "";
    // prepare signature image HTML
    var signatureHtml = '<div id="gd-draggable-helper-' + signatureImageIndex + '"  class="gd-draggable-helper gd-signature" style="'+ style+'">' +
        contextMenu +
            '<div id="gd-draw-text-' + signatureImageIndex + '" image-guid="' + imageGuid + '" class="gd-draw-text"/>' +
        resizeHandles +
        '';
    $("#gd-image-signature-" + signatureImageIndex).css('background-color','transparent');
    // add signature to the selected page
    $(signatureHtml).insertBefore($("#gd-page-" + currentPageNumber).find(".gd-wrapper")).delay(1000);

    setDraggableAndResizable(currentPageNumber);

    signature = {};

    $.fn.textGenerator.create("gd-draggable-helper-" + signatureImageIndex);

    if (properties) {
        $.fn.textGenerator.init("gd-draggable-helper-" + signatureImageIndex, properties);
        // add new signature object into the list of signatures
    } else {
        signature.signatureType = 'text';
    }
    // increase signature index
    signatureImageIndex = signatureImageIndex + 1;
}

function fixContextMenuTop(elem, top) {
    if (top < 10) {
        elem.addClass("gd-context-menu-bottom");
        elem.removeClass("gd-context-menu-top");
    } else {
        elem.addClass("gd-context-menu-top");
        elem.removeClass("gd-context-menu-bottom");
    }
}

function setDraggableAndResizable(pageNumber) {
    var currentImage = signature.id;
    var signatureToEdit = $.grep(signaturesList, function (obj) {
        return obj.id === currentImage;
    })[0];
    // enable rotation, dragging and resizing features for current image
    $("#gd-draggable-helper-" + currentImage).draggable({
        // set restriction for image dragging area to current document page
        containment: "#gd-page-" + pageNumber,
        cancel: '',
        create: function () {
            // initiate image positioning coordinates
            var signaturePos = $(this).position();
            updateSignatureProperties(signatureToEdit, null, null, Math.round(signaturePos.left), Math.round(signaturePos.top));
        },
        // action fired when dragging stopped
        stop: function () {
            var signaturePos = $(this).position();
            fixContextMenuTop($(this).find('.gd-context-menu'), signaturePos.top);
            // get image positioning coordinates after dragging
            updateSignatureProperties(signatureToEdit, null, null, Math.round(signaturePos.left), Math.round(signaturePos.top));
        }
    }).resizable({
        // set restriction for image resizing to current document page
        containment: "#gd-page-" + pageNumber,
        // set image resize handles
        handles: {
            'ne': '.ui-resizable-ne',
            'se': '.ui-resizable-se',
            'sw': '.ui-resizable-sw',
            'nw': '.ui-resizable-nw'
        },
        grid: [10, 10],
        create: function (event, ui) {
            // set signature initial size
            var width = $(event.target).width();
            var height = $(event.target).height();
            // fix signature size if the signature image was not fully loaded at this moment
            if (width == 0) {
                // use image width which was set at the saving step
                width = signatureToEdit.imageWidth;
            }
            if (height == 0 || height < 19) {
                // use image height which was set at the saving step
                height = signatureToEdit.imageHeight;
            }
            $(event.target).css('width', width);
            $(event.target).css('height', height);
            updateSignatureProperties(signatureToEdit, Math.round(width), Math.round(height));
            setGridPosition(width, height);
        },
        stop: function (event, image) {
            // set signature updated size and position
            updateSignatureProperties(signatureToEdit, Math.round(image.size.width), Math.round(image.size.height), Math.round(image.position.left), Math.round(image.position.top));
            setGridPosition(signatureToEdit.imageWidth, signatureToEdit.imageHeight);
        }
    });
}

/**
 * Get selected signature image stream
 * @param {string} image - Base64 encoded image
 */
function insertImage(image) {
    var pageNumber = getCurrentPageNumber();
	hideAllContextMenu();
    // add current signature object into the list of signatures
    signaturesList.push(signature);
    // prepare index which will be used for specific image HTMl elements naming
    var currentImage = signatureImageIndex;
    // get HTML markup of the resize handles
    var resizeHandles = getHtmlResizeHandles();
	signature.id = currentImage;
    var style = "";
    var addPositionClass;
    if (draggableSignaturePosition && draggableSignaturePosition.left && draggableSignaturePosition.top) {
        style = 'left: ' + draggableSignaturePosition.left + 'px; top: ' + draggableSignaturePosition.top + 'px;';
        if (draggableSignaturePosition.top < 10) {
            addPositionClass= "gd-context-menu-bottom";
        } else {
            addPositionClass = "gd-context-menu-top";
        }
        draggableSignaturePosition = {};
    } else {
        addPositionClass = "gd-context-menu-bottom";
    }
    var contextMenu = getContextMenu("gd-image-signature-" + currentImage, addPositionClass);
    // prepare signature image HTML
    var signatureHtml = '<div id="gd-draggable-helper-' + currentImage + '"  class="gd-draggable-helper gd-signature" style="'+ style+'">' +
							contextMenu +
							'<image id="gd-image-signature-' + currentImage + '" class="gd-signature-image" src="data:image/png;base64,' + image + '" alt></image>' +
							resizeHandles +
						'</div>';
    $("#gd-image-signature-" + currentImage).css('background-color','transparent');
    // add signature to the selected page
    $(signatureHtml).insertBefore($("#gd-page-" + pageNumber).find(".gd-wrapper")).delay(1000);

    if(signature.signatureType == "image" && /Mobi/.test(navigator.userAgent)){
        $(".gd-draggable-helper").css("width", "100%", "!important");
    }
    setDraggableAndResizable(pageNumber);
    // increase signature index
    signatureImageIndex = signatureImageIndex + 1;
    // drop the signature object
    signature = {};
}

function updateSignatureProperties(signatureToEdit, width, height, left, top){
	if(typeof width != "undefined" & width != null){
		signatureToEdit.imageWidth = width;
	}
	if(typeof height != "undefined" & height != null){
		signatureToEdit.imageHeight = height;
	}
	if(typeof left != "undefined"){
		signatureToEdit.left = left;
	}
	if(typeof top != "undefined"){
		signatureToEdit.top = top;
	}
}

/**
 * Append context menu for signature
 * @param {int} signatureId - id number of the signature
 */
function getContextMenu(signatureId, addClass){
	var contextMenuClass = "gd-context-menu" + (addClass ? " " + addClass : "");
	if(signature.signatureType == "text"){
		contextMenuClass = contextMenuClass + " gd-text-context-menu";
	}
	var menuHtml = '<div id="gd-context-menu" class="' + contextMenuClass + '">';
	$.each(contextMenuButtons, function(index, button){
		if (signature.signatureType == "text" && index == 1){
            menuHtml = menuHtml + $.fn.textGenerator.getMenu();
		}
		menuHtml = menuHtml + '<i class="' + button + '" data-id="' + signatureId + '"></i>'
	});
	menuHtml = menuHtml + '</div>';
	return menuHtml;
}

/**
 * Hide all context menu
 */
function hideAllContextMenu(){
	$(".gd-context-menu").each(function(index, element){
		if(!$(element).hasClass("hidden")){
			$(element).addClass("hidden");
		}
	});
}

/**
 * Prepare fonts select HTML
 * @param {array} fonts - array of available fonts
 */
function getHtmlFontsSelect(fonts, id){
    if (!fonts || fonts.length == 0) {
        fonts = $.fn.cssFonts();
    }
    var fontsSelect = id ? '<select id="' + id + '" class="gd-fonts-select">' : '<select class="gd-fonts-select font">';
    $.each(fonts, function(index, font){
        fontsSelect = fontsSelect + '<option value="' + font + '">' + font + '</option>';
    });
    fontsSelect = fontsSelect + '</select>';
    return fontsSelect;
}


/**
 * Prepare font sizes select HTML
 */
function getHtmlFontSizeSelect(id){
    var fontSizes = id ? '<select id="' + id + '" class="gd-fonts-select gd-font-size-select">' : '<select class="gd-fonts-select gd-font-size-select">';
    for(var i = 8; i <= 20; i++){
        if(i == 10){
            fontSizes = fontSizes + '<option value="' + i + '" selected="selected">' + i + 'px</option>';
        } else {
            fontSizes = fontSizes + '<option value="' + i + '">' + i + 'px</option>';
        }
    }
    fontSizes = fontSizes + '</select>';
    return fontSizes;
}

function getFonts() {
    $.ajax({
        type: 'GET',
        url: getApplicationPath("getFonts"),
        contentType: 'application/json',
        success: function(returnedData) {
            mergedFonts = [];
            var fonts = $.fn.cssFonts();
            $.each(fonts, function(index, font){
                var existedFont = $.inArray(font, returnedData);
                if (existedFont != -1) {
                    mergedFonts.push(font);
                }
            });
            $.fn.stampGenerator.refreshFonts();
            $.fn.textGenerator.refreshFonts();
        },
        error: function(xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.Message);
        }
    });
}

/**
 * Get HTML of the resize handles - used to add resize handles to the added signature image
 */
function getHtmlResizeHandles(){
    return '<div class="ui-resizable-handle ui-resizable-ne"></div>'+
        '<div class="ui-resizable-handle ui-resizable-se"></div>'+
        '<div class="ui-resizable-handle ui-resizable-sw"></div>'+
        '<div class="ui-resizable-handle ui-resizable-nw"></div>';
}

/**
 * Set grid position
 * @param {int} width - Current signature image width
 * @param {int} height - Current signature image height
 */
function setGridPosition(width, height){
    $('.ui-resizable-n').css('left', (width/2-4)+'px');
    $('.ui-resizable-e').css('top', (height/2-4)+'px');
    $('.ui-resizable-s').css('left', (width/2-4)+'px');
    $('.ui-resizable-w').css('top', (height/2-4)+'px');
}

/**
 * Download document
 * @param {Object} button - Clicked download button
 */
function download (button){
    var signed = false;
    var documentName = "";
    if($(button).attr("id") == "gd-signed-download"){
        signed = true;
        documentName = signedDocumentGuid;
        signedDocumentGuid = "";
    } else {
        documentName = documentGuid;
    }
    if(typeof documentName != "undefined" && documentName != ""){
         // Open download dialog
         window.location.assign(getApplicationPath("downloadDocument/?path=") + documentName + "&signed=" + signed);
    } else {
         // open error popup
         printMessage("Please open or sign document first");
    }
}

/**
* Toggle modal dialog
* @param {boolean} open - open/close value
* @param {string} title - title to display in modal dialog (popup)
* @param {string} header - header HTML content
* @param {string} content - body HTML content
*/
function toggleLightBox(open, title, header, content) {
    if (open) {
        $('#gd-lightbox-title').text(title);
        $('#lightBoxDialog')
			.css('opacity', 0)
			.fadeIn('fast')
			.animate(
				{ opacity: 1 },
				{ queue: false, duration: 'fast' }
			);
        $('#lightBoxDialog').addClass('in');
        $(".gd-lightbox-header").append(header);
		$("#gd-lightbox-body").append(content);
		
    } else {
        $('#lightBoxDialog').removeClass('in');
        $('#lightBoxDialog')
			.css('opacity', 1)
			.fadeIn('fast')
			.animate(
				{ opacity: 0 },
				{ queue: false, duration: 'fast' }
			)
			.css('display', 'none');
        $(".gd-lightbox-header").html('');
		$("#gd-lightbox-body").html('');
    }
}

/*
******************************************************************
******************************************************************
GROUPDOCS.SIGNATURE PLUGIN
******************************************************************
******************************************************************
*/
(function( $ ) {
    /*
    ******************************************************************
    STATIC VALUES
    ******************************************************************
    */
    var gd_navbar = '#gd-navbar';

    /*
    ******************************************************************
    METHODS
    ******************************************************************
    */
    var methods = {
        init : function( options ) {
            // set defaults
            var defaults = {
                textSignature: true,
                imageSignature: true,
                digitalSignature: true,
                qrCodeSignature: true,
                barCodeSignature: true,
                stampSignature: true,
                handSignature: true,
                downloadOriginal: true,
                downloadSigned: true,
				defaultDocument: "",
				preloadPageCount: 0,
				pageSelector: true,
				download: true,
				upload: true,
				print: true,
				browse: true,
				rewrite: true,
				applicationPath: "http://localhost:8080/annotation"
            };
			$('#element').viewer({
					applicationPath: options.applicationPath,
                    defaultDocument: options.defaultDocument,
                    htmlMode: false,
                    preloadPageCount: options.preloadPageCount,
                    zoom : false,
                    pageSelector: options.pageSelector,
                    search: false,
                    thumbnails: false,
                    rotate: false,
                    download: options.download,
                    upload: options.upload,
                    print: options.print,
                    browse: options.browse,
                    rewrite: options.rewrite,
					saveRotateState: false
			});

            $('#gd-header-logo').append(getHtmlHeaderForMobile());

            options = $.extend(defaults, options);

            getHtmlDownloadPanel();
			this.append(getHtmlLightboxBox);
			
            $(gd_navbar).append(getHtmlSavePanel);

            $(".wrapper").append(getHtmlLeftBarBase);

            if(options.textSignature){
                $("#gd-signature-tools").append(getHtmlTextSignatureElement);
            }

            if(options.imageSignature){
                $("#gd-signature-tools").append(getHtmlImageSignatureElement);
            }

            if(options.digitalSignature){
                $("#gd-signature-tools").append(getHtmlDigitalSignatureElement);
            }

            if(options.qrCodeSignature){
                $("#gd-signature-tools").append(getHtmlQrcodeSignatureElement);
            }

            if(options.barCodeSignature){
                $("#gd-signature-tools").append(getHtmlBarcodeSignatureElement);
            }

            if(options.stampSignature){
                $("#gd-signature-tools").append(getHtmlStampSignatureElement);
            }

            if(options.handSignature){
                $("#gd-signature-tools").append(getHtmlHandSignatureElement);
            }

            if(options.downloadOriginal){
                $("#gd-btn-download-value").append(getHtmlDownloadOriginalElement());
            }

            if(options.downloadSigned){
                $("#gd-btn-download-value").append(getHtmlDownloadSignedElement());
            }
        }
    };


    /*
    ******************************************************************
    INIT PLUGIN
    ******************************************************************
    */
    $.fn.signature = function( method ) {
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method' +  method + ' does not exist on jQuery.signature' );
        }
    };


    /*
    ******************************************************************
    HTML MARKUP
    ******************************************************************
    */
    function getHtmlHeaderForMobile() {
        return '<div id="gd-mobile-menu" class="gd-mobile-menu">' +
                    '<span id="gd-mobile-menu-close" class="gd-mobile-menu-close">' +
                        '<i class="fas fa-times fa-lg fa-inverse"></i>' +
                    '</span>' +
                    '<span id="gd-mobile-menu-open" class="gd-mobile-menu-open">' +
                        '<i class="fas fa-bars fa-lg fa-inverse"></i>' +
                    '</span>' +
                '</div>';
    }

    function getHtmlLeftBarBase() {
        return '<div id="gd-left-bar-wrapper" class="gd-left-bar-wrapper">' +
                    // signature tools
                    '<div class="gd-left-bar-tools-container">' +
                        '<ul id="gd-signature-tools">' +
                        '</ul>' +
                    '</div>' +
                    '<div id="gd-signature-context-panel" class="gd-signature-context-panel">' +
                        '<div class="gd-signature-list-title">' +
							'<i class="fa fa-plus" id="gd-new-signature"></i>' +
                            '<input id="gd-signature-upload-input" type="file" multiple >' +
							'<div id="gd-signature-context-panel-title" class="gd-signature-context-panel-title">' +
							'</div>' +
                        '</div>' +

                        '<div id="gd-left-bar-fade" class="gd-left-bar-fade">' +
                        '<div id="gd-left-bar-spinner" class="gd-left-bar-spinner"><i class="fa fa-circle-o-notch fa-spin"></i> &nbsp;Loading...</div>' +
                        '</div>' +

                        '<div id="gd-signature-list-wrapper" class="gd-signature-list-wrapper">' +
                            '<div id="gd-signature-list" class="gd-signature-list gd-signature-list-scroll">' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
    }

    function getHtmlDownloadPanel() {
        var downloadBtn = $("#gd-btn-download");
        var downloadDropDown = '<li class="gd-nav-toggle" id="gd-download-val-container">'+
            '<span id="gd-download-value">' +
            '<i class="fa fa-download"></i>' +
            '<span class="gd-tooltip">Download</span>' +
            '</span>'+
            '<span class="gd-nav-caret"></span>'+
            '<ul class="gd-nav-dropdown-menu gd-nav-dropdown" id="gd-btn-download-value">'+
            // download types will be here
            '</ul>'+
            '</li>';
        downloadBtn.html(downloadDropDown);
    }

    function getHtmlDownloadOriginalElement() {
        return '<li id="gd-original-download">Download Original</li>';
    }

    function getHtmlDownloadSignedElement() {
        return '<li id="gd-signed-download">Download Signed</li>';
    }

    function getHtmlSavePanel() {
        return '<li id="gd-nav-save"><i class="fa fa-floppy-o"></i><span class="gd-tooltip">Save</span></li>';
    }

    function getHtmlTextSignatureElement() {
        return '<li>' +
                    '<button class="gd-tool gd-tool-inactive gd-text-sign" id="gd-text-sign" signature-type="text" signature-type-title="Texts">' +
                    '<i class="fas fa-font fa-lg fa-inverse"></i>' +
                    '<span class="gd-popupdiv-hover gd-tool-tooltip gd-tool-tooltip-mobile">Texts</span>' +
                    '</button>' +
                '</li>';
    }

    function getHtmlImageSignatureElement() {
        return '<li>' +
                    '<button class="gd-tool gd-tool-inactive gd-image-sign" id="gd-image-sign" signature-type="image" signature-type-title="Uploaded images">' +
                    '<i class="fas fa-image fa-lg fa-inverse"></i>' +
                    '<span class="gd-popupdiv-hover gd-tool-tooltip gd-tool-tooltip-mobile">Uploaded images</span>' +
                    '</button>' +
                '</li>';
    }

    function getHtmlDigitalSignatureElement() {
        return '<li>' +
                    '<button class="gd-tool gd-tool-inactive gd-digital-sign" id="gd-digital-sign" signature-type="digital" signature-type-title="Digital signatures">' +
                    '<i class="fas fa-fingerprint fa-lg fa-inverse"></i>' +
                    '<span class="gd-popupdiv-hover gd-tool-tooltip gd-tool-tooltip-mobile">Digital signatures</span>' +
                    '</button>' +
                '</li>';
    }

    function getHtmlQrcodeSignatureElement() {
        return '<li>' +
                    '<button class="gd-tool gd-tool-inactive gd-qrcode-sign" id="gd-qrcode-sign" signature-type="qrCode" signature-type-title="QR codes">' +
                    '<i class="fas fa-qrcode fa-lg fa-inverse"></i>' +
                    '<span class="gd-popupdiv-hover gd-tool-tooltip gd-tool-tooltip-mobile">QR codes</span>' +
                    '</button>' +
                '</li>';
    }

    function getHtmlBarcodeSignatureElement() {
        return '<li>' +
                    '<button class="gd-tool gd-tool-inactive gd-barcode-sign" id="gd-barcode-sign" signature-type="barCode" signature-type-title="Bar codes">' +
                    '<i class="fas fa-barcode fa-lg fa-inverse"></i>' +
                    '<span class="gd-popupdiv-hover gd-tool-tooltip gd-tool-tooltip-mobile">Bar codes</span>' +
                    '</button>' +
                '</li>';
    }

    function getHtmlStampSignatureElement() {
        return '<li>' +
                    '<button class="gd-tool gd-tool-inactive gd-stamp-sign" id="gd-stamp-sign" signature-type="stamp" signature-type-title="Stamps">' +
                    '<i class="fas fa-stamp fa-lg fa-inverse"></i>' +
                    '<span class="gd-popupdiv-hover gd-tool-tooltip gd-tool-tooltip-mobile">Stamps</span>' +
                    '</button>' +
                '</li>';
    }

    function getHtmlHandSignatureElement() {
        return '<li>' +
                    '<button class="gd-tool gd-tool-inactive gd-hand-sign" id="gd-hand-sign" signature-type="hand" signature-type-title="Signatures">' +
                    '<i class="fas fa-signature fa-lg fa-inverse"></i>' +
                    '<span class="gd-popupdiv-hover gd-tool-tooltip gd-tool-tooltip-mobile">Signatures</span>' +
                    '</button>' +
                '</li>';
    }

	function getHtmlLightboxBox() {
        return '<div class="gd-modal fade" id="lightBoxDialog">' +
			      '<div class="gd-modal-dialog gd-modal-dialog-lightbox">' +
			        '<div class="gd-modal-content" id="gd-lightbox-content">' +
			            // header
			            '<div class="gd-modal-header">' +
							'<div class="gd-modal-close gd-modal-close-action gd-lightbox-close"><span>&times;</span></div>' +
							'<h4 class="gd-modal-title" id="gd-lightbox-title"></h4>' +
							'<div class=gd-lightbox-header>' +
								// header custom HTMl will be here
							'</div>'+
			            '</div>' +
			            // body
			            '<div class="gd-modal-body gd-lightbox-body" id="gd-lightbox-body">' +
							// lightBox body content elements will be here
						'</div>' +
			            // footer
			            '<div class="gd-modal-footer">' +
			            // empty footer
			            '</div>' +
			        '</div><!-- /.modal-content -->' +
			      '</div><!-- /.modal-dialog -->' +
                    '<div class="gd-mobile-portrait">' +
                        '<div class="gd-mobile-turn-image"></div>' +
                    '</div>' +
			    '</div>';
    }

})(jQuery);