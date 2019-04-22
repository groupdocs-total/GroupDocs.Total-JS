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
var userMouseClick = ('ontouch' in document.documentElement) ? 'touch click' : 'click';

$(document).ready(function () {

    /*
    ******************************************************************
    NAV BAR CONTROLS
    ******************************************************************
    */
});

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
            this.append(getHtmlBase);
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
        return '<div id="gd-container">' +
            '<div class="wrapper">' +
            // header BEGIN
            '<div id="gd-header">' +
            '<div id="gd-header-logo"></div>' +

            // nav bar BEGIN
            '<ul id="' + gd_navbar.slice(1) + '">' +
            // nav bar content
            '</ul>' +
            // nav bar END
            '</div>' +
            // header END
            '<div class="gd-comparison-bar-wrapper active">' +
            '<input id="gd-comparison-toggle" class="gd-comparison-toggle" type="checkbox" />' +
            '<label for="gd-comparison-toggle" class="gd-lbl-toggle"></label>' +
            '<div id="gd-select-compare-files">' +
            '<div id="gd-files-blocks" class="gd-files-blocks">' +
            getHtmlDragAndDropArea('first') + getHtmlDragAndDropArea('second') + getHtmlMultiCompare() +
            '</div>' +
            '</div>' +
            '</div>' +
            // pages BEGIN
            '<div id="gd-pages">' +
            '<div id="gd-compare-spinner" style="display: none;"><i class="fas fa-circle-notch fa-spin"></i> &nbsp;Comparing... Please wait.</div>' +
            '<div id="gd-panzoom">' +
            // list of pages
            '</div>' +
            '</div>' +
            // pages END
            '</div>' +
            '</div>';
    }

    function getHtmlComparePanel() {
        return '<li id="gd-btn-convert-all"><i class="fas fa-exchange-alt"></i><span class="gd-tooltip">Convert</span></li>';
    }

})(jQuery);