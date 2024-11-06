function elappsedTimeRatio() {
    var now = new Date();
    // 現在時刻を米国時間に合わせる
    var chour = (now.getHours()  -  14 + 24) % 24;
    var cmin = now.getMinutes();
    var now_min = chour * 60 + cmin

    // 夏時間かどうかのフラグ
    var is_summer = false
    var start_min = 9 * 60 + 30
    var end_min   = 16 * 60
    if (is_summer) {
        start_min = 8 * 60 + 30
        end_min   = 15 * 60
    }

    if(!(start_min <= now_min && now_min <= end_min)) {
        return 1.0
    } else {
        return 1.0 * (now_min - start_min) / (end_min - start_min)
    }
}

function toNumber(number_string) {
    without_comma = number_string.replace(",", "")
    if (without_comma.slice(-1) == "k" ) {
        return parseFloat(without_comma.slice(0, without_comma.length - 1)) * 1000
    } else if (without_comma.slice(-1) == "M" ) {
        return parseFloat(without_comma.slice(0, without_comma.length - 1)) * 1000000
    } else {
        return parseFloat(without_comma.slice(0, without_comma.length ))
    }
}


function main() {
    if (location.href.startsWith('https://finance.yahoo.com/portfolio/')) {
        var es = document.querySelectorAll('tr[class^="simpTblRow Bgc($hoverBgColor):h BdB Bdbc($seperatorColor) Bdbc($tableBorderBlue):h H(32px)"]');
        var result = ""
        for (i = 0; i < es.length; i++) {
            symbol = es[i].querySelector('td[aria-label="Symbol"]').querySelector('a[data-test="quoteLink"]').innerHTML
            rawVolumeFinStreamer = es[i].querySelector('td[aria-label="Volume"]').querySelector('fin-streamer')
            // rawVolume の span 要素がなく、直接 innnerHTML で値が入っている場合があるのでその対応
            if (rawVolumeFinStreamer.querySelector('span') == null) {
                rawVolume = rawVolumeFinStreamer.innerHTML
            } else {
                rawVolume = rawVolumeFinStreamer.querySelector('span').innerHTML
            }
            rawAvgVolume = es[i].querySelector('td[aria-label^="Avg Vol"]').innerHTML
            rawChange = es[i].querySelector('td[aria-label="Change"]').querySelector('fin-streamer').querySelector('span').innerHTML
            rawChangePer = es[i].querySelector('td[aria-label^="Chg "]').querySelector('fin-streamer').querySelector('span').innerHTML

            volume = toNumber(rawVolume)
            avg_volume = toNumber(rawAvgVolume)
            change = toNumber(rawChange)

            // 株価が上昇していない場合は除外
            if(change < 0 ) continue

            // 市場の残り時間との比較を行う
            if((1.0 * volume / avg_volume) > elappsedTimeRatio()) {
                // debug 用
                result += symbol + " " + rawChangePer
                result += "\n"
                // 該当要素の背景色をかえる
                es[i].querySelector('td[aria-label="Symbol"]').setAttribute("style", "background: #00ff00")
            }
        }
        alert(result)
    }
}

// ページのロードが終わってから実行する
window.addEventListener("load", main, false);

//main()
