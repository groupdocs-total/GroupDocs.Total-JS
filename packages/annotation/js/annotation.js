/**
 * groupdocs.annotation Plugin
 * Copyright (c) 2018 Aspose Pty Ltd
 * Licensed under MIT.
 * @author Aspose Pty Ltd
 * @version 1.9.0
 */

/*
******************************************************************
******************************************************************
GLOBAL VARIABLES
******************************************************************
******************************************************************
*/
var annotation = {
    id: "",
    type: "",
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    pageNumber: 0,
    svgPath: "",
    text: "",
    font: "Arial",
    fontSize: 10,
    comments: []
};
var annotationType = null;
var annotationsList = [];
var annotationsCounter = 0;
var rows = null;
var svgList = null;
var userMouseClick = ('ontouchstart' in document.documentElement)  ? 'touch click' : 'click';
var userMouseDown = ('ontouchstart' in document.documentElement)  ? 'mousedown touchstart' : 'mousedown';

$( document ).ajaxStart(function() {
    fadeAll(true);
});
$( document ).ajaxComplete(function( event, request, settings ) {
    fadeAll(false);
});
$(document).ready(function () {

    /*
    ******************************************************************
    NAV BAR CONTROLS
    ******************************************************************
    */
    var disable_click_flag = false;

    $(window).scroll(function () {
        disable_click_flag = true;

        clearTimeout($.data(this, 'scrollTimer'));

        $.data(this, 'scrollTimer', setTimeout(function () {
            disable_click_flag = false;
        }, 250));
    });

    //////////////////////////////////////////////////
    // Disable default print event
    //////////////////////////////////////////////////
    $('#gd-btn-print').off(userMouseClick);	

    //////////////////////////////////////////////////
    // Add SVG to all pages DIVs
	//////////////////////////////////////////////////
	$.initialize(".gd-page-image", function () {
        // ensure that the closed comments tab doesn't
        // have active class when another document is opened
        if (isCommentsPanelOpened()) {
            closeCommentsPanel();
        }
        // set text rows data to null
        rows = null;
        // append svg element to each page, this is required to draw svg based annotations
        addSvgContainer();		
        if(isMobile() && !/Edge/.test(navigator.userAgent)){
            setZoomLevel("Fit Width");
        }
		hideNotSupportedAnnotations(documentData.supportedAnnotations);
        //check if document contains annotations
        if ($(this).parent().parent().attr("id").search("thumbnails") == -1) {
            var pages = documentData.pages;
            for (var i = 0; i < pages.length; i++) {
                var page = pages[i];
                if (page.annotations != null && page.annotations.length > 0) {
                    $.each(page.annotations, function (index, annotationData) {
                        if (annotationData != null && annotationData.pageNumber == page.number && annotationData.imported != true) {							
							importAnnotation(annotationData);
							annotationData.imported = true;							
                        }
                    });
                }
            }
        }
    });   

    //////////////////////////////////////////////////
    // Open document event
    //////////////////////////////////////////////////
    $('.gd-modal-body').on(userMouseClick, '.gd-filetree-name', function (e) {
        annotationsList = [];
        svgList = null;
		if (disable_click_flag) {
            // make annotations list empty for the new document
            clearComments();
            var isDir = $(this).parent().find('.fa-folder').hasClass('fa-folder');
            if (isDir) {
                // if directory -> browse
                if (currentDirectory.length > 0) {
                    currentDirectory = currentDirectory + "/" + $(this).text();
                } else {
                    currentDirectory = $(this).text();
                }
                toggleModalDialog(false, '');
                loadFileTree(currentDirectory);
            } else {
                // if document -> open
                clearPageContents();
                documentGuid = $(this).attr('data-guid');
                toggleModalDialog(false, '');
                loadDocument(function (data) {
                    // Generate thumbnails
                    generatePagesTemplate(data, data.length);
                });
            }
        }
    });

    //////////////////////////////////////////////////
    // activate currently selected annotation tool
    //////////////////////////////////////////////////
    $('.gd-tools-container').on(userMouseClick, function (e) {
        e.preventDefault();
		e.stopPropagation();
        $('.gd-tool-field').removeClass('active');
        annotationType = null;
        // TODO : cancel on toolbar click
    });

    $('.gd-tool-field').on(userMouseClick, function(e){
        e.preventDefault();
		e.stopPropagation();
        var tool = $(e.target);

        if (tool.hasClass("active")) {
            disableDrawingModeFor(tool);
        }else{
            enableDrawingModeFor(tool);
        }
    });

    //////////////////////////////////////////////////
    // add annotation event
    //////////////////////////////////////////////////	
    $('#gd-panzoom').on(userMouseDown, 'svg', function (e) {
        globalBlur();
        if($("#gd-panzoom").find("svg").length == 0 && svgList == null){
			addSvgContainer();
	    }		
        if ($(e.target).prop("tagName") == "IMG" || $(e.target).prop("tagName") == "svg") {
            // initiate annotation object if null
            if (annotation == null) {
                annotation = {
                    id: "",
                    type: "",
                    left: 0,
                    top: 0,
                    width: 0,
                    height: 0,
                    pageNumber: 0,
                    svgPath: "",
                    text: "",
                    font: "Arial",
                    fontSize: 10,
                    comments: []
                };
            }
            // set annotation type
            annotation.type = annotationType;
            annotation.pageNumber = parseInt($($(e.target).parent()[0]).attr("id").replace(/[^\d.]/g, ''));
            // add annotation			
            switch (annotationType) {
                case "text":
                    ++annotationsCounter;                    
					$.fn.drawTextAnnotation($(e.target).parent()[0], annotationsList, annotation, annotationsCounter, "text", e);
					annotation = null;                   
                    break;
                case "area":
                    ++annotationsCounter;
                    $.fn.drawTextAnnotation($(e.target).parent()[0], annotationsList, annotation, annotationsCounter, "area", e);
                    annotation = null;
                    break;
                case "point":
                    ++annotationsCounter;
                    $.fn.drawSvgAnnotation($(e.target).parent()[0], "point");
                    $.fn.drawSvgAnnotation.drawPoint(e);
                    annotation = null;
                    break;
                case "textStrikeout":
                    ++annotationsCounter;                   
					$.fn.drawTextAnnotation($(e.target).parent()[0], annotationsList, annotation, annotationsCounter, "textStrikeout", e);
					annotation = null;                  
                    break;
                case "polyline":
                    ++annotationsCounter;
                    $.fn.drawSvgAnnotation($(e.target).parent()[0], "polyline");
                    $.fn.drawSvgAnnotation.drawPolyline(e);
                    annotation = null;
                    break;
                case "textField":
                    ++annotationsCounter;
                    annotation.fontSize = 20;
                    $.fn.drawTextAnnotation($(e.target).parent()[0], annotationsList, annotation, annotationsCounter, "textField", e);
                    annotation = null;
                    break;
                case "watermark":
                    ++annotationsCounter;
                    annotation.fontSize = 40;
                    $.fn.drawTextAnnotation($(e.target).parent()[0], annotationsList, annotation, annotationsCounter, "watermark", e);
                    annotation = null;
                    break;
                case "textReplacement":
                    ++annotationsCounter;                    
					$.fn.drawTextAnnotation($(e.target).parent()[0], annotationsList, annotation, annotationsCounter, "textReplacement", e);
					annotation = null;                   
                    break;
                case "arrow":
                    ++annotationsCounter;
                    $.fn.drawSvgAnnotation($(e.target).parent()[0], "arrow");
                    $.fn.drawSvgAnnotation.drawArrow(e);
                    annotation = null;
                    break;
                case "textRedaction":
                    ++annotationsCounter;                   
					$.fn.drawTextAnnotation($(e.target).parent()[0], annotationsList, annotation, annotationsCounter, "textRedaction", e);
					annotation = null;                    
                    break;
                case "resourcesRedaction":
                    ++annotationsCounter;
                    $.fn.drawTextAnnotation($(e.target).parent()[0], annotationsList, annotation, annotationsCounter, "resourcesRedaction", e);
                    annotation = null;
                    break;
                case "textUnderline":
                    ++annotationsCounter;                    
					$.fn.drawTextAnnotation($(e.target).parent()[0], annotationsList, annotation, annotationsCounter, "textUnderline", e);
					annotation = null;                    
                    break;
                case "distance":
                    ++annotationsCounter;
                    $.fn.drawSvgAnnotation($(e.target).parent()[0], "distance");
                    $.fn.drawSvgAnnotation.drawDistance(e);
                    annotation = null;
                    break;
            }
            // enable save button on the dashboard
            if ($("#gd-nav-save").hasClass("gd-save-disabled")) {
                $("#gd-nav-save").removeClass("gd-save-disabled");
                $("#gd-nav-save").on('click', function () {
                    annotate();
                });
            }
        }
    });

    //////////////////////////////////////////////////
    // delete annotation event
    //////////////////////////////////////////////////
    $('#gd-panzoom').on(userMouseClick, '.gd-delete-comment', function (e) {
        //e.stopPropagation();
		deleteAnnotation(e);
		clearComments();
    });

    //////////////////////////////////////////////////
    // Close comments panel event
    //////////////////////////////////////////////////
    $('.gd-annotations-comments-header div.close').click(function () {
        closeCommentsPanel();
    });
    $('.gd-add-comment-action').click(function(){
        openCommentForm();
    });
    $('.gd-comments-cancel-action').click(function () {
        closeCommentForm();
    });
    //////////////////////////////////////////////////
    // comments icon click event
    //////////////////////////////////////////////////
    $('#gd-panzoom').on(userMouseClick, '.gd-comments', function (e) {
        //e.stopPropagation();
        var commentsDrawer = $(".gd-annotations-comments-wrapper");
        if (e.target.tagName != "INPUT" && e.target.tagName != "TEXTAREA") {
            if (typeof $(e.target).parent().parent().data("id") != "undefined") {
                // get cuurent annotation id
                var annotationId = parseInt($(e.target).parent().parent().data("id").replace(/[^\d.]/g, ''));
                var annotationToAddComments = $.grep(annotationsList, function (obj) { return obj.id === annotationId; })[0];
                addComment(annotationToAddComments);
                commentsDrawer.data('id', annotationId);
                if(commentsDrawer.data('id')){
                    openCommentsPanel()
                }
            }
        }
    });    

    //////////////////////////////////////////////////
    // Comment form submit event
    //////////////////////////////////////////////////
	$('#gd-reply-form').submit(saveReply);
	
	//////////////////////////////////////////////////
    // Print event
    //////////////////////////////////////////////////
	 $('#gd-btn-print-value > li').on(userMouseClick, function (e) {
        printAnnotated($(this));
    });    
});

/*
******************************************************************
FUNCTIONS
******************************************************************
*/

/**
 * Get current mouse coordinates
 * @param {Object} event - click event
 */
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
 * Annotate current document
 */
function annotate(print) {
    // set current document guid - used to check if the other document were opened
    var url = getApplicationPath('annotate');
    var annotationsToAdd = [];
    $.each(annotationsList, function (index, annotationToAdd) {        
	   annotationsToAdd.push(annotationToAdd);        
    });
    // current document guid is taken from the viewer.js globals
    var data = {
        guid: documentGuid.replace(/\\/g, "//"),
        password: password,
        annotationsData: annotationsToAdd,
        documentType: getDocumentFormat(documentGuid).format,
		print: (typeof print != "undefined") ? true : false
    };
	if(print){
		// force each document page to be printed as a new page
		var cssPrint = '<style>' +           
				'.gd-page { display: block !important; height: 100% !important; page-break-after:always; page-break-inside: avoid; } .gd-page:last-child {page-break-after: auto;}'+		
		'</style>';	
		// open print dialog
		var windowObject = window.open('', "PrintWindow", "width=750,height=650,top=50,left=50,toolbars=yes,scrollbars=yes,status=yes,resizable=yes");
		// add current document into the print window
		windowObject.document.writeln(cssPrint);			
	}
    // annotate the document
    $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (returnedData) {
            $('#gd-modal-spinner').hide();
            var result = "";
            if (returnedData.message != undefined) {
                // if password for document is incorrect return to previouse step and show error
                if (returnedData.message.toLowerCase().indexOf("password") != -1) {
                    $("#gd-password-required").html(returnedData.message);
                    $("#gd-password-required").show();
                } else {
                    // open error popup
                    printMessage(returnedData.message);
                }
                return;
            }
            result = '<div id="gd-modal-annotated"><div class="check_mark">\n' +
                '  <div class="sa-icon sa-success animate">\n' +
                '    <span class="sa-line sa-tip animateSuccessTip"></span>\n' +
                '    <span class="sa-line sa-long animateSuccessLong"></span>\n' +
                '    <div class="sa-placeholder"></div>\n' +
                '    <div class="sa-fix"></div>\n' +
                '  </div>\n' +
                '</div></div>';
			if(print){
				var printHtml = "";
				for(i = 0; i < returnedData.pages.length; i++){
					printHtml = printHtml + '<div class="gd-page print"><image style="width: inherit !important" class="gd-page-image" src="data:image/png;base64,' + returnedData.pages[i].data + '" alt></image></div>';
				}				
				windowObject.document.writeln(printHtml);
				
				$(windowObject.document).ready(function() {
					windowObject.document.close();
					windowObject.focus();
					windowObject.print();
					windowObject.close();
				});
				
			} else {
				toggleSuccessModalDialog(true, 'Annotation', result);
				$('.gd-modal-close-action').on('click', function () {
					toggleSuccessModalDialog(false, 'Annotation', result)
					$('.gd-modal-close-action').off('click').click(closeModal);
				});
			}
        },
        error: function (xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            // open error popup
            printMessage(err.message);
        }
    });
}

/**
 * delete annotation
 * @param {Object} event - delete annotation button click event data
 */
function deleteAnnotation(event) {
    if (!confirm("Do you want to delete?")){
        return false;
    }
    // get annotation id
    var annotationId = $(event.target).data("id");
    // get annotation data to delete
    var annotationToRemove = $.grep(annotationsList, function (obj) { return obj.id === annotationId; })[0];
    // delete annotation from the annotations list
    annotationsList.splice($.inArray(annotationToRemove, annotationsList), 1);
    // delete annotation from the page
    $(".gd-annotation").each(function (index, element) {
        var id = null;
        if ($(element).hasClass("svg")) {
            id = parseInt($(element).attr("id").replace(/[^\d.]/g, ''));
        } else {
            id = parseInt($(element).find(".annotation").attr("id").replace(/[^\d.]/g, ''));
        }
        if (id === annotationId) {
            if (typeof $(element).attr("id") != "undefined" && $(element).attr("id").search("distance") != -1) {
                // remove text element for distance annotation
                $.each($(element).parent().find("text"), function (index, text) {
                    if ($(text).data("id") == id) {
                        $(text).remove();
                    }
                });
            }
            $(element).remove();
			$.each($(".gd-bounding-box"), function(index, boundingBox){
				if($(boundingBox).data("id").search(id) != -1){
					$(boundingBox).remove();
				}
			});
        } else {
            return true;
        }
    });
    $("#gd-save-comments").addClass("gd-save-button-disabled");
}

function clearComments(){
    $(".gd-annotations-comments-body").html("");
}

function isCommentsPanelOpened(){
    return $(".gd-annotations-comments-wrapper").hasClass("active");
}

function openCommentsPanel(){
    var commentsDrawer = $(".gd-annotations-comments-wrapper");
    commentsDrawer.addClass('active');
}

function closeCommentsPanel(){
    var commentsDrawer = $(".gd-annotations-comments-wrapper");
    commentsDrawer.removeClass('active');
}

function openCommentForm(){
    $('.gd-annotations-comments-form').slideDown(100);
    $('.gd-comments-nonideal-state').hide();
}

function closeCommentForm(){
    var annotationId = parseInt($('.gd-annotations-comments-wrapper').data('id'));
    var annotationToAddComments = $.grep(annotationsList, function (obj) { return obj.id === annotationId; })[0];
    $('.gd-annotations-comments-form').slideUp(100,function(){
        if(annotationToAddComments.comments.length === 0){
            $('.gd-comments-nonideal-state').show();
        }
    });
}

function resetCommentForm(){
    $('#gd-reply-form').get(0).reset();
}

function enableDrawingModeFor(tool){
    $('.gd-tool-field').removeClass('active');
    tool.addClass("active");
    annotationType = tool.data("type");
    $('#gd-panzoom').addClass("drawing");
}

function disableDrawingModeFor(tool){
    tool.removeClass("active");
    annotationType = null;
    $('#gd-panzoom').removeClass("drawing");
}
function getRectangleFromPath(path){
    var leftTop = {
        x : Number.MAX_VALUE,
        y : Number.MAX_VALUE
    };
    var rightBottom = {
        x : Number.MIN_VALUE,
        y : Number.MIN_VALUE
    };
    for(var idx in path){
        leftTop.x = (path[idx].x < leftTop.x) ? path[idx].x : leftTop.x;
        leftTop.y = (path[idx].y < leftTop.y) ? path[idx].y : leftTop.y;
        rightBottom.x = (path[idx].x >= rightBottom.x) ? path[idx].x : rightBottom.x;
        rightBottom.y = (path[idx].y >= rightBottom.y) ? path[idx].y : rightBottom.y;
    }
    return {
        left  : leftTop.x,
        top   : leftTop.y,
        width : rightBottom.x - leftTop.x,
        height: rightBottom.y - leftTop.y
    }
}
function convertPairsToPoints(spaceSeparatedPoints){
    var pairs = spaceSeparatedPoints.split(' ');
    var points = [];
    for(var idx in pairs){
        var pair = pairs[idx].split(',');
        points.push({
            x : parseInt(pair[0]),
            y : parseInt(pair[1])
        })
    }
    return points;
}
/**
* Add comment into the comments bar
* @param {Object} currentAnnotation - currently added annotation
*/
function addComment(currentAnnotation) {
    clearComments();
    // check if annotation contains comments
    if (currentAnnotation && currentAnnotation.comments && currentAnnotation.comments.length > 0) {
        $.each(currentAnnotation.comments, function (index, comment) {
            var commentHtml = $(getCommentHtml(comment));
            commentHtml.hide();
            $(".gd-annotations-comments-body").prepend(commentHtml);
            commentHtml.fadeIn(500);
            $('.gd-comments-nonideal-state').hide();
        });
    } else {        
        currentAnnotation.comments = [];
        $('.gd-comments-nonideal-state').show();
    }
}
/**
 * Toggle modal dialog
 * @param {boolean} open - open/close value
 * @param {string} title - title to display in modal dialog (popup)
 */
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
function toggleContextFor(element){
    $('.gd-context-menu').hide();
    $('.gd-bounding-box').css('z-index',9);
    $('.ui-resizable-handle').hide();
    $('.gd-bounding-box.gd-active-annotation').removeClass('gd-active-annotation');
    $(element).find('.gd-context-menu').show();
    $(element).css('z-index',99999);
    $(element).closest('.gd-bounding-box').addClass('gd-active-annotation');
    $(element).find('.ui-resizable-handle').show();
}

function globalBlur(){
    $('.ui-resizable-handle').hide();
    $('.gd-bounding-box.gd-active-annotation').removeClass('gd-active-annotation');
    $('.gd-context-menu').hide();
}

/**
 * Make current annotation draggble and resizable
 * @param {Object} currentAnnotation - currently added annotation
 */
function makeResizable(currentAnnotation, html) {
    var annotationType = currentAnnotation.type;
    var element = $(html);

    toggleContextFor(element);
    $('.gd-context-menu').mousedown(function (e) {
        if(!$(e.target).hasClass('fa-arrows-alt')){
            e.stopPropagation();
        }
    });
    disableDrawingModeFor($('.gd-tool-field.active'));
    $(element).mousedown(function (e) {
        toggleContextFor(element);
        if(isCommentsPanelOpened() && currentAnnotation.id !== parseInt($(".gd-annotations-comments-wrapper").data('id'))){
            closeCommentForm();
            closeCommentsPanel();
        }
    });

    var previouseMouseX = 0;
    var previouseMouseY = 0;

    $(element).draggable({
        containment: "#gd-page-" + currentAnnotation.pageNumber,
        stop: function (event, image) {
            if (['text','textStrikeout','textUnderline'].indexOf(annotationType) >= 0) {               
                currentAnnotation.left = Math.ceil(image.position.left);
                currentAnnotation.top = Math.ceil(image.position.top);
                currentAnnotation.height = image.helper[0].clientHeight;
            } else if(['point','polyline','arrow','distance'].indexOf(annotationType) >= 0) {
                switch (annotationType) {
                    case "point":
                        currentAnnotation.left = $("#" + $(image.helper[0]).data("id")).attr("cx");
                        currentAnnotation.top = $("#" + $(image.helper[0]).data("id")).attr("cy");
                        break;
                    case "polyline":
                        currentAnnotation.svgPath = stopMovePolyline(image);
                        break;
                    case "arrow":
                        currentAnnotation.svgPath = stopMoveArrow(image);
                        break;
                    case "distance":
                        currentAnnotation.svgPath = stopMoveArrow(image);
                        break;
                }
            }else {
                currentAnnotation.left = Math.ceil(image.position.left);
                currentAnnotation.top = Math.ceil(image.position.top);
            }
        },
        drag: function (event, image) {
            var x = image.position.left;
            var y = image.position.top;
            var svgElement = $("#" + $(image.helper[0]).data("id"));
            var newCoordinates;
            var currentAnnotationPage = $("#gd-page-" + currentAnnotation.pageNumber);
            switch (annotationType) {
                case "point":
                    x = x + ($(image.helper[0]).width() / 2);
                    y = y + ($(image.helper[0]).height() / 2);
                    svgElement.attr("cx", x);
                    svgElement.attr("cy", y);
                    break;
                case "polyline":
                    newCoordinates = movePolyline(image, x, y, previouseMouseX, previouseMouseY);
                    previouseMouseX = x;
                    previouseMouseY = y;
                    svgElement.attr("points", $.trim(newCoordinates));
                    break;
                case "arrow":
                    newCoordinates = moveArrow(image, x, y, currentAnnotationPage);
                    svgElement.attr("d", "M" + $.trim(newCoordinates).replace(" ", " L"));
                    break;
                case "distance":
                    newCoordinates = moveDistance(image, x, y, currentAnnotationPage);
                    svgElement.attr("d", "M" + $.trim(newCoordinates).replace(" ", " L"));
                    break;
            }
        }
    }).resizable({
        // set restriction for image resizing to current document page
        containment: "#gd-page-" + currentAnnotation.pageNumber,
        stop: function (event, image) {
            currentAnnotation.width = image.size.width;
            currentAnnotation.height = image.size.height;
            currentAnnotation.left = image.position.left;
            currentAnnotation.top = image.position.top;
        },
        // set image resize handles
        handles: {
            'ne': '.ui-resizable-ne',
            'se': '.ui-resizable-se',
            'sw': '.ui-resizable-sw',
            'nw': '.ui-resizable-nw'
        },
        resize: function (event, image) {
            $(event.target).find(".gd-" + annotationType + "-annotation").css("width", image.size.width);
            $(event.target).find(".gd-" + annotationType + "-annotation").css("height", image.size.height);
            $(event.target).find(".gd-" + annotationType + "-annotation").css("left", image.position.left);
            $(event.target).find(".gd-" + annotationType + "-annotation").css("top", image.position.top);
        }
    });
}

/**
 * Set updated SVG path coordinates when arrow annotation move is finish
 * @param {Object} image - current arrow object
 */
function stopMoveArrow(image){
	var svgPath = "M";	
	$.each($("#" + $(image.helper[0]).data("id")).attr("d").split(" "), function (index, point) {
		svgPath = svgPath + parseInt(point.split(",")[0].replace(/[^\d.]/g, '')).toFixed(0) + "," + parseInt(point.split(",")[1].replace(/[^\d.]/g, '')).toFixed(0) + " ";		
	});	
	return svgPath;							
}

/**
 * Set updated SVG path coordinates when polyline annotation move is finish
 * @param {Object} image - current polyline object
 */
function stopMovePolyline(image){
	var svgPath = "M";
	var previousX = 0;
	var previousY = 0;
	$.each($("#" + $(image.helper[0]).data("id")).attr("points").split(" "), function (index, point) {
		if (index == 0) {
			svgPath = svgPath + point.split(",")[0] + "," + point.split(",")[1] + "l";
		} else {
			previousX = point.split(",")[0] - previousX;
			previousY = point.split(",")[1] - previousY;
			svgPath = svgPath + previousX + "," + previousY + "l";
		}
		previousX = point.split(",")[0];
		previousY = point.split(",")[1];
	});	
	return svgPath.slice(0,-1);							
}

/**
 * recalculate SVG path coordinates when polyline annotation move
 * @param {Object} image - current polyline object
 * @param {int} x - current mouse position X
 * @param {int} y - current mouse position Y
 * @param {int} previouseMouseX - previouse mouse position X
 * @param {int} previouseMouseY - previouse mouse position Y
 */
function movePolyline(image, x, y, previouseMouseX, previouseMouseY){
	var newCoordinates = "";
	var offsetX = 0;
	var	offsetY = 0;
	if(previouseMouseX == 0){	
		offsetX = 0;		
	} else {
		offsetX = x - previouseMouseX;		
	}	
	if(previouseMouseY == 0){
		offsetY = 0;
	} else {
		offsetY = y - previouseMouseY;
	}
	$.each($("#" + $(image.helper[0]).data("id")).attr("points").split(" "), function(index, coordinates){								
		var currentX = parseInt(coordinates.split(",")[0].replace(/[^\d.]/g, '')) + offsetX;								
		var	currentY = parseInt(coordinates.split(",")[1].replace(/[^\d.]/g, '')) + offsetY;
		newCoordinates = newCoordinates + currentX + "," + currentY + " ";								
	});
	return newCoordinates;	
}

/**
 * recalculate SVG path coordinates when polyline annotation move
 * @param {Object} image - current polyline object
 * @param {int} x - current mouse position X
 * @param {int} y - current mouse position Y
 * @param {int} previouseMouseX - previouse mouse position X
 * @param {int} previouseMouseY - previouse mouse position Y
 */
function moveArrow(image, x, y, canvas){	 
	var newCoordinates = "";	
	var offsetX = 0;
	var	offsetY = 0;
	var firstPointX = parseInt($("#" + $(image.helper[0]).data("id")).attr("d").split(" ")[0].split(",")[0].replace(/[^\d.]/g, ''));
	var firstPointY = parseInt($("#" + $(image.helper[0]).data("id")).attr("d").split(" ")[0].split(",")[1].replace(/[^\d.]/g, ''));	
	var secondPointX = parseInt($("#" + $(image.helper[0]).data("id")).attr("d").split(" ")[1].split(",")[0].replace(/[^\d.]/g, ''));
	var secondPointY = parseInt($("#" + $(image.helper[0]).data("id")).attr("d").split(" ")[1].split(",")[1].replace(/[^\d.]/g, ''));
	if(x != 0 && x < $(canvas).outerWidth()) {
		if(firstPointX > secondPointX){
			offsetX = (x + image.helper[0].offsetWidth) - firstPointX;
		} else {
			offsetX = (x + 5) - firstPointX;
		}
	}
	if(y != 0) {
		if(firstPointY > secondPointY){
			offsetY = (y + image.helper[0].offsetHeight) - firstPointY;
		} else {
			offsetY = (y + 5) - firstPointY;
		}
	}	
	$.each($("#" + $(image.helper[0]).data("id")).attr("d").split(" "), function(index, coordinates){								
		var currentX = parseInt(coordinates.split(",")[0].replace(/[^\d.]/g, '')) + offsetX;								
		var	currentY = parseInt(coordinates.split(",")[1].replace(/[^\d.]/g, '')) + offsetY;
		newCoordinates = newCoordinates + currentX + "," + currentY + " ";								
	});	
	return newCoordinates;	
}

/**
 * recalculate SVG path coordinates when polyline annotation move
 * @param {Object} image - current polyline object
 * @param {int} x - current mouse position X
 * @param {int} y - current mouse position Y
 * @param {int} previouseMouseX - previouse mouse position X
 * @param {int} previouseMouseY - previouse mouse position Y
 */
function moveDistance(image, x, y, canvas){	 
	var newCoordinates = "";	
	var offsetX = 0;
	var	offsetY = 0;
	var firstPointX = parseInt($("#" + $(image.helper[0]).data("id")).attr("d").split(" ")[0].split(",")[0].replace(/[^\d.]/g, ''));
	var firstPointY = parseInt($("#" + $(image.helper[0]).data("id")).attr("d").split(" ")[0].split(",")[1].replace(/[^\d.]/g, ''));		
	var secondPointX = parseInt($("#" + $(image.helper[0]).data("id")).attr("d").split(" ")[1].split(",")[0].replace(/[^\d.]/g, ''));
	var secondPointY = parseInt($("#" + $(image.helper[0]).data("id")).attr("d").split(" ")[1].split(",")[1].replace(/[^\d.]/g, ''));
	if(x != 0 && x < $(canvas).outerWidth()) {
		if(firstPointX > secondPointX){
			offsetX = (x + image.helper[0].offsetWidth - 25) - firstPointX;
		} else {
			offsetX = (x + 25) - firstPointX;
		}
	}
	if(y != 0) {
		if(firstPointY > secondPointY){
			offsetY = (y + image.helper[0].offsetHeight - 25) - firstPointY;
		} else {
			offsetY = (y + 25) - firstPointY;
		}
	}		
	$.each($("#" + $(image.helper[0]).data("id")).attr("d").split(" "), function(index, coordinates){								
		var currentX = parseInt(coordinates.split(",")[0].replace(/[^\d.]/g, '')) + offsetX;								
		var	currentY = parseInt(coordinates.split(",")[1].replace(/[^\d.]/g, '')) + offsetY;
		newCoordinates = newCoordinates + currentX + "," + currentY + " ";								
	});	
	$($("#" + $(image.helper[0]).data("id")).next("text").find("textPath").attr("href")).attr("d", "M" + $.trim(newCoordinates).replace(" ", " L"));	
	return newCoordinates;	
}


/**
 * Import already existed annotations
 * @param {Object} annotationData - existed annotation
 */
function importAnnotation(annotationData) {
    annotation = annotationData;
    // draw imported annotation over the document page
    switch (annotation.type) {
        case "text":
            ++annotationsCounter;
            $.fn.importTextAnnotation($("#gd-page-" + annotationData.pageNumber)[0], annotationsList, annotation, annotationsCounter, "text");
            annotation = null;
            break;
        case "area":
            ++annotationsCounter;
            $.fn.importTextAnnotation($("#gd-page-" + annotationData.pageNumber)[0], annotationsList, annotation, annotationsCounter, "area");
            annotation = null;
            break;
        case "point":
            ++annotationsCounter;
            $.fn.drawSvgAnnotation($("#gd-page-" + annotationData.pageNumber)[0], "point");
            $.fn.drawSvgAnnotation.importPoint(annotation);
            annotation = null;
            break;
        case "textStrikeout":
            ++annotationsCounter;
            $.fn.importTextAnnotation($("#gd-page-" + annotationData.pageNumber)[0], annotationsList, annotation, annotationsCounter, "textStrikeout");
            annotation = null;
            break;
        case "polyline":
            ++annotationsCounter;
            $.fn.drawSvgAnnotation($("#gd-page-" + annotationData.pageNumber)[0], "polyline");
            $.fn.drawSvgAnnotation.importPolyline(annotation);
            annotation = null;
            break;
        case "textField":
            ++annotationsCounter;
            $.fn.importTextAnnotation($("#gd-page-" + annotationData.pageNumber)[0], annotationsList, annotation, annotationsCounter, "textField");
            annotation = null;
            break;
        case "watermark":
            ++annotationsCounter;
            $.fn.importTextAnnotation($("#gd-page-" + annotationData.pageNumber)[0], annotationsList, annotation, annotationsCounter, "watermark");
            annotation = null;
            break;
        case "textReplacement":
            ++annotationsCounter;
            $.fn.importTextAnnotation($("#gd-page-" + annotationData.pageNumber)[0], annotationsList, annotation, annotationsCounter, "textReplacement");
            annotation = null;
            break;
        case "arrow":
            ++annotationsCounter;
            $.fn.drawSvgAnnotation($("#gd-page-" + annotationData.pageNumber)[0], "arrow");
            $.fn.drawSvgAnnotation.importArrow(annotation);
            annotation = null;
            break;
        case "textRedaction":
            ++annotationsCounter;
            $.fn.importTextAnnotation($("#gd-page-" + annotationData.pageNumber)[0], annotationsList, annotation, annotationsCounter, "textRedaction");
            annotation = null;
            break;
        case "resourcesRedaction":
            ++annotationsCounter;
            $.fn.importTextAnnotation($("#gd-page-" + annotationData.pageNumber)[0], annotationsList, annotation, annotationsCounter, "resourcesRedaction");
            annotation = null;
            break;
        case "textUnderline":
            ++annotationsCounter;
            $.fn.importTextAnnotation($("#gd-page-" + annotationData.pageNumber)[0], annotationsList, annotation, annotationsCounter, "textUnderline");
            annotation = null;
            break;
        case "distance":
            ++annotationsCounter;
            $.fn.drawSvgAnnotation($("#gd-page-" + annotationData.pageNumber)[0], "distance");
            $.fn.drawSvgAnnotation.importDistance(annotation);
            annotation = null;
            break;
    }
    // enable save button on the dashboard
    if ($("#gd-nav-save").hasClass("gd-save-disabled")) {
        $("#gd-nav-save").removeClass("gd-save-disabled");
        $("#gd-nav-save").on('click', function () {
            annotate();
        });
    }
}

/**
 * Get HTML of the resize handles - used to add resize handles to the added annotation
 */
function getHtmlResizeHandles() {
    return '<div class="ui-resizable-handle ui-resizable-ne"></div>' +
        '<div class="ui-resizable-handle ui-resizable-se"></div>' +
        '<div class="ui-resizable-handle ui-resizable-sw"></div>' +
        '<div class="ui-resizable-handle ui-resizable-nw"></div>';
}

function getCommentHtml(comment) {
    var time = (typeof comment.time != "undefined") ? comment.time : "";
    var text = (typeof comment.text != "undefined") ? comment.text : "";
    var userName = (typeof comment.userName != "undefined") ? comment.userName : "";	

    return '<div class="gd-annotation-comment">' +
                '<div class="gd-comment-avatar">' +
                    '<div class="gd-comment-userpic">' +
                        '<i class="fas fa-lg fa-user-circle"></i>' +
                    '</div>' +
                    '<div class="gd-comment-username">' +
                        userName +
                    '</div>' +
                '</div>' +
                '<div class="gd-comment-content">' +
                    text +
                '</div>'+
                '<div class="gd-comment-footer">' +
                    '<div class="gd-comment-toggle-reply"></div>' +
                    '<div class="gd-comment-created-at">'+$.timeago(new Date(time))+'</div>' +
                '</div>' +
            '</div>';
}



/**
 * Append SVG container to each document page
 */
function addSvgContainer(){
	$('div.gd-page').each(function (index, page) {
		$(page).css("zoom", "1");
		// initiate svg object
		if (svgList == null) {
			svgList = {};
		}
		if (page.id.indexOf("thumbnails") >= 0) {
			return true;
		} else {
			if (!(page.id in svgList) && $(page).find("svg").length == 0) {
				$(page).addClass("gd-disable-select");
				// add svg object to the list for further use
				var draw = SVG(page.id).size(page.offsetWidth, page.offsetHeight);
				svgList[page.id] = draw;
				draw = null;
			} else {
				return true;
			}
		}
	});
}

/**
 * Append context menu for annotation
 */
function getContextMenu(annotationId, editable){
	return '<div class="gd-context-menu hidden">' +
				'<i class="fas fa-arrows-alt fa-sm"></i>'+
                (editable ? '<i class="fas fa-i-cursor fa-sm gd-edit-text-field"></i>' : '') +
				'<i class="fas fa-trash-alt fa-sm gd-delete-comment" data-id="' + annotationId + '"></i>'+
				'<i class="fas fa-comments fa-sm gd-comments"></i>'+
			'</div>';
}

/**
 * Save current reply
 */
function saveReply(e){
    e.preventDefault();
    var nameField = $(e.target).find('#comment-name');
    var messageField = $(e.target).find('#comment-message');
    var annotationId = parseInt($('.gd-annotations-comments-wrapper').data('id'));
    var annotationToAddComments = $.grep(annotationsList, function (obj) { return obj.id === annotationId; })[0];
    var comment = {
        time: (new Date()).toUTCString(),
        text: messageField.val(),
        userName: nameField.val()
    };
    // check if the same comment is already added - used for import annotations
    var existedComment = $.grep(annotationToAddComments.comments, function (e) { return e.text.trim() == comment.text.trim(); });
    // add comment
    if (existedComment.length === 0) {
        annotationToAddComments.comments.push(comment);
    }
    addComment(annotationToAddComments);
    resetCommentForm();
    closeCommentForm();
    return false;
}

function hideNotSupportedAnnotations(supportedAnnotations){
	if(supportedAnnotations.length > 0){		 
		var allButtons = $("#gd-annotations-tools").find("button");
		$.each(allButtons, function(index, button){
			if($.inArray($(button).data("type"), supportedAnnotations) == -1){				
				$(button).parent().hide();
			} else {
				$(button).parent().show();
			}
		});		
	}
}

/**
* Print current document
*/
function printAnnotated(button) {
	var documentContainer = "";
	var cssPrint = "";
	if ($(button).attr("id") == "gd-annotated-print") {		
		annotate(print);
    } else {		
		documentContainer = $("#gd-panzoom");
		// force each document page to be printed as a new page
		cssPrint = '<style>' +           
				'.gd-page {height: 100% !important; page-break-after:always; page-break-inside: avoid; } .gd-page:last-child {page-break-after: auto;}';
		// set correct page orientation if page were rotated
		documentContainer.find(".gd-page").each(function (index, page) {
        if ($(page).css("transform") != "none") {
            cssPrint = cssPrint + "#" + $(page).attr("id") + "{transform: rotate(0deg) !important;}";
        }
		});
		cssPrint = cssPrint + '</style>';  
		// open print dialog
		var windowObject = window.open('', "PrintWindow", "width=750,height=650,top=50,left=50,toolbars=yes,scrollbars=yes,status=yes,resizable=yes");
		// add current document into the print window
		windowObject.document.writeln(cssPrint);
		// add current document into the print window
		$.each();
		windowObject.document.writeln(documentContainer[0].innerHTML);
		windowObject.document.close();
		windowObject.focus();
		windowObject.print();
		windowObject.close();
	}	
}

/*
******************************************************************
******************************************************************
GROUPDOCS.ANNOTATION PLUGIN
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
                textAnnotation: true,
                areaAnnotation: true,
                pointAnnotation: true,
                textStrikeoutAnnotation: true,
                polylineAnnotation: true,
                textFieldAnnotation: true,
                watermarkAnnotation: true,
                textReplacementAnnotation: true,
                arrowAnnotation: true,
                textRedactionAnnotation: true,
                resourcesRedactionAnnotation: true,
                textUnderlineAnnotation: true,
                distanceAnnotation: true,
                downloadOriginal: true,
                downloadAnnotated: true,
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
                    rewrite: options.rewrite
			});
            options = $.extend(defaults, options);
            
			getHtmlPrintPanel();
            $('#gd-navbar').append(getHtmlSavePanel);
            // assembly annotation tools side bar html base
            $(".wrapper").append(getHtmlAnnotationsBarBase);
            // assembly annotation comments side bar html base
            $(".wrapper").append(getHtmlAnnotationCommentsBase);

            // assembly annotations tools side bar
            if (options.textAnnotation) {
                $("#gd-annotations-tools").append(getHtmlTextAnnotationElement);
            }

			if (options.textStrikeoutAnnotation) {
                $("#gd-annotations-tools").append(getHtmlTextStrikeoutAnnotationElement);
            }
			
			if (options.textUnderlineAnnotation) {
                $("#gd-annotations-tools").append(getHtmlTextUnderlineAnnotationElement);
            }
			
			if (options.textReplacementAnnotation) {
                $("#gd-annotations-tools").append(getHtmlTextReplacementAnnotationElement);
            }
			
			if (options.textRedactionAnnotation) {
                $("#gd-annotations-tools").append(getHtmlTextRedactionAnnotationElement);
            }
			
			$("#gd-annotations-tools").append(getHtmlAnnotationSplitter);
			if (options.polylineAnnotation) {
                $("#gd-annotations-tools").append(getHtmlPolylineAnnotationElement);
            }
			
			if (options.arrowAnnotation) {
                $("#gd-annotations-tools").append(getHtmlArrowAnnotationElement);
            }
			
			if (options.distanceAnnotation) {
                $("#gd-annotations-tools").append(getHtmlDistanceAnnotationElement);
            }			
				
            if (options.areaAnnotation) {
                $("#gd-annotations-tools").append(getHtmlAreaAnnotationElement);
            }

			if (options.resourcesRedactionAnnotation) {
                $("#gd-annotations-tools").append(getHtmlResourcesRedactionAnnotationElement);
            }			
			
			$("#gd-annotations-tools").append(getHtmlAnnotationSplitter);
			if (options.textFieldAnnotation) {
                $("#gd-annotations-tools").append(getHtmlTextFieldAnnotationElement);
            }
			
			if (options.watermarkAnnotation) {
                $("#gd-annotations-tools").append(getHtmlWatermarkdAnnotationElement);
            }
			
			$("#gd-annotations-tools").append(getHtmlAnnotationSplitter);
            if (options.pointAnnotation) {
                $("#gd-annotations-tools").append(getHtmlPointAnnotationElement);
            }           
        }
    };

    /*
    ******************************************************************
    INIT PLUGIN
    ******************************************************************
    */
    $.fn.annotation = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method' + method + ' does not exist on jQuery.annotation');
        }
    };

    /*
    ******************************************************************
    HTML MARKUP
    ******************************************************************
    */
    function getHtmlAnnotationsBarBase() {
        return '<div class=gd-annotations-bar-wrapper>' +

					// annotations tools
					'<div class="gd-tools-container gd-embed-annotation-tools gd-ui-draggable">' +
						// annotations tools list BEGIN
						'<ul class="gd-tools-list" id="gd-annotations-tools">' +
							// annotation tools will be here
						'</ul>' +
						// annotations tools list END
					'</div>' +
				'</div>';
    }

    function getHtmlAnnotationCommentsBase() {
        return '<div class="gd-annotations-comments-wrapper" data-id="">' +
					// open/close trigger button BEGIN
                    '<div class="gd-annotations-comments-header">' +
                        '<div class="gd-annotations-comments-header-flex">' +
                            '<div class="add gd-add-comment-action">' +
                                '<div>' +
                                    '+'+
                                '</div>' +
                            '</div>' +
                            '<div class="title">' +
                                '<span>Comments</span>' +
                            '</div>' +
                            '<div class="close">' +
                                '<div>' +
                                    '&times;'+
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="gd-annotations-comments-form hidden">' +
                        '<form autocomplete="off" id="gd-reply-form">' +
                            '<div class="gd-comment-input">' +
                                '<input required="required" id="comment-name" placeholder="Name" name="comment-name" class="gd-comment-user-name" />'+
                            '</div>'+
                            '<div class="gd-comment-input">' +
                                '<textarea required="required" id="comment-message" placeholder="Message"></textarea>'+
                            '</div>'+
                            '<div class="gd-comment-controls">' +
                                '<button type="button" class="gd-btn gd-btn-default gd-comments-cancel-action">Cancel</button>' +
                                '<button class="gd-btn gd-btn-primary">Reply</button>' +
                            '</div>' +
                        '</form>' +
                    '</div>'+
                    '<div class="gd-comments-nonideal-state">' +
                        '<div class="gd-comments-nonideal-state-icon">' +
                            '<i class="far fa-comments"></i>' +
                        '</div>' +
                        '<div class="gd-comments-nonideal-state-message">' +
                            'No comments yet. Be the first one, <span class="gd-add-comment-action">add comment</span>.'+
                        '</div>' +
                    '</div>' +
                    '<div class="gd-annotations-comments-body">' +

                    '</div>'+
				'</div>';
    }

    function getHtmlTextAnnotationElement() {
        return '<li>' +
                    '<button class="gd-tool-field gd-text-box" data-type="text">' +
                        '<i class="fas fa-highlighter fa-lg fa-inverse"></i>' +
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">text</span>' +
					'</button>' +
				'</li>';
    }

    function getHtmlAreaAnnotationElement() {
        return '<li>' +
                    '<button class="gd-tool-field gd-area-box" data-type="area">' +
                        '<i class="fas fa-vector-square fa-lg fa-inverse"></i>' +
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">area</span>' +
					'</button>' +
				'</li>';
    }

    function getHtmlPointAnnotationElement() {
        return '<li>' +
                    '<button class="gd-tool-field gd-point-box" data-type="point">' +
                        '<i class="fas fa-thumbtack fa-lg fa-inverse"></i>' +
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">point</span>' +
					'</button>' +
				'</li>';
    }

    function getHtmlTextStrikeoutAnnotationElement() {
        return '<li>' +
                    '<button class="gd-tool-field gd-strike-box" data-type="textStrikeout">' +
                        '<i class="fas fa-strikethrough fa-lg fa-inverse"></i>' +
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">strikeout</span>' +
					'</button>' +
				'</li>';
    }

    function getHtmlPolylineAnnotationElement() {
        return '<li>' +
                    '<button class="gd-tool-field gd-polyline-box" data-type="polyline">' +
                        '<i class="fas fa-signature fa-lg fa-inverse"></i>' +
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">polyline</span>' +
					'</button>' +
				'</li>';
    }

    function getHtmlTextFieldAnnotationElement() {
        return '<li>' +
                    '<button class="gd-tool-field gd-highlight-box" data-type="textField">' +
                        '<i class="fas fa-i-cursor fa-lg fa-inverse"></i>' +
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">text field</span>' +
					'</button>' +
				'</li>';
    }

    function getHtmlWatermarkdAnnotationElement() {
        return '<li>' +
                    '<button class="gd-tool-field gd-watermark-box" data-type="watermark">' +
                        '<i class="fas fa-tint fa-lg fa-inverse"></i>' +
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">watermark</span>' +
					'</button>' +
				'</li>';
    }

    function getHtmlTextReplacementAnnotationElement() {
        return '<li>' +
                    '<button class="gd-tool-field gd-replace-box" data-type="textReplacement">' +
                        '<i class="fas fa-edit fa-lg fa-inverse"></i>' +
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">text replacement</span>' +
					'</button>' +
				'</li>';
    }

    function getHtmlArrowAnnotationElement() {
        return '<li>' +
                    '<button class="gd-tool-field gd-arrow-tool" data-type="arrow">' +
                        '<i class="fas fa-mouse-pointer fa-lg fa-inverse"></i>' +
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">arrow</span>' +
					'</button>' +
				'</li>';
    }

    function getHtmlTextRedactionAnnotationElement() {
        return '<li>' +
                    '<button class="gd-tool-field gd-redtext-box" data-type="textRedaction">' +
                        '<i class="fas fa-brush fa-lg fa-inverse"></i>' +
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">Black out</span>' +
					'</button>' +
				'</li>';
    }

    function getHtmlResourcesRedactionAnnotationElement() {
        return '<li>' +
                    '<button class="gd-tool-field gd-redarea-box" data-type="resourcesRedaction">' +
                        '<i class="fas fa-object-group fa-lg fa-inverse"></i>' +
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">resource redaction</span>' +
					'</button>' +
				'</li>';
    }

    function getHtmlTextUnderlineAnnotationElement() {
        return '<li>' +
                    '<button class="gd-tool-field gd-underline-tool" data-type="textUnderline">' +
                        '<i class="fas fa-underline fa-lg fa-inverse"></i>' +
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">underline text</span>' +
					'</button>' +
				'</li>';
    }

    function getHtmlDistanceAnnotationElement() {
        return '<li>' +
                    '<button class="gd-tool-field gd-ruler-tool" data-type="distance">' +
                        '<i class="fas fa-ruler fa-lg fa-inverse"></i>' +
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">distance</span>' +
					'</button>' +
				'</li>';
    }

	function getHtmlAnnotationSplitter() {
        return '<li class="gd-annotation-separator" role="separator"></li>';
    }
	
    function getHtmlSavePanel() {
        return '<li id="gd-nav-save" class="gd-save-disabled"><i class="fa fa-floppy-o"></i><span class="gd-tooltip">Save</span></li>';
    }
	
	function getHtmlPrintPanel() {
        var downloadBtn = $("#gd-btn-print");
        var defaultHtml = downloadBtn.html();
        var downloadDropDown = '<li class="gd-nav-toggle" id="gd-print-val-container">' +
									'<span id="gd-print-value">' +
										'<i class="fa fa-print"></i>' +
										'<span class="gd-tooltip">Print</span>' +
									'</span>' +
									'<span class="gd-nav-caret"></span>' +
									'<ul class="gd-nav-dropdown-menu gd-nav-dropdown" id="gd-btn-print-value">' +
										'<li id="gd-original-print">Print Original</li>'+
										'<li id="gd-annotated-print">Print Annotated</li>'+
									'</ul>' +
								'</li>';
        downloadBtn.html(downloadDropDown);
    }
})(jQuery);

