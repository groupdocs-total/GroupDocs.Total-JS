/**
 * groupdocs.annotation Plugin
 * Copyright (c) 2018 Aspose Pty Ltd
 * Licensed under MIT.
 * @author Aspose Pty Ltd
 * @version 1.0.0
 */

(function( $ ) {

	/**
	* Create private variables.
	**/
	var mouse = {
        x: 0,
        y: 0,       
    };
    var element = null;	
	var pointSvgSize = 25;
	var svgCircle = {
		x: 12,
		y: 12,
		r: 22
	};		
	var svgPolyline = {
		width: 150,
		height: 150		
	};
	var zoomCorrection = {
		x: 0,
		y: 0
	};
	
	/**
	 * Draw svg annotation	
	 */
	$.fn.drawSvgAnnotation = function() {
		
	}
	
	/**
	* Extend plugin
	**/
	$.extend(true, $.fn.drawSvgAnnotation, {
		
		/**
		* Draw point annotation
		*/
		drawPoint: function(canvas, annotationsList, annotation, annotationsCounter, event){
			mouse = getMousePosition(event);				
			annotation.id = annotationsCounter;	
			element = document.createElement('div');
			element.className = 'gd-annotation';
			element.id = 'gd-point-annotation-' + annotationsCounter;
			var x = mouse.x - ($(canvas).offset().left * $(canvas).css("zoom"));
			var y = mouse.y - ($(canvas).offset().top * $(canvas).css("zoom"));
			element.style.left = x - 40 + "px";
			element.style.top = y - 40 + "px";	
			element.style.width = pointSvgSize + "px";
			element.style.height = pointSvgSize + "px";
			canvas.prepend(element);	
			annotation.left = parseInt(element.style.left.replace("px", ""));
			annotation.top = parseInt(element.style.top.replace("px", ""));	
			annotationsList.push(annotation);	
			makeResizable(annotation);				
			addComment(annotation);
			annotationsList[annotationsList.length - 1].width = parseInt(element.style.width.replace("px", ""));
			annotationsList[annotationsList.length - 1].height = parseInt(element.style.height.replace("px", ""));				
			var draw = SVG(element.id);
			var circle = draw.circle(svgCircle.r);
			circle.attr({
				fill: 'red',			
				stroke: 'black',
				'stroke-width': 2,
				'cx': svgCircle.x,
				'cy': svgCircle.y
			})
		},
		
		/**
		* Draw polyline annotation
		*/
		drawPolyline: function(canvas, annotationsList, annotation, annotationsCounter, event){
			mouse = getMousePosition(event);
			zoomCorrection.x = ($(canvas).offset().left * $(canvas).css("zoom")) - $(canvas).offset().left;
			zoomCorrection.y = ($(canvas).offset().top * $(canvas).css("zoom")) - $(canvas).offset().top;			
			annotation.id = annotationsCounter;	
			element = document.createElement('div');
			element.className = 'gd-annotation';
			element.id = 'gd-polyline-annotation-' + annotationsCounter; 			
			var x = mouse.x - ($(canvas).offset().left * $(canvas).css("zoom"));
			var y = mouse.y - ($(canvas).offset().top * $(canvas).css("zoom"));
			element.style.left = x + "px";
			element.style.top = y + "px";			
			element.style.width = svgPolyline.width + "px";
			element.style.height = svgPolyline.height + "px";			
			canvas.prepend(element);				
			var draw = SVG(element.id);
			const option = {
				stroke: 'red',
				'stroke-width': 2,
				'fill-opacity': 0,
				'transform': 'translate(-' + svgPolyline.width + ',-' + svgPolyline.height + ')'			  
			}
			let line = null;		
			line = draw.polyline().attr(option);			
			line.draw(event);					
			draw.on('mousemove', event => {
			  if (line) {
				line.draw('point', event);
			  }
			})
			draw.on('click', event => {
				if (line) {
											
					line.draw('stop', event);				
					annotation.left = parseInt(element.style.left.replace("px", ""));
					annotation.top = parseInt(element.style.top.replace("px", ""));	
					annotation.width = parseInt(canvas.offsetWidth);
					annotation.height = parseInt(canvas.offsetHeight);
					annotation.svgPath = "M";
					$.each(line.node.points, function(index, point){
						annotation.svgPath = annotation.svgPath + point.x + "," + point.y + ".";
					});
					annotation.svgPath = annotation.svgPath.slice(0,-1);
					annotationsList.push(annotation);	
					makeResizable(annotation);				
					addComment(annotation);					
				}
			});
		
		}
	});
	
	// This is custom extension of polyline, which doesn't draw the circle
	SVG.Element.prototype.draw.extend('polyline', {

		init:function(e){
		// When we draw a polygon, we immediately need 2 points.
		// One start-point and one point at the mouse-position

			this.set = new SVG.Set();

			var p = this.startPoint,			
			arr = [
				[p.x, p.y],
				[p.x, p.y]
			];

			this.el.plot(arr);
		},

		// The calc-function sets the position of the last point to the mouse-position (with offset ofc)
		calc:function (e) {
			var arr = this.el.array().valueOf();
			arr.pop();

			if (e) {
				var p = this.transformPoint(e.clientX, e.clientY);	
				p.x = p.x - zoomCorrection.x;
				p.y = p.y - zoomCorrection.y;
				arr.push(this.snapToGrid([p.x, p.y]));
			}

			this.el.plot(arr);

		},

		point:function(e){

			if (this.el.type.indexOf('poly') > -1) {
			  // Add the new Point to the point-array
				var p = this.transformPoint(e.clientX, e.clientY),
				arr = this.el.array().valueOf();
				p.x = p.x - zoomCorrection.x;
				p.y = p.y - zoomCorrection.y;				
				arr.push(this.snapToGrid([p.x, p.y]));

				this.el.plot(arr);

				// Fire the `drawpoint`-event, which holds the coords of the new Point
				this.el.fire('drawpoint', {event:e, p:{x:p.x, y:p.y}, m:this.m});

				return;
			}

			// We are done, if the element is no polyline or polygon
			this.stop(e);

		},

		clean:function(){
			// Remove all circles
			this.set.each(function () {
			  this.remove();
			});

			this.set.clear();

			delete this.set;

		},
	});
})(jQuery);