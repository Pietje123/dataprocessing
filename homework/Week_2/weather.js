/**
* This script loads a local .csv file of the weather which starts at jan 1
* and ends jan 1 next year. The data is represented by a graph
*
* ALwan Rashid (10580204)
*/

// local file name
var file = "KNMI_20180101.txt";

var rawFile = new XMLHttpRequest();
rawFile.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200){
      // send to another function because the data is local and not global
       makeGraph(this.responseText)
    }
};
rawFile.open("GET", file, true);
rawFile.send();

function makeGraph(rawFile){
  rawdata = rawFile.split("\n");
  var data = [];
  var tempMin = Infinity;
  var tempMax = -Infinity;

  // pushes the data into an object array
  for (var i = 1; i < rawdata.length; i++){
    line = rawdata[i].split(",");

    // only interested in numbers
    if (isNaN(line[2])) {
      continue;

    }
    // temperature is given in 0.1 degrees C
    // the data is given in the order (date,temperature)
    let date_data = line[1].trim();
    let temperature = line[2] / 10;

    // get the max/min temperature
    if (temperature < tempMin){
      tempMin = temperature;
    }

    if (temperature > tempMax){
      tempMax = temperature;
    }

    // to make it a date type
    let year = date_data.slice(0,4);

    // for some idiotic reason january starts at 0 instead of 1
    let month = date_data.slice(4,6) - 1;
    let day = date_data.slice(6);
    let date = new Date(year, month, day);
    data.push({"temperature" : temperature, "date" : date});
    console.log(date);
  }

  // some variables
  // the .csv needs to be in order of the date
  var timeMin = data[0]["date"].getTime();
  var timeMax = data[data.length - 1]["date"].getTime();

  // .getYear starts counting on  jan 1 1900
  var yearCurrent = data[0]["date"].getYear() + 1900;
  var deltaTime = timeMax - timeMin;
  var deltaTemperature = tempMax - tempMin;

  // make a graph on the coppled html
  var canvas = document.getElementById('myCanvas');
  var ctx = canvas.getContext('2d');
  var width = 1000;
  var height = 500;
  var padding = 100;
  ctx.fillStyle = 'rgb(0,0,0)';

  // make the borders of the graph
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height + padding);
  ctx.lineTo(width + padding, height + padding);
  ctx.lineTo(width + padding, padding);
  ctx.lineTo(padding, padding);

  // to give a bigger picture of the data only 80% of the grpah is used
  var scaleY =  (0.8 * height) / deltaTemperature;
  var scaleX = width / deltaTime

  // move the ctx cursor to the border to avoid an ugly line
  var day1 = data[0]["temperature"];
  ctx.moveTo(padding, padding)

  // drawing the graph
  for (let i = 0; i < data.length; i++){
    let temperature = tempMax - data[i]["temperature"];
    let date = data[i]["date"].getTime() - timeMin;
    ctx.lineTo(scaleX * date + padding, temperature * scaleY + 0.1 * height + padding)
  }

  // adjust the text
  ctx.font = '40px serif';
  ctx.textAlign = 'center';
  ctx.fillText('Average Temperature in De Bilt (NL)', width / 2 + padding, padding - 10);
  ctx.font = '20px serif';
  ctx.textAlign = 'left';

  // prepare to draw the y-axis
  // find zero
  var zero = tempMax * scaleY + 0.1 * height + padding

  var tempScale = 5 * Math.ceil(deltaTemperature / 35);
  var temp = 0;

  while(zero > tempMax + 0.1 * height + padding){
    zero -= tempScale * scaleY;
    temp += tempScale;
  }

  ctx.moveTo(padding, zero);

  // drawing the y-axis labels
  for (let i = 0; i < deltaTemperature / tempScale + 2; i++){

    // if the tick gets out of bounds
    if (padding + i * scaleY * tempScale > height + padding){
      break;
    }
    // write the text and draw the labels
    ctx.textAlign = 'right';
    ctx.fillText(temp, padding - 15, zero + i * scaleY * tempScale);
    temp -= tempScale;
    ctx.lineTo(padding - 10, zero + i * scaleY * tempScale);
    ctx.moveTo(padding, zero + (i + 1) * scaleY * tempScale);
  }

  // a year has 12 months
  var months = 12;
  var monthLength = width / months;
  var monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // tick lables
  ctx.font = '30px serif';
  ctx.textAlign = "center"
  ctx.save();
  ctx.translate(padding / 4, height / 2 + padding);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Temperature in degrees", 0, 0);
  ctx.restore();

  ctx.fillText("Months", width / 2 + padding, height + padding * 2.5);
  ctx.font = '20px serif';
  ctx.textAlign = "right"
  // writes the months at the right ticks
  for (let i = 0; i < months; i++){

    // draws the ticks
    ctx.moveTo(padding + monthLength * (i + 0.5), padding + height);
    ctx.lineTo(padding + monthLength * (i + 0.5), 1.25 * padding + height)

    // adds the borders of each month
    ctx.moveTo(padding + monthLength * (i + 1), padding + height)
    ctx.lineTo(padding + monthLength * (i + 1), padding)

    // add the names of each month rotated
    ctx.save();
    ctx.translate(padding + monthLength * (i + 0.5),height + 1.5 * padding);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(monthName[i], 0, 0);
    ctx.restore();
  }

  // adds the year rotated
  ctx.save();
  ctx.translate(padding, padding + height);
  ctx.rotate(-Math.PI / 4);
  ctx.fillText(yearCurrent, -10,5);
  ctx.stroke();
}
