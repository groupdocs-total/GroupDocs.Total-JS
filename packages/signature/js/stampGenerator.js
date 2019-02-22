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
	width: isMobile() ? 103 : 153,
	height: isMobile() ? 103 : 153,
	left: isMobile() ? 250 : 450,
	top: isMobile() ? 35 : 140,
	zIndex: 10,		
	backgroundColor: "rgb(255, 255, 255)",
	strokeColor: "rgb(51, 51, 51)", 
	strokeWidth: 1,
	textExpansion: 0.173,
	textRepeat: 1,
	fontSize: 10,
	font: "Arial",
	textColor: "rgb(51, 51, 51)",
	radius: 76.5,
	bold: false,
	italic: false,
	underline: false
}
var stampData = [];
var textContextMenuButtons = [
	getHtmlFontsSelect(mergedFonts),
	getHtmlFontSizeSelect(),
	'<i class="fas fa-bold"></i>',
	'<i class="fas fa-italic"></i>',
	'<i class="fas fa-underline"></i>',
	'<div class="gd-text-color-picker csg-text-color"></div>',
	'<i class="fas fa-trash-alt fa-sm csg-delete-text"></i>'];

$(document).ready(function(){

	// Click on Shape
    $('body').on(userMouseClick, '.csg-bouding-box', function(e){
		e.preventDefault();
		e.stopImmediatePropagation();	
		if(e.target.tagName == "CANVAS"){
			$(".bcPicker-palette").css("display", "none");
			var clickedElementId = $(e.target).data("id");
			toggleShape(clickedElementId);
		}
	});	

	//Open background color palit
	$('body').on(userMouseClick, '.fa-fill-drip', function(e){
		if (e.cancelable) {
		   e.preventDefault();
		   e.stopImmediatePropagation();		  
		}		
		$(".csg-background-color").find(".bcPicker-picker").click();
	});
	
	//Save stamp
	$('body').on(userMouseClick, '.fa-check', function(e){
		e.preventDefault();
		e.stopImmediatePropagation();
		saveDrawnStamp();
	});

	// open border color palit
	$('body').on(userMouseClick, '.fa-square', function(e){
		e.preventDefault();
		e.stopImmediatePropagation();
		$(".csg-border-color").find(".bcPicker-picker").click();		
	});
	
	// Pick a color
	$('body').on(userMouseClick, '.csg-color', function(){
		$.fn.bcPicker.pickColor($(this));		
		var color = $(this).parent().parent().find(".bcPicker-picker").css("background-color");
		var canvasId = 0;
		if ($(this).parent().parent().parent()[0] && $(this).parent().parent().parent().hasClass('csg-text-menu')) {
			canvasId = $(this).parent().parent().parent()[0].attributes['data-canvasid'].value;
		} else {
			var mainElement = $($(this).parent().parent().parent().parent()[0]);
			if(!$(mainElement).hasClass("csg-bouding-box")){
				mainElement = $($(this).parent().parent().parent().parent().parent()[0]);
			}
			canvasId = $(mainElement).data("id");
		}
		var properties = $.grep(stampData, function(e){ return e.id == canvasId; });
		if($(this).parent().parent().hasClass("csg-border-color")){
			properties[0].strokeColor = color;
		} else if ($(this).parent().parent().hasClass("csg-background-color")){
			properties[0].backgroundColor = color;
		} else {
			properties[0].textColor = color;
		}
		$.fn.stampGenerator.redrawCanvas(properties[0].id);
	});
	
	// change border width
	$('body').on("change", ".csg-border-width select", function(){
		var canvasId = $($(this).parent().parent().parent()[0]).data("id");
		var properties = $.grep(stampData, function(e){ return e.id == canvasId; });
		properties[0].strokeWidth = $(this).val();
		refreshRadius(properties[0]);
		$.fn.stampGenerator.redrawCanvas(properties[0].id);
	});
	
	// change font
	$('body').on("change", ".csg-text-menu .font", function(){
		var canvasId = $(this).parent()[0].attributes['data-canvasId'].value;
		var properties = $.grep(stampData, function(e){ return e.id == canvasId; });		
		properties[0].font = $(this).val();
		$.fn.stampGenerator.redrawCanvas(properties[0].id);
	});
	
	// change font size
	$('body').on("change", ".csg-text-menu .gd-font-size-select", function(){
		var canvasId = $(this).parent()[0].attributes['data-canvasId'].value;
		var properties = $.grep(stampData, function(e){ return e.id == canvasId; });		
		properties[0].fontSize = $(this).val();
		$.fn.stampGenerator.redrawCanvas(properties[0].id);
	});
	
	// make text bold
	$('body').on(userMouseClick, ".fa-bold", function(){
		var canvasId = $(this).parent()[0].attributes['data-canvasId'].value;
		var properties = $.grep(stampData, function(e){ return e.id == canvasId; });
		properties[0].bold = (properties[0].bold) ? false : true;
		$.fn.stampGenerator.redrawCanvas(properties[0].id);
		$(this).toggleClass("active");
	});

	// make text underline
	$('body').on(userMouseClick, ".fa-underline", function(){
		var canvasId = $(this).parent()[0].attributes['data-canvasId'].value;
		var properties = $.grep(stampData, function(e){ return e.id == canvasId; });
		properties[0].underline = (properties[0].underline) ? false : true;
		$.fn.stampGenerator.redrawCanvas(properties[0].id);
		$(this).toggleClass("active");
	});

	// make text italic
	$('body').on(userMouseClick, ".fa-italic", function(){
		var canvasId = $(this).parent()[0].attributes['data-canvasId'].value;
		var properties = $.grep(stampData, function(e){ return e.id == canvasId; });
		properties[0].italic = (properties[0].italic) ? false : true;
		$.fn.stampGenerator.redrawCanvas(properties[0].id);
		$(this).toggleClass("active");
	});

	//Delete shape
	$('body').on(userMouseClick, '.csg-delete-shape', function(e){
		e.preventDefault();
		e.stopImmediatePropagation();
		var shapeId = $($(this).parent().parent()[0]).data("id");
		var propertiesToDelete = $.grep(stampData, function(e){ return e.id == shapeId; });
		removeTextMenu(shapeId);
		stampData.splice( $.inArray(propertiesToDelete, stampData), 1 );
		$(this).parent().parent().remove();		
	});
	
	//Delete text
	$('body').on(userMouseClick, '.csg-delete-text', function(e){
		e.preventDefault();
		e.stopImmediatePropagation();
		var canvasId = $(this).parent()[0].attributes['data-canvasId'].value;
		var properties = $.grep(stampData, function(e){ return e.id == canvasId; });
		properties[0].text = "";
		removeTextMenu(canvasId);
		$.fn.stampGenerator.redrawCanvas(properties[0].id);
	});
	
	// Add new shape
	$('body').on(userMouseClick, '#csg-shape-add', function(e){
		e.preventDefault();
		e.stopImmediatePropagation();
		cleanProperties();
		if($("#gd-lightbox-body").find(".csg-bouding-box").length > 0) {
			$.each($("#gd-lightbox-body").find(".csg-bouding-box"), function(index, shape){			
				$(shape).find(".csg-params").hide();
				$(shape).find(".ui-resizable-handle").hide();
				$(shape).css("border", "none");
			});						
			paramValues.left = $("#gd-lightbox-body").find(".csg-bouding-box")[0].offsetLeft - ($.fn.stampGenerator.getSizeMagnifier());
			paramValues.top = $("#gd-lightbox-body").find(".csg-bouding-box")[0].offsetTop - ($.fn.stampGenerator.getSizeMagnifier());
			paramValues.width = $("#gd-lightbox-body").find(".csg-bouding-box")[0].offsetWidth + $.fn.stampGenerator.getSizeMagnifier();
			paramValues.height = $("#gd-lightbox-body").find(".csg-bouding-box")[0].offsetHeight + $.fn.stampGenerator.getSizeMagnifier();
			paramValues.zIndex = $($("#gd-lightbox-body").find(".csg-bouding-box")[0]).css("z-index") - 1;
			paramValues.id = $($("#gd-lightbox-body").find(".csg-bouding-box")[0]).data("id") + 1;
		}
		stampData.push(paramValues);
		shape = $.fn.stampGenerator.addShape(paramValues.id);
		if(paramValues.width != 0){
			$("#csg-shape-" + paramValues.id).css("width", paramValues.width + $.fn.stampGenerator.getSizeMagnifier());
			$("#csg-shape-" + paramValues.id).css("height", paramValues.width + $.fn.stampGenerator.getSizeMagnifier());
			$("#csg-shape-" + paramValues.id).css("left", paramValues.left);
			$("#csg-shape-" + paramValues.id).css("top", paramValues.top);
			$("#csg-shape-" + paramValues.id).css("z-index", paramValues.zIndex);
		}
		hideAllTextMenu();
	});
	
	// Add text
	$('body').on(userMouseClick, '#csg-text-add', function(e){
		$(".csg-text-input").show();
		$(".csg-text-input input").focus();
	});
	
	// Insert text
	$('body').on(userMouseClick, '.csg-insert-text', function(e){
		var canvasId = 0;		
		$(".csg-bouding-box").each(function(index, shape){
			if($(shape).css("border-top-width") != "0px"){
				canvasId = $(shape).data("id");
			}
		});				
		var properties = $.grep(stampData, function(e){ return e.id == canvasId; });
		properties[0].text = $(".csg-text-input input").val();
		$(".csg-text-input input").val("");
		$.fn.stampGenerator.redrawCanvas(properties[0].id);
		$(".csg-text-input").css("display", "none");
		addTextMenu(canvasId);
		setTextColors(properties[0]);
	});
});

(function( $ ) {

	/**
	* Create private variables.
	**/
	var textPadding = 15;
	
	var sizeMagnifier = 40;
	var stampGeneratorHtml = {header: "", body: ""};
	
	$.fn.stampGenerator = function () {		
	}

	$.extend(true, $.fn.stampGenerator, {

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

		addShape : function(canvasId){
			var previousElement = "";
			// get canvas id			
			var properties = $.grep(stampData, function(e){ return e.id == canvasId; });
			if(properties.length == 0){	
				cleanProperties();
				stampData.push(paramValues);
			}
			properties = $.grep(stampData, function(e){ return e.id == canvasId; });
			if($(".csg-bouding-box ").length > 1){				
				$.each($(".csg-bouding-box "), function(index, stamp) {
					if($(stamp).data("id") == (properties[0].id + 1)){
						previousElement = $(".csg-bouding-box ")[index];
					}
				});
			}
			setShapeProperties(properties[0]);
			// append canvas container
			if(previousElement != "") {
				$($.fn.stampGenerator.canvasHtml(properties[0])).insertAfter($(previousElement));
			} else if(canvasId < $(".csg-bouding-box ").data("id") && $(".csg-bouding-box ").length == 1){
				$("#gd-lightbox-body").append($.fn.stampGenerator.canvasHtml(properties[0]));
			} else {
				$("#gd-lightbox-body").prepend($.fn.stampGenerator.canvasHtml(properties[0]));
			}
			setColors(properties[0]);
			makeResizable(properties[0].id);
			$.fn.stampGenerator.redrawCanvas(canvasId);
		},

		redrawCanvas: function(canvasId) {
			var length = $(".csg-bouding-box").length
			var lastShapeId = length == 0 ? canvasId : $(".csg-bouding-box")[length - 1].attributes['data-id'].value;
			var isCircle = canvasId != lastShapeId;
			var properties = $.grep(stampData, function(e){ return e.id == canvasId; });
			var fontDecoration = setFontDecoration(properties[0]);
			var backgroundColor = (properties[0].backgroundColor == "") ? "rgb(255, 255, 255)" : properties[0].backgroundColor;
			// get canvas container
			var canvas = document.getElementById('csg-stamp-' + canvasId);
			var ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			// draw canvas
			var align = 'center';
			ctx.drawCircle(properties[0].radius, properties[0].width / 2, properties[0].height / 2, backgroundColor, properties[0].strokeColor, properties[0].strokeWidth);
			if (!isCircle) {
				ctx.fillStyle = properties[0].textColor;
				ctx.font = fontDecoration + " " + properties[0].fontSize + 'px ' + properties[0].font;
				ctx.textAlign = align;
				ctx.fillText(properties[0].text, properties[0].width / 2, properties[0].height / 2 + properties[0].fontSize / 2);
				if (properties[0].underline) {
					makeTextUnderline(ctx, properties[0].text, properties[0].width / 2, properties[0].height / 2, properties[0].textColor, properties[0].fontSize, align);
				}
			} else {
				ctx.drawTextCircle(properties[0].text,
					parseInt(properties[0].radius) - parseInt(textPadding),
					properties[0].width / 2,
					properties[0].height / 2,
					0,
					properties[0].textColor,
					properties[0].textExpansion,
					properties[0].textRepeat,
					properties[0].fontSize,
					properties[0].font,
					fontDecoration);
			}
		},

		headerHtml : function(){
			var html = '<div id="csg-params-header" class="csg-header-buttons">' +
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
		},

		refreshFonts : function() {
			var htmlFontsSelect = getHtmlFontsSelect(mergedFonts);
			textContextMenuButtons[0] = htmlFontsSelect;
		},
	});

})(jQuery);

function toggleShape(clickedElementId) {
	$("#gd-lightbox-body").find(".csg-params").each(function(index, shape){
		$(shape).hide();
		$(shape).parent().find(".ui-resizable-handle").hide();
		$(shape).parent().css("border", "none");
	});
	$("#csg-shape-" + clickedElementId).find(".csg-params").show();
	$("#csg-shape-" + clickedElementId).find(".ui-resizable-handle").show();
	$("#csg-shape-" + clickedElementId).css("border", "1px solid #679FFA");
	hideAllTextMenu();
	var properties = $.grep(stampData, function(e){ return e.id == clickedElementId; });
	if (properties[0].text && properties[0].text != '') {
		showTextMenu(clickedElementId);
	}
}

function getStampContextMenu(){
	var html = '<div class="gd-context-menu csg-params">'+
					'<i class="fas fa-arrows-alt fa-sm"></i>'+
					'<div class="csg-background-color"></div>'+
					'<i class="fas fa-fill-drip"></i>'+
					'<div class="csg-border-width">'+
					'<select>';
	for(i = 1; i <= 10; i++){
		html = html + '<option value="' + i + '">' + i + 'px</option>';
	}
	html = html + '</select>'+	
			'</div>'+
			'<div class="csg-border-color"></div>'+
			'<i class="far fa-square"></i>'+
			'<i class="fas fa-trash-alt fa-sm csg-delete-shape"></i>' +
			'</div>';
	return html;
}

function hideAllTextMenu() {
	$(".csg-text-menu").each(function(index, elem) {
		$(elem).hide();
	});
}

function showTextMenu(canvasId, hide) {
	$('#csg-text-menu-' + canvasId).show();
}

function removeTextMenu(canvasId){
	$('#csg-text-menu-' + canvasId).remove();
}

function addTextMenu(canvasId) {
	var id = "csg-text-menu-" + canvasId;
	var html = '<div id="' + id + '" class="csg-text-menu" data-canvasId="' + canvasId + '">';
	$.each(textContextMenuButtons, function(index, button){
		html = html + button;
	});
	html = html + '</div>';
	$('#gd-lightbox-body').append(html);
}

/**
* Extend canvas functions
**/
CanvasRenderingContext2D.prototype.drawCircle = function(radius, x, y, backgroundColor, strokeColor, strokeWidth){
	this.beginPath();
	this.arc(x, y, radius, 0, 2 * Math.PI);
	this.lineWidth = strokeWidth;
	this.strokeStyle = strokeColor;
	this.stroke();
	this.fillStyle = backgroundColor;
	this.fill();
	this.closePath();
};

CanvasRenderingContext2D.prototype.drawTextCircle = function(text, radius, x, y, sAngle, textColor, textExpansion, textRepeat, fontSize, font, fontDecoration){
	 this.save();
	 this.translate(x, y);
	 this.rotate(Math.PI / 2);
	 this.fillStyle = textColor;
	 this.font = fontDecoration + " " + fontSize + 'px ' + font;

	 for(var i = 0; i < textRepeat; i++){
		 for(var j = 0; j < text.length; j++){
			this.save();
			this.rotate(j * textExpansion + textExpansion * text.length * i);
			this.fillText(text[j], 0, -radius);
			this.restore();
		 }
	 }
	 this.restore();
};

CanvasRenderingContext2D.prototype.drawImageCircle = function(imageSrc, radius, x, y){
	baseImage = new Image();
	baseImage.src = imageSrc;
	baseImage.onload = function(){
		this.drawImage(baseImage, parseInt(x) - parseInt(radius), parseInt(y) - parseInt(radius), parseInt(radius) * 2, parseInt(radius) * 2);
	}
};

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
        },
	}).draggable({
		// set restriction for image dragging area to current document page
		containment: $(element).parent(),
		start: function(event, image) {
			$(".bcPicker-palette").css("display", "none");
			toggleShape($(image.helper)[0].attributes['data-id'].value);
		},
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
		width: isMobile() ? 103 : 153,
		height: isMobile() ? 103 : 153,
		left: isMobile() ? 250 : 450,
		top: isMobile() ? 35 : 140,
		zIndex: 10,		
		backgroundColor: "rgb(255, 255, 255)",
		strokeColor: "rgb(51, 51, 51)",
		strokeWidth: 1,
		textExpansion: 0.173,
		textRepeat: 1,
		fontSize: 10,
		font: "Arial",
		textColor: "rgb(51, 51, 51)",
		radius: 76.5,
		bold: false,
		italic: false,
		underline: false
	}
}

function setColors(properties) {
	var canvasId = properties.id;
	$.fn.bcPicker.defaults.defaultColor = "000000";
	$("#csg-stamp-" + canvasId).parent().find(".csg-background-color").bcPicker();
	$("#csg-stamp-" + canvasId).parent().find(".csg-background-color").find('.bcPicker-picker').css("background-color", properties.backgroundColor);
	$("#csg-stamp-" + canvasId).parent().find(".csg-border-color").bcPicker();
	$("#csg-stamp-" + canvasId).parent().find(".csg-border-color").find('.bcPicker-picker').css("background-color", properties.strokeColor);
	$("#gd-lightbox-body").find(".bcPicker-color").each(function(index, color){
		$(color).addClass("csg-color");
	});
}

function setTextColors(properties) {
	var canvasId = properties.id;
	$.fn.bcPicker.defaults.defaultColor = "000000";
	$("#csg-text-menu-" + canvasId).find(".gd-text-color-picker").bcPicker();
	$("#csg-text-menu-" + canvasId).find(".gd-text-color-picker").find('.bcPicker-picker').css("background-color", properties.textColor);
	$("#gd-lightbox-body").find(".bcPicker-color").each(function(index, color){
		$(color).addClass("csg-color");
	});
}

function refreshRadius(properties) {
	if(properties.strokeWidth > 1){
		properties.radius = (properties.width / 2) - (properties.strokeWidth / 2);
	} else {
		properties.radius = (properties.width / 2);
	}
}

function setShapeProperties(properties) {
	refreshRadius(properties);
	properties.strokeColor = (properties.strokeColor == "") ? "rgb(51, 51, 51)" : properties.strokeColor;
	properties.strokeWidth = (properties.strokeWidth == "") ? 1 : properties.strokeWidth;
	properties.fontSize = (properties.fontSize == "") ? 10 : properties.fontSize;
	properties.textColor = (properties.textColor == "") ? "rgb(51, 51, 51)" : properties.textColor;
}

function setFontDecoration(properties){
	var bold = (properties.bold) ? "bold" : "";
	var italic = (properties.italic) ? "italic" : "";
	return bold + " " + italic;
}

function makeTextUnderline(context,text,x,y,color,textSize) {
	var textWidth =context.measureText(text).width;
	var startX = 0;
	var startY = y+(parseInt(textSize));
	var endX = 0;
	var endY = startY;
	var underlineHeight = parseInt(textSize)/15;
	if(underlineHeight < 1){
		underlineHeight = 1;
	}
	context.beginPath();
	startX = x - (textWidth/2);
	endX = x + (textWidth/2);
	context.strokeStyle = color;
	context.lineWidth = underlineHeight;
	context.moveTo(startX, startY);
	context.lineTo(endX, endY);
	context.strokeStyle = 'blue';
	context.stroke();
}