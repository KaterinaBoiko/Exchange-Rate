import re  # for tuples
import itertools
from sklearn.metrics import mean_squared_error
from statsmodels.tsa.arima_model import ARIMA
import numpy as np
import pandas as pd
import copy
import warnings
warnings.filterwarnings('ignore')


class ARIMAC:
    def __init__(self, data, train_df, test_df, columnname):
        self.len = len(data)
        self.data = data
        self.train = train_df
        self.test = test_df
        self.columnname = columnname
        self.model_fit = ''
        self.order = ''

    def getBestParamsARIMA(self):
        p = range(5, 12)
        q = range(5, 12)
        d = range(0, 2)
        # p = range(9, 10)
        # d = range(0, 1)
        # q = range(6, 7)
        pdq = list(itertools.product(p, d, q))
        params_ = pd.DataFrame()
        for param in pdq:
            try:
                model = ARIMA(self.train[self.columnname], order=param)
                model_fit = model.fit()
                test_ = copy.deepcopy(self.test)
                test_['predicted'] = model_fit.predict(
                    start=len(self.train), end=self.len-1, dynamic=True)
                rmse = np.sqrt(mean_squared_error(
                    test_[self.columnname], test_['predicted']))
                params = pd.DataFrame.from_dict(
                    {'params': [str(param)], 'rmse': [rmse]})
                params_ = pd.concat([params, params_])
            except:
                continue
        print(params_)
        best_params = params_[params_['rmse'] ==
                              params_['rmse'].min()]['params'][0]
        self.order = tuple(map(int, re.findall(r'[0-9]+', best_params)))

    def modelTrain(self):
        model = ARIMA(self.train[self.columnname],
                      order=self.order)
        model_fit = model.fit()
        test_ = pd.DataFrame()
        test_['predicted'] = model_fit.predict(
            start=len(self.train), end=self.len-1, dynamic=True)
        results = copy.deepcopy(self.test)
        results['predicted'] = test_
        return np.sqrt(mean_squared_error(self.test[self.columnname], test_['predicted'])), results

    def predict(self, df):
        test_ = pd.DataFrame()
        model = ARIMA(self.data[self.columnname], order=self.order)
        self.model_fit = model.fit()
        test_['predicted'] = self.model_fit.predict(
            start=self.len, end=self.len+len(df)-1, dynamic=True)
        results = copy.deepcopy(df)
        results['predicted'] = list(test_.predicted)
        return results
