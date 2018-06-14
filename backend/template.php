<?php
  $ppStocks = getConfigValue('ppStocks');
  $ppStocksAvApiKey = getConfigValue('ppStocksAvApiKey');
?>

<h6><?php echo _('ppStocksConfigHeader'); ?></h6>
<div><?php echo _('ppStocksApiKeyHelpDescription'); ?></div>
<input type="text" name="ppStocksAvApiKey" class="ppStocksAvApiKey" id="ppStocksAvApiKey" value="<?php echo $ppStocksAvApiKey;?>" placeholder="">
  <div style="height:0;">
    <div class="validate validate_ppStocksAvKey">valid</div>
    <div class="validate invalid_ppStocksAvKey">invalid av key</div>
  </div>
<br/>

<div><?php echo _('ppStocksConfigHelpDescription'); ?></div>
<div id="ppStocks"></div>

<div id="ppStocksError" style="color:red"></div>
<div id="ppStocksOk" style="color:green"></div><br />

<div class="block__add" id="stocks__edit">
	<button class="ppStocks__edit--button" href="#">
		<span><?php echo _("ppStocksSave"); ?></span>
	</button>
</div>
