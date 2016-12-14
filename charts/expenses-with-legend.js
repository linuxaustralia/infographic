

var color = d3.scaleOrdinal()
    .range([
        "#ffc100",
        "#ff0000",
        "#666666",
        "#00288e",
        "#CD0074",
        "#d0f623",
        "#7109AB",
        "#FF7400",
        "#393939",
        "#00CC00",
        "#ab005d",
        "#ffca24",
        "#6225ad",
        "#ff4000",
        "#ffe501",
        "#0A67A3",
        "#ffa100",
        "#E1014C",
        "#000000"
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
        "Telephone and internet",
        "Food and drink",
        "Ghosts",
        "Transport"
    ]);


var CollectionArcSequence = 0;
var LoansArcSequence      = 1;
var MembersArcSequence    = 2;
var EventsArcSequence     = 3;
var VisitsArcSequence     = 4;
var WirelessArcSequence   = 5;
var InternetArcSequence   = 6;

var widthModifier = 0.87;
var heightModifier = 0.87;

var width = innerWidth * widthModifier,
    height = innerHeight * heightModifier,
    radius = Math.min(width, height) / 2;

console.log(radius);

var annularXOffset  = 100; // how much to shift the annulars horizontally from centre
var annularYOffset  = 0; // how much to shift the annulars vertically from centre
var annularWidth    = 150; // width of each annular
var annularSpacing  = 15;
var annularMargin   = 200; // margin between annulars and canvas
var padAngle        = 0.035; // amount that each segment of an annular is padded
var cornerRadius    = 1; // amount that the sectors are rounded

var titleOffSet     = 30; // amount in pixels that the title arc inner and outer radii are offset from the dataset arc that they are labelling
var titleRotationOffSet = -14; // amount in percent that the title is rotated from the 180 degree mark
var endAngle        = 0; // end angle for title arcs

/* Variables used in displaying the legend */
var legendWidth       = 40; // size of each rectangle for the legend
var legendHeight      = 35; // size of each rectangle for the legend
var legendXSpacing    = 7; // x offset for series values
var legendYSpacing    = 10;  // y offset for series values
var legendPlacementX  = (width / 2) - (radius) // x co-ordinate for legend placement
var legendPlacementY  = ((height/2*-1) + (annularMargin/3)); // y co-ordinate for legend placement
var legendStrokeColor = '#000';

/* Variables used for the labels inside the annular */
var labelOffset = radius/100*60; // number of pixels inside each segment that the label is placed

/* Variables used with the d3.tip tooltips */

var tipXOffSet = 0; // x offset for tooltip display in pixels
var tipYOffSet = 0; // y offset for tooltip display in pixels

/*
  Main Annular
*/

var ExpensesArc = d3.arc()
    .outerRadius(radius - (annularMargin + ((CollectionArcSequence - 1) *   annularWidth + ((CollectionArcSequence - 1) * annularSpacing))))
    .innerRadius(radius - (annularMargin + (CollectionArcSequence * annularWidth + ((CollectionArcSequence - 1) * annularSpacing))))
    .padAngle(padAngle)
    .cornerRadius(cornerRadius);

var ExpensesTitleArc = d3.arc()
    .outerRadius(radius + titleOffSet - (annularMargin + ((CollectionArcSequence - 1) *   annularWidth + ((CollectionArcSequence - 1) * annularSpacing))))
    .innerRadius(radius - titleOffSet - (annularMargin + (CollectionArcSequence * annularWidth + ((CollectionArcSequence - 1) * annularSpacing))))
    .startAngle(Math.PI-(Math.PI/100*titleRotationOffSet))
    .endAngle(endAngle);

var labelArc = d3.arc()
    .outerRadius(radius - annularWidth + 100)
    .innerRadius(radius - annularWidth - 120);


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
    .append("g")
    .attr("transform", "translate(" + (width / 2 - annularXOffset) + "," + (height / 2 - annularYOffset) + ")");

/*
  Layers for each annular
*/

var ExpensesLayer   = BaseSvg.append('g');

var TitleLayer      = BaseSvg.append('g');
var LegendLayer     = BaseSvg.append('g');

/*
  CSV calls for each data set
*/

d3.csv("expenses.csv", ExpensesType, function(error, ExpensesData) {
  if (error) throw error;

  var ExpensesItemCount = d3.nest()
    .rollup(function (v) { return d3.sum(v, function(d) { return d.Value})})
    .entries(ExpensesData);

  var g = ExpensesLayer.selectAll(".arc")
      .data(ExpensesPie(ExpensesData))
      .enter().append("g")
      .attr("class", "ExpensesArc");

  var ExpensesTip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([tipXOffSet, tipYOffSet])
      .html(function(d) {
        return d.data.Account +  " - "  + (d3.format(",.1%")(d.data.Value / ExpensesItemCount)) +  " - $" +  (d3.format(",d")(d.data.Value)) ;})

  ExpensesLayer.call(ExpensesTip);

  g.append("path")
      .attr("d", ExpensesArc)
      .style("fill", function(d) { return color(d.data.Account); })
      .on('mouseover', ExpensesTip.show)
      .on('mouseout', ExpensesTip.hide);

  g.append("text")
    .attr("transform", function(d) {
    var midAngle = d.endAngle < Math.PI ? d.startAngle/2 + d.endAngle/2 : d.startAngle/2  + d.endAngle/2 + Math.PI ;
    return "translate(" + labelArc.centroid(d)[0] + "," + labelArc.centroid(d)[1] + ") rotate(-90) rotate(" + (midAngle * 180/Math.PI) + ")"; })
    .attr("class", "labelText")
    .attr('text-anchor','middle')
    .attr("dy", ".35em")
    .text(function(d) { return "$" +  (d3.format(",d")(d.data.Value)) });

});

/*
  Add the titles to each annular
*/

var ExpensesTitleText     = 'LA Non-Event Expenditure 2015-2016';

TitleLayer.append("path")
      .attr("d", ExpensesTitleArc)
      .attr("id", "ExpensesTitle")
      .attr("class", "TitlePath");

TitleLayer.append("text")
      .attr("id", "ExpensesTitleText")
      .append("textPath")
      .attr("xlink:href", "#ExpensesTitle") //place the ID of the path here
      .attr("class", "Title")
    //  .attr("startOffset", "25%")
      .text(ExpensesTitleText);

/*
  Add a Legend
*/

var legend = LegendLayer.selectAll("g")
    .data(color.domain())
    .enter()
    .append('g')
    .attr('x', legendPlacementX)
    .attr('y', legendPlacementY)
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
        return 'translate(' + (legendPlacementX + legendWidth) + ',' + (legendPlacementY + (i * legendHeight)) + ')';
});

legend.append('rect')
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .attr('class', 'legendRect')
    .style('fill', color)
    .style('stroke', legendStrokeColor);

legend.append('text')
    .attr('x', legendWidth + legendXSpacing)
    .attr('y', legendHeight - legendYSpacing)
    .attr('class', 'legendText')
    .text(function(d) { return d ; }
  );

/*
  Glorious functions of deliciousness
*/

function ExpensesType(d) {
  d.Value = +d.Value;
  return d;
}
