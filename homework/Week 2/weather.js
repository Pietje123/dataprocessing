rawdata = document.getElementById("rawdata").innerHTML.split("\n");
var data = [];
var tempMin = 0;
var tempMax = 0;

for (var i = 1; i < rawdata.length; i++){
  line = rawdata[i].split(",");

  if (line == ""){
    continue;
  }
  let date_data = line[0].trim();
  let temperature = line[1] / 10;

  if (temperature < tempMin){
    tempMin = temperature;
  }

  if (temperature > tempMax){
    tempMax = temperature;
  }
  let year = date_data.slice(0,4);
  // for some idiotic reason january starts at 0 instead of 1
  let month = date_data.slice(4,6) - 1;
  let day = date_data.slice(6);
  let date = new Date(year, month, day);
  data.push({"temperature" : temperature, "date" : date});
}
var deltaTemperature = tempMax - tempMin
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var width = 1000;
var height = 500;
var padding = 50;
ctx.fillStyle = 'rgb(0,0,0)';
ctx.beginPath();
ctx.moveTo(padding, padding);
ctx.lineTo(padding, height + padding);
ctx.lineTo(width + padding, height + padding);
ctx.lineTo(width + padding, padding);
ctx.lineTo(padding, padding);

var day = (width) / (data.length - 1);
var scale =  (0.8 * height) / deltaTemperature;
var day1 = data[0]["temperature"];
ctx.moveTo(padding, day1 + padding)

for (var i = 0; i < data.length - 1; i++){
  temperature = tempMax - data[i]["temperature"];
  ctx.lineTo(i * day + padding, temperature * scale + 0.1 * height + padding)
}

ctx.font = '40px serif';
ctx.textAlign = 'center';
ctx.fillText('Average Temperature in De Bilt (NL)', width / 2 + padding, padding - 10);
ctx.font = '20px serif';
ctx.textAlign = 'left';

var zero = (tempMax - day1) * scale + 0.1 * height + padding
var tempScale = 5;
var temp = 0;

while(zero > tempMax + 0.1 * height + padding){
  zero -= tempScale * scale;
  temp += 5;
}

ctx.moveTo(padding, zero);

for (var i = 0; i < deltaTemperature / tempScale + 2; i++){
  if (padding + i * scale * tempScale > height + padding){
    break;
  }
  ctx.fillText(temp + ' C', 0, padding * 1.5  + i * scale * tempScale);
  temp -=5;
  ctx.lineTo(padding - 10, zero + i * scale * tempScale);
  ctx.moveTo(padding, zero + (i + 1) * scale * tempScale);
}
ctx.stroke();
