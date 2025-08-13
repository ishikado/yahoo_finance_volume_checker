function isNYDST() {
    const now = new Date();
    const timeZone = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        timeZoneName: 'short'
    }).formatToParts(now).find(part => part.type === 'timeZoneName').value;

    return timeZone === "EDT"; // EDTなら夏時間, ESTなら標準時間
}

function elappsedTimeRatio() {
    let now = new Date();
    // 現在時刻を米国時間に合わせる
    let chour = (now.getHours()  -  14 + 24) % 24;
    let cmin = now.getMinutes();
    let now_min = chour * 60 + cmin

    // 夏時間かどうかのフラグ
    let is_summer = isNYDST();
    let start_min = 9 * 60 + 30
    let end_min   = 16 * 60
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
    let without_comma = number_string.replace(",", "").trim()
    // string の先頭に符号がつくことに注意
    // コンマを取る -> 符号を取る -> suffix があれば suffix を取る -> すべてを考慮した数字を計算する
    let without_sign = without_comma
    let is_positive = true
    if(without_comma[0] == '+'){
        without_sign = without_comma.slice(1)
    } else if(without_comma[0] == '-'){
        is_positive = false
        without_sign = without_comma.slice(1)
    }
    let without_suffix = without_sign
    let coef = 1
    if (without_sign[without_sign.length - 1] == "k") {
        without_suffix = without_sign.slice(0, without_sign.length - 1)
        coef = 1000
    } else if (without_sign[without_sign.length - 1] == "M") {
        without_suffix = without_sign.slice(0, without_sign.length - 1)
        coef = 1000 * 1000
    }
    let result = parseFloat(without_suffix) * coef
    if(!is_positive) result *= -1
    return result
}

function check_stock_with_open_link() {
    let results = check_stock()
    for (var symbol of results) {
        let link = "https://finance.yahoo.com/quote/" + symbol + "/chart/"
        window.open(link);
    }
}

function check_stock() {
    let es = document.querySelectorAll('tr[class^="row "]');
    let result = ""
    let symbols = []
    for (i = 0; i < es.length; i++) {
        // yahoo finance 側の要素の並べ方に依存した実装にしている、順番が変わると機能しなくなるので注意
        let symbol = es[i].children[0]
            .querySelector('a[class^="loud-link fin-size-medium "]').innerHTML.trim()

        let tds = es[i].children
        let rawVolume = tds[6].innerHTML
        let rawAvgVolume = tds[8].innerHTML
        let rawChange = tds[3].querySelector('span[class*="base"]').innerHTML
        let rawChangePer = tds[2].querySelector('span[class*="base"]').innerHTML

        let volume = toNumber(rawVolume)
        let avg_volume = toNumber(rawAvgVolume)
        let change = toNumber(rawChange)

        // 株価が上昇していない場合は除外
        if(change < 0 ) continue

        // 市場の残り時間との比較を行う
        if((1.0 * volume / avg_volume) > elappsedTimeRatio()) {
            // debug 用
            result += symbol + " " + rawChangePer
            result += "\n"
            // 該当要素の背景色をかえる
            es[i].setAttribute("style", "background: #00ff00")
            symbols.push(symbol)
        }
    }
    alert(result)
    return symbols
}

function register() {
    // ボタン要素を作成
    let btn = document.createElement("button");

    // ボタンのテキストを設定
    btn.innerHTML = "Start checking";
    btn.onclick = check_stock;
    btn.style.border = "solid 2px";

  //let es = document.querySelectorAll('div[class="container"]');
    let es = document.querySelectorAll('body[id="atomic"]');
    // ボタンを追加
    es[0].prepend(btn);

    // ボタン要素を作成
    let btn2 = document.createElement("button");

    // ボタンのテキストを設定
    btn2.innerHTML = "Start checking with open link";
    btn2.onclick = check_stock_with_open_link;
    btn2.style.border = "solid 2px";

    es[0].prepend(btn2);
}

function main() {
    // ページのロードが終わってから実行する
    window.addEventListener("load", register, false);
}

main()

