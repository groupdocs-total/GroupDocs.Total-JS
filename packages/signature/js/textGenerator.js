/**
 * groupdocs.signature Plugin
 * Copyright (c) 2018 Aspose Pty Ltd
 * Licensed under MIT.
 * @author Aspose Pty Ltd
 * @version 1.0.0
 */

(function( $ ) {
	var userMouseClick = ('ontouchstart' in document.documentElement)  ? 'touch click' : 'click';	
	var properties = {};
	
	$.fn.textGenerator = function() {		
		$('#gd-panzoom').on("change", ".gd-fonts-select", function(e) {
			$(e.target.parentElement.parentElement.parentElement).find("input").css("font-family", $(e.target).val());
		});
		
		$('#gd-panzoom').on("change", ".gd-font-size-select", function(e) {
			$(e.target.parentElement.parentElement.parentElement).find("input").css("font-size", $(e.target).val());
		});
		
		$('#gd-panzoom').on(userMouseClick, ".fa-bold", function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			$(e.target.parentElement.parentElement.parentElement).find(".fa-bold").toggleClass("active");
			if($(e.target.parentElement.parentElement.parentElement).find("input").css("font-weight") == "400") {			
				$(e.target.parentElement.parentElement.parentElement).find("input").css("font-weight", "bold");
			} else {
				$(e.target.parentElement.parentElement.parentElement).find("input").css("font-weight", "unset");				
			}			
		});
		
		$('#gd-panzoom').on(userMouseClick, ".fa-italic", function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			$(e.target.parentElement.parentElement.parentElement).find(".fa-italic").toggleClass("active");
			if($(e.target.parentElement.parentElement.parentElement).find("input").css("font-style") != "italic") {			
				$(e.target.parentElement.parentElement.parentElement).find("input").css("font-style", "italic");
			} else {
				$(e.target.parentElement.parentElement.parentElement).find("input").css("font-style", "unset");
			}	
		});
		
		$('#gd-panzoom').on(userMouseClick, ".fa-underline", function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			$(e.target.parentElement.parentElement.parentElement).find(".fa-underline").toggleClass("active");
			if($(e.target.parentElement.parentElement.parentElement).find("input").css("text-decoration").indexOf("underline") == -1) {			
				$(e.target.parentElement.parentElement.parentElement).find("input").css("text-decoration", "underline");
			} else {
				$(e.target.parentElement.parentElement.parentElement).find("input").css("text-decoration", "unset");
			}	
		});
		
		$('#gd-panzoom').on(userMouseClick, ".bcPicker-color", function(e) {
			$(e.target.parentElement.parentElement.parentElement.parentElement.parentElement).find("input").css("color", $(e.target).css("background-color"));			
		});
		
		$('#gd-panzoom').on(userMouseClick, ".fa-arrow-up", function(e) {	
			e.preventDefault();
			e.stopImmediatePropagation();
			if($(e.target).hasClass("down")){
				$(".gd-text-menu").css("top", "unset");					
			} else {
				$(".gd-text-menu").css("top", "100px");				
			}
			$(e.target).toggleClass("down");
		});
	}

	$.extend(true, $.fn.textGenerator, {
        getProperties : function(){
			var text = $(this).find('#' + paramValues.text).val();			
			var fontColor = $('#' + paramValues.fontColor).children().css('background-color');
			var bold = $(this).find('#' + paramValues.bold).is(':checked') ? true : false;
			var italic = $(this).find('#' + paramValues.italic).is(':checked') ? true : false;
			var underline = $(this).find('#' + paramValues.underline).is(':checked') ? true : false;
			var font = $(this).find('#' + paramValues.font).val();
			var fontSize = parseInt($(this).find('#' + paramValues.fontSize).val());
			properties = {
				text: text,
				borderColor: borderColor,
				borderStyle: borderStyle,
				borderWidth: borderWidth,
				backgroundColor: backgroundColor,
				fontColor: fontColor,
				bold: bold,
				italic: italic,
				underline: underline,
				font: font,
				fontSize: fontSize,
				width: paramValues.width,
				height: paramValues.height
			};
			return properties;
		}	
	});	
})(jQuery);