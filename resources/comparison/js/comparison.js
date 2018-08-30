/**
 * GroupDocs.Comparison.JS
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
var compareFileMap = {};
var compareFileGuidMap = {};
var uploadFilesList = [];
var documentResultGuid;
var fileNumber;
var password = '';
var map = {};
// add supported formats
map['folder'] = { 'format': '', 'icon': 'fa-folder' };
map['pdf'] = { 'format': 'Portable Document Format', 'icon': 'fa-file-pdf' };
map['doc'] = { 'format': 'Microsoft Word', 'icon': 'fa-file-word' };
map['docx'] = { 'format': 'Microsoft Word', 'icon': 'fa-file-word' };
map['docm'] = { 'format': 'Microsoft Word', 'icon': 'fa-file-word' };
map['dot'] = { 'format': 'Microsoft Word', 'icon': 'fa-file-word' };
map['dotx'] = { 'format': 'Microsoft Word', 'icon': 'fa-file-word' };
map['dotm'] = { 'format': 'Microsoft Word', 'icon': 'fa-file-word' };
map['xls'] = { 'format': 'Microsoft Excel', 'icon': 'fa-file-excel' };
map['xlsx'] = { 'format': 'Microsoft Excel', 'icon': 'fa-file-excel' };
map['xlsm'] = { 'format': 'Microsoft Excel', 'icon': 'fa-file-excel' };
map['xlsb'] = { 'format': 'Microsoft Excel', 'icon': 'fa-file-excel' };
map['ppt'] = { 'format': 'Microsoft PowerPoint', 'icon': 'fa-file-powerpoint' };
map['pptx'] = { 'format': 'Microsoft PowerPoint', 'icon': 'fa-file-powerpoint' };
map['pps'] = { 'format': 'Microsoft PowerPoint', 'icon': 'fa-file-powerpoint' };
map['ppsx'] = { 'format': 'Microsoft PowerPoint', 'icon': 'fa-file-powerpoint' };
map['vsd'] = { 'format': 'Microsoft Visio', 'icon': 'fa-file-code' };
map['vdx'] = { 'format': 'Microsoft Visio', 'icon': 'fa-file-code' };
map['vss'] = { 'format': 'Microsoft Visio', 'icon': 'fa-file-code' };
map['vsx'] = { 'format': 'Microsoft Visio', 'icon': 'fa-file-code' };
map['vst'] = { 'format': 'Microsoft Visio', 'icon': 'fa-file-code' };
map['vtx'] = { 'format': 'Microsoft Visio', 'icon': 'fa-file-code' };
map['vsdx'] = { 'format': 'Microsoft Visio', 'icon': 'fa-file-code' };
map['vdw'] = { 'format': 'Microsoft Visio', 'icon': 'fa-file-code' };
map['vstx'] = { 'format': 'Microsoft Visio', 'icon': 'fa-file-code' };
map['vssx'] = { 'format': 'Microsoft Visio', 'icon': 'fa-file-code' };
map['mpp'] = { 'format': 'Microsoft Project', 'icon': 'fa-file-alt' };
map['mpt'] = { 'format': 'Microsoft Project', 'icon': 'fa-file-alt' };
map['msg'] = { 'format': 'Microsoft Outlook', 'icon': 'fa-file-alt' };
map['eml'] = { 'format': 'Microsoft Outlook', 'icon': 'fa-file-alt' };
map['emlx'] = { 'format': 'Microsoft Outlook', 'icon': 'fa-file-alt' };
map['one'] = { 'format': 'Microsoft OneNote', 'icon': 'fa-file-word' };
map['odt'] = { 'format': 'Open Document Text', 'icon': 'fa-file-word' };
map['ott'] = { 'format': 'Open Document Text Template', 'icon': 'fa-file-word' };
map['ods'] = { 'format': 'Open Document Spreadsheet', 'icon': 'fa-file-excel' };
map['odp'] = { 'format': 'Open Document Presentation', 'icon': 'fa-file-powerpoint' };
map['otp'] = { 'format': 'Open Document Presentation', 'icon': 'fa-file-powerpoint' };
map['ots'] = { 'format': 'Open Document Presentation', 'icon': 'fa-file-powerpoint' };
map['rtf'] = { 'format': 'Rich Text Format', 'icon': 'fa-file-alt' };
map['txt'] = { 'format': 'Plain Text File', 'icon': 'fa-file-alt' };
map['csv'] = { 'format': 'Comma-Separated Values', 'icon': 'fa-file-excel' };
map['html'] = { 'format': 'HyperText Markup Language', 'icon': 'fa-file-word' };
map['mht'] = { 'format': 'HyperText Markup Language', 'icon': 'fa-file-word' };
map['mhtml'] = { 'format': 'HyperText Markup Language', 'icon': 'fa-file-word' };
map['xml'] = { 'format': 'Extensible Markup Language', 'icon': 'fa-file-word' };
map['xps'] = { 'format': 'XML Paper Specification', 'icon': 'fa-file-word' };
map['dxf'] = { 'format': 'AutoCAD Drawing File Format', 'icon': 'fa-file-image' };
map['dwg'] = { 'format': 'AutoCAD Drawing File Format', 'icon': 'fa-file-image' };
map['bmp'] = { 'format': 'Bitmap Picture', 'icon': 'fa-file-image' };
map['gif'] = { 'format': 'Graphics Interchange Format', 'icon': 'fa-file-image' };
map['jpg'] = { 'format': 'Joint Photographic Experts Group', 'icon': 'fa-file-image' };
map['jpe'] = { 'format': 'Joint Photographic Experts Group', 'icon': 'fa-file-image' };
map['jpeg'] = { 'format': 'Joint Photographic Experts Group', 'icon': 'fa-file-image' };
map['jfif'] = { 'format': 'Joint Photographic Experts Group', 'icon': 'fa-file-image' };
map['png'] = { 'format': 'Portable Network Graphics', 'icon': 'fa-file-image' };
map['tiff'] = { 'format': 'Tagged Image File Format', 'icon': 'fa-file-photo' };
map['tif'] = { 'format': 'Tagged Image File Format', 'icon': 'fa-file-photo' };
map['epub'] = { 'format': 'Electronic Publication', 'icon': 'fa-file-pdf' };
map['ico'] = { 'format': 'Windows Icon', 'icon': 'fa-file-image' };
map['webp'] = { 'format': 'Compressed Image', 'icon': 'fa-file-image' };
map['mobi'] = { 'format': 'Mobipocket eBook', 'icon': 'fa-file-pdf' };
map['tex'] = { 'format': 'LaTeX Source Document', 'icon': 'fa-file-pdf' };
map['djvu'] = { 'format': 'Multi-Layer Raster Image', 'icon': 'fa-file-alt' };
map['unknown'] = { 'format': 'This format is not supported', 'icon': 'fa-file' };

$(document).ready(function(){

    /*
    ******************************************************************
    NAV BAR CONTROLS
    ******************************************************************
    */

    //////////////////////////////////////////////////
    // Prevent toggle events on search container click
    //////////////////////////////////////////////////
    $('#gd-nav-search-container').on('click', function(e){
        e.stopPropagation();
    });

    //////////////////////////////////////////////////
    // Close modal dialog event
    //////////////////////////////////////////////////
    $('.gd-modal-close-action').on('click', closeModal);

    //////////////////////////////////////////////////
    // File or directory click event from file tree
    //////////////////////////////////////////////////
    $('.gd-modal-body').on('click', '.gd-filetree-name', function(e){
        var isDir = $(this).parent().find('.fa-folder').hasClass('fa-folder');
        if(isDir){
            // if directory -> browse
            if(currentDirectory.length > 0){
                currentDirectory = currentDirectory + "/" + $(this).text();
            }else{
                currentDirectory = $(this).text();
            }
            toggleModalDialog(false, '');
            loadFileTree(currentDirectory);
        }else{
            toggleModalDialog(false, '');
            let guid = $(this).attr('data-guid');
            compareFileGuidMap[fileNumber] = guid;
            compareFileMap[fileNumber] = {};
            addFileForComparing(null, guid, fileNumber);
        }
    });

    //////////////////////////////////////////////////
    // Go to parent directory event from file tree
    //////////////////////////////////////////////////
    $('.gd-modal-body').on('click', '.gd-go-up', function(e){
        if(currentDirectory.length > 0 && currentDirectory.indexOf('/') == -1){
            currentDirectory = '';
        }else{
            currentDirectory = currentDirectory.replace(/\/[^\/]+\/?$/, '');
        }
        loadFileTree(currentDirectory);
    });

    //////////////////////////////////////////////////
    // Download event
    //////////////////////////////////////////////////
    $('#gd-btn-download').on('click', function(e){
        downloadDocument();
    });

    //////////////////////////////////////////////////
    // Select file for upload event
    //////////////////////////////////////////////////
    $('#gd-upload-input-first').on('change', function(e){
        // get selected files
        var input = $(this);
        // add files to the table
        addFileForComparing(input.get(0).files, null, 'first');
    });

    $('#gd-upload-input-second').on('change', function(e){
        // get selected files
        var input = $(this);
        // add files to the table
        addFileForComparing(input.get(0).files, null, 'second');
    });

    //////////////////////////////////////////////////
    // Open URL input event
    //////////////////////////////////////////////////
    $('#gd-url-button-first').on('click', function () {
        $('#gd-url-wrap-first').slideDown('fast');
        $('#gd-url-first').focus();
    });

    //////////////////////////////////////////////////
    // Close URL input event
    //////////////////////////////////////////////////
    $('#gd-url-cancel-first').on('click', function () {
        $('#gd-url-wrap-first').slideUp('fast');
        $('#gd-url-first').val('');
    });

    //////////////////////////////////////////////////
    // Add file via URL event
    //////////////////////////////////////////////////
    $('#gd-add-url-first').on('click', function () {
        addFileForComparing(null, $("#gd-url-first").val(), 'first');
        $('#gd-url-first').val('');
    });

    //////////////////////////////////////////////////
    // Open URL input event
    //////////////////////////////////////////////////
    $('#gd-url-button-second').on('click', function () {
        $('#gd-url-wrap-second').slideDown('fast');
        $('#gd-url-second').focus();
    });

    //////////////////////////////////////////////////
    // Close URL input event
    //////////////////////////////////////////////////
    $('#gd-url-cancel-second').on('click', function () {
        $('#gd-url-wrap-second').slideUp('fast');
        $('#gd-url-second').val('');
    });

    //////////////////////////////////////////////////
    // Add file via URL event
    //////////////////////////////////////////////////
    $('#gd-add-url-second').on('click', function () {
        addFileForComparing(null, $("#gd-url-second").val(), 'second');
        $('#gd-url-second').val('');
    });

    //////////////////////////////////////////////////
    // Print event
    //////////////////////////////////////////////////
    $('#gd-btn-print').on('click', function(e){
        printDocument();
    });

    //////////////////////////////////////////////////
    // Open document button (upload dialog) click
    //////////////////////////////////////////////////
    $('#gd-open-document-first').on('click', function(e){
        toggleModalDialog(false, '');
        fileNumber = 'first';
        loadFileTree('');
    });

    $('#gd-open-document-second').on('click', function(e){
        toggleModalDialog(false, '');
        fileNumber = 'second';
        loadFileTree('');
    });

    //////////////////////////////////////////////////
    // Submit password button click (password required modal)
    //////////////////////////////////////////////////
    $('.gd-modal-body').on('click', "#gd-password-submit", function(e){
        password = $('#gd-password-input').val();
        $('#gd-password-input').val('');
        toggleModalDialog(false, '');
    });

    //////////////////////////////////////////////////
    // Click on modal body event (used to change slide in swiper)
    //////////////////////////////////////////////////
    $('.gd-modal-body').on('click', '#gd-modal-content', function(e){
        if(isMobile()){
            if($('#gd-upload-files-table > div').length > 0){
                var swiper = new Swiper('.swiper-container');
                if(typeof swiper.length == 'undefined'){
                    swiper.slideNext();
                    swiper.slidePrev();
                }
                for(var i = 0; i < swiper.length; i++){
                    swiper[i].slideNext();
                    swiper[i].slidePrev();
                }
            }
        }
    });

    //////////////////////////////////////////////////
    // Open modal dialog (file upload) event
    //////////////////////////////////////////////////
    $('#gd-btn-upload').on('click', function(e){
        toggleModalDialog(true, 'Upload Document', getHtmlUploadForModal());
        var dropZone = $('#gd-dropZone');
        if (typeof dropZone[0] != "undefined") {
            //Drag n drop functional
            if ($('#gd-dropZone').length) {
                if (typeof (window.FileReader) == 'undefined') {
                    dropZone.text("Your browser doesn't support Drag and Drop");
                    dropZone.addClass('error');
                }
            }

            dropZone[0].ondragover = function () {
                dropZone.addClass('hover');
                return false;
            };

            dropZone[0].ondragleave = function () {
                dropZone.removeClass('hover');
                return false;
            };

            dropZone[0].ondrop = function (event) {
                event.preventDefault();
                dropZone.removeClass('hover');
                var files = event.dataTransfer.files;
                addFileForUploading(files);
            };
        }
    });
    //////////////////////////////////////////////////
    // Cancel file upload event
    //////////////////////////////////////////////////
    $('.gd-modal-body').on('click', ".gd-cancel-button", function(e){
        // get selected files
        var button = $(this);
        // get file name which will be deleted
        var fileName = button.closest("div").parent().parent().find("div.gd-file-name")[0].innerHTML;
        // find its index in the array
        for(var i = 0; i < uploadFilesList.length; i++){
            if(uploadFilesList[i].name == fileName){
                // remove file from the files array
                uploadFilesList.splice(i, 1);
            }
        }
        // remove table row
        button.closest('div').parent().parent().parent().remove();
        $('#gd-upload-input').val('');
        // recalculate indexes in the files table
        var tableRows = $('#gd-upload-files-table > div');
        for(var n = 0; n < tableRows.length; n++){
            $(tableRows[n]).find('div.gd-pregress').attr('id', 'gd-pregress-bar-' + n);
            $(tableRows[n]).find("div.gd-upload-complete").attr('id', 'gd-upload-complete-' + n);
        }
        // if table is empty disable upload button
        if(tableRows.length == 0){
            $('#gd-upload-button').prop('disabled', true);
        }
    });

    //////////////////////////////////////////////////
    // Upload event
    //////////////////////////////////////////////////
    $(".gd-modal-body").on('click', '#gd-upload-button', function(e){
        // get current number of table rows
        var tableRows = $('#gd-upload-files-table > div');
        // initiate URL counter required for proper calculating of the uploaded files in case local files uploaded with URLs
        var urlCounter = 0;
        // upload file one by one
        for (var i = 0; i < tableRows.length; i++) {
            // check if current table row contains URL instead of file
            if($(tableRows[i]).find("div[data-value]").length > 0) {
                // upload URL
                uploadDocument(null, i, $(tableRows[i]).find("div.gd-filetree-name").data().value);
                // increase URL counter
                urlCounter++;
            } else {
                // check if the current file already uploaded
                var isUploaded = $(tableRows[i]).find("div.gd-filetree-name").data().uploaded;
                if(!isUploaded){
                    // upload local file
                    uploadDocument(uploadFilesList[i - urlCounter], i);
                    // mark file as uploaded
                    $(tableRows[i]).find("div.gd-filetree-name").data().uploaded = true;
                } else {
                    continue;
                }
            }
        }
    });

    //////////////////////////////////////////////////
    // Open URL input event
    //////////////////////////////////////////////////
    $('.gd-modal-body').on('click', '#gd-url-button', function () {
        $('#gd-url-wrap').slideDown('fast');
        $('#gd-url').focus();
    });

    //////////////////////////////////////////////////
    // Close URL input event
    //////////////////////////////////////////////////
    $('.gd-modal-body').on('click', '#gd-url-cancel', function () {
        $('#gd-url-wrap').slideUp('fast');
        $('#gd-url').val('');
    });

    //////////////////////////////////////////////////
    // Add file via URL event
    //////////////////////////////////////////////////
    $('.gd-modal-body').on('click', '#gd-add-url', function () {
        addFileForUploading(null, $("#gd-url").val());
        $('#gd-url').val('');
    });

    //////////////////////////////////////////////////
    // Select files for upload event
    //////////////////////////////////////////////////
    $('.gd-modal-body').on('change', '#gd-upload-input', function(e){
        // get selected files
        var input = $(this);
        // add files to the table
        addFileForUploading(input.get(0).files);
    });

    //////////////////////////////////////////////////
    // Open document button (upload dialog) click
    //////////////////////////////////////////////////
    $('.gd-modal-body').on('click', '#gd-open-document', function(e){
        toggleModalDialog(false, '');
        loadFileTree('');
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
 * Get HTML content for upload modal
 **/
function getHtmlUploadForModal(){
    // upload section
    var uploadSection = '<section id="gd-upload-section" class="tab-slider-body">'+
        '<div class="gd-drag-n-drop-wrap" id="gd-dropZone">'+
        '<div class="gd-drag-n-drop-icon"><i class="fa fa-cloud-download-alt fa-5x" aria-hidden="true"></i></div>'+
        '<h2>Drag &amp; Drop your files here</h2>'+
        '<h4>OR</h4>'+
        '<div class="gd-drag-n-drop-buttons">'+
        '<label class="btn btn-primary">'+
        '<i class="fa fa-file"></i>'+
        'SELECT FILE'+
        '<input id="gd-upload-input" type="file" multiple style="display: none;">'+
        '</label>'+
        '<label class="btn" id="gd-url-button">'+
        '<i class="fa fa-link"></i>'+
        'URL'+
        '</label>'+
        '</div>'+
        '</div>'+
        '<div class="inner-addon left-addon btn gd-url-wrap" id="gd-url-wrap" style="display: none;">'+
        '<input type="url" class="form-control" id="gd-url" placeholder="Enter your file URL">'+
        '<button class="btn" id="gd-url-cancel"><i class="fa fa-trash"></i></button>'+
        '<button class="btn btn-primary" id="gd-add-url">Add</button>'+
        '</div>'+
        '<div id="gd-upload-files-table">'+
        // list of files
        '</div>'+
        '<button id="gd-upload-button" type="button" class="btn btn-success" disabled>Upload</button>'+
        '<button id="gd-open-document" type="button" class="btn">Browse files</button>'+
        '</section>';
    return uploadSection;
}

/**
 * Load file tree
 * @param {string} dir - files location directory
 */
function loadFileTree(dir) {
    var data = {path: dir};
    currentDirectory = dir;
    // show loading spinner
    $('#gd-modal-spinner').show();
    // get data
    $.ajax({
        type: 'POST',
        url: getApplicationPath('loadFileTree'),
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(returnedData) {
            if(returnedData.message != undefined){
                // open error popup
                printMessage(returnedData.message);
                return;
            }
            // assembly modal html
            $('.gd-modal-body').html(''); // clear previous data
            toggleModalDialog(true, "Open Document", getHtmlFileBrowser());
            // hide loading spinner
            $('#gd-modal-spinner').hide();
            // append files to tree list
            $.each(returnedData, function(index, elem){
                // document name
                var name = elem.name;
                // document guid
                var guid = elem.guid;
                // document size
                var size = elem.size;
                // convert to proper size
                var new_size = size + ' Bytes';
                if((size / 1024 / 1024) > 1){
                    new_size = (Math.round((size / 1024 / 1024) * 100) / 100) + ' MB';
                }else if((size / 1024) > 1){
                    new_size = (Math.round((size / 1024) * 100) / 100) + ' KB';
                }
                // document format
                var documentFormat = getDocumentFormat(name, elem.isDirectory);
                var docFormat = (documentFormat == undefined)? 'fa-folder' : documentFormat;
                // append document
                $('.gd-modal-table tbody').append(
                    '<tr>'+
                    '<td><i class="fas ' + docFormat.icon + '"></i></td>'+
                    '<td class="gd-filetree-name" data-guid="' + guid + '"><div class="gd-file-name">' + name + '</div></td>'+
                    '<td>' + docFormat.format + '</td>'+
                    '<td>' + new_size + '</td>'+
                    '</tr>');
            });
        },
        error: function(xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.message);
            // hide loading spinner
            $('#gd-modal-spinner').hide();
            // open error popup
            printMessage(err.message);
        }
    });
}

/**
 * Get document format (type)
 * @param {string} filename - document name
 * @param {boolean} isDirectory - define if the current element is directory or file
 */
function getDocumentFormat(filename, isDirectory){
    if(!isDirectory){
        if(typeof map[filename.split('.').pop().toLowerCase()] == "undefined"){
            if(filename.split('.').length > 1){
                return map["unknown"];
            } else {
                return map["folder"];
            }
        } else {
            return map[filename.split('.').pop().toLowerCase()];
        }
    } else {
        return map["folder"];
    }
}

/**
 * Get application path for GET/POST requests
 * @param {string} context - application context
 */
function getApplicationPath(context){
    if(applicationPath != null){
        if(applicationPath.slice(-1) == '/'){
            return applicationPath + context;
        }else{
            return applicationPath + "/" + context;
        }
    }else{
        return context;
    }
}

/**
 * Search for element by class (recursive)
 * @param {object} target - object where to search for an id
 * @param {string} class_id - class id
 */
function getElementByClass(target, class_id){
    var elem = target.find(class_id);
    if(!elem.hasClass(class_id.slice(1))){
        return getElementByClass(target.parent(), class_id);
    }else{
        return elem;
    }
}

/**
 * Toggle modal dialog
 * @param {boolean} open - open/close value
 * @param {string} title - title to display in modal dialog (popup)
 */
function toggleModalDialog(open, title, content){
    if(open){
        $('#modalDialog .gd-modal-title').text(title);
        $('#modalDialog')
            .css('opacity', 0)
            .fadeIn('fast')
            .animate(
                { opacity: 1 },
                { queue: false, duration: 'fast' }
            );
        $('#modalDialog').addClass('in');
        $(".gd-modal-body").append(content);
    }else{
        $('#modalDialog').removeClass('in');
        $('#modalDialog')
            .css('opacity', 1)
            .fadeIn('fast')
            .animate(
                { opacity: 0 },
                { queue: false, duration: 'fast' }
            )
            .css('display', 'none');
        $(".gd-modal-body").html('');
    }
}

/**
 * Clear all data from previously loaded document
 * @param {string} message - message to diplay in popup
 */
function printMessage(message){
    var content = '<div id="gd-modal-error">' + message + '</div>';
    toggleModalDialog(true, 'Error', content);
}

/**
 * Download current document
 */
function downloadDocument() {
    if(documentResultGuid != "" && typeof documentResultGuid != "undefined"){
        // Open download dialog
        window.location.assign(getApplicationPath('downloadDocument/?path=') + documentResultGuid);
    } else {
        // open error popup
        printMessage("Please compare documents first");
    }
}

/**
 * Add file to the upload list
 * @param {file[]} uploadFiles - Files array for uploading
 * @param {string} url - URL of the file
 */
function addFileForUploading(uploadFiles, url) {
    // get table in which files will be added
    var table = $("#gd-upload-files-table");
    // get current count of table rows
    var tableRowsNumber = $('#gd-upload-files-table > div').length;

    if(url){
        // append URL
        table.append('<div class="swiper-container">'+
            '<div class="swiper-wrapper">'+
            '<div class="swiper-slide">'+
            '<i class="fa ' + getDocumentFormat(url.split('/').pop()).icon + '"></i>'+
            '<div class="gd-filetree-name" data-uploaded="false" data-value="' + url + '">'+
            '<div class="gd-file-name">' + url.split('/').pop() + '</div>'+
            '<span id="gd-upload-size"> type: ' + url.split('/').pop().split('.').pop() +'</span>'+
            '</div>'+
            '<div id="gd-pregress-bar-' + tableRowsNumber + '" class="gd-pregress p0 small green">'+
            '<div class="slice">'+
            '<div class="bar"></div>'+
            '<div class="fill"></div>'+
            '</div>'+
            '</div>'+
            '<div id="gd-upload-complete-' + tableRowsNumber + '" class="gd-upload-complete"><i class="fa fa-check-circle-o"></i></div>'+
            '</div>'+
            '<div class="swiper-slide gd-desktop swiper-slide-cancel">'+
            '<div class="files-table-remove">'+
            '<button class="btn gd-cancel-button"><i class="fa fa-trash"></i></button>'+
            '</div>'+
            '</div>'+
            '</div>'+
            '</div>');
        // increase table rows counter after adding new record
        tableRowsNumber++
    } else {
        // append files
        $.each(uploadFiles, function(index, file){
            uploadFilesList.push(file);
            // document format
            var docFormat = getDocumentFormat(file.name);
            // convert to proper size
            var new_size = file.size + ' Bytes';
            if((file.size / 1024 / 1024) > 1){
                new_size = (Math.round((file.size / 1024 / 1024) * 100) / 100) + ' MB';
            }else if((file.size / 1024) > 1){
                new_size = (Math.round((file.size / 1024) * 100) / 100) + ' KB';
            }
            // append document
            table.append('<div class="swiper-container">'+
                '<div class="swiper-wrapper">'+
                '<div class="swiper-slide">'+
                '<i class="fa ' + docFormat.icon + '"></i>'+
                '<div class="gd-filetree-name" data-uploaded="false">'+
                '<div class="gd-file-name">' + file.name + '</div>'+
                '<span id="gd-upload-size">size: ' + new_size +'</span>'+
                '<span id="gd-upload-size"> type: ' + file.name.split('.').pop() +'</span>'+
                '</div>'+
                '<div id="gd-pregress-bar-' + tableRowsNumber + '" class="gd-pregress p0 small green">'+
                '<div class="slice">'+
                '<div class="bar"></div>'+
                '<div class="fill"></div>'+
                '</div>'+
                '</div>'+
                '<div id="gd-upload-complete-' + tableRowsNumber + '" class="gd-upload-complete"><i class="fa fa-check-circle-o"></i></div>'+
                '</div>'+
                '<div class="swiper-slide gd-desktop swiper-slide-cancel">'+
                '<div class="files-table-remove">'+
                '<button class="btn gd-cancel-button"><i class="fa fa-trash"></i> Remove</button>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>');
            // increase table rows counter after adding new record
            tableRowsNumber++
        });
    }
    $("#gd-upload-button").prop("disabled", false);
    if(isMobile()){
        $.each($(".swiper-slide"), function(index, slide){
            $(slide).removeClass("gd-desktop");
        });
        //initialize swiper when document ready
        var swiper = new Swiper ('.swiper-container');
    } else {
        $.each($(".swiper-slide"), function(index, slide){
            $(slide).removeClass("swiper-slide-cancel");
        });
    }
}

/**
 * Close modal
 */
function closeModal(){
    // remove all files from the upload list
    uploadFilesList = [];
    var tableRows = $('#gd-upload-files-table > div');
    for(var n = 0; n < tableRows.length; n++){
        $(tableRows[n]).remove();
    }
    $("#gd-upload-input").val('');
    toggleModalDialog(false, '');
}

function openBrowseModal(){
    loadFileTree('');
}

/**
 * Add file to the upload list
 * @param {file[]} uploadFiles - Files array for uploading
 * @param {string} url - URL of the file
 */
function addFileForComparing(uploadFiles, url, prefix) {
    // get table in which files will be added
    var table = $("#gd-upload-files-table-" + prefix);

    if(url){
        // append URL
        table.append('<div class="swiper-container" id="swiper-container-' + prefix + '">'+
            '<div class="swiper-wrapper">'+
            '<div class="swiper-slide swiper-slide-comparison">'+
            '<i class="fas ' + getDocumentFormat(url.split('/').pop()).icon + '"></i>'+
            '<div class="gd-filetree-name" data-uploaded="false" data-value="' + url + '">'+
            '<div class="gd-file-name" id="gd-file-name-' + prefix + '">' + url.split('/').pop() + '</div>'+
            '<span id="gd-upload-size"> type: ' + url.split('/').pop().split('.').pop() +'</span>'+
            '</div>'+
            '</div>'+
            '<div class="swiper-slide gd-desktop swiper-slide-cancel">'+
            '<div class="files-table-remove">'+
            '<button class="btn gd-cancel-button" id="gd-cancel-button-' + prefix + '"><i class="fas fa-trash"></i></button>'+
            '</div>'+
            '</div>'+
            '</div>'+
            '</div>');
        $('#gd-url-wrap-' + prefix).slideUp('fast');
        $('#gd-url-' + prefix).val('');
    } else {
        // append files
        $.each(uploadFiles, function(index, file){
            compareFileMap[prefix] = file;
            compareFileGuidMap[prefix] = '';
            // document format
            var docFormat = getDocumentFormat(file.name);
            // convert to proper size
            var new_size = file.size + ' Bytes';
            if((file.size / 1024 / 1024) > 1) {
                new_size = (Math.round((file.size / 1024 / 1024) * 100) / 100) + ' MB';
            } else if((file.size / 1024) > 1){
                new_size = (Math.round((file.size / 1024) * 100) / 100) + ' KB';
            }
            // append document
            table.append('<div class="swiper-container" id="swiper-container-' + prefix + '">'+
                '<div class="swiper-wrapper">'+
                '<div class="swiper-slide swiper-slide-comparison">'+
                '<i class="fas ' + docFormat.icon + '"></i>'+
                '<div class="gd-filetree-name" data-uploaded="false">'+
                '<div class="gd-file-name" id="gd-file-name-' + prefix + '">' + file.name + '</div>'+
                '<span id="gd-upload-size">size: ' + new_size +'</span>'+
                '<span id="gd-upload-size"> type: ' + file.name.split('.').pop() +'</span>'+
                '</div>'+
                '</div>'+
                '<div class="swiper-slide gd-desktop swiper-slide-cancel">'+
                '<div class="files-table-remove">'+
                '<button class="btn gd-cancel-button" id="gd-cancel-button-' + prefix + '"><i class="fas fa-trash"></i> Remove</button>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>');
        });
    }
    $('#gd-cancel-button-first').on('click', function() {
        // get selected files
        var button = $(this);
        // get file name which will be deleted
        var fileName = button.closest("div").parent().parent().find("div#gd-file-name-first")[0].innerHTML;
        // remove file from the files array
        compareFileMap['first'] = {};
        compareFileGuidMap['first'] = '';
        // remove table row
        button.closest('div').parent().parent().parent().remove();
        $('#gd-upload-input-first').val('');
        $('#gd-open-document-first').show();
        $("#gd-dropZone-first").show();
    });

    $('#gd-cancel-button-second').on('click', function(){
        // get selected files
        var button = $(this);
        // get file name which will be deleted
        var fileName = button.closest("div").parent().parent().find("div#gd-file-name-second")[0].innerHTML;
        // remove file from the files array
        compareFileMap['second'] = {};
        compareFileGuidMap['second'] = '';
        // remove table row
        button.closest('div').parent().parent().parent().remove();
        $('#gd-upload-input-second').val('');
        $('#gd-open-document-second').show();
        $("#gd-dropZone-second").show();
    });

    $("#gd-dropZone-" + prefix).hide();

    $("#gd-open-document-" + prefix).hide();
    if(isMobile()){
        $.each($(".swiper-slide"), function(index, slide){
            $(slide).removeClass("gd-desktop");
        });
        //initialize swiper when document ready
        var swiper = new Swiper ('.swiper-container');
    } else {
        $.each($(".swiper-slide"), function(index, slide){
            $(slide).removeClass("swiper-slide-cancel");
        });
    }
}

/**
 * Upload document
 * @param {file} file - File for uploading
 * @param {String} prefix - first or second document
 * @param {string} url - URL of the file, set it if URL used instead of file
 */
function uploadDocument(file, prefix, url = '') {
    // prepare form data for uploading
    var formData = new FormData();
    // add local file for uploading
    formData.append("file", file);
    // add URL if set
    formData.append("url", url);
    formData.append("rewrite", false);
    $.ajax({
        // callback function which updates upload progress bar
        xhr: function()
        {
            var xhr = new window.XMLHttpRequest();
            // upload progress
            xhr.upload.addEventListener("progress", function(event){
                if (event.lengthComputable) {
                    $(".gd-modal-close-action").off('click');
                    $("#gd-open-document-" + prefix).prop("disabled", true);
                    // increase progress
                    $("#gd-progress-bar-" + prefix).addClass("p"+ Math.round(event.loaded / event.total * 100));
                    if(event.loaded == event.total){
                        $("#gd-progress-bar-" + prefix).fadeOut();
                        $("#gd-upload-complete-" + prefix).fadeIn();
                        $("#gd-open-document-" + prefix).prop("disabled", false);
                    }
                }
            }, false);
            return xhr;
        },
        type: 'POST',
        url: getApplicationPath('uploadDocument'),
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function(returnedData) {
            if(returnedData.message != undefined){
                // open error popup
                printMessage(returnedData.message);
                return;
            }
        },
        error: function(xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.message);
            // open error popup
            printMessage(err.message);
        }
    });
}

/**
 * Print current document
 */
function printDocument(){
    // get current document content
    var documentContainer = $("#gd-panzoom");
    // force each document page to be printed as a new page
    var cssPrint = '<style>'+
        '@media print'+
        '{.gd-wrapper {page-break-after:always;}';
    // set correct page orientation if page were rotated
    documentContainer.find(".gd-page").each(function(index, page){
        if($(page).css("transform") != "none"){
            cssPrint = cssPrint + "#" + $(page).attr("id") + "{transform: rotate(0deg) !important;}";
        }
    });
    cssPrint = cssPrint + '}</style>';
    // open print dialog
    var windowObject = window.open('', "PrintWindow", "width=750,height=650,top=50,left=50,toolbars=yes,scrollbars=yes,status=yes,resizable=yes");
    // add current document into the print window
    windowObject.document.writeln(cssPrint);
    // add current document into the print window
    windowObject.document.writeln(documentContainer[0].innerHTML);
    windowObject.document.close();
    windowObject.focus();
    windowObject.print();
    windowObject.close();
}

/**
 * Close modal
 */
function closeModal(){
    toggleModalDialog(false, '');
}

/**
 * Open password modal
 * @param {string} error - error message
 **/
function openPasswordModal(error){
    var passwordSection = '<section id="gd-password-section" class="tab-slider-body">'+
        '<div class="inner-addon left-addon btn gd-password-wrap" id="gd-password-wrap">'+
        '<input type="password" class="form-control" id="gd-password-input" placeholder="Enter password">'+
        '<button class="btn btn-primary" id="gd-password-submit">Submit</button>'+
        '<span class="gd-password-error" style="display: none;"></span>'+
        '</div>'+
        '</section>';
    toggleModalDialog(true, 'Password required', passwordSection);
    if(error != "" && typeof error != "undefined"){
        $(".gd-password-error")[0].innerHTML = error;
        $(".gd-password-error").show();
    } else {
        $(".gd-password-error").hide();
    }
}

/**
 * Get HTML content for file browser modal
 **/
function getHtmlFileBrowser(){
    return '<section id="gd-browse-section" class="tab-slider-body">'+
        '<div id="gd-modal-spinner"><i class="fas fa-circle-notch fa-spin"></i> &nbsp;Loading... Please wait.</div>'+
        '<table id="gd-modal-filebroswer" class="gd-modal-table">'+
        '<thead>'+
        '<tr>'+
        '<th class="col-md-1"> </th>'+
        '<th class="col-md-5">Document</th>'+
        '<th class="col-md-3">Format</th>'+
        '<th class="col-md-3">Size</th>'+
        '</tr>'+
        '</thead>'+
        '<tbody>'+
        '<tr>'+
        '<td class="text-center gd-go-up"><i class="fas fa-level-up"></i></td>'+
        '<td class="gd-filetree-up gd-go-up">...</td>'+
        '<td></td>'+
        '<td></td>'+
        '</tr>' +
    // list of files
    '</tbody>'+
    '</table>'+
    '</section>';
}

/**
 * Get HTML content for drag and drop area
 **/
function getHtmlDragAndDropArea(prefix){
    // upload section
    var uploadSection = '<section id="gd-upload-section-' + prefix + '" class="tab-slider-body">'+
        '<div class="gd-drag-n-drop-wrap-compare" id="gd-dropZone-' + prefix + '">'+
        '<div class="gd-drag-n-drop-icon"><i class="fas fa-cloud-download-alt fa-5x" aria-hidden="true"></i></div>'+
        '<h2>Drag &amp; Drop the ' + prefix + ' file here</h2>'+
        '<h4>OR</h4>'+
        '<div class="gd-drag-n-drop-buttons">'+
        '<label class="btn btn-primary">'+
        '<i class="fas fa-file"></i>'+
        'SELECT FILE'+
        '<input id="gd-upload-input-' + prefix + '" type="file" multiple style="display: none;">'+
        '</label>'+
        '<label class="btn" id="gd-url-button-' + prefix + '">'+
        '<i class="fas fa-link"></i>'+
        'URL'+
        '</label>'+
        '</div>'+
        '</div>'+
        '<div class="inner-addon left-addon btn gd-url-wrap" id="gd-url-wrap-' + prefix + '" style="display: none;">'+
        '<input type="url" class="form-control" id="gd-url-' + prefix + '" placeholder="Enter your file URL">'+
        '<button class="btn" id="gd-url-cancel-' + prefix + '"><i class="fas fa-trash"></i></button>'+
        '<button class="btn btn-primary" id="gd-add-url-' + prefix + '">Add</button>'+
        '</div>'+
        '<div id="gd-upload-files-table-' + prefix + '">'+
        // list of files
        '</div>'+
        '<div class="gd-browse-document gd-modal-buttons" id="gd-open-document-' + prefix + '">'+
        '<i class="fas fa-folder-open"></i>BROWSE files'+
        '</section>';
    return uploadSection;
}

/*
******************************************************************
******************************************************************
GROUPDOCS.COMAPRISON PLUGIN
******************************************************************
******************************************************************
*/
(function( $ ) {
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
        init : function( options ) {
            // set defaults
            var defaults = {
                applicationPath: null,
                download: true,
                upload: true,
                print: true,
            };
            options = $.extend(defaults, options);

            // set global option params
            applicationPath = options.applicationPath;

            // assembly html base
            this.append(getHtmlBase);
            this.append(getHtmlModalDialog);

            $(gd_navbar).append(getHtmlComparisonPanel);
            $(gd_navbar).append(getHtmlNavSplitter);

            // assembly nav bar
            if(options.download){
                $(gd_navbar).append(getHtmlNavDownloadPanel);
                $(gd_navbar).append(getHtmlNavSplitter);
            }
            if(options.upload){
                $(gd_navbar).append(getHtmlNavUploadPanel);
                $(gd_navbar).append(getHtmlNavSplitter);
            }
            if(options.print){
                $(gd_navbar).append(getHtmlNavPrintPanel);
                $(gd_navbar).append(getHtmlNavSplitter);
            }

            var dropZoneFirst = $('#gd-dropZone-first');
            if (typeof dropZoneFirst[0] != "undefined") {
                //Drag n drop functional
                if ($('#gd-dropZone-first').length) {
                    if (typeof (window.FileReader) == 'undefined') {
                        dropZoneFirst.text("Your browser doesn't support Drag and Drop");
                        dropZoneFirst.addClass('error');
                    }
                }

                dropZoneFirst[0].ondragover = function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    dropZoneFirst.addClass('hover');
                    return false;
                };

                dropZoneFirst[0].ondragleave = function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    dropZoneFirst.removeClass('hover');
                    return false;
                };

                dropZoneFirst[0].ondrop = function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    dropZoneFirst.removeClass('hover');
                    var files = event.dataTransfer.files;
                    addFileForComparing(files, null, 'first');
                };
            }
            var dropZoneSecond = $('#gd-dropZone-second');
            if (typeof dropZoneSecond[0] != "undefined") {
                //Drag n drop functional
                if ($('#gd-dropZone-second').length) {
                    if (typeof (window.FileReader) == 'undefined') {
                        dropZoneSecond.text("Your browser doesn't support Drag and Drop");
                        dropZoneSecond.addClass('error');
                    }
                }

                dropZoneSecond[0].ondragover = function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    dropZoneSecond.addClass('hover');
                    return false;
                };

                dropZoneSecond[0].ondragleave = function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    dropZoneSecond.removeClass('hover');
                    return false;
                };

                dropZoneSecond[0].ondrop = function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    dropZoneSecond.removeClass('hover');
                    var files = event.dataTransfer.files;
                    addFileForComparing(files, null, 'second');
                };
            }
        }
    };


    /*
    ******************************************************************
    INIT PLUGIN
    ******************************************************************
    */
    $.fn.comparison = function( method ) {
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method' +  method + ' does not exist on jQuery.comparison' );
        }
    };


    /*
    ******************************************************************
    HTML MARKUP
    ******************************************************************
    */
    function getHtmlComparisonPanel(){
        return '<li class="gd-nav-toggle">'+
            '<span id="gd-compare-value">' +
            '<i class="fas fa-book-open"></i>'+
            '<span class="gd-tooltip">Compare</span>'+
            '</span>'+
            '</li>';
    }

    function getHtmlBase(){
        return '<div id="gd-container">'+
            '<div class="wrapper">'+
            // header BEGIN
            '<div id="gd-header">'+
            '<div id="gd-header-logo">'+
            '</div>'+

            // nav bar BEGIN
            '<ul id="' + gd_navbar.slice(1) + '">'+
            // nav bar content
            '</ul>'+
            // nav bar END
            '</div>'+
            // header END

            // pages BEGIN
            '<div id="gd-pages">'+
            getHtmlDragAndDropArea('first') + getHtmlDragAndDropArea('second') +
            '</div>'+
            '</div>'+
            // pages END

            '</div>'+
            '</div>';
    }

    function getHtmlModalDialog(){
        return 	'<div class="gd-modal fade" id="modalDialog">'+
            '<div class="gd-modal-dialog">'+
            '<div class="gd-modal-content" id="gd-modal-content">'+
            // header
            '<div class="gd-modal-header">'+
            '<div class="gd-modal-close gd-modal-close-action"><span>x</span></div>'+
            '<h4 class="gd-modal-title"></h4>'+
            '</div>'+
            // body
            '<div class="gd-modal-body">'+
            // modal content will be here
            '</div>'+
            // footer
            '<div class="gd-modal-footer">'+
            // empty footer
            '</div>'+
            '</div><!-- /.modal-content -->'+
            '</div><!-- /.modal-dialog -->'+
            '</div>';
    }

    function getHtmlNavSplitter(){
        return '<li class="gd-nav-separator" role="separator"></li>';
    }

    function getHtmlNavDownloadPanel(){
        return '<li id="gd-btn-download"><i class="fas fa-download"></i><span class="gd-tooltip">Download</span></li>';
    }

    function getHtmlNavPrintPanel(){
        return '<li id="gd-btn-print"><i class="fas fa-print"></i><span class="gd-tooltip">Print</span></li>';
    }

    function getHtmlNavUploadPanel(){
        return '<li id="gd-btn-upload"><i class="fas fa-upload"></i><span class="gd-tooltip">Upload</span></li>';
    }
})(jQuery);

/*
******************************************************************
******************************************************************
CHECK IF MOBILE
******************************************************************
******************************************************************
*/
var isMobile = function(){
    return 'ontouchstart' in window // works on most browsers
        || 'onmsgesturechange' in window; // works on ie10
};