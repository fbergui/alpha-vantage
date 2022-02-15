
const apikey="&apikey=N8Z6KN85A1KXUKDG";
const apidemo="&apikey=demo";
const localHost ="http://localhost:3000";
let nomeIndice=["IBM","Sony","Alibaba","Microsoft","Xiaomi"];
let indici=["IBM","MSFT","SNE","BABA","XIACF"];



$(document).ready(function () {

    caricaCmb();


    function caricaCmb() {
        let i=0;
        for (const indice of indici) {
            
            $("<option>").val(indice).html(nomeIndice[i]).appendTo($("#cmbAziende"))
            i++;

        }
    }
    
    getGlobalQuotes($("#cmbAziende").val());

});


function getGlobalQuotes(symbol) {
    let url = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + symbol + apidemo;
    $.getJSON(url,function (data) {
            $("#symbol").text(data["Global Quote"]["01. symbol"]);
            let globalQuoteData = data["Global Quote"];
            $("#previousClose").text(globalQuoteData["08. previous close"]);
            $("#open").text(globalQuoteData["02. open"]);
            $("#lastTrade").text(globalQuoteData["05. price"]);
            $("#lastTradeTime").text(globalQuoteData["07. latest trading day"]);
            $("#change").text(globalQuoteData["09. change"]);
            $("#daysLow").text(globalQuoteData["04. low"]);
            $("#daysHigh").text(globalQuoteData["03. high"]);
            $("#volume").text(globalQuoteData["06. volume"]);
        }
    );
}