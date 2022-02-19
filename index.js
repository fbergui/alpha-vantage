
const apidemo="&apikey=demo";
const localHost ="http://localhost:3000";
let nomeIndice=["IBM","Sony","Alibaba","Microsoft","Xiaomi"];
let indici=["IBM","SNE","BABA","MSFT","XIACF"];
let jsonDati=[];
let j=0;


$(document).ready(function () {

    caricaCmb();
    getGlobalQuotes($("#cmbAziende").val());

    function caricaCmb() {
        let i=0;
        for (const indice of indici) {
            $("<option>").val(indice).html(nomeIndice[i]).appendTo($("#cmbAziende"))
            i++;
        }
    }

    $("#cmbAziende").on("change",function () {
        getGlobalQuotes($("#cmbAziende").val());
    });
    
    function datiTabella(data) {
        
        console.log(jsonDati)
        $("#symbol").text(data["Global Quote"]["01. symbol"]);
        let globalQuoteData = data["Global Quote"];
        $("#previousClose").text(globalQuoteData["08. previous close"]+' $');
        $("#open").text(globalQuoteData["02. open"]+' $');
        $("#lastTrade").text(globalQuoteData["05. price"]+' $');
        $("#lastTradeTime").text(globalQuoteData["07. latest trading day"]);
        $("#change").text(globalQuoteData["09. change"]+' $');
        $("#daysLow").text(globalQuoteData["04. low"]+' $');
        $("#daysHigh").text(globalQuoteData["03. high"]+' $');
        $("#volume").text(globalQuoteData["06. volume"]+' $');
    }

    function getGlobalQuotes(symbol) {
        let salvato=false;
        let url;
        if(symbol=="IBM")
        url = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + symbol + apidemo;
        else
        url = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + symbol + apikey;
        
        for (const azienda of jsonDati) {
            if(azienda["Global Quote"]["01. symbol"]==symbol)
            {
                datiTabella(azienda)
                salvato=true;
            }
        }
        if(salvato==false)
        {
            $.getJSON(url, function (data) {
                datiTabella(data);
                jsonDati[j] = data;
                j++;
            });
        }
        
    }

});


