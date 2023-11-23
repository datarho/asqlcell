import datetime
import json
import os
from time import time
from typing import Optional, Union

import pandas as pd
import sqlparse
from altair import Chart, Color, LayerChart, Order, Theta, X, Y, layer
from IPython.core.interactiveshell import InteractiveShell
from IPython.display import update_display
from ipywidgets import DOMWidget
from pandas import DataFrame, read_sql
from sqlalchemy import Connection, text
from traitlets import Bool, Float, HasTraits, Int, Tuple, Unicode, observe

from asqlcell.chart import ChartConfig, ChartType, SubChartType
from asqlcell.jinjasql import JinjaSql
from asqlcell.utils import (
    NoTracebackException,
    get_duckdb,
    get_duckdb_result,
    get_histogram,
    get_vars,
    calculate_adler32_checksum,
)
import vegafusion as vf
from vegafusion.renderer import spec_to_mime_bundle

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
    column_sort = Tuple(Unicode(), Int(), default_value=("", 0)).tag(sync=True)
    persist_vega = Unicode().tag(sync=True)
    export = Unicode().tag(sync=True)
    chart_config = Unicode().tag(sync=True)
    quickview_var = Tuple(Unicode(), Unicode(), default_value=("", "")).tag(sync=True)

    column_color = Unicode().tag(sync=True)
    title_hist = Unicode().tag(sync=True)
    data_grid = Unicode().tag(sync=True)
    exec_time = Float().tag(sync=True)
    quickview_vega = Unicode().tag(sync=True)
    cache = Unicode().tag(sync=True)
    export_report = Unicode().tag(sync=True)
    explainsql_report = Unicode().tag(sync=True)
    preview_vega = Unicode().tag(sync=True)

    config: ChartConfig = {
        "type": None,
        "x": {
            "label": None,
            "field": None,
            "aggregation": "sum",
            "sort": None,
        },
        "x2": {
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
        "label": False,
        "theme": "tableau20",
    }

    def __init__(self, shell: InteractiveShell, cell_id="", sql=""):
        super(SqlCellWidget, self).__init__()
        vf.runtime.set_connection("duckdb")
        vf.enable()
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
        self.cache = "{}"
        self.chart_config = json.dumps(self.config)
        self.data_name = ""

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
                    get_vars(self.shell),
                )
                df = get_duckdb_result(self.shell, res, vlist)
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
            assert type(self.cache) is str
            cache = json.loads(self.cache)
            cache["tabValue"] = "table"
            self.cache = json.dumps(cache)
        except Exception as r:
            raise r
            raise NoTracebackException(r)

    def set_data_grid(self):
        assert type(self.row_range) is tuple
        assert type(self.data_name) is str
        df = self.shell.user_global_ns[self.data_name]
        assert type(df) is DataFrame
        self.data_grid = (
            df[self.row_range[0] : self.row_range[1]].to_json(
                orient="split", date_format="iso"
            )
            + "\n"
            + str(len(df))
        )
        df = (
            df[self.row_range[0] : self.row_range[1]]
            .astype(str)
            .apply(pd.to_numeric, errors="coerce")
        )
        df = 1 - (df - df.min()) / (df.max() - df.min())
        df = 150 * df + 105
        self.column_color = df.to_json(orient="split", date_format="iso")

    def _get_sort_symbol(self, config: ChartConfig) -> Union[str, None]:
        """
        Get sort symbol used by vega spec.
        """
        if config["type"] in [
            ChartType.BAR,
            ChartType.COLUMN,
            ChartType.AREA,
            ChartType.LINE,
            ChartType.COMBO,
        ]:
            if config["x"]["sort"]:
                return "x" if config["x"]["sort"] == "ascending" else "-x"
            elif config["y"]["sort"]:
                return "y" if config["y"]["sort"] == "ascending" else "-y"
        return None

    def _add_color(self, theme, color, params: dict) -> dict:
        if color:
            params["color"] = Color(color).scale(scheme=theme)
            params["tooltip"] += [color]
        return params

    def _generate_funnel(
        self, base: Chart, config: ChartConfig
    ) -> Union[Chart, LayerChart, None]:
        x, y, color = config["x"]["field"], config["y"]["field"], config["y"]["field"]
        params = {"x": X(x).stack("center"), "tooltip": []}
        return (
            base.encode(**self._add_color(config["theme"], color, params)).mark_bar()
            + base.encode(text=x).mark_text()
        ).encode(y=Y(y).sort(None))

    def _generate_bar(
        self, base: Chart, config: ChartConfig
    ) -> Union[Chart, LayerChart, None]:
        x, y, color = (
            X(field=config["x"]["field"]),
            Y(field=config["y"]["field"]),
            config["color"]["field"],
        )
        x = x.aggregate(config["x"]["aggregation"])
        params = {
            "x": x.stack("zero"),
            "y": y.sort(self._get_sort_symbol(config)),
            "tooltip": [x, y],
            "text": x,
        }
        if color and SubChartType.PERCENT in config["subtype"]:
            params["x"] = x.stack("normalize")
        if color and SubChartType.CLUSTERED in config["subtype"]:
            params["yOffset"] = color
        base = base.encode(**self._add_color(config["theme"], color, params))
        bar = base.mark_bar()
        return (
            bar + base.mark_text(align="center", baseline="bottom", dx=40)
            if config["label"]
            else bar
        )

    def _generate_column(
        self, base: Chart, config: ChartConfig
    ) -> Union[Chart, LayerChart, None]:
        x, y, color = (
            X(field=config["x"]["field"]),
            Y(field=config["y"]["field"]),
            config["color"]["field"],
        )
        y = y.aggregate(config["y"]["aggregation"])
        params = {
            "x": x.sort(self._get_sort_symbol(config)),
            "y": y.stack("zero"),
            "tooltip": [x, y],
            "text": y,
        }
        if color:
            if SubChartType.PERCENT in config["subtype"]:
                params["y"] = y.stack("normalize")
            if SubChartType.CLUSTERED in config["subtype"]:
                params["xOffset"] = color
        base = base.encode(**self._add_color(config["theme"], color, params))
        bar = base.mark_bar()
        return (
            bar + base.mark_text(align="center", baseline="bottom")
            if config["label"]
            else bar
        )

    def _generate_area(
        self, base: Chart, config: ChartConfig
    ) -> Union[Chart, LayerChart, None]:
        x, y, color = (
            X(field=config["x"]["field"]),
            Y(field=config["y"]["field"]),
            config["color"]["field"],
        )
        y = y.aggregate(config["y"]["aggregation"])
        params = {
            "x": x.sort(self._get_sort_symbol(config)),
            "y": y.stack("zero"),
            "tooltip": [x, y],
            "text": y,
        }
        if color and SubChartType.PERCENT in config["subtype"]:
            params["y"] = y.stack("normalize")
        base = base.encode(**self._add_color(config["theme"], color, params))
        area = base.mark_area()
        return (
            area + base.mark_text(align="center", baseline="bottom")
            if config["label"]
            else area
        )

    def _generate_line(
        self, base: Chart, config: ChartConfig
    ) -> Union[Chart, LayerChart, None]:
        x, y, color = (
            X(field=config["x"]["field"]),
            Y(field=config["y"]["field"]),
            config["color"]["field"],
        )
        y = y.aggregate(config["y"]["aggregation"])
        params = {
            "x": x.sort(self._get_sort_symbol(config)),
            "y": y,
            "tooltip": [x, y],
            "text": y,
        }
        base = base.encode(**self._add_color(config["theme"], color, params))
        line = base.mark_line()
        return (
            line + base.mark_text(align="center", baseline="bottom")
            if config["label"]
            else line
        )

    def _generate_scatter(
        self, base: Chart, config: ChartConfig
    ) -> Union[Chart, LayerChart, None]:
        x, y, color = (
            config["x"]["field"],
            config["y"]["field"],
            config["color"]["field"],
        )
        params = {"x": x, "y": y, "tooltip": [x, y]}
        return base.encode(
            **self._add_color(config["theme"], color, params)
        ).mark_point()

    def _generate_combo(
        self, base: Chart, config: ChartConfig
    ) -> Union[Chart, LayerChart, None]:
        if config["y2"]["field"] is None:
            return None
        line = self._generate_column(base, config)
        config["y"] = config["y2"]
        column = self._generate_line(base, config)
        return (
            layer(column, line)
            .resolve_scale(y="independent")
            .configure_line(color="orange")
            .configure_bar(opacity=0.5)
        )

    def _generate_arc(
        self, base: Chart, config: ChartConfig
    ) -> Union[Chart, LayerChart, None]:
        theta, color = (
            Theta(config["y"]["field"]).aggregate(config["y"]["aggregation"]),
            config["x"]["field"],
        )
        params = {"theta": theta.stack(True), "tooltip": [theta], "text": color}
        if config["x"]["sort"]:
            params["order"] = Order(color).sort(config["x"]["sort"])
        if config["y"]["sort"]:
            params["order"] = (
                Order(config["y"]["field"])
                .aggregate(config["y"]["aggregation"])
                .sort(config["y"]["sort"])
            )
        base = base.encode(**self._add_color(config["theme"], color, params))
        width = config["width"]
        height = config["height"]
        r = 100 if width * height == 0 else min(max(width - 20, 0), height) / 2
        pie = base.mark_arc(radius=r)
        return pie + base.mark_text(radius=r + 20) if config["label"] else pie

    def _generate_sunburst(
        self, base: Chart, config: ChartConfig
    ) -> Union[Chart, LayerChart, None]:
        if config["x2"]["field"] is None:
            return None
        theta, color, color2 = (
            config["y"]["field"],
            config["x"]["field"],
            config["x2"]["field"],
        )
        get_duckdb().register("data", base.data)
        data2 = (
            get_duckdb()
            .execute(f"select *, concat({color2}, ',', {theta}) label1q2w3e from data")
            .df()
        )
        get_duckdb().unregister("data")
        order = Order(color).sort("ascending")
        theta = Theta(theta)
        params2 = {
            "theta": theta.stack(True),
            "text": "label1q2w3e",
            "tooltip": [color, theta],
            "order": order,
        }
        params = {
            "theta": theta.aggregate("sum").stack(True),
            "text": color,
            "tooltip": [theta.aggregate("sum")],
            "order": order,
        }
        base2 = Chart(data2).encode(**self._add_color(config["theme"], color2, params2))
        base = base.encode(**self._add_color(config["theme"], color, params))
        width = config["width"]
        height = config["height"]
        r2 = 100 if width * height == 0 else min(max(width - 20, 0), height) / 2
        r = r2 / 2
        pie2 = base2.mark_arc(radius=r2)
        pie = base.mark_arc(radius=r)
        return layer(
            pie2 + base2.mark_text(radius=max(r2 - 30, 0), color="black")
            if config["label"]
            else pie2,
            pie + base.mark_text(radius=max(r - 30, 0), color="black")
            if config["label"]
            else pie,
        )

    def to_json(self, chart):
        bundle = spec_to_mime_bundle(spec=chart.to_dict(), mimetype="vega")[0]  # type: ignore
        return json.dumps(bundle["application/vnd.vega.v5+json"], indent=4, sort_keys=True)  # type: ignore

    def explainsql(self, sql: str, con: Connection, resulttype: str):
        try:
            if resulttype == "Y":
                sql = "explain " + sql
            elif resulttype == "G":
                sql = "explain (format GRAPHVIZ) " + sql
            else:
                self.explainsql_report = json.dumps({"error_message": "Not support!"})
                return
            df = read_sql(sql, con=con)
            res = {}
            res["type"] = resulttype
            res["plan_summary"] = df.iloc[0, 0]
            res["time_stamp"] = datetime.datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S.%f"
            )[:-3]
            self.explainsql_report = json.dumps(res)
            assert type(self.cache) is str
            cache = json.loads(self.cache)
            cache["tabValue"] = "analysis"
            self.cache = json.dumps(cache)
        except Exception as r:
            raise NoTracebackException(r)

    @observe("persist_vega")
    def on_persist_vega(self, _):
        if self.chart is not None:
            update_display(self.chart, display_id=self.cell_id)

    @observe("chart_config")
    def on_chart_config(self, _):
        self.preview_vega = "{}"
        self.chart = None
        assert type(self.chart_config) is str
        config: ChartConfig = json.loads(
            self.chart_config.replace("(", "\\\\(")
            .replace(")", "\\\\)")
            .replace(".", "\\\\.")
        )
        if (
            config["type"] is None
            or config["x"]["field"] is None
            or config["y"]["field"] is None
        ):
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
            ChartType.SUNBURST: self._generate_sunburst,
        }
        assert type(self.data_name) is str
        self.chart = mapping[config["type"]](
            Chart(self.shell.user_global_ns[self.data_name]), config
        )
        if self.chart:
            self.chart = self.chart.properties(
                width=config["width"], height=config["height"]
            ).configure_legend(disable=not config["legend"]["visible"])
            self.preview_vega = self.to_json(self.chart)

    @observe("row_range")
    def on_row_range(self, _):
        self.set_data_grid()

    @observe("column_sort")
    def on_column_sort(self, _):
        assert type(self.column_sort) is tuple
        assert type(self.data_name) is str
        if len(self.column_sort[0]) == 0:
            return
        df = self.shell.user_global_ns[self.data_name]
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
            f'select "{select}" from (SELECT *, ROW_NUMBER() OVER () AS index_rn1qaz2wsx FROM {name}) using SAMPLE reservoir (100 rows) REPEATABLE(42) order by index_rn1qaz2wsx',
        )
        df = df.reset_index()
        self.quickview_vega = self.to_json(
            Chart(df).mark_line().encode(x="index", y=select)
        )

    @observe("export")
    def on_export(self, _):
        assert type(self.export) is str
        assert type(self.data_name) is str
        res = json.loads(self.export)
        try:
            df = self.shell.user_global_ns[self.data_name]
            assert type(df) is DataFrame
            if res["file_path"].endswith("csv"):
                df.to_csv(res["file_path"], index=False)
            elif res["file_path"].endswith("xlsx"):
                df.to_excel(res["file_path"], index=False)
            if os.path.exists(res["file_path"]):
                res["file_size"] = os.path.getsize(res["file_path"])
                res["file_checksum"] = calculate_adler32_checksum(res["file_path"])
            else:
                res["error_message"] = "File export failed!"
        except Exception as r:
            res["error_message"] = str(r)
        self.export_report = json.dumps(res)
