"use strict"

let testdata1 = []
let testdata2 = []
let testdata3 = []

for (let x = -10; x < 57; x++) {
    testdata1.push({x: x, y: (Math.random()*85)-15})
}

let xRange = {min: -10, max: 57}
let yRange = {min: -15, max: 70}

testdata2.push({x: xRange.min, y: 5})
testdata2.push({x: xRange.max, y: 5})
testdata3.push({x: xRange.min, y: xRange.min})
testdata3.push({x: xRange.max, y: xRange.max})

let coordSystemStyle = {
    xAxisColor: "grey",
    xAxisStrokeWidth: "2px",
    yAxisColor: "grey",
    yAxisStrokeWidth: "2px",
    gridColor: "lightgrey",
    gridStrokeWidth: "1px",
    drawGridX: true,
    gridIntervalX: 4,
    drawGridY: true,
    gridIntervalY: 8,
    classAttribute: "demo",
    xArrowSize: 0.0125,
    yArrowSize: 0.0125,
}

let coordSystem = new SVGCoordinateSystem(xRange, yRange, coordSystemStyle)
document.getElementById("container").appendChild(coordSystem.getSVG())

let testGraph1 = new SVDataChart(testdata1, {color: "orange", strokeWidth: "2px"})
coordSystem.appendChild(testGraph1.getChartElement())

let testGraph2 = new SVDataChart(testdata2, {color: "blue", strokeWidth: "2px"})
coordSystem.appendChild(testGraph2.getChartElement())

let testGraph3 = new SVDataChart(testdata3, {color: "green", strokeWidth: "2px"})
coordSystem.appendChild(testGraph3.getChartElement())

let testGraph4 = new SVFunctionChart((x) => {return x*x},xRange,1,{color: "red", strokeWidth: "2px"})
coordSystem.appendChild(testGraph4.getChartElement())