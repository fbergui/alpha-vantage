
const apidemo="&apikey=demo";
const localHost ="http://localhost:3000";
let nomeIndice=["IBM","Sony","Alibaba","Microsoft","Xiaomi"];
let indici=["IBM","SNE","BABA","MSFT","XIACF"];
let jsonDati=[];
let jsonRicerche=[];
let j=0;
let stringSearch;
let n=0;

$(document).ready(function () {

    let _divCerca = $("#divCerca");

    caricaCmb();
    getGlobalQuotes($("#cmbAziende").val());
    $("#btnCerca").addClass("disabled")

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

    $("#txtRicerca").keydown(function (e) {
        if(e.keyCode  === 32) 
        {
            e.preventDefault();
            return false;
        }
    })

    $("#txtRicerca").on("keyup",function () {
        stringSearch= $(this).val()
        _divCerca.html("")
        if((`${stringSearch.length}`)>=2)
        {
            url="https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords="+stringSearch+"&apikey=N8Z6KN85A1KXUKDG";
            $.getJSON(url, function (data) {
                generaSuggerimenti(data.bestMatches)
            }).fail(errore)
        }
    }).on("click",function () {
        generaSuggerimenti(jsonRicerche)
    })

    $("<body>").off("click","#txtRicerca",function () {
        _divCerca.html("");
    })
    
    function generaSuggerimenti(data) {
        n=0;
        for (const suggestion of data) {
            jsonRicerche[n]=suggestion;
            n++;
            let _div=  $("<div>").addClass("d-flex flex-row").appendTo(_divCerca).attr("id","ricerca")
                   .on("click",function () {
                       getGlobalQuotes(suggestion["1. symbol"]);
                       _divCerca.html("");
                   })
                   $("<div>").addClass("d-flex justify-content-start").html(suggestion["1. symbol"]).appendTo(_div)
                   $("<div>").addClass("d-flex justify-content-end").html(suggestion["2. name"]).appendTo(_div)
                   /** 
                   $("#divCerca>div:nth-of-type("+n+")").mouseenter(function () {
                       $(this).css("background-color","grey")
                   })*/
        }
    }

});


