interface SVGCoordinateSystemConfig {
    xAxisColor: string
    xAxisStrokeWidth: string
    yAxisColor: string
    yAxisStrokeWidth: string
    gridColor: string
    gridStrokeWidth: string
    drawGridX: boolean //enables/disables vertical grid lines
    gridIntervalX: number //distance between vertical grid lines
    drawGridY: boolean //enables/disables horizontal grid lines
    gridIntervalY: number //distance between horizontal grid lines
    classAttribute: string
    xArrowSize: number //percentage of full width/height
    xArrowColor: string
    yArrowSize: number //percentage of full width/height
    yArrowColor: string
}

//TODO unscaled text (units and numbers on next to y- and x-axis or left/right/top/bottom of svg)

class SVGCoordinateSystem {
    private svg: SVGSVGElement
    private svgText: SVGSVGElement
    private x: {min: number, max: number}
    private y: {min: number, max: number}
    private grid: SVGGElement
    private xAxis: SVGLineElement
    private xAxisArrow: SVGPolygonElement
    private yAxis: SVGLineElement
    private yAxisArrow: SVGPolygonElement
    private style: SVGCoordinateSystemConfig
    private content: SVGGElement

    constructor(x: {min: number, max: number}, y: {min: number, max: number}, style: SVGCoordinateSystemConfig) {
        this.x = x
        this.y = y
        this.style = style
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        this.svg.setAttribute("preserveAspectRatio", "none")
        this.svg.setAttribute("style", "transform: rotateX(180deg);") //needed because normal svg coordinates increase from top to bottom, but for charts they should increase from bottom to top
        this.xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line")
        this.xAxis.setAttribute("y1", "0")
        this.xAxis.setAttribute("y2", "0")
        this.xAxis.setAttribute("vector-effect", "non-scaling-stroke")
        this.xAxisArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
        this.yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line")
        this.yAxis.setAttribute("x1", "0")
        this.yAxis.setAttribute("x2", "0")
        this.yAxis.setAttribute("vector-effect", "non-scaling-stroke")
        this.yAxisArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
        this.content = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.grid = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.svg.appendChild(this.grid)
        this.svg.appendChild(this.xAxis)
        this.svg.appendChild(this.xAxisArrow)
        this.svg.appendChild(this.yAxis)
        this.svg.appendChild(this.yAxisArrow)
        this.svg.appendChild(this.content)
        this.svgText = document.createElementNS("http://www.w3.org/2000/svg", "svg") //separate text element to leave text unscaled
        this.setXRange(this.x)
        this.setYRange(this.y)
        this.applyStyle(this.style)
    }

    getSVG() {
        return this.svg
    }

    public setXRange(x: {min: number, max: number}) {
        this.x = x
        this.svg.setAttribute("viewBox", `${this.x.min},${this.y.min} ${this.x.max-this.x.min},${this.y.max-this.y.min}`)
        this.xAxis.setAttribute("x1", this.x.min + "")
        this.xAxis.setAttribute("x2", this.x.max + "")
        let arrowSize = (this.style.xArrowSize*(this.y.max-this.y.min))/2
        let arrowSize2 = (this.style.xArrowSize*(this.x.max-this.x.min))/2
        this.xAxisArrow.setAttribute("points", `${this.x.max},0 ${this.x.max-arrowSize2},${arrowSize} ${this.x.max-arrowSize2},${-arrowSize}`)
        this.updateGrid()
    }

    public setYRange(y: {min: number, max: number}) {
        this.y = y
        this.svg.setAttribute("viewBox", `${this.x.min},${this.y.min} ${this.x.max-this.x.min},${this.y.max-this.y.min}`)
        this.yAxis.setAttribute("y1", this.y.min + "")
        this.yAxis.setAttribute("y2", this.y.max + "")
        let arrowSize = (this.style.yArrowSize*(this.x.max-this.x.min))/2
        let arrowSize2 = (this.style.yArrowSize*(this.y.max-this.y.min))/2
        this.yAxisArrow.setAttribute("points", `0,${this.y.max} ${arrowSize},${this.y.max-arrowSize2} ${-arrowSize},${this.y.max-arrowSize2}`)
        this.updateGrid()
    }

    public applyStyle(style: SVGCoordinateSystemConfig) {
        this.xAxis.setAttribute("stroke", style.xAxisColor)
        this.xAxis.setAttribute("stroke-width", style.xAxisStrokeWidth)
        this.yAxis.setAttribute("stroke", style.yAxisColor)
        this.yAxis.setAttribute("stroke-width", style.yAxisStrokeWidth)
        this.svg.setAttribute("class", this.style.classAttribute)
        this.svgText.setAttribute("class", this.style.classAttribute)
        this.xAxisArrow.setAttribute("fill", this.style.xArrowColor ? this.style.xArrowColor : this.style.xAxisColor)
        this.yAxisArrow.setAttribute("fill", this.style.yArrowColor ? this.style.yArrowColor : this.style.yAxisColor)
        {
            let arrowSize = (this.style.xArrowSize*(this.y.max-this.y.min))/2
            let arrowSize2 = (this.style.xArrowSize*(this.x.max-this.x.min))/2
            this.xAxisArrow.setAttribute("points", `${this.x.max},0 ${this.x.max-arrowSize2},${arrowSize} ${this.x.max-arrowSize2},${-arrowSize}`)
        }
        {
            let arrowSize = (this.style.yArrowSize*(this.x.max-this.x.min))/2
            let arrowSize2 = (this.style.yArrowSize*(this.y.max-this.y.min))/2
            this.yAxisArrow.setAttribute("points", `0,${this.y.max} ${arrowSize},${this.y.max-arrowSize2} ${-arrowSize},${this.y.max-arrowSize2}`)
        }
        this.updateGrid()
    }

    public appendChild(child: SVGElement) {
        this.content.appendChild(child)
    }

    public removeChild(child: SVGElement) {
        this.content.removeChild(child)
    }

    private updateGrid() {
        while (this.grid.children.length > 0) {
            this.grid.children[0].remove()
        }
        let vLine = (x1: number) => {
            let l = document.createElementNS("http://www.w3.org/2000/svg", "line")
            l.setAttribute("x1", x1 + "")
            l.setAttribute("x2", x1 + "")
            l.setAttribute("y1", this.y.min + "")
            l.setAttribute("y2", this.y.max + "")
            l.setAttribute("stroke", this.style.gridColor)
            l.setAttribute("stroke-width", this.style.gridStrokeWidth)
            l.setAttribute("vector-effect", "non-scaling-stroke")
            this.grid.appendChild(l)
            
        }
        let hLine = (y1: number) => {
            let l = document.createElementNS("http://www.w3.org/2000/svg", "line")
            l.setAttribute("x1", this.x.min + "")
            l.setAttribute("x2", this.x.max + "")
            l.setAttribute("y1", y1 + "")
            l.setAttribute("y2", y1 + "")
            l.setAttribute("stroke", this.style.gridColor)
            l.setAttribute("stroke-width", this.style.gridStrokeWidth)
            l.setAttribute("vector-effect", "non-scaling-stroke")
            this.grid.appendChild(l)
        }
        if (this.style.drawGridX) {
            for (let x1 = this.style.gridIntervalX; x1 < this.x.max; x1 += this.style.gridIntervalX) {
                vLine(x1)
            }
            for (let x1 = -this.style.gridIntervalX; x1 > this.x.min; x1 -= this.style.gridIntervalX) {
                vLine(x1)
            }
        }
        if (this.style.drawGridY) {
            for (let y1 = this.style.gridIntervalY; y1 < this.y.max; y1 += this.style.gridIntervalY) {
                hLine(y1)
            }
            for (let y1 = -this.style.gridIntervalY; y1 > this.y.min; y1 -= this.style.gridIntervalY) {
                hLine(y1)
            }
        }
    }
}

interface SVChartStyle {
    color: string
    strokeWidth: string
}

class SVChart {
    private style: SVChartStyle
    private element: SVGPolylineElement

    constructor(style: SVChartStyle) {
        this.element = document.createElementNS("http://www.w3.org/2000/svg", "polyline")
        this.element.setAttribute("vector-effect", "non-scaling-stroke")
        this.element.setAttribute("fill", "none")
        this.applyStyle(style)
    }

    public applyStyle(style: SVChartStyle) {
        this.style = style
        this.element.setAttribute("stroke", this.style.color)
        this.element.setAttribute("stroke-width", this.style.strokeWidth)
    }

    public getChartElement() {
        return this.element
    }
}

class SVDataChart extends SVChart {
    private data: {x: number, y: number}[]

    constructor(data: {x: number, y: number}[], style: SVChartStyle) {
        super(style)
        this.setData(data)
    }

    public setData(data: {x: number, y: number}[]) {
        this.data = data.slice(0)
        this.data.sort((a, b) => {
            return a.x - b.x
        })
        this.updatePointsAttribute()
    }

    public addDataPoint(point: {x: number, y: number}) {
        let i = 0
        for (; i < this.data.length; i++) {
            if (this.data[i].x > point.x) {
                break
            }
        }
        this.data = this.data.slice(0, i).concat({x: point.x, y: point.y}).concat(this.data.slice(i))
        this.updatePointsAttribute()
    }

    public getData() {
        return this.data
    }

    private updatePointsAttribute() {
        let pointsAttribute = ""
        for (let i = 0; i < this.data.length; i++) {
            const data = this.data[i];
            if (pointsAttribute != "") pointsAttribute += " "
            pointsAttribute += `${data.x},${data.y}`
        }
        this.getChartElement().setAttribute("points", pointsAttribute)
    }
}

class SVFunctionChart extends SVChart {
    private f: (x: number) => number
    private detail: number
    private range: {min: number, max: number}
    
    constructor(f: (x: number) => number, range: {min: number, max: number}, detail: number, style: SVChartStyle) {
        super(style)
        this.f = f
        this.range = range
        this.detail = detail
        this.applyStyle(style)
        this.updatePointsAttribute()
    }

    public setFunction(value: (x: number) => number) {
        this.f = value
        this.updatePointsAttribute()
    }

    public setRange(value: {min: number, max: number}) {
        this.range = value
        this.updatePointsAttribute()
    }

    public setDetail(value: number) {
        this.detail = value
        this.updatePointsAttribute()
    }

    public getFunction(): (x: number) => number {
        return this.f
    }

    public getRange(): {min: number, max: number} {
        return this.range
    }

    public getDetail(): number {
        return this.detail
    }

    private updatePointsAttribute() {
        let pointsAttribute = ""
        for (let x = this.range.min; x <= this.range.max; x += this.detail) {
            let value = this.f(x)
            if (pointsAttribute !== "") pointsAttribute += " "
            pointsAttribute += `${x},${value}`
        }
        this.getChartElement().setAttribute("points", pointsAttribute)
    }
}