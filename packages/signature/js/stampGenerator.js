/**
 * Stamp Generator
 * Copyright (c) 2018 Alex Bobkov <lilalex85@gmail.com>
 * Licensed under MIT
 * @author Alexandr Bobkov
 * @version 0.4.0
 */
 
var userMouseClick = ('ontouchstart' in document.documentElement)  ? 'touch click' : 'click';
var paramValues = {
	id: 0,
	text: "",
	width: 150,
	height: 150,
	left: 0, 
	top: 0, 
	zIndex: 10,		
	backgroundColor: "rgb(255, 255, 255)",
	strokeColor: "rgb(51, 51, 51)", 
	strokeWidth: 1,
	textExpansion: 0.173,
	textRepeat: 1,
	fontSize: 10,
	font: "Arial",
	textColor: "rgb(51, 51, 51)",
	radius: 75
}
 var stampData = [];
 
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
	
	//Save stamp
	$('body').on(userMouseClick, '.fa-check', function(e){
		e.preventDefault();
		e.stopImmediatePropagation();
		saveDrawnStamp(applyStamp);			
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
		var canvasId = $($(this).parent().parent().parent().parent()[0]).data("id");		
		var properties = $.grep(stampData, function(e){ return e.id == canvasId; });
		properties[0].width = $(this).parent().parent().parent().parent()[0].offsetWidth;
		properties[0].height = $(this).parent().parent().parent().parent()[0].offsetHeight;     
		properties[0].left = $(this).parent().parent().parent().parent()[0].offsetLeft;
		properties[0].top = $(this).parent().parent().parent().parent()[0].offsetTop;		
					
		if($(this).parent().parent().hasClass("csg-border-color")){				
			$(this).parent().parent().parent().parent().remove();	
			properties[0].strokeColor = color;			
			$.fn.stampGenerator.drawShape(properties[0].id);
			$.fn.bcPicker.defaults.defaultColor = "000000";
			$(".csg-background-color").bcPicker();
			$(".csg-border-color").bcPicker();				
		} else {
			$(this).parent().parent().parent().parent().remove();	
			properties[0].backgroundColor = color;			
			$.fn.stampGenerator.drawShape(properties[0].id);
			$.fn.bcPicker.defaults.defaultColor = "000000";
			$(".csg-background-color").bcPicker();
			$(".csg-border-color").bcPicker();			
		}		
		makeResizable(properties[0].id);
	});
	
	// change border width
	$('body').on("change", ".csg-border-width select", function(){
		var canvasId = $($(this).parent().parent().parent()[0]).data("id");		
		var properties = $.grep(stampData, function(e){ return e.id == canvasId; });		
		properties[0].strokeWidth = $(this).val();
		properties[0].width = $(this).parent().parent().parent()[0].offsetWidth;
		properties[0].height = $(this).parent().parent().parent()[0].offsetHeight;     
		properties[0].left = $(this).parent().parent().parent()[0].offsetLeft;
		properties[0].top = $(this).parent().parent().parent()[0].offsetTop;		
		
		$(this).parent().parent().parent().remove();		
		$.fn.stampGenerator.drawShape(properties[0].id);
		$.fn.bcPicker.defaults.defaultColor = "000000";
		$(".csg-background-color").bcPicker();
		$(".csg-border-color").bcPicker();	
		makeResizable(properties[0].id);
	});
	
	//Delete shape
	$('body').on(userMouseClick, '.csg-delete-shape', function(e){
		e.preventDefault();
		e.stopImmediatePropagation();
		var propertiesToDelete = $.grep(stampData, function(e){ return e.id == $($(this).parent().parent()[0]).data("id"); });
		stampData.splice( $.inArray(propertiesToDelete, stampData), 1 );
		$(this).parent().parent().remove();		
	});
	
	// Add new shape
	$('body').on(userMouseClick, '#csg-shape-add', function(e){
		e.preventDefault();
		e.stopImmediatePropagation();
		cleanProperties();
		if($("#gd-lightbox-body").find(".csg-bouding-box").length > 0){			
			$.each($("#gd-lightbox-body").find(".csg-bouding-box"), function(index, shape){			
				$(shape).find(".csg-params").hide();
				$(shape).find(".ui-resizable-handle").hide();
				$(shape).css("border", "none");
			});						
			paramValues.left = $("#gd-lightbox-body").find(".csg-bouding-box")[0].offsetLeft - ($.fn.stampGenerator.getSizeMagnifier() / 2);
			paramValues.top = $("#gd-lightbox-body").find(".csg-bouding-box")[0].offsetTop - ($.fn.stampGenerator.getSizeMagnifier() / 2);
			paramValues.width = $("#gd-lightbox-body").find(".csg-bouding-box")[0].offsetWidth + $.fn.stampGenerator.getSizeMagnifier();
			paramValues.height = $("#gd-lightbox-body").find(".csg-bouding-box")[0].offsetHeight + $.fn.stampGenerator.getSizeMagnifier();
			paramValues.zIndex =  $($("#gd-lightbox-body").find(".csg-bouding-box")[0]).css("z-index") - 1;		
			paramValues.id =  $($("#gd-lightbox-body").find(".csg-bouding-box")[0]).data("id") + 1;				
		} 
		stampData.push(paramValues);
		shape = $.fn.stampGenerator.drawShape(paramValues.id);
		var count = $.fn.stampGenerator.getCanvasCount() - 1;
		if(paramValues.width != 0){
			$("#csg-shape-" + count).css("width", paramValues.width + $.fn.stampGenerator.getSizeMagnifier());
			$("#csg-shape-" + count).css("height", paramValues.width + $.fn.stampGenerator.getSizeMagnifier());			
			$("#csg-shape-" + count).css("left", paramValues.left);
			$("#csg-shape-" + count).css("top", paramValues.top);
			$("#csg-shape-" + count).css("z-index", paramValues.zIndex);
		}
		makeResizable(paramValues.id);
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
		var canvasId = 0;		
		$(".csg-bouding-box").each(function(index, shape){
			if($(shape).css("border").search("none") == -1){
				canvasId = $(shape).data("id");
			}
		});				
		var properties = $.grep(stampData, function(e){ return e.id == canvasId; });
		properties[0].width = $("#csg-shape-" + canvasId)[0].offsetWidth;
		properties[0].height = $("#csg-shape-" + canvasId)[0].offsetHeight;     
		properties[0].left = $("#csg-shape-" + canvasId)[0].offsetLeft;
		properties[0].top = $("#csg-shape-" + canvasId)[0].offsetTop;		
		
		properties[0].text = $(".csg-text-input input").val();		
		$(".csg-text-input input").val("");
		var isCircle = true;		
		$.each($(".csg-bouding-box"), function(index, element){
			var lastShape = $(".csg-bouding-box")[$(".csg-bouding-box").length - 1];
			if($(lastShape).is($("#csg-shape-" + canvasId))){
				isCircle = false;
			}
		});		
		$("#csg-shape-" + canvasId).remove();	
		$.fn.stampGenerator.drawShape(properties[0].id, isCircle);	
		$.fn.bcPicker.defaults.defaultColor = "000000";
		$(".csg-background-color").bcPicker();
		$(".csg-border-color").bcPicker();	
		makeResizable(properties[0].id);	
		$(".csg-text-input").css("display", "none");
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
		
		getStampData : function(){
			return stampData;
		},
		
		addInitialShape : function(){
			stampData = [];
			stampGeneratorHtml.header = $.fn.stampGenerator.headerHtml();				
			return stampGeneratorHtml;
		},	
		
		drawShape : function(canvasId, isCircle){
			var previouseElement = "";			
			// get canvas id			
			var properties = $.grep(stampData, function(e){ return e.id == canvasId; });
			if(properties.length == 0){	
				cleanProperties();
				stampData.push(paramValues);
			}
			properties = $.grep(stampData, function(e){ return e.id == canvasId; });
			if($(".csg-bouding-box ").length > 1){				
				$.each($(".csg-bouding-box "), function(index, stamp){
					if($(stamp).data("id") == (properties[0].id + 1)){
						previouseElement = $(".csg-bouding-box ")[index];
					}
				});
			}
			// get shape params
			properties[0].radius = (properties[0].width / 2) - 10;			
			isCircle = (typeof isCircle == "undefined") ? false : isCircle;			
			var backgroundColor = (properties[0].backgroundColor == "") ? "rgb(255, 255, 255)" : properties[0].backgroundColor;
			properties[0].strokeColor = (properties[0].strokeColor == "") ? "rgb(51, 51, 51)" : properties[0].strokeColor;
			properties[0].strokeWidth = (properties[0].strokeWidth == "") ? 1 : properties[0].strokeWidth;	
			properties[0].fontSize = (properties[0].fontSize == "") ? 10 : properties[0].fontSize;				
			// append canvas container	
			if(previouseElement != ""){
				$($.fn.stampGenerator.canvasHtml(properties[0])).insertAfter($(previouseElement));
			} else if(canvasId < $(".csg-bouding-box ").data("id") && $(".csg-bouding-box ").length == 1){
				$("#gd-lightbox-body").append($.fn.stampGenerator.canvasHtml(properties[0]));
			} else {
				$("#gd-lightbox-body").prepend($.fn.stampGenerator.canvasHtml(properties[0]));
			}			
			// get canvas container
			var c = document.getElementById('csg-stamp-' + canvasId);
			var ctx = c.getContext('2d');
			// draw canvas
			ctx.drawCircle(properties[0].radius, properties[0].width / 2, properties[0].height / 2, backgroundColor, properties[0].strokeColor, properties[0].strokeWidth);
			if(!isCircle) {
				ctx.fillStyle = properties[0].textColor;
				ctx.font = properties[0].fontSize + 'px ' + properties[0].font;
				ctx.textAlign = 'center';
				ctx.fillText(properties[0].text, properties[0].width / 2, properties[0].height / 2 + properties[0].fontSize/2);				
			} else {
				ctx.drawTextCircle(properties[0].text, 
				parseInt(properties[0].radius) - parseInt(textPadding), properties[0].width / 2, 
				properties[0].height / 2, 
				0, 
				properties[0].textColor, 
				properties[0].textExpansion,
				properties[0].textRepeat,
				properties[0].fontSize, 
				properties[0].font);
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

		canvasHtml : function(properties){
			var resizeHandles = getHtmlResizeHandles();	
			var position = (properties.left != 0) ? "left:" + properties.left + "px; top:" + properties.top + "px" : "";
			var html = '<div class="csg-bouding-box" id="csg-shape-' + properties.id + '" data-id="' + properties.id + '" style="width: ' + properties.width + 'px; height: ' + properties.height + 'px; ' + position + '">'+
						getStampContextMenu() +
						'<canvas id="csg-stamp-' + properties.id + '" class="csg-preview" width="' + properties.width + '" height="' + properties.height + '" data-id="' + properties.id + '"></canvas>'+
						resizeHandles +						
					'</div>';		
			return html;
		}		
	});

})(jQuery);

function getStampContextMenu(){
	var html = '<div class="gd-context-menu csg-params">'+
	'<i class="fas fa-arrows-alt fa-sm"></i>'+
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
CanvasRenderingContext2D.prototype.drawCircle = function(radius, x, y, backgroundColor, strokeColor, strokeWidth){
	this.beginPath();
	this.arc(x, y, radius, 0, 2 * Math.PI);
	this.lineWidth = strokeWidth
	this.strokeStyle = strokeColor;
	this.stroke();	
	this.fillStyle = backgroundColor;
	this.fill();
	this.closePath();
}

CanvasRenderingContext2D.prototype.drawTextCircle = function(text, radius, x, y, sAngle, textColor, textExpansion, textRepeat, fontSize, font){
	 this.save();
	 this.translate(x, y);
	 this.rotate(Math.PI / 2);
	 this.fillStyle = textColor;
	 this.font = fontSize + 'px ' + font;

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
function makeResizable(canvasId){		
	var element = $("#csg-shape-" + canvasId);
	var properties = $.grep(stampData, function(e){ return e.id == canvasId; });
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
			properties[0].width = Math.ceil(image.size.width);
			properties[0].height = Math.ceil(image.size.height);
			$("#csg-shape-" + canvasId).remove();	
			$.fn.stampGenerator.drawShape(properties[0].id);
			makeResizable(canvasId);
			$.fn.bcPicker.defaults.defaultColor = "000000";
			$(".csg-background-color").bcPicker();
			$(".csg-border-color").bcPicker();	
        },
	}).draggable({
		// set restriction for image dragging area to current document page
		containment: $(element).parent(),
		stop : function(event, image) {			
            properties[0].left = image.position.left;
            properties[0].top = image.position.top;
		}
	});
}

function cleanProperties(){
	paramValues = null;
	paramValues = {
		id: 0,
		text: "",
		width: 150,
		height: 150,
		left: 0, 
		top: 0, 
		zIndex: 10,		
		backgroundColor: "rgb(255, 255, 255)",
		strokeColor: "rgb(51, 51, 51)", 
		strokeWidth: 1,
		textExpansion: 0.173,
		textRepeat: 1,
		fontSize: 10,
		font: "Arial",
		textColor: "rgb(51, 51, 51)",
		radius: 75
	}
}

function applyStamp(){
	toggleLightBox(false, "", "");	
}