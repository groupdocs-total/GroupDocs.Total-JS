/**
 * groupdocs.annotation Plugin
 * Copyright (c) 2018 Aspose Pty Ltd
 * Licensed under MIT.
 * @author Aspose Pty Ltd
 * @version 1.0.0
 */

(function( $ ) {

	/**
	* Create private variables.
	**/
	var mouse = {
        x: 0,
        y: 0       
    };
	var zoomCorrection = {
		x: 0,
		y: 0
	};
	var startX = 0;
	var startY = 0;
    var element = null;
	var annotationInnerHtml = null;	
	
	/**
	 * Draw text annotation
	 * @param {Object} canvas - document page to add annotation
	 * @param {Array} annotationsList - List of all annotations
	 * @param {Object} annotation - Current annotation
	 * @param {int} annotationsCounter - Current annotation number
	 * @param {Onject} ev - Current event
	 */
	$.fn.drawTextAnnotation = function(canvas, annotationsList, annotation, annotationsCounter, prefix, ev) {	
		zoomCorrection.x = ($(canvas).offset().left * $(canvas).css("zoom")) - $(canvas).offset().left;
		zoomCorrection.y = ($(canvas).offset().top * $(canvas).css("zoom")) - $(canvas).offset().top;	
		mouse = getMousePosition(ev)
		if(element == null && $(ev.target).prop("tagName") == "IMG"){			
			annotation.id = annotationsCounter;	
			canvas.style.cursor = "crosshair";
			startX = mouse.x;
			startY = mouse.y;
			element = document.createElement('div');
			element.className = 'gd-annotation';      
			
			element.innerHTML = getHtmlResizeHandles();
			element.id = 'gd-' + prefix + '-annotation-' + annotationsCounter;  
			var canvasTopOffset = $(canvas).offset().top * $(canvas).css("zoom");
			switch (prefix){
				case "text":
					var startCoordinates = setTextAnnotationCoordinates( mouse.x - ($(canvas).offset().left * $(canvas).css("zoom")), mouse.y - canvasTopOffset + 5);
					element.style.left = startCoordinates.x + "px";
					element.style.top = startCoordinates.y + "px";
					element.style.height = startCoordinates.height + "px";
					annotationInnerHtml = getTextAnnotationHtml();
					break
				case "area":
					element.style.left =  mouse.x - ($(canvas).offset().left * $(canvas).css("zoom")) - zoomCorrection.x + "px";
					element.style.top =  mouse.y - canvasTopOffset - zoomCorrection.y + 5 + "px";
					annotationInnerHtml = getAreaAnnotationHtml();
					break;
				case "textStrikeout":
					var startCoordinates = setTextAnnotationCoordinates( mouse.x - ($(canvas).offset().left * $(canvas).css("zoom")), mouse.y - canvasTopOffset + 5);
					element.style.left = startCoordinates.x - zoomCorrection.x + "px";
					element.style.top = startCoordinates.y - zoomCorrection.y + "px";
					element.style.height = startCoordinates.height + "px";
					annotationInnerHtml = getTextStrikeoutAnnotationHtml();
					break
			}
			
			annotation.left = element.style.left.replace("px", "");
			annotation.top = element.style.top.replace("px", "");	
			
			element.appendChild(annotationInnerHtml);			
			canvas.prepend(element);					
			annotationsList.push(annotation);	
			makeResizable(annotation);				
			addComment(annotation);
		} else {			
			canvas.onmousemove = null;
			canvas.onmousedown = null;				
			canvas.style.cursor = "default";
			if($(ev.target).prop("tagName") == "IMG"){					
				annotationsList[annotationsList.length - 1].width = element.style.width.replace("px", "");
				annotationsList[annotationsList.length - 1].height = element.style.height.replace("px", "");	
				annotationsList[annotationsList.length - 1].left = annotationsList[annotationsList.length - 1].left.replace("px", "");
				annotationsList[annotationsList.length - 1].top = annotationsList[annotationsList.length - 1].top.replace("px", "");		
			}					
			element = null;				
			annotationInnerHtml = null;				
		}		
		
		 
		canvas.onmousemove = function (e) {      
			mouse = getMousePosition(e);
			if (element !== null) {
				if(prefix == "text"){					
					element.style.width = Math.abs(mouse.x - startX) + "px";				
				} else {
					element.style.width = Math.abs(mouse.x - startX) + "px";	
					element.style.height = Math.abs(mouse.y - startY) + "px";						
				}
				annotation.width = element.style.width.replace("px", "");
				annotation.height = element.style.height.replace("px", "");
				annotationInnerHtml.style.width = element.style.width;
				annotationInnerHtml.style.height = element.style.height;
			}
		}    
		
		function getTextAnnotationHtml(){
			var annotationHtml = document.createElement('div');
			annotationHtml.className = 'gd-text-annotation';
			return annotationHtml;
		}
		
		function getAreaAnnotationHtml(){
			var annotationHtml = document.createElement('div');
			annotationHtml.className = 'gd-area-annotation';
			return annotationHtml;
		}
		
		function getTextStrikeoutAnnotationHtml(){
			var annotationHtml = document.createElement('div');
			annotationHtml.className = 'gd-textstrikeout-annotation';
			annotationHtml.innerHTML = '<div class="gd-textstrikeout-line"></div>';
			return annotationHtml;
		}
	}
})(jQuery);