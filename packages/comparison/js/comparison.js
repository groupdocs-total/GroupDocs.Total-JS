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
var currentDirectory;
var compareFileMap = {};
var compareFileGuidMap = {};
var compareFileUrlMap = {};
var uploadFilesList = [];
var documentResultGuid;
var extension;
var changedPages;
var resultData = [];
var fileNumber;
var password = '';
var map = {};
var currentPageNumber = 0;
var rewrite;
var multiComparing;
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
    // Select file for upload event
    //////////////////////////////////////////////////
    $('#gd-upload-input-first').on('change', function (e) {
        // get selected files
        var input = $(this);
        // add files to the table
        addFileForComparing(input.get(0).files, null, 'first');
    });

    $('#gd-upload-input-second').on('change', function (e) {
        // get selected files
        var input = $(this);
        // add files to the table
        addFileForComparing(input.get(0).files, null, 'second');
    });

    //////////////////////////////////////////////////
    // Open first URL input event
    //////////////////////////////////////////////////
    $('#gd-url-button-first').on(userMouseClick, function () {
        $('#gd-url-wrap-first').slideDown('fast');
        $('#gd-url-first').focus();
    });

    //////////////////////////////////////////////////
    // Close first URL input event
    //////////////////////////////////////////////////
    $('#gd-url-cancel-first').on(userMouseClick, function () {
        $('#gd-url-wrap-first').slideUp('fast');
        $('#gd-url-first').val('');
    });

    //////////////////////////////////////////////////
    // Add first file via URL event
    //////////////////////////////////////////////////
    $('#gd-add-url-first').on(userMouseClick, function () {
        var url = $("#gd-url-first").val();
        fillFileVariables('first', '', url, '');
        addFileForComparing(null, url, 'first');
        $('#gd-url-first').val('');
    });

    //////////////////////////////////////////////////
    // Open second URL input event
    //////////////////////////////////////////////////
    $('#gd-url-button-second').on(userMouseClick, function () {
        $('#gd-url-wrap-second').slideDown('fast');
        $('#gd-url-second').focus();
    });

    //////////////////////////////////////////////////
    // Close second URL input event
    //////////////////////////////////////////////////
    $('#gd-url-cancel-second').on(userMouseClick, function () {
        $('#gd-url-wrap-second').slideUp('fast');
        $('#gd-url-second').val('');
    });

    //////////////////////////////////////////////////
    // Add second file via URL event
    //////////////////////////////////////////////////
    $('#gd-add-url-second').on(userMouseClick, function () {
        var url = $("#gd-url-second").val();
        fillFileVariables('second', '', url, '');
        addFileForComparing(null, url, 'second');
        $('#gd-url-second').val('');
    });

    //////////////////////////////////////////////////
    // Open document button (upload dialog) click
    //////////////////////////////////////////////////
    $('#gd-open-document-first').on(userMouseClick, function (e) {
        toggleModalDialog(false, '');
        fileNumber = 'first';
        loadFileTree('');
    });

    $('#gd-open-document-second').on(userMouseClick, function (e) {
        toggleModalDialog(false, '');
        fileNumber = 'second';
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

    //////////////////////////////////////////////////
    // Clean current comparison results
    //////////////////////////////////////////////////
    $('#gd-btn-clean-compare').on(userMouseClick, function () {
        clearFilesRows('first');
        clearFilesRows('second');
        clearAndShowSelection('first');
        clearAndShowSelection('second');
        for (var i = 0; i < idx; i++) {
            var prefix = 'idx' + i;
            clearFilesRows(prefix);
            clearAndShowSelection(prefix);
        }
        clearResultsContents();
    });

    $('#gd-add-multicompare').on(userMouseClick, function (e) {
        var prefix = $(".tab-slider-body").length + 1;
        if (prefix <= 4) {            
            var newDragnDrop = getHtmlDragAndDropArea(prefix)
            $(".gd-comparison-bar-wrapper").append(newDragnDrop);
        }       
        initDropZone(prefix);
        initCloseButton(prefix);       
    });
    //
    // END of document ready function
});

/*
******************************************************************
FUNCTIONS
******************************************************************
*/

/**
 * Checks map with 'first' and 'second' files
 */
function mapIsEmpty(amap) {
    if (amap) {
        if (amap['first'] == null || amap['first'] == undefined || amap['first'] == ''
            || amap['second'] == null || amap['second'] == undefined || amap['second'] == '') {

            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
}

/**
 * Append html content to an empty page
 * @param {int} pageNumber - page number
 * @param {string} path - document guid, path to the file
 */
function appendHtmlContent(pageNumber, path) {
    // initialize data
    var gd_page = $('#gd-page-' + pageNumber);

    if (!gd_page.hasClass('loaded')) {
        gd_page.addClass('loaded');
        // get document description
        var data = { path: path };
        $.ajax({
            type: 'POST',
            url: getApplicationPath('loadResultPage'),
            data: JSON.stringify(data),
            contentType: "application/json",
            success: function (htmlData) {
                if (htmlData.error != undefined) {
                    // open error popup
                    printMessage(htmlData.error);
                    return;
                }

                gd_page.find('.gd-page-spinner').hide();

                // append page image, in image mode append occurred after setting the size to avoid zero size usage
                gd_page.append('<div class="gd-wrapper">' +
                    '<image class="gd-page-image" src="data:image/png;base64,' + htmlData.data + '" alt></image>' +
                    '</div>');
            },
            error: function (xhr, status, error) {
                var err = eval("(" + xhr.responseText + ")");
                console.log(err.message);
                // open error popup
                printMessage(err.error);
            }
        });
    }
}

/**
 * Get the value of password for file
 * @param prefix for specifying the file
 * @returns password
 */
function getPassword(prefix) {
    return $('#gd-password-input-' + prefix).val();
}

/**
 * Fill files for comparing
 * @param fileMap
 * @param prefix
 * @param res
 * @param passwords
 */
function transformInternal(fileMap, prefix, res, passwords) {
    if (fileMap[prefix]) {
        res.push(fileMap[prefix]);
        passwords.push(getPassword(prefix));
    }
}

/**
 * Transform files for comparing
 * @param fileMap
 * @param res
 * @param passwords
 */
function transform(fileMap, res, passwords) {
    if (passwords) {
        transformInternal(fileMap, 'first', res, passwords);
        transformInternal(fileMap, 'second', res, passwords);
    } else {
        transformToObj(fileMap, 'first', res);
        transformToObj(fileMap, 'second', res);
    }
}

/**
 * Transform to object into list
 * @param fileMap
 * @param prefix
 * @param res
 */
function transformToObj(fileMap, prefix, res) {
    if (fileMap[prefix]) {
        res.push({ file: fileMap[prefix], password: getPassword(prefix) });
    }
}

/**
 * Collect and prepare files for compare
 *
 * @returns object with files, passwords, urls, paths prepared for compare
 */
function collectFiles() {
    var files = [];
    var passwords = [];
    var urls = [];
    var paths = [];
    transform(compareFileMap, files, passwords);
    transform(compareFileGuidMap, paths, null);
    transform(compareFileUrlMap, urls, null);
    for (var i = 0; i < idx; i++) {
        var prefix = 'idx' + i;
        // fill files and passwords
        transformInternal(compareFileMap, prefix, files, passwords);
        // fill paths by objects with path to file and password
        transformToObj(compareFileGuidMap, prefix, paths);
        // fill urls by objects with url to file and password
        transformToObj(compareFileUrlMap, prefix, urls);
    }

    return { "files": files, "passwords": passwords, "urls": urls, "paths": paths };
}

/**
 * Returns amount of selected files
 * @param filesData
 * @returns
 */
function amountOfFiles(filesData) {
    return filesData['files'].length + filesData['urls'].length + filesData['paths'].length;
}

/**
 * Clear all result data from previously comparing
 */
function clearResultsContents() {
    // set zoom to default
    setZoomValue(100);
    // clear result variables
    documentResultGuid = '';
    extension = '';
    changedPages = [];
    resultData = [];
    currentPageNumber = 0;
    // clear passwords
    $('#gd-password-input-first').val('');
    $('#gd-password-input-second').val('');
    for (var i = 0; i < idx; i++) {
        var prefix = 'idx' + i;
        $('#gd-password-input-' + prefix).val('');
    }
    // hide spinner
    $('#gd-compare-spinner').hide();
    // remove previously rendered results pages
    $('#gd-panzoom').html('');
    // go to top
    $('#gd-pages').scrollTo(0, {
        duration: 0
    });
}

/**
 * Search for element by class (recursive)
 * @param {object} target - object where to search for an id
 * @param {string} class_id - class id
 */
function getElementByClass(target, class_id) {
    var elem = target.find(class_id);
    if (!elem.hasClass(class_id.slice(1))) {
        return getElementByClass(target.parent(), class_id);
    } else {
        return elem;
    }
}

/**
 * Clear all data from previously loaded document
 * @param {string} message - message to display in popup
 */
function printMessage(message) {
    var content = '<div id="gd-modal-error">' + message + '</div>';
    toggleModalDialog(true, 'Error', content);
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

/**
 * Clear results and show selection files
 *
 * @param prefix 'first' or 'second' file
 */
function clearAndShowSelection(prefix) {
    // remove file from the files array
    fillFileVariables(prefix, '', '', '');
    $('#gd-upload-input-' + prefix).val('');
    $('#gd-open-document-' + prefix).show();
    $("#gd-dropZone-" + prefix).show();
}

/**
 * Clear table with selected files
 * @param prefix 'first' or 'second' file
 */
function clearFilesRows(prefix) {
    var tableRows = $('#gd-upload-files-table-' + prefix + ' > div');
    for (var n = 0; n < tableRows.length; n++) {
        $(tableRows[n]).remove();
    }
}

/**
 * Add file to the upload list
 * @param {file[]} uploadFiles - Files array for uploading
 * @param {string} url - URL of the file
 */
function addFileForComparing(uploadFiles, url, prefix) {
    // get table in which files will be added
    var table = $("#gd-upload-files-table-" + prefix);

    if (url) {
        // append URL
        table.append('<div class="swiper-container" id="swiper-container-' + prefix + '">' +
            '<div class="swiper-wrapper">' +
            '<div class="swiper-slide swiper-slide-comparison">' +
            '<i class="fas gd-upload-files-table-i ' + getDocumentFormat(url.split('/').pop()).icon + '"></i>' +
            '<div class="gd-filetree-name-compare" data-uploaded="false" data-value="' + url.split(/[\\\/]/).pop() + '">' +
            '<div class="gd-file-name" id="gd-file-name-' + prefix + '">' + url.split(/[\\\/]/).pop() + '</div>' +
            '<span id="gd-upload-size"> type: ' + url.split('/').pop().split('.').pop() + '</span>' +
            '</div>' +
            '<div class="inner-addon left-addon btn gd-password-wrap" id="gd-password-wrap-' + prefix + '">' +
            '<input type="password" class="form-control" id="gd-password-input-' + prefix + '" placeholder="Enter password">' +
            '</div>' +
            '</div>' +
            '<div class="swiper-slide gd-desktop swiper-slide-cancel">' +
            '<div class="files-table-remove">' +
            '<button class="btn gd-cancel-button" id="gd-cancel-button-' + prefix + '"><i class="fas fa-trash"></i></button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>');
        $('#gd-url-wrap-' + prefix).slideUp('fast');
        $('#gd-url-' + prefix).val('');
    } else {
        // append files
        $.each(uploadFiles, function (index, file) {
            fillFileVariables(prefix, file, '', '');
            // document format
            var docFormat = getDocumentFormat(file.name);
            // convert to proper size
            var new_size = file.size + ' Bytes';
            if ((file.size / 1024 / 1024) > 1) {
                new_size = (Math.round((file.size / 1024 / 1024) * 100) / 100) + ' MB';
            } else if ((file.size / 1024) > 1) {
                new_size = (Math.round((file.size / 1024) * 100) / 100) + ' KB';
            }
            // append document
            table.append('<div class="swiper-container" id="swiper-container-' + prefix + '">' +
                '<div class="swiper-wrapper">' +
                '<div class="swiper-slide swiper-slide-comparison">' +
                '<i class="fas gd-upload-files-table-i ' + docFormat.icon + '"></i>' +
                '<div class="gd-filetree-name-compare" data-uploaded="false">' +
                '<div class="gd-file-name" id="gd-file-name-' + prefix + '">' + file.name + '</div>' +
                '<span id="gd-upload-size">size: ' + new_size + '</span>' +
                '<span id="gd-upload-size"> type: ' + file.name.split('.').pop() + '</span>' +
                '</div>' +
                '<div class="inner-addon left-addon btn gd-password-wrap" id="gd-password-wrap-' + prefix + '">' +
                '<input type="password" class="form-control" id="gd-password-input-' + prefix + '" placeholder="Enter password">' +
                '</div>' +
                '</div>' +
                '<div class="swiper-slide gd-desktop swiper-slide-cancel">' +
                '<div class="files-table-remove">' +
                '<button class="btn gd-cancel-button" id="gd-cancel-button-' + prefix + '"><i class="fas fa-trash"></i> Remove</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>');
        });
    }

    $('#gd-cancel-button-' + prefix).on(userMouseClick, function () {
        // get selected files
        var button = $(this);
        // remove table row
        button.closest('div').parent().parent().parent().remove();

        clearAndShowSelection(prefix);
    });

    $("#gd-dropZone-" + prefix).hide();

    $("#gd-open-document-" + prefix).hide();
    if (isMobile()) {
        $.each($(".swiper-slide"), function (index, slide) {
            $(slide).removeClass("gd-desktop");
        });
        //initialize swiper when document ready
        var swiper = new Swiper('.swiper-container');
    } else {
        $.each($(".swiper-slide"), function (index, slide) {
            $(slide).removeClass("swiper-slide-cancel");
        });
    }
}

/**
 * Fill variables with data of first or second files
 *
 * @param prefix 'first' or 'second'
 * @param file file data
 * @param url url to file
 * @param path path to file
 */
function fillFileVariables(prefix, file, url, path) {
    compareFileMap[prefix] = file;
    compareFileGuidMap[prefix] = path;
    compareFileUrlMap[prefix] = url;
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
    var htmlSection = '<section id="gd-upload-section-' + prefix + '" class="tab-slider-body">' +       
        '<div class="gd-compare-area-head">' +
            '<i class="fas fa-arrow-right"></i>'+
            '<input type="url" class="gd-compare-url" id="gd-url-' + prefix + '" placeholder="http://">' +
        '<i class="fas fa-folder gd-compare-browse"></i>' +
        '<i class="fas fa-times gd-close-dad-area" id="gd-close-dad-area-' + prefix + '"></i>' +
        '</div>' +

        '<div class="gd-drag-n-drop-wrap-compare" id="gd-dropZone-' + prefix + '">' +
            '<div class="gd-drag-n-drop-icon">' +
                '<i class="far fa-folder-open"></i>' +
            '</div>' +
            '<div class="gd-compare-drag-label">Drop your document here or click to select a file</div>' +            
        '</div>' +

        //// pages BEGIN
        //'<div id="gd-pages">' +
        //'<div id="gd-compare-spinner" style="display: none;"><i class="fas fa-circle-notch fa-spin"></i> &nbsp;Comparing... Please wait.</div>' +
        //'<div id="gd-panzoom">' +
        //// list of pages
        //'</div>' +
        //'</div>' +
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
function initCloseButton(prefix) {
    $('#gd-close-dad-area-' + prefix).on(userMouseClick, function (e) {
        fillFileVariables(prefix, '', '', '');
        $('#gd-upload-section-' + prefix).remove();
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