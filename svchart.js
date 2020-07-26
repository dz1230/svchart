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
        this.yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.yAxis.setAttribute("x1", "0");
        this.yAxis.setAttribute("x2", "0");
        this.yAxis.setAttribute("vector-effect", "non-scaling-stroke");
        this.content = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.grid = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.svg.appendChild(this.grid);
        this.svg.appendChild(this.xAxis);
        this.svg.appendChild(this.yAxis);
        this.svg.appendChild(this.content);
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
        this.updateGrid();
    };
    SVGCoordinateSystem.prototype.setYRange = function (y) {
        this.y = y;
        this.svg.setAttribute("viewBox", this.x.min + "," + this.y.min + " " + (this.x.max - this.x.min) + "," + (this.y.max - this.y.min));
        this.yAxis.setAttribute("y1", this.y.min + "");
        this.yAxis.setAttribute("y2", this.y.max + "");
        this.updateGrid();
    };
    SVGCoordinateSystem.prototype.applyStyle = function (style) {
        this.xAxis.setAttribute("stroke", style.xAxisColor);
        this.xAxis.setAttribute("stroke-width", style.xAxisStrokeWidth);
        this.yAxis.setAttribute("stroke", style.yAxisColor);
        this.yAxis.setAttribute("stroke-width", style.yAxisStrokeWidth);
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
        for (var x1 = this.style.gridIntervalX; x1 < this.x.max; x1 += this.style.gridIntervalX) {
            vLine(x1);
        }
        for (var x1 = -this.style.gridIntervalX; x1 > this.x.min; x1 -= this.style.gridIntervalX) {
            vLine(x1);
        }
        for (var y1 = this.style.gridIntervalY; y1 < this.y.max; y1 += this.style.gridIntervalY) {
            hLine(y1);
        }
        for (var y1 = -this.style.gridIntervalY; y1 > this.y.min; y1 -= this.style.gridIntervalY) {
            hLine(y1);
        }
    };
    return SVGCoordinateSystem;
}());
var SVChart = /** @class */ (function () {
    function SVChart(data, style) {
        this.element = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        this.element.setAttribute("vector-effect", "non-scaling-stroke");
        this.element.setAttribute("fill", "none");
        this.setData(data);
        this.applyStyle(style);
    }
    SVChart.prototype.applyStyle = function (style) {
        this.style = style;
        this.element.setAttribute("stroke", this.style.color);
        this.element.setAttribute("stroke-width", this.style.strokeWidth);
    };
    SVChart.prototype.setData = function (data) {
        this.data = data.slice(0);
        this.data.sort(function (a, b) {
            return a.x - b.x;
        });
        this.updatePointsAttribute();
    };
    SVChart.prototype.addDataPoint = function (point) {
        var i = 0;
        for (; i < this.data.length; i++) {
            if (this.data[i].x > point.x) {
                break;
            }
        }
        this.data = this.data.slice(0, i).concat({ x: point.x, y: point.y }).concat(this.data.slice(i));
        this.updatePointsAttribute();
    };
    SVChart.prototype.updatePointsAttribute = function () {
        var pointsAttribute = "";
        for (var i = 0; i < this.data.length; i++) {
            var data = this.data[i];
            if (pointsAttribute != "")
                pointsAttribute += " ";
            pointsAttribute += data.x + "," + data.y;
        }
        this.element.setAttribute("points", pointsAttribute);
    };
    SVChart.prototype.getChartElement = function () {
        return this.element;
    };
    return SVChart;
}());
