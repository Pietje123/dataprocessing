/**
  This script makes a scatterplot form data of the site http://stats.oecd.org/

  Alwan Rashid (10580204)
*/


window.onload = function() {

  console.log('Yes, you can!')

  var waste = "https://stats.oecd.org/SDMX-JSON/data/MUNW/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+IRL+ITA+LUX+NLD+NOR+POL+ESP+SWE+CHE+GBR+LTU+RUS.MUNICIPAL?startTime=2006&endTime=2014"
  var eco = "https://stats.oecd.org/SDMX-JSON/data/GREEN_GROWTH/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+IRL+ITA+LUX+NLD+NOR+POL+ESP+SWE+CHE+GBR+LTU+RUS.CO2_PBPROD?startTime=2006&endTime=2014"


  // wait till data is loaded, then execute doFunction
  d3.queue()
    .defer(d3.request, waste)
    .defer(d3.request, eco)
    .awaitAll(doFunction);
};



function doFunction(error, response, year) {
  if (error) throw error;

  // needed for the update function
  if (arguments.length < 3){
    var year = 2006
  }

  let ecoYears = getYear(response[1]);
  let wasteYears = getYear(response[0]);
  let wasteCountries = getCountry(response[0], wasteYears);
  let ecoCountries = getCountry(response[1], ecoYears);
  let xAxisLabel = getAxis(response[1], ecoCountries, ecoYears);
  let yAxisLabel = getAxis(response[0], wasteCountries, wasteYears);

  let wasteData = getData(response[0], wasteCountries.length, ecoYears.length, yAxisLabel);
  let ecoData = getData(response[1], ecoCountries.length, wasteYears.length, xAxisLabel);
  let JSONEcoData = makeJSONFormat(ecoYears, ecoCountries, xAxisLabel, ecoData)
  let JSONWasteData = makeJSONFormat(wasteYears, wasteCountries, yAxisLabel, wasteData)
  let graphData = makeReadableForGraph(JSONEcoData[year], ecoCountries, xAxisLabel, JSONWasteData[year], yAxisLabel)

  makeGraph(graphData, xAxisLabel, yAxisLabel)
  makeDropdown(ecoYears, error, response)


};
/**
  This function gets the years of the data from the API
*/
function getYear(response){
  let obj = JSON.parse(response["responseText"]);
  let unchangedYears = obj["structure"]["dimensions"]["observation"]["0"]["values"];
  let years = [];
  unchangedYears.forEach(function(d){
    years.push(d.name)
  })
  return years
}

/**
  This function gets the countries of the data from the API
*/
function getCountry(response) {
  let obj = JSON.parse(response["responseText"]);
  let unchangedCountry = obj["structure"]["dimensions"]["series"]["0"]["values"];
  let countries = [];
  unchangedCountry.forEach(function(d){
    countries.push(d.name);
  });
  return countries
}

/**
  This function gets the axis of the data from the API
*/
function getAxis(response){
  let obj = JSON.parse(response["responseText"]);
  let unchangedAxis = obj["structure"]["dimensions"]["series"]["1"]["values"];
  let axis = [];
  unchangedAxis.forEach(function(d){
    axis.push(d.name)
  });
  return axis
}
/**
  This function gets the datapoints of the data from the API
*/
function getData(response, range, years,  AxisLabel){
  let obj = JSON.parse(response["responseText"]);
  let unchangedData = obj["dataSets"]["0"]["series"];
  data = [];

  // range is the amount of countries
  for (let i = 0; i < range; i++){

    // in the case multiple x/y - options are given
    for (let k = 0; k < AxisLabel.length; k++){
      let key = i + ":" + k

      let countryData = unchangedData[key]["observations"]
      let dataCountry = [];

      for (let j = 0; j < years; j++){


        // in the case the API has no data from a country in this year
        if (typeof countryData[j] == 'undefined'){dataCountry.push(undefined)}

        else {
          dataCountry.push(countryData[j][0])
              }
      }

      data.push(dataCountry)
    }
  }
  return data;
}
/**
  This function is to make the data more readable for me. It's rewritten in the
  format: "[years]: [countries]: [axis]: datapoint"
*/
function makeJSONFormat(years, countries, axis, data){
  JSONFormat = "{";
  let k = 0;
  years.forEach(function(year){
    let i = 0;
    JSONFormat += "\"" + year + "\":{"
    countries.forEach(function(country){
      let j = 0;
      JSONFormat += "\"" + country + "\":{"
      axis.forEach(function(axis){
        JSONFormat += "\"" + axis + "\":"
        JSONFormat += "\"" + data[i + j][k] + "\","
        j++
      })
       JSONFormat = JSONFormat.slice(0,-1) + "},"
       i+=axis.length
    })
    JSONFormat = JSONFormat.slice(0,-1) + "},"
    k++;
  })

  JSONFormat = JSON.parse(JSONFormat.slice(0,-1) + "}")
  return JSONFormat
}
/**
  This function makes the JSONFormatdata easier to put into the plot
*/
function makeReadableForGraph(xData, countries, xAxisLabel, yData, yAxisLabel){
  graphData = [];

  countries.forEach(function(country){
    data = [xData[country][xAxisLabel], yData[country][yAxisLabel], country];
    graphData.push(data);

  });
  return graphData
}

/**
  This function makes the scatterplot
*/
function makeGraph(data, xAxisLabel, yAxisLabel) {

  // used sites:
  // http://bl.ocks.org/weiglemc/6185069
  // https://stackoverflow.com/questions/38450349/uncaught-typeerror-cannot-read-property-linear-of-undefined
  // https://keithpblog.org/post/upgrading-d3-from-v3-to-v4/.

  var margin = {top: 40, right: 20, bottom: 50, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    // setup x
    var xValue = function(d) { return Number(d[0]);}, // data -> value
        xScale = d3.scaleLinear().range([0, width]), // value -> display
        xMap = function(d) { return xScale(xValue(d));}, // data -> display
        xAxis = d3.axisBottom().scale(xScale);

    // setup y
    var yValue = function(d) { return Number(d[1]);}, // data -> value
        yScale = d3.scaleLinear().range([height, 0]), // value -> display
        yMap = function(d) { return yScale(yValue(d));}, // data -> display
        yAxis = d3.axisLeft().scale(yScale);
    var cValue = function(d) { return d[2];},
        color = d3.scaleOrdinal(d3.schemeCategory20);

    //Create SVG element
    // add the graph canvas to the body of the webpage
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", 30)
        .style("text-anchor", "end")
        .text(xAxisLabel)
        .style("fill","black")
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Comparison between muncipal waste and CO2 production");

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(yAxisLabel)
        .style("fill","black")

      // draw dots
    svg.selectAll(".dot")
       .data(data)
       .enter().append("circle")
       .attr("class", "dot")
       .attr("r", 10)
       .attr("cx", xMap)
       .attr("cy", yMap)
       .style("fill", function(d) { return color(cValue(d));})

       // used site
       // https://bl.ocks.org/mbostock/3887118
       var legend = svg.selectAll(".legend")
           .data(color.domain())
         .enter().append("g")
           .attr("class", "legend")
           .attr("transform", function(d, i) { return "translate(0," + i * 15 + ")"; });


       legend.append("rect")
           .attr("x", width - 13)
           .attr("width", 13)
           .attr("height", 13)
           .style("fill", color);

       legend.append("text")
           .attr("x", width - 19)
           .attr("y", 9)
           .attr("dy", ".1em")
           .style("text-anchor", "end")
           .text(function(d) { return d; });
}

/**
  This function makes a dropdownmenu dependend on the data and calls an update-
  function if the user request another year
*/
function makeDropdown(year, error, response){
  var select = d3.select('body')
    .append('select')
    	.attr('class','select')
      .on('change',onchange)

  var options = select
    .selectAll('option')
  	.data(year).enter()
  	.append('option')
  		.text(function (d) { return d; });

  function onchange() {
  	select = d3.select('select').property('value')

  	updateData(select, error, response)
  };
}
/**
  This function updates the scatterplot by removing the old one and making a
  new one
*/
function updateData(year, error, response){
  d3.select("svg").remove();
  d3.selectAll("select").remove();
  doFunction(error, response, year)
}


/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */

// used site:
// https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_js_dropdown
function showYears() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}
