/**
 * Stamp Generator
 * Copyright (c) 2018 Alex Bobkov <lilalex85@gmail.com>
 * Licensed under MIT
 * @author Alexandr Bobkov
 * @version 0.4.0
 */
 
 var userMouseClick = ('ontouchstart' in document.documentElement)  ? 'touch click' : 'click';
var paramValues = {
	width: 150,
	height: 150,
	left: 0, 
	top: 0, 
	zIndex: 0,		
	bgColor: "",
	strokeColor: "", 
	strokeWidth: ""
}

$(document).ready(function(){
	
	
	// Click on Shape
    $('body').on(userMouseClick, '.csg-bouding-box', function(e){
		e.preventDefault();
		e.stopImmediatePropagation();	
		if(e.target.tagName == "CANVAS"){
			$(".bcPicker-palette").css("display", "none");
			var clickedElementId = $(e.target).data("id");
			$("#gd-lightbox-body").find(".csg-params").each(function(index, shape){
				$(shape).hide();	
				$(shape).parent().find(".ui-resizable-handle").hide();
				$(shape).parent().css("border", "none");
			});
			$("#csg-shape-" + clickedElementId).find(".csg-params").show();
			$("#csg-shape-" + clickedElementId).find(".ui-resizable-handle").show();
			$("#csg-shape-" + clickedElementId).css("border", "1px solid #679FFA");
		}
	});	

	//Open background color palit
	$('body').on(userMouseClick, '.fa-fill-drip', function(e){
		e.preventDefault();
		e.stopImmediatePropagation();
		$(".csg-background-color").find(".bcPicker-picker").click();		
	});
	
	// open border color palit
	$('body').on(userMouseClick, '.fa-square', function(e){
		e.preventDefault();
		e.stopImmediatePropagation();
		$(".csg-border-color").find(".bcPicker-picker").click();		
	});
	
	// Pick a color
	$('body').on(userMouseClick, '.bcPicker-color', function(){
		$.fn.bcPicker.pickColor($(this));		
		var color = $(this).parent().parent().find(".bcPicker-picker").css("background-color");		
		paramValues.width = $(this).parent().parent().parent().parent()[0].offsetWidth;
		paramValues.height = $(this).parent().parent().parent().parent()[0].offsetHeight;     
		paramValues.left = $(this).parent().parent().parent().parent()[0].offsetLeft;
		paramValues.top = $(this).parent().parent().parent().parent()[0].offsetTop;		
		paramValues.zIndex = $($(this).parent().parent().parent().parent()[0]).css("z-index");		
		if($(this).parent().parent().hasClass("csg-border-color")){				
			$(this).parent().parent().parent().parent().remove();	
			paramValues.strokeColor = color;			
			$.fn.stampGenerator.addShape();
			$.fn.bcPicker.defaults.defaultColor = "000000";
			$(".csg-background-color").bcPicker();
			$(".csg-border-color").bcPicker();				
		} else {
			$(this).parent().parent().parent().parent().remove();	
			paramValues.bgColor = color;			
			$.fn.stampGenerator.addShape();
			$.fn.bcPicker.defaults.defaultColor = "000000";
			$(".csg-background-color").bcPicker();
			$(".csg-border-color").bcPicker();			
		}		
		makeResizable();
	});
	
	// change border width
	$('body').on("change", ".csg-border-width select", function(){
		paramValues.strokeWidth = $(this).val();
		paramValues.width = $(this).parent().parent().parent()[0].offsetWidth;
		paramValues.height = $(this).parent().parent().parent()[0].offsetHeight;     
		paramValues.left = $(this).parent().parent().parent()[0].offsetLeft;
		paramValues.top = $(this).parent().parent().parent()[0].offsetTop;		
		paramValues.zIndex = $($(this).parent().parent().parent()[0]).css("z-index");		
		$(this).parent().parent().parent().remove();		
		$.fn.stampGenerator.addShape();
		$.fn.bcPicker.defaults.defaultColor = "000000";
		$(".csg-background-color").bcPicker();
		$(".csg-border-color").bcPicker();	
		makeResizable();
	});
	
	//Delete shape
	$('body').on(userMouseClick, '.csg-delete-shape', function(e){
		e.preventDefault();
		e.stopImmediatePropagation();
		$(this).parent().parent().remove();		
	});
	
	// Add new shape
	$('body').on(userMouseClick, '#csg-shape-add', function(e){
		e.preventDefault();
		e.stopImmediatePropagation();		
		if($("#gd-lightbox-body").find(".csg-bouding-box").length > 0){			
			$.each($("#gd-lightbox-body").find(".csg-bouding-box"), function(index, shape){			
				$(shape).find(".csg-params").hide();
				$(shape).find(".ui-resizable-handle").hide();
				$(shape).css("border", "none");
			});						
			paramValues.left = $("#gd-lightbox-body").find(".csg-bouding-box")[0].offsetLeft - ($.fn.stampGenerator.getSizeMagnifier() / 2);
			paramValues.top = $("#gd-lightbox-body").find(".csg-bouding-box")[0].offsetTop - ($.fn.stampGenerator.getSizeMagnifier() / 2);
			paramValues.width = $("#gd-lightbox-body").find(".csg-bouding-box")[0].offsetWidth;
			paramValues.height = $("#gd-lightbox-body").find(".csg-bouding-box")[0].offsetHeight;
			paramValues.zIndex =  $($("#gd-lightbox-body").find(".csg-bouding-box")[0]).css("z-index") - 1;				
			
		} 
		shape = $.fn.stampGenerator.addShape();
		var count = $.fn.stampGenerator.getCanvasCount() - 1;
		if(paramValues.width != 0){
			$("#csg-shape-" + count).css("width", paramValues.width + $.fn.stampGenerator.getSizeMagnifier());
			$("#csg-shape-" + count).css("height", paramValues.width + $.fn.stampGenerator.getSizeMagnifier());			
			$("#csg-shape-" + count).css("left", paramValues.left);
			$("#csg-shape-" + count).css("top", paramValues.top);
			$("#csg-shape-" + count).css("z-index", paramValues.zIndex);
		}
		makeResizable();
		$.fn.bcPicker.defaults.defaultColor = "000000";
		$(".csg-background-color").bcPicker();
		$(".csg-border-color").bcPicker();	
	});
	
	// Add text
	$('body').on(userMouseClick, '#csg-text-add', function(e){
		$(".csg-text-input").css("display", "flex");
	});
	
	// Insert text
	$('body').on(userMouseClick, '.csg-insert-text', function(e){
		var text = $(".csg-text-input input").val();
		var count = $.fn.stampGenerator.getCanvasCount() - 1;
		$("#csg-stamp-" + count).find(".csg-text").text(text);
		$("#csg-stamp-" + count).find(".csg-text").addClass("csg-rounded-text");
		$(function() {
			$("#csg-stamp-" + count).find(".csg-text").lettering();
			var angle = 290;
			for(i = 0; i < $(".csg-rounded-text").find("span").length; i++){
				angle = angle + 24;
				$($(".csg-rounded-text").find("span")[i]).css("transform", "rotate(" + angle + "deg)")
			}
		});			
	});
});



(function( $ ) {

	/**
	* Create private variables.
	**/
	var canvasCount = 0;	
	var textPadding = 15;
	
	var sizeMagnifier = 40;
	var stampGeneratorHtml = {header: "", body: ""};
	
	$.fn.stampGenerator = function () {		
	}

	$.extend(true, $.fn.stampGenerator, {

		getCanvasCount : function(){
			return canvasCount;
		},

		getSizeMagnifier : function(){
			return sizeMagnifier;
		},
		
		addInitialShape : function(){
			stampGeneratorHtml.header = $.fn.stampGenerator.headerHtml();				
			return stampGeneratorHtml;
		},		
		
		addShape : function(){		
			$.fn.stampGenerator.drawShape();			
		},

		removeShape : function(elem){
			elem.parent().fadeOut(300, function(){
				// get canvas id
				var canvasId = $.fn.stampGenerator.getCanvasId($(this));
				// remove canvas
				$('#csg-stamp-' + canvasId).remove();
				// remove canvas params container
				$(this).remove();
			});
		},

		toggleShape : function(elem){
			elem.next().next().toggle('fast');
			var text = elem.text();
			elem.text(text == 'Edit' ? 'Close' : 'Edit');
		},

		drawShape : function(text){
			var i = 1;
			// get canvas id
			var canvasId = canvasCount;
			// get shape params
			var radius = (paramValues.width / 2) - 10;
			text = (typeof text == "undefined") ? "" : text;
			var textExpansion = 0.173;
			var textRepeat = 0;
			var textSize = 14;
			var textFont = "Arial";
			var bgColor = (paramValues.bgColor == "") ? "rgb(255, 255, 255)" : paramValues.bgColor;
			var strokeColor = (paramValues.strokeColor == "") ? "rgb(51, 51, 51)" : paramValues.strokeColor;
			var strokeWidth = (paramValues.strokeWidth == "") ? 1 : paramValues.strokeWidth;
			var fgColor = "rgb(51, 51, 51)";
			// append canvas container
			$('#gd-lightbox-body').prepend($.fn.stampGenerator.canvasHtml(canvasId));
			// get canvas container
			var c = document.getElementById('csg-stamp-' + canvasId);
			var ctx = c.getContext('2d');
			// draw canvas
			ctx.drawCircle(radius, paramValues.width / 2, paramValues.height / 2, bgColor, strokeColor, strokeWidth);
			if(i == 1) {
				ctx.fillStyle = fgColor;
				ctx.font = textSize + 'px ' + textFont;
				ctx.textAlign = 'center';
				ctx.fillText(text, paramValues.width / 2, paramValues.height / 2 + textSize/2);
				i++;
			} else {
				ctx.drawTextCircle(text, parseInt(radius) - parseInt(textPadding), paramValues.width / 2, paramValues.height / 2, 0, fgColor, textExpansion, textRepeat, textSize, textFont);
			}				
		},

		headerHtml : function(){
			var html = '<div id="csg-params-header">' +
						'<button id="csg-shape-add"><i class="fas fa-plus"></i>Circle</button>' +
						'<button id="csg-text-add"><i class="fas fa-plus"></i>Text</button>' +
						'<div class="csg-text-input"><input type="text"><div class="csg-insert-text"><i class="fas fa-plus"></i></div></div>'+
						'<i class="fas fa-check"></i>'+
					'</div>';				
			return html;
		},	

		canvasHtml : function(){
			var resizeHandles = getHtmlResizeHandles();	
			var position = (paramValues.left != 0) ? "left:" + paramValues.left + "px; top:" + paramValues.top + "px" : "";
			var html = '<div class="csg-bouding-box" id="csg-shape-' + canvasCount + '" data-id="' + canvasCount + '" style="width: ' + paramValues.width + 'px; height: ' + paramValues.height + 'px; ' + position + '">'+
						getStampContextMenu() +
						'<canvas id="csg-stamp-' + canvasCount + '" class="csg-preview" width="' + paramValues.width + '" height="' + paramValues.height + '" data-id="' + canvasCount + '"></canvas>'+
						resizeHandles +						
					'</div>';	
			canvasCount++;	
		
			return html;
		}		
	});

})(jQuery);

function getStampContextMenu(){
	var html = '<div class="gd-context-menu csg-params">'+
	'<i class="fas fa-arrows-alt fa-sm" data-id="gd-image-signature-2"></i>'+
	'<div class="csg-background-color"></div><i class="fas fa-fill-drip"></i>'+
	'<div class="csg-border-width">'+
	'<select>';
	for(i = 1; i <= 10; i++){
		html = html + '<option value="' + i + '">' + i + 'px</option>';
	}
	html = html + '</select>'+	
			'</div>'+
			'<div class="csg-border-color"></div><i class="far fa-square"></i>'+
			'<i class="fas fa-trash-alt fa-sm csg-delete-shape"></i>'+
			'</div>';
	return html;
}

/**
* Extend canvas functions
**/
CanvasRenderingContext2D.prototype.drawCircle = function(radius, x, y, bgColor, strokeColor, strokeWidth){
	this.beginPath();
	this.arc(x, y, radius, 0, 2 * Math.PI);
	this.lineWidth = strokeWidth
	this.strokeStyle = strokeColor;
	this.stroke();	
	this.fillStyle = bgColor;
	this.fill();
	this.closePath();
}

CanvasRenderingContext2D.prototype.drawTextCircle = function(text, radius, x, y, sAngle, fgColor, textExpansion, textRepeat, textSize, textFont){
	 this.save();
	 this.translate(x, y);
	 this.rotate(Math.PI / 2);
	 this.fillStyle = fgColor;
	 this.font = textSize + 'px ' + textFont;

	 for(var i = 0; i < textRepeat; i++){
		 for(var j = 0; j < text.length; j++){
			this.save();
			this.rotate(j * textExpansion + textExpansion * text.length * i);
			this.fillText(text[j], 0, -radius);
			this.restore();
		 }
	 }
	 this.restore();
}

CanvasRenderingContext2D.prototype.drawImageCircle = function(imageSrc, radius, x, y){
	baseImage = new Image();
	baseImage.src = imageSrc;
	baseImage.onload = function(){
		this.drawImage(baseImage, parseInt(x) - parseInt(radius), parseInt(y) - parseInt(radius), parseInt(radius) * 2, parseInt(radius) * 2);
	}
}

/**
* Extend canvas functions
**/
function makeResizable(){	
	var canvasCount = $.fn.stampGenerator.getCanvasCount();
	var element = $("#csg-shape-" + (canvasCount - 1));
	// enable rotation, dragging and resizing features for current image
	element.resizable({
		// set restriction for image resizing to current document page        
		// set image resize handles
		handles: {           
			'ne': '.ui-resizable-ne',
			'se': '.ui-resizable-se',
			'sw': '.ui-resizable-sw',
			'nw': '.ui-resizable-nw'
		},
		aspectRatio: 1 / 1,
		stop: function(event, image) {                      
			paramValues.width = Math.ceil(image.size.width);
			paramValues.height = Math.ceil(image.size.height);	   
        },
	}).draggable({
		// set restriction for image dragging area to current document page
		containment: $(element).parent(),
		stop : function(event, image) {			
            paramValues.left = image.position.left;
            paramValues.top = image.position.top;
		}
	});
}
