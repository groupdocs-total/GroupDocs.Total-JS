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
    var menuButtons = [getHtmlFontsSelect(mergedFonts, paramValues.font),
        getHtmlFontSizeSelect(paramValues.fontSize),
        '<i id="gd-text-bold" class="fas fa-bold"></i>',
        '<i id="' + paramValues.italic + '" class="fas fa-italic"></i>',
        '<i id="' + paramValues.underline + '" class="fas fa-underline"></i>',
        '<div id="' + paramValues.fontColor + '" class="gd-text-color-picker"></div>'];
	var properties = {};

	$.fn.textGenerator = function() {
    };

	$.extend(true, $.fn.textGenerator, {
	    create: function(parentName) {
	        properties = {};

            paramValues.parentName = parentName;
            $('#' + paramValues.parentName).find('.gd-draw-text').append(baseHtml());

            $('#' + parentName).find("#" + paramValues.text).focus();

            $('#' + parentName).find("#" + paramValues.fontColor).bcPicker();

            $('#' + parentName).on("change", "#" + paramValues.font, function(e) {
                var val = $(this).val();
                $('#' + parentName).find('#' + paramValues.text).css("font-family", val);
                properties.font = val;
                setTimeout(saveTextSignatureIntoFile, 500);
            });

            $('#' + parentName).on("change", "#" + paramValues.fontSize, function(e) {
                var val = $(this).val();
                $('#' + parentName).find('#' + paramValues.text).css("font-size", val);
                properties.fontSize = val;
                setTimeout(saveTextSignatureIntoFile, 500);
            });

            $('#' + parentName).on(userMouseClick, "#" + paramValues.bold, function(e) {
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
                setTimeout(saveTextSignatureIntoFile, 500);
            });

            $('#' + parentName).on(userMouseClick, "#" + paramValues.italic, function(e) {
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
                setTimeout(saveTextSignatureIntoFile, 500);
            });

            $('#' + parentName).on(userMouseClick, "#" + paramValues.underline, function(e) {
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
                setTimeout(saveTextSignatureIntoFile, 500);
            });

            $('#' + parentName).on(userMouseClick, ".bcPicker-color", function(e) {
                $.fn.bcPicker.pickColor($(this));
                var css = $(this).css("background-color");
                $('#' + parentName).find('#' + paramValues.text).css("color", css);
                properties.fontColor = css;
                setTimeout(saveTextSignatureIntoFile, 500);
            });

            $('#' + parentName).on(userMouseClick, ".fa-arrow-up", function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                if($(this).hasClass("down")){
                    $('#' + parentName).find(".gd-text-menu").removeClass("gd-text-menu-top");
                    $('#' + parentName).find(".gd-text-menu").addClass("gd-text-menu-down");
                } else {
                    $('#' + parentName).find(".gd-text-menu").addClass("gd-text-menu-top");
                    $('#' + parentName).find(".gd-text-menu").removeClass("gd-text-menu-down");
                }
                $(this).toggleClass("down");
            });
            $('#' + parentName).on("keyup input", '#' + paramValues.text, $.debounce(500, function(e){
                saveTextSignatureIntoFile();
                })
            );
            initProps();
            initTextCss();
        },

	    init : function (parent, props, text, imageGuid) {
	        if (! parent) {
	            return;
            }
            paramValues.parentName = parent;
            if (props) {
                properties = props;

                $('#' + paramValues.parentName).find("#" + paramValues.fontColor).find('.bcPicker-picker').css("background-color", props.fontColor);
                if (props.underline) {
                    $('#' + paramValues.parentName).find('#' + paramValues.underline).toggleClass("active");
                }
                if (props.italic) {
                    $('#' + paramValues.parentName).find('#' + paramValues.italic).toggleClass("active");
                }
                if (props.bold) {
                    $('#' + paramValues.parentName).find('#' + paramValues.bold).toggleClass("active");
                }
                $('#' + paramValues.parentName).find("#" + paramValues.fontSize).val(props.fontSize);
                $('#' + paramValues.parentName).find("#" + paramValues.font).val(props.font);

                initTextCss();
                properties.id = paramValues.parentName.substring(paramValues.parentName.lastIndexOf('-') + 1);
            } else {
                initProps();
                properties.text = text;
                properties.imageGuid = imageGuid;
            }
        },

        refreshFonts : function() {
            var htmlFontsSelect = getHtmlFontsSelect(mergedFonts, paramValues.font);
            menuButtons[0] = htmlFontsSelect;
            $.each($("#" + paramValues.font), function (index, elem) {
                    $(htmlFontsSelect).insertBefore($(elem).parent().find("#" + paramValues.fontSize)[0]);
                    $(elem).remove();
                }
            );
        },

        getProperties : function() {
            var text = $('#' + paramValues.parentName).find('#' + paramValues.text);
            properties.text = text.val();
            properties.width = Math.round(text.width());
            properties.height = Math.round(text.height());
            if (!properties.imageGuid) {
                properties.imageGuid = $('#' + paramValues.parentName).find('.gd-draw-text')[0].attributes['image-guid'].value;
            }
			return properties;
		},

		getMenu : function () {
            var menuHtml = '<div class="gd-text-menu">';
            if (isMobile()) {
                menuHtml = menuHtml + '<div class="gd-blur"></div>';
            }
            $.each(menuButtons, function(index, button){
                menuHtml = menuHtml + button;
            });
            if(isMobile()){
                menuHtml = menuHtml + '<i class="fas fa-arrow-up"></i>';
            }
            menuHtml = menuHtml + '</div>';
            return menuHtml;
        }
	});

    function saveTextSignatureIntoFile() {
        var props = $.fn.textGenerator.getProperties();
        if (props.text) {
            var guid = $('#' + paramValues.parentName).find('.gd-draw-text')[0].attributes['image-guid'].value;
            if (props.imageGuid || guid) {
                saveDrawnText(props);
            } else {
                saveDrawnText(props,
                    function (data) {
                        $('#' + paramValues.parentName).find('.gd-draw-text')[0].attributes['image-guid'].value = data.imageGuid;
                    });
            }
        }
    }

    function baseHtml() {
        var html = '<textarea id="' + paramValues.text + '" class="gd-text">' +
            '</textarea>';
        return html;
    };

	function initProps() {
        var text = $('#' + paramValues.parentName).find('#' + paramValues.text);
        properties.id = paramValues.parentName.substring(paramValues.parentName.lastIndexOf('-') + 1);

        properties.width = text.width();
        properties.height = text.height();

        properties.underline = $('#' + paramValues.parentName).find('#' + paramValues.underline)[0].className.indexOf("active") > 0;
        properties.italic = $('#' + paramValues.parentName).find('#' + paramValues.italic)[0].className.indexOf("active") > 0;
        properties.bold = $('#' + paramValues.parentName).find('#' + paramValues.bold)[0].className.indexOf("active") > 0;
        properties.fontColor = $('#' + paramValues.parentName).find("#" + paramValues.fontColor).find('.bcPicker-picker').css("background-color");
        properties.font = $('#' + paramValues.parentName).find("#" + paramValues.font).val();
        properties.fontSize = $('#' + paramValues.parentName).find("#" + paramValues.fontSize).val();

    }

    function initTextCss() {
        var textField = $('#' + paramValues.parentName).find('#' + paramValues.text);
        textField.val(properties.text);
        textField.css("text-decoration", properties.underline ? "underline" : "unset");
        textField.css("font-style", properties.italic ? "italic" : "unset");
        textField.css("font-weight", properties.bold ? "bold" : "unset");
        textField.css("color", properties.fontColor);
        textField.css("font-family", properties.font);
        textField.css("font-size", properties.fontSize);
    }

})(jQuery);
