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
var preloadPageCount;
var compareFilesMap = [];
var compareDocumentGuid;
var password = '';
var rewrite;
var browsePrefix = "";
var differencesTypes = {};
var loadedPageNumber = 0;
differencesTypes[1] = { 'icon': '<i class="fas fa-pencil-alt"></i>', 'title': '<span class="gd-difference-title">Text edited</span>' };
differencesTypes[2] = { 'icon': '<i class="fas fa-arrow-right"></i>', 'title': '<span class="gd-difference-title">Text Added</span>' };
differencesTypes[3] = { 'icon': '<i class="fas fa-times"></i>', 'title': '<span class="gd-difference-title">Text deleted</span>' };
differencesTypes[4] = { 'icon': '<i class="fas fa-arrow-right"></i>', 'title': '<span class="gd-difference-title">Text Added</span>' };
differencesTypes[6] = { 'icon': '<i class="fas fa-pencil-alt"></i>', 'title': '<span class="gd-difference-title">Style changed</span>' };

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
    $('.gd-modal-body').off(userMouseClick, '.gd-filetree-name');

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
            var newDragnDrop = getHtmlCompareSection(prefix)
            $(".gd-comparison-bar-wrapper").append(newDragnDrop);
        }
        if (prefix == 4) {
            $(".gd-comparison-bar-wrapper").addClass("full");
            $(".gd-drag-n-drop-wrap-compare").addClass("full");
            $(".gd-compare-section").css("width", "959px");
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
    // Add file via URL event
    //////////////////////////////////////////////////
    $(".gd-differences-wrapper").on(userMouseClick, '.close', function (event) {
        closeDifferences();
    });
  
    //////////////////////////////////////////////////
    // Open document button (upload dialog) click
    //////////////////////////////////////////////////
    $(".gd-comparison-bar-wrapper").on(userMouseClick, '.gd-compare-browse', function (e) {
        browsePrefix = $(event.target.closest(".gd-compare-section")).attr("id").split("-").pop();
        toggleModalDialog(false, '');
        loadFileTree('');
    });      

    $(".gd-comparison-bar-wrapper").on(userMouseClick, function (e) {
        if ($(".highlight-difference.active").length > 0) {
            $(".highlight-difference.active").removeClass("active");
            $(".gd-difference.active").removeClass("active");
        }
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

function closeDifferences() {
    $(".gd-differences-wrapper").removeClass("active");    
    $(".gd-comparison-bar-wrapper").css("width", "100%");
}

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
    if (compareFilesMap.length < 2) {
        ($('#gd-btn-compare').hasClass("disabled")) ? "" : $('#gd-btn-compare').addClass("disabled");        
    }
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
            browsePrefix = prefix;
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

function uploadDragFile(file, prefix) {
    // prepare form data for uploading
    var formData = new FormData();
    // add local file for uploading
    formData.append("file", file);    
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
            browsePrefix = prefix;
            appendHtmlContent(prefix, returnedData.guid);
        },
        error: function (xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.Message);
            // open error popup
            printMessage(err.message);
        }
    });
}

/**
 * Append html content to an empty page
 * @param {string} prefix - current compare area prefix
 */
function appendHtmlContent(prefix, guid) {
    // initialize data   
    compareDocumentGuid = guid;
    $("#gd-dropZone-" + prefix).hide();
    $('#gd-upload-section-' + prefix).find('#gd-compare-spinner').show();
    if (preloadPageCount == 0) {
        loadAllPages(guid, prefix);
    } else {
        generatepagesTemplates();
        loadPage(guid, prefix);
    }
}

function loadPage(guid, prefix) {
    var gd_page = $('#gd-upload-section-' + prefix).find("#gd-pages");
    // get document description
    var data = { path: guid };
    $.ajax({
        type: 'POST',
        url: getApplicationPath('loadDocumentPage'),
        data: JSON.stringify(data),
        contentType: "application/json",
        success: function (htmlData) {
            if (htmlData.error != undefined) {
                // open error popup
                printMessage(htmlData.error);
                return;
            }
            var compareFile = { guid: "", password: "" };
            compareFile.guid = guid;
            compareFilesMap.push(compareFile);
            addDocInfoHead(compareFile.guid, prefix);
            $('#gd-upload-section-' + prefix).find('#gd-compare-spinner').hide();
            $.each(htmlData.pages, function (index, page) {
                // append page image, in image mode append occurred after setting the size to avoid zero size usage
                gd_page.append('<div class="gd-wrapper gd-page-' + (index + 1) + '">' +
                    '<image class="gd-page-image" src="data:image/png;base64,' + page.data + '" alt></image>' +
                    '</div>');
            });
            setFitWidth(prefix);
            if (compareFilesMap.length >= 2) {
                $('#gd-btn-compare').on(userMouseClick, function (event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    compareFiles();
                });
                $('#gd-btn-compare').removeClass("disabled");
            }
        },
        error: function (xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.message);
            // open error popup
            printMessage(err.error);
        }
    });
}

function loadAllPages(guid, prefix) {
    var gd_page = $('#gd-upload-section-' + prefix).find("#gd-pages");
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
            var compareFile = { guid: "", password: "" };
            compareFile.guid = guid;
            compareFilesMap.push(compareFile);
            addDocInfoHead(compareFile.guid, prefix);
            $('#gd-upload-section-' + prefix).find('#gd-compare-spinner').hide();
            $.each(htmlData.pages, function (index, page) {
                // append page image, in image mode append occurred after setting the size to avoid zero size usage
                gd_page.append('<div class="gd-wrapper gd-page-' + (index + 1) + '">' +
                    '<image class="gd-page-image" src="data:image/png;base64,' + page.data + '" alt></image>' +
                    '</div>');
            });
            setFitWidth(prefix);
            if (compareFilesMap.length >= 2) {
                $('#gd-btn-compare').on(userMouseClick, function (event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    compareFiles();
                });
                $('#gd-btn-compare').removeClass("disabled");
            }
        },
        error: function (xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.message);
            // open error popup
            printMessage(err.error);
        }
    });
}

function compareFiles() {
    var data = { guids: compareFilesMap };
    fadeAll(true);
    // send compare
    $.ajax({
        type: 'POST',
        url: getApplicationPath("compare"),
        data: JSON.stringify(data),
        contentType: "application/json",
        processData: false,
        success: function (returnedData) {
            fadeAll(false);
            if (returnedData.message != undefined) {
                // open error popup
                printMessage(returnedData.message);
                return;
            }
            // hide loading spinner
            $('#gd-compare-spinner').hide();
            documentResultGuid = returnedData.guid; 
            var differences = returnedData.changes;
            ShowDifferences(differences);
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
}

function ShowDifferences(differences) {
    $(".gd-differences-body").html("");
    $.each(differences, function (index, change) {
        var changeHtml = getDifferenceHtml(change);
        $(".gd-differences-body").append(changeHtml);
        addHighlightDifferences(change);
        $(".gd-difference, .highlight-difference").on(userMouseClick, function (e) {
            highlightDifference(e);
        });  
    }); 
    $(".gd-differences-wrapper").addClass("active");
   // $(".gd-compare-section").css("width", "795px");
    $(".gd-comparison-bar-wrapper").css("width", "83%");
    $.each($(".gd-compare-section"), function (index, section) {
        var prefix = $(section).attr("id").split("-").pop();
        setFitWidth(prefix);
    })
}

function addHighlightDifferences(change) {
    var lastSection = $(".gd-compare-section")[$(".gd-compare-section").length - 1];
    var firstSection = $(".gd-compare-section")[0];
    var page = $(lastSection).find(".gd-page-" + (change.Page.Id + 1));
    var originalDocPage = $(firstSection).find(".gd-page-" + (change.Page.Id + 1));
    var highlightHtml = (change.Type == 3) ? getHightlightHtml(change, originalDocPage) : getHightlightHtml(change, page);
    (change.Type == 3) ? $(originalDocPage).append(highlightHtml) : $(page).append(highlightHtml);
}

function highlightDifference(event) {
    event.stopImmediatePropagation();
    event.preventDefault();
    $(".highlight-difference.active").removeClass("active");
    $(".gd-difference.active").removeClass("active");
    var differenceId = ($(event.target).data("id") || $(event.target).data("id") == 0) ? $(event.target).data("id") : $(event.target).parent().data("id");
    var differenceHighligted = $('.highlight-difference[data-id="' + differenceId + '"]');
    var difference = $('.gd-difference[data-id="' + differenceId + '"]')
    $(differenceHighligted).addClass("active");
    $(difference).addClass("active");
    var Section = $(differenceHighligted).closest(".gd-compare-section");
    scrollToDifference(Section, differenceHighligted);
    scrollDifferencesPanel(difference);
}

/**
* Scroll to page
* @param {int} pageNumber - page number where to scroll
*/
function scrollToDifference(section, difference) {
    // get zoom value
    var zoomValue = 100;  
    // scroll
    $(section).find("#gd-pages").scrollTo(difference, {
        zoom: zoomValue
    });
}

function scrollDifferencesPanel(difference) {
    // get zoom value
    var zoomValue = $('.gd-wrapper').css('zoom') * 100;
    if (typeof zoomValue == 'undefined') {
        zoomValue = 100;
    }
    // scroll
    $(".gd-differences-body").scrollTo(difference, {
        zoom: zoomValue
    });
}

function getHightlightHtml(change, page) {
    var y = 0;
    var x = change.Box.X + parseInt($(page).css("padding-left"));
    if (getDocumentFormat(compareDocumentGuid).format == "Portable Document Format") {
        y = change.Page.Height - change.Box.Y + parseInt($(page).css("padding-top"));
    } else {
        y = change.Box.Y + parseInt($(page).css("padding-top"));
    }

    var style = 'style="width: ' + change.Box.Width + 'px; height: ' + change.Box.Height + 'px; left: ' + x + 'px; top: ' + y + 'px"';
    return '<div class="gd-difference-' + change.Type + ' highlight-difference"' + style + ' data-id="' + change.Id + '"></div>';
}

function getDifferenceHtml(difference) {
    var comment = "";
    if (difference.Type == 0) {
        return;
    }
    if (difference.StyleChanges) {
        $.each(difference.StyleChanges, function (index, style) {
            $.each(style, function (key, value) {
                if (typeof value == "number") {
                    value = Math.round(value);
                }
                switch(key)
                {
                    case "ChangedProperty":
                        comment = "Changed style: " + value;
                        break;
                    case "OldValue":
                        comment = comment + " From: " + value;
                        break;
                    case "NewValue":
                        comment = comment + " To: " + value;
                        break;
                }                
            });            
        });
    } else {
        comment = difference.Text;
    }
    return '<div class="gd-difference" data-id="' + difference.Id + '">' +
        differencesTypes[difference.Type].icon +
        differencesTypes[difference.Type].title +
        '<span class="gd-difference-page">Page ' + (difference.Page.Id + 1) + '</span>' +
        '<div class="gd-differentce-comment">' + comment + '</div>' +
        '</div>';
}

function setFitWidth(prefix) {
    // get page width
    var pageWidth = $('.gd-wrapper').width();
    // get screen width
    var screenWidth = $('#gd-pages').width();
    // get scale ratio
    var scale = (pageWidth / screenWidth) * 100;
    // set values
    zoomValue = 200 - scale;   
    setZoomValue(zoomValue, prefix);
}

/**
* Zoom document
* @param {int} zoom_val - zoom value from 0 to 100
*/
function setZoomValue(zoom_val, prefix) {
    // adapt value for css
    var zoom_val_non_webkit = zoom_val / 100;
    var zoom_val_webkit = Math.round(zoom_val) + '%';  
    var style = [
        'zoom: ' + zoom_val_webkit,
        'zoom: ' + zoom_val_non_webkit, // for non webkit browsers
        '-moz-transform: scale(' + zoom_val_non_webkit + ', ' + zoom_val_non_webkit + ')',
        '-moz-transform-origin: top;',
        '-webkit-transform: (' + zoom_val_non_webkit + ', ' + zoom_val_non_webkit + ')',
        '-ms-transform: (' + zoom_val_non_webkit + ', ' + zoom_val_non_webkit + ')',
        '-o-transform: (' + zoom_val_non_webkit + ', ' + zoom_val_non_webkit + ')'
    ].join(';');   
    $.each($('#gd-upload-section-' + prefix).find(".gd-wrapper"), function (index, page) {
        $(page).attr('style', style);
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
function getHtmlCompareSection(prefix) {
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
        closeDifferences();
        $(".highlight-difference").remove();       
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
            $(".gd-compare-section").css("width", "inherit");
            if ($(".gd-compare-section").length == 2 && $(".gd-compare-section").find(".gd-wrapper").length == 0) {
                $('.gd-compare-section').find(".gd-close-dad-area").remove();
            }
            reIndexSections();
        }
    });
}

function reIndexSections() {
    $.each($(".gd-compare-section"), function (index, section) {
        var prefix = convertIndexToString(index + 1);
        $(section).attr("id", "gd-upload-section-" + prefix);
        $(section).find(".gd-compare-url").attr("id", "gd-url-" + prefix);
        $(section).find(".gd-drag-n-drop-wrap-compare").attr("id", "gd-dropZone-" + prefix);
        $(section).find(".gd-close-dad-area").attr("id", "gd-close-dad-area-" + prefix);
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
            uploadDragFile(files[0], prefix);            
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
            preloadPageCount = options.preloadResultPageCount;
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
        return '<li id="gd-btn-compare" class="gd-btn-compare disabled">' +
            '<span id="gd-compare-value">' +
            '<i class="fas fa-play"></i>' +
            '<span class="gd-tooltip">Compare</span>' +
            '</span>' +
            '</li>';
    }

    function getHtmlBase() {
        return '<div class="gd-comparison-bar-wrapper">' +
            getHtmlCompareSection('first') + getHtmlCompareSection('second') +
            '</div>' +
            '<div class="gd-differences-wrapper">' +
                '<div class="gd-differences-header">' +                    
                        '<i class="fas fa-info-circle"></i><span>Differences</span>' +
                        '<div class="close"><i class="fas fa-times"></i></div >' +                  
                '</div >' +
            '<div class="gd-differences-body">' +    
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