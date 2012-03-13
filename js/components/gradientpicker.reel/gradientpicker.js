/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 			require("montage/core/core").Montage,
	Component = 		require("montage/ui/component").Component;
////////////////////////////////////////////////////////////////////////
//Exporting as ColorWheel
exports.GradientPicker = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
		enumerable: true,
        value: true
    },
    ////////////////////////////////////////////////////////////////////
    //
    _updating: {
        enumerable: false,
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    _value: {
        enumerable: false,
        value: null
    },
	////////////////////////////////////////////////////////////////////
    //
    value: {
        enumerable: true,
        get: function() {
            return this._value;
        },
        set: function(value) {
            this._value = value;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _mode: {
        enumerable: false,
        value: 'linear'
    },
	////////////////////////////////////////////////////////////////////
    //
    mode: {
        enumerable: true,
        get: function() {
            return this._mode;
        },
        set: function(value) {
        	this.application.ninja.colorController.colorPopupManager.hideColorChipPopup();
        	//
            this._mode = value;
            //
            this._dispatchEvent('change', false);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    prepareForDraw: {
    	enumerable: false,
    	value: function() {
    		//
		}
    },
    ////////////////////////////////////////////////////////////////////
    //
    willDraw: {
    	enumerable: false,
    	value: function() {
    		//Getting component views from layout
    		this.element._components = {trackCover: this.element.getElementsByClassName('cp_gp_slider')[0].getElementsByClassName('cover')[0], gradientTrack: this.element.getElementsByClassName('cp_gp_slider')[0].getElementsByClassName('track')[0], stopsContainer: this.element.getElementsByClassName('cp_gp_slider')[0].getElementsByClassName('chips')[0]};
    		this.element._trackWidth = parseInt(getComputedStyle(this.element._components.stopsContainer).getPropertyCSSValue('width').cssText);
    		//TODO: Fix events and remove this hack
    		this.element._components.trackCover.addEventListener('mouseover', function () {
				if (!this._updating) {    		
	    			this.element._components.trackCover.style.display = 'none';
    			}
    		}.bind(this), true);
    		//
    		this.element.getElementsByClassName('cp_gp_linear')[0].addEventListener('change', function (e){
    			this.mode = 'linear';
    		}.bind(this), true);
    		//
    		this.element.getElementsByClassName('cp_gp_radial')[0].addEventListener('change', function (e){
    			this.mode = 'radial';
    		}.bind(this), true);	
		}
    },
    ////////////////////////////////////////////////////////////////////
    //
    draw: {
    	enumerable: false,
    	value: function() {
    		//
    		if (this.mode === 'linear') {
    			this.element.getElementsByClassName('cp_gp_linear')[0].checked = 'true';
    		} else if (this.mode === 'radial') {
    			this.element.getElementsByClassName('cp_gp_radial')[0].checked = 'true';
    		}
    		//
    		if (!this.value) {
    			this.addDefaultStops();
			} else {
				//Temp holder
				var stops = this.value;
				//Adding stops from preset value
				for (var i=0; stops[i]; i++) {
					this.addStop({color: {mode: stops[i].mode, value: stops[i].value}, percent:stops[i].position}, true);
				}
			}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
   	didDraw: {
    	enumerable: false,
    	value: function() {
			//
			this.element._components.gradientTrack.addEventListener('click', this, false);
    		
    		
    		
    		
    		
    		////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////
			//TODO: Determing a better way to get screen position
			var element = this.element._components.gradientTrack;
    		this.element._trackX = 0, this.element._trackY = 0;
    		//
   			while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
    			this.element._trackX += element.offsetLeft - element.scrollLeft;
    			this.element._trackY += element.offsetTop - element.scrollTop;
    			element = element.parentNode;
	    	}
    		////////////////////////////////////////////////////////////
    		////////////////////////////////////////////////////////////
    		
    		//This is forever changing, not sure why
    		//console.log(this.element._trackX, this.element._trackY);
    		
    		
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    addDefaultStops: {
    	enumerable: false,
    	value: function() {
    		this.addStop({color: {mode: 'rgb', value: {r: 255, g: 255, b: 255, a: 1, css: 'rgb(255, 255, 255)'}}, percent: 0}, true);
			this.addStop({color: {mode: 'rgb', value: {r: 0, g: 0, b: 0, a: 1, css: 'rgb(0, 0, 0)'}}, percent: 100}, true);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
   	addStop: {
    	enumerable: false,
    	value: function(data, silent) {
    		if (this.application.ninja.colorController.colorPopupManager) {
    			//Hiding any open popups (of gradient buttons)
    			this.application.ninja.colorController.colorPopupManager.hideColorChipPopup();
    			//Creating stop elements
    			var stop = document.createElement('div'),
    				holder = document.createElement('div'),
					tooltip = document.createElement('span'),
					button = document.createElement('button');
				//Setting up elements
				stop.appendChild(tooltip);
				stop.appendChild(holder);
				holder.appendChild(button);
				//Adding events to the stops
				stop.addEventListener('mousedown', this, false);
				stop.addEventListener('mouseup', this, false);
				//Storing refereces to buttons and actual stop container
				button.stop = stop;
				stop.button = button;
				//Adding stop to container
				this.element._components.stopsContainer.appendChild(stop);
				//Checking for bounds to add stop
				if (data.percent >= 0 && data.percent <= 100) {
					this.positionStop(stop, data.percent);
					button.stopPosition = data.percent;
				}
				//Creating an instance of input chip
				this.application.ninja.colorController.addButton('chip', button);
				//Initialing button with color data
				button.color(data.color.mode, data.color.value);
				//Button popup data
				button.props = {side: 'top', align: 'center', nocolor: false, wheel: true, palette: true, gradient: false, image: false, offset: -84, panel: true};
				//Listening for color events from button
				button.addEventListener('change', this, false);
				//Dispatching event depending on type of mode
				if (!silent) {
					this._dispatchEvent('change', false);
				} else {
					this._dispatchEvent('change', true);
				}
				//
    		} else {
    				//Handle Error
    		}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    removeStop: {
    	enumerable: false,
    	value: function(stop) {
    		var i, buttons = this.element._components.stopsContainer.getElementsByTagName('button');
    		//
    		if (buttons.length > 2) {
    			//Removing stops
    			this.element._components.stopsContainer.removeChild(stop);
    			//Stopping events related to this current stop
    			this.removeStopMoving();
    		}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    removeStopMoving: {
    	enumerable: false,
    	value: function() {
    		this._updating = false;
    		this.element._components.trackCover.style.display = 'none';
			this._dispatchEvent('change', false);
			document.removeEventListener('mousemove', this, false);
			document.removeEventListener('mouseup', this, false);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    positionStop: {
    	enumerable: false,
    	value: function(stop, percent) {
    		try {
    			if (percent<0) {
	    			percent = 0;
	    		} else if (percent>100) {
	    			percent = 100;
	    		}
	    		
	    		
	    		
	    		
	    		////////////////////////////////////////////////////////////
	    		////////////////////////////////////////////////////////////
    			//TODO: toggling visibility because of a browser bug
	    		stop.style.visibility = 'hidden'; //TODO: To be removed
    			var adj = (parseInt(getComputedStyle(stop).getPropertyCSSValue('width').cssText)*percent/100)/this.element._trackWidth;
    			stop.style.left = Math.round(percent-Math.round(adj*100))+'%';
    			stop.button.stopPosition = percent;
    			stop.style.visibility = 'visible'; //TODO: To be removed
    			////////////////////////////////////////////////////////////
    			////////////////////////////////////////////////////////////
    			
    			
    			
    			
    		} catch (e) {
    			//TEMP
    		}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //TODO: Add color detection canvas to get actual color
    handleClick: {
    	enumerable: false,
    	value: function(e) {
    		//Logic to get color from canvas data would go here
    		var data = {};
    		data.mode = 'rgb';
    		data.value = {r: 100, g: 100, b: 100, a: 1, css: 'rgb(100, 100, 100)'};
    		//
    		this.addStop({color: data, percent: Math.round(100*(e._event.offsetX/e._event.target.offsetWidth))});
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleMouseup: {
    	enumerable: false,
    	value: function(e) {
			this.removeStopMoving();
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleMousedown: {
    	enumerable: false,
    	value: function(e) {
			//
			var i, buttons = this.element._components.stopsContainer.getElementsByTagName('button');
			this.currentStop = e._event.target.stop;
    		//Looping through other stops to swap depths
    		for (i=0; buttons[i]; i++) {
    			buttons[i].stop.style.zIndex = 1;
    		}
			//Setting the depth of the current button to the highest
			this.currentStop.style.zIndex = buttons.length+1;
			//Adding events for actions while moving
			document.addEventListener('mousemove', this, false);
			document.addEventListener('mouseup', this, false);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleMousemove: {
    	enumerable: false,
    	value: function(e) {
    		//
    		this._updating = true;
    		//
    		this.application.ninja.colorController.colorPopupManager.hideColorChipPopup();
    		//
    		if ((e._event.y+this.hack.y) > this.element._trackY+70 || (e._event.y+this.hack.y) < this.element._trackY) {
    			this.removeStop(this.currentStop);
    		}
    		//
    		if (this.currentStop.button.stopPosition !== Math.round(((e._event.x+this.hack.x)-(this.element._trackX-23))/this.element._trackWidth*100)) {
    			this.element._components.trackCover.style.display = 'block';
    		}
    		//
    		this.positionStop(this.currentStop, Math.round(((e._event.x+this.hack.x)-(this.element._trackX-23))/this.element._trackWidth*100));
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleChange: {
    	enumerable: false,
    	value: function(e) {
    		this.application.ninja.colorController.colorView.colorManager.input = this.application.ninja.colorController.colorView.previousInput;
			this._dispatchEvent('change', false);
			this.application.ninja.colorController.colorView.colorManager.input = 'chip';
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //Dispatching custom event
    _dispatchEvent: {
        value: function(type, userInitiated) {
        	//
        	var actionEvent = document.createEvent("CustomEvent"), buttons = this.element._components.stopsContainer.getElementsByTagName('button'), stops = [], css, previewCss = '-webkit-gradient(linear, left top, right top';
        	//Preventing an events of less than 2 stops since there'll be a reset
        	if (buttons.length < 2) {
        		return;
        	}
        	//Initializing CSS string
        	if (this.mode === 'radial') {
        		css = '-webkit-radial-gradient(center, ellipse cover';
        	} else {
        		css = '-webkit-gradient(linear, left top, right top';
        	}
        	//Creating stops array
        	for (var i=0; i < buttons.length; i++) {
        		stops.push({value: buttons[i].colorValue, mode: buttons[i].colorMode, position: buttons[i].stopPosition});
        	}
        	//Sorting array (must be sorted for radial gradients, at least in Chrome
        	stops.sort(function(a,b){return a.position - b.position});
        	//Looping through stops in gradient to create CSS (actual and preview)
        	for (var i=0; i < stops.length; i++) {
        		//Addint to CSS String
        		if (this.mode === 'radial' && stops[i].value) {
        			css += ', '+stops[i].value.css+' '+stops[i].position+'% ';
        			//The CSS string for the preview bar is always linear
	        		previewCss += ', color-stop('+stops[i].position+'%,'+stops[i].value.css+')';
        		} else if (stops[i].value){
	        		css += ', color-stop('+stops[i].position+'%,'+stops[i].value.css+')';
	        		//The CSS string for the preview bar is always linear
	        		previewCss += ', color-stop('+stops[i].position+'%,'+stops[i].value.css+')';
        		} else {
        			//
        		}
        	}
        	//Closing the CSS strings
        	css += ')';
        	previewCss += ')';
        	//console.log(previewCss);
        	//Setting the preview track background
        	this.element._components.gradientTrack.style.background = previewCss;
        	//Storing the stops
        	this.value = stops;
        	//Initializing and storing data for event
            actionEvent.initEvent(type, true, true);
            actionEvent.type = type;
            actionEvent.wasSetByCode = userInitiated;
            actionEvent.gradient = {stops: this.value, mode: this.mode, gradientMode: this.mode, css: css};
            this.dispatchEvent(actionEvent);
        }
    }
    ////////////////////////////////////////////////////////////////////
});