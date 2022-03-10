
const ALPHA_DEMO = "&apikey=demo";
const urlLocal = "http://localhost:3000";
const urlGoogle = "https://maps.googleapis.com/maps/api";
const urlAplha = "https://www.alphavantage.co/query?";
let nomeIndice = ["IBM", "Sony", "Alibaba", "Microsoft", "Xiaomi"];
let indici = ["IBM", "SNE", "BABA", "MSFT", "XIACF"];
let jsonDati = [];
let jsonRicerche = [];
let j = 0;
let stringSearch;
let n = 0;

$(document).ready(function () {

    let scriptGoogle = document.createElement('script');
    scriptGoogle.type = 'text/javascript';
    scriptGoogle.src = urlGoogle + '/js?v=3&key=' + MAP_KEY;;
    document.body.appendChild(scriptGoogle);
    /*

    let scriptAlpha = document.createElement('script');
    scriptAlpha.type = 'text/javascript';
    scriptAlpha.src = urlGoogle + '/js?v=3&key='+ ALPHA_KEY;
    document.body.appendChild(scriptAlpha);
*/
    let _divCerca = $("#divCerca");

    caricaCmb();
    getGlobalQuotes($("#cmbAziende").val());
    $("#btnCerca").addClass("disabled")

    function caricaCmb() {
        let i = 0;
        for (const indice of indici) {
            $("<option>").val(indice).html(nomeIndice[i]).appendTo($("#cmbAziende"))
            i++;
        }
    }

    $("#cmbAziende").on("change", function () {
        getGlobalQuotes($("#cmbAziende").val());
    });

    function datiTabella(data) {

        $("#symbol").text(data["Global Quote"]["01. symbol"]);
        let globalQuoteData = data["Global Quote"];
        $("#previousClose").text(globalQuoteData["08. previous close"] + ' $');
        $("#open").text(globalQuoteData["02. open"] + ' $');
        $("#lastTrade").text(globalQuoteData["05. price"] + ' $');
        $("#lastTradeTime").text(globalQuoteData["07. latest trading day"]);
        $("#change").text(globalQuoteData["09. change"] + ' $');
        $("#daysLow").text(globalQuoteData["04. low"] + ' $');
        $("#daysHigh").text(globalQuoteData["03. high"] + ' $');
        $("#volume").text(globalQuoteData["06. volume"] + ' $');
    }

    function getGlobalQuotes(symbol) {
        let salvato = false;
        let url;
        if (symbol == "IBM")
            url = urlAplha +"function=GLOBAL_QUOTE&symbol=" + symbol+ALPHA_DEMO;
        else
            url = urlAplha + ALPHA_KEY + "&function=GLOBAL_QUOTE&symbol=" + symbol;
        console.log(url)

        for (const azienda of jsonDati) {
            if (azienda["Global Quote"]["01. symbol"] == symbol) {
                datiTabella(azienda)
                salvato = true;
            }
        }
        if (salvato == false) {
            $.getJSON(url, function (data) {
                datiTabella(data);
                jsonDati[j] = data;
                j++;
            });
        }

    }

    $("#txtRicerca").keydown(function (e) {
        if (e.keyCode === 32) {
            e.preventDefault();
            return false;
        }
    })

    $("#txtRicerca").on("input", function () {
        stringSearch = $(this).val()
        _divCerca.html("")
        if ((`${stringSearch.length}`) >= 2) {
            url = urlAplha + ALPHA_KEY + "&function=SYMBOL_SEARCH&keywords=" + stringSearch + ALPHA_KEY;
            $.getJSON(url, function (data) {
                console.log(data.bestMatches)
                generaSuggerimenti(data.bestMatches)
            }).fail(errore)
        }
    }).on("click", function () {
        generaSuggerimenti(jsonRicerche)
    })
    $("#out").on("click", function () {
        _divCerca.html("");
    })

    function generaSuggerimenti(data) {
        n = 0;
        for (const suggestion of data) {
            jsonRicerche[n] = suggestion;
            n++;
            
            let _li = $("<li>").addClass("d-flex flex-row").appendTo(_divCerca)
                .on("click", function () {
                    getGlobalQuotes(suggestion["1. symbol"]);
                    _divCerca.html("");
                }).mouseenter(function () {
                    $("span",this).css("background-color","#949494")
                }).mouseleave(function () {
                    $("span",this).css("background-color","white")
                })
            $("<span>").addClass("d-flex justify-content-start").html(suggestion["1. symbol"]).appendTo(_li)
            $("<span>").addClass("d-flex justify-content-end").html(suggestion["2. name"]).appendTo(_li)
        }
        $("#divCerca>li:nth-child(1)>span:nth-child(1)").css("border-top-left-radius","10px")
        $("#divCerca>li:nth-child(1)>span:nth-child(2)").css("border-top-right-radius","10px")
        $("#divCerca>li:last-child>span:nth-child(1)").css("border-bottom-left-radius","10px")
        $("#divCerca>li:last-child>span:nth-child(2)").css("border-bottom-right-radius","10px")
    }

});


