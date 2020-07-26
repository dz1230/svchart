"use strict"

let testdata = [
    {x: -5003, y: 4},
    {x: 130, y: 570},
    {x: 57, y: -12},
    {x: 3, y: 4},
    {x: -1, y: 5},
    {x: 2, y: 7},
    {x: 4, y: -7},
    {x: 8, y: -500},
    {x: 9, y: 67},
    {x: -2010, y: -570},
]

let xRange = {min: -10, max: 57}
let yRange = {min: -15, max: 70}
let coordSystemStyle = {
    xAxisColor: "grey",
    xAxisStrokWidth: "1px",
    yAxisColor: "grey",
    yAxisStrokeWidth: "1px",
    gridColor: "lightgrey",
    gridStrokeWidth: "1px",
    drawGridX: true,
    gridIntervalX: 1,
    drawGridY: true,
    gridIntervalY: 1,
}

let coordSystem = new SVGCoordinateSystem(xRange, yRange, coordSystemStyle)
document.getElementById("container").appendChild(coordSystem.getSVG())

let testGraph = new SVChart(testdata, {color: "black", strokeWidth: "2px"})
coordSystem.appendChild(testGraph.getChartElement())