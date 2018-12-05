/**
 * groupdocs.annotation Plugin
 * Copyright (c) 2018 Aspose Pty Ltd
 * Licensed under MIT.
 * @author Aspose Pty Ltd
 * @version 1.4.0
 */

(function ($) {

	/**
	* Create private variables.
	**/
    var mouse = {
        x: 0,
        y: 0,
    };
    var element = null;
    var pointSvgSize = 25;
    var svgCircleRadius = 22;

    var zoomCorrection = {
        x: 0,
        y: 0
    };
	var markerWidth = 20;
    var canvas = null;
    var currentAnnotation = null;
    var canvasTopOffset = null;
    var currentPrefix = "";
    var userMouseUp = ('ontouchend' in document.documentElement) ? 'touchend mouseup' : 'mouseup';
    var userMouseMove = ('ontouchmove' in document.documentElement) ? 'touchmove mousemove' : 'mousemove';

    /**
	 * Draw svg annotation	
	 */
    $.fn.drawSvgAnnotation = function (documentPage, prefix) {
        // get current data required to draw and positioning the annotation
        canvas = documentPage;
        zoomLevel = (typeof $(canvas).css("zoom") == "undefined") ? 1 : $(canvas).css("zoom");
        currentAnnotation = annotation;
        if (zoomLevel == "100%") {
            zoomLevel = 1;
        }
        // get coordinates correction - this is required since the document page is zoomed
        zoomCorrection.x = ($(canvas).offset().left * zoomLevel) - $(canvas).offset().left;
        zoomCorrection.y = ($(canvas).offset().top * zoomLevel) - $(canvas).offset().top;
        canvasTopOffset = $(canvas).offset().top * zoomLevel;
        currentPrefix = prefix;
    }

    /**
	* Extend plugin
	**/
    $.extend(true, $.fn.drawSvgAnnotation, {

        /**
		* Draw point annotation
		*/
        drawPoint: function (event) {
            mouse = getMousePosition(event);
            // get current x and y coordinates
            var x = mouse.x - $(canvas).offset().left - (parseInt($(canvas).css("margin-left")) * 2);
            var y = mouse.y - canvasTopOffset - (parseInt($(canvas).css("margin-top")) * 2);
            // set annotation data
            currentAnnotation.id = annotationsCounter;
            currentAnnotation.left = x;
            currentAnnotation.top = y;
            currentAnnotation.width = pointSvgSize;
            currentAnnotation.height = pointSvgSize;
            // add annotation into the annotations list
            annotationsList.push(currentAnnotation);
            addComment(currentAnnotation);
            // draw the point SVG
            var circle = svgList[canvas.id].circle(svgCircleRadius);
            circle.attr({
                'fill': 'blue',
                'stroke': 'black',
                'stroke-width': 2,
                'cx': x,
                'cy': y,
                'id': 'gd-point-annotation-' + annotationsCounter,
                'class': 'gd-annotation annotation svg'
            });
            var boundingBox = getBoundingBox(currentAnnotation, x, y, circle);
            canvas.prepend(boundingBox);
            makeResizable(currentAnnotation, boundingBox);
        },

        /**
		* Draw polyline annotation
		*/
        drawPolyline: function (event) {
            mouse = getMousePosition(event);
            // get x and y coordinates
            var x = mouse.x - $(canvas).offset().left - (parseInt($(canvas).css("margin-left")) * 2);
            var y = mouse.y - canvasTopOffset - (parseInt($(canvas).css("margin-top")) * 2);
            currentAnnotation.id = annotationsCounter;
            // set polyline draw options
            var option = {
                'stroke': 'blue',
                'stroke-width': 2,
                'fill-opacity': 0,
                'id': 'gd-polyline-annotation-' + annotationsCounter,
                'class': 'gd-annotation annotation svg'
            };
            // initiate svg object
            var line = null;
            line = svgList[canvas.id].polyline().attr(option);
            line.draw(event);
            // set mouse move event handler
            $('#gd-panzoom').bind(userMouseMove, svgList[canvas.id], function (event) {
                if (line) {
                    // draw line to next point coordinates
                    if (typeof event.clientX == "undefined") {
                        event.clientX = event.touches[0].clientX;
                    }
                    if (typeof event.clientY == "undefined") {
                        event.clientY = event.touches[0].clientY;
                    }
                    line.draw('point', event);
                }
            })
            // set mouse up event handler
            $('#gd-panzoom').bind(userMouseUp, svgList[canvas.id], function (event) {
                if (line && currentPrefix == "polyline") {
                    // stop draw
                    line.draw('stop', event);
                    // set annotation data
                    currentAnnotation.left = x;
                    currentAnnotation.top = y;
                    currentAnnotation.width = line.width();
                    currentAnnotation.height = line.height();
                    currentAnnotation.svgPath = "M";
                    var previousX = 0;
                    var previousY = 0;
                    // prepare SVG path string, important note: all point coordinates except the first one are not coordinates, 
                    // but the number of pixels that need to be added or subtracted from the previous point in order to obtain the amount of displacement.
                    // This is required by the GRoupDocs.Annotation library to draw the SVG path
                    if (line.node.points.numberOfItems) { // for safari
                        for (i = 0; i < line.node.points.numberOfItems; i++) {
                            var point = line.node.points.getItem(i);
                            if (i == 0) {
                                currentAnnotation.svgPath = currentAnnotation.svgPath + point.x + "," + point.y + "l";
                            } else {
                                previousX = point.x - previousX;
                                previousY = point.y - previousY;
                                currentAnnotation.svgPath = currentAnnotation.svgPath + previousX + "," + previousY + "l";
                            }
                            previousX = point.x;
                            previousY = point.y;
                        }
                    } else { // for other browsers
                        $.each(line.node.points, function (index, point) {
                            if (index == 0) {
                                currentAnnotation.svgPath = currentAnnotation.svgPath + point.x + "," + point.y + "l";
                            } else {
                                previousX = point.x - previousX;
                                previousY = point.y - previousY;
                                currentAnnotation.svgPath = currentAnnotation.svgPath + previousX + "," + previousY + "l";
                            }
                            previousX = point.x;
                            previousY = point.y;
                        });
                    }
                    currentAnnotation.svgPath = currentAnnotation.svgPath.slice(0, -1);
                    // add annotation into the annotations list
                    annotationsList.push(currentAnnotation);
                    // add comments
                    addComment(currentAnnotation);
                    var boundingBox = getBoundingBox(currentAnnotation, x, y, line);
                    canvas.prepend(boundingBox);
                    line = null;
                    makeResizable(currentAnnotation, boundingBox);
                }
            });
        },

        /**
		* Draw arrow annotation
		*/
        drawArrow: function (event) {
            mouse = getMousePosition(event);
            // get coordinates
            var x = mouse.x - $(canvas).offset().left - (parseInt($(canvas).css("margin-left")) * 2) + markerWidth;
            var y = mouse.y - canvasTopOffset - (parseInt($(canvas).css("margin-top")) * 2) + markerWidth;
            currentAnnotation.id = annotationsCounter;
            // set draw options
            var option = {
                'stroke': 'blue',
                'stroke-width': 2,
                'fill-opacity': 0,
                'id': 'gd-arrow-annotation-' + annotationsCounter,
                'class': 'gd-annotation annotation svg'

            };
            // draw start point
            var path = null;
            path = svgList[canvas.id].path("M" + x + "," + y + " L" + x + "," + y).attr(option);
            // set mouse move event handler
            $('#gd-panzoom').bind(userMouseMove, svgList[canvas.id], function (event) {
                if (path) {
                    // get current coordinates after mouse move
                    mouse = getMousePosition(event);
                    var endX = mouse.x - $(canvas).offset().left - (parseInt($(canvas).css("margin-left")) * 2) + markerWidth;
                    var endY = mouse.y - canvasTopOffset - (parseInt($(canvas).css("margin-top")) * 2) + markerWidth;
					var coordinates = validateCoordinates(endX, endY, canvas);
					endX = coordinates.x;
					endY = coordinates.y;
                    // update svg with the end point and draw line between
                    path.plot("M" + x.toFixed(0) + "," + y.toFixed(0) + " L" + endX.toFixed(0) + "," + endY.toFixed(0));
                    // add arrow marker at the line end
                    path.marker('end', markerWidth, markerWidth, function (add) {
                        var arrow = "M0,7 L0,13 L12,10 z";
                        add.path(arrow);

                        this.fill('blue');
                    });
                }
            })
            // set mouse up event handler
            $('#gd-panzoom').bind(userMouseUp, svgList[canvas.id], function (event) {
                if (path && currentPrefix == "arrow") {
                    // set annotation data
                    currentAnnotation.left = x;
                    currentAnnotation.top = y;
                    currentAnnotation.width = path.width();
                    currentAnnotation.height = path.height();
                    var svgPath = "M";
                    $.each(path.attr("d").split(" "), function (index, point) {
                        svgPath = svgPath + parseInt(point.split(",")[0].replace(/[^\d.]/g, '')).toFixed(0) + "," + parseInt(point.split(",")[1].replace(/[^\d.]/g, '')).toFixed(0) + " L";
                    });
                    currentAnnotation.svgPath = $.trim(svgPath.slice(0, -1));
                    annotationsList.push(currentAnnotation);
                    addComment(currentAnnotation);
                    var boundingBox = getBoundingBox(currentAnnotation, x, y, path);
                    canvas.prepend(boundingBox);
                    path = null;
                    makeResizable(currentAnnotation, boundingBox);
                }
            });
        },

        /**
		* Draw distance annotation
		*/
        drawDistance: function (event) {
            // get coordinates
            mouse = getMousePosition(event);
            var x = mouse.x - $(canvas).offset().left - (parseInt($(canvas).css("margin-left")) * 2);
            var y = mouse.y - canvasTopOffset - (parseInt($(canvas).css("margin-top")) * 2);
            currentAnnotation.id = annotationsCounter;
            // set draw options
            var option = {
                'stroke': 'blue',
                'stroke-width': 2,
                'fill-opacity': 0,
                'id': 'gd-distance-annotation-' + annotationsCounter,
                'class': 'gd-annotation annotation svg'

            };
            // set text options
            var textOptions = {
                'font-size': "12px",
                'data-id': currentAnnotation.id
            };
            // draw start point
            var path = null;
            path = svgList[canvas.id].path("M" + x + "," + y + " L" + x + "," + y).attr(option);
            // add text svg element - used to display the distance value
            var text = null;
            text = svgList[canvas.id].text("0px").attr(textOptions);
            // set mouse move event
            $('#gd-panzoom').bind(userMouseMove, svgList[canvas.id], function (event) {
                if (path) {
                    // get end coordinates
                    mouse = getMousePosition(event);
                    var endX = mouse.x - $(canvas).offset().left - (parseInt($(canvas).css("margin-left")) * 2) + markerWidth;
                    var endY = mouse.y - canvasTopOffset - (parseInt($(canvas).css("margin-top")) * 2) + markerWidth;					
					var coordinates = validateCoordinates(endX, endY, canvas);
					endX = coordinates.x;
					endY = coordinates.y;
                    // draw the last point and the line between
                    path.plot("M" + x + "," + y + " L" + endX + "," + endY);
                    // update text value and draw it in accordance with the svg					
                    var textPath = "";
                    var moveTextPositionX = 0;
                    var point1 = { X: x, Y: y };
                    var point2 = { X: endX, Y: endY };
                    var annotationWidth = getDistance(point1, point2);
                    textPath = getTextPath(x, y, endX, endY, path);
                    if (annotationWidth < 0) {
                        annotationWidth = Math.abs(annotationWidth);
                    }
                    moveTextPositionX = Math.abs((annotationWidth / 2) - markerWidth);					
					
                    text.path(textPath).move(moveTextPositionX, y).tspan(Math.round(annotationWidth) + "px");
					if( navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ){
						$("text[data-id='" + currentAnnotation.id +"']").attr("y", 0);
					}
                    // add start and end arrows
                    path.marker('start', markerWidth, markerWidth, function (add) {
                        var arrow = "M12,7 L12,13 L0,10 z";
                        add.path(arrow);
                        add.rect(1, markerWidth).cx(0).fill('blue')
                        this.fill('blue');
                    });
                    path.marker('end', markerWidth, markerWidth, function (add) {
                        var arrow = "M0,7 L0,13 L12,10 z";
                        add.path(arrow);
                        add.rect(1, markerWidth).cx(11).fill('blue')
                        this.fill('blue');
                        currentAnnotation.text = Math.round(path.width()) + "px";
                    });
                }
            })
            // set mouse up event
            $('#gd-panzoom').bind(userMouseUp, svgList[canvas.id], function (event) {
                if (path) {					
                    currentAnnotation.left = x;
                    currentAnnotation.top = y;
                    currentAnnotation.width = path.width();
                    currentAnnotation.height = path.height();
                    var svgPath = "M";
                    $.each(path.attr("d").split(" "), function (index, point) {
                        svgPath = svgPath + parseInt(point.split(",")[0].replace(/[^\d.]/g, '')).toFixed(0) + "," + parseInt(point.split(",")[1].replace(/[^\d.]/g, '')).toFixed(0) + " L";
                    });
                    currentAnnotation.svgPath = $.trim(svgPath.slice(0, -1));
                    annotationsList.push(currentAnnotation);
                    addComment(currentAnnotation);
                    var boundingBox = getBoundingBox(currentAnnotation, x, y, path);
                    canvas.prepend(boundingBox);
                    path = null;
                    makeResizable(currentAnnotation, boundingBox);
                }
            });
        },

        /**
		* Import point annotation
		*/
        importPoint: function (annotation) {
            annotation.id = annotationsCounter;
            // add annotation into the annotations list
            annotationsList.push(annotation);
            // add comments
            addComment(annotation);
            // draw imported annotation
            var circle = svgList[canvas.id].circle(svgCircleRadius);
            circle.attr({
                'fill': 'blue',
                'stroke': 'black',
                'stroke-width': 2,
                'cx': annotation.left,
                'cy': annotation.top,
                'id': 'gd-point-annotation-' + annotationsCounter,
                'class': 'gd-annotation annotation svg'
            });
            var boundingBox = getBoundingBox(annotation, annotation.left, annotation.top, circle);
            canvas.prepend(boundingBox);
            makeResizable(annotation, boundingBox);
        },

        /**
		* Import polyline annotation
		*/
        importPolyline: function (annotation) {
            annotation.id = annotationsCounter;
            annotationsList.push(annotation);
            addComment(annotation);
            var option = {
                'stroke': '#82abc7',
                'stroke-width': 2,
                'fill-opacity': 0,
                'id': 'gd-polyline-annotation-' + annotationsCounter,
                'class': 'gd-annotation annotation svg'
            };
            var line = null;
            var svgPath = "";
            // recalculate path points coordinates from the offset values back to the coordinates values - why we need this described above in the draw polyline action
            var points = annotation.svgPath.replace("M", "").split('l');
            var x = parseFloat(points[0].split(",")[0]);
            var y = parseFloat(points[0].split(",")[1]);
            svgPath = points[0];
            $.each(points, function (index, point) {
                if (index != 0) {
                    if (point != "") {
                        svgPath = svgPath + " " + (x + parseFloat(point.split(",")[0])) + "," + (y + parseFloat(point.split(",")[1]));
                        x = (x + parseFloat(point.split(",")[0]));
                        y = (y + parseFloat(point.split(",")[1]));
                    }
                }
            });
            // draw imported annotation
            line = svgList[canvas.id].polyline(svgPath).attr(option);

            // fix dimensions
            var dimensions = getRectangleFromPath(convertPairsToPoints(svgPath));
            annotation.top = dimensions.top;
            annotation.left = dimensions.left;
            annotation.width = dimensions.width;
            annotation.height = dimensions.height;

            var boundingBox = getBoundingBox(annotation, annotation.left, annotation.top, line);
            canvas.prepend(boundingBox);
            makeResizable(annotation, boundingBox);
        },

        /**
		* Import arrow annotation
		*/
        importArrow: function (annotation) {
            currentAnnotation.id = annotationsCounter;
            annotationsList.push(annotation);
            addComment(annotation);
            var option = {
                'stroke': 'blue',
                'stroke-width': 2,
                'fill-opacity': 0,
                'id': 'gd-arrow-annotation-' + annotationsCounter,
                'class': 'gd-annotation annotation svg'

            };
            // draw imported annotation
            var arrow = svgList[canvas.id].path("M" + annotation.left + "," + annotation.top + " L" + (annotation.left + annotation.width) + "," + (annotation.top + annotation.height)).attr(option);
            arrow.marker('end', markerWidth, markerWidth, function (add) {
                var arrow = "M0,7 L0,13 L12,10 z";
                add.path(arrow);

                this.fill('blue');
            });
            annotationsList[annotationsList.length - 1].svgPath = "M" + annotation.left + "," + annotation.top + " L" + (annotation.left + annotation.width) + "," + (annotation.top + annotation.height);
            var x = 0;
            var y = 0;
            if (annotation.left > (annotation.left + annotation.width)) {
                x = (annotation.left + annotation.width);
            } else {
                x = annotation.left;
            }
            if (annotation.top > (annotation.top + annotation.height)) {
                y = (annotation.top + annotation.height);
            } else {
                y = annotation.top;
            }
            var boundingBox = getBoundingBox(annotation, x, y, arrow);
            canvas.prepend(boundingBox);
            makeResizable(annotation, boundingBox);
        },

        /**
		* import distance annotation
		*/
        importDistance: function (annotation) {
            currentAnnotation.id = annotationsCounter;
            if (annotation.comments != null) {
                annotation.comments[0].text = annotation.comments[0].text.replace(annotation.width + "px", "");
                annotation.comments = $.grep(annotation.comments, function (value) {
                    return value.text != "  ";
                });
            }
            annotation.text = Math.round(annotation.width) + "px";
            annotationsList.push(annotation);
            addComment(annotation);
            var option = {
                'stroke': 'blue',
                'stroke-width': 2,
                'fill-opacity': 0,
                'id': 'gd-distance-annotation-' + annotationsCounter,
                'class': 'gd-annotation annotation svg'

            };
            var textOptions = {
                'font-size': "12px",
                'data-id': currentAnnotation.id
            };
            var text = null;
            // prepare svg path coordinates
            var svgPath = annotation.svgPath.split("L")[0];
            var points = annotation.svgPath.replace("M", "").split('L');
            var x = parseFloat(points[0].split(",")[0]);
            var y = parseFloat(points[0].split(",")[1]);
            // recalculate path points coordinates from the offset values back to the coordinates values
            $.each(points, function (index, point) {
                if (index != 0) {
                    svgPath = svgPath + " L" + (x + parseFloat(point.split(",")[0])) + "," + (y + parseFloat(point.split(",")[1]));
                } else {
                    return true;
                }
            });
            // draw the distance annotation
            var distance = svgList[canvas.id].path(svgPath).attr(option);
            // draw text with the distance data
            text = svgList[canvas.id].text(annotation.width + "px").attr(textOptions)
            var correctDistance = (annotation.width > 5) ? annotation.width : Math.abs(annotation.height);
            text.path(svgPath).tspan(Math.round(correctDistance) + "px").dx((correctDistance / 2) - markerWidth).dy(-5);
            // add start and end arrows
            distance.marker('start', markerWidth, markerWidth, function (add) {
                var arrow = "M12,7 L12,13 L0,10 z";
                add.path(arrow);
                add.rect(1, markerWidth).cx(0).fill('blue')
                this.fill('blue');
            });
            distance.marker('end', markerWidth, markerWidth, function (add) {
                var arrow = "M0,7 L0,13 L12,10 z";
                add.path(arrow);
                add.rect(1, markerWidth).cx(11).fill('blue')
                this.fill('blue');
            });
            annotationsList[annotationsList.length - 1].svgPath = svgPath;
            var boundingBox = getBoundingBox(annotation, x, y, distance);
            canvas.prepend(boundingBox);
            makeResizable(annotation, boundingBox);
        },
    });

    // This is custom extension of polyline, which doesn't draw the circle
    SVG.Element.prototype.draw.extend('polyline', {

        init: function (e) {
            // When we draw a polygon, we immediately need 2 points.
            // One start-point and one point at the mouse-position
            this.set = new SVG.Set();
            var p = null;
            if (isNaN(this.startPoint.x) && isNaN(this.startPoint.y)) {
                p = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
            } else {
                p = this.startPoint;
            }

            arr = [
                [p.x - zoomCorrection.x, p.y - zoomCorrection.y],
                [p.x - zoomCorrection.x, p.y - zoomCorrection.y]
            ];

            this.el.plot(arr);
        },

        // The calc-function sets the position of the last point to the mouse-position (with offset)
        calc: function (e) {
            var arr = this.el.array().valueOf();
            arr.pop();

            if (e) {
                // fix for mobiles
                var x = (typeof e.clientX != "undefined") ? e.clientX : e.changedTouches[0].clientX;
                var y = (typeof e.clientY != "undefined") ? e.clientY : e.changedTouches[0].clientY;
                var p = this.transformPoint(x, y);
                p.x = p.x - zoomCorrection.x;
                p.y = p.y - zoomCorrection.y;
                arr.push(this.snapToGrid([p.x, p.y]));
            }

            this.el.plot(arr);

        },

        point: function (e) {

            if (this.el.type.indexOf('poly') > -1) {
                // fix for mobiles
                var x = (typeof e.clientX != "undefined") ? e.clientX : e.touches[0].clientX;
                var y = (typeof e.clientY != "undefined") ? e.clientY : e.touches[0].clientY;
                // Add the new Point to the point-array
                var p = this.transformPoint(x, y),
                    arr = this.el.array().valueOf();
                p.x = p.x - zoomCorrection.x;
                p.y = p.y - zoomCorrection.y;
                arr.push(this.snapToGrid([p.x, p.y]));

                this.el.plot(arr);

                // Fire the `drawpoint`-event, which holds the coordinates of the new Point
                this.el.fire('drawpoint', { event: e, p: { x: p.x, y: p.y }, m: this.m });

                return;
            }

            // We are done, if the element is no polyline or polygon
            this.stop(e);

        },

        clean: function () {
            // Remove all circles
            this.set.each(function () {
                this.remove();
            });

            this.set.clear();

            delete this.set;

        },
    });

	/**
	 * draw bound div which will set annotation area used to drag it
	 * @param {Object} currentAnnotation - current annotation object
	 * @param {int} x - current mouse position X
	 * @param {int} y - current mouse position Y
	 * @param {Object} svgElement - currently dranw SVG
	 */
    function getBoundingBox(currentAnnotation, x, y, svgElement) {
        var boundingBox = document.createElement('div');
        boundingBox.className = 'gd-bounding-box';
        boundingBox.setAttribute("data-id", svgElement.id());
        boundingBox.style.position = "absolute";
        var width = (currentAnnotation.width < 0) ? Math.abs(currentAnnotation.width) : currentAnnotation.width;
        var height = (currentAnnotation.height < 0) ? Math.abs(currentAnnotation.height) : currentAnnotation.height;
        switch (currentAnnotation.type) {
            case "polyline":
                x = svgElement.node.points.getItem(0).x;
                y = svgElement.node.points.getItem(0).y;
				for(var i =0; i < svgElement.node.points.numberOfItems; i++) {                
                    if (x > svgElement.node.points.getItem(i).x) {
                        x = svgElement.node.points.getItem(i).x;
                    }
                    if (y > svgElement.node.points.getItem(i).y) {
                        y = svgElement.node.points.getItem(i).y;
                    }
                };
                break;
            case "point":
                x = x - (width / 2);
                y = y - (height / 2);
                break;
            case "arrow":
                width = width + 10;
                height = height + 10;
                var points = $(svgElement.node).attr("d").split(" ");
                $.each(points, function (index, point) {
                    var currentX = parseInt(point.split(",")[0].replace(/[^\d.]/g, ''));
                    var currentY = parseInt(point.split(",")[1].replace(/[^\d.]/g, ''));
                    if (currentX < x) {
                        x = currentX;
                    }
                    if (currentY < y) {
                        y = currentY;
                    }
                });
                x = x - 5;
                y = y - 5;
                break;
            case "distance":
                width = width + 40;
                height = height + 50;
                var points = $(svgElement.node).attr("d").split(" ");
                $.each(points, function (index, point) {
                    var currentX = parseInt(point.split(",")[0].replace(/[^\d.]/g, ''));
                    var currentY = parseInt(point.split(",")[1].replace(/[^\d.]/g, ''));
                    if (currentX < x) {
                        x = currentX;
                    }
                    if (currentY < y) {
                        y = currentY;
                    }
                });
                x = x - 25;
                y = y - 25;
                break;
        }
        boundingBox.style.width = width + "px";
        boundingBox.style.height = height + "px";
        boundingBox.style.left = x.toFixed(0) + "px";
        boundingBox.style.top = y.toFixed(0) + "px";
        boundingBox.innerHTML = getContextMenu(currentAnnotation.id);
        return boundingBox;
    }

	/**
	 * calculate distance annotation
	 * @param {Object} point1 - coordinates of the start point
	 * @param {Object} point2 - coordinates of the end point	
	 */
    function getDistance(point1, point2) {
        var xs = 0;
        var ys = 0;
        xs = point2.X - point1.X;
        xs = xs * xs;

        ys = point2.Y - point1.Y;
        ys = ys * ys;

        return Math.sqrt(xs + ys);
    }

	/**
	 * calculate distance annotation text marker SVG path
	 * @param {int} x - start point X
	 * @param {int} y - start point Y
	 * @param {int} endX - end point X
	 * @param {int} endY - end point Y
	 * @param {Object} path - distance annotation object
	 */
    function getTextPath(x, y, endX, endY, path) {
        var textPath = "";
        if (endX > x) {
            textPath = "M" + x + "," + (y - 5) + " L" + endX + "," + (endY - 5);
        } else {
            textPath = "M" + endX + "," + (endY - 5) + " L" + x + "," + (y - 5);
        }
        if (path.width() < 15) {
            if (endY > y) {
                textPath = "M" + (x + 5) + "," + y + " L" + (endX + 5) + "," + endY;
            } else {
                textPath = "M" + (endX + 5) + "," + endY + " L" + (x + 5) + "," + y;
            }
        }
        return textPath;
    }
	
	/**
	 * Validate coordinates if they are out of the canvas.
	 * @param {int} x - start point X
	 * @param {int} y - start point Y	 
	 * @param {Object} canvas - draw canvas
	 */
	function validateCoordinates(x, y, canvas){
		var coordinates = {x: 0, y: 0}
		if(x > $(canvas).width()){
			coordinates.x = $(canvas).width() - markerWidth;
		} else if(x < 0){
			coordinates.x = markerWidth;			
		} else {
			coordinates.x = x;
		}
		
		if(y > $(canvas).height()){
			coordinates.y = $(canvas).height() - markerWidth;
		} else if(y < 0){
			coordinates.y = markerWidth;
		} else {
			coordinates.y = y;
		}
		return coordinates;
	}
})(jQuery);