from IPython.core.magic import register_cell_magic, register_line_magic
from ipywidgets import DOMWidget
from traitlets import Unicode, Tuple, Int, observe, validate
import duckdb
import pandas as pd
import numpy as np
import json
import __main__
import datetime

module_name = "asqlcell"
module_version = "0.1.0"

@register_cell_magic
def sql(line, cell=''):
    name = line.strip()
    if (len(name) == 0):
        name = 'sqlcelldf'
    return SqlcellWidget(cell, True, name)

@register_line_magic
def sql(line=""):
    return get_duckdb_result(line)

__DUCKDB = None

def get_duckdb_connection():
    global __DUCKDB
    if not __DUCKDB:
        __DUCKDB = duckdb.connect(database=":memory:", read_only=False)
    return __DUCKDB

def get_dfs():
    dfs = []
    for v in dir(__main__):
        var = get_value(v)
        if not v.startswith("_") and isinstance(var, pd.DataFrame):
            dfs.append((v, var))
    return dfs

def get_duckdb_result(sql):
    for v in get_dfs():
        get_duckdb_connection().register(v[0], v[1])
    df = get_duckdb_connection().execute(sql).df()
    for v in get_dfs():
        get_duckdb_connection().unregister(v[0])
    return df

def get_value(variable_name):
    return getattr(__main__, variable_name, None)

def is_type_numeric(dtype):
    #if pd.api.types.is_datetime64_any_dtype(dtype) or pd.api.types.is_timedelta64_dtype(dtype):
    #    return True
    try:
        return np.issubdtype(dtype, np.number)
    except TypeError:
        return False

def get_histogram(sqlcelldf):
    hist = []
    if isinstance(sqlcelldf, pd.DataFrame):
        for column in sqlcelldf:
            col = sqlcelldf[column]
            if (is_type_numeric(col.dtypes)):
                np_array= np.array(col.replace([np.inf, -np.inf], np.nan).dropna())
                y, bins = np.histogram(np_array, bins=10)
                hist.append({"columnName" : column, "dtype" : sqlcelldf.dtypes[column].name,
                    "bins" : [{"bin_start" : bins[i], "bin_end" : bins[i + 1], "count" : count.item()} for i, count in enumerate(y)]})
            else:
                hist.append({"columnName" : column, "dtype" : sqlcelldf.dtypes[column].name})
    return hist

class SqlcellWidget(DOMWidget):
    _model_name = Unicode('SqlCellModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('SqlCellView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    value = Unicode('').tag(sync=True)
    output = Unicode('sqlcelldf').tag(sync=True)
    data_range = Tuple(Int(), Int(), default_value=(0, 10)).tag(sync=True)
    index_sort = Tuple(Unicode(), Int(), default_value=('', 0)).tag(sync=True)
    dfs_button = Unicode('').tag(sync=True)
    sql_button = Unicode('').tag(sync=True)
    json_dump = Unicode('').tag(sync=True)

    def run_sql(self):
        try:
            time1 = datetime.datetime.now()
            setattr(__main__, self.dfname, get_duckdb_result(self.sql))
            time2 = datetime.datetime.now()
            self.send_df(str(time1) + "," + str(time2))
        except Exception as r:
            self.send(("__ERT:" if self.iscommand else "__ERR:") + str(r))

    def __init__(self, sql='', iscommand=False, dfname='sqlcelldf'):
        super(SqlcellWidget, self).__init__()
        self.dfname = dfname
        self.row_start = 0
        self.row_end = 10
        self.iscommand = iscommand
        self.sql = sql
        if (len(sql) > 0):
            self.run_sql()

    @observe('json_dump')
    def on_json_dump(self, change):
        dump = {}
        dump['dfname' ] = self.dfname
        dump['iscommand'] = self.iscommand
        dump['sql'] = self.sql
        dump['dfhead'] = get_histogram(get_value(self.dfname))
        self.send("__JSD:" + str(json.dumps(dump)))

    def send_df(self, tail=""):
        df = get_value(self.dfname)
        self.send(("__DFT:" if self.iscommand else "__DFM:") + 
                str(df[self.row_start : self.row_end].to_json(orient="split", date_format='iso')) + "\n" + 
                    str(len(df)) + "\n" + tail)
    
    @observe('dfs_button')
    def on_dfs_button(self, change):
        result = ""
        for v in get_dfs():
            result += v[0] + "\t" + str(v[1].shape) + "\n"
        self.send("__DFS:" + result)

    @observe('sql_button')
    def on_sql_button(self, change):
        self.run_sql()

    @observe('data_range')
    def on_data_range(self, change):
        self.row_start = change.new[0]
        self.row_end = change.new[1]
        self.send_df()

    @observe('index_sort')
    def on_index_sort(self, change):
        sort_by = change.new[0]
        sort_ascending = change.new[1]
        df = get_value(self.dfname)
        if (sort_ascending == 0):
            df.sort_index(axis=0, inplace=True)
        else:
            df.sort_values(by=sort_by, ascending=(True if sort_ascending > 0 else False), inplace=True, kind='stable')
        self.send_df()

    @validate('value')
    def on_value(self, change):
        self.sql = str(change["value"])
        return change["value"]

    @validate('output') 
    def on_output(self, change):
        self.dfname = str(change["value"]).strip()
        return self.dfname
