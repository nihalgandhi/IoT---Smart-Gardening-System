$(document).ready(function () {
  var timeData = [],
    temperatureData = [],
    moistureData = [];
	
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();

  if(dd<10) {
    dd = '0'+dd
  } 

  if(mm<10) {
    mm = '0'+mm
  } 

  dd = dd+1;
  today = mm + '/' + dd + '/' + yyyy;
  dd = dd+1;
  var today2 = mm + '/' + dd + '/' + yyyy;
  dd = dd+1;
  var today3 = mm + '/' + dd + '/' + yyyy;
  dd = dd+1;
  var today4 = mm + '/' + dd + '/' + yyyy;
  dd = dd+1;
  var today5 = mm + '/' + dd + '/' + yyyy;
  dd = dd+1;
  var dateData = [];
  dateData.push(today);
  dateData.push(today2);
  dateData.push(today3);
  dateData.push(today4);
  dateData.push(today5);  

  var data = {
    labels: timeData,
    datasets: [
      {
        fill: false,
        label: 'Moisture',
        yAxisID: 'Moisture',
        borderColor: "rgba(24, 120, 240, 1)",
        pointBoarderColor: "rgba(24, 120, 240, 1)",
        backgroundColor: "rgba(24, 120, 240, 0.4)",
        pointHoverBackgroundColor: "rgba(24, 120, 240, 1)",
        pointHoverBorderColor: "rgba(24, 120, 240, 1)",
        data: moistureData
      }
    ]
  }

  var data2 = {
    labels: dateData,
    datasets: [
      {
        fill: false,
        label: 'Temperature',
        yAxisID: 'Temperature',
        borderColor: "rgba(255, 204, 0, 1)",
        pointBoarderColor: "rgba(255, 204, 0, 1)",
        backgroundColor: "rgba(255, 204, 0, 0.4)",
        pointHoverBackgroundColor: "rgba(255, 204, 0, 1)",
        pointHoverBorderColor: "rgba(255, 204, 0, 1)",
        data: temperatureData
      }
    ]
  }
  
  var basicOption = {
    title: {
      display: true,
      text: 'Moisture Real-time Data',
      fontSize: 36
    },
    scales: {
      yAxes: [{
          id: 'Moisture',
          type: 'linear',
          scaleLabel: {
            labelString: 'Moisture(%)',
            display: true
          },
          position: 'left'
        }]
    }
  }
  
  var basicOption2 = {
    title: {
      display: true,
      text: 'Temperature Real-time Data',
      fontSize: 36
    },
    scales: {
      yAxes: [{
        id: 'Temperature',
        type: 'linear',
        scaleLabel: {
          labelString: 'Temperature(C)',
          display: true
        },
        position: 'left',
      }]
    }
  }

  //Get the context of the canvas element we want to select
  var ctx = document.getElementById("myChart").getContext("2d");
  var optionsNoAnimation = { animation: false }
  var myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: basicOption
  });

  //Get the context of the canvas element we want to select
  var ctx2 = document.getElementById("myChart2").getContext("2d");
  //var optionsNoAnimation = { animation: false }
  var myLineChart2 = new Chart(ctx2, {
    type: 'line',
    data: data2,
    options: basicOption2
  });
  
  var ws = new WebSocket('wss://' + location.host);
  ws.onopen = function () {
    console.log('Successfully connect WebSocket');
  }
  ws.onmessage = function (message) {
    console.log('receive message' + message.data);
    try {
      var obj = JSON.parse(message.data);
      if(!obj.time || !obj.temperature1 || !obj.moisture) {
        return;
      }
	  
	  if (obj.temperature1) {
        temperatureData.push(obj.temperature1);
      }
	  if (obj.temperature2) {
        temperatureData.push(obj.temperature2);
      }
	  if (obj.temperature3) {
        temperatureData.push(obj.temperature3);
      }
	  if (obj.temperature4) {
        temperatureData.push(obj.temperature4);
      }
	  if (obj.temperature5) {
        temperatureData.push(obj.temperature5);
      }
	  
      timeData.push(obj.time);
      // only keep no more than 24 points in the line chart
      const maxLen = 24;
      var len = timeData.length;
	  if (len > maxLen) {
        timeData.shift();
      }
	  
      if (obj.moisture) {
        moistureData.push(obj.moisture);
      }
      if (moistureData.length > maxLen) {
        moistureData.shift();
      }

      myLineChart.update();
	  myLineChart2.update();
    } catch (err) {
      console.error(err);
    }
  }
});
