/**
This script creates a bar chart using the data from a given file
*/

// reads the data
d3.json("Bevolking_Nederland_1950-2017.json", function(data) {
  years = data["Year"];
  population = data["Population"].map(Number);

  // padding
  var margin = {top: 40, right: 20, bottom: 30, left: 100},
    // adjusts to user window
    width = window.innerWidth * 0.95 - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom;

  // get the max for scaling
  let maxPop = Math.max.apply(Math, population);
  let barWidth = width / (years.length) - 4;

  // let d3 scale for us
  var xScale = d3.scale.linear()
                        .domain([0, years.length])
                        .range([0, width * 2]);

  var yScale = d3.scale.linear()
                      	.range([height + margin.top, margin.top])
                        .domain([0,maxPop])

  // make the axis
  var xAxis = d3.svg.axis()
                        .scale(xScale)
                        .orient("bottom")
                        .ticks(years.length)
                        .tickFormat("")
  var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient("left")

  // used for interactivity
  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<span style='color:red'>" + d + "</span><strong>  People in the Netherlands</strong>";
  })
  // write some text
  d3.select("body").append("h1").text("Alwan Rashid (10580204)")
  d3.select("body").append("h3").text("Barchart of the Dutch population")
  d3.select("body").append("p").text("This is a barchart representing the Dutch population \
                                      from 1950 up untill 2017")
  // making a super awesome link
  d3.select("body").append("a").text("data").attr("class","data")
    .on("click", function() { window.open("https://opendata.cbs.nl/statline/#/CBS/nl/dataset/37296ned/table?ts=1524747065664")
    });
  // the chart itself
  var svg = d3.select("body")
            .append("svg")
            .attr("width", (width + margin.left + margin.right))
            .attr("height", (height + margin.top + margin.bottom))

  // calling the interactivity
  svg.call(tip);

  // drawing the bars
  svg.selectAll("rect")
   .data(population)
   .enter()
   .append("rect")
   .attr("class","bar")
   .attr("y", function(d) {
     return height - (d * height / maxPop)
   })
   .attr("x", function(d,i) {
     return i * (barWidth + 5) + margin.left
   })
   .attr("height", function(d){
     return (d * height / maxPop)
   })
   .attr("width", barWidth)

   // the interactivity
   .on('mouseover', tip.show)
   .on('mouseout', tip.hide)

   // create the x axis
   svg.append("g")
       .attr("class","axis")
       .attr("transform", "translate("+ margin.left +"," + height + ")")
       .call(xAxis)


   // create the y axis
   svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(" + margin.left + "," +
              -margin.top + ")")
       .call(yAxis)
       .append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 6)
       .attr("dy", ".71em")
       .attr("dx", "-3em")
       .style("text-anchor", "end")
       .text("Population");

       // create x lables
       svg.selectAll("text.year")
       .data(years)
       .enter()
       .append("text")
       .attr("class","year")
       .attr("x", function(d,i){
         return i * (barWidth + 1) + barWidth / 2 + margin.left
       })
       .attr("y", height + margin.bottom * 0.8)
       .text(function(d){
         return d
       })
       .attr("font-size", 16 + "px")
       .attr("text-anchor", "middle")
})
