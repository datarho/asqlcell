import datetime
import json
from time import time
from typing import Optional, Union

import pandas as pd
import sqlparse
from altair import Chart, Color, LayerChart, Order, Text, Theta, Tooltip, X, Y
from IPython.core.interactiveshell import InteractiveShell
from IPython.display import update_display
from ipywidgets import DOMWidget
from pandas import DataFrame, read_sql
from sqlalchemy import Connection, text
from traitlets import Bool, Float, HasTraits, Int, Tuple, Unicode, observe

from asqlcell.chart import ChartConfig, ChartType, SubChartType
from asqlcell.jinjasql import JinjaSql
from asqlcell.utils import NoTracebackException, get_histogram, get_duckdb

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

    config: ChartConfig = {
        "type": None,
        "x": {
            "label": None,
            "field": None,
            "aggregation": "sum",
            "sort": None,
        },
        "y": {
            "label": None,
            "field": None,
            "aggregation": "sum",
            "sort": None,
        },
        "y2": {
            "label": None,
            "field": None,
            "aggregation": "sum",
            "sort": None,
        },
        "color": {
            "label": None,
            "field": None,
            "aggregation": "sum",
            "sort": None,
        },
        "subtype": [],
        "width": 500,
        "height": 400,
        "legend": {
            "visible": True,
        },
        "label": True,
    }

    def __init__(self, shell: InteractiveShell, cell_id="", sql=""):
        super(SqlCellWidget, self).__init__()
        self._model_name = "SqlCellModel"
        self._model_module = module_name
        self._model_module_version = module_version
        self._view_name = "SqlCellView"
        self._view_module = module_name
        self._view_module_version = module_version
        self.shell = shell
        self.cell_id = cell_id
        self.preview_vega = "{}"
        self.quickview_vega = "{}"
        self.chart_config = json.dumps(self.config)

    def get_duckdb_result(self, sql, vlist=[]):
        for k, v in self.get_vars(is_df=True).items():
            get_duckdb().register(k, v)
        df = get_duckdb().execute(sql, vlist).df()
        for k, v in self.get_vars(is_df=True).items():
            get_duckdb().unregister(k)
        return df

    def get_value(self, variable_name):
        return self.shell.user_global_ns.get(variable_name)

    def get_vars(self, is_df=False):
        vars = {}
        for v in self.shell.user_global_ns:
            if not is_df or not v.startswith("_") and type(self.get_value(v)) is DataFrame:
                vars[v] = self.get_value(v)
        return vars

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
            df = None
            if con is None:
                jsql = JinjaSql(param_style="qmark")
                res, vlist = jsql.prepare_query(
                    sqlparse.format(sql, strip_comments=True, reindent=True),
                    self.get_vars(),
                )
                df = self.get_duckdb_result(res, vlist)
            else:
                df = read_sql(sql, con=con)
                dt_columns = {}
                for column in df.columns:
                    for i in range(len(df[column])):
                        if df[column][i] and type(df[column][i]) == datetime.date:
                            dt_columns[column] = "datetime64[ns]"
                            break
                df = df.astype(dt_columns, copy=False, errors="ignore")
            self.shell.user_global_ns[self.data_name] = df
            # Calculate time elapsed for running the sql queries.
            self.exec_time = time() - start

            assert type(df) is DataFrame
            self.title_hist = json.dumps(get_histogram(df))
            self.set_data_grid()
            self.chart_config = json.dumps(self.config)
        except Exception as r:
            raise NoTracebackException(r)

    def set_data_grid(self):
        assert type(self.row_range) is tuple
        df = self.get_value(self.data_name)
        assert type(df) is DataFrame
        self.data_grid = (
            df[self.row_range[0] : self.row_range[1]].to_json(orient="split", date_format="iso") + "\n" + str(len(df))
        )
        df = df[self.row_range[0] : self.row_range[1]].astype(str).apply(pd.to_numeric, errors="coerce")
        df = 1 - (df - df.min()) / (df.max() - df.min())
        df = 150 * df + 105
        self.column_color = df.to_json(orient="split", date_format="iso")

    def _get_sort_symbol(self, config: ChartConfig) -> Union[str, None]:
        """
        Get sort symbol used by vega spec.
        """
        if config["type"] in {ChartType.BAR, ChartType.COLUMN, ChartType.AREA, ChartType.LINE, ChartType.SCATTER}:
            if config["x"]["sort"]:
                return "x" if config["x"]["sort"] == "ascending" else "-x"
            elif config["y"]["sort"]:
                return "y" if config["y"]["sort"] == "ascending" else "-y"
        return None

    def _generate_funnel(self, base: Chart, config: ChartConfig) -> Union[Chart, LayerChart, None]:
        if config["x"]["field"] is None or config["y"]["field"] is None:
            return None
        return (
            base.encode(
                x=X(config["x"]["field"]).stack("center"), color=Color(config["y"]["field"], legend=None)
            ).mark_bar()
            + base.encode(text=config["x"]["field"]).mark_text()
        ).encode(y=Y(config["y"]["field"], sort=None))

    def _generate_bar(self, base: Chart, config: ChartConfig) -> Union[Chart, LayerChart, None]:
        if config["x"]["field"] is None or config["y"]["field"] is None:
            return None
        x = X(field=config["x"]["field"], aggregate=config["y"]["aggregation"])
        y = Y(field=config["y"]["field"])
        color = config["color"]["field"]
        params = {"x": x.stack("zero"), "y": y.sort(self._get_sort_symbol(config)), "tooltip": [x, y], "text": x}
        if color:
            params["color"] = color
            params["tooltip"] += [color]
            if SubChartType.PERCENT in config["subtype"]:
                params["x"] = x.stack("normalize")
            if SubChartType.CLUSTERED in config["subtype"]:
                params["yOffset"] = color
        base = base.encode(**params)
        bar = base.mark_bar()
        return bar + base.mark_text(align="center", baseline="bottom", dx=40) if config["label"] else bar

    def _generate_column(self, base: Chart, config: ChartConfig) -> Union[Chart, LayerChart, None]:
        if config["x"]["field"] is None or config["y"]["field"] is None:
            return None
        x = X(field=config["x"]["field"])
        y = Y(field=config["y"]["field"], aggregate=config["y"]["aggregation"])
        color = config["color"]["field"]
        params = {"x": x.sort(self._get_sort_symbol(config)), "y": y.stack("zero"), "tooltip": [x, y], "text": y}
        if color:
            params["color"] = color
            params["tooltip"] += [color]
            if SubChartType.PERCENT in config["subtype"]:
                params["y"] = y.stack("normalize")
            if SubChartType.CLUSTERED in config["subtype"]:
                params["xOffset"] = color
        base = base.encode(**params)
        bar = base.mark_bar()
        return bar + base.mark_text(align="center", baseline="bottom") if config["label"] else bar

    def _generate_area(self, base: Chart, config: ChartConfig) -> Union[Chart, LayerChart, None]:
        if config["x"]["field"] is None or config["y"]["field"] is None:
            return None
        x = X(field=config["x"]["field"])
        y = Y(field=config["y"]["field"], aggregate=config["y"]["aggregation"])
        color = config["color"]["field"]
        params = {"x": x.sort(self._get_sort_symbol(config)), "y": y, "tooltip": [x, y]}
        if color:
            params["color"] = color
            params["tooltip"] += [color]
            if SubChartType.PERCENT in config["subtype"]:
                params["y"] = y.stack("normalize")
        return base.encode(**params).mark_area()

    def _generate_line(self, base: Chart, config: ChartConfig) -> Union[Chart, LayerChart, None]:
        if config["x"]["field"] is None or config["y"]["field"] is None:
            return None
        x = X(field=config["x"]["field"])
        y = Y(field=config["y"]["field"], aggregate=config["y"]["aggregation"])
        color = config["color"]["field"]
        params = {"x": x.sort(self._get_sort_symbol(config)), "y": y, "tooltip": [x, y]}
        if color:
            params["color"] = color
            params["tooltip"] += [color]
        return base.encode(**params).mark_line()

    def _generate_scatter(self, base: Chart, config: ChartConfig) -> Union[Chart, LayerChart, None]:
        if config["x"]["field"] is None or config["y"]["field"] is None:
            return None
        x = config["x"]["field"]
        y = config["y"]["field"]
        color = config["color"]["field"]
        params = {"x": x, "y": y, "tooltip": [x, y]}
        if color:
            params["color"] = color
            params["tooltip"] += [color]
        return base.encode(**params).mark_point()

    def _generate_combo(self, base: Chart, config: ChartConfig) -> Union[Chart, LayerChart, None]:
        """
        Generate combo based on the chart config. This could be a a line and stacked column or line and clustered column.
        """
        if config["x"]["field"] is None or config["y"]["field"] is None or config["y2"]["field"] is None:
            return None
        line = self._generate_line(base, config)
        config["y"] = config["y2"]
        column = self._generate_column(base, config)
        return line + column  # type: ignore

    def _generate_arc(self, base: Chart, config: ChartConfig) -> Union[Chart, LayerChart, None]:
        """
        Generate vega spec for pie chart with the given config.
        """
        if config["x"]["field"] is None or config["y"]["field"] is None:
            return None
        color = config["x"]["field"]
        theta = Theta(field=config["y"]["field"], aggregate=config["y"]["aggregation"])
        params = {"color": color, "theta": theta.stack(True), "tooltip": [theta, color], "text": color}
        if config["x"]["sort"]:
            params["order"] = Order(color).sort(config["x"]["sort"])  # type: ignore
        if config["y"]["sort"]:
            params["order"] = Order(field=config["y"]["field"], aggregate=config["y"]["aggregation"]).sort(config["y"]["sort"])  # type: ignore
        base = base.encode(**params)
        width = config["width"]
        height = config["height"]
        r = 100 if width * height == 0 else min(width - 20, height) / 2
        pie = base.mark_arc(outerRadius=r)
        return pie + base.mark_text(radius=r + 20, size=10) if config["label"] else pie

    def check_duplicate(self, *args):
        li = [item for item in args if item is not None]
        if len(li) == 0:
            return
        select = ",".join([f"'{item}'" for item in li])
        group = ",".join([str(i + 1) for i in range(len(li))])
        name = self.data_name
        tmp = self.get_duckdb_result(f"select {select} from {name} group by {group} having count(*) > 1")
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
    def on_chart_config(self, _):
        self.preview_vega = "{}"
        assert type(self.chart_config) is str
        config: ChartConfig = json.loads(
            self.chart_config.replace("(", "\\\\(").replace(")", "\\\\)").replace(".", "\\\\.")
        )
        # Check the type of the chart is specified.
        if config["type"] is None:
            return
        # Try to generate vega spec based on config.
        mapping = {
            ChartType.COLUMN: self._generate_column,
            ChartType.BAR: self._generate_bar,
            ChartType.LINE: self._generate_line,
            ChartType.AREA: self._generate_area,
            ChartType.PIE: self._generate_arc,
            ChartType.SCATTER: self._generate_scatter,
            ChartType.COMBO: self._generate_combo,
            ChartType.FUNNEL: self._generate_funnel,
        }
        base = Chart(self.get_value(self.data_name))
        self.chart = mapping[config["type"]](base, config)
        if self.chart:
            self.chart = self.chart.properties(width=config["width"], height=config["height"])
            if not config["legend"]["visible"]:
                self.chart = self.chart.configure_legend(disable=True)
            self.preview_vega = self.chart.to_json()

    @observe("row_range")
    def on_row_range(self, _):
        self.set_data_grid()

    @observe("column_sort")
    def on_column_sort(self, _):
        assert type(self.column_sort) is tuple
        df = self.get_value(self.data_name)
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
        df = self.get_duckdb_result(
            f"select {select} from (SELECT *, ROW_NUMBER() OVER () AS index_rn1qaz2wsx FROM {name}) using SAMPLE reservoir (100 rows) REPEATABLE(42) order by index_rn1qaz2wsx"
        )
        df = df.reset_index()
        self.quickview_vega = Chart(df).mark_line().encode(x="index", y=select).to_json()
