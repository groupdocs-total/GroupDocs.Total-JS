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
var pagesDiapason = [];
var signedDocumentGuid = "";
var imageSaved = false;
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
    documentType: "",
	deleted: false
}
var draggableSignaturePosition={};
var userMouseClick = ('ontouch' in document.documentElement)  ? 'touch click' : 'click';
// new UI feature both variables
var contextMenuButtons = ["fas fa-arrows-alt fa-sm", "fas fa-trash-alt fa-sm gd-delete-signature"];
var textContextMenuButtons = ['<i class="fas fa-bold"></i>', '<i class="fas fa-italic"></i>', '<i class="fas fa-underline"></i>', '<div class="gd-text-color-picker"></div>'];

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
			$("#gd-add-optical-signature").remove();
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

    /*//////////////////////////////////////////////////
    // Digital sign event
    //////////////////////////////////////////////////
    // TODO: deprecated
    $('#qd-digital-sign').on(userMouseClick, function(e){
        if(typeof documentGuid == "undefined" || documentGuid == ""){
            printMessage("Please open document first");
        } else {
            signature.signatureType = "digital";
            toggleModalDialog(true, 'Digital Signature', getHtmlDigitalSign());
            $(".gd-modal-dialog").addClass("gd-signature-modal-dialog");
            loadSignaturesTree('', openSigningFirstStepModal);
        }
    });

    //////////////////////////////////////////////////
    // Image sign event
    //////////////////////////////////////////////////
    // TODO: deprecated
    $('#qd-image-sign').on(userMouseClick, function(e){
        if(typeof documentGuid == "undefined" || documentGuid == ""){
            printMessage("Please open document first");
        } else {
            signature.signatureType = "image";
            toggleModalDialog(true, 'Image Signature', getHtmlImageSign());
            $(".gd-modal-dialog").addClass("gd-signature-modal-dialog");
            loadSignaturesTree('', openSigningFirstStepModal);
        }
    });

    //////////////////////////////////////////////////
    // Stamp sign event
    //////////////////////////////////////////////////
    // TODO: deprecated
    $('#gd-stamp-sign').on(userMouseClick, function(e){
        if(typeof documentGuid == "undefined" || documentGuid == ""){
            printMessage("Please open document first");
        } else {
            signature.signatureType = "stamp";
            toggleModalDialog(true, 'Stamp Signature', getHtmlImageSign());
            $(".gd-modal-dialog").addClass("gd-signature-modal-dialog");
            loadSignaturesTree('', openSigningFirstStepModal);
        }
    });
*/
    //////////////////////////////////////////////////
    // Optical sign event
    //////////////////////////////////////////////////
	$("#gd-new-signature").on(userMouseClick, function(e){
        if(typeof documentGuid == "undefined" || documentGuid == ""){
            printMessage("Please open document first");
        } else {
            signature.signatureGuid = "";
            if($(".fa-plus").parent().parent().prop('className').indexOf("qrCode") != -1){
                signature.signatureType = "qrCode";
            } else if ($(".fa-plus").parent().parent().prop('className').indexOf("barCode") != -1) {
                signature.signatureType = "barCode";
            } else {
				return;
			}
			$("#gd-signature-context-panel").opticalCodeGenerator();
        }
    });
/*
    //////////////////////////////////////////////////
    // Text sign event
    //////////////////////////////////////////////////
    // TODO: deprecated
    $('#qd-text-sign').on(userMouseClick, function(e){
        if(typeof documentGuid == "undefined" || documentGuid == ""){
            printMessage("Please open document first");
        } else {
            signature.signatureType = "text";
			// new UI feature
			getFonts();
            toggleModalDialog(true, 'Text Signature', getHtmlTextSign());
            $(".gd-modal-dialog").addClass("gd-signature-modal-dialog");
            loadSignaturesTree('', openSigningFirstStepModal);
        }
    });
*/
    //////////////////////////////////////////////////
    // Open signatures browse button click
    //////////////////////////////////////////////////
    $('.gd-modal-body').on(userMouseClick, '.gd-browse-signatures', function(e){
        $('#modalDialog .gd-modal-title').text("Signing Document");
        $( "#gd-signature-draw-step" ).remove();
        if( $("#gd-signature-select-step").length == 0){
            var browseStep = getHtmlSignaturesSelectModal();
            $(browseStep).insertBefore("#gd-signature-page-select-step");
            loadSignaturesTree('');
        }
        // open browse signatures step
        switchSlide(1, 0, "right");
        $(".gd-signature-select").addClass("gd-signing-disabled");
        // set currently active step pagination
        if(!$($(".gd-pagination")[0]).hasClass("gd-pagination-active")){
            $($(".gd-pagination")[0]).addClass("gd-pagination-active")
        }
        $("#gd-signing-footer").show();
    });

    //////////////////////////////////////////////////
    // Open signatures draw button click
    //////////////////////////////////////////////////
    $('.gd-modal-body').on(userMouseClick, '.gd-draw-signatures', function(e) {
        $('#modalDialog .gd-modal-title').text("Signing Document");
        $("#gd-signature-select-step").remove();
        if( $("#gd-signature-draw-step").length == 0){
            var drawStep = getHtmlDrawModal(signature.signatureType);
            $(drawStep).insertBefore("#gd-signature-page-select-step");
        }
        // open draw signatures step
        switchSlide(1, 0, "right");
        // set currently active step pagination
        if (!$($(".gd-pagination")[0]).hasClass("gd-pagination-active")) {
            $($(".gd-pagination")[0]).addClass("gd-pagination-active")
        }
        $("#gd-signing-footer").show();
        switch (signature.signatureType) {
            case "image":
                if ($("#bcPaint-container").length == 0) {
                    $("#gd-draw-image").bcPaint();
                }
                $(".gd-signature-select").removeClass("gd-signing-disabled");
                imageSaved = false;
                break;
            case "stamp":
                if( $("#csg-container").length == 0) {
                    $("#gd-draw-stamp").stampGenerator();
                }
                break;
            case "text":
                if( $("#gd-text-container").length == 0) {
                    $("#gd-draw-text").textGenerator();
                    $("#gd-text-background").find(".bcPicker-picker").css("background-color", "#ffffff");
                    var docType = getDocumentFormat(documentGuid).format;
                    if(docType == "Microsoft PowerPoint"){
                        $("#gd-text-border-style-line").hide();
                    }
                }
                break;
        }
    });

    //////////////////////////////////////////////////
    // signature or directory click event from signature tree
    //////////////////////////////////////////////////
    $('.gd-modal-body').on(userMouseClick, '.gd-signature-name', function(e){
        var isDir = $(this).parent().find('.fa-folder').hasClass('fa-folder');
        if(isDir){
            // if directory -> browse
            if(currentDirectory.length > 0) {
                currentDirectory = currentDirectory + '/' + $(this).text();
            } else {
                currentDirectory = $(this).text();
            }
            $('#gd-signatures').html(loadSignaturesTree(currentDirectory, ""));
        } else {
            $(".gd-signature-select").removeClass("gd-signing-disabled");
        }
    });

    //////////////////////////////////////////////////
    // Go to parent directory event from signature tree
    //////////////////////////////////////////////////
    $('.gd-modal-body').on(userMouseClick, '.gd-go-up-signature', function(e){
        if(currentDirectory.length > 0 && currentDirectory.indexOf('/') == -1){
            currentDirectory = "";
        }else{
            currentDirectory = currentDirectory.replace(/\/[^\/]+\/?$/, "");
        }
        $('#gd-signatures').html(loadSignaturesTree(currentDirectory, ""));
    });

    //////////////////////////////////////////////////
    // Upload signature event
    //////////////////////////////////////////////////
    $(".gd-modal-body").on('change', '#gd-signature-upload-input', function(e) {
        var uploadFiles = $(this).get(0).files;
        // upload file one by one
        for (var i = 0; i < uploadFiles.length; i++) {
            // upload local file
            uploadSignature(uploadFiles[i], i, "");
        }
        $(".gd-browse-signatures").show();
    });

    //////////////////////////////////////////////////
    // Signature select event
    //////////////////////////////////////////////////
    $('.gd-modal-body').on(userMouseClick, '.gd-signature', function(e){
        // get selected signature guid
        if (typeof $(this).find("label").data("guid") != "undefined") {
            signature.signatureGuid = $(this).find("label").data("guid");
        }
        if(signature.signatureType == "digital") {
            // set styles for selected signature
            $.each($(".gd-signature"), function (index, elem) {
                $(elem).css("background-color", "#e5e5e5");
            });
            $(this).css("background-color", "#3e4e5a");
        } else {
            $(".gd-signature-select").removeClass("gd-signing-disabled");
        }
    });

    //////////////////////////////////////////////////
    // Back button click event (digital signing modal)
    //////////////////////////////////////////////////
    $('.gd-modal-body').on(userMouseClick, '#gd-back', function(e){
        var currentSlide;
		if(!/Mobi/.test(navigator.userAgent)){
			$("#gd-next").css("left", "calc(100% - 90px)");
		} else {
			$("#gd-next").css("left", "calc(100% - 195px)");
		}
        $(".gd-slide").each(function(index, elem){
            if($(elem).css("display") == "block"){
                currentSlide = $(elem).data("index");
            }
        });
        if(currentSlide == 1){
            $("#gd-signing-footer").hide();
        }
        switchSlide(currentSlide - 1, currentSlide, "left");
        $("#gd-next").html("NEXT");
        $($(".gd-pagination")[currentSlide - 1]).toggleClass("gd-pagination-active");
        $($(".gd-pagination")[currentSlide - 2]).toggleClass("gd-pagination-active");
    });

    //////////////////////////////////////////////////
    // Next button click event (digital signing modal)
    //////////////////////////////////////////////////
    $('.gd-modal-body').on(userMouseClick, '#gd-next', switchToNextSlide);

    //////////////////////////////////////////////////
    // Select page number event (image signing modal)
    //////////////////////////////////////////////////
    $('.gd-modal-body').on(userMouseClick, '.gd-page-number', function(pageNumber){
        $(".gd-signature-information-review i").html($(pageNumber.target).html());
    });

    //////////////////////////////////////////////////
    // Apply image current state button click event
    //////////////////////////////////////////////////
    $("#gd-panzoom").on("click", "#gd-apply", function(){
        // lock feature for image signature modifications
        $(this).parent().draggable("disable").resizable("disable");
		$(this).hide();
		$(this).parent().find("#gd-cancel").hide();
        $(this).parent().find(".ui-rotatable-handle").hide();
		$(this).parent().find("#gd-edit").show();
        // enable save button on the dashboard
        if($("#gd-nav-save").hasClass("gd-save-disabled")) {
            $("#gd-nav-save").removeClass("gd-save-disabled");
            $("#gd-nav-save").on(userMouseClick, function(){
                sign();
            });
        }
    });

    //////////////////////////////////////////////////
    // Edit image current state button click event
    //////////////////////////////////////////////////
    $("#gd-panzoom").on("click", "#gd-edit", function(){
        // unlock feature for image signature modifications
        $(this).parent().draggable("enable").rotatable("enable").resizable("enable");
        // disable save button on the dashboard
        $("#gd-nav-save").addClass("gd-save-disabled");
        $("#gd-nav-save").off(userMouseClick);
		$(this).hide();
		$(this).parent().find("#gd-cancel").show();
		$(this).parent().find("#gd-apply").show();
        $(this).parent().find(".ui-rotatable-handle").show();
    });

	//////////////////////////////////////////////////
    // Cancel image current state button click event
    //////////////////////////////////////////////////
    $("#gd-panzoom").on("click", "#gd-cancel", function(){
		var signatureToDelete = parseInt($(this).parent().find("img").attr("id").replace ( /[^\d.]/g, '' ));
		signaturesList[signatureToDelete].deleted = true;
		$("#gd-draggable-helper-" + signatureToDelete).remove();
    });

    //////////////////////////////////////////////////
    // Export drawn image signature
    //////////////////////////////////////////////////
    $('.gd-modal-body').on(userMouseClick, '#bcPaint-export', function(){
        var drawnImage = $.fn.bcPaint.export();
        saveDrawnImage(drawnImage);
    });

    //////////////////////////////////////////////////
    // Reset drawn image signature
    //////////////////////////////////////////////////
    $('.gd-modal-body').on('click', '#bcPaint-reset', function(){
        imageSaved = false;
    });
    //////////////////////////////////////////////////
    // Enable NEXT button when at least one stamp shape is added
    //////////////////////////////////////////////////
    $('.gd-modal-body').on(userMouseClick, 'button#csg-shape-add', function(){
        $(".gd-signature-select").removeClass("gd-signing-disabled");
    });

    //////////////////////////////////////////////////
    // Export drawn Text signature
    //////////////////////////////////////////////////
    $('.gd-modal-body').on('keyup', '.gd-text-property', function(){
        var textProperties = $.fn.textGenerator.getProperties();
		$.fn.textGenerator.draw(textProperties);
        $(".gd-signature-select").removeClass("gd-signing-disabled");
    });

    //////////////////////////////////////////////////
    // Export drawn Text signature - detect color change event
    //////////////////////////////////////////////////
    $('.gd-modal-body').on(userMouseClick, '#gd-text-border-color .bcPicker-color, #gd-text-background .bcPicker-color, #gd-text-font-color .bcPicker-color', function(){
        var textProperties = $.fn.textGenerator.getProperties();
        switch($(this).parent().parent().attr("id")){
            case "gd-text-font-color":
                textProperties.fontColor = $(this).css("background-color");
                break;
            case "gd-text-border-color":
                textProperties.borderColor = $(this).css("background-color");
                break;
            case "gd-text-background":
                textProperties.backgroundColor = $(this).css("background-color");
                break;
        }
		$.fn.textGenerator.draw(textProperties);
		$(".gd-signature-select").removeClass("gd-signing-disabled");
    });

	//////////////////////////////////////////////////
    // Export drawn Text signature - detect select change event
    //////////////////////////////////////////////////
    $('.gd-modal-body').on('change', '#gd-text-border-style-line .gd-border-style-select, .gd-text-checkbox label input', function(){
        var textProperties = $.fn.textGenerator.getProperties();
		$.fn.textGenerator.draw(textProperties);
		$(".gd-signature-select").removeClass("gd-signing-disabled");
    });

    //////////////////////////////////////////////////
    // Download event
    //////////////////////////////////////////////////
    $('#gd-btn-download-value > li').bind(userMouseClick, function(e){
        download($(this));
    });

	//////////////////////////////////////////////////
    // Pages diapason entering event
    //////////////////////////////////////////////////
    $('.gd-modal-body').on(userMouseClick, '#gd-from, #gd-to', function(e){
		$("#gd-radio-diapason").prop("checked", true);
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
	$('#gd-panzoom').on(userMouseClick, '.gd-signature', function(e){
		if(e.target.tagName != "SELECT" && e.target.className != "bcPicker-picker" && e.target.className != "bcPicker-color" && e.target.tagName != "I"){
			hideAllContextMenu();
		}
		$(e.target.parentElement).find(".gd-context-menu").removeClass("hidden");
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
        $('#gd-left-bar-wrapper').hide();
        $('#gd-mobile-menu-open').show();
        $('#gd-mobile-menu-close').hide();
        $('#gd-signature-context-panel').hide();
        inactiveAll();
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
    $('#gd-signature-list').on(userMouseClick, '#gd-signature-clickable', function (e) {
        var sign = $(this);
        selectSignature(sign);
    });
});

/*
******************************************************************
FUNCTIONS
******************************************************************
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
                        '<div data-guid="' + guid + '" id="gd-signature-item-' + index + '" class="gd-signature-item gd-signature gd-signature-thumbnail ui-draggable ui-draggable-handle">' +
                        '<div data-guid="' + guid + '" id="gd-signature-clickable" class="gd-signature-clickable">' +
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
                        if (!confirm("Do you want to delete?")){
                            return false;
                        }
                        var sign = $(this);
                        signature.signatureGuid = sign.attr("data-guid");
                        deleteSignatureFile(guid);
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
    var url = "";
    var signatureType = "";
    // check signature type: digital, image etc.
    if(signaturesList.length > 0){
        signatureType = signaturesList[0].signatureType;
    } else {
        signatureType = signature.signatureType;
        signature.documentType = getDocumentFormat(documentGuid).format;
    }
    // get signing action URL, depends from signature type
    switch (signatureType){
        case "digital":
            url = getApplicationPath('signDigital')
            signaturesList.push(signature);
            break;
        case "image": url = getApplicationPath('signImage')
            break;
        case "stamp": url = getApplicationPath('signStamp')
            break;
        case "qrCode": url = getApplicationPath('signOptical')
            break;
        case "barCode": url = getApplicationPath('signOptical')
            break;
        case "text": url = getApplicationPath('signText')
            break;
    }
    // current document guid is taken from the viewer.js globals
    var data = {
        guid: documentGuid,
        password: password,
        signaturesData: signaturesList
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
    $('#gd-modal-spinner').show();
    // current document guid is taken from the viewer.js globals
    var data = {image: image};
    // sign the document
    $.ajax({
        type: 'POST',
        url: getApplicationPath("saveImage"),
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(returnedData) {
            $('#gd-modal-spinner').hide();
            if(returnedData.message != undefined){
                // open error popup
                printMessage(returnedData.message);
                return;
            }
            // set curent signature data
            signature.signatureGuid = returnedData.guid;
            signature.imageHeight = $("#bcPaintCanvas")[0].height;
            signature.imageWidth = $("#bcPaintCanvas")[0].width;
            imageSaved = true;
            // load signatuers from storage
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

/**
 * Save drawn stamp signature
 */
function saveDrawnStamp(callback) {
    $('#gd-modal-spinner').show();
    //get drawn stamp data
    stampData = getStampData();
    // initiate image
    var image = "";
    // draw empty canvas - required to resize and crop stamp for its real size
    var cropedCanvas = "<canvas id='gd-croped-stamp' width='" + stampData[stampData.length - 1].width + "' height='" + stampData[stampData.length - 1].height + "'></canvas>";
    // combine all stamp lines to one image
    $("#csg-preview-container").append(cropedCanvas);
    var ctxCroped = $("#gd-croped-stamp")[0].getContext("2d");
    // get drawn stamp padding from canvas border
    var initialLeft = getRealStampSize($(".csg-preview")[0]).left;
    var initialTop = getRealStampSize($(".csg-preview")[0]).top;
    // combine stamp lines
    $(".csg-preview").each(function(index, shape){
        // calculate stamp real size and paddings
        var newLeft = 0;
        var newTop = 0;
        var currentLeft = getRealStampSize(shape).left;
        var currentTop = getRealStampSize(shape).top
        if(index != 0){
            newLeft = currentLeft - initialLeft;
            newTop = currentTop - initialTop;
        }
        // crop canvas empty pixels
        ctxCroped.drawImage(
            shape,
            getRealStampSize(shape).left,
            getRealStampSize(shape).top,
            getRealStampSize(shape).width,
            getRealStampSize(shape).height,
            newLeft,
            newTop,
            getRealStampSize(shape).width,
            getRealStampSize(shape).height
        );
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
            $('#gd-modal-spinner').hide();
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
            $('#gd-modal-spinner').hide();
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
    // current document guid is taken from the viewer.js globals
	properties.imageGuid = signature.signatureGuid;
    var data = {properties: properties};
    $('#gd-modal-spinner').show();
    // sign the document
    $.ajax({
        type: 'POST',
        url: getApplicationPath("saveText"),
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(returnedData) {
            $('#gd-modal-spinner').hide();
            if(returnedData.message != undefined){
                // open error popup
                printMessage(returnedData.message);
                return;
            }
            $('#gd-modal-spinner').hide();
            // set curent signature data
            signature.signatureGuid = returnedData.imageGuid;
            signature.imageHeight = returnedData.height;
            signature.imageWidth = returnedData.width;
        },
        error: function(xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.Message);
            $('#gd-modal-spinner').hide();
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
 * Get drawn stamp data
 */
function getStampData(){
    // get shape data
    var stampData = [];
   $(".csg-params").each(function(index, shape){
        var currentShapeId = $(shape).attr("id").replace ( /[^\d.]/g, '' );
        var stampShape = {};
        stampShape.text = $(shape).find("#csg-text").val();
        stampShape.fontSize = $(shape).find("#csg-text-size").val();
        stampShape.textRepeat = $(shape).find("#csg-text-repeat").val();
        stampShape.textExpansion = $(shape).find("#csg-text-expansion").val();
        stampShape.font = $(shape).find("#csg-text-font").val();
        stampShape.textColor = $("#csg-fg-color-" + currentShapeId).children().css('background-color');
        stampShape.radius = $(shape).find("#csg-radius").val();
        stampShape.strokeColor = $("#csg-stroke-color-" + currentShapeId).children().css('background-color');
        stampShape.backgroundColor = $("#csg-bg-color-" + currentShapeId).children().css('background-color');
        stampShape.width = getRealStampSize($(".csg-preview")[0]).width;
        stampShape.height = getRealStampSize($(".csg-preview")[0]).height;
        stampData.push(stampShape);
        stampShape = null;
    });
   return stampData;
}

/**
 * Get real size of the canvas content
 * @param {String} stampCanvas - Canvas element
 */
function getRealStampSize(stampCanvas) {
    var ctx = stampCanvas.getContext('2d'),
        copy = document.createElement('canvas').getContext('2d'),
        pixels = ctx.getImageData(0, 0, stampCanvas.width, stampCanvas.height),
        l = pixels.data.length,
        i,
        bound = {
            top: null,
            left: null,
            right: null,
            bottom: null
        },
        x, y;

    for (i = 0; i < l; i += 4) {
        if (pixels.data[i+3] !== 0) {
            x = (i / 4) % stampCanvas.width;
            y = ~~((i / 4) / stampCanvas.width);

            if (bound.top === null) {
                bound.top = y;
            }

            if (bound.left === null) {
                bound.left = x;
            } else if (x < bound.left) {
                bound.left = x;
            }

            if (bound.right === null) {
                bound.right = x;
            } else if (bound.right < x) {
                bound.right = x;
            }

            if (bound.bottom === null) {
                bound.bottom = y;
            } else if (bound.bottom < y) {
                bound.bottom = y;
            }
        }
    }
    var trimHeight = bound.bottom - bound.top,
        trimWidth = bound.right - bound.left,
        trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);
    var result = {height: trimHeight, width: trimWidth, left: bound.left, top: bound.top};
    return result;
}

/**
 * Open modal on signature upload step
 */
function openSigningFirstStepModal(){
    var browseSignatures = ($("#gd-signatures").children().length > 0) ? true: false;
    switchSlide(0, "", "right");
    // show or hide the browse button, depends on signature availability in the storage
    if(!browseSignatures){
        $(".gd-browse-signatures").hide();
    }
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
 * Generate HTML content of the Image sign modal
 */
function getHtmlImageSign() {
    // prepare signing steps HTML
    var uploadStep = getHtmlSignatureUploadModal();
    var signaturesSelectStep = getHtmlSignaturesSelectModal();
    var drawStep = "";
    if(signature.signatureType == "qrCode" || signature.signatureType == "barCode"){
        drawStep = getHtmlDrawModal("optical");
    } else {
        drawStep = getHtmlDrawModal(signature.signatureType);
    }
    var signaturePageSelectStep = getHtmlPagesSelectModal();
    var footer = getHtmlSigningModalFooter(2);
    // generate signing modal HTML
    return '<section id="gd-sign-section"  data-type="image">' +
                '<div id="gd-modal-spinner"><i class="fa fa-circle-o-notch fa-spin"></i> &nbsp;Loading... Please wait.</div>'+
                '<div id="gd-upload-step" class="gd-slide" data-index="0">'+
                    uploadStep+
                '</div>'+
                signaturesSelectStep+
                drawStep+
                '<div id="gd-signature-page-select-step" class="gd-slide" data-index="2" data-last="true">'+
                    signaturePageSelectStep+
                '</div>'+
                footer+
            '</section>';
}

/**
 * Generate HTML content of the Text sign modal
 */
function getHtmlTextSign() {
    // prepare signing steps HTML
    var uploadStep = getHtmlSignatureUploadModal();
    var signaturesSelectStep = getHtmlSignaturesSelectModal();
    var drawStep = getHtmlDrawModal(signature.signatureType);
    var signaturePageSelectStep = getHtmlPagesSelectModal();
    var footer = getHtmlSigningModalFooter(2);
    // generate signing modal HTML
    return '<section id="gd-sign-section"  data-type="image">' +
                '<div id="gd-modal-spinner"><i class="fa fa-circle-o-notch fa-spin"></i> &nbsp;Loading... Please wait.</div>'+
                '<div id="gd-upload-step" class="gd-slide" data-index="0">'+
                    uploadStep+
                '</div>'+
                signaturesSelectStep+
                drawStep+
                '<div id="gd-signature-page-select-step" class="gd-slide" data-index="2" data-last="true">'+
                    signaturePageSelectStep+
                '</div>'+
                footer+
            '</section>';
}

/**
 * Get HTML content for signature upload/browser modal
 **/
function getHtmlSignatureUploadModal(){
    var uploadButton = "";
    if(signature.signatureType != "stamp" && signature.signatureType != "text") {
        uploadButton = '<div class="gd-upload-signatures gd-modal-buttons">' +
                            '<input id="gd-signature-upload-input" type="file" multiple><i class="fa fa-upload"></i>Upload' +
                        '</div>';
    }
    var browseButton =  '<div class="gd-browse-signatures gd-modal-buttons">'+
                            '<i class="fa fa-folder-open"></i>Open'+
                        '</div>';
    var drawImage = "";
    if (signature.signatureType != "digital"){
        drawImage = '<div class="gd-draw-signatures gd-modal-buttons">'+
                        '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>New'+
                    '</div>';
    }
    return uploadButton + browseButton + drawImage;
}

/**
 * Get HTML content for signature browser modal
 **/
function getHtmlSignaturesSelectModal(){
    return  '<div id="gd-signature-select-step" class="gd-slide" data-index="1">'+
                '<div class="gd-signing-label">'+
                    '<div>1. Signatures <i>Select signature to sign your document</i></div>'+
                '</div>'+
                '<div id="gd-signatures">'+
                //signatures will be here
                '</div>'+
            '</div>';
}

/**
 * Get HTML content for page select modal
 **/
function getHtmlPagesSelectModal(){
    var stepHeader = '<div class="gd-signing-label">'+
                        '<div>2. Select page(s) <i>Enter pages diapason to add signature to the specific page(s). <br/> If you need to add signature to all pages you can use all pages selector</i></div>'+
                    '</div>';
    var pageSelector = '<div class="gd-pages-label">'+
							'pages:'+
						'</div>'+
						'<div id="gd-all-pages">'+
							'<div class="gd-signature" id="gd-pages-select-radio">'+
								'<input id="gd-radio-all" class="gd-signature-radio" name="gd-radio" type="radio">'+
								'<label for="gd-radio-all" class="gd-all-pages-label">all</label>'+
								'<input id="gd-radio-diapason" class="gd-signature-radio" name="gd-radio" type="radio">'+
								'<label for="gd-radio-diapason" class="gd-all-pages-label">'+
									'<div class="gd-pages">'+
										'<div class="gd-pages-diapason">'+
											'<label>from: </label>'+
											'<input id="gd-from" type="number">'+
											'<label>to: </label>'+
											'<input id="gd-to" type="number">'+
										'</div>'+
									'</div>'+
								'</label>'+
							'</div>'+
						'</div>';

    return stepHeader + pageSelector;
}

/**
 * Get HTML content for draw image step
 **/
function getHtmlDrawModal(prefix) {
    return  '<div id="gd-signature-draw-step" class="gd-slide" data-index="1">'+
                '<div class="gd-signing-label">'+
                    '<div>1. Generate ' + prefix + ' signature <i>Set your signature properties</i></div>'+
                '</div>'+
                '<div id="gd-draw-' + prefix + '">' +
                    // draw area will be here
                '</div>'+
            '</div>';
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
 * Get selected pages diapason to add signatures
 */
function getPagesDiapason(){
	var pages = [];
	var startPage = parseInt($("#gd-from").val());
	var endPage = parseInt($("#gd-to").val())
	if($("#gd-radio-all").is(":checked")) {
		for(var i = 1; i <= $("#gd-panzoom > div").length; i++) {
			pages.push(i);
		}
	} else {
		for(var i = 1; i <= $("#gd-panzoom > div").length; i++) {
			if(i >= startPage && i <= endPage){
				pages.push(i);
			} else {
				continue;
			}
		}
	}
	return pages;
}

/**
 * Next button click event
 */
function switchToNextSlide(){
    var gd = $("#gd-next");

    if (gd && gd.length > 0 && gd[0].className.includes("disabled")) {
        return;
    }
    // check if the last step
    if(gd.html() == "CONFIRM") {
        pagesDiapason = getPagesDiapason();
        // get current signature type
        switch (signature.signatureType) {
            case "digital":
                // switch to entered data review step
                switchSlide(4, 3, "right");
                // sign document if step is last
                sign();
                break;
            case "stamp":
                if($("#gd-signature-draw-step").length == 1) {
                    saveDrawnStamp(loadSignatureImage);
                } else {
                    loadSignatureImage();
                }
                break;
            case "text":
                if($("#gd-sign-section").find("#gd-signature-select-step").length > 0){
                    loadSignatureImage();
                } else {
                    // save text signature
                    saveDrawnText($.fn.textGenerator.getProperties(), loadSignatureImage);
                }
                break;
            default:
                loadSignatureImage();

        }
    } else {
        var currentSlide = null;
        // get current signing step index
        $(".gd-slide").each(function (index, elem) {
            if ($(elem).css("display") == "block") {
                currentSlide = $(elem).data("index");
            }
            // if next step is last step, update next button to confirm button
            if ($($(".gd-slide")[index + 1]).data("last")) {
                $("#gd-next").html("CONFIRM");
                // if last slide selecting pages, confirm - disabled
                if ($($(".gd-slide")[index + 1])[0].id == "gd-signature-page-select-step") {
                    $(".gd-signature-select").addClass("gd-signing-disabled");
                }
                if(/Mobi/.test(navigator.userAgent)){
                    $("#gd-next").css("left",  "calc(100% - 285px)", "!important");
                } else {
                    $("#gd-next").css("left", "calc(100% - 123px)");
                }
            }
            if(currentSlide != null){
                return false;
            }
        });
        // if next step is review signing data - save entered data values
        if ($(".gd-signature-information").is(":visible")) {
            setAdditionalInformation();
        }
        // if image signature was drawn, save it
        var gd1 = $("#gd-draw-image");
        if (gd1 && gd1.is(":visible") && !imageSaved) {
            var drawnImage = $.fn.bcPaint.export();
            saveDrawnImage(drawnImage);
        }
        // switch to next signing step if the current step is not last
        switchSlide(currentSlide + 1, currentSlide, "right");
        // update step pagination
        $($(".gd-pagination")[currentSlide - 1]).toggleClass("gd-pagination-active");
        $($(".gd-pagination")[currentSlide]).toggleClass("gd-pagination-active");
        // enable datepicker input if current step is signing data information
        if ($("#gd-datepicker").is(":visible")) {
            $("#gd-datepicker").datepicker({dateFormat: 'dd-mm-yy'});
        }
    }
}

/**
 * Switch signing steps slides in the signing modal
 * @param {int} stepNumber - step number to switch in
 * @param {int} currentSlide - current step
 * @param {string} direction - slide animation direction
 */
function switchSlide(stepNumber, currentSlide, direction) {
    var slides = $(".gd-slide");
    if(direction == "right" && stepNumber > 0){
        $(slides[currentSlide]).hide("slide", { direction: "left" }, 500);
    } else if (direction == "left" && stepNumber >= 0){
        $(slides[currentSlide]).hide("slide", { direction: "right" }, 500);
    }
    $(slides[stepNumber]).show("slide", { direction: direction }, 500);
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
 * Get selected signature image stream
 */
function loadSignatureImage() {
    var currentPageNumber = getCurrentPageNumber();
    // current document guid is taken from the viewer.js globals
	var data = { guid: signature.signatureGuid, page: currentPageNumber, password: "" };
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
            signature.pageNumber = currentPageNumber;
            signature.deleted = false;
            if(typeof(signature.signatureGuid) == "undefined"){
                signature.signatureGuid = "";
                signature.signatureType = "";
                signature.imageWidth = 0;
                signature.imageHeight = 0;
            }
            insertImage(returnedData.data, currentPageNumber);
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

/**
 * Get selected signature image stream
 * @param {string} image - Base64 encoded image
 * @param {int} pageNumber - Number of the page into which the image should be inserted
 */
function insertImage(image, pageNumber) {
	hideAllContextMenu();
    // set document format
    signature.documentType = getDocumentFormat(documentGuid).format;
    // add current signature object into the list of signatures
    signaturesList.push(signature);
    // prepare index which will be used for specific image HTMl elements naming
    var currentImage = signatureImageIndex;
    // get HTML markup of the resize handles
    var resizeHandles = getHtmlResizeHandles();
	// new UI
	var contextMenu = getContextMenu("gd-image-signature-" + currentImage, signature.signatureType);
	signature.id = currentImage;
    var style = "";
    if (draggableSignaturePosition && draggableSignaturePosition.left && draggableSignaturePosition.top) {
        style = 'left: ' + draggableSignaturePosition.left + 'px; top: ' + draggableSignaturePosition.top + 'px;';
        draggableSignaturePosition = {};
    }
    // prepare signature image HTML
    var signatureHtml = '<div id="gd-draggable-helper-' + currentImage + '"  class="gd-draggable-helper gd-signature" style="'+ style+'">' +
							contextMenu +
							'<a id="gd-apply" class="gd-image-apply" href="#">' +
								'<i class="fa fa-check-circle" aria-hidden="true"></i>' +
							'</a>' +
							'<a id="gd-cancel" class="gd-image-apply gd-image-cancel" href="#">' +
								'<i class="fa fa-ban" aria-hidden="true"></i>' +
							'</a>' +
							'<a id="gd-edit" class="gd-image-edit" href="#">' +
								'<i class="fa fa-pencil" aria-hidden="true"></i>' +
							'</a>' +
							'<image id="gd-image-signature-' + currentImage + '" class="gd-signature-image" src="data:image/png;base64,' + image + '" alt></image>' +
							resizeHandles +
						'</div>';
    $("#gd-image-signature-" + currentImage).css('background-color','transparent');
    // add signature to the selected page
    $(signatureHtml).insertBefore($("#gd-page-" + pageNumber).find(".gd-wrapper")).delay(1000);
	// new UI
	$(".gd-text-color-picker").bcPicker();
	// new UI
	var defaultFont = $("#gd-draggable-helper-" + currentImage).find(".gd-fonts-select").val();
	// new UI
	var defaultFontSize = $("#gd-draggable-helper-" + currentImage).find(".gd-font-size-select").val();
	// new UI
	$("#gd-draggable-helper-" + currentImage).find("input").css("font-size", defaultFontSize);
	// new UI
	$("#gd-draggable-helper-" + currentImage).find("input").css("font-family", defaultFont);

    if(signature.signatureType == "image" && /Mobi/.test(navigator.userAgent)){
        $(".gd-draggable-helper").css("width", "100%", "!important");
    }
    var signatureToEdit = $.grep(signaturesList, function (obj) { return obj.id === currentImage; })[0];
    // enable rotation, dragging and resizing features for current image
    $("#gd-draggable-helper-" + currentImage).draggable({
        // set restriction for image dragging area to current document page
        containment: "#gd-page-" + pageNumber,
        // action fired when dragging stoped
        stop: function () {
            var signatureImage = $(this);
            var signaturePos = signatureImage.position();
            // get image positioning coordinates after dragging
			updateSignatureProperties(signatureToEdit, null, null, Math.round(signaturePos.left),  Math.round(signaturePos.top));
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
            if(width == 0){
                // use image width which was set at the saving step
                width =  signatureToEdit.imageWidth;
            }
            if(height == 0 || height < 19){
                // use image height which was set at the saving step
                height =  signatureToEdit.imageHeight;
            }
			updateSignatureProperties(signatureToEdit, Math.round(width), Math.round(height));
            setGridPosition(width, height);
        },
        stop: function (event, image) {
            // set signature updated size and position
			updateSignatureProperties(signatureToEdit, Math.round(image.size.width), Math.round(image.size.height), Math.round(image.position.left), Math.round(image.position.top));
            setGridPosition(signatureToEdit.imageWidth, signatureToEdit.imageHeight);
        }
    });
    // encrease signature index
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
function getContextMenu(signatureId, signatureType){
	var contextMenuClass = "gd-context-menu";
	if(signatureType == "text"){
		contextMenuClass = contextMenuClass + " gd-text-context-menu";
		$.fn.textGenerator();
	}
	var menuHtml = '<div class="' + contextMenuClass + '">';
	$.each(contextMenuButtons, function(index, button){
		if(signatureType == "text" && index == 1){
			menuHtml = menuHtml + '<div class="gd-text-menu">';
			if(isMobile()){
				menuHtml = menuHtml + '<div class="gd-blur"></div>';
			}
			$.each(textContextMenuButtons, function(index, button){
				menuHtml = menuHtml + button;
			});
			if(isMobile()){
				menuHtml = menuHtml + '<i class="fas fa-arrow-up"></i>';
			}
			menuHtml = menuHtml + '</div>';
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
function getHtmlFontsSelect(fonts){
	var fontsSelect = '<select class="gd-fonts-select">';
	$.each(fonts, function(index, font){
		fontsSelect = fontsSelect + '<option value="' + font + '">' + font + '</option>';
	});
	fontsSelect = fontsSelect + '</select>';
	return fontsSelect;
}


/**
 * Prepare font sizes select HTML
 */
function getHtmlFontSizeSelect(){
	var fontSizes = '<select class="gd-fonts-select gd-font-size-select">';
	for(var i = 8; i <= 20; i++){
		if(i == 16){
			fontSizes = fontSizes + '<option value="' + i + '" selected="selected">' + i + 'px</option>';
		} else {
			fontSizes = fontSizes + '<option value="' + i + '">' + i + 'px</option>';
		}
	}
	fontSizes = fontSizes + '</select>';
	return fontSizes;
}

function getFonts() {
	// sign the document
	$.ajax({
		type: 'GET',
		url: getApplicationPath("getFonts"),
		contentType: 'application/json',
		success: function(returnedData) {
			var fontSize = getHtmlFontSizeSelect();
			if($.inArray(fontSize, textContextMenuButtons) == -1){
				var fonts = $.fn.cssFonts();
				var resultFonts = [];
				$.each(fonts, function(index, font){
					var existedFont = $.inArray(font, returnedData);
					if (existedFont != -1) {
					   resultFonts.push(font);
					}
				});
				var fontsSlect = getHtmlFontsSelect(resultFonts);

				textContextMenuButtons.splice(0, 0, fontsSlect);
				textContextMenuButtons.splice(1, 0, getHtmlFontSizeSelect());
				fonts = null;
				resultFonts = null;
			}
		},
		error: function(xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.Message);
			// open error popup
			//printMessage(err.message);
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
        return '<li id="gd-nav-save" class="gd-save-disabled"><i class="fa fa-floppy-o"></i><span class="gd-tooltip">Save</span></li>';
    }

    function getHtmlTextSignatureElement() {
        return '<li>' +
                    '<button class="gd-tool gd-tool-inactive gd-text-sign" id="gd-text-sign" signature-type="text" signature-type-title="Texts">' +
                    '<i class="fas fa-font fa-lg fa-inverse"></i>' +
                    '<span class="gd-popupdiv-hover gd-tool-tooltip gd-tool-tooltip-mobile">Text</span>' +
                    '</button>' +
                '</li>';
    }

    function getHtmlImageSignatureElement() {
        return '<li>' +
                    '<button class="gd-tool gd-tool-inactive gd-image-sign" id="gd-image-sign" signature-type="image" signature-type-title="Uploaded images">' +
                    '<i class="fas fa-image fa-lg fa-inverse"></i>' +
                    '<span class="gd-popupdiv-hover gd-tool-tooltip gd-tool-tooltip-mobile">Image</span>' +
                    '</button>' +
                '</li>';
    }

    function getHtmlDigitalSignatureElement() {
        return '<li>' +
                    '<button class="gd-tool gd-tool-inactive gd-digital-sign" id="gd-digital-sign" signature-type="digital" signature-type-title="Certificates">' +
                    '<i class="fas fa-fingerprint fa-lg fa-inverse"></i>' +
                    '<span class="gd-popupdiv-hover gd-tool-tooltip gd-tool-tooltip-mobile">Digital</span>' +
                    '</button>' +
                '</li>';
    }

    function getHtmlQrcodeSignatureElement() {
        return '<li>' +
                    '<button class="gd-tool gd-tool-inactive gd-qrcode-sign" id="gd-qrcode-sign" signature-type="qrCode" signature-type-title="QR codes">' +
                    '<i class="fas fa-qrcode fa-lg fa-inverse"></i>' +
                    '<span class="gd-popupdiv-hover gd-tool-tooltip gd-tool-tooltip-mobile">QR code</span>' +
                    '</button>' +
                '</li>';
    }

    function getHtmlBarcodeSignatureElement() {
        return '<li>' +
                    '<button class="gd-tool gd-tool-inactive gd-barcode-sign" id="gd-barcode-sign" signature-type="barCode" signature-type-title="Bar codes">' +
                    '<i class="fas fa-barcode fa-lg fa-inverse"></i>' +
                    '<span class="gd-popupdiv-hover gd-tool-tooltip gd-tool-tooltip-mobile">Barcode</span>' +
                    '</button>' +
                '</li>';
    }

    function getHtmlStampSignatureElement() {
        return '<li>' +
                    '<button class="gd-tool gd-tool-inactive gd-stamp-sign" id="gd-stamp-sign" signature-type="stamp" signature-type-title="Stamps">' +
                    '<i class="fas fa-stamp fa-lg fa-inverse"></i>' +
                    '<span class="gd-popupdiv-hover gd-tool-tooltip gd-tool-tooltip-mobile">Stamp</span>' +
                    '</button>' +
                '</li>';
    }

    function getHtmlHandSignatureElement() {
        return '<li>' +
                    '<button class="gd-tool gd-tool-inactive gd-hand-sign" id="gd-hand-sign" signature-type="hand" signature-type-title="Signatures">' +
                    '<i class="fas fa-signature fa-lg fa-inverse"></i>' +
                    '<span class="gd-popupdiv-hover gd-tool-tooltip gd-tool-tooltip-mobile">Signature</span>' +
                    '</button>' +
                '</li>';
    }

	function getHtmlLightboxBox() {
        return '<div class="gd-modal fade" id="lightBoxDialog">' +
			      '<div class="gd-modal-dialog">' +
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
			            '<div class="gd-modal-body" id="gd-lightbox-body">' +
							// lightBox body content elements will be here
						'</div>' +
			            // footer
			            '<div class="gd-modal-footer">' +
			            // empty footer
			            '</div>' +
			        '</div><!-- /.modal-content -->' +
			      '</div><!-- /.modal-dialog -->' +
			    '</div>';
    }

})(jQuery);