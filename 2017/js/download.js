/*
  Download functionality
*/
d3.select('#download').on('click', function() {
  var config = {
    filename: 'la-expenses-2016-2017',
  }
  d3_save_svg.save(d3.select('#BaseSvg').node(), config);
});
