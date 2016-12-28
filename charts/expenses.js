/* LA Infographic */

var color = d3.scaleOrdinal()
    .range([
      '#ffc100',
      '#ff0000',
      '#393939',
      '#FFCD33',
      '#FF3333',
      '#616161',
      '#FFDA66',
      '#FF6666',
      '#888888',
      '#FFE699',
      '#FF9999',
      '#B0B0B0',
      '#FFF3CC',
      '#FFCCCC',
      '#fff'
      ])
    .domain([
        'Face to face',
        'Insurance',
        'Merchant fees',
        'Consulting accounting',
        'Donations',
        'Grants',
        'Travel',
        'Storage rental',
        'Gift',
        'Conf bid review',
        'Server',
        'Stationery',
        'Bank fees',
        'Foreign currency losses',
        'Other'
    ]);


var ExpensesArcSequence = 0;

var widthModifier = 0.95;
var heightModifier = 0.95;

var width = innerWidth * widthModifier,
    height = innerHeight * heightModifier,
    radius = Math.min(width, height) / 2;

var annularXOffset  = 100; // how much to shift the annulars horizontally from centre
var annularYOffset  = 0; // how much to shift the annulars vertically from centre
var annularWidth    = 160; // width of each annular
var annularSpacing  = 15;
var annularMargin   = 250; // margin between annulars and canvas
var padAngle        = 0.025; // amount that each segment of an annular is padded
var cornerRadius    = 5; // amount that the sectors are rounded

var titleOffSet     = 22; // amount in pixels that the title arc inner and outer radii are offset from the dataset arc that they are labelling
var titleRotationOffSet = -35; // amount in percent that the title is rotated from the 180 degree mark
var titleEndAngle        = 0; // end angle for title arcs

/* Variables used with the d3.tip tooltips */

var tipXOffSet = 0; // x offset for tooltip display in pixels
var tipYOffSet = 0; // y offset for tooltip display in pixels

/* Variables used with the labels */
var labelPercentage = 0.6 // a value representing how far away from the outerArc the label is positioned
var labelxOffset  = 10;
var labelyOffset  = 20;

var markerSize = 2;
var markerOpacity = 0.9;

var lineOpacity = 0.7;
var linePercentage = 0.95; // a value between 0 and 1 representing what percentage of the radius the label line is.

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
    .endAngle(titleEndAngle);

/*
  Pie shapes for each data set
*/

var ExpensesPie = d3.pie()
    .sort(null)
    .value(function(d) { return d.Value; });

/*
  SVG object - each annular is added as a layer / group
*/

var BaseSvg = d3.select('#visualisation').append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('id', 'BaseSvg')
    .attr('transform', 'translate(' + (width / 2 - annularXOffset) + ',' + (height / 2 - annularYOffset) + ')');

/*
  Layers for each annular
*/
var ExpensesLayer   = BaseSvg.append('g');
var TitleLayer      = BaseSvg.append('g');
var LabelLayer      = BaseSvg.append('g');

/*
  load the data from a CSV file
*/

d3.csv('expenses.csv', ExpensesType, function(error, ExpensesData) {
  if (error) throw error;

  var ExpensesItemCount = d3.nest()
    .rollup(function (v) { return d3.sum(v, function(d) { return d.Value})})
    .entries(ExpensesData);

  var ExpensesArcSet = ExpensesLayer.selectAll('.arc')
      .data(ExpensesPie(ExpensesData))
      .enter().append('g')
      .attr ('class', 'ExpensesArc')

  var ExpensesTip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([tipXOffSet, tipYOffSet])
      .html(function(d) {
        return d.data.Account +  ' - '  + (d3.format(',.1%')(d.data.Value / ExpensesItemCount)) +  ' - $' +  (d3.format(',d')(d.data.Value)) ;})

  ExpensesLayer.call(ExpensesTip);

  ExpensesArcSet.append('path')
      .attr('d', ExpensesArc)
      .attr('class', 'ExpensesArcPath')
      .style('fill', function(d) { return color(d.data.Account); })
      .on('mouseover', ExpensesTip.show)
      .on('mouseout', ExpensesTip.hide);


    /*
      Text labels and lines to each label
    */

    var ExpensesLabels = LabelLayer.selectAll('text')
    var ExpensesMarkers = LabelLayer.selectAll('defs')
    var ExpensesLines = LabelLayer.selectAll('polyline')

    ExpensesLabels.data(ExpensesPie(ExpensesData))
    .enter().append('text')

    .attr('text-anchor', function(d){
      var a = midAngle(d);
      var pos = radius * (a < Math.PI/2 ? 1 : -1);
      return (pos < 0 ? 'end' : 'start');
    })

    .attr('x', function(d) {
        var a = midAngle(d);
        var pos = radius * (a < Math.PI/2 ? 1 : -1);
        var offset = (pos > 0 ? labelxOffset : (labelxOffset * -1));
        return d.x = Math.cos(a) * (radius * linePercentage) + offset;
    })
    .attr('y', function(d) {
        var a = midAngle(d);
        return d.y = Math.sin(a) * (radius * linePercentage);
    })
    .text(function(d) { return '  ' + d.data.Account + ' - ' + d3.format('$d')(d.data.Value) + '  '; })
    .attr('class', 'ExpensesLabels')
    .each(function(d) {
        var bbox = this.getBBox();
        d.sx = d.x - bbox.width/2 - 2;
        d.ox = d.x + bbox.width/2 + 2;
        d.sy = d.oy = d.y + 5;
    });

    /* The markers are defined, but are used by the paths;
     * the markers will only display if the paths are displayed
     */

    ExpensesMarkers.data(ExpensesPie(ExpensesData))
    .enter().append('defs')
    .append('marker')
    .attr('class', 'marker')
    .attr('id', 'marker')

    .attr('markerWidth', '12')
    .attr('markerHeight', '12')
    .attr('orient', 'auto')
    .attr('refX', markerSize)
    .attr('refY', markerSize)
    .append('circle')
    .attr('cx', markerSize)
    .attr('cy', markerSize)
    .attr('r', markerSize)
    .style('opacity', markerOpacity);


  /*
    The objective here is to draw a polyline from the centroid() of each pie chart arc, to just short of where the label text is placed, then underline the label text
  */

	ExpensesLines.data(ExpensesPie(ExpensesData))
    .enter()
		.append('polyline')
    .attr('marker-start', 'url(#marker)')
    .style('stroke', 'black')
    .style('fill', 'none')
    .style('stroke-width', '2')
    .style('opacity', lineOpacity)

    .attr('points', function (d){
      var a = midAngle(d);
      d.x = (Math.cos(a) * (radius * linePercentage));
      d.y = (Math.sin(a) * (radius * linePercentage));
      return ExpensesArc.centroid(d) + ' ' + d.x + ' ' + d.y;
    })

});







/*
  Add a title to the donut chart around the bottom

  The positioning of the title is controlled by the variable



*/

var ExpensesTitleText     = 'Linux Australia Non-Event Expenditure 1 October 2015 - 30 September 2016';

TitleLayer.append('path')
      .attr('d', ExpensesTitleArc)
      .attr('id', 'ExpensesTitle')
      .attr('class', 'TitlePath');

TitleLayer.append('text')
      .attr('id', 'ExpensesTitleText')
      .append('textPath')
      .attr('xlink:href', '#ExpensesTitle') //place the ID of the path here
      .attr('class', 'ExpensesTitle')
      .text(ExpensesTitleText);


/*
  Glorious functions of deliciousness
*/

function ExpensesType(d) {
  d.Value = +d.Value;
  return d;
}

function midAngle(d){
    return d.startAngle + (d.endAngle - d.startAngle)/2 - Math.PI/2;
}
