/**
 * Stamp Generator
 * Copyright (c) 2018 Alex Bobkov <lilalex85@gmail.com>
 * Licensed under MIT
 * @author Alexandr Bobkov
 * @version 0.4.0
 */

$(document).ready(function(){
	var userMouseClick = ('ontouchstart' in document.documentElement)  ? 'touch click' : 'click';	
	// Add Shape
    $('body').on(userMouseClick, 'button#csg-shape-add', function(){
		$.fn.stampGenerator.addShape($(this));
	});

	// Remove Shape
    $('body').on(userMouseClick, 'button.csg-shape-remove', function(){
		$.fn.stampGenerator.removeShape($(this));
	});

	// Toggle Shape
    $('body').on(userMouseClick, 'button.csg-params-toggle', function(){
		$.fn.stampGenerator.toggleShape($(this));
	});

	// Preview/Draw Shapes
	$('body').bind('#csg-params-container input', function(){
		$.fn.stampGenerator.drawShape();
	});

	$('body').on(userMouseClick, '.fa-fill-drip', function(e){
		e.preventDefault();
		e.stopImmediatePropagation();
		$(".csg-background-color").find(".bcPicker-picker").click();		
	});
	
	$('body').on(userMouseClick, '.fa-square', function(e){
		e.preventDefault();
		e.stopImmediatePropagation();
		$(".csg-border-color").find(".bcPicker-picker").click();		
	});
	
	// Pick a color
	$('body').on(userMouseClick, '.bcPicker-color', function(){
		$.fn.bcPicker.pickColor($(this));
		var color = $(this).parent().parent().find(".bcPicker-picker").css("background-color");
		if($(this).parent().parent().hasClass("csg-border-color")){
			$(this).parent().parent().parent().parent().find(".csg-shape").css("border-color", color);
		} else {
			$(this).parent().parent().parent().parent().find(".csg-shape").css("background-color", color);
		}
	});
	
	$('body').on(userMouseClick, ".csg-border-width", function(e){
		
	});
});



(function( $ ) {

	/**
	* Create private variables.
	**/
	var canvasCount = 0;
	var xCoord = 125;
	var yCoord = 125;
	var textPadding = 15;
	var paramValues = {
		radius : '#csg-radius',
		text : '#csg-text',
		textExpansion : '#csg-text-expansion',
		textRepeat : '#csg-text-repeat',
		textSize : '#csg-text-size',
		textFont : '#csg-text-font',
		bgColor : '#csg-bg-color-',
		fgColor : '#csg-fg-color-',
		strokeColor : '#csg-stroke-color-'
	}
	var stampGeneratorHtml = {header: "", body: ""};
	
	$.fn.stampGenerator = function () {
		stampGeneratorHtml.header = $.fn.stampGenerator.headerHtml();
		stampGeneratorHtml.body = $.fn.stampGenerator.canvasHtml();
		return stampGeneratorHtml;
	}

	$.extend(true, $.fn.stampGenerator, {

		getCanvasId : function(elem){
			return elem.attr('id').replace('csg-params-', '');
		},

		addShape : function(elem){
			canvasCount++;
			elem.parent().parent().append($.fn.stampGenerator.shapeHtml(canvasCount));
			$(paramValues.bgColor + canvasCount).bcPicker({defaultColor: 'FFFFFF'});
			$(paramValues.strokeColor + canvasCount).bcPicker();
			$(paramValues.fgColor + canvasCount).bcPicker();
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

		drawShape : function(){
			// clear all canvas containers
			$('.csg-preview').each(function(){
				$(this).remove();
			});
			// draw canvas
			var i = 1;
			$('.csg-params').each(function(){
				// get canvas id
				var canvasId = $.fn.stampGenerator.getCanvasId($(this));
				// get shape params
				var radius = $(this).find(paramValues.radius).val();
				var text = $(this).find(paramValues.text).val();
				var textExpansion = $(this).find(paramValues.textExpansion).val();
				var textRepeat = $(this).find(paramValues.textRepeat).val();
				var textSize = $(this).find(paramValues.textSize).val();
				var textFont = $(this).find(paramValues.textFont).val();
				var bgColor = $(paramValues.bgColor + canvasId).children().css('background-color');
				var strokeColor = $(paramValues.strokeColor + canvasId).children().css('background-color');
				var fgColor = $(paramValues.fgColor + canvasId).children().css('background-color');
				// append canvas container
				$('#csg-preview-container').prepend($.fn.stampGenerator.canvasHtml(canvasId));
				// get canvas container
				var c = document.getElementById('csg-stamp-' + canvasId);
				var ctx = c.getContext('2d');
				// draw canvas
				ctx.drawCircle(radius, xCoord, yCoord, bgColor, strokeColor);
                if(i == 1){
                    ctx.fillStyle = fgColor;
                    ctx.font = textSize + 'px ' + textFont;
                    ctx.textAlign = 'center';
                    ctx.fillText(text, xCoord, yCoord + textSize/2);
                    i++;
                }else{
                    ctx.drawTextCircle(text, parseInt(radius) - parseInt(textPadding), xCoord, yCoord, 0, fgColor, textExpansion, textRepeat, textSize, textFont);
                }
			});
		},

		headerHtml : function(){
			var html = '<div id="csg-params-header">' +
						'<button id="csg-shape-add"><i class="fas fa-plus"></i>Circle</button>' +
						'<button id="csg-text-add"><i class="fas fa-plus"></i>Text</button>' +
						'<i class="fas fa-check"></i>'+
					'</div>';				
			return html;
		},		

		canvasHtml : function(){
			var resizeHandles = getHtmlResizeHandles();
			var html = '<div class="csg-bouding-box" id="csg-shape-' + canvasCount + '" data-id="' + canvasCount + '">'+
						getStampContextMenu() +
						'<div id="csg-stamp-' + canvasCount + '" class="csg-shape">'+
							'<div contenteditable="true" class="csg-text">APPROVED</div>'+
						'</div>'+
						resizeHandles +						
					'</div>';	
			canvasCount++;					
			return html;
		},

		shapeHtml : function(num){
			var html = '<div class="csg-params" id="csg-params-' + num + '">'+
				'<h2>Shape #' + num + '</h2>' +
				'<button class="csg-params-toggle">Edit</button>' +
				'<button class="csg-shape-remove">X</button>' +
				'<div>' +
					'<h3>Circle Properties</h3>' +
					'<table>' +
						'<thead>' +
							'<tr>' +
								'<td>radius</td>' +
								'<td>bg</td>' +
								'<td>stroke</td>' +
							'</tr>' +
						'</thead>' +
						'<tbody>' +
							'<tr>' +
								'<td><input type="number" id="csg-radius" value="50"/></td>' +
								'<td><div class="csg-color-picker" id="csg-bg-color-' + num + '"></div></td>' +
								'<td><div class="csg-color-picker" id="csg-stroke-color-' + num + '"></div></td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'<h3>Text Properties</h3>' +
					'<table>' +
						'<thead>' +
							'<tr>' +
								'<td>text</td>' +
							'</tr>' +
						'</thead>' +
						'<tbody>' +
							'<tr>' +
								'<td><input type="text" id="csg-text" value="this is my text + "/></td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'<table>' +
						'<thead>' +
							'<tr>' +
								'<td>color</td>' +
								'<td>expansion</td>' +
								'<td>repeat</td>' +
							'</tr>' +
						'</thead>' +
						'<tbody>' +
							'<tr>' +
								'<td><div class="csg-color-picker" id="csg-fg-color-' + num + '"></div></td>' +
								'<td><input type="number" id="csg-text-expansion" value="0.173" step="0.001"/></td>' +
								'<td><input type="number" id="csg-text-repeat" value="1"/></td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'<table>' +
						'<thead>' +
							'<tr>' +
								'<td>size</td>' +
								'<td>font</td>' +
							'</tr>' +
						'</thead>' +
						'<tbody>' +
							'<tr>' +
								'<td><input type="number" id="csg-text-size" value="10"/></td>' +
								'<td><input type="text" id="csg-text-font" value="Verdana"/></td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</div>' +
			'</div>';
			return html;
		}
	});

})(jQuery);

function makeResizable(element){
	// enable rotation, dragging and resizing features for current image
    element.resizable({
        // set restriction for image resizing to current document page        
        // set image resize handles
        handles: {           
            'ne': '.ui-resizable-ne',
            'se': '.ui-resizable-se',
            'sw': '.ui-resizable-sw',
            'nw': '.ui-resizable-nw'
        }		 
    }).draggable({
        // set restriction for image dragging area to current document page
        containment: $(element).parent()        
    });
}

function getStampContextMenu(){
	var html = '<div class="gd-context-menu csg-params">'+
	'<i class="fas fa-arrows-alt fa-sm" data-id="gd-image-signature-2"></i>'+
	'<div class="csg-background-color"></div><i class="fas fa-fill-drip"></i>'+
	'<div class="csg-border-width"></div>'+
	'<select>';
	for(i = 1; i <= 10; i++){
		html = html + '<option value="' + i + '">' + i + 'px</option>';
	}
	html = html + '</select>'+	
			'<div class="csg-border-color"></div><i class="far fa-square"></i>'+
			'<i class="fas fa-trash-alt fa-sm gd-delete-signature" data-id="gd-image-signature-2"></i>'+
			'</div>';
	return html;
}
/**
* Extend canvas functions
**/
CanvasRenderingContext2D.prototype.drawCircle = function(radius, x, y, bgColor, strokeColor){
	this.beginPath();
	this.arc(x, y, radius, 0, 2 * Math.PI);
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
