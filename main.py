"""
指定された銘柄の90日間の平均出来高を計算するやつ
"""

import yfinance as yf


def check(ticker):
    data = yf.download(ticker, period='3mo', interval = "1d", threads = False)
    sum_volume = 0
    today_volume = 0
    first = True
    cnt = 0
    for index, row in data.iterrows():
        #print (index)
        volume = row["Volume"]
        if first:
            first = False
            today_volume = volume
        else:
            cnt += 1
            sum_volume += volume
    avg_volume = sum_volume / cnt
    # for debug
    print ("today_volume = " + str(today_volume))
    print ("avg_volume = " + str(avg_volume))
    return today_volume >= avg_volume
    

def output_url(ticker):
    print (ticker + " https://finance.yahoo.com/quote/" + ticker + "/")

def main():
    ticker = "AAPL"
    if check(ticker):
        output_url(ticker)

main()
