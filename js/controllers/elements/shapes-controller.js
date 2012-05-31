/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = 			require("montage/core/core").Montage,
    CanvasController = require("js/controllers/elements/canvas-controller").CanvasController,
    njModule = require("js/lib/NJUtils"),
    World = require("js/lib/drawing/world").World,
    MaterialsModel = require("js/models/materials-model").MaterialsModel;

exports.ShapesController = Montage.create(CanvasController, {

    setProperty: {
        value: function(el, p, value, eventType, source) {
            var val = parseInt(value),
                canvas,
                m,
                color;
            switch(p) {
                case "strokeSize":
                    this.setShapeProperty(el, "strokeSize", value);
                    var strokeInfo = njModule.NJUtils.getValueAndUnits(value);
                    val = this.GetValueInPixels(strokeInfo[0], strokeInfo[1]);

                    // TODO - For now, just handle Line, Rectangle and Oval. Eventually, move this into each class's
                    // setStrokeWidth code like SubPath and BrushStroke do.
                    var geomType = el.elementModel.shapeModel.GLGeomObj.geomType();
                    if( (geomType > 0) && (geomType < 4) )
                    {
                        // Changing stroke size should grow/shrink the shape from the center.
                        var delta = ~~(val - el.elementModel.shapeModel.GLGeomObj.getStrokeWidth()),
                            l = this.application.ninja.elementMediator.getProperty(el, "left", parseInt),
                            t = this.application.ninja.elementMediator.getProperty(el, "top", parseInt),
                            w = this.application.ninja.elementMediator.getProperty(el, "width", parseInt),
                            h = this.application.ninja.elementMediator.getProperty(el, "height", parseInt);

                        if(geomType === 3)
                        {
                            var slope = el.elementModel.shapeModel.slope;
                            // set the dimensions
                            if(slope === "horizontal")
                            {
                                h = Math.max(val, 1);
                                t -= ~~(delta/2);
                            }
                            else if(slope === "vertical")
                            {
                                w = Math.max(val, 1);
                                l -= ~~(delta/2);
                            }
                            else
                            {
                                var oldXAdj = el.elementModel.shapeModel.GLGeomObj.getXAdj();
                                var oldYAdj = el.elementModel.shapeModel.GLGeomObj.getYAdj();
                                var theta = Math.atan(el.elementModel.shapeModel.slope);
                                var xAdj = Math.abs((val/2)*Math.sin(theta));
                                var yAdj = Math.abs((val/2)*Math.cos(theta));
                                var dX = ~~(xAdj*2 - oldXAdj*2);
                                var dY = ~~(yAdj*2 - oldYAdj*2);

                                l -= dX;
                                t -= dY;
                                w += dX*2;
                                h += dY*2;

                                el.elementModel.shapeModel.GLGeomObj.setXAdj(xAdj);
                                el.elementModel.shapeModel.GLGeomObj.setYAdj(yAdj);
                            }
                        }
                        else
                        {
                            l -= ~~(delta/2);
                            t -= ~~(delta/2);
                            w += delta;
                            h += delta;
                        }

                        this.application.ninja.elementMediator.setProperties([{element:el, properties:{left: l + "px", top: t + "px", width: w + "px", height:h + "px"}}], eventType, source);

                    }
                    el.elementModel.shapeModel.GLGeomObj.setStrokeWidth(val);
                    el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                    el.elementModel.shapeModel.GLWorld.render();
                    break;
                case "innerRadius":
                    this.setShapeProperty(el, "innerRadius", value);
                    el.elementModel.shapeModel.GLGeomObj.setInnerRadius(val/100);
                    el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                    el.elementModel.shapeModel.GLWorld.render();
                    break;
                case "tlRadius":
                    this.setShapeProperty(el, "tlRadius", value);
                    el.elementModel.shapeModel.GLGeomObj.setTLRadius(val);
                    el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                    el.elementModel.shapeModel.GLWorld.render();
                    break;
                case "trRadius":
                    this.setShapeProperty(el, "trRadius", value);
                    el.elementModel.shapeModel.GLGeomObj.setTRRadius(val);
                    el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                    el.elementModel.shapeModel.GLWorld.render();
                    break;
                case "blRadius":
                    this.setShapeProperty(el, "blRadius", value);
                    el.elementModel.shapeModel.GLGeomObj.setBLRadius(val);
                    el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                    el.elementModel.shapeModel.GLWorld.render();
                    break;
                case "brRadius":
                    this.setShapeProperty(el, "brRadius", value);
                    el.elementModel.shapeModel.GLGeomObj.setBRRadius(val);
                    el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                    el.elementModel.shapeModel.GLWorld.render();
                    break;
                case "width":
                    el.elementModel.shapeModel.GLGeomObj.setWidth(val);
                    CanvasController.setProperty(el, p, value);
                    el.elementModel.shapeModel.GLWorld.setViewportFromCanvas(el);
                    el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                    el.elementModel.shapeModel.GLWorld.render();
                    break;
                case "height":
                    el.elementModel.shapeModel.GLGeomObj.setHeight(val);
                    CanvasController.setProperty(el, p, value);
                    el.elementModel.shapeModel.GLWorld.setViewportFromCanvas(el);
                    el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                    el.elementModel.shapeModel.GLWorld.render();
                    break;
                case "useWebGl":
                    canvas = njModule.NJUtils.make("canvas", el.className, this.application.ninja.currentDocument);
                    canvas.setAttribute("data-RDGE-id", njModule.NJUtils.generateRandom());
                    canvas.width = el.width;
                    canvas.height = el.height;
                    canvas.elementModel = el.elementModel;
                    this.toggleWebGlMode(canvas, value);
                    this.application.ninja.elementMediator.replaceElement(canvas, el);
                    break;
                case "strokeMaterial":
                    m = Object.create(MaterialsModel.getMaterial(value));
                    if(m)
                    {
                        el.elementModel.shapeModel.GLGeomObj.setStrokeMaterial(m);
                        color = this.getMaterialColor(value);
                        if(color)
                        {
                            el.elementModel.shapeModel.GLGeomObj.setStrokeColor(color);
                        }
                        el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                        el.elementModel.shapeModel.GLWorld.render();
                    }
                    break;
                case "fillMaterial":
                    m = Object.create(MaterialsModel.getMaterial(value));
                    if(m)
                    {
                        el.elementModel.shapeModel.GLGeomObj.setFillMaterial(m);
                        color = this.getMaterialColor(value);
                        if(color)
                        {
                            el.elementModel.shapeModel.GLGeomObj.setFillColor(color);
                        }
                        el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                        el.elementModel.shapeModel.GLWorld.render();
                    }
                    break;
                case "editStrokeMaterial":
                    NJevent("showMaterialPopup",{materialId : this.getProperty(el, "strokeMaterial")});
                    break;
                case "editFillMaterial":
                    NJevent("showMaterialPopup",{materialId : this.getProperty(el, "fillMaterial")});
                    break;
                case "animate":
                    if(value)
                    {
                        el.elementModel.shapeModel.animate = true;
                        el.elementModel.shapeModel.GLWorld._previewAnimation = true;
                        el.elementModel.shapeModel.GLWorld.restartRenderLoop();
                    }
                    else
                    {
                        el.elementModel.shapeModel.animate = false;
                        el.elementModel.shapeModel.GLWorld._previewAnimation = false;
                        el.elementModel.shapeModel.GLWorld._canvas.task.stop();
                    }
                    break;
                case "strokeHardness":
                    this.setShapeProperty(el, "strokeHardness", value);
                    el.elementModel.shapeModel.GLGeomObj.setStrokeHardness(val);
                    el.elementModel.shapeModel.GLWorld.render();
                    break;
                case "strokeSmoothing":
                    this.setShapeProperty(el, "strokeSmoothing", value);
                    el.elementModel.shapeModel.GLGeomObj.setSmoothingAmount(val);
                    el.elementModel.shapeModel.GLWorld.render();
                    break;
                case "doSmoothing":
                    this.setShapeProperty(el, "doSmoothing", value);
                    el.elementModel.shapeModel.GLGeomObj.setDoSmoothing(value);
                    el.elementModel.shapeModel.GLWorld.render();
                    break;
                case "isCalligraphic":
                    this.setShapeProperty(el, "isCalligraphic", value);
                    el.elementModel.shapeModel.GLGeomObj.setStrokeUseCalligraphic(value);
                    el.elementModel.shapeModel.GLWorld.render();
                    break;
                case "strokeAngle":
                    this.setShapeProperty(el, "strokeAngle", value);
                    el.elementModel.shapeModel.GLGeomObj.setStrokeAngle(Math.PI * val/180);
                    el.elementModel.shapeModel.GLWorld.render();
                    break;
                default:
                    CanvasController.setProperty(el, p, value);
            }
            this.application.ninja.documentController.activeDocument.model.needsSave = true;
        }
    },

    getProperty: {
        value: function(el, p) {
            switch(p) {
                case "strokeSize":
                case "innerRadius":
                case "tlRadius":
                case "trRadius":
                case "blRadius":
                case "brRadius":
                case "useWebGl":
                case "animate":
                    return this.getShapeProperty(el, p);
                case "border":
                    return this.getColor(el, false);
                case "background":
                    return this.getColor(el, true);
                case "strokeHardness":
                    if (el.elementModel && el.elementModel.shapeModel){
                        return el.elementModel.shapeModel.GLGeomObj.getStrokeHardness();
                    } else {
                        return null;
                    }
                    break;
                case "doSmoothing":
                    if (el.elementModel && el.elementModel.shapeModel){
                        return el.elementModel.shapeModel.GLGeomObj.getDoSmoothing();
                    } else {
                        return null;
                    }
                    break;
                case "strokeSmoothing":
                    if (el.elementModel && el.elementModel.shapeModel){
                        return el.elementModel.shapeModel.GLGeomObj.getSmoothingAmount();
                    } else {
                        return null;
                    }
                    break;
                case "isCalligraphic":
                    if (el.elementModel && el.elementModel.shapeModel){
                        return el.elementModel.shapeModel.GLGeomObj.getStrokeUseCalligraphic();
                    } else {
                        return null;
                    }
                    break;
                case "strokeAngle":
                    if (el.elementModel && el.elementModel.shapeModel){
                        return 180*el.elementModel.shapeModel.GLGeomObj.getStrokeAngle()/Math.PI;
                    } else {
                        return null;
                    }
                    break;
                

                case "strokeMaterial":
                    var sm = el.elementModel.shapeModel.GLGeomObj.getStrokeMaterial();
                    if(sm)
                    {
                        return sm.getName();
                    }
                    else
                    {
                        return "FlatMaterial";
                    }
                case "fillMaterial":
                    var fm = el.elementModel.shapeModel.GLGeomObj.getFillMaterial();
                    if(fm)
                    {
                        return fm.getName();
                    }
                    else
                    {
                        return "FlatMaterial";
                    }
                default:
                    return CanvasController.getProperty(el, p);
            }
        }
    },

    getShapeProperty: {
        value: function(el, prop) {
            if(el.elementModel && el.elementModel.shapeModel)
            {
                return el.elementModel.shapeModel[prop];
            }
            else
            {
                console.log("No shapeModel, one should have been created already");
                return null;
            }
        }
    },

    setShapeProperty: {
        value: function(el, prop, value) {
            if(el.elementModel && el.elementModel.shapeModel)
            {
                el.elementModel.shapeModel[prop] = value;
            }
            else
            {
                console.log("No shapeModel, one should have been created already");
            }
        }
    },

    GetValueInPixels: {
        value: function(value, units, h)
        {
            switch(units)
            {
                case "px":
                {
                    return value;
                }
                case "pt":
                {
                    return ~~(value*4/3);
                }
                case "%":
                {
                    if(h)
                    {
                        return ~~(value/100*h);
                    }
                    else
                    {
                        console.warn("Can't use % for a line's stroke size, using 10 for the value.");
                        return 10;
                    }
                }
            }
        }
    },

    CapWorldPercentFromValue: {
        value: function(value, units, h)
        {
            return Math.min(this.GetWorldPercentFromValue(value, units, h), 2);
        }
    },

    GetWorldPercentFromValue: {
        value: function(value, units, h)
        {
            switch(units)
            {
                case "pt":
                {
                    value = Math.round(value*4/3);
                    return 4*value/h;
                }
                case "px":
                {
                    return 4*value/h;
                }
                case "%":
                {
                    // Our calculations in GLWorld use 2 = 100%, so our calculations would usually be value/50,
                    // but in order to get values other than 0, 1, and 2, we need to multiply by 10, round that value,
                    // and then divide by 50*10 again.
                    // 100*10 = 1000/500 = 2
                    // 20*10 = 200/500 = 0.4
                    // 50*10 = 500/500 = 1
                    return Math.round(value*10)/500;
                }
                default:
                {
                    console.warn("Unhandled units " + units);
                }
            }
        }
    },

    //--------------------------------------------------------------------------------------------------------
    // Routines to get/set color properties
    getColor: {
        value: function(el, isFill) {
            if(isFill)
            {
                // Properties Panel asks for fill color even for shapes that only have strokes
                // Check that shape object supports fills
                if(el.elementModel.shapeModel.GLGeomObj.canFill)
                {
                    return this.application.ninja.colorController.colorModel.webGlToColor(el.elementModel.shapeModel.GLGeomObj.getFillColor());
                }
                else
                {
                    return null;
                }
            }
            else
            {
                return this.application.ninja.colorController.colorModel.webGlToColor(el.elementModel.shapeModel.GLGeomObj.getStrokeColor());
            }
        }
    },

    _setGradientMaterial: {
        value: function(el, gradientMode, isFill) {
            var m,
                gradientM;
            if(isFill)
            {
                m = el.elementModel.shapeModel.GLGeomObj.getFillMaterial();
            }
            else
            {
                m = el.elementModel.shapeModel.GLGeomObj.getStrokeMaterial();
            }

            if(gradientMode === "radial")
            {
                if( !m || (m.getName() !== "RadialGradientMaterial") )
                {
                    gradientM = Object.create(MaterialsModel.getMaterial("RadialGradientMaterial"));
            }
            }
            else
            {
                if( !m || (m.getName() !== "LinearGradientMaterial") )
                {
                    gradientM = Object.create(MaterialsModel.getMaterial("LinearGradientMaterial"));
                }
            }

            if(gradientM)
            {
            if(isFill)
            {
                    el.elementModel.shapeModel.GLGeomObj.setFillMaterial(gradientM);
                }
                else
                {
                    el.elementModel.shapeModel.GLGeomObj.setStrokeMaterial(gradientM);
                }
                        el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                    }
                }
    },

    _setFlatMaterial: {
        value: function(el, isFill) {
            var m,
                flatM;
            if(isFill)
            {
                m = el.elementModel.shapeModel.GLGeomObj.getFillMaterial();
            }
            else
            {
                m = el.elementModel.shapeModel.GLGeomObj.getStrokeMaterial();
            }

            if(!m || ((m.getName() === "LinearGradientMaterial") || m.getName() === "RadialGradientMaterial") )
                {
                flatM = Object.create(MaterialsModel.getMaterial("FlatMaterial"));
                if(flatM)
                    {
                    if(isFill)
                    {
                        el.elementModel.shapeModel.GLGeomObj.setFillMaterial(flatM);
                    }
                    else
                    {
                        el.elementModel.shapeModel.GLGeomObj.setStrokeMaterial(flatM);
                    }
                        el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                    }
                }
            }
    },

    setColor: {
        value: function(el, color, isFill) {
            var mode = color.mode,
                webGl;
            if(isFill)
            {
                // skip shape types that don't have fill color
                if(el.elementModel.shapeModel.GLGeomObj.canFill)
                {
                    if(mode)
                    {
                        switch (mode) {
                            case 'nocolor':
                                el.elementModel.shapeModel.GLGeomObj.setFillColor(null);
                                break;
                            case 'gradient':
                                if(el.elementModel.shapeModel.useWebGl)
                                {
                                    this._setGradientMaterial(el, color.color.gradientMode, isFill);
                                }
                                el.elementModel.shapeModel.GLGeomObj.setFillColor({gradientMode:color.color.gradientMode, color:color.color.stops});
                                break;
                            default:
                                if(el.elementModel.shapeModel.useWebGl)
                                {
                                    this._setFlatMaterial(el, isFill);
                                }
                                webGl = this.application.ninja.colorController.colorModel.colorToWebGl(color.color);
                                el.elementModel.shapeModel.GLGeomObj.setFillColor(webGl);
                        }
                    }
                }
                else
                {
                    return;
                }
            }
            else
            {
                if(mode)
                {
                    switch (mode) {
                        case 'nocolor':
                            el.elementModel.shapeModel.GLGeomObj.setStrokeColor(null);
                            break;
                        case 'gradient':
                            if(el.elementModel.shapeModel.useWebGl)
                            {
                                this._setGradientMaterial(el, color.color.gradientMode, isFill);
                            }
                            el.elementModel.shapeModel.GLGeomObj.setStrokeColor({gradientMode:color.color.gradientMode, color:color.color.stops});
                            break;
                        default:
                            if(el.elementModel.shapeModel.useWebGl)
                            {
                                this._setFlatMaterial(el, isFill);
                            }
                            webGl = this.application.ninja.colorController.colorModel.colorToWebGl(color.color);
                            el.elementModel.shapeModel.GLGeomObj.setStrokeColor(webGl);
                    }
                }

                // Support for ink-bottle tool
                if(color.strokeInfo)
                {
                    this.setProperty(el, "strokeSize", color.strokeInfo.strokeSize + " " + color.strokeInfo.strokeUnits);
                }
            }
            el.elementModel.shapeModel.GLWorld.render();
            this.application.ninja.documentController.activeDocument.model.needsSave = true;
        }
    },

    getStroke: {
        value: function(el) {
            // TODO - Need to figure out which border side user wants
            var size = this.getShapeProperty(el, "strokeSize");
            var color = this.getShapeProperty(el, "stroke");
            return {stroke:color, strokeSize:size};
        }
    },

    setStroke: {
        value: function(el, stroke) {
            el.elementModel.shapeModel.GLGeomObj.setStrokeColor(stroke.color.webGlColor);
            var strokeWidth = this.GetValueInPixels(stroke.strokeSize, stroke.strokeUnits);
            el.elementModel.shapeModel.GLGeomObj.setStrokeWidth(strokeWidth);
            this.setShapeProperty(el, "stroke", stroke.color.webGlColor);
            this.setShapeProperty(el, "strokeSize", stroke.strokeSize + " " + stroke.strokeUnits);
            el.elementModel.shapeModel.GLGeomObj.buildBuffers();
            el.elementModel.shapeModel.GLWorld.render();
        }
    },

    DisplayMaterials: {
        value: function (cb)
        {

            var optionItem = document.createElement("option");
            optionItem.value = 0;
            optionItem.innerText = "Default";
            cb.appendChild(optionItem);

            var materials = this.application.ninja.appModel.materials;
            var len = materials.length;

            var i;
            for (i = 0; i < len; i++)
            {
                var current = materials[i];
                optionItem = document.createElement("option");
                optionItem.value = i+1;
                optionItem.innerText = current.getName();
                cb.appendChild(optionItem);
            }
        }
    },

    isElementAShape: {
        value: function(el)
        {
            return (el.elementModel && el.elementModel.isShape);
        }
    },

    toggleWebGlMode: {
        value: function(el, useWebGl)
        {
            if(useWebGl)
            {
                this.convertToWebGlWorld(el);
            }
            else
            {
                this.convertTo2DWorld(el);
            }
        }
    },

    convertToWebGlWorld: {
        value: function(el)
        {
            if(el.elementModel.shapeModel.useWebGl)
            {
                return;
            }
            var world,
                worldData = el.elementModel.shapeModel.GLWorld.exportJSON();
            if(worldData)
            {
                worldData = this.flip3DSense (worldData );
                world = new World(el, true);
                el.elementModel.shapeModel.GLWorld = world;
                el.elementModel.shapeModel.useWebGl = true;
                world.importJSON(worldData);
                el.elementModel.shapeModel.GLGeomObj = world.getGeomRoot();
                }

        }
    },

    convertTo2DWorld: {
        value: function(el)
        {
            if(!el.elementModel.shapeModel.useWebGl)
            {
                return;
            }
            var world,
                worldData = el.elementModel.shapeModel.GLWorld.exportJSON();
            if(worldData)
            {
                worldData = this.flip3DSense (worldData );
                world = new World(el, false);
                el.elementModel.shapeModel.GLWorld = world;
                el.elementModel.shapeModel.useWebGl = false;
                world.importJSON(worldData);
                el.elementModel.shapeModel.GLGeomObj = world.getGeomRoot();
                }
            }
    },

    flip3DSense: {
        value: function( importStr )
        {
            var jObj;
            var index = importStr.indexOf( ';' );
            if ((importStr[0] === 'v') && (index < 24))
            {
                // JSON format.  separate the version info from the JSON info
                //var vStr = importStr.substr( 0, index+1 );
                var jStr = importStr.substr( index+1 );
                jObj = JSON.parse( jStr );
                jObj.webGL = !jObj.webGL;

                if(jObj.children)
                {
                    var nKids = jObj.children.length;
                    for (var i=0;  i<nKids;  i++)
                    {
                        var child = jObj.children[i];

                        if(jObj.webGL)
                        {
                            if(child.strokeColor)
                            {
                                if(child.strokeColor.gradientMode)
                                {
                                    // Set Linear/Radial Gradient Material for children geometry if color in canvas 2d has gradient
                                    if(child.strokeColor.gradientMode === "radial")
                                    {
                                        child.strokeMat = "RadialGradientMaterial";
                                    }
                                    else
                                    {
                                        child.strokeMat = "LinearGradientMaterial";
                                    }
                                }
                                else if( (child.strokeMat === "RadialGradientMaterial") ||
                                         (child.strokeMat === "LinearGradientMaterial") )
                                {
                                    // Set Flat Material for children geometry if color has been changed to solid
                                    child.strokeMat = "FlatMaterial";
                                }
                            }

                            if(child.fillColor)
                            {
                                if(child.fillColor.gradientMode)
                                {
                                    // Set Linear/Radial Gradient Material for children geometry if color in canvas 2d has gradient
                                    if(child.fillColor.gradientMode === "radial")
                                    {
                                        child.fillMat = "RadialGradientMaterial";
                                    }
                                    else
                                    {
                                        child.fillMat = "LinearGradientMaterial";
                                    }
                                }
                                else if( (child.fillMat === "RadialGradientMaterial") ||
                                         (child.fillMat === "LinearGradientMaterial") )
                                {
                                    // Set Flat Material for children geometry if color has been changed to solid
                                    child.fillMat = "FlatMaterial";
                                }
                            }
                        }
                    }
                }
            }

            return jObj;
        }
    },

    getMaterialColor: {
        value: function(m)
        {
            var css,
                colorObj;
            if(m === "LinearGradientMaterial")
            {
                css = "-webkit-gradient(linear, left top, right top, from(rgb(255, 0, 0)), color-stop(0.3, rgb(0, 255, 0)), color-stop(0.6, rgb(0, 0, 255)), to(rgb(0, 255, 255)))";
            }
            else if(m === "RadialGradientMaterial")
            {
                css = "-webkit-radial-gradient(50% 50%, ellipse cover, rgb(255, 0, 0) 0%, rgb(0, 255, 0) 30%, rgb(0, 0, 255) 60%, rgb(0, 255, 255) 100%)";
            }

            if(css)
            {
                colorObj = this.application.ninja.colorController.getColorObjFromCss(css);
                if(colorObj)
                {
                    return {gradientMode:colorObj.color.gradientMode, color:colorObj.color.stops};
                }
            }

            return null;
        }
    }

});
