/**
 * groupdocs.annotation Plugin
 * Copyright (c) 2018 Aspose Pty Ltd
 * Licensed under MIT.
 * @author Aspose Pty Ltd
 * @version 1.6.0
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
    // Disable default download event
    //////////////////////////////////////////////////
    $('#gd-btn-download').off(userMouseClick);

    //////////////////////////////////////////////////
    // Add SVG to all pages DIVs
    //////////////////////////////////////////////////
    $.initialize(".gd-page-image", function () {
        // ensure that the closed comments tab doesn't
        // have active class when another document is opened
        if ($(".gd-annotations-comments-wrapper").hasClass("active")) {
            $(".gd-annotations-comments-wrapper").removeClass("active");
			$('#gd-annotations-comments-toggle').prop('checked', false);
        }
        // set text rows data to null
        rows = null;
        // append svg element to each page, this is required to draw svg based annotations
        addSvgContainer();
        //check if document contains annotations
        if ($(this).parent().parent().attr("id").search("thumbnails") == -1) {
            for (var i = 0; i < documentData.length; i++) {
                if (documentData[i].annotations != null && documentData[i].annotations.length > 0) {
                    $.each(documentData[i].annotations, function (index, annotationData) {
                        if (annotationData != null && annotationData.pageNumber == documentData[i].number && annotationData.imported != true) {
                            importAnnotation(annotationData);
                            annotationData.imported = true;
                        }
                    });
                }
            }
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
    // Open document event
    //////////////////////////////////////////////////
    $('.gd-modal-body').on(userMouseClick, '.gd-filetree-name', function (e) {
        annotationsList = [];
        svgList = null;
		if (disable_click_flag) {
            // make annotations list empty for the new document
            $("#gd-annotation-comments").html("");
            $('#gd-annotations-comments-toggle').prop('checked', false);
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
                    generatePagesTemplate(data, data.length, 'thumbnails-');
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
        // TODO : cancel on toolbar
    });

    $('.gd-tool-field').on(userMouseClick, function(e){
        e.preventDefault();
		e.stopPropagation();
        var currentlyActive = null;
        var tool = e.target;
        if ($(tool).hasClass("active")) {
            $(tool).removeClass("active");
            currentlyActive = $(tool)[0];
            annotationType = null;
        }else{
            $('.gd-tool-field').removeClass('active');
            $(tool).addClass("active");
            annotationType = $(tool).data("type");
        }
    });

    //////////////////////////////////////////////////
    // add annotation event
    //////////////////////////////////////////////////	
    $('#gd-panzoom').on(userMouseDown, 'svg', function (e) {	
		e.preventDefault();
		e.stopPropagation();	
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
                    getTextCoordinates(annotation.pageNumber, function () {
                        $.fn.drawTextAnnotation($(e.target).parent()[0], annotationsList, annotation, annotationsCounter, "text", e);
                        annotation = null;
                    });
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
                    getTextCoordinates(annotation.pageNumber, function () {
                        $.fn.drawTextAnnotation($(e.target).parent()[0], annotationsList, annotation, annotationsCounter, "textStrikeout", e);
                        annotation = null;
                    });
                    break;
                case "polyline":
                    ++annotationsCounter;
                    $.fn.drawSvgAnnotation($(e.target).parent()[0], "polyline");
                    $.fn.drawSvgAnnotation.drawPolyline(e);
                    annotation = null;
                    break;
                case "textField":
                    ++annotationsCounter;
                    $.fn.drawFieldAnnotation($(e.target).parent()[0]);
                    $.fn.drawFieldAnnotation.drawTextField(annotationsList, annotation, annotationsCounter, "textField", e);
                    annotation = null;
                    break;
                case "watermark":
                    ++annotationsCounter;
                    $.fn.drawFieldAnnotation($(e.target).parent()[0]);
                    $.fn.drawFieldAnnotation.drawTextField(annotationsList, annotation, annotationsCounter, "watermark", e);
                    annotation = null;
                    break;
                case "textReplacement":
                    ++annotationsCounter;
                    getTextCoordinates(annotation.pageNumber, function () {
                        $.fn.drawTextAnnotation($(e.target).parent()[0], annotationsList, annotation, annotationsCounter, "textReplacement", e);
                        annotation = null;
                    });
                    break;
                case "arrow":
                    ++annotationsCounter;
                    $.fn.drawSvgAnnotation($(e.target).parent()[0], "arrow");
                    $.fn.drawSvgAnnotation.drawArrow(e);
                    annotation = null;
                    break;
                case "textRedaction":
                    ++annotationsCounter;
                    getTextCoordinates(annotation.pageNumber, function () {
                        $.fn.drawTextAnnotation($(e.target).parent()[0], annotationsList, annotation, annotationsCounter, "textRedaction", e);
                        annotation = null;
                    });
                    break;
                case "resourcesRedaction":
                    ++annotationsCounter;
                    $.fn.drawTextAnnotation($(e.target).parent()[0], annotationsList, annotation, annotationsCounter, "resourcesRedaction", e);
                    annotation = null;
                    break;
                case "textUnderline":
                    ++annotationsCounter;
                    getTextCoordinates(annotation.pageNumber, function () {
                        $.fn.drawTextAnnotation($(e.target).parent()[0], annotationsList, annotation, annotationsCounter, "textUnderline", e);
                        annotation = null;
                    });
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
    // enter comment text event
    //////////////////////////////////////////////////
    $('.gd-comments-sidebar-expanded').on(userMouseClick, 'div.gd-comment-text', function (e) {
        $(e.target).parent().parent().parent().find(".gd-comment-time").last().html(new Date($.now()).toUTCString());
        $("#gd-save-comments").removeClass("gd-save-button-disabled");
    });

    //////////////////////////////////////////////////
    // save comment event
    //////////////////////////////////////////////////
    $('.gd-comments-sidebar-expanded').on(userMouseClick, '.gd-comment-reply', saveComment);

    //////////////////////////////////////////////////
    // reply comment event
    //////////////////////////////////////////////////
    $('.gd-comments-sidebar-expanded').on(userMouseClick, '.gd-add-comment-reply', function (e) {    
		e.preventDefault();
		e.stopPropagation();
		$("#gd-annotation-comments").append(getCommentBaseHtml($(e.target).parent().data("annotationid")));        
        $(".gd-add-comment-reply").last().before(getCommentHtml);
    });

    //////////////////////////////////////////////////
    // cancel comment event
    //////////////////////////////////////////////////
    $('.gd-comments-sidebar-expanded').on(userMouseClick, '.gd-comment-cancel', function (e) {
        $(".gd-comment-box-sidebar").find(".gd-annotation-comment").last().find(".gd-comment-text").html("");
    });

    //////////////////////////////////////////////////
    // delete comment event
    //////////////////////////////////////////////////
    $('#gd-panzoom').on(userMouseClick, '.gd-delete-comment', function (e) {       
		// delete annotation
		deleteAnnotation(e);
		$("#gd-annotation-comments").html("");       
    });

    //////////////////////////////////////////////////
    // comments icon click event
    //////////////////////////////////////////////////
    $('#gd-panzoom').on(userMouseClick, '.gd-comments', function (e) {
        if (!$(".gd-annotations-comments-wrapper").hasClass("active")) {
            $(".gd-annotations-comments-wrapper").addClass("active");
			$('#gd-annotations-comments-toggle').prop('checked', true);
        }
        if (e.target.tagName != "INPUT" && e.target.tagName != "TEXTAREA") {
            $("#gd-annotation-comments").html("");            
            var annotationId = null;
            if (typeof $(e.target).parent().parent().data("id") != "undefined") {
                // get cuurent annotation id
                annotationId = parseInt($(e.target).parent().parent().data("id").replace(/[^\d.]/g, ''));                
               
                for (var i = 0; i < annotationsList.length; i++) {
                    if (annotationsList[i].id == annotationId) {					
						if (annotationsList[i].comments != null && annotationsList[i].comments.length != 0) {
							for (var n = 0; n < annotationsList[i].comments.length; n++) {
								// get and append all comments for the annotation
								$("#gd-annotation-comments").append(getCommentBaseHtml(annotationId));
								$(".gd-add-comment-reply").last().before(getCommentHtml);
								$(".gd-comment-time").last().html(annotationsList[i].comments[n].time);
								$(".gd-comment-text").last().html(annotationsList[i].comments[n].text);
								$(".gd-comment-text").data("saved", true);                                
								$(".gd-comment-user-name").remove();
								$(".gd-comment-user").last().html(annotationsList[i].comments[n].userName);
								$(".gd-comment-text").css("border", "0px");
								$(".gd-comment-text").css("min-height", "0px");
								$(".gd-comment-cancel").hide();
								$(".gd-comment-reply").hide();
								$(".gd-add-comment-reply").show();
							}
						} else {            
							$("#gd-annotation-comments").append(getCommentBaseHtml(annotationId));							
							$(".gd-add-comment-reply").last().before(getCommentHtml);
						}						
                        return;
                    } else {
                        continue;
                    }
                }
            }
        } else {
            return;
        }
    });

    //////////////////////////////////////////////////
    // Download event
    //////////////////////////////////////////////////
    $('#gd-btn-download-value > li').on(userMouseClick, function (e) {
        download($(this));
    });

	$('#gd-annotations-comments-toggle').on(userMouseClick, function (){
		if($('#gd-annotations-comments-toggle').prop('checked')){
			if(!$(".gd-annotations-comments-wrapper").hasClass("active")){
				$(".gd-annotations-comments-wrapper").addClass("active");
			}
		} else {
			$(".gd-annotations-comments-wrapper").removeClass("active");
		}
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
 * Get current page text coordinates
 * @param {int} pageNumber - the page number of which you need information
 */
function getTextCoordinates(pageNumber, callback) {
    var url = getApplicationPath('textCoordinates');
    // current document guid is taken from the viewer.js globals
    var data = {
        guid: documentGuid,
        password: password,
        pageNumber: pageNumber
    };
    // get text data for the document page
    $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (returnedData) {
            $('#gd-modal-spinner').hide();
            var result = "";
            if (returnedData.message != undefined) {
                if (returnedData.message.toLowerCase().indexOf("password") != -1) {
                    $("#gd-password-required").html(returnedData.message);
                    $("#gd-password-required").show();
                } else {
                    // open error popup
                    printMessage(returnedData.message);
                }
                return;
            }
            // set rows data
            rows = returnedData;
            rows.sort(function (row1, row2) {
                // Ascending: first row top less than the previous
                return row1.lineTop - row2.lineTop;
            });
            $.each(rows, function (index, row) {
                row.textCoordinates.sort(function (row1, row2) {
                    // Ascending: first row top less than the previous
                    return row1 - row2;
                });
            });
        },
        error: function (xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
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
 * Compare and set text annotation position according to the text position
  * @param {int} mouseX - current mouse X position
  * @param {int} mouseY - current mouse Y position
 */
function getTextLineHeight(mouseX, mouseY) {
    var height = 0;
	if(mouseY < rows[0].lineTop){
		mouseY = rows[0].lineTop;
	}
    // get most suitable row (vertical position)
    for (var i = 0; i < rows.length; i++) {
        if (mouseY >= rows[i].lineTop && rows[i + 1] && mouseY <= rows[i + 1].lineTop) {
            // set row top position and height
            height = rows[i].lineHeight;
            break;
        } else {
            continue
        }
    }
    return height;
}


/**
 * Annotate current document
 */
function annotate() {
    // set current document guid - used to check if the other document were opened
    var url = getApplicationPath('annotate');
    var annotationsToAdd = [];
    $.each(annotationsList, function (index, annotationToAdd) {
        if (!annotationToAdd.imported) {
            annotationsToAdd.push(annotationToAdd);
        }
    });
    // current document guid is taken from the viewer.js globals
    var data = {
        guid: documentGuid.replace(/\\/g, "//"),
        password: password,
        annotationsData: annotationsToAdd,
        documentType: getDocumentFormat(documentGuid).format
    };
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
            result = '<div id="gd-modal-annotated">Document annotated successfully</div>';
            toggleModalDialog(true, 'Annotation', result);
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
        if (id == annotationId) {
            if (typeof $(element).attr("id") != "undefined" && $(element).attr("id").search("distance") != -1) {
                // remove text element for distance annotation
                $.each($(element).parent().find("text"), function (index, text) {
                    if ($(text).data("id") == id) {
                        $(text).remove();
                    }
                });
            }
            $(element).remove();
        } else {
            return true;
        }
    });
    $("#gd-save-comments").addClass("gd-save-button-disabled");
}

/**
 * Save comment to the annotation
 */
function saveComment() {
    $(".gd-annotation-comment").each(function (index, currentComment) {
        // set saved flag
        if (!$(currentComment).find(".gd-comment-text").data("saved")) {
            $(currentComment).find(".gd-comment-text").data("saved", true);
            var annotationId = $(currentComment).parent().data("annotationid");
            // get current annotation from the annotations list
            var annotationToAddComments = $.grep(annotationsList, function (obj) { return obj.id === annotationId; })[0];
            // initiate comment object
            var comment = {
                time: null,
                text: "",
                userName: ""
            };
            // set comment data
            comment.time = $(currentComment).find(".gd-comment-time").html();
            comment.text = $(currentComment).find(".gd-comment-text").html();
            comment.userName = $(currentComment).find(".gd-comment-user-name").val() == "" ? "Anonym A." : $(currentComment).find(".gd-comment-user-name").val();
            // check if the same comment is already added - used for import annotations
            var existedComment = $.grep(annotationToAddComments.comments, function (e) { return e.text.trim() == comment.text.trim(); });
            // add comment
            if (existedComment.length == 0) {
                annotationToAddComments.comments.push(comment);
            }            
			$(currentComment).find(".gd-comment-user").html(comment.userName);
			$(currentComment).find(".gd-comment-user-name").remove();
			$(currentComment).find(".gd-comment-text").css("border", "0px");
			$(currentComment).find(".gd-comment-text").css("min-height", "0px");
			$(currentComment).parent().find(".gd-comment-cancel").hide();
			$(currentComment).parent().find(".gd-comment-reply").hide();
			$(currentComment).parent().find(".gd-add-comment-reply").show();
            comment = null;
        } else {
            return true;
        }
    });
}

/**
* Add comment into the comments bar
* @param {Object} currentAnnotation - currently added annotation
*/
function addComment(currentAnnotation) {
    $("#gd-annotation-comments").html("");
    // check if annotation contains comments
    if (currentAnnotation && currentAnnotation.comments && currentAnnotation.comments.length > 0) {
        $.each(currentAnnotation.comments, function (index, comment) {
            if (index == 0) {
                $("#gd-annotation-comments").append(getCommentBaseHtml(currentAnnotation.id));
            }
            $(".gd-comment-box-sidebar").data("annotationid", currentAnnotation.id);
            $(".gd-add-comment-reply").before(getCommentHtml(comment));			
        });
    } else {        
        currentAnnotation.comments = [];
        $("#gd-annotation-comments").append(getCommentBaseHtml(currentAnnotation.id));        
        $(".gd-add-comment-reply").before(getCommentHtml);
    }
}

/**
 * Make current annotation draggble and resizable
 * @param {Object} currentAnnotation - currently added annotation
 */
function makeResizable(currentAnnotation) {
    var annotationType = currentAnnotation.type;
    $(".gd-bounding-box").each(function (imdex, element) {  
		var id = parseInt($(element).data("id").replace(/[^\d.]/g, ''));
		if (id == currentAnnotation.id) {
			var previouseMouseX = 0;
			var previouseMouseY = 0;
			// enable dragging and resizing features for current image
			$(element).draggable({
				// set restriction for image dragging area to current document page
				containment: "#gd-page-" + currentAnnotation.pageNumber,
				stop: function (event, image) {
					if (annotationType == "text" || annotationType == "textStrikeout" || annotationType == "textUnderline") {
						var lineHeight = getTextLineHeight(image.position.left, image.position.top);							
						currentAnnotation.left = image.position.left;
						currentAnnotation.top = image.position.top;
						currentAnnotation.height = lineHeight;
					} else if(annotationType == "point" || annotationType == "polyline" || annotationType == "arrow" || annotationType == "distance") {
						switch (annotationType) {
							case "point":							
								currentAnnotation.left = $("#" + $(image.helper[0]).data("id")).attr("cx");
								currentAnnotation.top =	$("#" + $(image.helper[0]).data("id")).attr("cy");;								
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
					} else {
						currentAnnotation.left = image.position.left;
						currentAnnotation.top = image.position.top;
					}
				},	
				drag: function (event, image) {	
					var x = image.position.left;
					var y = image.position.top;
					switch (annotationType) {
						case "point":							
							x = x + ($(image.helper[0]).width() / 2);
							y = y + ($(image.helper[0]).height() / 2);
							$("#" + $(image.helper[0]).data("id")).attr("cx", x);
							$("#" + $(image.helper[0]).data("id")).attr("cy", y);
							break;
						case "polyline":
							var newCoordinates = movePolyline(image, x, y, previouseMouseX, previouseMouseY);
							previouseMouseX = x;
							previouseMouseY = y;
							$("#" + $(image.helper[0]).data("id")).attr("points", $.trim(newCoordinates));
							break;
						case "arrow":
							var newCoordinates = moveArrow(image, x, y, $("#gd-page-" + currentAnnotation.pageNumber));							
							$("#" + $(image.helper[0]).data("id")).attr("d", "M" + $.trim(newCoordinates).replace(" ", " L"));
							break;
						case "distance":
							var newCoordinates = moveDistance(image, x, y, $("#gd-page-" + currentAnnotation.pageNumber));							
							$("#" + $(image.helper[0]).data("id")).attr("d", "M" + $.trim(newCoordinates).replace(" ", " L"));
							break;
					}						
				},					
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
				grid: [10, 10],
				resize: function (event, image) {
					$(event.target).find(".gd-" + annotationType + "-annotation").css("width", image.size.width);
					$(event.target).find(".gd-" + annotationType + "-annotation").css("height", image.size.height);
					$(event.target).find(".gd-" + annotationType + "-annotation").css("left", image.position.left);
					$(event.target).find(".gd-" + annotationType + "-annotation").css("top", image.position.top);
				}
			});
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
	var firstPointX = parseInt($("#" + $(image.helper[0]).data("id")).attr("points").split(" ")[0].split(",")[0].replace(/[^\d.]/g, ''));
	var firstPointY = parseInt($("#" + $(image.helper[0]).data("id")).attr("points").split(" ")[0].split(",")[1].replace(/[^\d.]/g, ''));
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
            $.fn.drawFieldAnnotation.importTextField($("#gd-page-" + annotationData.pageNumber)[0], annotationsList, annotation, annotationsCounter, "textField");
            annotation = null;
            break;
        case "watermark":
            ++annotationsCounter;
            $.fn.drawFieldAnnotation.importTextField($("#gd-page-" + annotationData.pageNumber)[0], annotationsList, annotation, annotationsCounter, "watermark");
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
                    '<span class="gd-blanc-avatar-icon">' +
                        '<i class="fas fa-user-circle"></i>' +
						'<p class="gd-comment-user">' +
                            userName +
                        '</p>' +
                        '<p class="gd-comment-time">' +
                            time +
                        '</p>' +                        
                    '</span>' +
                '</div>	' +
                '<div class="gd-comment-text-wrapper mousetrap">' +
                    '<span class="comment-box-pointer"></span>' +
					'<input type="text" placeholder="User name" class="gd-comment-user-name" value="' + userName + '">' +
                    '<div class="gd-comment-text mousetrap" contenteditable="true" data-saved="false">' + text + '</div>' +                    
                '</div>' +
            '</div>';
}

/**
 * Get HTML markup of the comment
 */
function getCommentBaseHtml(annotationId) {
    return '<div class="gd-comment-box-sidebar" data-annotationid="' + annotationId + '">' +
				// comments will be here
				'<a class="gd-save-button gd-add-comment-reply" href="#">Reply</a>' +
				'<a class="gd-save-button gd-comment-reply" href="#">Reply</a>' +
				'<a class="gd-save-button gd-comment-cancel" href="#">Cancel</a>' +
			'</div>';
}

/**
 * Download document
 * @param {Object} button - Clicked download button
 */
function download(button) {
    var annotated = false;
    if ($(button).attr("id") == "gd-annotated-download") {
        annotated = true;
    }
    if (typeof documentGuid != "undefined" && documentGuid != "") {
        // Open download dialog
        window.location.assign(getApplicationPath("downloadDocument/?path=") + documentGuid + "&annotated=" + annotated);
    } else {
        // open error popup
        printMessage("Please open document first");
    }
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

function getContextMenu(annotationId){
	return '<div class="gd-context-menu">' +
				'<i class="fas fa-arrows-alt"></i>'+
				'<i class="fas fa-trash gd-delete-comment" data-id="' + annotationId + '"></i>'+
				'<i class="fas fa-comments gd-comments"></i>'+
			'</div>';
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
                downloadAnnotated: true
            };

            options = $.extend(defaults, options);

            getHtmlDownloadPanel();
            $('#gd-navbar').append(getHtmlSavePanel);
            // assembly annotation tools side bar html base
            $(".wrapper").append(getHtmlAnnotationsBarBase);
            // assembly annotation comments side bar html base
            $(".wrapper").append(getHtmlAnnotationCommentsBase);

            // assembly annotations tools side bar
            if (options.textAnnotation) {
                $("#gd-annotations-tools").append(getHtmlTextAnnotationElement);
            }

            if (options.areaAnnotation) {
                $("#gd-annotations-tools").append(getHtmlAreaAnnotationElement);
            }

            if (options.pointAnnotation) {
                $("#gd-annotations-tools").append(getHtmlPointAnnotationElement);
            }

            if (options.textStrikeoutAnnotation) {
                $("#gd-annotations-tools").append(getHtmlTextStrikeoutAnnotationElement);
            }

            if (options.polylineAnnotation) {
                $("#gd-annotations-tools").append(getHtmlPolylineAnnotationElement);
            }

            if (options.textFieldAnnotation) {
                $("#gd-annotations-tools").append(getHtmlTextFieldAnnotationElement);
            }

            if (options.watermarkAnnotation) {
                $("#gd-annotations-tools").append(getHtmlWatermarkdAnnotationElement);
            }

            if (options.textReplacementAnnotation) {
                $("#gd-annotations-tools").append(getHtmlTextReplacementAnnotationElement);
            }

            if (options.arrowAnnotation) {
                $("#gd-annotations-tools").append(getHtmlArrowAnnotationElement);
            }

            if (options.textRedactionAnnotation) {
                $("#gd-annotations-tools").append(getHtmlTextRedactionAnnotationElement);
            }

            if (options.resourcesRedactionAnnotation) {
                $("#gd-annotations-tools").append(getHtmlResourcesRedactionAnnotationElement);
            }

            if (options.textUnderlineAnnotation) {
                $("#gd-annotations-tools").append(getHtmlTextUnderlineAnnotationElement);
            }

            if (options.distanceAnnotation) {
                $("#gd-annotations-tools").append(getHtmlDistanceAnnotationElement);
            }

            // assembly nav bar
            if (options.downloadOriginal) {
                $("#gd-btn-download-value").append(getHtmlDownloadOriginalElement());
            }

            if (options.downloadAnnotated) {
                $("#gd-btn-download-value").append(getHtmlDownloadAnnotatedElement());
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
        return '<div class=gd-annotations-comments-wrapper>' +
					// open/close trigger button BEGIN
					'<input id="gd-annotations-comments-toggle" class="gd-annotations-comments-toggle" type="checkbox" />' +
					'<label for="gd-annotations-comments-toggle" class="gd-lbl-comments-toggle"><i class="fas fa-times"></i></label>' +
					// open/close trigger button END
					'<div class="gd-comments-sidebar-expanded gd-ui-tabs gd-ui-widget gd-ui-widget-content gd-ui-corner-all">' +
						'<div id="gd-tab-comments" class="gd-comments-content">' +
							'<div class="gd-viewport">' +								
								'<div class="gd-overview" id="gd-annotation-comments">' +
									// annotation comments will be here
								'</div>' +
							'</div>' +							
						'</div>' +
					'</div>' +
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

    function getHtmlSavePanel() {
        return '<li id="gd-nav-save" class="gd-save-disabled"><i class="fa fa-floppy-o"></i><span class="gd-tooltip">Save</span></li>';
    }

    function getHtmlDownloadPanel() {
        var downloadBtn = $("#gd-btn-download");
        var defaultHtml = downloadBtn.html();
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

    function getHtmlDownloadAnnotatedElement() {
        return '<li id="gd-annotated-download">Download Annotated</li>';
    }

})(jQuery);