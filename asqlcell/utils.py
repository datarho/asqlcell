import duckdb
import pandas as pd
import numpy as np
import __main__

__DUCKDB = None

def get_duckdb():
    global __DUCKDB
    if not __DUCKDB:
        __DUCKDB = duckdb.connect(database=":memory:", read_only=False)
    return __DUCKDB

def get_duckdb_result(sql, vlist=[]):
    for k, v in get_vars(is_df=True).items():
        get_duckdb().register(k, v)
    df = get_duckdb().execute(sql, vlist).df()
    for k, v in get_vars(is_df=True).items():
        get_duckdb().unregister(k)
    return df

def get_value(variable_name):
    return getattr(__main__, variable_name, None)

def get_vars(is_df=False): 
    vars = {}
    for v in dir(__main__):
        if not is_df or not v.startswith("_") and isinstance(get_value(v), pd.DataFrame):
            vars[v] = get_value(v)
    return vars

def is_type_numeric(dtype):
    #if pd.api.types.is_datetime64_any_dtype(dtype) or pd.api.types.is_timedelta64_dtype(dtype):
    #    return True
    try:
        return np.issubdtype(dtype, np.number)
    except TypeError:
        return False

def get_histogram(df):
    hist = []
    if isinstance(df, pd.DataFrame):
        for column in df:
            col = df[column]
            if (is_type_numeric(col.dtypes)):
                np_array= np.array(col.replace([np.inf, -np.inf], np.nan).dropna())
                y, bins = np.histogram(np_array, bins=10)
                hist.append({"columnName" : column, "dtype" : df.dtypes[column].name,
                    "bins" : [{"bin_start" : bins[i], "bin_end" : bins[i + 1], "count" : count.item()} for i, count in enumerate(y)]})
            else:
                hist.append({"columnName" : column, "dtype" : df.dtypes[column].name})
    return hist

def get_random_data(number = 10):
    return pd.DataFrame(
        data = {
            "id": np.arange(number),
            "price": [i for i in range(number)],
            "normal": [True for i in range(number)]
        },
        index = np.arange(number)
    )