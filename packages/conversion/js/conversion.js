/**
 * GroupDocs.Conversion.JS
 * Copyright (c) 2001-2018 Aspose Pty Ltd
 * Licensed under MIT
 * @author Aspose Pty Ltd
 * @version 1.0.0
 */

/*
******************************************************************
******************************************************************
GLOBAL VARIABLES
******************************************************************
******************************************************************
*/
var applicationPath;
var currentDirectory;
var rewrite;
var allConvertionTypes = [];
var userMouseClick = ('ontouch' in document.documentElement) ? 'touch click' : 'click';

$(document).ready(function () {

    /*
    ******************************************************************
    NAV BAR CONTROLS
    ******************************************************************
    */

    //////////////////////////////////////////////////
    // Disable default file browse click event
    //////////////////////////////////////////////////
    $("#gd-btn-browse").off(userMouseClick);

    $("#gd-btn-browse").on(userMouseClick, function () {
        loadFiles('');
    });

    $('#modalDialog').on(userMouseClick, function (event) {
        if ($(event.target).hasClass("fa-plus") && !$(event.target).parent().hasClass("active")) {
            event.preventDefault();
            $("#modalDialog").find(".gd-conversion-input").prop("checked", false);
            $("#modalDialog").find(".gd-conversions.active").removeClass("active");
            $(event.target).parent().find(".gd-conversion-input").prop("checked", true);
            $(event.target).parent().addClass("active");
            return;
        }
        if (event.target.tagName != "LABEL" && event.target.tagName != "LI") {
            $(event.target).parent().find(".gd-conversion-input").prop("checked", false);
            $("#modalDialog").find(".gd-conversions.active").removeClass("active");
        }        
    });
    
    $('.gd-modal-body').on(userMouseClick, ".gd-add-selected.active", function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(event.target).find(".gd-conversion-input").prop("checked", true);
    });

    $('.gd-modal-body').on(userMouseClick, ".gd-select-all", function () {
        $(".gd-checkbox").prop('checked', true);
        guids = [];
        $.each($(".gd-filetree-name"), function (index, fileName) {
            if (!~getDocumentFormat($(fileName).data("guid")).format.indexOf("not supported")) {
                guids.push($(fileName).data("guid"));
            }
        });
        $(".gd-add-selected").addClass("active");
        var addSelectedInnerHtml = '<i class="fa fa-plus"></i><label>Add ' + guids.length + ' selected</label>';
        $(".gd-add-selected").html(addSelectedInnerHtml);
        var types = prepareMultipleConversionTypes(true);
        var dropDown = getConversiontypesHtml(types, true);
        $(".gd-add-selected").append(dropDown);
        
    });
});

/**
* Load file tree
* @param {string} dir - files location directory
*/
function loadFiles(dir) {
    var data = { path: dir };
    currentDirectory = dir;
    // clear previously entered password
    clearPassword();
    // show loading spinner
    $('#gd-modal-spinner').show();
    // get data
    $.ajax({
        type: 'POST',
        url: getApplicationPath('loadFileTree'),
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (returnedData) {
            if (returnedData.message != undefined) {
                // open error popup
                printMessage(returnedData.message);
                return;
            }            
            // assembly modal html
            $('.gd-modal-body').html(''); // clear previous data
            toggleModalDialog(true, "Open Document", getHtmlFileBrowser(true));
            initDragNDrop();
            // hide loading spinner
            $('#gd-modal-spinner').hide();
            // append files to tree list
            $.each(returnedData, function (index, elem) {                
                // document name
                var name = elem.name;
                // document guid
                var guid = elem.guid;
                // document size
                var size = elem.size;
                // convert to proper size
                var new_size = size + ' Bytes';
                if ((size / 1024 / 1024) > 1) {
                    new_size = (Math.round((size / 1024 / 1024) * 100) / 100) + ' MB';
                } else if ((size / 1024) > 1) {
                    new_size = (Math.round((size / 1024) * 100) / 100) + ' KB';
                }
                // document format
                var docFormat = (getDocumentFormat(name, elem.isDirectory) == undefined) ? 'fa-folder' : getDocumentFormat(name, elem.isDirectory);
                var folderClass = (docFormat.format == "") ? "gd-folder-name" : "";
                var checkBoxes = '<div class="gd-file-checkbox"><input type="checkbox" id="' + name + '" name="' + name + '" class="gd-checkbox"></div>';
                var conversionTypes = getConversiontypesHtml(elem.conversionTypes, false); 
                addAllConversionTypes(elem);
                // append document
                $('.gd-modal-table-body').append(
                    '<div class="gd-file-table-item">' +
                    checkBoxes +
                    '<div class="gd-filetree-name" data-guid="' + guid + '">' +
                    '<i class="fa ' + docFormat.icon + '"></i>' +
                    '<div class="gd-file-name ' + folderClass + '">' + name +
                    '<div class="gd-file-format">' + docFormat.format + '</div>' +
                    '</div>' +
                    '</div >' +
                    '<div class="gd-file-size">' + new_size + '</div>' +
                    conversionTypes +
                    '</div>');
            });
        },
        error: function (xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.Message);
            // hide loading spinner
            $('#gd-modal-spinner').hide();
            // open error popup
            printMessage(err.message);
        }
    });
}

function addAllConversionTypes(types) {
    if (types.conversionTypes.length > 0) {
        var properties = $.grep(allConvertionTypes, function (e) { return e.guid == types.guid; });
        if (properties.length == 0) {
            var conversionElement = { guid: types.guid, conversions: types.conversionTypes };
            allConvertionTypes.push(conversionElement);
        }
    }
}

function prepareMultipleConversionTypes(all) {
    if (all) {
        var allTypes = [];
        $.each(allConvertionTypes, function (index, element) {
            $.each(element.conversions, function (index, type) {
                var types = $.grep(allTypes, function (e) { return e == type; });
                if (types.length == 0) {
                    allTypes.push(type);
                }
            });
        });
    }
    return allTypes;
}

function getConversiontypesHtml(types, multiple) {
    var conversionTypes = '';   
    if (types.length > 0) {
        $.each(types, function (index, type) {
            conversionTypes = conversionTypes + '<li><i class="fa ' + getDocumentFormat(type).icon + '"></i><div class="gd-type">' + type + '</div></li>';
        });
        var plus = "";
        var multipleClass = "multiple";
        if (!multiple) {
            plus = '<i class="fas fa-plus"></i>';
            multipleClass = "";
        }
        return '<div class="gd-conversions ' + multipleClass + '">' +
            plus +
            '<label class="gd-conversion-dropdown">' +
            '<input type="checkbox" class="gd-conversion-input">' +
            '<ul class="gd-conversion-menu ' + multipleClass + ' ">' +
            conversionTypes +
            '</ul>' +
            '</label>' +
            '</div>';
    } else {
        return '<div class="gd-conversions"></div>';
    }
}

/*
******************************************************************
******************************************************************
GROUPDOCS.COMAPRISON PLUGIN
******************************************************************
******************************************************************
*/
(function ($) {
    /*
    ******************************************************************
    STATIC VALUES
    ******************************************************************
    */
    var gd_navbar = '#gd-navbar';

    /*
    ******************************************************************
    METHODS
    ******************************************************************
    */
    var methods = {
        init: function (options) {
            // set defaults
            var defaults = {
                applicationPath: "http://localhost:8080/conversion",
                download: true,
                upload: true,
                browse: true,
                rewrite: true,
                enableRightClick: true
            };

            $('#element').viewer({
                applicationPath: options.applicationPath,
                defaultDocument: "",
                htmlMode: false,
                preloadPageCount: 0,
                zoom: false,
                pageSelector: false,
                search: false,
                thumbnails: false,
                rotate: false,
                download: options.download,
                upload: options.upload,
                print: false,
                browse: options.browse,
                rewrite: options.rewrite,
                saveRotateState: false,
                enableRightClick: options.enableRightClick
            });

            options = $.extend(defaults, options);
            // set global option params
            applicationPath = options.applicationPath;
            rewrite = options.rewrite;

            $(gd_navbar).append(getHtmlComparePanel);

            // assembly html base
            $("#gd-panzoom").append(getHtmlBase);
        }
    };

    /*
    ******************************************************************
    INIT PLUGIN
    ******************************************************************
    */
    $.fn.conversion = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method' + method + ' does not exist on jQuery.comparison');
        }
    };

    /*
       ******************************************************************
       HTML MARKUP
       ******************************************************************
       */
    function getHtmlBase() {
        return '<div id="gd-compare-area">' +
            '<i class="fas fa-exchange-alt"></i>' +
            '<div class="gd-conversion-empty-label">' +
            '<label>Conversion queue is empty</label>' +
            '<label>Drag your document here or click <i class="fa fa-folder-open"></i> to select a files</label>' +
            '</div>' +
            '</div>';
    }

    function getHtmlComparePanel() {
        return '<li id="gd-btn-convert-all"><i class="fas fa-exchange-alt"></i><span class="gd-tooltip">Convert</span></li>';
    }

})(jQuery);