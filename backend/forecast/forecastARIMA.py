from ARIMA import ARIMAC
import pandas as pd
from connection import conn
from datetime import date, timedelta


def forecast(currency='USD', period=5):
    sql_command = ''' select date, rate_nb from exchange_rates 
                    where currency_pair_id = (select id from currency_pairs where currency = '{}')
                    order by date;'''.format(currency)
    data = pd.read_sql(sql_command, conn)

    sql_command = ''' select p, d, q from arima_params
                    where currency = '{}'
                    order by date desc;'''.format(currency)
    arima_params = tuple(pd.read_sql(sql_command, conn).to_numpy()[0])

    arima = ARIMAC(data, None, None, 'rate_nb')
    arima.order = arima_params

    rng = pd.date_range(str(date.today() + timedelta(days=1)),
                        periods=period, freq='D')
    df = pd.DataFrame({'date': rng})
    results = arima.predict(df)
    print(results)
    return results
