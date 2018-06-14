(function(root, factory) {

  // AMD
  if (typeof define === "function" && define.amd) {
    define(["exports", "jquery"], function(exports, $) {
      return factory(exports, $);
    });
  }
  
  // CommonJS
  else if (typeof exports !== "undefined") {
    var $ = require("jquery");
    factory(exports, $);
  }
  
  // Browser
  else {
    factory(root, (root.jQuery || root.Zepto || root.ender || root.$));
  }
  
  }(this, function(exports, $) {
  
  var patterns = {
    validate: /^[a-z_][a-z0-9_\-\.]*(?:\[(?:\d*|[a-z0-9_\-\.]+)\])*$/i,
    key:      /[a-z0-9_\-\.]+|(?=\[\])/gi,
    push:     /^$/,
    fixed:    /^\d+$/,
    named:    /^[a-z0-9_\-\.]+$/i
  };
  
  function FormSerializer(helper, $form) {
  
    // private variables
    var data     = {},
        pushes   = {};
  
    // private API
    function build(base, key, value) {
      base[key] = value;
      return base;
    }
  
    function makeObject(root, value) {
  
      var keys = root.match(patterns.key), k;
  
      // nest, nest, ..., nest
      while ((k = keys.pop()) !== undefined) {
        // foo[]
        if (patterns.push.test(k)) {
          var idx = incrementPush(root.replace(/\[\]$/, ''));
          value = build([], idx, value);
        }
  
        // foo[n]
        else if (patterns.fixed.test(k)) {
          value = build([], k, value);
        }
  
        // foo; foo[bar]
        else if (patterns.named.test(k)) {
          value = build({}, k, value);
        }
      }
  
      return value;
    }
  
    function incrementPush(key) {
      if (pushes[key] === undefined) {
        pushes[key] = 0;
      }
      return pushes[key]++;
    }
  
    function encode(pair) {
      switch ($('[name="' + pair.name + '"]', $form).attr("type")) {
        case "checkbox":
          return pair.value === "on" ? true : pair.value;
        default:
          return pair.value;
      }
    }
  
    function addPair(pair) {
      if (!patterns.validate.test(pair.name)) return this;
      var obj = makeObject(pair.name, encode(pair));
      data = helper.extend(true, data, obj);
      return this;
    }
  
    function addPairs(pairs) {
      if (!helper.isArray(pairs)) {
        throw new Error("formSerializer.addPairs expects an Array");
      }
      for (var i=0, len=pairs.length; i<len; i++) {
        this.addPair(pairs[i]);
      }
      return this;
    }
  
    function serialize() {
      return data;
    }
  
    function serializeJSON() {
      return JSON.stringify(serialize());
    }
  
    // public API
    this.addPair = addPair;
    this.addPairs = addPairs;
    this.serialize = serialize;
    this.serializeJSON = serializeJSON;
  }
  
  FormSerializer.patterns = patterns;
  
  FormSerializer.serializeObject = function serializeObject() {
    return new FormSerializer($, this).
      addPairs(this.serializeArray()).
      serialize();
  };
  
  FormSerializer.serializeJSON = function serializeJSON() {
    return new FormSerializer($, this).
      addPairs(this.serializeArray()).
      serializeJSON();
  };
  
  //if (typeof $.fn !== "undefined") {
  //  $.fn.serializeObject = FormSerializer.serializeObject;
  //  $.fn.serializeJSON   = FormSerializer.serializeJSON;
  //}
  
  exports.FormSerializer = FormSerializer;
  
  return FormSerializer;
}));

function fillcurrencies(t){  
  $.each(currencies,function(index,currencies){
    $(t).append($('<option/>', {
      value: currencies.code,
      text: currencies.code,
      title: currencies.name
    }))
  })
}

function addLot(t, symbol, date, shares, price){
  t.append(
    r = $('<tr/>').append(
      $('<td/>').append(
        $('<a/>', {
          //href: '#',
          class: 'removeline',
          //text: '+',
          text: '―',
          click: function() {$(this).parents('tr').remove()}
        })
      ),
      $('<td/>').append(
        $('<input/>', {
          type: 'date',
          name: 'stocks[' + symbol + '][' + date + ']',
          //name: 'date',
          title: 'DATE',
          change: function()
          {
            this.name = 'stocks[' + symbol + '][' + this.value + ']'
            r.children('td').find('input[title="SHARES"]').prop('name', 'stocks[' + symbol + '][' + this.value + '][shares]')
            r.children('td').find('input[title="PRICE"]').prop('name', 'stocks[' + symbol + '][' + this.value + '][price]')
          },
          value: date
        }),
      ),
      $('<td/>').append(
        $('<input/>', {
          type: 'number',
          name: 'stocks[' + symbol + '][' + date + '][shares]',
          //name: 'shares',
          title: 'SHARES',
          onkeypress: 'return event.charCode >= 48 && event.charCode <= 57',
          value: shares
        }),
      ),
      $('<td/>').append(
        $('<input/>', {
          type: 'number',
          name: 'stocks[' + symbol + '][' + date + '][price]',
          //name: 'price',
          title: 'PRICE',
          value: price
        }),
      )
    )
  )
  return r
}

function addSymbol(t, symbol, cur, notNew){
  t.append(    
    $('<div/>', {
      class: 'stocksymbol'
    }).append(
      $('<a/>', {
        //href: '#',
        class: 'removeline',
        //text: '+',
        text: '―',
        click: function() {$(this).parent('div').remove()}
      }),
      $('<input/>', {
        type: 'text',
        name: 'stocks[' + symbol + ']',
        title: 'SYMBOL',
        value: symbol,
        change: function()
        {
          this.name = 'stocks[' + this.value + ']'
          $(this).parent('div').find('select').prop('name', 'stocks[' + this.value + '][currency]')
        },
        disabled: notNew
      }),
      $('<select/>', {
        name: 'stocks[' + symbol + '][currency]',
        title: 'CURRENCY'
      }
      ).append(
        function() {
          fillcurrencies(this)
          $(this).val(cur)
        }
      ),
      r = $('<div/>').append(
        $('<table/>').append(
          $('<tr/>').append(
            $('<th/>'),
            $('<th/>', {
              text: 'DATE'
              }
            ),
            $('<th/>', {
              text: 'SHARES'
              }
            ),
            $('<th/>', {
              text: 'PRICE'
              }
            )
          )
        )
      ),
      $('<a/>', {
        text: '+ LOT',
        class: 'addline',
        click: function() {
          $(this).parent('div').find('input[type="text"]').prop('disabled', true);
          addLot($(this).prev('div').children('table'), $(this).parent('div').find('input[type="text"]').val(), (new Date()).toISOString().substring(0, 10), 0, 0)
          //addLot($(this).prev('div').children('table'), $(this).parent('div').find('input[type="text"]').val(), momentDate.format('YYYY-MM-DD'), 0, 0)
        }
      })
    )
  )
  return r
}

$(document).ready(function() {
  currencies = [
  {'code':'AED','name':'United Arab Emirates Dirham'},
  {'code':'AFN','name':'Afghan Afghani'},
  {'code':'ALL','name':'Albanian Lek'},
  {'code':'AMD','name':'Armenian Dram'},
  {'code':'ANG','name':'Netherlands Antillean Guilder'},
  {'code':'AOA','name':'Angolan Kwanza'},
  {'code':'ARS','name':'Argentine Peso'},
  {'code':'AUD','name':'Australian Dollar'},
  {'code':'AWG','name':'Aruban Florin'},
  {'code':'AZN','name':'Azerbaijani Manat'},
  {'code':'BAM','name':'Bosnia-Herzegovina Convertible Mark'},
  {'code':'BBD','name':'Barbadian Dollar'},
  {'code':'BDT','name':'Bangladeshi Taka'},
  {'code':'BGN','name':'Bulgarian Lev'},
  {'code':'BHD','name':'Bahraini Dinar'},
  {'code':'BIF','name':'Burundian Franc'},
  {'code':'BMD','name':'Bermudan Dollar'},
  {'code':'BND','name':'Brunei Dollar'},
  {'code':'BOB','name':'Bolivian Boliviano'},
  {'code':'BRL','name':'Brazilian Real'},
  {'code':'BSD','name':'Bahamian Dollar'},
  {'code':'BTN','name':'Bhutanese Ngultrum'},
  {'code':'BWP','name':'Botswanan Pula'},
  {'code':'BZD','name':'Belize Dollar'},
  {'code':'CAD','name':'Canadian Dollar'},
  {'code':'CDF','name':'Congolese Franc'},
  {'code':'CHF','name':'Swiss Franc'},
  {'code':'CLF','name':'Chilean Unit of Account UF'},
  {'code':'CLP','name':'Chilean Peso'},
  {'code':'CNH','name':'Chinese Yuan Offshore'},
  {'code':'CNY','name':'Chinese Yuan'},
  {'code':'COP','name':'Colombian Peso'},
  {'code':'CUP','name':'Cuban Peso'},
  {'code':'CVE','name':'Cape Verdean Escudo'},
  {'code':'CZK','name':'Czech Republic Koruna'},
  {'code':'DJF','name':'Djiboutian Franc'},
  {'code':'DKK','name':'Danish Krone'},
  {'code':'DOP','name':'Dominican Peso'},
  {'code':'DZD','name':'Algerian Dinar'},
  {'code':'EGP','name':'Egyptian Pound'},
  {'code':'ERN','name':'Eritrean Nakfa'},
  {'code':'ETB','name':'Ethiopian Birr'},
  {'code':'EUR','name':'Euro'},
  {'code':'FJD','name':'Fijian Dollar'},
  {'code':'FKP','name':'Falkland Islands Pound'},
  {'code':'GBP','name':'British Pound Sterling'},
  {'code':'GEL','name':'Georgian Lari'},
  {'code':'GHS','name':'Ghanaian Cedi'},
  {'code':'GIP','name':'Gibraltar Pound'},
  {'code':'GMD','name':'Gambian Dalasi'},
  {'code':'GNF','name':'Guinean Franc'},
  {'code':'GTQ','name':'Guatemalan Quetzal'},
  {'code':'GYD','name':'Guyanaese Dollar'},
  {'code':'HKD','name':'Hong Kong Dollar'},
  {'code':'HNL','name':'Honduran Lempira'},
  {'code':'HRK','name':'Croatian Kuna'},
  {'code':'HTG','name':'Haitian Gourde'},
  {'code':'HUF','name':'Hungarian Forint'},
  {'code':'IDR','name':'Indonesian Rupiah'},
  {'code':'ILS','name':'Israeli New Sheqel'},
  {'code':'INR','name':'Indian Rupee'},
  {'code':'IQD','name':'Iraqi Dinar'},
  {'code':'IRR','name':'Iranian Rial'},
  {'code':'JEP','name':'Jersey Pound'},
  {'code':'JMD','name':'Jamaican Dollar'},
  {'code':'JOD','name':'Jordanian Dinar'},
  {'code':'JPY','name':'Japanese Yen'},
  {'code':'KES','name':'Kenyan Shilling'},
  {'code':'KGS','name':'Kyrgystani Som'},
  {'code':'KHR','name':'Cambodian Riel'},
  {'code':'KMF','name':'Comorian Franc'},
  {'code':'KPW','name':'North Korean Won'},
  {'code':'KRW','name':'South Korean Won'},
  {'code':'KWD','name':'Kuwaiti Dinar'},
  {'code':'KYD','name':'Cayman Islands Dollar'},
  {'code':'KZT','name':'Kazakhstani Tenge'},
  {'code':'LAK','name':'Laotian Kip'},
  {'code':'LBP','name':'Lebanese Pound'},
  {'code':'LKR','name':'Sri Lankan Rupee'},
  {'code':'LRD','name':'Liberian Dollar'},
  {'code':'LSL','name':'Lesotho Loti'},
  {'code':'LYD','name':'Libyan Dinar'},
  {'code':'MAD','name':'Moroccan Dirham'},
  {'code':'MDL','name':'Moldovan Leu'},
  {'code':'MGA','name':'Malagasy Ariary'},
  {'code':'MKD','name':'Macedonian Denar'},
  {'code':'MMK','name':'Myanma Kyat'},
  {'code':'MNT','name':'Mongolian Tugrik'},
  {'code':'MOP','name':'Macanese Pataca'},
  {'code':'MRO','name':'Mauritanian Ouguiya (pre-2018)'},
  {'code':'MRU','name':'Mauritanian Ouguiya'},
  {'code':'MUR','name':'Mauritian Rupee'},
  {'code':'MVR','name':'Maldivian Rufiyaa'},
  {'code':'MWK','name':'Malawian Kwacha'},
  {'code':'MXN','name':'Mexican Peso'},
  {'code':'MYR','name':'Malaysian Ringgit'},
  {'code':'MZN','name':'Mozambican Metical'},
  {'code':'NAD','name':'Namibian Dollar'},
  {'code':'NGN','name':'Nigerian Naira'},
  {'code':'NOK','name':'Norwegian Krone'},
  {'code':'NPR','name':'Nepalese Rupee'},
  {'code':'NZD','name':'New Zealand Dollar'},
  {'code':'OMR','name':'Omani Rial'},
  {'code':'PAB','name':'Panamanian Balboa'},
  {'code':'PEN','name':'Peruvian Nuevo Sol'},
  {'code':'PGK','name':'Papua New Guinean Kina'},
  {'code':'PHP','name':'Philippine Peso'},
  {'code':'PKR','name':'Pakistani Rupee'},
  {'code':'PLN','name':'Polish Zloty'},
  {'code':'PYG','name':'Paraguayan Guarani'},
  {'code':'QAR','name':'Qatari Rial'},
  {'code':'RON','name':'Romanian Leu'},
  {'code':'RSD','name':'Serbian Dinar'},
  {'code':'RUB','name':'Russian Ruble'},
  {'code':'RUR','name':'Old Russian Ruble'},
  {'code':'RWF','name':'Rwandan Franc'},
  {'code':'SAR','name':'Saudi Riyal'},
  {'code':'SBDf','name':'Solomon Islands Dollar'},
  {'code':'SCR','name':'Seychellois Rupee'},
  {'code':'SDG','name':'Sudanese Pound'},
  {'code':'SEK','name':'Swedish Krona'},
  {'code':'SGD','name':'Singapore Dollar'},
  {'code':'SHP','name':'Saint Helena Pound'},
  {'code':'SLL','name':'Sierra Leonean Leone'},
  {'code':'SOS','name':'Somali Shilling'},
  {'code':'SRD','name':'Surinamese Dollar'},
  {'code':'SYP','name':'Syrian Pound'},
  {'code':'SZL','name':'Swazi Lilangeni'},
  {'code':'THB','name':'Thai Baht'},
  {'code':'TJS','name':'Tajikistani Somoni'},
  {'code':'TMT','name':'Turkmenistani Manat'},
  {'code':'TND','name':'Tunisian Dinar'},
  {'code':'TOP','name':'Tongan Pa\'anga'},
  {'code':'TRY','name':'Turkish Lira'},
  {'code':'TTD','name':'Trinidad and Tobago Dollar'},
  {'code':'TWD','name':'New Taiwan Dollar'},
  {'code':'TZS','name':'Tanzanian Shilling'},
  {'code':'UAH','name':'Ukrainian Hryvnia'},
  {'code':'UGX','name':'Ugandan Shilling'},
  {'code':'USD','name':'United States Dollar'},
  {'code':'UYU','name':'Uruguayan Peso'},
  {'code':'UZS','name':'Uzbekistan Som'},
  {'code':'VND','name':'Vietnamese Dong'},
  {'code':'VUV','name':'Vanuatu Vatu'},
  {'code':'WST','name':'Samoan Tala'},
  {'code':'XAF','name':'CFA Franc BEAC'},
  {'code':'XAG','name':'Silver Ounce'},
  {'code':'XAU','name':'Gold Ounce'},
  {'code':'XCD','name':'East Caribbean Dollar'},
  {'code':'XDR','name':'Special Drawing Rights'},
  {'code':'XOF','name':'CFA Franc BCEAO'},
  {'code':'XPF','name':'CFP Franc'},
  {'code':'YER','name':'Yemeni Rial'},
  {'code':'ZAR','name':'South African Rand'},
  {'code':'ZMW','name':'Zambian Kwacha'},
  {'code':'ZWL','name':'Zimbabwean Dollar'}
  ];
  //'<?php echo $ppStocks;?>'
  ppStocks = '{"totalCurrency":"EUR","stocks":{"11L1.F":{"currency":"EUR","2018-05-01":{"shares":"40","price":"24.5"}},"AHLA.DE":{"currency":"EUR","2017-12-01":{"shares":"10","price":"148.8"}},"FRE.DE":{"currency":"EUR","2017-12-01":{"shares":"12","price":"60.95"}},"LYPS.DE":{"currency":"EUR","2017-07-11":{"shares":"60","price":"21.9"}},"SQU.F":{"currency":"EUR","2017-06-09":{"shares":"30","price":"77.76"},"2018-06-07":{"shares":"30","price":"84.5"}},"4GLD.SG":{"currency":"EUR","2016-11-14":{"shares":"8","price":"36.5"}}}}'
  //ppStocks = $ppStocks
  ConfigObject = JSON.parse(ppStocks)

  $form = $('<form/>');
  $form.append(
    $('<a/>', {
      //type: 'button',
      id: 'addsymbol',
      name: 'addsymbol',
      text: '+ SYMBOL',
      class: 'addline',
      click: function() {addSymbol($(this).parent('form'), '', ConfigObject.totalCurrency, false)}
    }),
    $('<select/>', {
      id: 'totalCurrency',
      name: 'totalCurrency'
    }).append(function() {fillcurrencies(this)})
  )
  
  var ppStocksAvApiKey = '<?php echo $ppStocksAvApiKey;?>';
  $('#ppStocksAvApiKey').on('input',function() {
  	var newApiKey = $(this).val();
  	$('.validate_ppStocksAvKey').show();
  	$('.invalid_ppStocksAvKey').hide();
  	if(newApiKey.length > 0) {
  		elem = this;
      $.get('https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=AAPL&apikey=' + newApiKey)
  		.done(function(data) {
  			$('.validate_ppStocksAvKey').hide();
  			if(typeof(data) == 'object') {
  				$.post('setConfigValueAjax.php', {'key' : 'ppStocksAvApiKey', 'value': newApiKey})
  		 		.done(function(data) {
  		 			ppStocksAvApiKey = newApiKey;
  	 				$('#ok').show(30, function() {
  	 					$(this).hide('slow');				
  	 				});
  		 		});
  			} else {
  				$('.invalid_ppStocksAvKey').show();
  			} 
  		})
  		.error(function(data) {
  			$('.validate_ppStocksAvKey').hide();
  			$('.invalid_ppStocksAvKey').show();
  		});
  	} else {
  		$('.validate_ppStocksAvKey').hide();
  	}
  });
  
  $('.ppStocksAvApiKey').focusout(function() {
  	$('.ppStocksAvApiKey').val(ppStocksAvApiKey);
  	$('.invalid_ppStocksAvKey').hide();
  	$('input[value=""]').addClass('error');
  });

  $('#ppStocks').append($form);  
  //console.log($form[0])
  $('#totalCurrency').val(ConfigObject.totalCurrency);

  for(stock in ConfigObject.stocks)
  {
    $symbol = addSymbol($form, stock, ConfigObject.stocks[stock].currency, true)
    for(lot in ConfigObject.stocks[stock])
    {      
      if(lot != 'currency')
      {
        addLot($symbol.children('table'), stock, lot, ConfigObject.stocks[stock][lot].shares, ConfigObject.stocks[stock][lot].price)
      }      
    }
  }
});

$('#stocks__edit').click(function() {
  console.log($form.serializeJSON())
  //$.post('setConfigValueAjax.php', {'key': 'ppStocks', 'value': $form.serializeJSON()});
	$.post('setConfigValueAjax.php', {'key': 'ppStocksOk', 'value': true});

  $.post('setConfigValueAjax.php', {'key': 'reload', 'value': 1});

  $('#ok').show(30, function() {
    $(this).hide('slow');
  });

  $("#ppStocksOk").text("Daten erfolgreich gespeichert");
  $("#ppStocksError").text("");
});
