/*
 * LA Infographic
 * ==============
 */
/* jshint esversion: 6 */
/* jshint curly: true */
/* jshint shadow: true */
/* jshint strict: true */
/* jshint undef: true */
/* jshint unused: true */
/* globals d3, d3_save_svg, window */
(function() {
"use strict";

/*
 * Extract our URL parameters.
 */
const urlSettings = getUrlSettings();

/*
 * Colours used in the annual-report.pdf.
 */
const color = d3.scaleOrdinal()
    .range(['#B1CF31', '#D6D6D8', '#FF6657', '#76CDCB', '#FFDE00', '#FF711F'])
    .domain([]);

const ExpensesTitleText = urlSettings.titleText;

const ExpensesArcSequence = 0;

const widthModifier   = 0.95;
const heightModifier  = 0.95;

const width           = window.innerWidth * widthModifier;
const height          = window.innerHeight * heightModifier;
const radius          = Math.min(width, height) / 2;

const annularXOffset  = 100;      // how much to shift the annulars horizontally from centre
const annularYOffset  = 0;        // how much to shift the annulars vertically from centre
const annularWidth    = 150;      // width of each annular (outer radius of donut)
const annularSpacing  = 75;       // inner radius of donut
const annularMargin   = 320;      // margin between annulars and canvas
const padAngle        = 0.02;     // amount that each segment of an annular is padded
const cornerRadius    = 20;       // amount that the sectors are rounded

const titleOffSet     = 22;       // amount in pixels that the title arc inner and outer radii are offset from the dataset arc that they are labelling
const titleRotationOffSet = -35;  // amount in percent that the title is rotated from the 180 degree mark
const titleEndAngle   = 0;        // end angle for title arcs

/*
 * Variables used with the d3.tip tooltips.
 */
const tipXOffSet        = 0;      // x offset for tooltip display in pixels
const tipYOffSet        = 0;      // y offset for tooltip display in pixels

/*
 * Variables used with the labels.
 */
const labelcxOffset     = 50;
const labelxOffset      = 20;

const labelcyOffset     = 80;
const labelyOffset      = 30;

const markerSize        = 2;
const markerOpacity     = 0.9;

const lineOpacity       = 0.7;
const linePercentage    = 0.9;    // a value between 0 and 1 representing what percentage of the radius the label line is.

/*
 * Set the angles for the pie chart.
 *
 * pieStartAngle value in RADIANS of start angle of pie chart.  Used for
 * rotation where text layout is "bunched" at the top, ie for many small
 * values.
 *
 * There are 2 pi radians in a circle, this makes the pie chart finish
 * "all the way around", otherwise there will be blank space.
 */
const pieStartAngle     = 1.2;
const pieEndAngle       = (pieStartAngle - (Math.PI * 2));


/*
 * Main Annular
 */
let ExpensesArc = d3.arc()
    .outerRadius(radius - (annularMargin + ((ExpensesArcSequence - 1) * annularWidth + ((ExpensesArcSequence - 1) * annularSpacing))))
    .innerRadius(radius - (annularMargin + (ExpensesArcSequence * annularWidth + ((ExpensesArcSequence - 1) * annularSpacing))))
    .padAngle(padAngle)
    .cornerRadius(cornerRadius);

let ExpensesTitleArc = d3.arc()
    .outerRadius(radius + titleOffSet - (annularMargin + ((ExpensesArcSequence - 1) * annularWidth + ((ExpensesArcSequence - 1) * annularSpacing))))
    .innerRadius(radius - titleOffSet - (annularMargin + (ExpensesArcSequence * annularWidth + ((ExpensesArcSequence - 1) * annularSpacing))))
    .startAngle(Math.PI-(Math.PI/100*titleRotationOffSet))
    .endAngle(titleEndAngle);

/*
 * Pie shapes for each data set
 */
let ExpensesPie = d3.pie()
    .sort(null)
    .startAngle(pieStartAngle)
    .endAngle(pieEndAngle)
    .value((d) => d.Value);

/*
 * SVG object - each annular is added as a layer / group
 */
let BaseSvg = d3.select('#visualisation')
    .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('id', 'BaseSvg')
    .append('g')
        .attr('transform', 'translate(' + (width / 2 - annularXOffset) + ',' + (height / 2 - annularYOffset) + ')');

/*
 * Layers for each annular
 */
let ExpensesLayer   = BaseSvg.append('g');
let TitleLayer      = BaseSvg.append('g');
let LabelLayer      = BaseSvg.append('g');

/*
 * Load the data from a CSV file
 */
d3.csv(
    'expenses.csv',
    (d) => { d.Value = +d.Value; return d; },
    function(error, ExpensesData) {
        if (error) {
            throw error;
        }
        let ExpensesItemCount = d3.nest()
            .rollup((v) => d3.sum(v, (d) => d.Value))
            .entries(ExpensesData);
        let ExpensesArcSet = ExpensesLayer.selectAll('.arc')
            .data(ExpensesPie(ExpensesData)).enter()
            .append('g')
                .attr ('class', 'ExpensesArc');
        let ExpensesTip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([tipXOffSet, tipYOffSet])
            .html((d) => d.data.Account + ' - ' + (d3.format(',.1%')(d.data.Value / ExpensesItemCount)) + ' - $' + (d3.format(',d')(d.data.Value)));
        ExpensesLayer.call(ExpensesTip);
        ExpensesArcSet.append('path')
            .attr('d', ExpensesArc)
            .attr('class', 'ExpensesArcPath')
            .style('fill', (d) => color(d.data.Account))
            .on('mouseover', ExpensesTip.show)
            .on('mouseout', ExpensesTip.hide);
        /*
        * Text labels and lines to each label
        */
        let ExpensesLabels = LabelLayer.selectAll('text');
        let ExpensesMarkers = LabelLayer.selectAll('defs');
        let ExpensesLines = LabelLayer.selectAll('polyline');
        ExpensesLabels.data(ExpensesPie(ExpensesData)).enter().append('text')
            .attr('text-anchor', 'middle')
            .attr('x', (d) => {
                let a = d.startAngle + (d.endAngle - d.startAngle)/2 - Math.PI/2;
                d.cx = Math.cos(a) * (radius - labelcxOffset);
                d.x = Math.cos(a) * (radius - labelxOffset);
                return d.x;
            })
            .attr('y', (d) => {
                let a = d.startAngle + (d.endAngle - d.startAngle)/2 - Math.PI/2;
                d.cy = Math.sin(a) * (radius - labelcyOffset);
                d.y = Math.sin(a) * (radius - labelyOffset);
                return d.y;
            })
            .text((d) => d.data.Account + ' - ' + d3.format('$d')(d.data.Value))
            .attr('class', 'ExpensesLabels')
            .each(function(d) {
                let bbox = this.getBBox();
                d.sx = d.x - bbox.width/2 - 2;
                d.ox = d.x + bbox.width/2 + 2;
                d.sy = d.oy = d.y + 5;
            });
        /* 
        * The markers are defined, but are used by the paths;
        * the markers will only display if the paths are displayed
        */
        ExpensesMarkers.data(ExpensesPie(ExpensesData)).enter()
            .append('defs')
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
        * The objective here is to draw a polyline from the centroid()
        * of each pie chart arc, to just short of where the label text is placed,
        * then underline the label text
        */
        ExpensesLines.data(ExpensesPie(ExpensesData))
            .enter()
            .append('polyline')
                .attr('marker-start', 'url(#marker)')
                .style('stroke', 'black')
                .style('fill', 'none')
                .style('stroke-width', '2')
                .style('opacity', lineOpacity)
                .attr('points', function (d) {
                    let a = d.startAngle + (d.endAngle - d.startAngle)/2 - Math.PI/2;
                    d.x = (Math.cos(a) * (radius * linePercentage));
                    d.y = (Math.sin(a) * (radius * linePercentage));
                    return ExpensesArc.centroid(d) + ' ' + d.x + ' ' + d.y;
                });
    }
);

/*
 * Add a title to the donut chart around the bottom
 *
 * The positioning of the title is controlled by the variable
 */
TitleLayer.append('path')
    .attr('d', ExpensesTitleArc)
    .attr('id', 'ExpensesTitle')
    .attr('class', 'TitlePath');
TitleLayer
    .append('text')
        .attr('id', 'ExpensesTitleText')
    .append('textPath')
        .attr('xlink:href', '#ExpensesTitle') // place the ID of the path here
        .attr('class', 'ExpensesTitle')
        .text(ExpensesTitleText);

/*
 * Download functionality
 */
d3.select('#download').on('click', function() {
    let config = { filename: urlSettings.downloadFilename };
    d3_save_svg.save(d3.select('#BaseSvg').node(), config);
});

/*
 * Extract the title from the URL.  It can be explictly set using the
 * ?title= URL parameter, or if /20\d\d/ appears in the URL it will be
 * deduced from that.
 */
function getUrlSettings()
{
    let result = {};
    let titleMatch = window.location.search.match(/[?&]title=([^&]*)/);
    if (titleMatch != null) {
        titleMatch[1] = decodeURI(titleMatch[1]);
        result.titleText = titleMatch[1];
        result.downloadFilename = titleMatch[1];
    } else {
        let yearMatch = window.location.pathname.match(/.*\/(20\d\d)\//);
        if (yearMatch != null) {
            let lastYear = +yearMatch[1] - 1;
            result.titleText = 'Linux Australia Non-Event Expenditure 1 October ' + lastYear + ' - 30 September ' + yearMatch[1];
            result.downloadFilename = 'la-expenses-' + lastYear + '-' + yearMatch[1];
        }
    }
    if (result.titleText == undefined) {
        result.titleText = 'Please set ?title=xxx in the URL';
        result.downloadFilename = 'title=xxxx';
    }
    return result;
}
})();
