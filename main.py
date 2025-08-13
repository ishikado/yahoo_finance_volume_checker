"""
指定された銘柄の90日間の平均出来高を計算するやつ
"""

import yfinance as yf
import time
import sys
import datetime
import pytz

# NOTE: テストを書きたい
def is_summer_time(nytimenow):
    return nytimenow.dst() != None and nytimenow.dst().total_seconds() != 0


def calc_elappsed_time_ratio(now_min, is_summer):
    if is_summer:
        start_min = 8 * 60 + 30
        end_min = 15 * 60
    else:
        # NOTE: こちらの動作確認はできていない
        # この関数はテスト可能なのでテストを導入するのがよさそう
        start_min = 9 * 60 + 30
        end_min = 16 * 60

    elappsed_time_ratio = 1.0
    if start_min <= now_min and now_min <= end_min:
        elappsed_time_ratio = 1.0 * (end_min - start_min) /  (now_min - start_min)
    return elappsed_time_ratio
    

def check(ticker, is_summer):
    # TODO: 
    # yf.Ticker(ticker).info とかで平均出来高含めて情報が取れるので、そっちで処理したほうがよさそう
    # 現在の株価も current Price みたいなデータで取れそう？
    data = yf.download(ticker, period='3mo', interval = "1d", threads = False, auto_adjust=True)
    sum_volume = 0
    today_volume = 0
    first = True
    cnt = 0
    for index, row in data.iterrows():
        volume = row["Volume"].iloc[0]
        cnt += 1
        sum_volume += volume
    # TODO: 現在のリアルタイムの出来高が取れるか若干微妙なので調査
    today_volume = row["Volume"].iloc[0]
    sum_volume -= today_volume
    cnt -= 1

    avg_volume = sum_volume / cnt
    
    # ニューヨークのタイムゾーンで現在時刻を取得
    nytimenow = datetime.datetime.now(pytz.timezone('America/New_York'))
    now_min = nytimenow.hour * 60 + nytimenow.minute

    expected_today_volume = calc_elappsed_time_ratio(now_min, is_summer) * today_volume

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
        print (ticker)
        # TODO: 株価が取れない場合があるので例外処理を入れたい
        try:
            if check(ticker, is_summer_time(datetime.datetime.now(pytz.timezone('America/New_York')))):
                results.append(ticker)
        except Exception as e:
            print (e)
            continue
        time.sleep(1)

    for ticker in results:
        output_url(ticker)
    

main()
