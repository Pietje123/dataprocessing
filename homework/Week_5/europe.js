/*
This script makes a map and a bar chart when the user clicks on a country

Alwan Rashid (10580204)
*/


window.onload = function() {

	d3.queue()
		.defer(d3.json, "population.json")
		.defer(d3.json, "europeData.json")
		.awaitAll(drawMap)

}
function drawMap(error, response){
	if (error) throw error;
	population = response[0];

	// make the bar chart
	makeBarchart()
	
	// https://gist.github.com/MariellaCC/0055298b94fcf2c16940
	//Width and height
	var w = 800;
	var h = 600;



	var projection = d3.geoMercator() 
						   .center([ 13, 52 ]) 
						   .translate([ w/2, h/2 ]) 
						   .scale([ w/1.5 ]);

	//Define path generator
	var path = d3.geoPath()
					 .projection(projection);


	//Create SVG
	var svg = d3.select("#container")
				.append("svg")
				.attr("width", w)
				.attr("height", h);

	var tooltip = d3.select("#container").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
	
	//Load in GeoJSON data
	d3.json("mapdata.json", function(json) {

		//Bind data and create one path per GeoJSON feature
		svg.selectAll("path")
		   .data(json.features)
		   .enter()
		   .append("path")
		   .attr("d", path)
		   .attr("stroke", "rgba(8, 81, 156, 0.2)")
		   .attr("fill", "rgba(8, 81, 156, 0.6)")
			 .attr("id", function(d){
				 return d.properties.admin
			 })
			 // https://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
			 .on("mouseover", function(d) {
	            tooltip.transition()
	            .duration(200)
	            .style("opacity", .9);
				let country = d.properties.admin

				// if a country is found, which occurs in the database
				if (population[country] != undefined){
					let title = "The population of " + country + " is " + Math.round(population[country] * 1000)
					tooltip.html(title)
					.style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY) + "px");

				}

				// but isn't Antarctica
				else if (country != "Antarctica"){
					tooltip.html(d.properties.admin)
					.style("left", (d3.event.pageX) + "px")
      				.style("top", (d3.event.pageY) + "px");
					}

				else{
					tooltip.transition()
					.duration(500)
					.style("opacity", 0)
				}

          	})
	        .on("mouseout", function(d) {
	            tooltip.transition()
	            .duration(500)
	            .style("opacity", 0)
	          })

	        // update bar chart if country is clicked
			.on("click",function(d){
				if (response[1][d.properties.admin] != undefined) { 
					updateBarchart(response[1][d.properties.admin], d.properties.admin)
				}
				else {
					tooltip.transition()
            				.duration(500)
            				.style("opacity", 0)

            		tooltip.transition()
	            			.duration(200)
	            			.style("opacity", .9);
					tooltip.html("Data is unknown")
				}
			});


	});
}
/**
This function makes a barchart
*/
function makeBarchart(){

	var margin = {top: 40, right: 20, bottom: 50, left:200}
	var w = 1000 - margin.left - margin.right
	var h = 200 - margin.top - margin.bottom
	var ylabel = ["Employment rate (%)","Life expectancy (Years)","Life satisfaction (out of 100)"]
	var barWidth = h / (ylabel.length + 1)
	var xScale = d3.scaleLinear().range([0,w]).domain([0,100]),
		xAxis = d3.axisTop().scale(xScale)


	// add the svg on which the bar chart is placed
	var svg = d3.select("#barchart")
				.append("svg")
				.attr("width", w + margin.left + margin.right)
				.attr("height", h + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// add labels
	svg.selectAll("text.axis").data(ylabel).enter().append("text").attr("class","barLabel")
			.attr("x", - 10)
			.attr("y", function(d,i){
				return (h  - (i  + 0.5) * barWidth )
			}).text(function(d){return d}).attr("text-anchor", "end")
	
	// add the bars
	svg.append("g").attr("class", "axis tick")
			.attr("x", 0)
			.call(xAxis).append("text").attr("class","label")

}

/**
This function updates the bar chart
*/

function updateBarchart(data, country, gender){
	// remove the old elements
	d3.selectAll(".bar").remove();
	var gender;


	// check which gender is selected
	$("#Men").click(function(){
    gender = "men";
    updateBarchart(data, country, gender)
	});
	$("#Women").click(function(){
    gender = "women";
	updateBarchart(data, country, gender)
	});

	if (arguments.length < 3) {
		gender = "men"
	}

	// add the bar chart title to the html
	title = "The selected country is " + country + " (" + gender + ")"

	d3.select("h2").text(title)
	genderData = data[gender]

	// add the bar chart data to the html
	barChartdata = "The current country is " + country + ". The employment rate is " + genderData[0] + 
			", the life expectancy is " + genderData[1] + ", the life satisfaction is " + genderData[2] + "." +
			"The current data is of " + gender 
	d3.select("#current").text(barChartdata)
	var margin = {top: 40, right: 20, bottom: 50, left:200}
	var w = 1000 - margin.left - margin.right
	var h = 200 - margin.top - margin.bottom
	var barWidth = h / 4
	
	var svg = d3.select("#barchart").select("svg").select("g")
	
	var tooltip = d3.select("#barchart").append("div")
			      .attr("class", "tooltip")
			      .style("opacity", 0);

	var bar = svg.selectAll("rect").data(genderData).enter().append("rect")
		.attr("fill", "rgba(8, 81, 156, 0.6)")
		.attr("stroke", "rgba(8, 81, 156, 0.6)")
		.attr("class","bar").attr("y", function(d,i){
			return (h * 3 / 4 - i * barWidth)
		})
		.transition().duration(1000)
		.attr("height", barWidth * 0.8)
		.attr("width", function(d, i){
				return d / 100 * w
		})
}