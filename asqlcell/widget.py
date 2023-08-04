import datetime
import json
from time import time
from typing import Optional, Union

import pandas as pd
import sqlparse
from altair import Chart, Color, LayerChart, Order, Theta, X, Y
from IPython.core.interactiveshell import InteractiveShell
from IPython.display import update_display
from ipywidgets import DOMWidget
from pandas import DataFrame, read_sql
from sqlalchemy import Connection, text
from traitlets import Bool, Float, HasTraits, Int, Tuple, Unicode, observe

from asqlcell.chart import ChartConfig, ChartType, SubChartType
from asqlcell.jinjasql import JinjaSql
from asqlcell.utils import NoTracebackException, get_duckdb_result, get_histogram, get_value, get_vars, set_value

module_name = "asqlcell"
module_version = "0.1.0"


class SqlCellWidget(DOMWidget, HasTraits):
    _model_name = Unicode().tag(sync=True)
    _model_module = Unicode().tag(sync=True)
    _model_module_version = Unicode().tag(sync=True)
    _view_name = Unicode().tag(sync=True)
    _view_module = Unicode().tag(sync=True)
    _view_module_version = Unicode().tag(sync=True)

    row_range = Tuple(Int(), Int(), default_value=(0, 10)).tag(sync=True)
    column_color = Unicode().tag(sync=True)
    column_sort = Tuple(Unicode(), Int(), default_value=("", 0)).tag(sync=True)
    title_hist = Unicode().tag(sync=True)
    data_grid = Unicode().tag(sync=True)
    exec_time = Float().tag(sync=True)
    data_name = Unicode().tag(sync=True)
    quickview_var = Tuple(Unicode(), Unicode(), default_value=("", "")).tag(sync=True)
    quickview_vega = Unicode().tag(sync=True)
    cache = Unicode().tag(sync=True)

    need_aggr = Bool().tag(sync=True)
    preview_vega = Unicode().tag(sync=True)
    chart_config = Unicode().tag(sync=True)
    persist_vega = Unicode().tag(sync=True)

    def __init__(self, shell: InteractiveShell, cell_id="", sql=""):
        super(SqlCellWidget, self).__init__()
        self.shell = shell
        self.cell_id = cell_id
        self._model_name = "SqlCellModel"
        self._model_module = module_name
        self._model_module_version = module_version
        self._view_name = "SqlCellView"
        self._view_module = module_name
        self._view_module_version = module_version

        self.preview_vega = "{}"
        self.quickview_vega = "{}"

        config: ChartConfig = {
            "type": None,
            "x": None,
            "y": None,
            "color": None,
            "theta": None,
            "aggregation": "sum",
            "subtype": [],
            "sort": None,
            "width": 0,
            "height": 0,
            "legend": {
                "visible": True,
            },
            "label": True,
        }

        self.chart_config = json.dumps(config)

    def run_sql(self, sql: str, con: Optional[Connection] = None):
        assert type(self.data_name) is str
        assert type(self.row_range) is tuple

        try:
            if len(self.data_name) == 0:
                self.data_name = self.cell_id + "result"
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
                df = read_sql(sql, con=con)
                dt_columns = {}
                for column in df.columns:
                    for i in range(len(df[column])):
                        if df[column][i] and type(df[column][i]) == datetime.date:
                            dt_columns[column] = "datetime64[ns]"
                            break
                df = df.astype(dt_columns, copy=False, errors="ignore")
                set_value(self.shell, self.data_name, df)
            # Calculate time elapsed for running the sql queries.
            self.exec_time = time() - start

            df = get_value(self.shell, self.data_name)
            assert type(df) is DataFrame
            self.title_hist = json.dumps(get_histogram(df))
            self.set_data_grid()
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

    def aggregation(self, fun: str, name: str):
        return fun + "(" + name + ")"

    def _generate_bar(self, config: ChartConfig) -> Optional[Chart]:
        # Ensure parameters are presented.
        if config["x"] is None or config["y"] is None or config["aggregation"] is None:
            return None
        # Generate vega spec for the chart.
        config["x"] = self.aggregation(config["aggregation"], config["x"])
        params = {"tooltip": [config["x"], config["y"]], "x": X(config["x"]), "y": Y(config["y"], sort=config["sort"])}
        if config["color"]:
            params["color"] = config["color"]
            params["tooltip"] = [config["x"], config["y"], config["color"]]
            if SubChartType.PERCENT in config["subtype"]:
                params["x"] = params["x"].stack("normalize")
            if SubChartType.CLUSTERED in config["subtype"]:
                params["xOffset"] = config["color"]
        return Chart(get_value(self.shell, self.data_name)).mark_bar().encode(**params)

    def _generate_column(self, config: ChartConfig) -> Optional[Chart]:
        # Ensure parameters are presented.
        if config["x"] is None or config["y"] is None or config["aggregation"] is None:
            return None
        # Generate vega spec for the chart.
        config["y"] = self.aggregation(config["aggregation"], config["y"])
        params = {"x": X(config["x"], sort=config["sort"]), "y": Y(config["y"]), "tooltip": [config["x"], config["y"]]}
        if config["color"]:
            params["color"] = config["color"]
            params["tooltip"] = [config["x"], config["y"], config["color"]]
            if SubChartType.PERCENT in config["subtype"]:
                params["y"] = params["y"].stack("normalize")
            if SubChartType.CLUSTERED in config["subtype"]:
                params["xOffset"] = config["color"]
        return Chart(get_value(self.shell, self.data_name)).mark_bar().encode(**params)

    def _generate_area(self, config: ChartConfig) -> Optional[Chart]:
        # Ensure parameters are presented.
        if config["x"] is None or config["y"] is None or config["aggregation"] is None:
            return None
        if config["sort"] is None:
            config["sort"] = "ascending"
        # Generate vega spec for the chart.
        config["y"] = self.aggregation(config["aggregation"], config["y"])
        params = {
            "x": X(config["x"] + ":O", sort=config["sort"]),
            "y": Y(config["y"]),
            "tooltip": [config["x"], config["y"]],
        }
        if config["color"]:
            params["color"] = config["color"]
            params["tooltip"] = [config["x"], config["y"], config["color"]]
            if SubChartType.PERCENT in config["subtype"]:
                params["y"] = params["y"].stack("normalize")
        return Chart(get_value(self.shell, self.data_name)).mark_area().encode(**params)

    def _generate_line(self, config: ChartConfig) -> Optional[Chart]:
        # Ensure parameters are presented.
        if config["x"] is None or config["y"] is None or config["aggregation"] is None:
            return None

        # Generate vega spec for the chart.
        config["y"] = self.aggregation(config["aggregation"], config["y"])
        params = {"x": X(config["x"], sort=config["sort"]), "y": Y(config["y"]), "tooltip": [config["x"], config["y"]]}

        if config["color"]:
            params["tooltip"] = [config["x"], config["y"], config["color"]]
            params["color"] = config["color"]
        return Chart(get_value(self.shell, self.data_name)).mark_line().encode(**params)

    def _generate_scatter(self, config: ChartConfig) -> Optional[Chart]:
        # Ensure parameters are presented.
        if config["x"] is None or config["y"] is None:
            return None
        # Generate vega spec for the chart.
        params = {"x": X(config["x"], sort=config["sort"]), "y": Y(config["y"]), "tooltip": [config["x"], config["y"]]}
        if config["color"]:
            params["tooltip"] = [config["x"], config["y"], config["color"]]
            params["color"] = config["color"]
        return Chart(get_value(self.shell, self.data_name)).mark_point().encode(**params)

    def _generate_arc(self, config: ChartConfig) -> Union[Chart, LayerChart, None]:
        # Ensure parameters are presented.
        if config["theta"] is None or config["color"] is None or config["aggregation"] is None:
            return None
        config["theta"] = self.aggregation(config["aggregation"], config["theta"])
        # Generate vega spec for the chart.
        params = {
            "color": Color(config["color"]),
            "theta": Theta(config["theta"]).stack(True),
            "tooltip": [config["color"], config["theta"]],
            "text": config["color"],
        }
        if config["sort"]:
            params["order"] = Order(
                config[config["sort"][1:]], sort="ascending" if config["sort"][:1] == "+" else "descending"
            )
        base = Chart(get_value(self.shell, self.data_name)).encode(**params)
        width = config["width"]
        height = config["height"]
        r = 100 if width * height == 0 else min(width - 20, height) / 2
        pie = base.mark_arc(outerRadius=r)
        text = base.mark_text(radius=r + 20, size=10)
        return (pie + text) if config["label"] else pie

    def check_duplicate(self, *args):
        li = [item for item in args if item is not None]
        if len(li) == 0:
            return
        select = ",".join([f"'{item}'" for item in li])
        group = ",".join([str(i + 1) for i in range(len(li))])
        name = self.data_name
        tmp = get_duckdb_result(self.shell, f"select {select} from {name} group by {group} having count(*) > 1")
        self.need_aggr = len(tmp) > 0

    @observe("persist_vega")
    def on_persist_vega(self, _):
        if self.chart is None:
            return
        update_display(
            self.chart,
            display_id=self.cell_id,
        )

    @observe("chart_config")
    def on_chart_config(self, change):
        assert type(self.chart_config) is str
        chart_config: ChartConfig = json.loads(
            self.chart_config.replace("(", "\\\\(").replace(")", "\\\\)").replace(".", "\\\\.")
        )
        # Check the type of the chart is specified.
        if chart_config["type"] is None:
            return
        co = json.loads(change["old"])
        cn = json.loads(change["new"])
        if co["type"] != cn["type"] and ChartType.PIE in (co["type"], cn["type"]):
            chart_config["sort"] = None
        # ordinal_config: ChartConfig = json.loads(self.chart_config)
        # self.check_duplicate(ordinal_config["x"], ordinal_config["y"], ordinal_config["color"])

        # Try to generate vega spec based on config.
        mapping = {
            ChartType.COLUMN: self._generate_column,
            ChartType.BAR: self._generate_bar,
            ChartType.LINE: self._generate_line,
            ChartType.AREA: self._generate_area,
            ChartType.PIE: self._generate_arc,
            ChartType.SCATTER: self._generate_scatter,
        }
        self.chart = mapping[chart_config["type"]](chart_config)
        if self.chart is None:
            self.preview_vega = "{}"
            return
        self.chart = self.chart.properties(width=chart_config["width"], height=chart_config["height"])
        if not chart_config["legend"]["visible"]:
            self.chart = self.chart.configure_legend(disable=True)
        self.preview_vega = self.chart.to_json()

    @observe("row_range")
    def on_row_range(self, _):
        self.set_data_grid()

    @observe("column_sort")
    def on_column_sort(self, _):
        assert type(self.column_sort) is tuple
        df = get_value(self.shell, self.data_name)
        assert type(df) is DataFrame
        df.sort_index(axis=0, inplace=True)
        if self.column_sort[1] != 0:
            df.sort_values(
                by=self.column_sort[0],
                ascending=self.column_sort[1] > 0,
                inplace=True,
                kind="stable",
            )
        self.set_data_grid()

    @observe("quickview_var")
    def on_quickview_var(self, _):
        assert type(self.quickview_var) is tuple
        select = self.quickview_var[0]
        name = self.data_name
        df = get_duckdb_result(
            self.shell,
            f"select {select} from (SELECT *, ROW_NUMBER() OVER () AS index_rn1qaz2wsx FROM {name}) using SAMPLE reservoir (100 rows) REPEATABLE(42) order by index_rn1qaz2wsx",
        )
        df = df.reset_index()
        self.quickview_vega = Chart(df).mark_line().encode(x="index", y=select).to_json()
