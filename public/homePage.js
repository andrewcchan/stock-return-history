$(document).ready(
function()
{		
	//var for chart
	var chart;

	//////////////////////////////////////////////////////////////////////////////////
 
  
  //calculate today's date to set the daterangepicker
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  var yyyyOld = yyyy - 1;

  if(dd<10) {
      dd = '0'+dd
  } 

  if(mm<10) {
      mm = '0'+mm
  } 

  today = mm + '/' + dd + '/' + yyyy;
  var oneYearAgo = mm + '/' + dd + '/' + yyyyOld;


  var totalRange = oneYearAgo + " - " + today;
  
  $('input[name="daterange"]').val(totalRange);

  //Set input to use daterangepicker
  $('input[name="daterange"]').daterangepicker();

  //
	$("#submitButton").hover(function(){
        $(this).css({"background-color": "lightgrey", "cursor": "pointer"});
        }, function(){
        $(this).css("background-color", "grey");
    });
	
	$("#submitButton").on( "click", function() {


		var wikiURL = "https://www.quandl.com/api/v3/datasets/WIKI/";
		var apiKey = "dqgc4_9drB6jbTos2Sqt";
		var companyCode = document.getElementById("ticker").value;
		var companyName = "";
		
		//metadata request to set companyName
		
		var xhttpMeta = new XMLHttpRequest();
		var requestURLMeta = wikiURL + companyCode + "/metadata.json?api_key=" + apiKey;
		xhttpMeta.open("GET", requestURLMeta, true);
	    xhttpMeta.send();
		xhttpMeta.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) 
      {
        var jsonDataMeta = JSON.parse( this.responseText);
        
        
        //Makes sure there is data
        if(jsonDataMeta.dataset.name.length)
        {
          companyPreprocessedName = jsonDataMeta.dataset.name;
          companyName = companyPreprocessedName.replace('Prices, Dividends, Splits and Trading Volume','Closing Prices');
        }
      }
		}

		//dataRequest
		var dateRange = document.getElementById("dateRange").value;
		
		var startDate = dateRange.substring(6,10) + "-" + dateRange.substring(0,2) + "-" + dateRange.substring(3,5);
		
    var endDate = dateRange.substring(19,23) + "-" + dateRange.substring(13,15) + "-" + dateRange.substring(16,18);
    
    //NEW using alpha reference
    //https://www.alphavantage.co/
    var apiKeyAV = "IO6HHQFO91UUGIFZ";
    

    var xhttp = new XMLHttpRequest();
		var requestURL = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="+companyCode+"&outputsize=full&apikey=IO6HHQFO91UUGIFZ";
		xhttp.open("GET", requestURL, true);
	    xhttp.send();
		xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) 
      {
        var jsonData = JSON.parse( this.responseText);
        //Makes sure there is data
        //https://stackoverflow.com/questions/4044845/retrieving-a-property-of-a-json-object-by-index


        //GET START AND END INDEXES

        if(jsonData["Time Series (Daily)"][startDate]!=null)//means there is actual data for that date
        {          
        }
        else //for now subtract 2 days if it returns undefined
        {
          startDate = dateRange.substring(6,10) + "-" + dateRange.substring(0,2) + "-" + (Number(dateRange.substring(3,5))-2).toString();
        }

        if(jsonData["Time Series (Daily)"][endDate]!=null)//means there is actual data for that date
        {
        }
        else //for now subtract 2 days if it returns undefined
        {
          endDate = dateRange.substring(19,23) + "-" + dateRange.substring(13,15) + "-" + (Number(dateRange.substring(16,18))-2).toString();
        }


        var startDateObject = new Date(startDate+" 00:00");
        var endDateObject = new Date(endDate+" 00:00");
        var numDays  = (endDateObject.getTime()-startDateObject.getTime())/8.64e+7;

        //construct the graph
        var tIncrement = [];
        var stockData = [];
        var currentDate = startDateObject;
        //https://stackoverflow.com/questions/3674539/incrementing-a-date-in-javascript
        for(var i = 0; i< numDays; i++)//index 0 is the most current date
        {
          if(jsonData["Time Series (Daily)"][currentDate.toISOString().substring(0,10)]!=null){ 
            tIncrement.push(currentDate.toISOString().substring(0,10));//ISOString needed to get YYYY-MM-DD https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
            stockData.push(Number(jsonData["Time Series (Daily)"][currentDate.toISOString().substring(0,10)]["4. close"])); //must cast string to num else regression won't work!
          }
          currentDate.setDate(currentDate.getDate()+1);
        }
        var initialVal = stockData[0];
				var finalVal = stockData[stockData.length-1];
				
				var returnVal = Number((finalVal-initialVal)/initialVal*100).toFixed(2);
				document.getElementById("companyName").innerHTML = "<h2>" + companyName + "</h2>";
				document.getElementById("returnVal").innerHTML = "<h3> Percent Return: " + returnVal + "% </h3>";
				document.getElementById("citationQuandl").innerHTML = "<h6>Data from <a href=\"https://www.alphavantage.co/\"> Alphavantage </a> prices</h6>";
				//destroy old chart data first https://stackoverflow.com/questions/42788924/chartjs-bar-chart-showing-old-data-when-hovering
				if (chart) {
					chart.destroy();
				}

				//create x data from stockData from 0 to stockData.length
				var xData = [];
				for(var i = 0; i<stockData.length;i++)
				{
					xData.push(i);
				}				

        ///////////////////////////////////////////////////
        //test express
        //https://api.jquery.com/jQuery.post/
        $.post("/api/foo", { xData: xData, stockData: stockData }).done( function(data) {
          console.log( "m: ", data.m, "b: ", data.b );

          //calculate regression slope and interecept
          var m = data.m;
          var b = data.b;

          //create regression curve from regression equations
          var regressionCurveArr = [];
          for(var x = 0; x<stockData.length;x++)
          {
            regressionCurveArr.push(m*x+b);
          }

          var stockCurveDataset = {
            data: stockData,
            label: "Closing Price ($)",
            pointBackgroundColor:  'rgb(255, 255, 255)',
            pointRadius: 2,
            borderColor: 'rgb(255, 255, 255)',	
            backgroundColor: 'rgba(220,220,220,0.3)'					
          }
          
          var regressionCurveDataset = {
            data: regressionCurveArr,
            label: "Regression Curve ($)",
            pointBackgroundColor:  'rgb(72, 209, 204)',
            pointRadius: 1,					
            borderColor: 'rgb(72, 209, 204)'
          };
          var ctx = document.getElementById('myChart').getContext('2d');
            chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
              labels: tIncrement,
              datasets: [stockCurveDataset,regressionCurveDataset]
            },

            // Configuration options go here
            options: {
              
              legend: {
                display: true,
                position: 'left',
                labels:{
                  fontColor: '#ffffff'								
                }
              },
              scales:{
                xAxes: [{
                  gridLines:{
                    color: 'rgb(192, 192, 192)'
                  },
                  ticks:{
                    fontColor: 'rgb(192, 192, 192)'
                  }
                }],
                yAxes: [{
                  gridLines:{
                    color: 'rgb(192, 192, 192)'
                  },
                  ticks:{
                    fontColor: 'rgb(192, 192, 192)'
                  }
                }]
              },
              tooltips: {
                mode: 'nearest',
                intersect: false
              }
              
            }
          });

          //onclick
          var canvas = document.getElementById("myChart");
          canvas.onclick = function(evt){
          var activePoints = chart.getElementsAtEvent(evt);
          // => activePoints is an array of points on the canvas that are at the same position as the click event.
          if (activePoints[0]) {
            var label = chart.data.labels[activePoints[0]._index];
            console.log("label: " + label);
            var value = chart.data.datasets[activePoints[0]._datasetIndex].data[activePoints[0]._index];
            console.log("value: " + value);
          }
          };
        });
      }
    }
    ////////////////////////////////////////////////////


  

	});
	
});

//open tab logic
function openTab(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


var sp500Ticker = [
  {
    "Ticker": "A"
  },
  {
    "Ticker": "AAL"
  },
  {
    "Ticker": "AAP"
  },
  {
    "Ticker": "AAPL"
  },
  {
    "Ticker": "ABBV"
  },
  {
    "Ticker": "ABC"
  },
  {
    "Ticker": "ABT"
  },
  {
    "Ticker": "ACN"
  },
  {
    "Ticker": "ADBE"
  },
  {
    "Ticker": "ADI"
  },
  {
    "Ticker": "ADM"
  },
  {
    "Ticker": "ADP"
  },
  {
    "Ticker": "ADS"
  },
  {
    "Ticker": "ADSK"
  },
  {
    "Ticker": "AEE"
  },
  {
    "Ticker": "AEP"
  },
  {
    "Ticker": "AES"
  },
  {
    "Ticker": "AET"
  },
  {
    "Ticker": "AFL"
  },
  {
    "Ticker": "AGN"
  },
  {
    "Ticker": "AIG"
  },
  {
    "Ticker": "AIV"
  },
  {
    "Ticker": "AIZ"
  },
  {
    "Ticker": "AJG"
  },
  {
    "Ticker": "AKAM"
  },
  {
    "Ticker": "ALB"
  },
  {
    "Ticker": "ALGN"
  },
  {
    "Ticker": "ALK"
  },
  {
    "Ticker": "ALL"
  },
  {
    "Ticker": "ALLE"
  },
  {
    "Ticker": "ALXN"
  },
  {
    "Ticker": "AMAT"
  },
  {
    "Ticker": "AMD"
  },
  {
    "Ticker": "AME"
  },
  {
    "Ticker": "AMG"
  },
  {
    "Ticker": "AMGN"
  },
  {
    "Ticker": "AMP"
  },
  {
    "Ticker": "AMT"
  },
  {
    "Ticker": "AMZN"
  },
  {
    "Ticker": "ANDV"
  },
  {
    "Ticker": "ANSS"
  },
  {
    "Ticker": "ANTM"
  },
  {
    "Ticker": "AON"
  },
  {
    "Ticker": "AOS"
  },
  {
    "Ticker": "APA"
  },
  {
    "Ticker": "APC"
  },
  {
    "Ticker": "APD"
  },
  {
    "Ticker": "APH"
  },
  {
    "Ticker": "APTV"
  },
  {
    "Ticker": "ARE"
  },
  {
    "Ticker": "ARNC"
  },
  {
    "Ticker": "ATVI"
  },
  {
    "Ticker": "AVB"
  },
  {
    "Ticker": "AVGO"
  },
  {
    "Ticker": "AVY"
  },
  {
    "Ticker": "AWK"
  },
  {
    "Ticker": "AXP"
  },
  {
    "Ticker": "AYI"
  },
  {
    "Ticker": "AZO"
  },
  {
    "Ticker": "BA"
  },
  {
    "Ticker": "BAC"
  },
  {
    "Ticker": "BAX"
  },
  {
    "Ticker": "BBT"
  },
  {
    "Ticker": "BBY"
  },
  {
    "Ticker": "BCR"
  },
  {
    "Ticker": "BDX"
  },
  {
    "Ticker": "BEN"
  },
  {
    "Ticker": "BF.B"
  },
  {
    "Ticker": "BHF"
  },
  {
    "Ticker": "BHGE"
  },
  {
    "Ticker": "BIIB"
  },
  {
    "Ticker": "BK"
  },
  {
    "Ticker": "BLK"
  },
  {
    "Ticker": "BLL"
  },
  {
    "Ticker": "BMY"
  },
  {
    "Ticker": "BRK.B"
  },
  {
    "Ticker": "BSX"
  },
  {
    "Ticker": "BWA"
  },
  {
    "Ticker": "BXP"
  },
  {
    "Ticker": "C"
  },
  {
    "Ticker": "CA"
  },
  {
    "Ticker": "CAG"
  },
  {
    "Ticker": "CAH"
  },
  {
    "Ticker": "CAT"
  },
  {
    "Ticker": "CB"
  },
  {
    "Ticker": "CBG"
  },
  {
    "Ticker": "CBOE"
  },
  {
    "Ticker": "CBS"
  },
  {
    "Ticker": "CCI"
  },
  {
    "Ticker": "CCL"
  },
  {
    "Ticker": "CDNS"
  },
  {
    "Ticker": "CELG"
  },
  {
    "Ticker": "CERN"
  },
  {
    "Ticker": "CF"
  },
  {
    "Ticker": "CFG"
  },
  {
    "Ticker": "CHD"
  },
  {
    "Ticker": "CHK"
  },
  {
    "Ticker": "CHRW"
  },
  {
    "Ticker": "CHTR"
  },
  {
    "Ticker": "CI"
  },
  {
    "Ticker": "CINF"
  },
  {
    "Ticker": "CL"
  },
  {
    "Ticker": "CLX"
  },
  {
    "Ticker": "CMA"
  },
  {
    "Ticker": "CMCSA"
  },
  {
    "Ticker": "CME"
  },
  {
    "Ticker": "CMG"
  },
  {
    "Ticker": "CMI"
  },
  {
    "Ticker": "CMS"
  },
  {
    "Ticker": "CNC"
  },
  {
    "Ticker": "CNP"
  },
  {
    "Ticker": "COF"
  },
  {
    "Ticker": "COG"
  },
  {
    "Ticker": "COL"
  },
  {
    "Ticker": "COO"
  },
  {
    "Ticker": "COP"
  },
  {
    "Ticker": "COST"
  },
  {
    "Ticker": "COTY"
  },
  {
    "Ticker": "CPB"
  },
  {
    "Ticker": "CRM"
  },
  {
    "Ticker": "CSCO"
  },
  {
    "Ticker": "CSRA"
  },
  {
    "Ticker": "CSX"
  },
  {
    "Ticker": "CTAS"
  },
  {
    "Ticker": "CTL"
  },
  {
    "Ticker": "CTSH"
  },
  {
    "Ticker": "CTXS"
  },
  {
    "Ticker": "CVS"
  },
  {
    "Ticker": "CVX"
  },
  {
    "Ticker": "CXO"
  },
  {
    "Ticker": "D"
  },
  {
    "Ticker": "DAL"
  },
  {
    "Ticker": "DE"
  },
  {
    "Ticker": "DFS"
  },
  {
    "Ticker": "DG"
  },
  {
    "Ticker": "DGX"
  },
  {
    "Ticker": "DHI"
  },
  {
    "Ticker": "DHR"
  },
  {
    "Ticker": "DIS"
  },
  {
    "Ticker": "DISCA"
  },
  {
    "Ticker": "DISCK"
  },
  {
    "Ticker": "DISH"
  },
  {
    "Ticker": "DLR"
  },
  {
    "Ticker": "DLTR"
  },
  {
    "Ticker": "DOV"
  },
  {
    "Ticker": "DPS"
  },
  {
    "Ticker": "DRE"
  },
  {
    "Ticker": "DRI"
  },
  {
    "Ticker": "DTE"
  },
  {
    "Ticker": "DUK"
  },
  {
    "Ticker": "DVA"
  },
  {
    "Ticker": "DVN"
  },
  {
    "Ticker": "DWDP"
  },
  {
    "Ticker": "DXC"
  },
  {
    "Ticker": "EA"
  },
  {
    "Ticker": "EBAY"
  },
  {
    "Ticker": "ECL"
  },
  {
    "Ticker": "ED"
  },
  {
    "Ticker": "EFX"
  },
  {
    "Ticker": "EIX"
  },
  {
    "Ticker": "EL"
  },
  {
    "Ticker": "EMN"
  },
  {
    "Ticker": "EMR"
  },
  {
    "Ticker": "EOG"
  },
  {
    "Ticker": "EQIX"
  },
  {
    "Ticker": "EQR"
  },
  {
    "Ticker": "EQT"
  },
  {
    "Ticker": "ES"
  },
  {
    "Ticker": "ESRX"
  },
  {
    "Ticker": "ESS"
  },
  {
    "Ticker": "ETFC"
  },
  {
    "Ticker": "ETN"
  },
  {
    "Ticker": "ETR"
  },
  {
    "Ticker": "EVHC"
  },
  {
    "Ticker": "EW"
  },
  {
    "Ticker": "EXC"
  },
  {
    "Ticker": "EXPD"
  },
  {
    "Ticker": "EXPE"
  },
  {
    "Ticker": "EXR"
  },
  {
    "Ticker": "F"
  },
  {
    "Ticker": "FAST"
  },
  {
    "Ticker": "FB"
  },
  {
    "Ticker": "FBHS"
  },
  {
    "Ticker": "FCX"
  },
  {
    "Ticker": "FDX"
  },
  {
    "Ticker": "FE"
  },
  {
    "Ticker": "FFIV"
  },
  {
    "Ticker": "FIS"
  },
  {
    "Ticker": "FISV"
  },
  {
    "Ticker": "FITB"
  },
  {
    "Ticker": "FL"
  },
  {
    "Ticker": "FLIR"
  },
  {
    "Ticker": "FLR"
  },
  {
    "Ticker": "FLS"
  },
  {
    "Ticker": "FMC"
  },
  {
    "Ticker": "FOX"
  },
  {
    "Ticker": "FOXA"
  },
  {
    "Ticker": "FRT"
  },
  {
    "Ticker": "FTI"
  },
  {
    "Ticker": "FTV"
  },
  {
    "Ticker": "GD"
  },
  {
    "Ticker": "GE"
  },
  {
    "Ticker": "GGP"
  },
  {
    "Ticker": "GILD"
  },
  {
    "Ticker": "GIS"
  },
  {
    "Ticker": "GLW"
  },
  {
    "Ticker": "GM"
  },
  {
    "Ticker": "GOOG"
  },
  {
    "Ticker": "GOOGL"
  },
  {
    "Ticker": "GPC"
  },
  {
    "Ticker": "GPN"
  },
  {
    "Ticker": "GPS"
  },
  {
    "Ticker": "GRMN"
  },
  {
    "Ticker": "GS"
  },
  {
    "Ticker": "GT"
  },
  {
    "Ticker": "GWW"
  },
  {
    "Ticker": "HAL"
  },
  {
    "Ticker": "HAS"
  },
  {
    "Ticker": "HBAN"
  },
  {
    "Ticker": "HBI"
  },
  {
    "Ticker": "HCA"
  },
  {
    "Ticker": "HCN"
  },
  {
    "Ticker": "HCP"
  },
  {
    "Ticker": "HD"
  },
  {
    "Ticker": "HES"
  },
  {
    "Ticker": "HIG"
  },
  {
    "Ticker": "HLT"
  },
  {
    "Ticker": "HOG"
  },
  {
    "Ticker": "HOLX"
  },
  {
    "Ticker": "HON"
  },
  {
    "Ticker": "HP"
  },
  {
    "Ticker": "HPE"
  },
  {
    "Ticker": "HPQ"
  },
  {
    "Ticker": "HRB"
  },
  {
    "Ticker": "HRL"
  },
  {
    "Ticker": "HRS"
  },
  {
    "Ticker": "HSIC"
  },
  {
    "Ticker": "HST"
  },
  {
    "Ticker": "HSY"
  },
  {
    "Ticker": "HUM"
  },
  {
    "Ticker": "IBM"
  },
  {
    "Ticker": "ICE"
  },
  {
    "Ticker": "IDXX"
  },
  {
    "Ticker": "IFF"
  },
  {
    "Ticker": "ILMN"
  },
  {
    "Ticker": "INCY"
  },
  {
    "Ticker": "INFO"
  },
  {
    "Ticker": "INTC"
  },
  {
    "Ticker": "INTU"
  },
  {
    "Ticker": "IP"
  },
  {
    "Ticker": "IPG"
  },
  {
    "Ticker": "IQV"
  },
  {
    "Ticker": "IR"
  },
  {
    "Ticker": "IRM"
  },
  {
    "Ticker": "ISRG"
  },
  {
    "Ticker": "IT"
  },
  {
    "Ticker": "ITW"
  },
  {
    "Ticker": "IVZ"
  },
  {
    "Ticker": "JBHT"
  },
  {
    "Ticker": "JCI"
  },
  {
    "Ticker": "JEC"
  },
  {
    "Ticker": "JNJ"
  },
  {
    "Ticker": "JNPR"
  },
  {
    "Ticker": "JPM"
  },
  {
    "Ticker": "JWN"
  },
  {
    "Ticker": "K"
  },
  {
    "Ticker": "KEY"
  },
  {
    "Ticker": "KHC"
  },
  {
    "Ticker": "KIM"
  },
  {
    "Ticker": "KLAC"
  },
  {
    "Ticker": "KMB"
  },
  {
    "Ticker": "KMI"
  },
  {
    "Ticker": "KMX"
  },
  {
    "Ticker": "KO"
  },
  {
    "Ticker": "KORS"
  },
  {
    "Ticker": "KR"
  },
  {
    "Ticker": "KSS"
  },
  {
    "Ticker": "KSU"
  },
  {
    "Ticker": "L"
  },
  {
    "Ticker": "LB"
  },
  {
    "Ticker": "LEG"
  },
  {
    "Ticker": "LEN"
  },
  {
    "Ticker": "LH"
  },
  {
    "Ticker": "LKQ"
  },
  {
    "Ticker": "LLL"
  },
  {
    "Ticker": "LLY"
  },
  {
    "Ticker": "LMT"
  },
  {
    "Ticker": "LNC"
  },
  {
    "Ticker": "LNT"
  },
  {
    "Ticker": "LOW"
  },
  {
    "Ticker": "LRCX"
  },
  {
    "Ticker": "LUK"
  },
  {
    "Ticker": "LUV"
  },
  {
    "Ticker": "LYB"
  },
  {
    "Ticker": "M"
  },
  {
    "Ticker": "MA"
  },
  {
    "Ticker": "MAA"
  },
  {
    "Ticker": "MAC"
  },
  {
    "Ticker": "MAR"
  },
  {
    "Ticker": "MAS"
  },
  {
    "Ticker": "MAT"
  },
  {
    "Ticker": "MCD"
  },
  {
    "Ticker": "MCHP"
  },
  {
    "Ticker": "MCK"
  },
  {
    "Ticker": "MCO"
  },
  {
    "Ticker": "MDLZ"
  },
  {
    "Ticker": "MDT"
  },
  {
    "Ticker": "MET"
  },
  {
    "Ticker": "MGM"
  },
  {
    "Ticker": "MHK"
  },
  {
    "Ticker": "MKC"
  },
  {
    "Ticker": "MLM"
  },
  {
    "Ticker": "MMC"
  },
  {
    "Ticker": "MMM"
  },
  {
    "Ticker": "MNST"
  },
  {
    "Ticker": "MO"
  },
  {
    "Ticker": "MON"
  },
  {
    "Ticker": "MOS"
  },
  {
    "Ticker": "MPC"
  },
  {
    "Ticker": "MRK"
  },
  {
    "Ticker": "MRO"
  },
  {
    "Ticker": "MS"
  },
  {
    "Ticker": "MSFT"
  },
  {
    "Ticker": "MSI"
  },
  {
    "Ticker": "MTB"
  },
  {
    "Ticker": "MTD"
  },
  {
    "Ticker": "MU"
  },
  {
    "Ticker": "MYL"
  },
  {
    "Ticker": "NAVI"
  },
  {
    "Ticker": "NBL"
  },
  {
    "Ticker": "NCLH"
  },
  {
    "Ticker": "NDAQ"
  },
  {
    "Ticker": "NEE"
  },
  {
    "Ticker": "NEM"
  },
  {
    "Ticker": "NFLX"
  },
  {
    "Ticker": "NFX"
  },
  {
    "Ticker": "NI"
  },
  {
    "Ticker": "NKE"
  },
  {
    "Ticker": "NLSN"
  },
  {
    "Ticker": "NOC"
  },
  {
    "Ticker": "NOV"
  },
  {
    "Ticker": "NRG"
  },
  {
    "Ticker": "NSC"
  },
  {
    "Ticker": "NTAP"
  },
  {
    "Ticker": "NTRS"
  },
  {
    "Ticker": "NUE"
  },
  {
    "Ticker": "NVDA"
  },
  {
    "Ticker": "NWL"
  },
  {
    "Ticker": "NWS"
  },
  {
    "Ticker": "NWSA"
  },
  {
    "Ticker": "O"
  },
  {
    "Ticker": "OKE"
  },
  {
    "Ticker": "OMC"
  },
  {
    "Ticker": "ORCL"
  },
  {
    "Ticker": "ORLY"
  },
  {
    "Ticker": "OXY"
  },
  {
    "Ticker": "PAYX"
  },
  {
    "Ticker": "PBCT"
  },
  {
    "Ticker": "PCAR"
  },
  {
    "Ticker": "PCG"
  },
  {
    "Ticker": "PCLN"
  },
  {
    "Ticker": "PDCO"
  },
  {
    "Ticker": "PEG"
  },
  {
    "Ticker": "PEP"
  },
  {
    "Ticker": "PFE"
  },
  {
    "Ticker": "PFG"
  },
  {
    "Ticker": "PG"
  },
  {
    "Ticker": "PGR"
  },
  {
    "Ticker": "PH"
  },
  {
    "Ticker": "PHM"
  },
  {
    "Ticker": "PKG"
  },
  {
    "Ticker": "PKI"
  },
  {
    "Ticker": "PLD"
  },
  {
    "Ticker": "PM"
  },
  {
    "Ticker": "PNC"
  },
  {
    "Ticker": "PNR"
  },
  {
    "Ticker": "PNW"
  },
  {
    "Ticker": "PPG"
  },
  {
    "Ticker": "PPL"
  },
  {
    "Ticker": "PRGO"
  },
  {
    "Ticker": "PRU"
  },
  {
    "Ticker": "PSA"
  },
  {
    "Ticker": "PSX"
  },
  {
    "Ticker": "PVH"
  },
  {
    "Ticker": "PWR"
  },
  {
    "Ticker": "PX"
  },
  {
    "Ticker": "PXD"
  },
  {
    "Ticker": "PYPL"
  },
  {
    "Ticker": "QCOM"
  },
  {
    "Ticker": "QRVO"
  },
  {
    "Ticker": "RCL"
  },
  {
    "Ticker": "RE"
  },
  {
    "Ticker": "REG"
  },
  {
    "Ticker": "REGN"
  },
  {
    "Ticker": "RF"
  },
  {
    "Ticker": "RHI"
  },
  {
    "Ticker": "RHT"
  },
  {
    "Ticker": "RJF"
  },
  {
    "Ticker": "RL"
  },
  {
    "Ticker": "RMD"
  },
  {
    "Ticker": "ROK"
  },
  {
    "Ticker": "ROP"
  },
  {
    "Ticker": "ROST"
  },
  {
    "Ticker": "RRC"
  },
  {
    "Ticker": "RSG"
  },
  {
    "Ticker": "RTN"
  },
  {
    "Ticker": "SBAC"
  },
  {
    "Ticker": "SBUX"
  },
  {
    "Ticker": "SCG"
  },
  {
    "Ticker": "SCHW"
  },
  {
    "Ticker": "SEE"
  },
  {
    "Ticker": "SHW"
  },
  {
    "Ticker": "SIG"
  },
  {
    "Ticker": "SJM"
  },
  {
    "Ticker": "SLB"
  },
  {
    "Ticker": "SLG"
  },
  {
    "Ticker": "SNA"
  },
  {
    "Ticker": "SNI"
  },
  {
    "Ticker": "SNPS"
  },
  {
    "Ticker": "SO"
  },
  {
    "Ticker": "SPG"
  },
  {
    "Ticker": "SPGI"
  },
  {
    "Ticker": "SRCL"
  },
  {
    "Ticker": "SRE"
  },
  {
    "Ticker": "STI"
  },
  {
    "Ticker": "STT"
  },
  {
    "Ticker": "STX"
  },
  {
    "Ticker": "STZ"
  },
  {
    "Ticker": "SWK"
  },
  {
    "Ticker": "SWKS"
  },
  {
    "Ticker": "SYF"
  },
  {
    "Ticker": "SYK"
  },
  {
    "Ticker": "SYMC"
  },
  {
    "Ticker": "SYY"
  },
  {
    "Ticker": "T"
  },
  {
    "Ticker": "TAP"
  },
  {
    "Ticker": "TDG"
  },
  {
    "Ticker": "TEL"
  },
  {
    "Ticker": "TGT"
  },
  {
    "Ticker": "TIF"
  },
  {
    "Ticker": "TJX"
  },
  {
    "Ticker": "TMK"
  },
  {
    "Ticker": "TMO"
  },
  {
    "Ticker": "TPR"
  },
  {
    "Ticker": "TRIP"
  },
  {
    "Ticker": "TROW"
  },
  {
    "Ticker": "TRV"
  },
  {
    "Ticker": "TSCO"
  },
  {
    "Ticker": "TSN"
  },
  {
    "Ticker": "TSS"
  },
  {
    "Ticker": "TWX"
  },
  {
    "Ticker": "TXN"
  },
  {
    "Ticker": "TXT"
  },
  {
    "Ticker": "UA"
  },
  {
    "Ticker": "UAA"
  },
  {
    "Ticker": "UAL"
  },
  {
    "Ticker": "UDR"
  },
  {
    "Ticker": "UHS"
  },
  {
    "Ticker": "ULTA"
  },
  {
    "Ticker": "UNH"
  },
  {
    "Ticker": "UNM"
  },
  {
    "Ticker": "UNP"
  },
  {
    "Ticker": "UPS"
  },
  {
    "Ticker": "URI"
  },
  {
    "Ticker": "USB"
  },
  {
    "Ticker": "UTX"
  },
  {
    "Ticker": "V"
  },
  {
    "Ticker": "VAR"
  },
  {
    "Ticker": "VFC"
  },
  {
    "Ticker": "VIAB"
  },
  {
    "Ticker": "VLO"
  },
  {
    "Ticker": "VMC"
  },
  {
    "Ticker": "VNO"
  },
  {
    "Ticker": "VRSK"
  },
  {
    "Ticker": "VRSN"
  },
  {
    "Ticker": "VRTX"
  },
  {
    "Ticker": "VTR"
  },
  {
    "Ticker": "VZ"
  },
  {
    "Ticker": "WAT"
  },
  {
    "Ticker": "WBA"
  },
  {
    "Ticker": "WDC"
  },
  {
    "Ticker": "WEC"
  },
  {
    "Ticker": "WFC"
  },
  {
    "Ticker": "WHR"
  },
  {
    "Ticker": "WLTW"
  },
  {
    "Ticker": "WM"
  },
  {
    "Ticker": "WMB"
  },
  {
    "Ticker": "WMT"
  },
  {
    "Ticker": "WRK"
  },
  {
    "Ticker": "WU"
  },
  {
    "Ticker": "WY"
  },
  {
    "Ticker": "WYN"
  },
  {
    "Ticker": "WYNN"
  },
  {
    "Ticker": "XEC"
  },
  {
    "Ticker": "XEL"
  },
  {
    "Ticker": "XL"
  },
  {
    "Ticker": "XLNX"
  },
  {
    "Ticker": "XOM"
  },
  {
    "Ticker": "XRAY"
  },
  {
    "Ticker": "XRX"
  },
  {
    "Ticker": "XYL"
  },
  {
    "Ticker": "YUM"
  },
  {
    "Ticker": "ZBH"
  },
  {
    "Ticker": "ZION"
  },
  {
    "Ticker": "ZTS"
  }
];
