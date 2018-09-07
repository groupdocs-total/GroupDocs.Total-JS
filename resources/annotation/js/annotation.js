/**
 * groupdocs.annotation Plugin
 * Copyright (c) 2018 Aspose Pty Ltd
 * Licensed under MIT.
 * @author Aspose Pty Ltd
 * @version 1.0.0
 */

/*
******************************************************************
******************************************************************
GLOBAL VARIABLES
******************************************************************
******************************************************************
*/
var annotatedDocumentGuid = "";
var annotation = {
	id: "",
	type: "",
	left: 0,
	top: 0,
	width: 0,
	height: 0,
	pageNumber: 0,
	svgPath: "",
	documentType: "",
	svgPath: "",
	text: "",
	font: "Arial",
	fontSize: 10,
	comments: []
};
var currentDocumentGuid = "";
var annotationType = null;
var annotationsList = [];
var annotationsCounter = 0;
var rows = null;
var svgList = {};

$(document).ready(function(){

    /*
    ******************************************************************
    NAV BAR CONTROLS
    ******************************************************************
    */

    //////////////////////////////////////////////////
    // Disable default download event
    //////////////////////////////////////////////////
    $('#gd-btn-download').off('click');

	//////////////////////////////////////////////////
    // Change all pages DIV to SVG event
    //////////////////////////////////////////////////
	$.initialize(".gd-page-image", function() {
		
		$('div.gd-page').each(function(index, page){
			if(svgList == null) {
				svgList	= {};
			}			
			if (page.id.indexOf("thumbnails") >= 0){
				return true;
			} else {
				if(!(page.id in svgList)){
					$(page).addClass("gd-disable-select");
					var draw = SVG(page.id).size(page.offsetWidth, page.offsetHeight);
					svgList[page.id] = draw;
					draw = null;
				} else {
					return true;
				}
			}			
		});
	});
	
    //////////////////////////////////////////////////
    // Fix for tooltips of the dropdowns
    //////////////////////////////////////////////////
    $('#gd-download-val-container').on('click', function(e){
        if($(this).hasClass('open')){
            $('#gd-btn-download-value').parent().find('.gd-tooltip').css('display', 'none');
        }else{
            $('#gd-btn-download-value').parent().find('.gd-tooltip').css('display', 'initial');
        }
    });

	//////////////////////////////////////////////////
    // Open document event
    //////////////////////////////////////////////////
	$('.gd-modal-body').on('click', '.gd-filetree-name', function(e){
		// make annotations list empty for the new document
		annotationsList = [];
		svgList = null;
		$("#gd-annotation-comments").html("");	
		$('#gd-annotations-comments-toggle').prop('checked', false);
	});
	
	//////////////////////////////////////////////////
    // activate currently selected annotation tool
    //////////////////////////////////////////////////
    $('.gd-tools-container').on('click', function(e){	
		var currentlyActive = null;
		$(".gd-tool-field").each(function(index, tool){
			if($(tool).is( ".active" )) {				
				$(tool).removeClass("active");
				currentlyActive = $(tool)[0];
			}			
		});
		if(e.target != currentlyActive) {
			$(e.target).addClass("active");	
			annotationType = $(e.target).data("type");
		} else {
			annotationType = null;
		}				
    });
		
	//////////////////////////////////////////////////
    // add annotation event
    //////////////////////////////////////////////////
    $('#gd-panzoom').on('mousedown', 'svg', function(e){
		if($(e.target).prop("tagName") == "IMG" || $(e.target).prop("tagName") == "svg"){
			if(annotation == null){
				annotation =  {
								id: "",
								type: "",
								left: 0,
								top: 0,
								width: 0,
								height: 0,
								pageNumber: 0,
								svgPath: "",
								documentType: "",
								svgPath: "",
								text: "",
								font: "Arial",
								fontSize: 10,
								comments: []
							};
			}
			
			annotation.type = annotationType;
			annotation.pageNumber = parseInt($($(e.target).parent()[0]).attr("id").replace ( /[^\d.]/g, '' ));
			$($(e.target).parent()[0]).css("position", "relative");
			
			switch (annotationType){
				case "text":
					++annotationsCounter;
					getTextCoordinates(annotation.pageNumber, function(){	
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
					getTextCoordinates(annotation.pageNumber, function(){	
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
					$.fn.drawFieldAnnotation.drawTextField($(e.target).parent()[0], annotationsList, annotation, annotationsCounter, "textField", e);							
					annotation = null;	
					break;
				case "watermark":					
					++annotationsCounter;					
					$.fn.drawFieldAnnotation.drawTextField($(e.target).parent()[0], annotationsList, annotation, annotationsCounter, "watermark", e);							
					annotation = null;	
					break;
				case "textReplacement":					
					++annotationsCounter;
					getTextCoordinates(annotation.pageNumber, function(){	
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
					getTextCoordinates(annotation.pageNumber, function(){	
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
					getTextCoordinates(annotation.pageNumber, function(){	
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
			if($("#gd-nav-save").hasClass("gd-save-disabled")) {
				$("#gd-nav-save").removeClass("gd-save-disabled");
				$("#gd-nav-save").on('click', function(){
					annotate();
				});
			}
		}
    });
	
	//////////////////////////////////////////////////
    // enter comment text event
    //////////////////////////////////////////////////
    $('.gd-comments-sidebar-expanded').on('click', 'div.gd-comment-text', function(e){
		$(e.target).parent().parent().parent().find(".gd-comment-time").last().html(new Date($.now()).toUTCString());
		$("#gd-save-comments").removeClass("gd-save-button-disabled");		
	});
	
	//////////////////////////////////////////////////
    // save comment event
    //////////////////////////////////////////////////
	$('.gd-comments-sidebar-expanded').on('click', '#gd-save-comments', saveComment);
	
	//////////////////////////////////////////////////
    // reply comment event
    //////////////////////////////////////////////////
	$('.gd-comments-sidebar-expanded').on('click', '.gd-comment-reply', function(e){
		$(".gd-comment-reply").before(getCommentHtml);		
	});
	
	//////////////////////////////////////////////////
    // cancel comment event
    //////////////////////////////////////////////////
	$('.gd-comments-sidebar-expanded').on('click', '.gd-comment-cancel', function(e){
		$(".gd-comment-box-sidebar").find(".gd-annotation-comment").last().find(".gd-comment-text").html("");		
	});
	
	//////////////////////////////////////////////////
    // delete comment event
    //////////////////////////////////////////////////
	$('.gd-comments-sidebar-expanded').on('click', '.gd-delete-comment', function(e){
		if($(".gd-comment-box-sidebar").find(".gd-annotation-comment").length == 1){
			deleteAnnotation(e);
			$("#gd-annotation-comments").html("");
		} else {
			var annotationId = $(e.target).parent().parent().parent().parent().parent().data("annotationId");
			for(var i = 0; i < annotationsList.length; i++){
				if(annotationId = annotationsList[i].id){
					var text = $(e.target).parent().parent().parent().parent().find(".gd-comment-text").html();					
					annotationsList[i].comments = $.grep(annotationsList[i].comments, function(value) {
																return value.text != text;
															});					
				}
			}
			$(e.target).parent().parent().parent().parent().remove();
		}
	});	
	
	//////////////////////////////////////////////////
    // annotation click event
    //////////////////////////////////////////////////
    $('#gd-panzoom').on('click', '.gd-annotation', function(e){
		if(e.target.tagName != "I" && e.target.tagName != "INPUT" && e.target.tagName != "TEXTAREA"){
			$("#gd-annotation-comments").html("");
			$('#gd-annotations-comments-toggle').prop('checked', true);
			var annotationId = null;
			if (typeof $(e.target).attr("id") != "undefined"){
				annotationId = parseInt($(e.target).attr("id").replace( /[^\d.]/g, '' ));			
				$("#gd-annotation-comments").append(getCommentBaseHtml);
				$(".gd-comment-box-sidebar").data("annotationId", annotationId);
				for(var i = 0; i < annotationsList.length; i++){
					if(annotationsList[i].id == annotationId){
						if(annotationsList[i].comments.length != 0 ){
							for(var n = 0; n < annotationsList[i].comments.length; n++){
								$(".gd-comment-reply").before(getCommentHtml);
								$(".gd-comment-time").last().html(annotationsList[i].comments[n].time);
								$(".gd-comment-text").last().html(annotationsList[i].comments[n].text);
								$(".gd-comment-text").data("saved", true);						 
								$(".gd-comment-user-name").last().val(annotationsList[i].comments[n].userName);
							}
						} else {
							$(".gd-comment-reply").before(getCommentHtml);
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
    $('#gd-btn-download-value > li').on('click', function(e){
        download($(this));
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
	if (ev.pageX) { //Moz
		mouse.x = ev.pageX;
		mouse.y = ev.pageY;
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
                    $("#gd-password-required").html(returnedData.message);
                    $("#gd-password-required").show();
                } else {
                    // open error popup
                    printMessage(returnedData.message);
                }
                return;
            }			
            rows = returnedData; 
			rows.sort(function(row1, row2) {
				// Ascending: first row top less than the previous
				return row1.lineTop - row2.lineTop;
			});
        },
        error: function(xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.Message);
			// open error popup
			printMessage(err.message);
        }
    }).done(function(){
        if(typeof callback == "function") {
            callback();
        }
    });
}

/**
 * Compare and set text annotation position according the text position
  * @param {int} mouseX - current mouse X position
  * @param {int} mouseY - current mouse Y position
 */
function setTextAnnotationCoordinates(mouseX, mouseY) { 
	var correctCoordinates = {
		x: 0, 
		y: 0,
		height: 0
	};
	if(mouseY < rows[0].lineTop) {
		mouseY = rows[0].lineTop;
	} else if (mouseY > rows[rows.length - 1].lineTop){
		mouseY = rows[rows.length - 1].lineTop;
	}
	for(var i = 0; i < rows.length; i++){		
		if(mouseY >= rows[i].lineTop && mouseY <= rows[i + 1].lineTop){
			correctCoordinates.y = rows[i].lineTop;
			correctCoordinates.height = rows[i].lineHeight;
			for(var n = 0; n < rows[i].textCoordinates.length; n++){
				if(mouseX >= rows[i].textCoordinates[n] && mouseX < rows[i].textCoordinates[n + 1]){
					correctCoordinates.x = rows[i].textCoordinates[n];
					break;
				} else {
					continue;
				}
			}
			break;
		} else {
			continue
		}
	}
	return correctCoordinates;
}


/**
 * Annotate current document
 */
function annotate() {   
    currentDocumentGuid = documentGuid;
    var url = getApplicationPath('annotate');     
	annotationsList[0].documentType = getDocumentFormat(documentGuid).format;	
    // current document guid is taken from the viewer.js globals
    var data = {
        guid: documentGuid.replace(/\\/g, "//"),
        password: password,
		htmlMode: false,
        annotationsData: annotationsList
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
                    $("#gd-password-required").html(returnedData.message);
                    $("#gd-password-required").show();
                } else {
                    // open error popup
                    printMessage(returnedData.message);
                }
                return;
            }			
            annotatedDocumentGuid = returnedData.guid;  
			result = '<div id="gd-modal-signed">Document annotated successfully</div>';
			toggleModalDialog(true, 'Annotation', result);
        },
        error: function(xhr, status, error) {
			var err = eval("(" + xhr.responseText + ")");
			console.log(err.Message);
			// open error popup
            printMessage(err.message);
		}
    });
}

/**
 * delete annotation
 * @param {Object} event - delete annotation button click event data
 */
function deleteAnnotation(event){
	var annotationId = $(event.target).parent().parent().parent().parent().parent().data("annotationId");
	var annotationToRemove = $.grep(annotationsList, function(obj){return obj.id === annotationId;})[0];	
	annotationsList.splice($.inArray(annotationToRemove, annotationsList),1);
	$(".gd-annotation").each(function(index, element){
		var id = null;
		if($(element).hasClass("svg")){
			id = parseInt($(element).attr("id").replace( /[^\d.]/g, '' ));			
		} else {
			id = parseInt($(element).find(".annotation").attr("id").replace( /[^\d.]/g, '' ));
		}
		if(id == annotationId){
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
function saveComment(){
	$(".gd-annotation-comment").each(function(index, currentComment){
		if(!$(currentComment).find(".gd-comment-text").data("saved")){
			$(currentComment).find(".gd-comment-text").data("saved", true);
			var annotationId = $(currentComment).parent().data("annotationId");	
			var annotationToAddComments = $.grep(annotationsList, function(obj){return obj.id === annotationId;})[0];			
			var comment = {
				time: null,
				text: "",
				userName: ""
			};		
			comment.time = $(currentComment).find(".gd-comment-time").html();
			comment.text = $(currentComment).find(".gd-comment-text").html();
			comment.userName = $(currentComment).find(".gd-comment-user-name").val() == "" ? "Anonym A." : $(currentComment).find(".gd-comment-user-name").val();
			annotationToAddComments.comments.push(comment);
			annotationToAddComments = null;
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
function addComment(currentAnnotation){
	 $("#gd-annotation-comments").html("");
	 $("#gd-annotation-comments").append(getCommentBaseHtml);
	 $(".gd-comment-box-sidebar").data("annotationId", currentAnnotation.id);
	 $(".gd-comment-reply").before(getCommentHtml);	
	 $('#gd-annotations-comments-toggle').prop('checked', true);
}
 
/**
 * Make current annotation draggble and resizable
 * @param {Object} currentAnnotation - currently added annotation
 */
function makeResizable (currentAnnotation){	
	var annotationType = currentAnnotation.type;	
	$(".gd-annotation").each(function(imdex, element){
		if(!$(element).hasClass("svg")){
			if(parseInt($(element).find(".annotation").attr("id").replace ( /[^\d.]/g, '' )) == currentAnnotation.id){
				// enable dragging and resizing features for current image
				$(element).draggable({
					// set restriction for image dragging area to current document page
					containment: "#gd-page-" + currentAnnotation.pageNumber,	
					stop: function(event, image){			
						if(annotationType == "text" || annotationType == "textStrikeout"){
							var coordinates = setTextAnnotationCoordinates(image.position.left, image.position.top)
							currentAnnotation.left = coordinates.x;
							currentAnnotation.top = coordinates.y;					
						} else {
							currentAnnotation.left = image.position.left;
							currentAnnotation.top = image.position.top;					
						}
					},		
				}).resizable({
					// set restriction for image resizing to current document page
					containment: "#gd-page-" + currentAnnotation.pageNumber,				
					stop: function(event, image){
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
		} else {
			return true;
		}
	});		
}

/**
 * Get HTML of the resize handles - used to add resize handles to the added signature image
 */
function getHtmlResizeHandles(){
    return  '<div class="ui-resizable-handle ui-resizable-ne"></div>'+
        '<div class="ui-resizable-handle ui-resizable-se"></div>'+
        '<div class="ui-resizable-handle ui-resizable-sw"></div>'+
        '<div class="ui-resizable-handle ui-resizable-nw"></div>';
}

function getCommentHtml(){
		return 	'<div class="gd-annotation-comment">'+
					'<div class="gd-comment-avatar">'+
						'<span class="gd-blanc-avatar-icon">'+
							'<i class="fa fa-commenting-o fa-flip-horizontal" aria-hidden="true"></i>'+
							'<p class="gd-comment-time">'+
								// comment adding time will be here
							'</p>'+
							'<div class="gd-delete-comment">'+
								'<i class="fa fa-trash-o" aria-hidden="true"></i>'+
							'</div>'+
						'</span>'+
					'</div>	'+
					'<div class="gd-comment-text-wrapper mousetrap">'+
						'<span class="comment-box-pointer"></span>'+
						'<div class="gd-comment-text mousetrap" contenteditable="true" data-saved="false"></div>'+
						'<input type="text" placeholder="User name" class="gd-comment-user-name">'+
					'</div>'+
				'</div>';
}

/**
 * Get HTML markup of the comment
 */
function getCommentBaseHtml(){
	return '<div class="gd-comment-box-sidebar" data-annotationId="0">'+
				// comments will be here
				'<a class="gd-save-button gd-comment-reply" href="#">reply</a>'+
				'<a class="gd-save-button gd-comment-cancel" href="#">cancel</a>'+
			'</div>';
}

/**
 * Download document
 * @param {Object} button - Clicked download button
 */
function download (button){
    var annotated = false;
    var documentName = "";   
    if(typeof documentName != "undefined" && documentName != ""){
		if($(button).attr("id") == "gd-annotated-download"){
			annotated = true;
			documentName = annotatedDocumentGuid;
			annotatedDocumentGuid = "";
		} else {
			documentName = documentGuid;
		}
         // Open download dialog
         window.location.assign(getApplicationPath("downloadDocument/?path=") + documentName + "&annotated=" + annotated);
    } else {
         // open error popup
         printMessage("Please open document first");
    }
}

/*
******************************************************************
******************************************************************
GROUPDOCS.ANNOTATION PLUGIN
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
                downloadOriginal:  true,
                downloadAnnotated: true
            };

            options = $.extend(defaults, options);
			 
			getHtmlDownloadPanel();
			$('#gd-navbar').append(getHtmlSavePanel);
			// assembly annotation tools side bar html base
			$("body").append(getHtmlAnnotationsBarBase);
			// assembly annotation comments side bar html base
			$("body").append(getHtmlAnnotationCommentsBase);
			
			// assembly annotations tools side bar
			if(options.textAnnotation){
                $("#gd-annotations-tools").append(getHtmlTextAnnotationElement);
            }
			
			if(options.areaAnnotation){
                $("#gd-annotations-tools").append(getHtmlAreaAnnotationElement);
            }
			
			if(options.pointAnnotation){
                $("#gd-annotations-tools").append(getHtmlPointAnnotationElement);
            }
			
			if(options.textStrikeoutAnnotation){
                $("#gd-annotations-tools").append(getHtmlTextStrikeoutAnnotationElement);
            }
			
			if(options.polylineAnnotation){
                $("#gd-annotations-tools").append(getHtmlPolylineAnnotationElement);
            }
			
			if(options.textFieldAnnotation){
                $("#gd-annotations-tools").append(getHtmlTextFieldAnnotationElement);
            }
			
			if(options.watermarkAnnotation){
                $("#gd-annotations-tools").append(getHtmlWatermarkdAnnotationElement);
            }
			
			if(options.textReplacementAnnotation){
                $("#gd-annotations-tools").append(getHtmlTextReplacementAnnotationElement);
            }
			
			if(options.arrowAnnotation){
                $("#gd-annotations-tools").append(getHtmlArrowAnnotationElement);
            }
			
			if(options.textRedactionAnnotation){
                $("#gd-annotations-tools").append(getHtmlTextRedactionAnnotationElement);
            }
			
			if(options.resourcesRedactionAnnotation){
                $("#gd-annotations-tools").append(getHtmlResourcesRedactionAnnotationElement);
            }
			
			if(options.textUnderlineAnnotation){
                $("#gd-annotations-tools").append(getHtmlTextUnderlineAnnotationElement);
            }
			
			if(options.distanceAnnotation){
                $("#gd-annotations-tools").append(getHtmlDistanceAnnotationElement);
            }
			
			// assembly nav bar
			if(options.downloadOriginal){
                $("#gd-btn-download-value").append(getHtmlDownloadOriginalElement());
            }

            if(options.downloadAnnotated){
                $("#gd-btn-download-value").append(getHtmlDownloadAnnotatedElement());
            }
        }
    };

    /*
    ******************************************************************
    INIT PLUGIN
    ******************************************************************
    */
    $.fn.annotation = function( method ) {
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method' +  method + ' does not exist on jQuery.annotation' );
        }
    };

    /*
    ******************************************************************
    HTML MARKUP
    ******************************************************************
    */
	function getHtmlAnnotationsBarBase(){
		return '<div class=gd-annotations-bar-wrapper>'+
					// open/close trigger button BEGIN
					'<input id="gd-annotations-toggle" class="gd-annotations-toggle" type="checkbox" />'+
					'<label for="gd-annotations-toggle" class="gd-lbl-toggle"></label>'+
					// open/close trigger button END
					// annotations tools
					'<div class="gd-tools-container gd-embed-annotation-tools gd-ui-draggable">'+
						// annotations tools list BEGIN
						'<ul class="gd-tools-list" id="gd-annotations-tools">'+
							// annotation tools will be here
						'</ul>'+
						// annotations tools list END
					'</div>'+
				'</div>';
	}

	function getHtmlAnnotationCommentsBase(){
		return '<div class=gd-annotations-comments-wrapper>'+
					// open/close trigger button BEGIN
					'<input id="gd-annotations-comments-toggle" class="gd-annotations-comments-toggle" type="checkbox" />'+
					'<label for="gd-annotations-comments-toggle" class="gd-lbl-comments-toggle"></label>'+
					// open/close trigger button END
					'<div class="gd-comments-sidebar-expanded gd-ui-tabs gd-ui-widget gd-ui-widget-content gd-ui-corner-all">'+						
						'<div id="gd-tab-comments" class="gd-comments-content">'+							
							'<div class="gd-viewport">'+
								'<h3 class="gd-com-heading gd-colon">Comments for annotations:</h3>'+
								'<div class="gd-overview" id="gd-annotation-comments">'+									
									// annotation comments will be here
								'</div>'+
							'</div>'+							
							'<a  id="gd-save-comments" class="gd-save-button gd-save-button-disabled" href="#">save</a>'+
						'</div>'+
					'</div>'+
				'</div>';
	}
	
	function getHtmlTextAnnotationElement(){
		return 	'<li>'+     
					'<button class="gd-tool-field gd-text-box" data-type="text">'+
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">text</span>'+
					'</button>'+
				'</li>';
	}
	
	function getHtmlAreaAnnotationElement(){
		return '<li>'+
					'<button class="gd-tool-field gd-area-box" data-type="area">'+
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">area</span>'+
					'</button>'+
				'</li>';
	}
	
	function getHtmlPointAnnotationElement(){
		return '<li>'+
					'<button class="gd-tool-field gd-point-box" data-type="point">'+
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">point</span>'+
					'</button>'+
				'</li>';
	}
	
	function getHtmlTextStrikeoutAnnotationElement(){
		return '<li>'+     
					'<button class="gd-tool-field gd-strike-box" data-type="textStrikeout">'+
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">strikeout</span>'+
					'</button>'+
				'</li>';
	}
	
	function getHtmlPolylineAnnotationElement(){
		return '<li>'+
					'<button class="gd-tool-field gd-polyline-box" data-type="polyline">'+
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">polyline</span>'+
					'</button>'+
				'</li>';
	}
	
	function getHtmlTextFieldAnnotationElement(){
		return '<li>'+
					'<button class="gd-tool-field gd-highlight-box" data-type="textField">'+
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">text field</span>'+
					'</button>'+
				'</li>';
	}
	
	function getHtmlWatermarkdAnnotationElement(){
		return '<li>'+
					'<button class="gd-tool-field gd-watermark-box" data-type="watermark">'+
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">watermark</span>'+
					'</button>'+
				'</li>';
	}
	
	function getHtmlTextReplacementAnnotationElement(){
		return '<li>'+
					'<button class="gd-tool-field gd-replace-box" data-type="textReplacement">'+
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">text replacement</span>'+
					'</button>'+
				'</li>';
	}
	
	function getHtmlArrowAnnotationElement(){
		return '<li>'+
					'<button class="gd-tool-field gd-arrow-tool" data-type="arrow">'+
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">arrow</span>'+
					'</button>'+
				'</li>';
	}
	
	function getHtmlTextRedactionAnnotationElement(){
		return '<li>'+ 
					'<button class="gd-tool-field gd-redtext-box" data-type="textRedaction">'+
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">text redaction</span>'+
					'</button>'+
				'</li>';
	}
	
	function getHtmlResourcesRedactionAnnotationElement(){
		return '<li>'+
					'<button class="gd-tool-field gd-redarea-box" data-type="resourcesRedaction">'+ 
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">resource redaction</span>'+
					'</button>'+
				'</li>';
	}
	
	function getHtmlTextUnderlineAnnotationElement(){
		return '<li>'+
					'<button class="gd-tool-field gd-underline-tool" data-type="textUnderline">'+
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">underline text</span>'+
					'</button>'+
				'</li>';
	}
	
	function getHtmlDistanceAnnotationElement(){
		return '<li>'+
					'<button class="gd-tool-field gd-ruler-tool" data-type="distance">'+
						'<span class="gd-popupdiv-hover gd-tool-field-tooltip">distance</span>'+
					'</button>'+
				'</li>';
	}
	
	function getHtmlSavePanel(){
        return '<li id="gd-nav-save" class="gd-save-disabled"><i class="fa fa-floppy-o"></i><span class="gd-tooltip">Save</span></li>';
    }
	
	function getHtmlDownloadPanel(){
        var downloadBtn = $("#gd-btn-download");
        var defaultHtml = downloadBtn.html();
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
	
	function getHtmlDownloadOriginalElement(){
        return '<li id="gd-original-download">Download Original</li>';
    }

    function getHtmlDownloadAnnotatedElement(){
        return '<li id="gd-annotated-download">Download Annotated</li>';
    }
	
})(jQuery);