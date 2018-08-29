/**
 * groupdocs.annotation Plugin
 * Copyright (c) 2018 Aspose Pty Ltd
 * Licensed under MIT.
 * @author Aspose Pty Ltd
 * @version 1.0.0
 */
 $(document).ready(function(){
	 //////////////////////////////////////////////////
    // enter text event
    //////////////////////////////////////////////////  
	$("#gd-panzoom").bind("change", ".gd-replace-text-area-text",  function(event){
		var id = $(event.target).data("id");
		$.each(annotationsList, function(index, elem){
			if(elem.id == id){
				elem.text = $(event.target).val();					
			} else {
				return true;
			}
		});			
	});
 });
	 
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
			var x = mouse.x - ($(canvas).offset().left * $(canvas).css("zoom")) - (parseInt($(canvas).css("margin")) * 2);
			var y = mouse.y - canvasTopOffset - (parseInt($(canvas).css("margin")) * 2);
			switch (prefix){
				case "text":					
					var startCoordinates = setTextAnnotationCoordinates(x, y);
					element.style.left = startCoordinates.x + "px";
					element.style.top = startCoordinates.y + "px";
					element.style.height = startCoordinates.height + "px";
					annotationInnerHtml = getTextAnnotationHtml();
					break
				case "area":
					element.style.left = x + "px";
					element.style.top = y + "px";
					annotationInnerHtml = getAreaAnnotationHtml();
					break;
				case "textStrikeout":
					var startCoordinates = setTextAnnotationCoordinates(x, y);
					element.style.left = startCoordinates.x - zoomCorrection.x + "px";
					element.style.top = startCoordinates.y - zoomCorrection.y + "px";
					element.style.height = startCoordinates.height + "px";
					annotationInnerHtml = getTextStrikeoutAnnotationHtml();
					break
				case "textReplacement":
					var startCoordinates = setTextAnnotationCoordinates(x, y);
					element.style.left = startCoordinates.x + "px";
					element.style.top = startCoordinates.y + "px";
					element.style.height = startCoordinates.height + "px";
					annotationInnerHtml = getTextAnnotationHtml();
					break;					
			}
			
			annotation.left = parseInt(element.style.left.replace("px", ""));
			annotation.top = parseInt(element.style.top.replace("px", ""));	
			
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
				annotationsList[annotationsList.length - 1].width = parseInt(element.style.width.replace("px", ""));
				annotationsList[annotationsList.length - 1].height = parseInt(element.style.height.replace("px", ""));					
			}					
			if(prefix == "textReplacement"){
				element.appendChild(getTextReplaceAnnotationHtml(annotationsCounter));			
			}
			element = null;				
			annotationInnerHtml = null;	
			
		}		
				 
		canvas.onmousedown = function(e) {
			if(element != null){
				canvas.onmousemove = null;
				canvas.onmousedown = null;				
				canvas.style.cursor = "default";
				if($(ev.target).prop("tagName") == "IMG"){					
					annotationsList[annotationsList.length - 1].width = parseInt(element.style.width.replace("px", ""));
					annotationsList[annotationsList.length - 1].height = parseInt(element.style.height.replace("px", ""));					
				}			
				annotationInnerHtml = null;						
			}
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
				annotation.width = parseInt(element.style.width.replace("px", ""));
				annotation.height = parseInt(element.style.height.replace("px", ""));
				annotationInnerHtml.style.width = parseInt(element.style.width) + "px";
				annotationInnerHtml.style.height = parseInt(element.style.height) + "px";
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
		
		function getTextReplaceAnnotationHtml(id){
			id = id - 1;
			var annotationHtml = document.createElement('div');			
			annotationHtml.className = "gd-replace-text-area";
			annotationHtml.innerHTML = '<div class="gd-replace-tab">Replace</div>'+
										'<textarea class="gd-replace-text-area-text mousetrap" data-id="' + id + '">replace text</textarea>';
										
			return annotationHtml;
		}
	}
})(jQuery);