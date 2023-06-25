import json
from time import time

import pandas as pd
import sqlparse
from IPython.core.interactiveshell import InteractiveShell
from ipywidgets import DOMWidget
from pandas import read_sql
from sqlalchemy import Connection, text
from traitlets import Float, HasTraits, Int, Tuple, Unicode, observe

from asqlcell.jinjasql import JinjaSql
from asqlcell.utils import (
    NoTracebackException,
    get_cell_id,
    get_duckdb,
    get_duckdb_result,
    get_histogram,
    get_vars,
    vega_spec,
)

module_name = "asqlcell"
module_version = "0.1.0"


class SqlCellWidget(DOMWidget, HasTraits):
    _model_name = Unicode("SqlCellModel").tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode("SqlCellView").tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    output_var = Unicode("sqlcelldf").tag(sync=True)
    dfs_button = Unicode("").tag(sync=True)
    dfs_result = Unicode("").tag(sync=True)
    sql_button = Unicode("").tag(sync=True)

    row_range = Tuple(Int(), Int(), default_value=(0, 10)).tag(sync=True)
    column_color = Unicode("").tag(sync=True)
    column_sort = Tuple(Unicode(), Int(), default_value=("", 0)).tag(sync=True)
    title_hist = Unicode("").tag(sync=True)
    data_grid = Unicode("").tag(sync=True)
    exec_time = Float(0).tag(sync=True)
    data_name = Unicode("").tag(sync=True)
    vis_sql = Tuple(Unicode(""), Unicode(""), Unicode(""), default_value=("", "", "")).tag(sync=True)
    vis_data = Unicode("").tag(sync=True)
    quickv_var = Tuple(Unicode(""), Unicode(""), default_value=("", "")).tag(sync=True)
    quickv_data = Unicode("").tag(sync=True)
    cache = Unicode("").tag(sync=True)
    png = Unicode("").tag(sync=True)

    def __init__(self, shell: InteractiveShell, sql=""):
        super(SqlCellWidget, self).__init__()

        self.shell = shell

    def _get_value(self, variable_name):
        return self.shell.user_global_ns.get(variable_name)

    def run_sql(self, sql: str, con: Connection = None):
        try:
            if len(self.data_name) == 0:
                self.data_name = "__" + get_cell_id()
            start = time()
            self.row_range = (0, self.row_range[1] - self.row_range[0])
            self.data_grid = ""
            self.title_hist = ""
            self.column_color = ""
            self.column_sort = ("", 0)

            if con is None:
                jsql = JinjaSql(param_style="qmark")
                res, vlist = jsql.prepare_query(sqlparse.format(sql, strip_comments=True, reindent=True), get_vars())
                df = get_duckdb_result(res, vlist)

                self.shell.user_global_ns[self.data_name] = df
            else:
                df = read_sql(sql, con=con)

                self.shell.user_global_ns[self.data_name] = df

            # Calculate time elapsed for running the sql queries.
            self.exec_time = time() - start

            self.title_hist = str(json.dumps(get_histogram(df)))
            self.set_data_grid()
            self.run_vis_sql()

        except Exception as r:
            raise NoTracebackException(r)

    def set_data_grid(self):
        df = self._get_value(self.data_name)
        self.data_grid = (
            str(df[self.row_range[0] : self.row_range[1]].to_json(orient="split", date_format="iso"))
            + "\n"
            + str(len(df))
        )
        df = df[self.row_range[0] : self.row_range[1]].astype(str).apply(pd.to_numeric, errors="coerce")
        df = 1 - (df - df.min()) / (df.max() - df.min())
        df = 150 * df + 105
        self.column_color = df.to_json(orient="split", date_format="iso")

    @observe("dfs_button")
    def on_dfs_button(self, change):
        result = ""
        for k, v in get_vars(is_df=True).items():
            result += k + "\t" + str(v.shape) + "\n"
        self.dfs_result = result

    @observe("sql_button")
    def on_sql_button(self, change):
        self.data_name = self.output_var
        self.run_sql()

    @observe("row_range")
    def on_row_range(self, change):
        self.set_data_grid()

    @observe("column_sort")
    def on_column_sort(self, change):
        df = self._get_value(self.data_name)
        df.sort_index(axis=0, inplace=True)
        if self.column_sort[1] != 0:
            df.sort_values(
                by=self.column_sort[0],
                ascending=(True if self.column_sort[1] > 0 else False),
                inplace=True,
                kind="stable",
            )
        self.set_data_grid()

    def run_vis_sql(self):
        try:
            get_duckdb().register(self.data_name, self._get_value(self.data_name))
            df = get_duckdb().execute(self.vis_sql[0].replace("$$__NAME__$$", self.data_name)).df()
            get_duckdb().unregister(self.data_name)
            self.vis_data = vega_spec(df, self.vis_sql[1])
        except Exception as r:
            self.cache = ""
            self.vis_data = ""
            self.vis_sql = ("", "", "")

    @observe("vis_sql")
    def on_vis_sql(self, change):
        self.run_vis_sql()

    @observe("quickv_var")
    def on_quickv_var(self, change):
        get_duckdb().register(self.data_name, self._get_value(self.data_name))
        tmp = """select "$$__C__$$" from(SELECT *, ROW_NUMBER() OVER () AS index_rn1qaz2wsx FROM $$__NAME__$$)
                using SAMPLE reservoir (100 rows) REPEATABLE(42)
                order by index_rn1qaz2wsx"""
        tmp = tmp.replace("$$__NAME__$$", self.data_name).replace("$$__C__$$", change.new[0])
        df = get_duckdb().execute(tmp).df()
        get_duckdb().unregister(self.data_name)
        self.quickv_data = vega_spec(df, "index_rn1qaz2wsx")
