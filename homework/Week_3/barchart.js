var width = window.innerWidth * 0.8;

d3.json("Bevolking_Nederland_1950-2017.json", function(data) {
  years = data["Year"];
  population = data["Population"].map(Number);
  let barLen = 20;
  let padding = 50;
  maxPop = Math.max.apply(Math, population);
  var svg = d3.select("body")
            .append("svg")
            .attr("width", width )
            .attr("height", population.length * (barLen + 1));
  svg.selectAll("rect")
   .data(population)
   .enter()
   .append("rect")
   .attr("x", padding)
   .attr("y", function(d,i) {
     return i * (barLen + 1)
   })
   .attr("width", function(d){
     return d / maxPop * (width - padding)
   })
   .attr("height", 20);
   svg.selectAll("text")
   .data(years)
   .enter()
   .append("text")
   .attr("x",0)
   .attr("y", function(d,i){
     return i * (barLen + 1) + barLen;
   })
   .text(function(d){
     return d
   })

});
