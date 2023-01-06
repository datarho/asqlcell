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
    return SqlcellWidget(cell, True, line.strip())

@register_line_magic
def sql(line=""):
    return SqlcellWidget(line, True, "").df

__DUCKDB = None

def get_duckdb_connection():
    global __DUCKDB
    if not __DUCKDB:
        __DUCKDB = duckdb.connect(database=":memory:", read_only=False)
    return __DUCKDB

def get_scope_value(variable_name):
    return getattr(__main__, variable_name)

def is_type_numeric(dtype):
    #if pd.api.types.is_datetime64_any_dtype(dtype) or pd.api.types.is_timedelta64_dtype(dtype):
    #    return True
    try:
        return np.issubdtype(dtype, np.number)
    except TypeError:
        return False

def get_dfs():
    dfs = []
    for v in dir(__main__):
        var = get_scope_value(v)
        if not v.startswith("_") and isinstance(var, pd.DataFrame):
            dfs.append((v, var))
    return dfs

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

    def get_histogram(self):
        hist = []
        time1 = datetime.datetime.now() 
        if isinstance(self.df, pd.DataFrame):
            for column in self.df:
                col = self.df[column]
                if (is_type_numeric(col.dtypes)):
                    np_array= np.array(col.replace([np.inf, -np.inf], np.nan).dropna())
                    y, bins = np.histogram(np_array, bins=5)
                    hist.append({"columnName" : column , "bins" : [{"bin_start" : bins[i], "bin_end" : bins[i + 1], "count" : count.item()} for i, count in enumerate(y)]})
        time2 = datetime.datetime.now()
        hist.append({"time1" : str(time1), "time2" : str(time2)})
        return hist

    def run_sql(self):
        self.sql = self.sql.strip()
        if len(self.sql) == 0:
            return
        dfs = get_dfs()
        try:
            for v in dfs:
                get_duckdb_connection().register(v[0], v[1])
            self.df = get_duckdb_connection().execute(self.sql).fetch_df()
            if (len(self.dfname) > 0):
                setattr(__main__, self.dfname, self.df)
            else:
                setattr(__main__, 'sqlcelldf', self.df)
            self.send_df()
        except Exception as r: 
            self.send(("__ERT:" if self.iscommand else "__ERR:") + str(r))
        finally:
            for v in dfs:
                get_duckdb_connection().unregister(v[0])

    def __init__(self, sql='', iscommand=False, dfname=''):
        super(SqlcellWidget, self).__init__()
        self.dfname = dfname
        self.df = None
        self.row_start = 0
        self.row_end = 10
        self.iscommand = iscommand
        self.sql = sql
        self.run_sql()

    @observe('json_dump')
    def on_json_dump(self, change):
        self.send(json.dumps({'dfname' : self.dfname, 'iscommand' : self.iscommand, 'sql' : self.sql, "dfhead" : self.get_histogram()}))

    def send_df(self):
        self.send(("__DFT:" if self.iscommand else "__DFM:") + str(self.df[self.row_start : self.row_end].to_json(orient="split")) + "\n" + str(len(self.df)))

    @observe('dfs_button')
    def on_dfs_button(self, change):
        dfs = get_dfs()
        result = ""
        for v in dfs:
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
        if (sort_ascending == 0):
            self.df.sort_index(axis=0, inplace=True)
        else:
            self.df.sort_values(by=sort_by, ascending=(True if sort_ascending > 0 else False), inplace=True, kind='stable')
        self.send_df()

    @validate('value')
    def on_value(self, change):
        self.sql = str(change["value"])
        return change["value"]

    @validate('output') 
    def on_output(self, change):
        self.dfname = str(change["value"]).strip()
        return self.dfname
