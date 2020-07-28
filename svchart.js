var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
//TODO unscaled text (units and numbers on next to y- and x-axis or left/right/top/bottom of svg)
var SVGCoordinateSystem = /** @class */ (function () {
    function SVGCoordinateSystem(x, y, style) {
        this.x = x;
        this.y = y;
        this.style = style;
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("preserveAspectRatio", "none");
        this.svg.setAttribute("style", "transform: rotateX(180deg);"); //needed because normal svg coordinates increase from top to bottom, but for charts they should increase from bottom to top
        this.xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.xAxis.setAttribute("y1", "0");
        this.xAxis.setAttribute("y2", "0");
        this.xAxis.setAttribute("vector-effect", "non-scaling-stroke");
        this.xAxisArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        this.yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.yAxis.setAttribute("x1", "0");
        this.yAxis.setAttribute("x2", "0");
        this.yAxis.setAttribute("vector-effect", "non-scaling-stroke");
        this.yAxisArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        this.content = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.grid = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.svg.appendChild(this.grid);
        this.svg.appendChild(this.xAxis);
        this.svg.appendChild(this.xAxisArrow);
        this.svg.appendChild(this.yAxis);
        this.svg.appendChild(this.yAxisArrow);
        this.svg.appendChild(this.content);
        this.svgText = document.createElementNS("http://www.w3.org/2000/svg", "svg"); //separate text element to leave text unscaled
        this.setXRange(this.x);
        this.setYRange(this.y);
        this.applyStyle(this.style);
    }
    SVGCoordinateSystem.prototype.getSVG = function () {
        return this.svg;
    };
    SVGCoordinateSystem.prototype.setXRange = function (x) {
        this.x = x;
        this.svg.setAttribute("viewBox", this.x.min + "," + this.y.min + " " + (this.x.max - this.x.min) + "," + (this.y.max - this.y.min));
        this.xAxis.setAttribute("x1", this.x.min + "");
        this.xAxis.setAttribute("x2", this.x.max + "");
        var arrowSize = (this.style.xArrowSize * (this.y.max - this.y.min)) / 2;
        var arrowSize2 = (this.style.xArrowSize * (this.x.max - this.x.min)) / 2;
        this.xAxisArrow.setAttribute("points", this.x.max + ",0 " + (this.x.max - arrowSize2) + "," + arrowSize + " " + (this.x.max - arrowSize2) + "," + -arrowSize);
        this.updateGrid();
    };
    SVGCoordinateSystem.prototype.setYRange = function (y) {
        this.y = y;
        this.svg.setAttribute("viewBox", this.x.min + "," + this.y.min + " " + (this.x.max - this.x.min) + "," + (this.y.max - this.y.min));
        this.yAxis.setAttribute("y1", this.y.min + "");
        this.yAxis.setAttribute("y2", this.y.max + "");
        var arrowSize = (this.style.yArrowSize * (this.x.max - this.x.min)) / 2;
        var arrowSize2 = (this.style.yArrowSize * (this.y.max - this.y.min)) / 2;
        this.yAxisArrow.setAttribute("points", "0," + this.y.max + " " + arrowSize + "," + (this.y.max - arrowSize2) + " " + -arrowSize + "," + (this.y.max - arrowSize2));
        this.updateGrid();
    };
    SVGCoordinateSystem.prototype.applyStyle = function (style) {
        this.xAxis.setAttribute("stroke", style.xAxisColor);
        this.xAxis.setAttribute("stroke-width", style.xAxisStrokeWidth);
        this.yAxis.setAttribute("stroke", style.yAxisColor);
        this.yAxis.setAttribute("stroke-width", style.yAxisStrokeWidth);
        this.svg.setAttribute("class", this.style.classAttribute);
        this.svgText.setAttribute("class", this.style.classAttribute);
        this.xAxisArrow.setAttribute("fill", this.style.xArrowColor ? this.style.xArrowColor : this.style.xAxisColor);
        this.yAxisArrow.setAttribute("fill", this.style.yArrowColor ? this.style.yArrowColor : this.style.yAxisColor);
        {
            var arrowSize = (this.style.xArrowSize * (this.y.max - this.y.min)) / 2;
            var arrowSize2 = (this.style.xArrowSize * (this.x.max - this.x.min)) / 2;
            this.xAxisArrow.setAttribute("points", this.x.max + ",0 " + (this.x.max - arrowSize2) + "," + arrowSize + " " + (this.x.max - arrowSize2) + "," + -arrowSize);
        }
        {
            var arrowSize = (this.style.yArrowSize * (this.x.max - this.x.min)) / 2;
            var arrowSize2 = (this.style.yArrowSize * (this.y.max - this.y.min)) / 2;
            this.yAxisArrow.setAttribute("points", "0," + this.y.max + " " + arrowSize + "," + (this.y.max - arrowSize2) + " " + -arrowSize + "," + (this.y.max - arrowSize2));
        }
        this.updateGrid();
    };
    SVGCoordinateSystem.prototype.appendChild = function (child) {
        this.content.appendChild(child);
    };
    SVGCoordinateSystem.prototype.removeChild = function (child) {
        this.content.removeChild(child);
    };
    SVGCoordinateSystem.prototype.updateGrid = function () {
        var _this = this;
        while (this.grid.children.length > 0) {
            this.grid.children[0].remove();
        }
        var vLine = function (x1) {
            var l = document.createElementNS("http://www.w3.org/2000/svg", "line");
            l.setAttribute("x1", x1 + "");
            l.setAttribute("x2", x1 + "");
            l.setAttribute("y1", _this.y.min + "");
            l.setAttribute("y2", _this.y.max + "");
            l.setAttribute("stroke", _this.style.gridColor);
            l.setAttribute("stroke-width", _this.style.gridStrokeWidth);
            l.setAttribute("vector-effect", "non-scaling-stroke");
            _this.grid.appendChild(l);
        };
        var hLine = function (y1) {
            var l = document.createElementNS("http://www.w3.org/2000/svg", "line");
            l.setAttribute("x1", _this.x.min + "");
            l.setAttribute("x2", _this.x.max + "");
            l.setAttribute("y1", y1 + "");
            l.setAttribute("y2", y1 + "");
            l.setAttribute("stroke", _this.style.gridColor);
            l.setAttribute("stroke-width", _this.style.gridStrokeWidth);
            l.setAttribute("vector-effect", "non-scaling-stroke");
            _this.grid.appendChild(l);
        };
        if (this.style.drawGridX) {
            for (var x1 = this.style.gridIntervalX; x1 < this.x.max; x1 += this.style.gridIntervalX) {
                vLine(x1);
            }
            for (var x1 = -this.style.gridIntervalX; x1 > this.x.min; x1 -= this.style.gridIntervalX) {
                vLine(x1);
            }
        }
        if (this.style.drawGridY) {
            for (var y1 = this.style.gridIntervalY; y1 < this.y.max; y1 += this.style.gridIntervalY) {
                hLine(y1);
            }
            for (var y1 = -this.style.gridIntervalY; y1 > this.y.min; y1 -= this.style.gridIntervalY) {
                hLine(y1);
            }
        }
    };
    return SVGCoordinateSystem;
}());
var SVChart = /** @class */ (function () {
    function SVChart(style) {
        this.element = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        this.element.setAttribute("vector-effect", "non-scaling-stroke");
        this.element.setAttribute("fill", "none");
        this.applyStyle(style);
    }
    SVChart.prototype.applyStyle = function (style) {
        this.style = style;
        this.element.setAttribute("stroke", this.style.color);
        this.element.setAttribute("stroke-width", this.style.strokeWidth);
    };
    SVChart.prototype.getChartElement = function () {
        return this.element;
    };
    return SVChart;
}());
var SVDataChart = /** @class */ (function (_super) {
    __extends(SVDataChart, _super);
    function SVDataChart(data, style) {
        var _this = _super.call(this, style) || this;
        _this.setData(data);
        return _this;
    }
    SVDataChart.prototype.setData = function (data) {
        this.data = data.slice(0);
        this.data.sort(function (a, b) {
            return a.x - b.x;
        });
        this.updatePointsAttribute();
    };
    SVDataChart.prototype.addDataPoint = function (point) {
        var i = 0;
        for (; i < this.data.length; i++) {
            if (this.data[i].x > point.x) {
                break;
            }
        }
        this.data = this.data.slice(0, i).concat({ x: point.x, y: point.y }).concat(this.data.slice(i));
        this.updatePointsAttribute();
    };
    SVDataChart.prototype.getData = function () {
        return this.data;
    };
    SVDataChart.prototype.updatePointsAttribute = function () {
        var pointsAttribute = "";
        for (var i = 0; i < this.data.length; i++) {
            var data = this.data[i];
            if (pointsAttribute != "")
                pointsAttribute += " ";
            pointsAttribute += data.x + "," + data.y;
        }
        this.getChartElement().setAttribute("points", pointsAttribute);
    };
    return SVDataChart;
}(SVChart));
var SVFunctionChart = /** @class */ (function (_super) {
    __extends(SVFunctionChart, _super);
    function SVFunctionChart(f, range, detail, style) {
        var _this = _super.call(this, style) || this;
        _this.f = f;
        _this.range = range;
        _this.detail = detail;
        _this.applyStyle(style);
        _this.updatePointsAttribute();
        return _this;
    }
    SVFunctionChart.prototype.setFunction = function (value) {
        this.f = value;
        this.updatePointsAttribute();
    };
    SVFunctionChart.prototype.setRange = function (value) {
        this.range = value;
        this.updatePointsAttribute();
    };
    SVFunctionChart.prototype.setDetail = function (value) {
        this.detail = value;
        this.updatePointsAttribute();
    };
    SVFunctionChart.prototype.getFunction = function () {
        return this.f;
    };
    SVFunctionChart.prototype.getRange = function () {
        return this.range;
    };
    SVFunctionChart.prototype.getDetail = function () {
        return this.detail;
    };
    SVFunctionChart.prototype.updatePointsAttribute = function () {
        var pointsAttribute = "";
        for (var x = this.range.min; x <= this.range.max; x += this.detail) {
            var value = this.f(x);
            if (pointsAttribute !== "")
                pointsAttribute += " ";
            pointsAttribute += x + "," + value;
        }
        this.getChartElement().setAttribute("points", pointsAttribute);
    };
    return SVFunctionChart;
}(SVChart));
