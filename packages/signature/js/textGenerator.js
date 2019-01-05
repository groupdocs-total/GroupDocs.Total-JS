/**
 * groupdocs.signature Plugin
 * Copyright (c) 2018 Aspose Pty Ltd
 * Licensed under MIT.
 * @author Aspose Pty Ltd
 * @version 1.0.0
 */

(function( $ ) {
    var paramValues = {
        text : 'gd-text',
        fontColor : 'gd-text-font-color',
        bold : 'gd-text-bold',
        italic : 'gd-text-italic',
        underline : 'gd-text-underline',
        font : 'gd-text-font',
        fontSize : 'gd-text-font-size',
        parentName : ''
    };
    var textContextMenuButtons = [getHtmlFontsSelect(),
        getHtmlFontSizeSelect(),
        '<i id="gd-text-bold" class="fas fa-bold"></i>',
        '<i id="' + paramValues.italic + '" class="fas fa-italic"></i>',
        '<i id="' + paramValues.underline + '" class="fas fa-underline"></i>',
        '<div id="' + paramValues.fontColor + '" class="gd-text-color-picker"></div>'];
	var properties = {};
	
	$.fn.textGenerator = function(parentName) {
		getFonts();
        $(this).append($.fn.textGenerator.baseHtml());

        paramValues.parentName = parentName;

        $('#' + parentName).find("#" + paramValues.fontColor).bcPicker();

		$('#' + parentName).on("change", "#" +  + paramValues.font, function(e) {
            var val = $(this).val();
            $('#' + parentName).find('#' + paramValues.text).css("font-family", val);
            properties.font = val;
		});
		
		$('#' + parentName).on("change", "#" +  + paramValues.fontSize, function(e) {
            var val = $(this).val();
            $('#' + parentName).find('#' + paramValues.text).css("font-size", val);
            properties.fontSize = val;
		});
		
		$('#' + parentName).on(userMouseClick, "#" +  + paramValues.bold, function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			$('#' + parentName).find('#' + paramValues.bold).toggleClass("active");
			if($('#' + parentName).find('#' + paramValues.text).css("font-weight") == "400") {
				$('#' + parentName).find('#' + paramValues.text).css("font-weight", "bold");
                properties.bold = true;
			} else {
				$('#' + parentName).find('#' + paramValues.text).css("font-weight", "unset");
                properties.bold = false;
            }
		});
		
		$('#' + parentName).on(userMouseClick, "#" +  + paramValues.italic, function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			$('#' + parentName).find('#' + paramValues.italic).toggleClass("active");
			if($('#' + parentName).find('#' + paramValues.text).css("font-style") != "italic") {
				$('#' + parentName).find('#' + paramValues.text).css("font-style", "italic");
                properties.italic = true;
			} else {
				$('#' + parentName).find('#' + paramValues.text).css("font-style", "unset");
                properties.italic = false;
			}	
		});
		
		$('#' + parentName).on(userMouseClick, "#" +  + paramValues.underline, function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			$('#' + parentName).find('#' + paramValues.underline).toggleClass("active");
			if($('#' + parentName).find('#' + paramValues.text).css("text-decoration").indexOf("underline") == -1) {
				$('#' + parentName).find('#' + paramValues.text).css("text-decoration", "underline");
                properties.underline = true;
			} else {
				$('#' + parentName).find('#' + paramValues.text).css("text-decoration", "unset");
                properties.underline = false;
			}	
		});
		
		$('#' + parentName).on(userMouseClick, ".bcPicker-color", function(e) {
            var css = $(this).css("background-color");
            $('#' + parentName).find('#' + paramValues.text).css("color", css);
            properties.fontColor = css;
		});
		
		$('#' + parentName).on(userMouseClick, ".fa-arrow-up", function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			if($(this).hasClass("down")){
				$('#' + parentName).find(".gd-text-menu").css("top", "unset");
			} else {
				$('#' + parentName).find(".gd-text-menu").css("top", "100px");
			}
			$(this).toggleClass("down");
		});
		initProps();
	};

	$.extend(true, $.fn.textGenerator, {
	    init : function (parent, props) {
	        if (! parent) {
	            return;
            }
            paramValues.parentName = parent;
	        if (props) {
                properties = props;
                $('#' + paramValues.parentName).find('#' + paramValues.text).css("color", props.fontColor);
                $('#' + paramValues.parentName).find('#' + paramValues.text).val(props.text);
                $('#' + paramValues.parentName).find('#' + paramValues.text).css("text-decoration", props.underline ? "underline" : "unset");
                $('#' + paramValues.parentName).find('#' + paramValues.text).css("font-style", props.italic ? "italic" : "unset");
                $('#' + paramValues.parentName).find('#' + paramValues.text).css("font-weight", props.bold ? "bold" : "unset");
                $('#' + paramValues.parentName).find('#' + paramValues.text).css("font-size", props.fontSize);
                $('#' + paramValues.parentName).find('#' + paramValues.text).css("font-family", props.font);
            } else {
                initProps();
            }
        },

        getProperties : function() {
            var text = $('#' + paramValues.parentName).find('#' + paramValues.text);
            properties.text = text.val();
            properties.width = text.width();
            properties.height = text.height();
			return properties;
		},

        baseHtml : function() {
            var html = '<textarea id="' + paramValues.text + '" class="gd-text">' +
                '</textarea>';
            return html;
        },

		getMenu : function () {
            var menuHtml = '<div class="gd-text-menu">';
            if (isMobile()) {
                menuHtml = menuHtml + '<div class="gd-blur"></div>';
            }
            $.each(textContextMenuButtons, function(index, button){
                menuHtml = menuHtml + button;
            });
            if(isMobile()){
                menuHtml = menuHtml + '<i class="fas fa-arrow-up"></i>';
            }
            menuHtml = menuHtml + '</div>';
            return menuHtml;
        }
	});

	function initProps() {
        var text = $('#' + paramValues.parentName).find('#' + paramValues.text);
        properties.underline = text.css("text-decoration").indexOf("underline") != -1;
        properties.italic = text.css("font-style") == "italic";
        properties.bold = text.css("font-weight") != "400";
        properties.width = text.width();
        properties.height = text.height();
        properties.fontColor = $('#' + paramValues.parentName).find("#" + paramValues.fontColor).css("background-color");
        properties.font = $('#' + paramValues.parentName).find("#" + paramValues.font).val();
        properties.fontSize = $('#' + paramValues.parentName).find("#" + paramValues.fontSize).val();
    }

    //////////////////////////////////////////////////
    // Get supported fonts
    //////////////////////////////////////////////////
    function getFonts() {
        $.ajax({
            type: 'GET',
            url: getApplicationPath("getFonts"),
            contentType: 'application/json',
            success: function(returnedData) {
                var fonts = $.fn.cssFonts();
                var resultFonts = [];
                $.each(fonts, function(index, font){
                    var existedFont = $.inArray(font, returnedData);
                    if (existedFont != -1) {
                        resultFonts.push(font);
                    }
                });
                var fontsSelect = getHtmlFontsSelect(resultFonts);

                textContextMenuButtons[0] = fontsSelect;

                refreshFontsContextMenu(paramValues.parentName, fontsSelect);
            },
            error: function(xhr, status, error) {
                var err = eval("(" + xhr.responseText + ")");
                console.log(err.Message);
            }
        });
    }

    /**
     * Prepare fonts select HTML
     * @param {array} fonts - array of available fonts
     */
    function getHtmlFontsSelect(fonts) {
        if (! fonts) {
            fonts = $.fn.cssFonts();
        }
        var fontsSelect = '<select id="' + paramValues.font + '" class="gd-fonts-select">';
        $.each(fonts, function(index, font){
            fontsSelect = fontsSelect + '<option value="' + font + '">' + font + '</option>';
        });
        fontsSelect = fontsSelect + '</select>';
        return fontsSelect;
    }

    /**
     * Prepare font sizes select HTML
     */
    function getHtmlFontSizeSelect(){
        var fontSizes = '<select id="' + paramValues.fontSize + '" class="gd-fonts-select gd-font-size-select">';
        for(var i = 8; i <= 20; i++){
            if(i == 16){
                fontSizes = fontSizes + '<option value="' + i + '" selected="selected">' + i + 'px</option>';
            } else {
                fontSizes = fontSizes + '<option value="' + i + '">' + i + 'px</option>';
            }
        }
        fontSizes = fontSizes + '</select>';
        return fontSizes;
    }
})(jQuery);
