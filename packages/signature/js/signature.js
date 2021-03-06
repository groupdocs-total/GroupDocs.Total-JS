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
    signaturePassword: "",
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
    angle: 0
};
var draggableSignaturePosition = {};
var userMouseClick = ('ontouch' in document.documentElement) ? 'touch click' : 'click';
var contextMenuButtons = ["fas fa-arrows-alt fa-sm", "fas fa-unlock gd-lock-ratio", "fas fa-copy gd-copy-signature", "fas fa-trash-alt fa-sm gd-delete-signature"];
var mergedFonts = [];
var dataImagePrefix = 'data:image/png;base64,';
var triggerCopyResize = false;
var triggerCopyDrag = false;

$(document).ready(function () {

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

	 $('.gd-modal-body').on('click', '.gd-filetree-name', function (e) {
		 $("#gd-signature-context-panel").hide();
		  signaturesList = [];
	 });

    //////////////////////////////////////////////////
    // Sign document
    //////////////////////////////////////////////////
    $("#gd-nav-save").on(userMouseClick, function () {
        if (documentGuid && signaturesList.length > 0) {
            sign();
        } else {
            printMessage("Please open document and add signature");
        }
    });

    //////////////////////////////////////////////////
    // Fix for tooltips of the dropdowns
    //////////////////////////////////////////////////
    $('#gd-download-val-container').on(userMouseClick, function (e) {
        if ($(this).hasClass('open')) {
            $('#gd-btn-download-value').parent().find('.gd-tooltip').css('display', 'none');
        } else {
            $('#gd-btn-download-value').parent().find('.gd-tooltip').css('display', 'initial');
        }
    });

    //////////////////////////////////////////////////
    // Open sign context panel
    //////////////////////////////////////////////////
    $('.gd-tool').on(userMouseClick, function (e) {
        if (typeof documentGuid == "undefined" || documentGuid == "") {
            printMessage("Please open document first");
        } else {
            closeAddCode();
            closeAddUpload();
            var button = $(this);
            var type = button.attr("signature-type");
            if (type) {
                signature.signatureType = type;
            }
            var typeTitle = button.attr("signature-type-title");
            var gd = $('#gd-signature-context-panel');
            if (button[0].className.indexOf("gd-tool-inactive") > 0) {
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
    $('#gd-upload-input').on('change', function (e) {
        var fileName = '';
        $.each( $(this)[0].files, function(index, elem) {
            fileName += elem.name + ', ';
        });
        $("#gd-upload-title").html(fileName.substring(0, fileName.lastIndexOf(',')));
        $('#gd-add-upload-file').addClass('active');
    });


    $('#gd-add-upload-file').on(userMouseClick, function (e) {
        e.preventDefault();
        var uploadFiles = $("#gd-upload-input").get(0).files;
        // upload file
        if (uploadFiles.length > 0) {
            if ("digital" == signature.signatureType) {
                uploadSignature(uploadFiles[0], 0, "", loadSignaturesTree);
            } else {
                for (var i = 0; i < uploadFiles.length - 1; i++) {
                    // upload local file
                    uploadSignature(uploadFiles[i], i, "");
                }
                uploadSignature(uploadFiles[uploadFiles.length - 1], uploadFiles.length - 1, "", loadSignaturesTree);
            }
            closeAddUpload();
        }
    });

    $('#gd-close-upload-signature').on(userMouseClick, function () {
        resetUploadFiles();
        closeAddUpload();
    });

    //////////////////////////////////////////////////
    // Export drawn image signature
    //////////////////////////////////////////////////
    $('.gd-modal-lightbox').on(userMouseClick, '#bcPaint-export', function () {
        var drawnImage = $.fn.bcPaint.export();
        saveDrawnImage(drawnImage);
        toggleLightBox(false);
    });

    //////////////////////////////////////////////////
    // Download event
    //////////////////////////////////////////////////
    $('#gd-btn-download-value > li').bind(userMouseClick, function (e) {
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
    $('#gd-panzoom').on(userMouseClick + 'touchstart mousedown', '.gd-signature', function (e) {
        if (!$(e.target).hasClass("gd-font-size")) {
            hideAllContextMenu();
            var signature = $(e.target).closest('.gd-signature');
            var contextMenu = signature.find('.gd-context-menu');
            showContextMenuFor(signature);
            if (signature.find('.gd-draw-text').length) {
                var textarea = signature.find('textarea');
                $.fn.textGenerator.init(signature.id, null, textarea.val(), contextMenu);
                textarea.focus();
            }
        } else {
            e.target.focus();
        }
    });

    //////////////////////////////////////////////////
    //Signature click event
    //////////////////////////////////////////////////
    $('#gd-panzoom').on(userMouseClick, '.gd-signature-image', function (e) {
        if ($(this.parentElement).find(".gd-context-menu")[0].className.indexOf('hidden') > 0) {
            hideAllContextMenu();
            var elem = $(this.parentElement).find(".gd-context-menu");
            elem.removeClass("hidden");
        }
    });

	$('#gd-container').on(userMouseClick, function (e) {
        var elem = $(e.target);
        for (var i = 0; i < 5; i++) {
            if (elem && elem[0].id == "gd-context-menu") {
                return;
            }
            elem = elem.parent();
        }
		if(!$(e.target).hasClass("gd-signature-image") && !$(e.target).hasClass("gd-text") && $(e.target).attr("id") != "gd-new-signature"){
            hideAllContextMenu();
		}
    });
    //////////////////////////////////////////////////
    // Lock ratio click event
    //////////////////////////////////////////////////
    $('#gd-panzoom').on(userMouseClick, '.gd-lock-ratio', function (e) {
        e.preventDefault();
        e.stopPropagation();
        // start monkey patch for setOption (see https://bugs.jqueryui.com/ticket/4186)
        var oldSetOption = $.ui.resizable.prototype._setOption;
        $.ui.resizable.prototype._setOption = function(key, value) {
            oldSetOption.apply(this, arguments);
            if (key === "aspectRatio") {
                this._aspectRatio = !!value;
            }
        };
        // end monkey patch for setOption

        var button = $(e.target);
        var sigantureDragable = $(e.target).closest('.ui-draggable');
        var isLocked = sigantureDragable.hasClass('ratio-locked');
        if(isLocked){
            sigantureDragable.removeClass('ratio-locked');
            button.removeClass('fa-lock').addClass('fa-unlock');
            sigantureDragable.find('.ui-resizable-handle').show();
            sigantureDragable.resizable('option', 'aspectRatio', false);
        }else{
            sigantureDragable.addClass('ratio-locked');
            button.removeClass('fa-unlock').addClass('fa-lock');
            sigantureDragable.find('.ui-resizable-handle').hide();
            sigantureDragable.find('.ui-resizable-se').show();
            sigantureDragable.resizable('option', 'aspectRatio', true);
        }

    });


    //////////////////////////////////////////////////
    // Copy signature on all pages click event
    //////////////////////////////////////////////////
    $('#gd-panzoom').on(userMouseClick, '.gd-copy-signature', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var signatureId = parseInt($(e.target).data("id").replace(/[^\d.]/g, ''));
        // get signature data to copy
        var signatureToCopy = $.grep(signaturesList, function (obj) { return obj.id === signatureId; })[0];
        var position = {'left': signatureToCopy.left, 'top': signatureToCopy.top};
        var imgElement = $('#gd-image-signature-' + signatureId);
        var image = "text" != signatureToCopy.signatureType && imgElement ?
            imgElement.attr('src').replace(dataImagePrefix, '') : "";
        $(".gd-page").each(function(index, page){
            var pageNumber = index + 1;
            if (signatureToCopy.pageNumber != pageNumber) {
                copySignature(signatureToCopy, pageNumber);
                if ("text" == signature.signatureType) {
                    insertText($.fn.textGenerator.getProperties(), pageNumber, position);
                } else {
                    insertImage(image, pageNumber, position);
                }
            }
        });
    });

    //////////////////////////////////////////////////
    // Delete signature click event
    //////////////////////////////////////////////////
    $('#gd-panzoom').on(userMouseClick, '.gd-delete-signature', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Do you want to delete?")) {
            return false;
        }
        var signatureId = parseInt($(e.target).data("id").replace(/[^\d.]/g, ''));
        // get signature data to delete
        var signatureToRemove = $.grep(signaturesList, function (obj) { return obj.id === signatureId; })[0];
        if (signatureToRemove.signatureType == 'text' && isMobile()) {
            var menuId = e.target.parentElement.parentElement.attributes['data-textMenuId'].value;
            $('#' + menuId).remove();
        }
        e.target.parentElement.parentElement.remove();
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
    $('.gd-lightbox-close').on(userMouseClick, function () {
        toggleLightBox(false)
    });

    //////////////////////////////////////////////////
    // Choose signature event by click
    //////////////////////////////////////////////////
    $('#gd-signature-list').on(userMouseClick, '.gd-signature-item', function (e) {
        var sign = $(this);
        selectSignature(sign);
    });

    //////////////////////////////////////////////////
    // Create new signature
    //////////////////////////////////////////////////
    $('#gd-new-signature').on(userMouseClick, function (e) {
        switch (signature.signatureType) {
            case "hand":
                toggleLightBox(true, "Draw signature", "", getDrawSignContent());
                $("#gd-draw-image").bcPaint();
                fillLightBoxHeader(getDrawSignHeader());
                break;
            case "stamp":
                var html = $.fn.stampGenerator.addInitialShape();
                toggleLightBox(true, "Draw signature", html.header);
                $.fn.stampGenerator.addShape(0);
                break;
            case "barCode":
            case "qrCode":
                $("#gd-signature-context-panel").opticalCodeGenerator();
                changeListClass("gd-signature-list-wrapper-add");
                break;
            case "text":
                if (isMobile()) {
                    hideMobileMenu();
                } else {
                    $('#gd-signature-context-panel').hide();
                    inactiveAll();
                }
                initSignature(getCurrentPageNumber());
                insertText();
                break;
            case "image":
                openUploadSignatures("Add image signature", true);
                break;
            case "digital":
                openUploadSignatures("Add digital signature", false);
                break;
        }
    });
});

/*
******************************************************************
FUNCTIONS
******************************************************************
*/


function copySignature(signatureToCopy, pageNumber) {
    signature = {};
    signature.pageNumber = pageNumber;
    signature.top = signatureToCopy.top;
    signature.left = signatureToCopy.left;
    signature.imageHeight = signatureToCopy.imageHeight;
    signature.imageWidth = signatureToCopy.imageWidth;
    signature.angle = signatureToCopy.angle;
    signature.signatureGuid = signatureToCopy.signatureGuid;
    signature.signatureType = signatureToCopy.signatureType;
    signature.contact = signatureToCopy.contact;
    signature.reason = signatureToCopy.reason;
    signature.address = signatureToCopy.address;
    signature.date = signatureToCopy.date;
    signature.signatureComment = signatureToCopy.signatureComment;
    signature.signaturePassword = signatureToCopy.signaturePassword;
}
/**
 * Close add code panel
 */
function closeAddCode() {
    $("#gd-add-optical-signature").remove();
    changeListClass();
}

function closeAddUpload() {
    $("#gd-upload-signature").hide();
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

/**
* Open window for upload signatures
*/
function openUploadSignatures(title, multiple) {
    resetUploadFiles();
    $("#gd-upload-panel-title").html(title);
    $("#gd-upload-input")[0].multiple = multiple;
    $("#gd-upload-signature").show();
    changeListClass("gd-signature-list-wrapper-add-img");
}

function resetUploadFiles() {
    $("#gd-upload-title").html("Upload file");
    $("#gd-upload-input").val('');
    $('#gd-add-upload-file').removeClass('active');
}

function fillLightBoxHeader(header) {
    $("#gd-lightbox-header").append(header);
}


/**
 * Get html for lightbox header to create new image
 * @returns {string}
 */
function getDrawSignHeader() {
    return $.fn.bcPaint.getHeader();
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
function selectSignature(sign, pageNumber) {
    if ("digital" == signature.signatureType) {
        openDigitalPanel(sign);
        return;
    }
    signature.signatureGuid = sign.attr("data-guid");
    loadSignatureImage(pageNumber);
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
    var data = { guid: guid, signatureType: signature.signatureType };
    // show loading spinner
    fadeLeftBar(true);
    $.ajax({
        type: 'POST',
        url: getApplicationPath('deleteSignatureFile'),
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (returnedData) {
            // hide loading spinner
            fadeLeftBar(false);
            // open error popup
            if (returnedData && returnedData.message != undefined) {
                toggleModalDialog(false, "");
                printMessage(returnedData.message);
                return;
            }
            loadSignaturesTree('');
        },
        error: function (xhr, status, error) {
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
 * Return html for empty list view
 *
 * @returns {string}
 */
function getHtmlEmptyList() {
    var signTypeClass;
    switch (signature.signatureType) {
        case "image":
            signTypeClass = 'fa-image';
            break;
        case "text":
            signTypeClass = 'fa-font';
            break;
        case "digital":
            signTypeClass = 'fa-fingerprint';
            break;
        case "hand":
            signTypeClass = 'fa-signature';
            break;
        case "stamp":
            signTypeClass = 'fa-stamp';
            break;
        case "qrCode":
            signTypeClass = 'fa-qrcode';
            break;
        case "barCode":
            signTypeClass = 'fa-barcode';
            break;

    }
    return '<i class="fas ' + signTypeClass + ' fa-lg"></i>' +
        '<span class="gd-empty-list-text">There is no ' + signature.signatureType + ' signatures yet.</span>';
}

/**
 * Load file tree
 * @param {string} dir - files location directory
 * @param {object} callback - function that will be executed after ajax call
 */
function loadSignaturesTree(dir, callback) {
    dir = dir||'';
    $('#gd-signature-list').html("");
    $('#gd-signature-empty-list').html("");
    var data = { path: dir, signatureType: signature.signatureType };
    currentDirectory = dir;
    // show loading spinner
    fadeLeftBar(true);
    // get data
    $.ajax({
        type: 'POST',
        url: getApplicationPath('loadFileTree'),
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (returnedData) {
            // hide loading spinner
            fadeLeftBar(false);
            // open error popup
            if (returnedData && returnedData.message != undefined) {
                toggleModalDialog(false, "");
                printMessage(returnedData.message);
                return;
            }

            if (returnedData && returnedData.length == 0) {
                $('#gd-signature-empty-list').append(getHtmlEmptyList());
                return;
            }
            // append files to tree list
            $.each(returnedData, function (index, elem) {
                // document name
                var name = elem.name;
                if (signature.signatureType == 'qrCode' || signature.signatureType == 'barCode' || signature.signatureType == 'text') {
                    name = elem.text;
                }
                // document guid
                var guid = elem.guid;
                // append signature
                if (elem.isDirectory) {
                    $('#gd-signature-list').append('<div class="gd-signature">' +
                        '<i class="fa fa-folder"></i>' +
                        '<div class="gd-signature-name" data-guid="' + guid + '">' + name + '</div>' +
                        '</div>');
                } else {
                    var imageBlock = name;
					var textSignatureClass = "";
					var textStyle = "";
					switch(signature.signatureType){
						case "digital":
							imageBlock = '<div class="gd-signature-thumbnail-digital"><i class="fas fa-fingerprint fa-lg fa-inverse"></i></div>';
							break;
						case "text":
							imageBlock = "";
							textSignatureClass = "text";
							textStyle = 'style="color: ' + elem.fontColor + ';"';
							break;
						default:
							imageBlock = '<image class="gd-signature-thumbnail-' + signature.signatureType + '" src="data:image/png;base64,' + elem.image + '" alt></image>';
					}
                    $('#gd-signature-list').append(
                        '<div class="gd-signature-item-wrapper gd-signature-thumbnail">'+
							'<div data-guid="' + guid + '" id="gd-signature-item-' + index + '" class="gd-signature-item ui-draggable ui-draggable-handle">' +
								imageBlock +
								'<div data-guid="' + guid + '" class="gd-signature-title ' + textSignatureClass + '">' +
								'<label for="gd-signature-' + index + '" class="gd-signature-name" ' + textStyle + '>' + name + '</label>' +
								'</div>' +
								'<i class="fa fa-trash-o"></i>' +
							'</div>'+
						'</div>');

                    if (!isMobile() && "digital" != signature.signatureType) {
                        $('#gd-signature-item-' + index).draggable({
                            containment: "#gd-panzoom",
                            start: function () {
                                $('#gd-signature-list').removeClass("gd-signature-list-scroll");
                            },
                            stop: function (event, image) {
                                var sign = $(this);
								var position = getMousePosition(event);

                                var currentPage = document.elementFromPoint(position.x, position.y);
								if(currentPage && $(currentPage).parent().parent() && $(currentPage).parent().parent().hasClass("gd-page")) {
									var documentPage = $(currentPage).parent().parent()[0];
									draggableSignaturePosition.left = position.x - $(documentPage).offset().left - ($(sign)[0].clientWidth / 2);
									draggableSignaturePosition.top = position.y - $(documentPage).offset().top - ($(sign)[0].clientHeight / 2);
                                    var id = $(currentPage).parent().parent().attr("id").replace(/[^\d.]/g, '');
                                    var pageNumber = parseInt(id);
									selectSignature(sign, pageNumber);
								} else {
                                    $(this)[0].style = 'position: relative';
                                }
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
                        if (!confirm("Do you want to delete?")) {
                            return false;
                        }
                        deleteSignatureFile(signatureGuid);
                    });
                }
            });

            // check if document was changed
            if (currentDocumentGuid != documentGuid) {
                // if changed - drop signatures from previous signing
                signaturesList = [];
                signatureImageIndex = 0;
                currentDocumentGuid = documentGuid;
            }
        },
        error: function (xhr, status, error) {
            // hide loading spinner
            fadeLeftBar(false);
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.message);
            // open error popup
            toggleModalDialog(false, "");
            printMessage(err.message);
        }
    }).done(function (data) {
        if (typeof callback == "function") {
            callback(data);
        }
    });
}

function getMousePosition(event) {
    var mouse = {
        x: 0,
        y: 0
    };
    var ev = event || window.event; //Moz || IE
    if (ev.pageX || ev.touches[0].pageX) { //Moz
        mouse.x = (typeof ev.pageX != "undefined" && ev.pageX != 0) ? ev.pageX : ev.touches[0].pageX;
        mouse.y = (typeof ev.pageY != "undefined" && ev.pageY != 0) ? ev.pageY : ev.touches[0].pageY;
    } else if (ev.clientX) { //IE
        mouse.x = ev.clientX + document.body.scrollLeft;
        mouse.y = ev.clientY + document.body.scrollTop;
    }
    return mouse;
}

/**
 * Upload signature
 * @param {file} file - File for uploading
 * @param {int} index - Number of the file to upload
 * @param {string} url - URL of the file, set it if URL used instead of file
 */
function uploadSignature(file, index, url, callback) {
    // prepare form data for uploading
    var formData = new FormData();
    // add local file for uploading
    formData.append("file", file);
    if (typeof url == "undefined") {
        url = "";
    }
    // add URL if set
    formData.append("url", url);
    formData.append("signatureType", signature.signatureType);
    formData.append("rewrite", rewrite);
    $.ajax({
        type: 'POST',
        url: getApplicationPath('uploadDocument'),
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (returnedData) {
            if (returnedData.message != undefined) {
                toggleModalDialog(false, "");
                // open error popup
                printMessage(returnedData.message);
                return;
            }
        },
        error: function (xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.Message);
            toggleModalDialog(false, "");
            // open error popup
            printMessage(err.message);
        }
    }).done(function () {
        if (typeof callback == "function") {
            callback();
        }
    });
}

/**
 * Sign current document
 */
function sign(download) {
    $('#gd-modal-spinner').show();
    currentDocumentGuid = documentGuid;
    var documentType = getDocumentFormat(documentGuid).format;
    var data = {
        guid: documentGuid,
        password: password,
        signaturesData: signaturesList,
        documentType: documentType
    };
    if (download) {
        fadeAll(true);
        var request = new XMLHttpRequest();
        request.open('POST', getApplicationPath('downloadSigned'), true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.responseType = 'blob';

        request.onload = function() {
            fadeAll(false);
            // Only handle status code 200
            if(request.status === 200) {
                // Try to find out the filename from the content disposition `filename` value
                var filename = documentGuid.replace(/\\/g,"/").split('/').pop();
                // The actual download
                var blob = new Blob([request.response], { type: 'application/' + documentGuid.split('.').pop().toLowerCase() });
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = filename;
                // for ff we should append element and then remove it
                document.body.appendChild(link);

                link.click();

                document.body.removeChild(link);
            }
        };

        request.send(JSON.stringify(data));
    } else {
        var spinner = $('<div id="gd-modal-spinner" style="display:block;"><i class="fa fa-circle-o-notch fa-spin"></i> &nbsp;Loading... Please wait.</div>').show();
        toggleSuccessModalDialog(true, 'Signing document', spinner);
        // sign the document
        $.ajax({
            type: 'POST',
            url: getApplicationPath('sign'),
            data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: 'json',
            success: function (returnedData, status, request) {
                $('#gd-modal-spinner').hide();
                if (returnedData && returnedData.message != undefined) {
                    // open error popup
                    printMessage(returnedData.message);
                    return;
                }
                signedDocumentGuid = returnedData.guid;
                // prepare signing results HTML
                var result = '<div id="gd-modal-signed"><div class="check_mark">\n' +
                '  <div class="sa-icon sa-success animate">\n' +
                '    <span class="sa-line sa-tip animateSuccessTip"></span>\n' +
                '    <span class="sa-line sa-long animateSuccessLong"></span>\n' +
                '    <div class="sa-placeholder"></div>\n' +
                '    <div class="sa-fix"></div>\n' +
                '  </div>\n' +
                '</div></div>';
                // show signing results
                toggleSuccessModalDialog(true, 'Document signed', result);
				$('.gd-modal-close-action').on('click', function () {
					toggleSuccessModalDialog(false, 'Document signed', result)
					$('.gd-modal-close-action').off('click').click(closeModal);
				});
            },
            error: function (xhr, status, error) {
                $('#gd-modal-spinner').hide();
                var err = eval("(" + xhr.responseText + ")");
                console.log(err.Message);
                // open error popup
                printMessage(err.message);
            }
        });
    }
}


function toggleSuccessModalDialog(open, title, content) {

    if (open) {
        $('#modalDialog .gd-modal-title').text(title);
        $('#modalDialog')
            .addClass('success')
            .css('opacity', 0)
            .fadeIn('fast')
            .animate(
                { opacity: 1 },
                { queue: false, duration: 'fast' }
            );
        $('#modalDialog').addClass('in');
        $(".gd-modal-body").append(content);
    } else {
        $('#modalDialog').removeClass('in');
        $('#modalDialog').removeClass('success');
        $('#modalDialog')
            .css('opacity', 1)
            .fadeIn('fast')
            .animate(
                { opacity: 0 },
                { queue: false, duration: 'fast' }
            )
            .css('display', 'none');
        $(".gd-modal-body").html('');
    }
}
/**
 * Add digitally signed marker
 * @param {string} contact - digital signature comment
 */
function addDigitalMarker(contact){
	var marker = '<div class="gd-digital-marker">'+
				'<i class="fas fa-info-circle"></i>'+
				'<div>Digitaly signed : ' + contact + '</div>'+
			'</div>';
	$(".gd-page").each(function(index, page){
		$(page).append(marker);
	})
}

/**
 * Save drawn image signature
 * @param {string} image - Base64 encoded image
 */
function saveDrawnImage(image) {
    fadeAll(true);
	hideAllContextMenu();
    // current document guid is taken from the viewer.js globals
    var data = { image: image };
    // sign the document
    $.ajax({
        type: 'POST',
        url: getApplicationPath("saveImage"),
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (returnedData) {
            fadeAll(false);
            if (returnedData.message != undefined) {
                // open error popup
                printMessage(returnedData.message);
                return;
            }
            // load signatures from storage
            loadSignaturesTree('');
        },
        error: function (xhr, status, error) {
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
	hideAllContextMenu();
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
    stampData.reverse()
    $(".csg-preview").each(function (index, shape) {
        // calculate stamp real size and paddings
        var offset = biggestWidth - stampData[index].width;
        // crop canvas empty pixels
        if (offset != 0) {
            offset = offset / 2;
        }
        ctxCroped.drawImage(shape, offset, offset);
        // remove old canvases
        $(shape).remove();
    });
    // get image from canvas
    image = $("#gd-croped-stamp")[0].toDataURL("image/png");
    // prepare data for ajax
    stampData.reverse();
    var data = { image: image, stampData: stampData };
    // save the stamp image and xml description in the storage
    $.ajax({
        type: 'POST',
        url: getApplicationPath("saveStamp"),
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (returnedData) {
            fadeAll(false);
            if (returnedData.message != undefined) {
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
            toggleLightBox(false, "", "");
        },
        error: function (xhr, status, error) {
            fadeAll(false);
            toggleLightBox(false, "", "");
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.Message);
            // open error popup
            printMessage(err ? err.message : "Error");
        }
    }).done(function (data) {
        if (typeof callback == "function") {
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
    var data = { properties: properties };
    // sign the document
    $.ajax({
        type: 'POST',
        url: getApplicationPath("saveText"),
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (returnedData) {
            if (returnedData.message != undefined) {
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

            $.each(signaturesList, function (index, sign) {
                if (sign.signatureGuid == returnedData.imageGuid) {
                    var textField = $("#gd-draggable-helper-" + sign.id).find('#gd-text');
                    initCssForTextField(textField, properties);
                }
            });

            if ($('#gd-signature-context-panel')[0].style.display != 'none' &&
                $('#gd-text-sign')[0].className.indexOf('gd-tool-active') > 0) {
                signature.signatureType = 'text';
                loadSignaturesTree('');
            }
        },
        error: function (xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err ? err.message : error);
            // open error popup
            printMessage(err ? err.message : error);
        }
    }).done(function (data) {
        if (typeof callback == "function" && data) {
            callback(data);
        }
    });
}

function initCssForTextField(textField, properties) {
    textField.val(properties.text);
    textField.css("text-decoration", properties.underline ? "underline" : "unset");
    textField.css("font-style", properties.italic ? "italic" : "unset");
    textField.css("font-weight", properties.bold ? "bold" : "unset");
    textField.css("color", properties.fontColor);
    textField.css("font-family", properties.font);
    textField.css("font-size", properties.fontSize ? properties.fontSize + 'px' : '');
    textField.parent().parent().find(".gd-font-size").val(properties.fontSize);
}

/**
 * Get HTML content for signature information modal
 **/
function openDigitalPanel(currentCertificate) {
    var documentFormat = getDocumentFormat(documentGuid, false);
    var inputs = "";
    if ($(".gd-digital-inputs").length == 0) {
        var addActive = 'active';
        var signatureAdded = $.grep(signaturesList, function (obj) { return obj.signatureGuid == signature.signatureGuid; });
        if (signatureAdded && signatureAdded.length > 0 && signatureAdded[0]) {
            addActive= '';
        }
        // generate signature information imputs for depending from current document type
        if (documentFormat.format.indexOf("Portable Document") >= 0) {
            inputs = '<div class="gd-digital-inputs">' +
				'<div class="gd-digital-input-wrapper">'+
					'<i class="fas fa-comment"></i>' +
					'<input id="gd-reason" type="text" placeholder="Reason" > ' +
				'</div>'+
				'<div class="gd-digital-input-wrapper">'+
					'<i class="fas fa-envelope"></i>' +
					'<input id="gd-contact" type="text" placeholder="Contact">' +
				'</div>'+
				'<div class="gd-digital-input-wrapper">'+
					'<i class="fas fa-map-marker-alt"></i>' +
					'<input id="gd-location" type="text" placeholder="Location">' +
				'</div>'+
				'<div class="gd-digital-input-wrapper">'+
					'<i class="fas fa-key"></i>' +
					'<input id="gd-signature-password" type="password" placeholder="Password">' +
				'</div>'+
				'<div class="gd-digital-input-wrapper">'+
					'<i class="fa fa-calendar" aria-hidden="true"></i>' +
					'<input type="text" id="gd-datepicker" placeholder="Date">' +
				'</div>'+
                '<div id="gd-sign-digital" class="gd-sign-digital ' + addActive + '">Sign</div>' +
                '</div>';
        } else if (documentFormat.format.indexOf("Word") >= 0 || documentFormat.format.indexOf("Excel") >= 0) {
            inputs = '<div class="gd-digital-inputs">' +
				'<div class="gd-digital-input-wrapper">'+
					'<i class="fas fa-comment"></i>' +
					'<input id="gd-signature-comment" type="text" placeholder="Comment" > ' +
				'</div>'+
				'<div class="gd-digital-input-wrapper">'+
					'<i class="fas fa-key"></i>' +
					'<input id="gd-signature-password" type="password" placeholder="Password">' +
				'</div>'+
				'<div class="gd-digital-input-wrapper">'+
					'<i class="fa fa-calendar" aria-hidden="true"></i>' +
					'<input type="text" id="gd-datepicker" placeholder="Date">' +
				'</div>'+
                '<div id="gd-sign-digital" class="gd-sign-digital ' + addActive + '">Sign</div>' +
                '</div>';
        } else {
            return;
        }
        $(currentCertificate).parent().append(inputs);
        $("#gd-datepicker").datepicker({ dateFormat: 'dd-mm-yy' });
        $("#gd-sign-digital").on(userMouseClick, function (e) {
            if ($(this).hasClass('active')) {
                setAdditionalInformation(e);
                if (!isMobile()) {
                    $('#gd-signature-context-panel').hide();
                } else {
                    hideMobileMenu();
                }
                signaturesList.push(signature);
                var digitalMarker = (signature.contact) ? signature.contact : signature.signatureComment;
                addDigitalMarker(digitalMarker);
                $('#gd-sign-digital').removeClass('active');
            }
        });
    } else {
        $(".gd-digital-inputs").remove();
    }
}

/**
 * Set signature additional information data
 */
function setAdditionalInformation(certificate) {
    // save entered signature data on add additional information step
    signature.reason = $("#gd-reason").val();
    signature.contact = $("#gd-contact").val();
    signature.address = $("#gd-location").val();
    signature.date = $("#gd-datepicker").val();
    signature.signaturePassword = $("#gd-signature-password").val();
    signature.signatureComment = $("#gd-signature-comment").val();
    signature.signatureGuid = $(certificate.target.parentElement.parentElement).find(".gd-signature-item").data("guid");
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
}

/**
 * Get selected signature image stream
 */
function loadSignatureImage(pageNumber) {
    if (!pageNumber) {
        pageNumber = getCurrentPageNumber();
    }
    // current document guid is taken from the viewer.js globals
    var data = { signatureType: signature.signatureType, guid: signature.signatureGuid, page: pageNumber, password: "" };
    fadeAll(true);
	hideAllContextMenu();
    // load signature image from the storage
    $.ajax({
        type: 'POST',
        url: getApplicationPath('loadSignatureImage'),
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (returnedData) {
            fadeAll(false);
            if (returnedData.message != undefined) {
                toggleModalDialog(false, "");
                // open error popup
                printMessage(returnedData.message);
                return;
            }
            // when ajax is done insert loaded image into the document page
            toggleModalDialog(false, "");
            // insert image over the selected document page
            initSignature(pageNumber);
            if ("text" == signature.signatureType) {
                insertText(returnedData.props, pageNumber);
            } else {
                insertImage(returnedData.data, pageNumber);
            }
        },
        error: function (xhr, status, error) {
            fadeAll(false);
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.Message);
            toggleModalDialog(false, "");
            // open error popup
            printMessage(err.message);
        }
    });
}

function insertText(properties, pageNumber, position) {
    if (!pageNumber) {
        pageNumber = getCurrentPageNumber();
    }
    hideAllContextMenu();
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
            addPositionClass = "gd-context-menu-bottom";
        } else {
            addPositionClass = "gd-context-menu-top";
        }
        draggableSignaturePosition = {};
    } else if (position) {
        style += 'left: ' + position.left + 'px; top: ' + position.top + 'px;';
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
    var signatureHtml = '<div id="gd-draggable-helper-' + signatureImageIndex + '"  class="gd-draggable-helper gd-signature" style="' + style + '" data-textMenuId="menu-gd-text-signature-' + signatureImageIndex + '">' +
        contextMenu +
            '<div id="gd-draw-text-' + signatureImageIndex + '" data-image-guid="' + imageGuid + '" class="gd-draw-text"/>' +
        resizeHandles +
        '';
    $("#gd-image-signature-" + signatureImageIndex).css('background-color', 'transparent');
    // add signature to the selected page
    $(signatureHtml).insertBefore($("#gd-page-" + pageNumber).find(".gd-wrapper")).delay(1000);

    setDraggableAndResizable(pageNumber);

    signature = {};

    $.fn.textGenerator.create("gd-draggable-helper-" + signatureImageIndex, "menu-gd-text-signature-" + signatureImageIndex);

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
    // enable dragging and resizing features for current image
    $("#gd-draggable-helper-" + currentImage).draggable({
        // set restriction for image dragging area to current document page
        containment: "#gd-page-" + pageNumber,
        cancel: 'select,option',
        create: function () {
            // initiate image positioning coordinates
            var signaturePos = $(this).position();
            updateSignatureProperties(signatureToEdit, null, null, Math.round(signaturePos.left), Math.round(signaturePos.top));
            triggerCopyDrag = true;
        },
        // action fired when dragging stopped
        stop: function () {
            var signaturePos = $(this).position();
            fixContextMenuTop($(this).find('.gd-context-menu'), signaturePos.top);
            // get image positioning coordinates after dragging
            updateSignatureProperties(signatureToEdit, null, null, Math.round(signaturePos.left), Math.round(signaturePos.top));
            if (triggerCopyDrag) {
                triggerCopyDrag = false;
                var signaturesToEdit = $.grep(signaturesList, function (obj) {
                    return obj.signatureGuid === signatureToEdit.signatureGuid && obj.id != signatureToEdit.id;
                });
                $.each(signaturesToEdit, function (index, signature) {
                    $("#gd-draggable-helper-" + signature.id).draggable("dragTo", {
                        left: signaturePos.left,
                        top: signaturePos.top
                    });
                });
                $(this).draggable("refreshTrigger");
            }
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
            if (signatureToEdit.imageHeight && signatureToEdit.imageHeight != 0 && (height == 0 || height < signatureToEdit.imageHeight)) {
                // use image height which was set at the saving step
                height = signatureToEdit.imageHeight;
            }
            $(event.target).css('width', width);
            $(event.target).css('height', height);
            updateSignatureProperties(signatureToEdit, Math.round(width), Math.round(height));
            setGridPosition(width, height);
            triggerCopyResize = true;
        },
        stop: function (event, image) {
            // set signature updated size and position
            updateSignatureProperties(signatureToEdit, Math.round(image.size.width), Math.round(image.size.height), Math.round(image.position.left), Math.round(image.position.top));
            setGridPosition(signatureToEdit.imageWidth, signatureToEdit.imageHeight);
            if (triggerCopyResize) {
                triggerCopyResize = false;
                var signaturesToEdit = $.grep(signaturesList, function (obj) {
                    return obj.signatureGuid === signatureToEdit.signatureGuid && obj.id != signatureToEdit.id;
                });
                $.each(signaturesToEdit, function (index, signature) {
                    $("#gd-draggable-helper-" + signature.id).resizable("resizeTo", {
                        height: signatureToEdit.imageHeight,
                        width: signatureToEdit.imageWidth
                    });
                });
                $(this).resizable("refreshTrigger");
            }
        }
    });
}

/**
 * Get selected signature image stream
 * @param {string} image - Base64 encoded image
 */
function insertImage(image, pageNumber, position) {
    if (!pageNumber) {
        pageNumber = getCurrentPageNumber();
    }
    hideAllContextMenu();
    // add current signature object into the list of signatures
    signaturesList.push(signature);
    // prepare index which will be used for specific image HTMl elements naming
    var currentImage = signatureImageIndex;
    // get HTML markup of the resize handles
    var resizeHandles = getHtmlResizeHandles();
    signature.id = currentImage;
    var style = "";
    var addPositionClass = "gd-context-menu-top";
    if (draggableSignaturePosition && draggableSignaturePosition.left && draggableSignaturePosition.top) {
        style = 'left: ' + draggableSignaturePosition.left + 'px; top: ' + draggableSignaturePosition.top + 'px;';
        if (draggableSignaturePosition.top < 10) {
            addPositionClass = "gd-context-menu-bottom";
        } else {
            addPositionClass = "gd-context-menu-top";
        }
        draggableSignaturePosition = {};
    } else if (position) {
        style += 'left: ' + position.left + 'px; top: ' + position.top + 'px;';
    } else {
        addPositionClass = "gd-context-menu-bottom";
    }
    var contextMenu = getContextMenu("gd-image-signature-" + currentImage, addPositionClass);
    // prepare signature image HTML
    var signatureHtml = '<div id="gd-draggable-helper-' + currentImage + '"  class="gd-draggable-helper gd-signature" style="' + style + '">' +
        contextMenu +
        '<image id="gd-image-signature-' + currentImage + '" class="gd-signature-image" src="' + dataImagePrefix + image + '" alt></image>' +
        resizeHandles +
        '</div>';
    $("#gd-image-signature-" + currentImage).css('background-color', 'transparent');
    // add signature to the selected page
    $(signatureHtml).insertBefore($("#gd-page-" + pageNumber).find(".gd-wrapper")).delay(1000);

    if (signature.signatureType == "image" && /Mobi/.test(navigator.userAgent)) {
        $(".gd-draggable-helper").css("width", "100%", "!important");
    }
    setDraggableAndResizable(pageNumber);
    // increase signature index
    signatureImageIndex = signatureImageIndex + 1;
    // drop the signature object
    signature = {};
}

function updateSignatureProperties(signatureToEdit, width, height, left, top) {
    if (typeof width != "undefined" & width != null) {
        signatureToEdit.imageWidth = width;
    }
    if (typeof height != "undefined" & height != null) {
        signatureToEdit.imageHeight = height;
    }
    if (typeof left != "undefined") {
        signatureToEdit.left = left;
    }
    if (typeof top != "undefined") {
        signatureToEdit.top = top;
    }
}

/**
 * Append context menu for signature
 * @param {int} signatureId - id number of the signature
 */
function getContextMenu(signatureId, addClass) {
    var contextMenuClass = "gd-context-menu" + (addClass ? " " + addClass : "");
    if (signature.signatureType == "text") {
        contextMenuClass = contextMenuClass + " gd-text-context-menu";
        if (isMobile()) {
            $('#gd-pages').append($.fn.textGenerator.getMenu(contextMenuClass, signatureId));
        }
    }
    var menuHtml = '<div id="gd-context-menu" class="' + contextMenuClass + '">';
    $.each(contextMenuButtons, function (index, button) {
        if (!isMobile() && signature.signatureType == "text" && index == 1) {
            menuHtml = menuHtml + $.fn.textGenerator.getMenu('', signatureId);
        }
        menuHtml = menuHtml + '<i class="' + button + '" data-id="' + signatureId + '"></i>'
    });
    menuHtml = menuHtml + '</div>';
    return menuHtml;
}

/**
 * Hide all context menu
 */
function hideAllContextMenu() {
    $(".gd-signature").each(function (index, element) {
        $(element).addClass("inactive");
    });
}


function showContextMenuFor(signature){
    signature.removeClass('inactive');
}


/**
 * Prepare fonts select HTML
 * @param {array} fonts - array of available fonts
 */
function getHtmlFontsSelect(fonts, id) {
    if (!fonts || fonts.length == 0) {
        fonts = $.fn.cssFonts();
    }
    var idParam = id ? 'id="' + id + '"' : "";
    var fontsSelect = '<select ' + idParam + ' class="gd-fonts-select font">';
    $.each(fonts, function (index, font) {
        fontsSelect = fontsSelect + '<option value="' + font + '">' + font + '</option>';
    });
    fontsSelect = fontsSelect + '</select>';
    return fontsSelect;
}


/**
 * Prepare font sizes select HTML
 */
function getHtmlFontSizeSelect(id) {
    var idParam = id ? 'id="' + id + '"' : "";
    return '<div ' + idParam + ' class="gd-font-size-input-wrapper">' +
        '<input class="gd-font-size" value="19">' +
        '<i class="fas fa-sort-up gd-font-size-plus"></i>' +
        '<i class="fas fa-sort-down gd-font-size-minus"></i>' +
        '</div>';
}

function getFonts() {
    $.ajax({
        type: 'GET',
        url: getApplicationPath("getFonts"),
        contentType: 'application/json',
        success: function (returnedData) {
            mergedFonts = [];
            var fonts = $.fn.cssFonts();
            $.each(fonts, function (index, font) {
                var existedFont = $.inArray(font, returnedData);
                if (existedFont != -1) {
                    mergedFonts.push(font);
                }
            });
            $.fn.stampGenerator.refreshFonts();
            $.fn.textGenerator.refreshFonts();
        },
        error: function (xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.Message);
        }
    });
}

/**
 * Get HTML of the resize handles - used to add resize handles to the added signature image
 */
function getHtmlResizeHandles(stampGenerator) {
	var handlesHtml = '<div class="ui-resizable-handle ui-resizable-ne"></div>' +
						'<div class="ui-resizable-handle ui-resizable-se"></div>' +
						'<div class="ui-resizable-handle ui-resizable-sw"></div>' +
						'<div class="ui-resizable-handle ui-resizable-nw"></div>';
	if(stampGenerator){
		handlesHtml = '<div class="ui-resizable-handle ui-resizable-se"></div>';
	}
    return handlesHtml;
}

/**
 * Set grid position
 * @param {int} width - Current signature image width
 * @param {int} height - Current signature image height
 */
function setGridPosition(width, height) {
    $('.ui-resizable-n').css('left', (width / 2 - 4) + 'px');
    $('.ui-resizable-e').css('top', (height / 2 - 4) + 'px');
    $('.ui-resizable-s').css('left', (width / 2 - 4) + 'px');
    $('.ui-resizable-w').css('top', (height / 2 - 4) + 'px');
}

/**
 * Download document
 * @param {Object} button - Clicked download button
 */
function download(button) {
    if ($(button).attr("id") == "gd-signed-download") {
        sign(true);
    } else {
        if (typeof documentGuid != "undefined" && documentGuid != "") {
            // Open download dialog
            window.location.assign(getApplicationPath("downloadDocument/?path=") + documentGuid);
        } else {
            // open error popup
            printMessage("Please open or sign document first");
        }
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
        fillLightBoxHeader(header);
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
        $("#gd-lightbox-header").html('');
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
(function ($) {
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
        init: function (options) {
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
                applicationPath: "http://localhost:8080/signature",
                enableRightClick: true
            };
            $('#element').viewer({
                applicationPath: options.applicationPath,
                defaultDocument: options.defaultDocument,
                htmlMode: false,
                preloadPageCount: options.preloadPageCount,
                zoom: false,
                pageSelector: options.pageSelector,
                search: false,
                thumbnails: false,
                rotate: false,
                download: options.download,
                upload: options.upload,
                print: options.print,
                browse: options.browse,
                rewrite: options.rewrite,
                saveRotateState: false,
                enableRightClick: options.enableRightClick
            });
            $('#gd-header-logo').append(getHtmlHeaderForMobile());

            options = $.extend(defaults, options);

            getHtmlDownloadPanel();
            this.append(getHtmlLightboxBox);

            $(gd_navbar).append(getHtmlSavePanel);

            $(".wrapper").append(getHtmlLeftBarBase);

            if (options.textSignature) {
                $("#gd-signature-tools").append(getHtmlTextSignatureElement);
            }

            if (options.imageSignature) {
                $("#gd-signature-tools").append(getHtmlImageSignatureElement);
            }

            if (options.digitalSignature) {
                $("#gd-signature-tools").append(getHtmlDigitalSignatureElement);
            }

            if (options.qrCodeSignature) {
                $("#gd-signature-tools").append(getHtmlQrcodeSignatureElement);
            }

            if (options.barCodeSignature) {
                $("#gd-signature-tools").append(getHtmlBarcodeSignatureElement);
            }

            if (options.stampSignature) {
                $("#gd-signature-tools").append(getHtmlStampSignatureElement);
            }

            if (options.handSignature) {
                $("#gd-signature-tools").append(getHtmlHandSignatureElement);
            }

            if (options.downloadOriginal) {
                $("#gd-btn-download-value").append(getHtmlDownloadOriginalElement());
            }

            if (options.downloadSigned) {
                $("#gd-btn-download-value").append(getHtmlDownloadSignedElement());
            }
        }
    };

    /*
    ******************************************************************
    INIT PLUGIN
    ******************************************************************
    */
    $.fn.signature = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method' + method + ' does not exist on jQuery.signature');
        }
    };

     /*
    ******************************************************************
    FONT SIZE INPUT FILTER
    ******************************************************************
    */
    $.fn.inputFilter = function (inputFilter) {
        return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function () {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            }
        });
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
                        '<div class="gd-signature-context-pane-wrapper">'+
                            getHtmlUploadSignatures() +
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
                                '<div id="gd-signature-empty-list" class="gd-signature-empty-list">' +
                                '</div>' +
                            '</div>' +
                        '</div>'+
                    '</div>' +
                '</div>';
    }

    function getHtmlUploadSignatures() {
        return '<div id="gd-upload-signature" class="gd-upload-signature">' +
            '<div class="gd-signature-list-title">' +
                '<i class="fas fa-times" id="gd-close-upload-signature"></i>' +
                '<div id="gd-upload-panel-title" class="gd-signature-context-upload-title">Add signature</div>' +
            '</div>' +
            '<div id="gd-upload-container" class="gd-upload-container">' +
                '<div class="gd-upload-inputs">' +
                    '<input type="file" id="gd-upload-input" class="gd-upload-input"/>' +
                    '<i class="fas fa-file-upload"></i>' +
                    '<div id="gd-upload-title" class="gd-upload-title">Upload file</div>' +
                '</div>' +
                '<div id="gd-add-upload-file" class="gd-add-upload-file">Add</div>' +
            '</div>' +
            '</div>';
    }

    function getHtmlDownloadPanel() {
        var downloadBtn = $("#gd-btn-download");
        var downloadDropDown = '<li class="gd-nav-toggle" id="gd-download-val-container">' +
            '<span id="gd-download-value">' +
            '<i class="fa fa-download"></i>' +
            '<span class="gd-tooltip">Download</span>' +
            '</span>' +
            '<span class="gd-nav-caret"></span>' +
            '<ul class="gd-nav-dropdown-menu gd-nav-dropdown" id="gd-btn-download-value">' +
            // download types will be here
            '</ul>' +
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
		var closeIcon = '<span>&times;</span>';
		if (isMobile()) {
			closeIcon = '<i class="fas fa-arrow-left"></i>';
		}
        return '<div class="gd-modal-lightbox fade" id="lightBoxDialog">' +
            '<div class="gd-modal-dialog gd-modal-dialog-lightbox">' +
            '<div class="gd-modal-content" id="gd-lightbox-content">' +
            // header
            '<div class="gd-modal-header-lightbox">' +
            '<div class="gd-modal-header-title">' +
            '<div id="gd-modal-close-action" class="gd-lightbox-close">' + closeIcon + '</div>' +
            '<h4 id="gd-lightbox-title" class="gd-modal-title-lightbox"></h4>' +
            '</div>' +
            '<div id="gd-lightbox-header" class="gd-lightbox-header">' +
            // header custom HTMl will be here
            '</div>' +
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
$.widget("ui.resizable", $.ui.resizable, {
    resizeTo: function(newSize) {
        var start = new $.Event("mousedown", { pageX: 0, pageY: 0 });
        this._mouseStart(start);
        this.axis = 'se';
        var end = new $.Event("mouseup", {
            pageX: newSize.width - this.originalSize.width,
            pageY: newSize.height - this.originalSize.height
        });
        this._mouseDrag(end);
        this._mouseStop(end);
    },
    refreshTrigger: function () {
        triggerCopyResize = true;
    }
});
$.widget("ui.draggable", $.ui.draggable, {
    dragTo: function(newPosition) {
        var start = new $.Event("mousedown", { pageX: 0, pageY: 0 });
        this._mouseStart(start);
        var end = new $.Event("mouseup", {
            pageX: newPosition.left - this.position.left,
            pageY: newPosition.top - this.position.top
        });
        this._mouseDrag(end);
        this._mouseStop(end);
    },
    refreshTrigger: function () {
        triggerCopyDrag = true;
    }
});