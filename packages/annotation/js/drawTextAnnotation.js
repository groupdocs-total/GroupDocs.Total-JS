/**
 * groupdocs.annotation Plugin
 * Copyright (c) 2018 Aspose Pty Ltd
 * Licensed under MIT.
 * @author Aspose Pty Ltd
 * @version 1.3.0
 */
 
//////////////////////////////////////////////////
// Fix required by Edge browser to support prepend function
//////////////////////////////////////////////////  
 (function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('prepend')) {
      return;
    }
    Object.defineProperty(item, 'prepend', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function prepend() {
        var argArr = Array.prototype.slice.call(arguments),
          docFrag = document.createDocumentFragment();

        argArr.forEach(function (argItem) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
        });

        this.insertBefore(docFrag, this.firstChild);
      }
    });
  });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

$(document).ready(function () {
    //////////////////////////////////////////////////
    // enter text event
    //////////////////////////////////////////////////  
    $("#gd-panzoom").bind("keyup", ".gd-replace-text-area-text", function (event) {
        var id = $(event.target).data("id");
        $.each(annotationsList, function (index, elem) {
            if (elem.id == id) {
                elem.text = $(event.target).val();
            } else {
                return true;
            }
        });
    });  
});

(function ($) {

    /**
	* Create private variables.
	**/
    var mouse = {
        x: 0,
        y: 0
    };
    var previouseMouse = {
        x: 0,
        y: 0
    };
    var startX = 0;
    var startY = 0;
    var element = null;
    var annotationInnerHtml = null;
    var lineInnerHtml = null;
    var currentPrefix = "";
    var idNumber = null;
	var documentFormat = "";
    var userMouseUp = ('ontouchend' in document.documentElement) ? 'touchend mouseup' : 'mouseup';
    var userMouseMove = ('ontouchmove' in document.documentElement) ? 'touchmove mousemove' : 'mousemove';
   
    /**
	 * Draw text annotation
	 * @param {Object} canvas - document page to add annotation
	 * @param {Array} annotationsList - List of all annotations
	 * @param {Object} annotation - Current annotation
	 * @param {int} annotationsCounter - Current annotation number
	 * @param {String} prefix - Current annotation prefix
	 * @param {Object} ev - Current event
	 */
    $.fn.drawTextAnnotation = function (canvas, annotationsList, annotation, annotationsCounter, prefix, ev) {
        currentPrefix = prefix;		
        // get current annotation id
        idNumber = annotationsCounter;
        // get mouse position
        mouse = getMousePosition(ev)
		documentFormat = getDocumentFormat(documentGuid).format;
        // draw the annotation
        if (element == null && ($(ev.target).prop("tagName") == "IMG" || $(ev.target).prop("tagName") == "svg")) {
            annotation.id = idNumber;
            // set mouse cursor style
            // set start position
            startX = mouse.x;
            startY = mouse.y;
            // create HTML markup for the annotation element
            element = document.createElement('div');
            element.className = 'gd-annotation gd-bounding-box';
            // calculate start point coordinates according to the document page           
            var x = mouse.x;
            var y = mouse.y;
            // draw the annotation
            switch (currentPrefix) {
                case "area":
                    element.style.left = x + "px";
                    element.style.top = y + "px";
                    annotationInnerHtml = getAnnotationHtml();
                    break;
                case "textField":
                    element.style.left = x + "px";
                    element.style.top = y + "px";
                    annotationInnerHtml = getTextFieldAnnotationHtml();
                    break;
                case "watermark":
                    element.style.left = x + "px";
                    element.style.top = y + "px";
                    annotationInnerHtml = getWatermarkAnnotationHtml();
                    break;
                case "textStrikeout":
                    // get text coordinates data - required since the annotation of this type can be added only over the text                    
                    element.style.left = x + "px";
                    element.style.top = y + "px";                    
                    annotationInnerHtml = getTextLineAnnotationHtml();
                    lineInnerHtml = getLineHtml();
                    break;
                case "resourcesRedaction":
                    element.style.left = x + "px";
                    element.style.top = y + "px";
                    annotationInnerHtml = getAnnotationHtml();
                    break;
                case "textUnderline":
                    // get text coordinates data - required since the annotation of this type can be added only over the text                   
                    element.style.left = x + "px";
                    element.style.top = y + "px";                 
                    annotationInnerHtml = getTextLineAnnotationHtml();
                    lineInnerHtml = getLineHtml();
                    break;
                default:
                    // get text coordinates data - required since the annotation of this type can be added only over the text                   
                    element.style.left = x + "px";
                    element.style.top = y + "px";                  
                    annotationInnerHtml = getAnnotationHtml();
                    break;
            }
            // set annotation data
            annotation.left = parseFloat(element.style.left.replace("px", ""));
            annotation.top = parseFloat(element.style.top.replace("px", ""));
            // append line element if the annotation is text strikeout or underline
            element.appendChild(annotationInnerHtml);
            setupContextMenu(element,currentPrefix, annotation);
            if (lineInnerHtml != null) {
                element.appendChild(lineInnerHtml);
            }
            // prepend annotation element into the document page
			element.setAttribute("data-id", $(element).find(".annotation").attr("id"));
            canvas.prepend(element);
            annotationsList.push(annotation);
        } else {
            // drop all data when draw is finished
            canvas.onmousemove = null;
            if ($(ev.target).prop("tagName") === "IMG") {
                annotationsList[annotationsList.length - 1].width = parseFloat(element.style.width.replace("px", ""));
                annotationsList[annotationsList.length - 1].height = parseFloat(element.style.height.replace("px", ""));
            }
            element = null;
            annotationInnerHtml = null;
            lineInnerHtml = null;
        }
        fixContextZoom(getZoomValue());
        // set mouse up event
        // this handler used to get annotation width and height after draw process
        $(canvas).on(userMouseUp, function (e) {
            if (['textField','watermark'].indexOf(currentPrefix) >= 0) {
                attachTextFieldBehaviour(element, annotation);
                attachTextStyleChangeBehaviour(element, annotation);              
            }
            if (element != null && e.target.tagName !== "TEXTAREA") {
                if (currentPrefix === "textReplacement") {
                    element.appendChild(getTextReplaceAnnotationHtml(idNumber));
                }
                if ($(ev.target).prop("tagName") === "IMG") {
                    annotationsList[annotationsList.length - 1].width = parseFloat(element.style.width.replace("px", ""));
                    annotationsList[annotationsList.length - 1].height = parseFloat(element.style.height.replace("px", ""));
                    addComment(annotationsList[annotationsList.length - 1]);
                }
            }
            makeResizable(annotation, element);
            annotationInnerHtml = null;
            lineInnerHtml = null;
            element = null;
            previouseMouse = {
                x: 0,
                y: 0
            };
            $(canvas).off(userMouseUp);
            $(canvas).off(userMouseMove);
        });

        // set mouse move event
        // this handler used to get annotation width and height while draw process
        $(canvas).on(userMouseMove, function (e) {
            if (currentPrefix === "textField") {
                return true;
            }
            
            mouse = getMousePosition(e);
            if (element !== null) {   
                var currentWidth = (isNaN(parseInt(element.style.width))) ? 0 : parseInt(element.style.width);
                var currentHeight = (isNaN(parseInt(element.style.height))) ? 0 : parseInt(element.style.height);
                if (mouse.x != 0) {
                    element.style.width = Math.abs(startX - mouse.x) + "px";
                }
                if (mouse.y != 0) {
                    element.style.height = Math.abs(startY - mouse.y) + "px";
                }
                // set annotation data
                annotation.width = parseFloat(element.style.width.replace("px", ""));
                annotation.height = parseFloat(element.style.height.replace("px", ""));
                if (annotationInnerHtml) {
                    annotationInnerHtml.style.width = parseFloat(element.style.width) + "px";
                    annotationInnerHtml.style.height = parseFloat(element.style.height) + "px";
                }
                setTextFieldSize(annotation, $(element).find('textarea'));
                previouseMouse = mouse;
            }
        });
    };

    /**
	 * Import text annotation
	 * @param {Object} canvas - document page to add annotation
	 * @param {Array} annotationsList - List of all annotations
	 * @param {Object} annotation - Current annotation
	 * @param {int} annotationsCounter - Current annotation number	
	 * @param {String} prefix - Current annotation prefix
	 */
    $.fn.importTextAnnotation = function (canvas, annotationsList, annotation, annotationsCounter, prefix) {
        // check if the annotation with the same coordinates are already added.
        // we use this since the GroupDocs.Annotation library returns all annotation comments from the Word document as a new annotation		
        currentPrefix = prefix;
        idNumber = annotationsCounter;
        annotation.id = idNumber;
        // prepare annotation HTML markup
        element = document.createElement('div');
        element.className = 'gd-annotation gd-bounding-box';
		documentFormat = getDocumentFormat(documentGuid).format;
        switch (currentPrefix) {
            case "textStrikeout":
                element.style.left = annotation.left + "px";
                element.style.top = annotation.top + "px";
                element.style.height = annotation.height + "px"
                annotationInnerHtml = getTextLineAnnotationHtml();
                annotationInnerHtml.style.height = annotation.height + "px";
                annotationInnerHtml.style.width = annotation.width + "px";
                lineInnerHtml = getLineHtml();
                break;
            case "textField":
                element.style.left = annotation.left + "px";
                element.style.top = annotation.top + "px";
                annotationInnerHtml = getTextFieldAnnotationHtml();
                break;
            case "watermark":
                element.style.left = annotation.left + "px";
                element.style.top = annotation.top + "px";
                annotationInnerHtml = getWatermarkAnnotationHtml();
                break;
            case "textUnderline":
                element.style.left = annotation.left + "px";
                element.style.top = annotation.top + "px";
                element.style.height = annotation.height + "px";
                element.style.width = annotation.width + "px";
                annotationInnerHtml = getTextLineAnnotationHtml();
                annotationInnerHtml.style.height = annotation.height + "px";
                annotationInnerHtml.style.width = annotation.width + "px";
                lineInnerHtml = getLineHtml();
                break;
            case "textRedaction":
                //var dimensions = getRectangleFromPath(JSON.parse(annotation.svgPath));
                // workaround bug in annotation lib
                // TODO : remove when fixed                
                element.style.top = annotation.top + "px";
                // end workaround bug in annotation lib
                element.style.left = annotation.left + "px";
                element.style.height = annotation.height + "px";
                element.style.width = annotation.width + "px";
                annotationInnerHtml = getTextLineAnnotationHtml();
                lineInnerHtml = getLineHtml();
                break;
            default:
                element.style.left = annotation.left + "px";
				if(prefix === "textReplacement"){
					 element.style.top = ($(canvas).height() - annotation.top) + "px";
				} else {
					element.style.top = annotation.top + "px";
				}
                element.style.height = annotation.height + "px";
                element.style.width = annotation.width + "px";
                annotationInnerHtml = getAnnotationHtml();
                annotationInnerHtml.style.height = annotation.height + "px";
                annotationInnerHtml.style.width = annotation.width + "px";
                break;
        }
        // draw imported annotation
        element.appendChild(annotationInnerHtml);
        setupContextMenu(element,currentPrefix,annotation);

        if (['textField','watermark'].indexOf(currentPrefix) >= 0) {
            attachTextFieldBehaviour(element, annotation, "move");
            attachTextStyleChangeBehaviour(element, annotation);
            var textarea = $(element).find('textarea');
            var color = "#" + annotation.fontColor.toString(16);
            textarea.css("color", color);
            textarea.parent().find("pre").css("color", color);       
            var fontSize = annotation.fontSize;           
            textarea.css("font-size", fontSize + "px");
            textarea.parent().find("pre").css("font-size", fontSize + "px");
            textarea.css("line-height", fontSize + "px");
            textarea.parent().find("pre").css("line-height", fontSize + "px");  
            $(element).find(".bcPicker-picker").css("background-color", color);
            setTextFieldSize(annotation, textarea);
        }
        if (lineInnerHtml != null) {
            element.appendChild(lineInnerHtml);
			lineInnerHtml = null;
        }
		if(prefix === "textReplacement"){
			element.appendChild(getTextReplaceAnnotationHtml(annotation.id));
			$(element).find("textarea").val(annotation.text);
		}
		element.setAttribute("data-id", $(element).find(".annotation").attr("id"));
        canvas.prepend(element);
        // add annotation into the annotations list
        annotationsList.push(annotation);
        makeResizable(annotation,element);
        addComment(annotation);       
    };

    function getAnnotationHtml() {
        var annotationHtml = document.createElement('div');
        annotationHtml.className = (documentFormat == "Portable Document Format") ? 'gd-' + currentPrefix + '-annotation-pdf annotation' : 'gd-' + currentPrefix + '-annotation annotation';
        annotationHtml.id = 'gd-' + currentPrefix + '-annotation-' + idNumber;		
        return annotationHtml;
    }

    function getTextFieldAnnotationHtml() {
        var wrapper = document.createElement('div');
        wrapper.className = 'gd-textField-wrapper';
        var cloned = document.createElement('pre');
        cloned.id = 'gd-' + currentPrefix + '-annotation-' + idNumber + '-cloned';
        cloned.className = 'gd-' + currentPrefix + '-annotation clone';
        var annotationHtml = document.createElement('textarea');
        annotationHtml.className = 'gd-' + currentPrefix + '-annotation annotation';
        annotationHtml.id = 'gd-' + currentPrefix + '-annotation-' + idNumber;
        wrapper.appendChild(annotationHtml);
        wrapper.appendChild(cloned);
        return wrapper;
    }

    function getWatermarkAnnotationHtml() {
        var wrapper = document.createElement('div');
        wrapper.className = 'gd-watermark-wrapper';
        var cloned = document.createElement('pre');
        cloned.id = 'gd-' + currentPrefix + '-annotation-' + idNumber + '-cloned';
        cloned.className = 'gd-' + currentPrefix + '-annotation clone';
        var annotationHtml = document.createElement('textarea');
        annotationHtml.className = 'gd-' + currentPrefix + '-annotation annotation';
        annotationHtml.id = 'gd-' + currentPrefix + '-annotation-' + idNumber;
        wrapper.appendChild(annotationHtml);
        wrapper.appendChild(cloned);
        return wrapper;
    }

    function getTextReplaceAnnotationHtml() {
        var annotationHtml = document.createElement('div');
        annotationHtml.className = "gd-replace-text-area annotation";
        annotationHtml.id = 'gd-' + currentPrefix + '-annotation-' + idNumber;
        annotationHtml.innerHTML = '<div class="gd-replace-tab">Replace</div>' +
									'<textarea class="gd-replace-text-area-text mousetrap" data-id="' + idNumber + '">replace text</textarea>';

        return annotationHtml;
    }

    function getTextLineAnnotationHtml() {
        var annotationHtml = document.createElement('div');
        annotationHtml.className = (documentFormat == "Portable Document Format") ? 'gd-' + currentPrefix + '-annotation gd-text-annotation-pdf annotation' : 'gd-' + currentPrefix + '-annotation gd-text-annotation annotation';
        annotationHtml.id = 'gd-' + currentPrefix + '-annotation-' + idNumber;		
        return annotationHtml;
    }

    function getLineHtml() {
        var annotationHtml = document.createElement('div');
        annotationHtml.className = 'gd-' + currentPrefix + '-line';		
        return annotationHtml;
    }

    function attachTextFieldBehaviour(element,annotation,mode){
        var textarea = $(element).find('textarea');
        var clone = textarea.parent().find('.clone');
        var nativechange = false;
        textarea.keydown(function (e) {
            var elm = textarea.get()[0];
            var start = elm.selectionStart;
            var end = elm.selectionEnd;
            if([37,39,46,9,18,16,127,38,27,17,20,40,91].indexOf(e.keyCode) < 0 && !e.metaKey){
                annotation.text = annotation.text ? annotation.text : '';
                if(e.keyCode === 13){
                    annotation.text = annotation.text.slice(0, start) + "\n" + annotation.text.slice(end);
                }else if(e.keyCode === 8){
                    annotation.text = annotation.text.slice(0, start - (start === end ? 1 : 0)) + annotation.text.slice(end);
                }else{
                    annotation.text = annotation.text.slice(0, start) + e.key + annotation.text.slice(end);
                }
                e.stopPropagation();
                e.preventDefault();
                updateTextFieldSize(annotation,textarea);
                elm.selectionStart = elm.selectionEnd = start + 1;
            }
            if(e.metaKey){
                nativechange = true;
            }
        });
        textarea.bind('paste',function (e) {
            nativechange = true;
        });
        textarea.keyup(function (e) {
            if(nativechange){
                annotation.text = textarea.val();
                updateTextFieldSize(annotation,textarea);
                nativechange = !nativechange;
            }
        });
        textarea.blur(function () {
            textarea.hide();
            clone.show();
        });
        clone.dblclick(function () {
            textarea.show();
            clone.hide();
            textarea.focus();
        });
        setTextFieldSize(annotation,textarea);
        if(mode && mode === 'move'){
            clone.show();
            textarea.hide();
            textarea.blur();
        }else{
            clone.hide();
            textarea.show();
            textarea.focus();
        }

    }

    function attachTextStyleChangeBehaviour(element, annotation) {    
        $(element).find('.bcPicker-color').click(function (event) {
            $.fn.bcPicker.pickColor($(this));
            var color = $(this).parent().parent().find(".bcPicker-picker").css("background-color");
            var textarea = $(element).find('textarea');
            textarea.css("color", color);
            textarea.parent().find("pre").css("color", color);           
            var hex = $.fn.bcPicker.toHex(color);
            var intColor = parseInt(hex.replace("#", ""), 16);
            annotation.fontColor = intColor;
        });

        $(element).find('.gd-font-size').change(function (event) {          
            var fontSize = $(this).val();
            var textarea = $(element).find('textarea');
            textarea.css("font-size", fontSize + "px");
            textarea.parent().find("pre").css("font-size", fontSize + "px");  
            textarea.css("line-height", fontSize + "px");
            textarea.parent().find("pre").css("line-height", fontSize + "px");  
            annotation.fontSize = fontSize;
            updateTextFieldSize(annotation, textarea);            
        });
    }

    function emptySpaceOnLineEnd(annotation){
        return (annotation.text.charAt(annotation.text.length - 1) === "\n" ? ' ' : '')
    }

    function setTextFieldSize(annotation, textarea) {
        var original = $(textarea);
        var wrapper = original.parent();
        var clone = original.parent().find('.clone');
        var boundingBox = original.closest('.gd-bounding-box');
        clone.text(annotation.text + emptySpaceOnLineEnd(annotation));
        original.val(annotation.text);

        var borderCompensation = annotation.type === 'textField' ? 4 : 2;

        var width = (annotation.width || clone.width()) + borderCompensation;
        var height = (annotation.height || clone.height()) + borderCompensation;

        wrapper.width(width);
        wrapper.height(height);

        boundingBox.width(width);
        boundingBox.height(height);
        if(annotation.type === 'textField'){
            boundingBox.css('margin','1px');
        }

    }

    function updateTextFieldSize(annotation, textarea){
        var original = $(textarea);
        var cloneValue = annotation.text;
        var wrapper = original.parent();
        var clone = original.parent().find('.clone');
        var boundingBox = original.closest('.gd-bounding-box');
        var borderCompensation = 2;

        clone.text(cloneValue + emptySpaceOnLineEnd(annotation));

        var width = clone.width() + borderCompensation;
        var height = clone.height() + borderCompensation;

        wrapper.width(width);
        wrapper.height(height);
        boundingBox.width(width);
        boundingBox.height(height);
        if(annotation.type === 'textField'){
            boundingBox.css('margin','1px');
        }

        annotation.width = width;
        annotation.height = height;

        original.val(annotation.text);
    }

    function setupContextMenu(element, currentPrefix, annotation) {
        if(['textField','watermark'].indexOf(currentPrefix) >= 0){
            $(element).append(getContextMenu(annotation.id,true));
            var contextMenu = $(element).find('.gd-context-menu');
            var editButton = contextMenu.find('.fa-i-cursor');
            var textarea = $(element).find('textarea');
            var clone = textarea.parent().find('.clone');

            contextMenu.width(178);
            editButton.click(function () {
                clone.hide();
                textarea.show();
                textarea.focus();
            })
            var textColorButton = getTextColorButton();
            var fontSizeSelect = getFontSizeHtml(annotation.fontSize);
            $(textColorButton).insertAfter(contextMenu.find(".gd-edit-text-field"));
            $(fontSizeSelect).insertAfter(contextMenu.find(".gd-edit-text-field"));
            var colorPicker = contextMenu.find(".gd-text-color-picker");
            colorPicker.bcPicker();                   
        }else{
            $(element).append(getHtmlResizeHandles() + getContextMenu(annotation.id));
        }
        return element;
    }

    function getTextColorButton() {
        return '<div class="gd-text-color-picker"></div>';
    }  

    function getFontSizeHtml(currentSize) {
        var options = "";
        for (i = 10; i <= 40; i++) {
            if (i == currentSize) {
                options = options + '<option value="' + i + '"  selected="selected">' + i + 'px</option>';
            } else {
                options = options + '<option value="' + i + '">' + i + 'px</option>';
            }
        }
        return '<select class="gd-font-size">' +
            options +
            '</select>';
    }
})(jQuery);
