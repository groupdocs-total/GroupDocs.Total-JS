/**
 * GroupDocs.Comparison.JS
 * Copyright (c) 2001-2018 Aspose Pty Ltd
 * Licensed under MIT
 * @author Aspose Pty Ltd
 * @version 1.1.0
 */

/*
******************************************************************
******************************************************************
GLOBAL VARIABLES
******************************************************************
******************************************************************
*/
var applicationPath;
var preloadResultPageCount;
var compareFilesMap = [];
var compareDocumentGuid;
var password = '';
var rewrite;
var multiComparing;
var browsePrefix = "";
var userMouseClick = ('ontouch' in document.documentElement) ? 'touch click' : 'click';

$(document).ready(function () {

    /*
    ******************************************************************
    NAV BAR CONTROLS
    ******************************************************************
    */

    //////////////////////////////////////////////////
    // Download event
    //////////////////////////////////////////////////
    $('#gd-btn-download-all').on(userMouseClick, function (e) {
        downloadDocument();
    });

    $('#gd-btn-download-summary').on(userMouseClick, function (e) {
        downloadDocument(resultData.length - 1);
    });

    //////////////////////////////////////////////////
    // Disable default file or diretory click event
    //////////////////////////////////////////////////
    $('.gd-modal-body').off(userMouseClick);

    //////////////////////////////////////////////////
    // File or directory click event from file tree
    //////////////////////////////////////////////////
    $('.gd-modal-body').on(userMouseClick, '.gd-filetree-name', function (e) {
        var isDir = $(this).parent().find('.fa-folder').hasClass('fa-folder');
        if (isDir) {
            // if directory -> browse
            if (currentDirectory.length > 0) {
                currentDirectory = currentDirectory + "/" + $(this).text();
            } else {
                currentDirectory = $(this).text();
            }
            toggleModalDialog(false, '');
            loadFileTree(currentDirectory);
        } else {
            // if document -> open          
            toggleModalDialog(false, '');
            password = "";
            appendHtmlContent(browsePrefix, $(this).attr('data-guid'));
        }
    });

    //////////////////////////////////////////////////
    // Add new comparison section
    //////////////////////////////////////////////////
    $('#gd-add-multicompare').on(userMouseClick, function (e) {
        var prefix = $(".gd-compare-section").length + 1;
        if (prefix <= 4) {
            var newDragnDrop = getHtmlDragAndDropArea(prefix)
            $(".gd-comparison-bar-wrapper").append(newDragnDrop);
        }
        if (prefix == 4) {
            $(".gd-comparison-bar-wrapper").addClass("full");
            $(".gd-drag-n-drop-wrap-compare").addClass("full");
        }
        initDropZone(prefix);      
        addCloseSection();
    });

    //////////////////////////////////////////////////
    // Add file via URL event
    //////////////////////////////////////////////////
    $(".gd-comparison-bar-wrapper").on(userMouseClick, '.gd-add-url-compare', function (event) {
        var url = $(event.target.parentElement).find(".gd-compare-url").val();
        var prefix = $(event.target.parentElement).find(".gd-compare-url").attr("id").split("-").pop();
        if (isUrlValid(url)) {           
            uploadDocumentFromUrl(url, prefix);
            $(event.target.parentElement).find(".gd-compare-url").val('');
        } else {
            $('#gd-url-first').val('');
            alert("please enter valid URL");
        }
    });
  
    //////////////////////////////////////////////////
    // Open document button (upload dialog) click
    //////////////////////////////////////////////////
    $(".gd-comparison-bar-wrapper").on(userMouseClick, '.gd-compare-browse', function (e) {
        browsePrefix = $(event.target.closest(".gd-compare-section")).attr("id").split("-").pop();
        toggleModalDialog(false, '');
        loadFileTree('');
    });


    //////////////////////////////////////////////////
    // Compare two files event
    //////////////////////////////////////////////////
    $('#gd-btn-compare').on(userMouseClick, function () {
        var context;
        var contentType = 'application/json';
        var data;
        // collect all selected files in arrays
        var filesData = collectFiles();
        // calculate amount of selected files
        var amountOfFiles1 = amountOfFiles(filesData);
        // if multi-compare supports and amount of files more than 2
        if (multiComparing && amountOfFiles1 > 2) {
            data = new FormData();
            $.each(filesData['files'], function (index, elem) {
                data.append("files", elem);
            });
            data.append("passwords", new Blob([JSON.stringify(filesData['passwords'])], { type: "application/json" }));
            data.append("urls", new Blob([JSON.stringify(filesData['urls'])], { type: "application/json" }));
            data.append("paths", new Blob([JSON.stringify(filesData['paths'])], { type: "application/json" }));

            context = 'multiCompare';
            contentType = false;
        } else {
            var firstPass = getPassword('first');
            var secondPass = getPassword('second');
            // paths of files less than 2
            if (mapIsEmpty(compareFileGuidMap)) {
                // urls less than 2
                if (mapIsEmpty(compareFileUrlMap)) {
                    // files less than 2
                    if (mapIsEmpty(compareFileMap)) {
                        // files are 2, but got by different ways
                        if (amountOfFiles1 == 2) {
                            data = new FormData();
                            $.each(filesData['files'], function (index, elem) {
                                data.append("files", elem);
                            });
                            data.append("passwords", new Blob([JSON.stringify(filesData['passwords'])], { type: "application/json" }));
                            data.append("urls", new Blob([JSON.stringify(filesData['urls'])], { type: "application/json" }));
                            data.append("paths", new Blob([JSON.stringify(filesData['paths'])], { type: "application/json" }));

                            context = 'compare';
                            contentType = false;
                        } else { // files are less than 2
                            printMessage("Select files for comparing first!");
                            return;
                        }
                    } else { // files are 2 for comparing
                        data = new FormData();
                        data.append("firstFile", compareFileMap['first']);
                        data.append("secondFile", compareFileMap['second']);
                        data.append("firstPassword", firstPass);
                        data.append("secondPassword", secondPass);
                        context = 'compareFiles';
                        contentType = false;
                    }
                } else { // urls are 2, compare with urls
                    data = JSON.stringify({
                        firstPath: compareFileUrlMap['first'],
                        secondPath: compareFileUrlMap['second'],
                        firstPassword: firstPass,
                        secondPassword: secondPass
                    });
                    context = 'compareWithUrls';
                }
            } else {// paths are 2, compare with paths
                data = JSON.stringify({
                    firstPath: compareFileGuidMap['first'],
                    secondPath: compareFileGuidMap['second'],
                    firstPassword: firstPass,
                    secondPassword: secondPass
                });
                context = 'compareWithPaths';
            }
        }
        // clear previous results
        clearResultsContents();
        // show loading spinner
        $('#gd-compare-spinner').show();
        // send compare
        $.ajax({
            type: 'POST',
            url: getApplicationPath(context),
            data: data,
            contentType: contentType,
            processData: false,
            success: function (returnedData) {
                if (returnedData.message != undefined) {
                    // open error popup
                    printMessage(returnedData.message);
                    return;
                }
                // hide loading spinner
                $('#gd-compare-spinner').hide();
                documentResultGuid = returnedData.guid;
                extension = returnedData.extension;
                $.each(returnedData.pages, function (index, elem) {
                    changedPages = elem.page;
                });
                var totalPageNumber = returnedData.pages.length;
                // append changes
                $.each(returnedData.pages, function (index, elem) {
                    var pageNumber = index;

                    // append empty page
                    $('#gd-panzoom').append(
                        '<div id="gd-page-' + pageNumber + '" class="gd-page" class="gd-page">' +
                        '<div class="gd-page-spinner"><i class="fa fa-circle-o-notch fa-spin"></i> &nbsp;Loading... Please wait.</div>' +
                        '</div>'
                    );
                    // save page data
                    resultData.push({ pageNumber: pageNumber, pageGuid: elem });
                    setZoomValue(getZoomValue());
                });
                var counter = preloadResultPageCount;
                // check pre-load page number is bigger than total pages number
                if (preloadResultPageCount > totalPageNumber) {
                    counter = totalPageNumber;
                }
                // get page according to the pre-load page number
                for (var i = 0; i < counter; i++) {
                    // render page
                    appendHtmlContent(i, resultData[i].pageGuid);
                }

                // hide delete file icon
                $('#gd-cancel-button-first').hide();
                $('#gd-cancel-button-second').hide();
            },
            error: function (xhr, status, error) {
                var err = eval("(" + xhr.responseText + ")");
                console.log(err.message);
                // hide loading spinner
                $('#gd-compare-spinner').hide();
                // open error popup
                printMessage(err.message);
            }
        });
    });

    initCloseButton();
    //
    // END of document ready function
});

/*
******************************************************************
FUNCTIONS
******************************************************************
*/

function getFileNameFromPath(guid) {
    return guid.match(/[-_\w]+[.][\w]+$/i)[0];
}

function addDocInfoHead(guid, prefix) {
    var icon = getDocumentFormat(guid).icon;
    var fileName = getFileNameFromPath(guid);
    $("#gd-upload-section-" + prefix).find(".gd-compare-head-buttons").hide()
    var fileInfoArea = $("#gd-upload-section-" + prefix).find(".gd-compare-file-info");
    $(fileInfoArea).css("display", "flex");
    $(fileInfoArea).find("i").addClass(icon);
    $(fileInfoArea).find(".gd-compare-file-name").html(fileName);
    addCloseSection();
}

function removeDocInfoHead(prefix) {
    var fileInfoArea = $("#gd-upload-section-" + prefix).find(".gd-compare-file-info");
    var icon = getDocumentFormat($(fileInfoArea).find(".gd-compare-file-name").html()).icon;
    $(fileInfoArea).hide();
    $(fileInfoArea).find("i").removeClass(icon);
    $(fileInfoArea).find(".gd-compare-file-name").html("");
    $("#gd-upload-section-" + prefix).find(".gd-compare-head-buttons").show()
}

function clearDocumentPreview(prefix) {
    $.each($("#gd-upload-section-" + prefix).find(".gd-wrapper"), function (index, page) {
        $(page).remove();
    });
    $("#gd-dropZone-" + prefix).show();   
    var fileName = $("#gd-upload-section-" + prefix).find(".gd-compare-file-name").html();
    removeFileFromCompare(fileName);
}

function removeFileFromCompare(fileName) {
    $.each(compareFilesMap, function (index, filePath) {        
        if (filePath.guid.indexOf(fileName) > 0) {
            compareFilesMap = $.grep(compareFilesMap, function (value) {
                return value != filePath;
            });
        }
    })
}

/**
 * Upload document
 * @param {file} file - File for uploading
 * @param {int} index - Number of the file to upload
 * @param {string} url - URL of the file, set it if URL used instead of file
 */
function uploadDocumentFromUrl(url, prefix) {
    // prepare form data for uploading
    var formData = new FormData();
    // add URL if set
    formData.append("url", url);
    formData.append("rewrite", rewrite);
    $.ajax({
        type: 'POST',
        url: getApplicationPath('uploadDocument'),
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (returnedData) {
            if (returnedData.message != undefined) {
                // open error popup
                printMessage(returnedData.message);
                return;
            }         
            appendHtmlContent(prefix, returnedData.guid);
        },
        error: function (xhr, status, error) {
            if (xhr && xhr.responseText) {
                var err = eval("(" + xhr.responseText + ")");
                console.log(err.message);
                // open error popup
                printMessage(err.message);
            }
            $("#gd-upload-complete-" + index).fadeOut();
            $("#gd-upload-failure-" + index).fadeIn();
        }
    });
}

/**
 * Append html content to an empty page
 * @param {string} prefix - current compare area prefix
 */
function appendHtmlContent(prefix, guid) {
    // initialize data
    var gd_page = $('#gd-upload-section-' + prefix).find("#gd-pages");
    $("#gd-dropZone-" + prefix).hide();
    gd_page.find('.gd-page-spinner').show();
    // get document description
    var data = { path: guid };
    $.ajax({
        type: 'POST',
        url: getApplicationPath('loadDocumentPages'),
        data: JSON.stringify(data),
        contentType: "application/json",
        success: function (htmlData) {
            if (htmlData.error != undefined) {
                // open error popup
                printMessage(htmlData.error);
                return;
            }          
            var compareFile = { guid: "" };
            compareFile.guid = guid;
            compareFilesMap.push(compareFile);
            addDocInfoHead(compareFile.guid, prefix);
            gd_page.find('.gd-page-spinner').hide();
            $.each(htmlData.pages, function (index, page) {
                // append page image, in image mode append occurred after setting the size to avoid zero size usage
                gd_page.append('<div class="gd-wrapper">' +
                    '<image class="gd-page-image" src="data:image/png;base64,' + page.data + '" alt></image>' +
                    '</div>');
            });

        },
        error: function (xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.message);
            // open error popup
            printMessage(err.error);
        }
    });
}

/**
 * Download result
 * @param {index} page number, if undefined, then download all results file
 */
function downloadDocument(index) {
    if (documentResultGuid != "" && typeof documentResultGuid != "undefined") {
        var extensionParam = "&ext=" + extension;
        var imageExtParam = "&ext=jpg";
        var params = index ? "&index=" + index + imageExtParam : extensionParam;
        // Open download dialog
        window.location.assign(getApplicationPath('downloadDocument/?guid=') + documentResultGuid + params);
    } else {
        // open error popup
        printMessage("Please compare documents first");
    }
}

function addCloseSection() {
    var sectionsCount = $(".gd-compare-section").length;
    $.each($(".gd-compare-section"), function (index, section) {
        var prefix = convertIndexToString(index + 1);
        var close = '<i class="fas fa-times gd-close-dad-area" id="gd-close-dad-area-' + prefix + '"></i>';
        if ($(section).find(".gd-close-dad-area").length == 0) {
            if (sectionsCount == 2 && prefix == browsePrefix) {
                $(section).find(".gd-compare-area-head").append(close);
            } else if (sectionsCount > 2) {
                $(section).find(".gd-compare-area-head").append(close);
            }
        }
    });   
}

function convertIndexToString(index) {
    switch (index) {
        case 1:
            return "first";
            break;
        case 2:
            return "second";
            break;
        case 3:
            return "third";
            break;
        case 4:
            return "fourth";
            break;
    }
}

/**
 * Get HTML content for drag and drop area
 **/
function getHtmlDragAndDropArea(prefix) {
    // close icon for multi comparing 

    if (prefix > 2) {
        prefix = replacePrefix(prefix);
    }
    // drag and drop section
    var htmlSection = '<section id="gd-upload-section-' + prefix + '" class="gd-compare-section">' +
        '<div class="gd-compare-area-head">' +
            '<div class="gd-compare-head-buttons">'+
                '<i class="fas fa-arrow-right gd-add-url-compare"></i>' +
                '<input type="url" class="gd-compare-url" id="gd-url-' + prefix + '" placeholder="http://">' +
                '<i class="fas fa-folder gd-compare-browse"></i>' +
            '</div>' +
            '<div class="gd-compare-file-info">'+
                '<i class="fa"></i>' +
                '<div class="gd-compare-file-name"></div>' +
            '</div>' +
        '</div>' +

        '<div class="gd-drag-n-drop-wrap-compare" id="gd-dropZone-' + prefix + '">' +
        '<div class="gd-drag-n-drop-icon">' +
        '<i class="far fa-folder-open"></i>' +
        '</div>' +
        '<div class="gd-compare-drag-label">Drop your document here or click to select a file</div>' +
        '</div>' +

        //// pages BEGIN
        '<div id="gd-pages">' +
        '<div id="gd-compare-spinner" style="display: none;"><i class="fas fa-circle-notch fa-spin"></i> &nbsp;Loading... Please wait.</div>' +
        '</div>' +
        //    // pages END
        '</section>';
    return htmlSection;
}

/**
 * Replace prefix for file more than second
 *
 * @param prefix
 * @returns 'first', 'second' for 1, 2. After 2 returns 'next'
 */
function replacePrefix(prefix) {
    switch (prefix) {
        case 3:
            return "third";
            break;
        case 4:
            return "fourth";
            break;
    }
}

/**
 * Init remove button for selection area
 * @param prefix - prefix for selection area
 */
function initCloseButton() {    
    $(".gd-comparison-bar-wrapper").on(userMouseClick, '.gd-close-dad-area', function (e) {        
        var prefix = $(e.target).attr("id").split("-").pop();
        if ($('#gd-upload-section-' + prefix).find(".gd-wrapper").length > 0) {
            clearDocumentPreview(prefix);
            removeDocInfoHead(prefix);
            if ($(".gd-compare-section").length == 2) {
                $('#gd-upload-section-' + prefix).find(".gd-close-dad-area").remove();
            }
        } else {
            $('#gd-upload-section-' + prefix).remove();
            $(".gd-comparison-bar-wrapper").removeClass("full");
            $(".gd-drag-n-drop-wrap-compare").removeClass("full");
            if ($(".gd-compare-section").length == 2 && $(".gd-compare-section").find(".gd-wrapper").length == 0) {
                $('.gd-compare-section').find(".gd-close-dad-area").remove();
            }
        }
    });
}

/**
 * Init drop zone for file selection area
 * @param prefix - prefix for selection area
 */
function initDropZone(prefix) {
    var dropZone = $('#gd-dropZone-' + prefix);
    if (typeof dropZone[0] != "undefined") {
        //Drag n drop functional
        if ($('#gd-dropZone-' + prefix).length) {
            if (typeof (window.FileReader) == 'undefined') {
                dropZone.text("Your browser doesn't support Drag and Drop");
                dropZone.addClass('error');
            }
        }

        dropZone[0].ondragover = function (event) {
            event.stopPropagation();
            event.preventDefault();
            dropZone.addClass('hover');
            return false;
        };

        dropZone[0].ondragleave = function (event) {
            event.stopPropagation();
            event.preventDefault();
            dropZone.removeClass('hover');
            return false;
        };

        dropZone[0].ondrop = function (event) {
            event.stopPropagation();
            event.preventDefault();
            dropZone.removeClass('hover');
            var files = event.dataTransfer.files;
            addFileForComparing(files, null, prefix);
        };
    }
}

function isUrlValid(url) {
    return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
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
                applicationPath: null,
                preloadResultPageCount: 0,
                download: true,
                upload: true,
                rewrite: true,
                multiComparing: false
            };
            $('#element').viewer({
                applicationPath: options.applicationPath,
                defaultDocument: '',
                htmlMode: false,
                preloadPageCount: options.preloadResultPageCount,
                zoom: false,
                pageSelector: false,
                search: false,
                thumbnails: false,
                rotate: false,
                download: options.download,
                upload: options.upload,
                print: false,
                browse: false,
                rewrite: options.rewrite,
                saveRotateState: false,
                enableRightClick: options.enableRightClick
            });

            options = $.extend(defaults, options);

            // set global option params
            applicationPath = options.applicationPath;
            preloadResultPageCount = options.preloadResultPageCount;
            rewrite = options.rewrite;
            multiComparing = options.multiComparing;
            $("#gd-pages").remove();
            $(".wrapper").append(getHtmlBase);
            // assembly html base


            $(gd_navbar).prepend(getHtmlComparisonPanel);

            // assembly nav bar
            if (options.download) {
                $(gd_navbar).append(getHtmlNavDownloadPanel);
            }

            // assembly nav bar
            if (options.multiComparing) {
                $(gd_navbar).append(getHtmlMultiCompare);
            }

            initDropZone('first');
            initDropZone('second');
            $(".gd-nav-separator").remove();
        }
    };

    /*
    ******************************************************************
    INIT PLUGIN
    ******************************************************************
    */
    $.fn.comparison = function (method) {
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
    function getHtmlComparisonPanel() {
        return '<li id="gd-btn-compare" class="gd-btn-compare">' +
            '<span id="gd-compare-value">' +
            '<i class="fas fa-play"></i>' +
            '<span class="gd-tooltip">Compare</span>' +
            '</span>' +
            '</li>';
    }

    function getHtmlBase() {
        return '<div class="gd-comparison-bar-wrapper">' +
            getHtmlDragAndDropArea('first') + getHtmlDragAndDropArea('second') +
            '</div>';

    }

    function getHtmlMultiCompare() {
        return '<li id="gd-add-multicompare">' +
            '<span id="gd-compare-value">' +
            '<i id="gd-add-file-multicompare" class="fas fa-plus gd-add-file-multicompare"></i>' +
            '<span class="gd-tooltip">Compare</span>' +
            '</span>' +
            '</li>';
    }

    function getHtmlNavDownloadPanel() {
        var downloadBtn = $("#gd-btn-download");
        var downloadDropDown = '<li class="gd-nav-toggle" id="gd-download-val-container">' +
            '<span id="gd-download-value">' +
            '<i class="fa fa-download"></i>' +
            '<span class="gd-tooltip">Download</span>' +
            '</span>' +
            '<span class="gd-nav-caret"></span>' +
            '<ul class="gd-nav-dropdown-menu gd-nav-dropdown" id="gd-btn-download-value">' +
            // download types will be here
            '</ul>' +
            '</li>';
        downloadBtn.html(downloadDropDown);
    }

})(jQuery);