interface SVGCoordinateSystemStyle {
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
}

class SVGCoordinateSystem {
    private svg: SVGSVGElement
    private x: {min: number, max: number}
    private y: {min: number, max: number}
    private grid: SVGGElement
    private xAxis: SVGLineElement
    private yAxis: SVGLineElement
    private style: SVGCoordinateSystemStyle
    private content: SVGGElement

    constructor(x: {min: number, max: number}, y: {min: number, max: number}, style: SVGCoordinateSystemStyle) {
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
        this.yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line")
        this.yAxis.setAttribute("x1", "0")
        this.yAxis.setAttribute("x2", "0")
        this.yAxis.setAttribute("vector-effect", "non-scaling-stroke")
        this.content = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.grid = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.svg.appendChild(this.grid)
        this.svg.appendChild(this.xAxis)
        this.svg.appendChild(this.yAxis)
        this.svg.appendChild(this.content)
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
        this.updateGrid()
    }

    public setYRange(y: {min: number, max: number}) {
        this.y = y
        this.svg.setAttribute("viewBox", `${this.x.min},${this.y.min} ${this.x.max-this.x.min},${this.y.max-this.y.min}`)
        this.yAxis.setAttribute("y1", this.y.min + "")
        this.yAxis.setAttribute("y2", this.y.max + "")
        this.updateGrid()
    }

    public applyStyle(style: SVGCoordinateSystemStyle) {
        this.xAxis.setAttribute("stroke", style.xAxisColor)
        this.xAxis.setAttribute("stroke-width", style.xAxisStrokeWidth)
        this.yAxis.setAttribute("stroke", style.yAxisColor)
        this.yAxis.setAttribute("stroke-width", style.yAxisStrokeWidth)
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
    private data: {x: number, y: number}[]
    private style: SVChartStyle
    private element: SVGPolylineElement

    constructor(data: {x: number, y: number}[], style: SVChartStyle) {
        this.element = document.createElementNS("http://www.w3.org/2000/svg", "polyline")
        this.element.setAttribute("vector-effect", "non-scaling-stroke")
        this.element.setAttribute("fill", "none")
        this.setData(data)
        this.applyStyle(style)
    }

    public applyStyle(style: SVChartStyle) {
        this.style = style
        this.element.setAttribute("stroke", this.style.color)
        this.element.setAttribute("stroke-width", this.style.strokeWidth)
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

    private updatePointsAttribute() {
        let pointsAttribute = ""
        for (let i = 0; i < this.data.length; i++) {
            const data = this.data[i];
            if (pointsAttribute != "") pointsAttribute += " "
            pointsAttribute += `${data.x},${data.y}`
        }
        this.element.setAttribute("points", pointsAttribute)
    }

    public getChartElement() {
        return this.element
    }
}