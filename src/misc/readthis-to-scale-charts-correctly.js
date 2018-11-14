(function sP500_03() { // include all into a function, local naming.
//sources:
//
//calls of csv files: get csv data: https://plot.ly/javascript/ajax-call/
// handling various csv s https://community.plot.ly/t/how-to-merge-two-plotly-graphs-plotted-by-using-rest-url-for-csv-data/2122
//
// Range slider and time selectors: https://plot.ly/javascript/range-slider/
//
//Resonsive layout:
//https://plot.ly/javascript/responsive-fluid-layout/
//https://codepen.io/etpinard/pen/NrrOrY?editors=1010 (responsive resize)
//
//https://plot.ly/javascript/plotlyjs-function-reference/
//
// layout axis: https://plot.ly/javascript/multiple-axes/
//
// add traces function: https://plot.ly/javascript/plotlyjs-function-reference/


// enter division name
  var divID = 'myDiv_SP500_03';

  var divIDString= "div[id='"+ divID+ "']";

// x axis range
  var yearsToPlot = 65;
  var currentTime = new Date();
  var month = currentTime.getMonth() + 1;
  var day = currentTime.getDate();
  var year = currentTime.getFullYear();
  var initialYear = year - yearsToPlot;

  var currentDate = year+'-'+month+'-'+day;
//console.log(currentDate);
//var initialDate = initialYear+'-'+month+'-'+day;
  initialDate='1950-01-01';


// Place urls for cvs files here
  var url1 = 'https://www.quandl.com/api/v3/datasets/YAHOO/INDEX_GSPC.csv?api_key=9W5Lmc8yVZxZLm8jAux-';
  var x1SeriesName = 'Date';
  var y1SeriesName = 'Close';
  var y1NameToBeDisplayed = '';
  var y1Mode = 'lines';
  var y1Color = '#4572A7';
  var y1Width = 3;
  var y1Dash = 'solid';

//var url2 = 'https://www.quandl.com/api/v3/datasets/MULTPL/SP500_PE_RATIO_MONTH.csv?api_key=9W5Lmc8yVZxZLm8jAux-&start_date=1898-01-01';
//var x2SeriesName = 'Date';
//var y2SeriesName = 'Value';
//var y2NameToBeDisplayed = 'S&P 500 PE Ratio';
//var y2Mode = 'lines';
//var y2Color = '#92A8CD';
//var y2Width = 2;
//var y2Dash = 'dot';

//var url3 = 'XXXX';
//var url4 = 'XXXX';
//var url5 = 'XXXX';


// Section deals with buttons for time range selection
  var selectorOptions = {
    buttons: [{
      step: 'month',
      stepmode: 'backward',
      count: 1,
      label: '1m',
    }, {
      step: 'month',
      stepmode: 'backward',
      count: 6,
      label: '6m'
    }, {
      step: 'year',
      stepmode: 'todate',
      count: 1,
      label: 'YTD'
    }, {
      step: 'year',
      stepmode: 'backward',
      count: 1,
      label: '1y'
    },{
      step: 'year',
      stepmode: 'backward',
      count: 5,
      label: '5y'
    },{
      step: 'year',
      stepmode: 'backward',
      count: 10,
      label: '10y'
    }, {
      step: 'all',
    }],
    font: {
      family: 'Open Sans, Arial',
      size: 12,
      color: '#0d0d0d'
    },
    xanchor: 'right',
    x: 1
  };

// set layout down here
  var layout = {
    xaxis: {
      rangeselector: selectorOptions,
      rangeslider: {},
      range:[initialDate,currentDate],
      tickfont: {
        family: 'Open Sans, Arial',
        size: 12,
        color: '#0d0d0d'
      }
    },
    yaxis: {
      type: 'log',
      autorange: true,
      //range:[0,50],
      side: 'right',
      tickfont: {
        family: 'Open Sans, Arial',
        size: 12,
        color: '#0d0d0d'
      }
    },
    showlegend: false,
    paper_bgcolor: '#E1E9F0',
    margin: { t: 30, l: 2, r: 100, b: 25 },
    shapes: [
      {
        type: 'rect',
        // x-reference is assigned to the x-values
        xref: 'x',
        // y-reference is assigned to the plot paper [0,1]
        yref: 'paper',
        x0: '1953-07-01',
        y0: 0,
        x1: '1954-08-30',
        y1: 1,
        fillcolor: '#000000',
        opacity: 0.15,
        line: {
          width: 0
        }
      },
      {
        type: 'rect',
        // x-reference is assigned to the x-values
        xref: 'x',
        // y-reference is assigned to the plot paper [0,1]
        yref: 'paper',
        x0: '1957-08-01',
        y0: 0,
        x1: '1958-04-30',
        y1: 1,
        fillcolor: '#000000',
        opacity: 0.15,
        line: {
          width: 0
        }
      },
      {
        type: 'rect',
        // x-reference is assigned to the x-values
        xref: 'x',
        // y-reference is assigned to the plot paper [0,1]
        yref: 'paper',
        x0: '1960-04-01',
        y0: 0,
        x1: '1961-02-28',
        y1: 1,
        fillcolor: '#000000',
        opacity: 0.15,
        line: {
          width: 0
        }
      },
      {
        type: 'rect',
        // x-reference is assigned to the x-values
        xref: 'x',
        // y-reference is assigned to the plot paper [0,1]
        yref: 'paper',
        x0: '1969-12-01',
        y0: 0,
        x1: '1970-11-30',
        y1: 1,
        fillcolor: '#000000',
        opacity: 0.15,
        line: {
          width: 0
        }
      },
      {
        type: 'rect',
        // x-reference is assigned to the x-values
        xref: 'x',
        // y-reference is assigned to the plot paper [0,1]
        yref: 'paper',
        x0: '1973-11-01',
        y0: 0,
        x1: '1975-03-30',
        y1: 1,
        fillcolor: '#000000',
        opacity: 0.15,
        line: {
          width: 0
        }
      },
      {
        type: 'rect',
        // x-reference is assigned to the x-values
        xref: 'x',
        // y-reference is assigned to the plot paper [0,1]
        yref: 'paper',
        x0: '1980-01-01',
        y0: 0,
        x1: '1980-07-30',
        y1: 1,
        fillcolor: '#000000',
        opacity: 0.15,
        line: {
          width: 0
        }
      },
      {
        type: 'rect',
        // x-reference is assigned to the x-values
        xref: 'x',
        // y-reference is assigned to the plot paper [0,1]
        yref: 'paper',
        x0: '1981-07-01',
        y0: 0,
        x1: '1982-11-30',
        y1: 1,
        fillcolor: '#000000',
        opacity: 0.15,
        line: {
          width: 0
        }
      },
      {
        type: 'rect',
        // x-reference is assigned to the x-values
        xref: 'x',
        // y-reference is assigned to the plot paper [0,1]
        yref: 'paper',
        x0: '1990-07-01',
        y0: 0,
        x1: '1991-03-30',
        y1: 1,
        fillcolor: '#000000',
        opacity: 0.15,
        line: {
          width: 0
        }
      },
      {
        type: 'rect',
        // x-reference is assigned to the x-values
        xref: 'x',
        // y-reference is assigned to the plot paper [0,1]
        yref: 'paper',
        x0: '2001-03-01',
        y0: 0,
        x1: '2001-11-30',
        y1: 1,
        fillcolor: '#000000',
        opacity: 0.15,
        line: {
          width: 0
        }
      },
      {
        type: 'rect',
        // x-reference is assigned to the x-values
        xref: 'x',
        // y-reference is assigned to the plot paper [0,1]
        yref: 'paper',
        x0: '2007-12-01',
        y0: 0,
        x1: '2009-06-30',
        y1: 1,
        fillcolor: '#000000',
        opacity: 0.15,
        line: {
          width: 0
        }
      }
    ]
  };

// set display options
  var options = {
    showLink: false,
    displayModeBar: false
  };

// Next piece of code deals with responsiveness
  var d3 = Plotly.d3;
  var WIDTH_IN_PERCENT_OF_PARENT = 100,
    HEIGHT_IN_PERCENT_OF_PARENT = 97;

  var myPlot = document.getElementById(divID);

  var gd3 = d3.select(divIDString)
    .style({
      width: WIDTH_IN_PERCENT_OF_PARENT + '%',
      //'margin-left': (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + '%',
      height: '460px',//HEIGHT_IN_PERCENT_OF_PARENT + 'vh',
      //'margin-top': (100 - HEIGHT_IN_PERCENT_OF_PARENT) / 2 + 'vh'
    });

  var my_Div = gd3.node();

// main code, reads cvs files and creates traces and combine them in data

  function processData(allRows, xLabel, yLabel, yTraceName, yTraceColor, yWidth, yDash) {

    var x = [],
      y = [],
      trace = [];
    // console.log(allRows.length);

    for (var i = 0; i < allRows.length; i++) {
      row = allRows[i];
      x.push(row[xLabel]);
      y.push(row[yLabel]);
      if (i === 0) {
        // console.log(i);
      }
    }
    trace = {
      x: x,
      y: y,
      name: yTraceName,
      mode: 'lines',
      line: {color: yTraceColor,  width: yWidth, dash: yDash },
    };
    //console.log(trace.mode);
    return trace;
  }

  var isUnderRelayout = false;

  Plotly.d3.csv(url1, function(err1, csvData1) {
    // Plotly.d3.csv(url2, function(err2, csvData2) {
    //       Plotly.d3.csv(url3, function(err,csvData3){
    //           Plotly.d3.csv(url4, function(err,csvData4){
    //                Plotly.d3.csv(url5, function(err,csvData5){

    var trace1 = processData(csvData1, x1SeriesName, y1SeriesName, y1NameToBeDisplayed,y1Color,y1Width, y1Dash);
    //var trace2 = processData(csvData2, x2SeriesName, y2SeriesName, y2NameToBeDisplayed,y2Color,y2Width, y2Dash);
    //console.log(err1);
    var data = [trace1];
    Plotly.newPlot(my_Div, data, layout, options);
    // console.log('listoNewPlotOriginal');

    // section updates y axis range on certain events
    myPlot.on('plotly_relayout',function(relayoutData){
      console.log('relayout en myPlot.on',isUnderRelayout);
      console.log(relayoutData);
      if (relayoutData['autosize']===true){
        // do nothing;
      }
      else if (relayoutData['xaxis.autorange']===true){
        console.log('autorange');
        console.log(layout.yaxis);
        var update = {
          'yaxis.autorange': true
        };
        if(!isUnderRelayout){
          Plotly.relayout(my_Div, update)
            .then(() => { isUnderRelayout = false })
        }
        isUnderRelayout = true;
      }
      else {
        var flag=false;
        if (typeof relayoutData['xaxis.range[0]']!== 'undefined' || typeof relayoutData['xaxis.range[1]']!== 'undefined') {
          //console.log(layout);
          //console.log(layout.xaxis.range[1]);
          console.log(typeof relayoutData['xaxis.range[0]']);
          console.log(typeof relayoutData['xaxis.range[1]']);

          if(typeof relayoutData['xaxis.range[0]']!== 'undefined'){
            var x0=  relayoutData['xaxis.range[0]'];
          }
          else {
            var x0= layout.xaxis.range[0];
          }
          if(typeof relayoutData['xaxis.range[1]']!== 'undefined'){
            console.log(44);
            var x1=  relayoutData['xaxis.range[1]'];
          }
          else {
            console.log(55);
            console.log(layout);
            var x1= layout.xaxis.range[1];
          }
          console.log('x0:'+x0+'-x1:'+x1);
          flag = true;
          console.log(11);
        }
        else if (typeof relayoutData['xaxis.range'] !== 'undefined') {
          console.log(12);
          var x0=  relayoutData['xaxis.range'][0];
          var x1=  relayoutData['xaxis.range'][1];
          flag = true;
        }
        if (flag === true) {
          console.log(1);
          var minValue, maxValue;
          //console.log(minValue);
          //console.log(maxValue);
          var i=0,j=0;
          console.log(x0);
          console.log(x1);
          for(i=0; i<data.length; i++){
            var aTrace = data[i];
            console.log(aTrace.x.length);
            for(j=0; j<aTrace.x.length; j++){
              var x= aTrace.x[j];
              //console.log(x);
              if(x>=x0 && x<= x1){
                var aValue = Number(aTrace.y[j]);
                //console.log('aValue'+aValue+',min:'+minValue+',max:'+maxValue);
                if(maxValue===undefined || aValue>maxValue){
                  maxValue = aValue;
                }
                if(minValue===undefined || aValue<minValue){
                  minValue = aValue;
                }
              }
            }
          }
          console.log(minValue);
          console.log(maxValue);
          if(layout.yaxis.type==='linear'){
            var update = {
              'yaxis.range': [minValue, maxValue]//,
              //'yaxis.autorange': false
            };
          }
          else if (layout.yaxis.type==='log'){
            var update = {
              'yaxis.range': [Math.log( (minValue<=0) ? 0.0000001 : minValue)/Math.log(10),
                Math.log(maxValue)/Math.log(10)]
              //'yaxis.autorange': false
            };
          }
          console.log(update);
          if(!isUnderRelayout){
            Plotly.relayout(my_Div, update)
              .then(() => {isUnderRelayout = false})
          }
          isUnderRelayout = true;
        }
      }
    });

  });
//});
//});
//});


  //instruction resizes plot
  window.addEventListener('resize', function() {
    Plotly.Plots.resize(my_Div);
  });



// toogle buttons to change y axis to log or linear

  document.getElementById('linear_'+divID).addEventListener('click', function() {
// alert('linear clicked');
    if (layout.yaxis.type=== 'log'){
      if(!isUnderRelayout) {
        layout.yaxis.type= 'linear';
        var update = {
          'yaxis.type': 'linear'
        };
        Plotly.relayout(my_Div, update)
          .then(() => { isUnderRelayout = false })
      }
      isUnderRelayout = true;
    }
  }, false);

  document.getElementById('log_'+divID).addEventListener('click', function() {
    //  alert('log clicked');
    if (layout.yaxis.type=== 'linear'){
      if(!isUnderRelayout) {
        layout.yaxis.type= 'log';
        var update = {
          'yaxis.type': 'log'
        };
        Plotly.relayout(my_Div, update)
          .then(() => { isUnderRelayout = false })
      }
      isUnderRelayout = true;
    }
  }, false);



}());

// call function above:

sp500_03();