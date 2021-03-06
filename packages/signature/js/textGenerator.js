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
        fontSize: 'gd-text-font-size',
        fontSizePlus: 'gd-font-size-plus',
        fontSizeMinus: 'gd-font-size-minus',
        parentName : '',
        textMenuId: ''
    };
    var menuButtons = [getHtmlFontsSelect(mergedFonts, paramValues.font),
        getHtmlFontSizeSelect(paramValues.fontSize),
        '<i id="' + paramValues.bold + '" class="fas fa-bold"></i>',
        '<i id="' + paramValues.italic + '" class="fas fa-italic"></i>',
        '<i id="' + paramValues.underline + '" class="fas fa-underline"></i>',
        '<div id="' + paramValues.fontColor + '" class="gd-text-color-picker"></div>'];
	var properties = {};

	$.fn.textGenerator = function() {
    };

	$.extend(true, $.fn.textGenerator, {
	    create: function(parentName, textMenuId) {
	        properties = {};

            paramValues.parentName = parentName;
            paramValues.textMenuId = textMenuId;
            $('#' + paramValues.parentName).find('.gd-draw-text').append(baseHtml());

            $('#' + parentName).find("#" + paramValues.text).focus();

            $('#' + paramValues.textMenuId).find("#" + paramValues.fontColor).bcPicker({paletteClass: "text"});

            $('#' + paramValues.textMenuId).on("change", "#" + paramValues.font, function(e) {
                var val = $(this).val();
                $('#' + parentName).find('#' + paramValues.text).css("font-family", val);
                properties.font = val;
                setTimeout(saveTextSignatureIntoFile, 500);
            });

            $('#' + paramValues.textMenuId).on(userMouseClick, "#" + paramValues.fontSize, function (event) {
                $(event.target).select();
            });

            $('#' + paramValues.textMenuId).on("keyup", "#" + paramValues.fontSize, function (e) {
                if (isNaN(parseInt(e.target.value)) && e.target.value != "") {
                    e.target.value = properties.fontSize;
                }
                var val = parseInt(e.target.value) > 99 ? 99 : e.target.value;
                e.target.value = val;
                if (val) {
                    $(e.target).inputFilter(function (value) {
                        return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 99);
                    });
                    var cssVal = val + 'px';
                    $('#' + parentName).find('#' + paramValues.text).css("font-size", cssVal);
                    properties.fontSize = val;                    
                    setTimeout(saveTextSignatureIntoFile, 500);
                }
            });

            $('#' + paramValues.textMenuId).on(userMouseClick, "." + paramValues.fontSizePlus, function (e) {
                var val = parseInt($(event.target.parentElement).find(".gd-font-size").val()) + 1;
                val = val > 99 ? 99 : val;
                $(event.target.parentElement).find(".gd-font-size").val(val);
                if (val) {
                    var cssVal = val + 'px';
                    $('#' + parentName).find('#' + paramValues.text).css("font-size", cssVal);
                    properties.fontSize = val;
                    setTimeout(saveTextSignatureIntoFile, 500);
                }
            });

            $('#' + paramValues.textMenuId).on(userMouseClick, "." + paramValues.fontSizeMinus, function (e) {
                var val = parseInt($(event.target.parentElement).find(".gd-font-size").val()) - 1;
                val = val < 1 ? 1 : val;
                $(event.target.parentElement).find(".gd-font-size").val(val);
                if (val) {
                    var cssVal = val + 'px';
                    $('#' + parentName).find('#' + paramValues.text).css("font-size", cssVal);
                    properties.fontSize = val;
                    setTimeout(saveTextSignatureIntoFile, 500);
                }
            });

            $('#' + paramValues.textMenuId).on(userMouseClick, "#" + paramValues.bold, function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                $('#' + paramValues.textMenuId).find('#' + paramValues.bold).toggleClass("active");
                if($('#' + parentName).find('#' + paramValues.text).css("font-weight") == "400") {
                    $('#' + parentName).find('#' + paramValues.text).css("font-weight", "bold");
                    properties.bold = true;
                } else {
                    $('#' + parentName).find('#' + paramValues.text).css("font-weight", "unset");
                    properties.bold = false;
                }
                setTimeout(saveTextSignatureIntoFile, 500);
            });

            $('#' + paramValues.textMenuId).on(userMouseClick, "#" + paramValues.italic, function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                $('#' + paramValues.textMenuId).find('#' + paramValues.italic).toggleClass("active");
                if($('#' + parentName).find('#' + paramValues.text).css("font-style") != "italic") {
                    $('#' + parentName).find('#' + paramValues.text).css("font-style", "italic");
                    properties.italic = true;
                } else {
                    $('#' + parentName).find('#' + paramValues.text).css("font-style", "unset");
                    properties.italic = false;
                }
                setTimeout(saveTextSignatureIntoFile, 500);
            });

            $('#' + paramValues.textMenuId).on(userMouseClick, "#" + paramValues.underline, function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                $('#' + paramValues.textMenuId).find('#' + paramValues.underline).toggleClass("active");
                if($('#' + parentName).find('#' + paramValues.text).css("text-decoration").indexOf("underline") == -1) {
                    $('#' + parentName).find('#' + paramValues.text).css("text-decoration", "underline");
                    properties.underline = true;
                } else {
                    $('#' + parentName).find('#' + paramValues.text).css("text-decoration", "unset");
                    properties.underline = false;
                }
                setTimeout(saveTextSignatureIntoFile, 500);
            });

            $('#' + paramValues.textMenuId).on(userMouseClick, ".bcPicker-color", function(e) {
                $.fn.bcPicker.pickColor($(this));
                var css = $(this).css("background-color");
                $('#' + parentName).find('#' + paramValues.text).css("color", css);
                properties.fontColor = css;
                setTimeout(saveTextSignatureIntoFile, 500);
            });

            $('#' + paramValues.textMenuId).on(userMouseClick, ".fa-arrow-up", function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                if($(this).hasClass("down")){
                    $('#' + paramValues.textMenuId).removeClass("gd-text-menu-top");
                    $('#' + paramValues.textMenuId).addClass("gd-text-menu-down");
                } else {
                    $('#' + paramValues.textMenuId).addClass("gd-text-menu-top");
                    $('#' + paramValues.textMenuId).removeClass("gd-text-menu-down");
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
	        paramValues.textMenuId = $('#' + paramValues.parentName).attr('data-textMenuId');
            if (props) {
                properties = props;

                $('#' + paramValues.textMenuId).find("#" + paramValues.fontColor).find('.bcPicker-picker').css("background-color", props.fontColor);
                if (props.underline) {
                    $('#' + paramValues.textMenuId).find('#' + paramValues.underline).toggleClass("active");
                }
                if (props.italic) {
                    $('#' + paramValues.textMenuId).find('#' + paramValues.italic).toggleClass("active");
                }
                if (props.bold) {
                    $('#' + paramValues.textMenuId).find('#' + paramValues.bold).toggleClass("active");
                }
                $('#' + paramValues.textMenuId).find("#" + paramValues.fontSize).val(props.fontSize);
                $('#' + paramValues.textMenuId).find("#" + paramValues.font).val(props.font);

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
                properties.imageGuid = $('#' + paramValues.parentName).find('.gd-draw-text')[0].attributes['data-image-guid'].value;
            }
			return properties;
		},

		getMenu : function (menuClass, signatureId) {
	        var id = "menu-" + signatureId;
	        paramValues.textMenuId = id;
            var menuHtml = '<div id="' + id + '" class="gd-text-menu ' + menuClass+ '">';
            if (isMobile()) {
                menuHtml = menuHtml + '<div class="gd-blur"></div>';
            }
            $.each(menuButtons, function(index, button){
                menuHtml = menuHtml + button;
            });

            menuHtml = menuHtml + '</div>';
            return menuHtml;
        }
	});

    function saveTextSignatureIntoFile() {
        var props = $.fn.textGenerator.getProperties();
        if (props.text) {
            var guid = $('#' + paramValues.parentName).find('.gd-draw-text')[0].attributes['data-image-guid'].value;
            if (props.imageGuid || guid) {
                saveDrawnText(props);
            } else {
                saveDrawnText(props,
                    function (data) {
                        $('#' + paramValues.parentName).find('.gd-draw-text')[0].attributes['data-image-guid'].value = data.imageGuid;
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

        properties.underline = $('#' + paramValues.textMenuId).find('#' + paramValues.underline)[0].className.indexOf("active") > 0;
        properties.italic = $('#' + paramValues.textMenuId).find('#' + paramValues.italic)[0].className.indexOf("active") > 0;
        properties.bold = $('#' + paramValues.textMenuId).find('#' + paramValues.bold)[0].className.indexOf("active") > 0;
        properties.fontColor = $('#' + paramValues.textMenuId).find("#" + paramValues.fontColor).find('.bcPicker-picker').css("background-color");
        properties.font = $('#' + paramValues.textMenuId).find("#" + paramValues.font).val();
        properties.fontSize = $('#' + paramValues.textMenuId).find("#" + paramValues.fontSize).find(".gd-font-size").val();

    }

    function initTextCss() {
        var textField = $('#' + paramValues.parentName).find('#' + paramValues.text);
        initCssForTextField(textField, properties);
    }

})(jQuery);
