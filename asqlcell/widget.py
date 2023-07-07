import json
from time import time

from typing import Optional
import pandas as pd
import sqlparse
import altair as alt
from IPython.core.interactiveshell import InteractiveShell
from ipywidgets import DOMWidget
from pandas import DataFrame, read_sql
from sqlalchemy import Connection, text
from traitlets import Float, HasTraits, Int, Tuple, Unicode, observe, Bool

from asqlcell.jinjasql import JinjaSql
from asqlcell.utils import (
    NoTracebackException,
    get_cell_id,
    get_duckdb,
    get_duckdb_result,
    get_histogram,
    get_value,
    get_vars,
    set_value,
    vega_spec,
)

module_name = "asqlcell"
module_version = "0.1.0"


class SqlCellWidget(DOMWidget, HasTraits):
    _model_name = Unicode().tag(sync=True)
    _model_module = Unicode().tag(sync=True)
    _model_module_version = Unicode().tag(sync=True)
    _view_name = Unicode().tag(sync=True)
    _view_module = Unicode().tag(sync=True)
    _view_module_version = Unicode().tag(sync=True)

    output_var = Unicode("").tag(sync=True)

    row_range = Tuple(Int(), Int(), default_value=(0, 10)).tag(sync=True)
    column_color = Unicode("").tag(sync=True)
    column_sort = Tuple(Unicode(), Int(), default_value=("", 0)).tag(sync=True)
    title_hist = Unicode("").tag(sync=True)
    data_grid = Unicode("").tag(sync=True)
    exec_time = Float().tag(sync=True)
    data_name = Unicode("").tag(sync=True)
    vis_sql = Tuple(Unicode(), Unicode(), Unicode(), default_value=("", "", "")).tag(sync=True)
    vis_data = Unicode("").tag(sync=True)
    quickv_var = Tuple(Unicode(), Unicode(), default_value=("", "")).tag(sync=True)
    quickv_data = Unicode("").tag(sync=True)
    cache = Unicode("").tag(sync=True)

    # chart_type = Unicode("line").tag(sync=True)
    x_color = Tuple(Unicode(), Unicode(), Unicode(), default_value=("", "", "")).tag(sync=True)
    need_aggr = Bool(False).tag(sync=True)
    chart_to_dict = Unicode("").tag(sync=True)
    chart_config = Unicode("").tag(sync=True)
    pin_button = Unicode("").tag(sync=True)

    def __init__(self, shell: InteractiveShell, sql=""):
        super(SqlCellWidget, self).__init__()
        self.shell = shell

        self._model_name = "SqlCellModel"
        self._model_module = module_name
        self._model_module_version = module_version
        self._view_name = "SqlCellView"
        self._view_module = module_name
        self._view_module_version = module_version

        self.output_var = "sqlcelldf"

    def run_sql(self, sql: str, con: Optional[Connection] = None):
        assert type(self.data_name) is str
        assert type(self.row_range) is tuple

        try:
            if len(self.data_name) == 0:
                self.data_name = "__" + get_cell_id(self.shell)
            start = time()
            self.row_range = (0, self.row_range[1] - self.row_range[0])
            self.data_grid = ""
            self.title_hist = ""
            self.column_color = ""
            self.column_sort = ("", 0)
            if con is None:
                jsql = JinjaSql(param_style="qmark")
                res, vlist = jsql.prepare_query(
                    sqlparse.format(sql, strip_comments=True, reindent=True),
                    get_vars(self.shell),
                )
                set_value(
                    self.shell,
                    self.data_name,
                    get_duckdb_result(self.shell, res, vlist),
                )
            else:
                set_value(self.shell, self.data_name, read_sql(sql, con=con))
            # Calculate time elapsed for running the sql queries.
            self.exec_time = time() - start

            df = get_value(self.shell, self.data_name)
            assert type(df) is DataFrame
            self.title_hist = json.dumps(get_histogram(df))
            self.set_data_grid()
            self.run_vis_sql()
        except Exception as r:
            raise NoTracebackException(r)

    def set_data_grid(self):
        assert type(self.row_range) is tuple

        df = get_value(self.shell, self.data_name)

        assert type(df) is DataFrame

        self.data_grid = (
            str(df[self.row_range[0] : self.row_range[1]].to_json(orient="split", date_format="iso"))
            + "\n"
            + str(len(df))
        )
        df = df[self.row_range[0] : self.row_range[1]].astype(str).apply(pd.to_numeric, errors="coerce")
        df = 1 - (df - df.min()) / (df.max() - df.min())
        df = 150 * df + 105
        self.column_color = df.to_json(orient="split", date_format="iso")

    @observe("x_color")
    def on_x_color(self) -> bool:
        name = self.data_name
        x = self.x_color[0]
        color = self.x_color[1]
        if len(color) == 0:
            tmp = get_duckdb_result(self.shell, f"select {x} from {name} group by 1 having count(*) > 1")
        else:
            tmp = get_duckdb_result(self.shell, f"select {x}, {color} from {name} group by 1, 2 having count(*) > 1")
        self.need_aggr = len(tmp) > 0

    @observe("pin_button")
    def on_pin_button(self):
        display(self.chart)

    @observe("chart_config")
    def on_chart_config(self):
        chart_config = json.loads(self.chart_config)
        config = {}
        config["x"] = chart_config["x"]
        config["y"] = alt.Y(chart_config["y"])
        if len(chart_config["color"]) > 0:
            config["color"] = chart_config["color"]

        chart = alt.Chart(get_value(self.shell, self.data_name))
        if chart_config["type"].find("bar") >= 0:
            chart = chart.mark_bar()
        elif chart_config["type"].find("line") >= 0:
            chart = chart.mark_line()
        elif chart_config["type"].find("area") >= 0:
            chart = chart.mark_area()

        if chart_config["type"].find("grouped") >= 0:
            config["column"] = chart_config["x"]

        if chart_config["type"].find("100") >= 0:
            config["y"] = config["y"].stack("normalize")
        self.chart = chart.encode(**config)
        self.chart_to_dict = json.dumps(self.chart.to_dict())

    @observe("row_range")
    def on_row_range(self):
        self.set_data_grid()

    @observe("column_sort")
    def on_column_sort(self):
        assert type(self.column_sort) is tuple

        df = get_value(self.shell, self.data_name)

        assert type(df) is DataFrame

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
        assert type(self.data_name) is str
        assert type(self.vis_sql) is tuple

        try:
            get_duckdb().register(self.data_name, get_value(self.shell, self.data_name))
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
        assert type(self.data_name) is str

        get_duckdb().register(self.data_name, get_value(self.shell, self.data_name))
        tmp = """select "$$__C__$$" from(SELECT *, ROW_NUMBER() OVER () AS index_rn1qaz2wsx FROM $$__NAME__$$)
                using SAMPLE reservoir (100 rows) REPEATABLE(42)
                order by index_rn1qaz2wsx"""
        tmp = tmp.replace("$$__NAME__$$", self.data_name).replace("$$__C__$$", change.new[0])
        df = get_duckdb().execute(tmp).df()
        get_duckdb().unregister(self.data_name)
        self.quickv_data = vega_spec(df, "index_rn1qaz2wsx")
