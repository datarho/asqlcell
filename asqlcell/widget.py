import json
from time import time

from typing import Optional
import pandas as pd
import sqlparse
import altair as alt
from altair import Chart, Y
from IPython.core.interactiveshell import InteractiveShell
from IPython.display import display
from ipywidgets import DOMWidget
from pandas import DataFrame, read_sql
from sqlalchemy import Connection, text
from traitlets import Float, HasTraits, Int, Tuple, Unicode, observe, Bool, Sentinel
from asqlcell.chart import ChartConfig, ChartType, SubChartType

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

    output_var = Unicode().tag(sync=True)

    row_range = Tuple(Int(), Int(), default_value=(0, 10)).tag(sync=True)
    column_color = Unicode().tag(sync=True)
    column_sort = Tuple(Unicode(), Int(), default_value=("", 0)).tag(sync=True)
    title_hist = Unicode().tag(sync=True)
    data_grid = Unicode().tag(sync=True)
    exec_time = Float().tag(sync=True)
    data_name = Unicode().tag(sync=True)
    vis_sql = Tuple(Unicode(), Unicode(), Unicode(), default_value=("", "", "")).tag(sync=True)
    vis_data = Unicode().tag(sync=True)
    quickv_var = Tuple(Unicode(), Unicode(), default_value=("", "")).tag(sync=True)
    quickv_data = Unicode().tag(sync=True)
    cache = Unicode().tag(sync=True)

    need_aggr = Bool().tag(sync=True)
    vega_spec = Unicode().tag(sync=True)
    chart_config = Unicode().tag(sync=True)
    pin_button = Unicode().tag(sync=True)

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
        self.vega_spec = "{}"

        config: ChartConfig = {
            "type": None,
            "x": None,
            "y": None,
            "color": None,
            "theta": None,
            "subtype": [],
        }

        self.chart_config = json.dumps(config)

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
            # self.run_vis_sql()
        except Exception as r:
            raise NoTracebackException(r)

    def set_data_grid(self):
        assert type(self.row_range) is tuple

        df = get_value(self.shell, self.data_name)

        assert type(df) is DataFrame

        self.data_grid = (
            df[self.row_range[0] : self.row_range[1]].to_json(orient="split", date_format="iso") + "\n" + str(len(df))
        )
        df = df[self.row_range[0] : self.row_range[1]].astype(str).apply(pd.to_numeric, errors="coerce")
        df = 1 - (df - df.min()) / (df.max() - df.min())
        df = 150 * df + 105
        self.column_color = df.to_json(orient="split", date_format="iso")

    def _generate_bar(self, config: ChartConfig) -> Optional[Chart]:
        if config["x"] is None or config["y"] is None:
            return None
        d = {"x": config["x"], "y": Y(config["y"])}
        if config["color"] != None:
            d["color"] = config["color"]
        if SubChartType.GROUPED in config["subtype"]:
            d["column"] = config["x"]
        if SubChartType.PERCENT in config["subtype"]:
            d["y"] = d["y"].stack("normalize")
        self.chart = Chart(get_value(self.shell, self.data_name)).mark_bar().encode(**d)
        return self.chart

    def _generate_area(self, config: ChartConfig) -> Optional[Chart]:
        if config["x"] is None or config["y"] is None:
            return None
        d = {"x": config["x"], "y": Y(config["y"])}
        if config["color"] != None:
            d["color"] = config["color"]
        if SubChartType.PERCENT in config["subtype"]:
            d["y"] = d["y"].stack("normalize")
        self.chart = Chart(get_value(self.shell, self.data_name)).mark_area().encode(**d)
        return self.chart

    def _generate_line(self, config: ChartConfig) -> Optional[Chart]:
        if config["x"] is None or config["y"] is None:
            return None
        d = {"x": config["x"], "y": Y(config["y"])}
        if config["color"] != None:
            d["color"] = config["color"]
        return Chart(get_value(self.shell, self.data_name)).mark_line().encode(**d)

    def _generate_point(self, config: ChartConfig) -> Optional[Chart]:
        if config["x"] is None or config["y"] is None:
            return None
        d = {"x": config["x"], "y": Y(config["y"])}
        if config["color"] != None:
            d["color"] = config["color"]
        return Chart(get_value(self.shell, self.data_name)).mark_point().encode(**d)

    def _generate_arc(self, config: ChartConfig) -> Optional[Chart]:
        if config["theta"] is None or config["color"] is None:
            return None
        d = {"theta": config["theta"], "color": Y(config["color"])}
        return Chart(get_value(self.shell, self.data_name)).mark_arc().encode(**d)

    def check_duplicate(self, *args):
        select = ",".join(args)
        group = ",".join([str(i + 1) for i in range(len(args))])
        name = self.data_name
        tmp = get_duckdb_result(self.shell, f"select {select} from {name} group by {group} having count(*) > 1")
        self.need_aggr = len(tmp) > 0

    @observe("pin_button")
    def on_pin_button(self):
        display(self.chart)

    @observe("chart_config")
    def on_chart_config(self, change):
        assert type(self.chart_config) is str

        chart_config: ChartConfig = json.loads(self.chart_config)

        # Check the type of the chart is specified.
        if chart_config["type"] is None:
            return

        # Try to generate vega spec based on config.
        mapping = {
            ChartType.BAR: self._generate_bar,
            ChartType.LINE: self._generate_line,
            ChartType.AREA: self._generate_area,
            ChartType.PIE: self._generate_arc,
            ChartType.SCATTER: self._generate_point,
        }

        self.chart = mapping[chart_config["type"]](chart_config)
        if self.chart is None:
            self.vega_spec = "{}"
            return
        self.vega_spec = json.dumps(self.chart.to_dict())

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

    # def run_vis_sql(self):
    #     assert type(self.data_name) is str
    #     assert type(self.vis_sql) is tuple

    #     try:
    #         get_duckdb().register(self.data_name, get_value(self.shell, self.data_name))
    #         df = get_duckdb().execute(self.vis_sql[0].replace("$$__NAME__$$", self.data_name)).df()
    #         get_duckdb().unregister(self.data_name)
    #         self.vis_data = vega_spec(df, self.vis_sql[1])
    #     except Exception as r:
    #         self.cache = ""
    #         self.vis_data = ""
    #         self.vis_sql = ("", "", "")

    # @observe("vis_sql")
    # def on_vis_sql(self, change):
    #     self.run_vis_sql()

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
