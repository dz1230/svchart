"use strict"

let xRange = {min: -10, max: 57}
let yRange = {min: -15, max: 70}

//a coordinate system is needed to display the charts. If you don't want the x or y axis to show up, give them transparent colors.
let coordSystemStyle = {
    xAxisColor: "grey",
    xAxisStrokeWidth: "2px",
    yAxisColor: "grey",
    yAxisStrokeWidth: "2px",
    gridColor: "lightgrey",
    gridStrokeWidth: "1px",
    drawGridX: true,
    writeCoordsX: true,
    gridIntervalX: 4,
    drawGridY: true,
    writeCoordsY: true,
    gridIntervalY: 8,
    classAttribute: "demo",
    xArrowSize: 0.0125,
    yArrowSize: 0.0125,
}
let coordSystem = new SVGCoordinateSystem(xRange, yRange, coordSystemStyle)
document.getElementById("container").appendChild(coordSystem.getWrapper())

//make a graph from random data
let testdata1 = []
for (let x = xRange.min; x < xRange.max; x++) {
    testdata1.push({x: x, y: (Math.random()*(yRange.max-yRange.min))+yRange.min})
}
let testGraph1 = new SVDataChart(testdata1, {color: "orange", strokeWidth: "2px"})
coordSystem.appendChild(testGraph1.getChartElement())

//straight line
let testdata2 = []
testdata2.push({x: xRange.min, y: 5})
testdata2.push({x: xRange.max, y: 5})
let testGraph2 = new SVDataChart(testdata2, {color: "blue", strokeWidth: "2px"})
coordSystem.appendChild(testGraph2.getChartElement())

//diagonal across the whole (visible) coordinate system
let testdata3 = []
testdata3.push({x: xRange.min, y: yRange.min})
testdata3.push({x: xRange.max, y: yRange.max})
let testGraph3 = new SVDataChart(testdata3, {color: "green", strokeWidth: "2px"})
coordSystem.appendChild(testGraph3.getChartElement())

//function chart (y=f(x)=x^2)
let testGraph4 = new SVFunctionChart((x) => {return x*x},xRange,1,{color: "red", strokeWidth: "2px"})
coordSystem.appendChild(testGraph4.getChartElement())

//neccessary to adjust text positions to the new size
window.addEventListener("resize", () => {
    coordSystem.onResize()
})