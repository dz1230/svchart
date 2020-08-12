interface SVGCoordinateSystemConfig {
    xAxisColor: string
    xAxisStrokeWidth: string
    yAxisColor: string
    yAxisStrokeWidth: string
    gridColor: string
    gridStrokeWidth: string
    drawGridX: boolean //enables/disables vertical grid lines
    writeCoordsX: boolean
    gridIntervalX: number //distance between vertical grid lines
    drawGridY: boolean //enables/disables horizontal grid lines
    writeCoordsY: boolean
    gridIntervalY: number //distance between horizontal grid lines
    classAttribute: string
    xArrowSize: number //percentage of full width/height
    xArrowColor: string
    yArrowSize: number //percentage of full width/height
    yArrowColor: string
}

class SVGCoordinateSystem {
    private wrapper: HTMLDivElement
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
        this.wrapper = document.createElement("div")
        this.wrapper.style.position = "relative"
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        this.svg.setAttribute("preserveAspectRatio", "none")
        //needed because normal svg coordinates increase from top to bottom, but for charts they should increase from bottom to top
        this.svg.setAttribute("style", "transform: rotateX(180deg);width:100%;height:100%;")
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
        this.svgText = document.createElementNS("http://www.w3.org/2000/svg", "svg") //separate text element to leave text unscaled and unrotated
        this.svgText.style.position = "absolute"
        this.svgText.style.left = "0"
        this.svgText.style.width = "100%"
        this.svgText.style.height = "100%"
        this.wrapper.appendChild(this.svg)
        this.wrapper.appendChild(this.svgText)
        this.setXRange(this.x, false)
        this.setYRange(this.y, false)
        this.applyStyle(this.style)
        setTimeout(() => {this.onResize()}, 20)
    }

    public onResize() {
        this.updateTexts()
    }

    private makeTextAt(scaledX: number, scaledY: number, text: string, svgSize: DOMRect): SVGTextElement {
        let element = document.createElementNS("http://www.w3.org/2000/svg", "text")
        element.textContent = text
        let relativeX = (scaledX-this.x.min) / (this.x.max-this.x.min)
        let relativeY = 1-((scaledY-this.y.min) / (this.y.max-this.y.min))
        let x = Math.floor(relativeX * svgSize.width)
        let y = Math.floor(relativeY * svgSize.height)
        element.setAttribute("x", x + "")
        element.setAttribute("y", y + "")
        return element
    }

    private updateTexts() {
        while (this.svgText.children.length > 0) {
            this.svgText.children[0].remove()
        }
        let svgSize = this.svg.getBoundingClientRect()
        this.svgText.setAttribute("viewBox", `0,0 ${Math.floor(svgSize.width)},${Math.floor(svgSize.height)}`)
        if (this.style.writeCoordsX) {
            for (let x = this.style.gridIntervalX; x < this.x.max; x += this.style.gridIntervalX) {
                let text = this.makeTextAt(x, this.y.min, Math.round(Math.floor(x*100)/100)+"", svgSize)
                text.style.fontSize = "12px"
                this.svgText.appendChild(text)
            }
            for (let x = 0; x > this.x.min; x -= this.style.gridIntervalX) {
                let text = this.makeTextAt(x, this.y.min, Math.round(Math.floor(x*100)/100)+"", svgSize)
                text.style.fontSize = "12px"
                this.svgText.appendChild(text)
            }
        }
        if (this.style.writeCoordsY) {
            for (let y = this.style.gridIntervalY; y < this.y.max; y += this.style.gridIntervalY) {
                let text = this.makeTextAt(this.x.min, y, Math.round(Math.floor(y*100)/100)+"", svgSize)
                text.style.fontSize = "12px"
                this.svgText.appendChild(text)
            }
            for (let y = 0; y > this.y.min; y -= this.style.gridIntervalY) {
                let text = this.makeTextAt(this.x.min, y, Math.round(Math.floor(y*100)/100)+"", svgSize)
                text.style.fontSize = "12px"
                this.svgText.appendChild(text)
            }
        }
    }

    getWrapper() {
        return this.wrapper;
    }

    public setXRange(x: {min: number, max: number}, updateSVG: boolean) {
        this.x = x
        this.svg.setAttribute("viewBox", `${this.x.min},${this.y.min} ${this.x.max-this.x.min},${this.y.max-this.y.min}`)
        this.xAxis.setAttribute("x1", this.x.min + "")
        this.xAxis.setAttribute("x2", this.x.max + "")
        let arrowSize = (this.style.xArrowSize*(this.y.max-this.y.min))/2
        let arrowSize2 = (this.style.xArrowSize*(this.x.max-this.x.min))/2
        this.xAxisArrow.setAttribute("points", `${this.x.max},0 ${this.x.max-arrowSize2},${arrowSize} ${this.x.max-arrowSize2},${-arrowSize}`)
        if (updateSVG) {
            this.updateGrid()
            this.updateTexts()
        }
    }

    public setYRange(y: {min: number, max: number}, updateSVG: boolean) {
        this.y = y
        this.svg.setAttribute("viewBox", `${this.x.min},${this.y.min} ${this.x.max-this.x.min},${this.y.max-this.y.min}`)
        this.yAxis.setAttribute("y1", this.y.min + "")
        this.yAxis.setAttribute("y2", this.y.max + "")
        let arrowSize = (this.style.yArrowSize*(this.x.max-this.x.min))/2
        let arrowSize2 = (this.style.yArrowSize*(this.y.max-this.y.min))/2
        this.yAxisArrow.setAttribute("points", `0,${this.y.max} ${arrowSize},${this.y.max-arrowSize2} ${-arrowSize},${this.y.max-arrowSize2}`)
        if (updateSVG) {
            this.updateGrid()
            this.updateTexts()
        }
    }

    public applyStyle(style: SVGCoordinateSystemConfig) {
        this.xAxis.setAttribute("stroke", style.xAxisColor)
        this.xAxis.setAttribute("stroke-width", style.xAxisStrokeWidth)
        this.yAxis.setAttribute("stroke", style.yAxisColor)
        this.yAxis.setAttribute("stroke-width", style.yAxisStrokeWidth)
        this.wrapper.setAttribute("class", this.style.classAttribute)
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
        this.updateTexts()
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