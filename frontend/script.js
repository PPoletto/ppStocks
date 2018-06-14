$(document).ready(function () {
	reloadppStocks();
});

function reloadppStocks() {

	var ppStocks = '{"totalCurrency":"EUR","stocks":{"11L1.F":{"currency":"EUR","2018-05-01":{"shares":"40","price":"24.5"}},"AHLA.DE":{"currency":"EUR","2017-12-01":{"shares":"10","price":"148.8"}},"FRE.DE":{"currency":"EUR","2017-12-01":{"shares":"12","price":"60.95"}},"LYPS.DE":{"currency":"EUR","2017-07-11":{"shares":"60","price":"21.9"}},"SQU.F":{"currency":"EUR","2017-06-09":{"shares":"30","price":"77.76"},"2018-06-07":{"shares":"30","price":"84.5"}},"4GLD.SG":{"currency":"EUR","2016-11-14":{"shares":"8","price":"36.5"}}}}'
	//var ppStocks = "<?php echo getConfigValue('ppStocks'); ?>"; //CHANGEME
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
    	//var queryURLQuotes = url + '?function=' + SeriesFunction + '&symbol=' + stock + '&interval=' + interval + '&apikey=' + apikey;
    	var queryURLQuotes = url + '?function=' + SeriesFunction + '&symbol=' + stock + '&apikey=' + apikey;
		//console.log(queryURLQuotes)
		
		$.get(queryURLQuotes).done(function(data)
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
    	    var totalSymbolChange = 0.0
    	    //console.log(ConfigObject.stocks[stock])
    	    $("#ppStocksChartTable").append(symboltr = $('<tr/>'));
    	    $("#ppStocksChartTable tr:last").append("<td>" + stock + "</td>");
    	    $("#ppStocksChartTable tr:last").append("<td>" + lots + "</td>");
    		$("#ppStocksChartTable tr:last").append("<td>" + actualPrice + "</td>");
			$("#ppStocksChartTable tr:last").append("<td>" + dayChange + "</td>");

			for(lot in ConfigObject.stocks[stock])
    	    {      
    	      if(lot != 'currency')
    	      {
    	        var LotShares = ConfigObject.stocks[stock][lot].shares
    	        var buyPrice = ConfigObject.stocks[stock][lot].price
    	        var dayChange = (parseFloat(actualPrice) - parseFloat(buyPrice)).toFixed(2)
    	        var totalLotChange = parseFloat(dayChange*LotShares).toFixed(2)
    	        totalSymbolChange = (parseFloat(totalSymbolChange) + parseFloat(totalLotChange)).toFixed(2)
    	        $("#ppStocksChartTable").append("<tr></tr>");
    	        $("#ppStocksChartTable tr:last").append("<td>" + lot + "</td>");
    	        $("#ppStocksChartTable tr:last").append("<td>" + LotShares + "</td>");
    	  	    $("#ppStocksChartTable tr:last").append("<td>" + buyPrice + "</td>");
    	        $("#ppStocksChartTable tr:last").append("<td>" + dayChange + "</td>");
    	        $("#ppStocksChartTable tr:last").append("<td>" + totalLotChange + "</td>");
    	      }
    	    }
    	    totalChange = (parseFloat(totalChange) + parseFloat(totalSymbolChange)).toFixed(2)
    	    symboltr.append('<td>' + totalSymbolChange + '</td>')
    	    //console.log(totalChange)
		});
	};

	$.get(queryURLQuotes).done(function(data){

	});

	// reload every 5 minutes
	window.setTimeout(function() {
		reloadppStocks();
	}, 300000);
}
