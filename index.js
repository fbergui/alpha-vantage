"use strict"

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
let nomeAzienda = "IBM";
let dataPerformance = {};
let vectGraph = [], vectLabels = [];
let titolo = "";
let geocoder, myChart;
let chart = {}

$(document).ready(function () {

    let scriptGoogle = document.createElement('script');
    scriptGoogle.type = 'text/javascript';
    scriptGoogle.src = urlGoogle + '/js?v=3&key=' + MAP_KEY;
    document.body.appendChild(scriptGoogle);

    let _mappa = $(".modal-body")[0]
    let _divCerca = $("#divCerca");

    caricaCmb();
    getGlobalQuotes($("#cmbAziende").val());
    $("#btnCerca").addClass("disabled")

    function caricaCmb() {
        let i = 0;
        $("<option>").val("no").html("-seleziona azienda consigliata-").appendTo($("#cmbAziende"))
        for (const indice of indici) {
            $("<option>").val(indice).html(nomeIndice[i]).appendTo($("#cmbAziende"))
            i++;
        }
        $("#cmbAziende").prop("selectedIndex", 1)
        let url = urlAplha + "function=SECTOR" + ALPHA_KEY;
        $.getJSON(url, function (data) {
            dataPerformance = data;
            i = 0;
            for (const rank in dataPerformance) {
                if (i != 0) {
                    $("<option>").val(i).html(rank).appendTo($("#cmbPerformance"))
                    i++
                }
                else
                    i++;
            }
            $("#cmbPerformance").prop("selectedIndex", 7)
            caricaGrafico();
        })
    }

    function caricaGrafico() {

        titolo = $("#cmbPerformance>option:selected").text();
        for (const item in dataPerformance[titolo]) {
            vectLabels.push(item);
            let numSplit = parseFloat(dataPerformance[titolo][item].split("%")[0])
            vectGraph.push(numSplit)
        }
        chart = {
            "type": "bar",
            "data": {
                "labels": vectLabels,
                "datasets": [{
                    "label": titolo,
                    "barPercentage": 0.5,
                    "barThickness": 50,
                    "minBarLength": 100,
                    "borderWidth": 2,
                    "data": vectGraph,
                    "backgroundColor": [
                        "rgb(255, 0, 55)",
                        "rgb(0, 137, 228)",
                        "rgb(241, 173, 0)",
                        "rgb(0, 146, 146)",
                        "rgb(46, 0, 138)",
                        "rgb(233, 116, 0)",
                        "rgb(80, 80, 80)",
                        "rgb(0, 131, 0)",
                        "rgb(94, 92, 1)",
                        "rgb(0, 132, 255)",
                        "rgb(56, 0, 0)"
                    ]
                }]
            },
            "options": {
                "scales": {
                    "xAxes": [
                        {
                            "ticks": {
                                "beginAtZero": false
                            }
                        }
                    ]
                }
            }
        }
        let richiesta = inviaRichiesta("PATCH", urlLocal + "/chart", chart)
        richiesta.done(function () {
            richiesta = inviaRichiesta("GET", urlLocal + "/chart")
            richiesta.fail(errore)
            richiesta.done(function (data) {
                let ctx = document.getElementById("myChart").getContext("2d");
                myChart = new Chart(ctx, data);
                vectLabels = []
                vectGraph = []
            })
        })
    }

    $("#cmbAziende").on("change", function () {
        if($("#cmbAziende>option:selected").val()!="no")
        {
            nomeAzienda = $("#cmbAziende>option:selected").text();
            getGlobalQuotes($("#cmbAziende").val());
            $("#btnMappa").removeClass("disabled")
        }
    });

    function datiTabella(data) {
        $("#out>h4>strong>span").text(nomeAzienda)
        $("#symbol").text(data["Global Quote"]["01. symbol"]);
        let globalQuoteData = data["Global Quote"];
        $("#previousClose").text(globalQuoteData["08. previous close"] + ' $');
        $("#open").text(globalQuoteData["02. open"] + ' $');
        $("#lastTrade").text(globalQuoteData["05. price"] + ' $');
        $("#lastTradeTime").text(globalQuoteData["07. latest trading day"]);
        if (globalQuoteData["09. change"] > 0)
            $("#change").text("+ " + globalQuoteData["09. change"] + ' $').addClass("text-success").removeClass("text-danger");
        else
            $("#change").text(globalQuoteData["09. change"] + ' $').addClass("text-danger").removeClass("text-success");

        $("#daysLow").text(globalQuoteData["04. low"] + ' $');
        $("#daysHigh").text(globalQuoteData["03. high"] + ' $');
        $("#volume").text(globalQuoteData["06. volume"] + ' $');
    }

    function getGlobalQuotes(symbol) {
        let salvato = false;
        let url;
        if (symbol == "IBM")
            url = urlAplha + "function=GLOBAL_QUOTE&symbol=" + symbol + ALPHA_DEMO;
        else
            url = urlAplha + ALPHA_KEY + "&function=GLOBAL_QUOTE&symbol=" + symbol;

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
        
        $("#cmbAziende").prop("selectedIndex", 0)
        if ((`${stringSearch.length}`) >= 2) {
            let url = urlAplha + ALPHA_KEY + "&function=SYMBOL_SEARCH&keywords=" + stringSearch + ALPHA_KEY;
            $.getJSON(url, function (data) {
                generaSuggerimenti(data.bestMatches)
            }).fail(errore)
        }
    }).on("click", function () {
        _divCerca.html("");
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
                    nomeAzienda = suggestion["2. name"];
                    getGlobalQuotes(suggestion["1. symbol"]);
                    _divCerca.html("");
                    $("#btnMappa").addClass("disabled")
                }).mouseenter(function () {
                    $("span", this).css("background-color", "#949494")
                }).mouseleave(function () {
                    $("span", this).css("background-color", "white")
                })
            $("<span>").addClass("d-flex justify-content-start").html(suggestion["1. symbol"]).appendTo(_li)
            $("<span>").addClass("d-flex justify-content-end").html(suggestion["2. name"]).appendTo(_li)
        }
        $("#divCerca>li:nth-child(1)>span:nth-child(1)").css("border-top-left-radius", "10px")
        $("#divCerca>li:nth-child(1)>span:nth-child(2)").css("border-top-right-radius", "10px")
        $("#divCerca>li:last-child>span:nth-child(1)").css("border-bottom-left-radius", "10px")
        $("#divCerca>li:last-child>span:nth-child(2)").css("border-bottom-right-radius", "10px")
    }
    $("#cmbPerformance").change(function () {
        myChart.destroy()
        caricaGrafico();
    })
    $('#btnMappa').on('click', function () {
        let url = urlLocal + "/map?nome=" + nomeAzienda;

        $('#mapAzienda').modal('show');
        $.getJSON(url, function (data) {
            let position = new google.maps.LatLng(data[0].coordinate[0], data[0].coordinate[1]);

            let mapOptions = {
                'center': position,
                'zoom': 18,
            };
            let map = new google.maps.Map(_mappa, mapOptions);

            map.setCenter(position);
            new google.maps.Marker({
                map: map,
                position: position
            });
        })
    });
    $("#btnCloseModal").on("click", function () {
        $('#mapAzienda').modal('hide');
    });

});
