"""
指定された銘柄の90日間の平均出来高を計算するやつ
"""

import yfinance as yf

ticker = "AAPL"
data = yf.download(ticker, period='91d', interval = "1d", threads = False)
sum_volume = 0
today_volume = 0
first = True
cnt = 0
for index, row in data.iterrows():
    volume = row["Volume"]
    if first:
        first = False
        today_volume = volume
    else:
        cnt += 1
        sum_volume += volume

avg_volume = sum_volume / cnt

print ("today_volume = " + str(today_volume))
print ("avg_volume = " + str(avg_volume))
