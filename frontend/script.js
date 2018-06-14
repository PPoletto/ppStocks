$(document).ready(function () {
	reloadppStocks();
});

function reloadppStocks() 
{
	var ppStocks = '<?php echo getConfigValue("ppStocks"); ?>'; //CHANGEME
	var ConfigObject = JSON.parse(ppStocks)
	const url = 'https://www.alphavantage.co/query';
  //const SeriesFunction = 'TIME_SERIES_INTRADAY'
  const SeriesFunction = 'TIME_SERIES_DAILY'
  //const SeriesType = 'Time Series (60min)'
  const SeriesType = 'Time Series (Daily)'
  const apikey = 'Z6WE754GXPQ3V5PD'
  //const interval = '60min'
	
  $("#ppStocksChartTable").empty();
  $("#ppStocksChartTable").append("<tr></tr>");
  $("#ppStocksChartTable tr:last").append("<th>SYMBOL</th>");
  $("#ppStocksChartTable tr:last").append("<th>LOTS</th>");
  $("#ppStocksChartTable tr:last").append("<th>Price</th>");
	$("#ppStocksChartTable tr:last").append("<th>1D Change</th>");
  $("#ppStocksChartTable tr:last").append("<th>Total Change</th>");
	
	for(stock in ConfigObject.stocks)
  {
    var totalChange = 0.0
    var queryURLQuotes = url + '?function=' + SeriesFunction + '&symbol=' + stock + '&apikey=' + apikey;
		
		$.get(queryURLQuotes).done(function(data)
		{
			if(data['Meta Data'])
			{
			  stock = data['Meta Data']['2. Symbol']
			  var seriesobject = data[SeriesType]
    	  var serieskeys = Object.keys(seriesobject)
    	  var serieslength = serieskeys.length-1
    	  var seriesfirst = seriesobject[serieskeys[serieslength]]
		    var serieslast = seriesobject[serieskeys[0]]
			  var lots = Object.keys(ConfigObject.stocks[stock]).length-1
  
    	  for(serieskey in serieskeys)
    	  {
    	    if(moment(serieskeys[0]).format('YYYY-MM-DD') > moment(serieskeys[serieskey]).format('YYYY-MM-DD'))
    	    {          
    	      if(seriesobject[serieskeys[serieskey]]["1. open"] || seriesobject[serieskeys[serieskey]]["4. close"])
    	      {
    	        seriesbefore = seriesobject[serieskeys[serieskey]]
    	        if(seriesbefore["4. close"] == 0.0)
    	        {
    	          lastPrice = seriesbefore["1. open"]
    	        } else
    	        {
    	          lastPrice = seriesbefore["4. close"]
    	        }
    	        break
    	      }
    	    }
			  }
  
			  if(serieslast["4. close"] == 0.0)
    	  {
    	    var actualPrice = serieslast["1. open"]
    	  } else
    	  {
    	    var actualPrice = serieslast["4. close"]
    	  }
    	  actualPrice = parseFloat(actualPrice).toFixed(2)
				var dayChange = (parseFloat(actualPrice) - parseFloat(lastPrice)).toFixed(2)
				var dayChangePercent = ((parseFloat(actualPrice)/parseFloat(lastPrice)) - 1)*100
    	  var totalSymbolChange = parseFloat(0.0).toFixed(2)
    	  //console.log(ConfigObject.stocks[stock])
    	  $("#ppStocksChartTable").append(symboltr = $('<tr/>'));
    	  $("#ppStocksChartTable tr:last").append("<td>" + stock + "</td>");
    	  $("#ppStocksChartTable tr:last").append("<td>" + lots + "</td>");
        $("#ppStocksChartTable tr:last").append("<td>" + actualPrice + "</td>");
	      $("#ppStocksChartTable tr:last").append("<td bgcolor='" + getColorForPercentage(dayChangePercent) + "'>" + dayChange + "</td>");
			  for(lot in ConfigObject.stocks[stock])
    	  {      
    	    if(lot != 'currency')
    	    {
    	      var LotShares = ConfigObject.stocks[stock][lot].shares
    	      var buyPrice = parseFloat(ConfigObject.stocks[stock][lot].price).toFixed(2)
			  		var dayChange = (parseFloat(actualPrice) - parseFloat(buyPrice)).toFixed(2)
			  		var dayChangePercent = ((parseFloat(actualPrice)/parseFloat(buyPrice)) - 1)*100
    	      var totalLotChange = parseFloat(dayChange*LotShares).toFixed(2)
    	      totalSymbolChange = (parseFloat(totalSymbolChange) + parseFloat(totalLotChange)).toFixed(2)
    	      $("#ppStocksChartTable").append("<tr/>");
    	      $("#ppStocksChartTable tr:last").append("<td>" + lot + "</td>");
    	      $("#ppStocksChartTable tr:last").append("<td>" + LotShares + "</td>");
    	      $("#ppStocksChartTable tr:last").append("<td>" + buyPrice + "</td>");
    	      $("#ppStocksChartTable tr:last").append("<td bgcolor='" + getColorForPercentage(dayChangePercent) + "'>" + dayChange + "</td>");
    	      $("#ppStocksChartTable tr:last").append("<td>" + totalLotChange + "</td>");
    	    }
    	  }
    	  totalChange = (parseFloat(totalChange) + parseFloat(totalSymbolChange)).toFixed(2)
    	  symboltr.append('<td>' + totalSymbolChange + '</td>')
			}
		});
	};

	$.get(queryURLQuotes).done(function(data){

	});

	// reload every 10 minutes
	window.setTimeout(function() {
		reloadppStocks();
	}, 600000);
}

var percentColors = [
	{ pct: -3.0, color: { r: 0xee, g: 0x00, b: 0x00 } },
	{ pct: 0.0, color: { r: 0x00, g: 0x00, b: 0x00 } },
	{ pct: 3.0, color: { r: 0x00, g: 0x99, b: 0x33 } } ];

var	componentToHex = function(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

var getColorForPercentage = function(pct) {
	for (var i = 1; i < percentColors.length - 1; i++) {
			if (pct < percentColors[i].pct) {
					break;
			}
	}
	var lower = percentColors[i - 1];
	var upper = percentColors[i];
	var maxPct = upper.pct+lower.pct
	if(!(pct < percentColors[percentColors.length-1].pct &&
			 pct > percentColors[0].pct)) {
		pct = maxPct
	}
	var range = upper.pct - lower.pct;
	var rangePct = (pct - lower.pct) / range;
	var pctLower = 1 - rangePct;
	var pctUpper = rangePct;
	var color = {
			r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
			g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
			b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
	};
	//return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
	return "#" + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
}