"""
指定された銘柄の90日間の平均出来高を計算するやつ
"""

import yfinance as yf
import time
import sys
import datetime


def calc_elappsed_time_ratio(now_min):
    # TODO: 夏時間も自動で切り替えたい
    # 3月の第二日曜日から11月の第一日曜日までらしい
    is_summer = True
    if is_summer:
        start_min = 8 * 60 + 30
        end_min = 15 * 60
    else:
        start_min = 9 * 60 + 30
        end_min = 16 * 60

    elappsed_time_ratio = 1.0
    if start_min <= now_min and now_min <= end_min:
        elappsed_time_ratio = 1.0 * (end_min - start_min) /  (now_min - start_min)
    return elappsed_time_ratio
    

def check(ticker):
    # TODO: 
    # yf.Ticker(ticker).info とかで平均出来高含めて情報が取れるので、そっちで処理したほうがよさそう
    # 現在の株価も current Price みたいなデータで取れそう？
    data = yf.download(ticker, period='3mo', interval = "1d", threads = False)
    sum_volume = 0
    today_volume = 0
    first = True
    cnt = 0
    for index, row in data.iterrows():
        volume = row["Volume"]
        cnt += 1
        sum_volume += volume

    # TODO: 現在のリアルタイムの出来高が取れるか若干微妙なので調査
    today_volume = row["Volume"]
    sum_volume -= today_volume
    cnt -= 1

    avg_volume = sum_volume / cnt
    
    # ニューヨークのタイムゾーンで現在時刻を取得
    nytimenow = datetime.datetime.now(tz = datetime.timezone(datetime.timedelta(hours=-4)))
    now_min = nytimenow.hour * 60 + nytimenow.minute

    expected_today_volume = calc_elappsed_time_ratio(now_min) * today_volume

    # for debug
    #print (ticker)
    #print ("today_volume = " + str(today_volume))
    #print ("avg_volume = " + str(avg_volume))
    return expected_today_volume >= avg_volume
    

def output_url(ticker):
    print (ticker + " https://finance.yahoo.com/quote/" + ticker + "/")

def main():
    tickers = []
    for line in sys.stdin:
        tickers.append(line.split(",")[0])
    tickers = tickers[1:]
    results = []
    for ticker in tickers:
        # TODO: 株価が取れない場合があるので例外処理を入れたい
        if check(ticker):
            results.append(ticker)
        time.sleep(1)

    for ticker in results:
        output_url(ticker)
    

main()
