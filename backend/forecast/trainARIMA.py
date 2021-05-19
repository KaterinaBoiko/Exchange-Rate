from ARIMA import ARIMAC
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import sys
from connection import conn
from datetime import date, timedelta


def train(currency='USD'):
    sql_command = ''' select date, rate_nb from exchange_rates 
                    where currency_pair_id = (select id from currency_pairs where currency = '{}')
                    order by date;'''.format(currency)
    data = pd.read_sql(sql_command, conn)

    lendf = len(data)
    train_df = data[:int(lendf*0.995)]
    test_df = data[int(lendf*0.995):]

    arima = ARIMAC(data, train_df, test_df, 'rate_nb')
    arima.getBestParamsARIMA()
    rmse, results = arima.modelTrain()
    print(results)
    print('Best order = {}'.format(arima.order))
    print('RMSE = {}'.format(rmse))

    cursor = conn.cursor()
    cursor.execute('''insert into arima_params (p, d, q, currency, date, rmse)
                    values ({}, {}, {}, '{}', '{}', {}) on conflict do nothing'''
                   .format(arima.order[0], arima.order[1], arima.order[2], currency, str(date.today()), rmse))
    conn.commit()
    cursor.close()

    plt.figure(figsize=(14, 5))
    plt.plot(data['date'], data['rate_nb'])
    plt.plot(results['date'], results['predicted'])
    plt.plot(results['date'], results['rate_nb'])
    plt.show()
