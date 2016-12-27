/* LA Infographic */

var color = d3.scaleOrdinal()
    .range([
        "#ffc100",
        "#ff0000",
        "#393939",
        "#FFCD33",
        "#FF3333",
        "#616161",
        "#FFDA66",
        "#FF6666",
        "#888888",
        "#FFE699",
        "#FF9999",
        "#B0B0B0",
        "#FFF3CC",
        "#FFCCCC",
        "#D7D7D7",
        "#fff"
      ])
    .domain([
        "Face to face",
        "Insurance",
        "Merchant fees",
        "Consulting accounting",
        "Donations",
        "Grants",
        "Travel",
        "Storage rental",
        "Gift",
        "Conference bid team review",
        "Server",
        "Printing and stationery",
        "Bank fees",
        "Foreign currency losses",
        "Subscriptions",
        "Other"
    ]);


var ExpensesArcSequence = 0;

var widthModifier = 0.87;
var heightModifier = 0.87;

var width = innerWidth * widthModifier,
    height = innerHeight * heightModifier,
    radius = Math.min(width, height) / 2;

var annularXOffset  = 100; // how much to shift the annulars horizontally from centre
var annularYOffset  = 0; // how much to shift the annulars vertically from centre
var annularWidth    = 140; // width of each annular
var annularSpacing  = 15;
var annularMargin   = 200; // margin between annulars and canvas
var padAngle        = 0.03; // amount that each segment of an annular is padded
var cornerRadius    = 5; // amount that the sectors are rounded

var titleOffSet     = 22; // amount in pixels that the title arc inner and outer radii are offset from the dataset arc that they are labelling
var titleRotationOffSet = -25; // amount in percent that the title is rotated from the 180 degree mark
var endAngle        = 0; // end angle for title arcs

/* Variables used with the d3.tip tooltips */

var tipXOffSet = 0; // x offset for tooltip display in pixels
var tipYOffSet = 0; // y offset for tooltip display in pixels

/* Variables used with the labels */

var labelcxOffset = 200;
var labelxOffset  = -20;
var labelcyOffset = 200;
var labelyOffset  = -20;

/*
  Main Annular
*/

var ExpensesArc = d3.arc()
    .outerRadius(radius - (annularMargin + ((ExpensesArcSequence - 1) *   annularWidth + ((ExpensesArcSequence - 1) * annularSpacing))))
    .innerRadius(radius - (annularMargin + (ExpensesArcSequence * annularWidth + ((ExpensesArcSequence - 1) * annularSpacing))))
    .padAngle(padAngle)
    .cornerRadius(cornerRadius);

var ExpensesTitleArc = d3.arc()
    .outerRadius(radius + titleOffSet - (annularMargin + ((ExpensesArcSequence - 1) *   annularWidth + ((ExpensesArcSequence - 1) * annularSpacing))))
    .innerRadius(radius - titleOffSet - (annularMargin + (ExpensesArcSequence * annularWidth + ((ExpensesArcSequence - 1) * annularSpacing))))
    .startAngle(Math.PI-(Math.PI/100*titleRotationOffSet))
    .endAngle(endAngle);

/*
  Pie shapes for each data set
*/

var ExpensesPie = d3.pie()
    .sort(null)
    .value(function(d) { return d.Value; });

/*
  SVG object - each annular is added as a layer / group
*/

var BaseSvg = d3.select("#visualisation").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr('id', 'BaseSvg')
    .attr("transform", "translate(" + (width / 2 - annularXOffset) + "," + (height / 2 - annularYOffset) + ")");

/*
  Layers for each annular
*/
var ExpensesLayer   = BaseSvg.append('g');
var TitleLayer      = BaseSvg.append('g');
var LabelLayer      = BaseSvg.append('g');

/*
  load the data from a CSV file
*/

d3.csv("expenses.csv", ExpensesType, function(error, ExpensesData) {
  if (error) throw error;

  var ExpensesItemCount = d3.nest()
    .rollup(function (v) { return d3.sum(v, function(d) { return d.Value})})
    .entries(ExpensesData);

  var ExpensesArcSet = ExpensesLayer.selectAll('.arc')
      .data(ExpensesPie(ExpensesData))
      .enter().append("g")
      .attr ('class', "ExpensesArc")

  var ExpensesTip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([tipXOffSet, tipYOffSet])
      .html(function(d) {
        return d.data.Account +  " - "  + (d3.format(",.1%")(d.data.Value / ExpensesItemCount)) +  " - $" +  (d3.format(",d")(d.data.Value)) ;})

  ExpensesLayer.call(ExpensesTip);

  ExpensesArcSet.append("path")
      .attr('d', ExpensesArc)
      .attr('class', 'ExpensesArcPath')
      .style("fill", function(d) { return color(d.data.Account); })
      .on('mouseover', ExpensesTip.show)
      .on('mouseout', ExpensesTip.hide);


    /*
      Text labels and lines to each label
    */

    var ExpensesLabels = LabelLayer.selectAll('text')
    var ExpensesMarkers = ExpensesLayer.selectAll('defs')

    var ExpensesPaths = ExpensesLayer.selectAll('.ExpensesArc')

    ExpensesLabels.data(ExpensesPie(ExpensesData))
    .enter().append("text")
    .attr("text-anchor", "middle")
    .attr("x", function(d) {
        var a = d.startAngle + (d.endAngle - d.startAngle)/2 - Math.PI/2;
        d.cx = Math.cos(a) * (radius - labelcxOffset);
        return d.x = Math.cos(a) * (radius - labelxOffset);
    })
    .attr("y", function(d) {
        var a = d.startAngle + (d.endAngle - d.startAngle)/2 - Math.PI/2;
        d.cy = Math.sin(a) * (radius - labelcyOffset);
        return d.y = Math.sin(a) * (radius - labelyOffset);
    })
    .text(function(d) { return d.data.Account + ' - ' + d3.format("$d")(d.data.Value); })
    .attr('class', "ExpensesLabels")
    .each(function(d) {
        var bbox = this.getBBox();
        d.sx = d.x - bbox.width/2 - 2;
        d.ox = d.x + bbox.width/2 + 2;
        d.sy = d.oy = d.y + 5;
    });



    var ExpensesLines = LabelLayer.select(".lines").selectAll("polyline")
		.data(ExpensesPie(ExpensesData))

    var ExpensesLines = LabelLayer.selectAll('polyline')


    /* The markers are defined, but are used by the paths;
     * the markers will only display if the paths are displayed
     */

    ExpensesMarkers.enter()
    .append('defs').append('marker')
    .attr('class', 'marker')
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("refX", 3)
    .attr("refY", 3)
    .append("circle")
    .attr("cx", 3)
    .attr("cy", 3)
    .attr("r", 3);

	ExpensesLines.data(ExpensesPie(ExpensesData))
    .enter()
		.append("polyline")
    .style("stroke", "black")
    .style('fill', 'none')
    .style('stroke-width', '1')
    .attr('marker-end', 'url(#marker)')


    .attr('points', function (d){
      var a = d.startAngle + (d.endAngle - d.startAngle)/2 - Math.PI/2;
      console.log('a is - ' + a);

      d.cx = Math.cos(a) * (radius - labelcxOffset);
      console.log('d.cx is - ' + d.cx);

      d.x = Math.cos(a) * (radius - labelxOffset);
      console.log('d.x is - ' + d.x);

      d.cy = Math.sin(a) * (radius - labelcyOffset);
      console.log('d.cy is - ' + d.cy);

      d.y = Math.sin(a) * (radius - labelyOffset);
      console.log('d.y is - ' + d.y);

      return ExpensesArc.centroid(d) + ' ' + d.x + ' ' + d.y;
    })

    .attr('d', function(d) {
        console.log('ExpensesArc.centroid(d) ' + ExpensesArc.centroid(d));
        console.log();
    })

});







/*
  Add the titles to each annular
*/

var ExpensesTitleText     = 'Linux Australia Non-Event Expenditure 1 October 2015 - 30 September 2016';

TitleLayer.append("path")
      .attr('d', ExpensesTitleArc)
      .attr('id', "ExpensesTitle")
      .attr('class', "TitlePath");

TitleLayer.append("text")
      .attr('id', "ExpensesTitleText")
      .append("textPath")
      .attr("xlink:href", "#ExpensesTitle") //place the ID of the path here
      .attr('class', "ExpensesTitle")
      .text(ExpensesTitleText);


/*
  Glorious functions of deliciousness
*/

function ExpensesType(d) {
  d.Value = +d.Value;
  return d;
}

function midAngle(d){
    return d.startAngle + (d.endAngle - d.startAngle)/2;
}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });

}
