import filecmp
import json
from pathlib import Path

from altair import Chart
from sqlalchemy import create_engine

from asqlcell.chart import ChartConfig, ChartType
from asqlcell.widget import SqlCellWidget

dir = Path(__file__).parent.resolve()


def test_widget_creation_blank(session):
    """
    Check default value of sql cell widget.
    """
    widget = SqlCellWidget(session)

    assert widget._model_name == "SqlCellModel"
    assert widget._model_module == "asqlcell"
    assert widget._model_module_version == "0.1.0"
    assert widget._view_name == "SqlCellView"
    assert widget._view_module == "asqlcell"
    assert widget._view_module_version == "0.1.0"


def test_generate_column_basic(session):
    """
    Check proper vega spec generated for bar chart.
    """
    db = Path(dir, "chinook.sqlite")
    con = create_engine(f"sqlite:///{db}").connect()

    query = """
        SELECT
            Customer.Country,
            SUM(Invoice.Total) AS Total
        FROM Invoice
        JOIN Customer ON Customer.CustomerId = Invoice.CustomerId
        GROUP BY 1
        ORDER BY 2 DESC
    """
    widget = SqlCellWidget(session)

    widget.run_sql(query, con)

    config: ChartConfig = {
        "type": ChartType.COLUMN,
        "x": {"label": None, "field": "Country", "aggregation": "sum", "sort": None},
        "y": {"label": None, "field": "Total", "aggregation": "sum", "sort": None},
        "y2": {"label": None, "field": None, "aggregation": "sum", "sort": None},
        "color": {"label": None, "field": None, "aggregation": "sum", "sort": None},
        "subtype": [],
        "width": 1000,
        "height": 400,
        "legend": {"visible": True},
        "label": True,
    }

    widget.chart_config = json.dumps(config)

    assert widget.chart is not None

    actual = Path(dir, "actual", "column_basic.json")
    actual.parent.mkdir(exist_ok=True, parents=True)

    with open(actual, "w") as file:
        json.dump(widget.chart.to_dict(), file, indent=4)

    assert filecmp.cmp(Path(dir, "baseline", "column_basic.json"), Path(dir, "actual", "column_basic.json"))


def test_generate_line_basic(session):
    """
    Check proper vega spec generated for line chart.
    """
    db = Path(dir, "chinook.sqlite")
    con = create_engine(f"sqlite:///{db}").connect()

    query = """
        SELECT
            BillingCountry,
            date(InvoiceDate, 'start of month') AS Date,
            SUM(Total) AS Total
        FROM Invoice
        GROUP BY 1, 2
        HAVING BillingCountry IN ('USA', 'Canada', 'France')
    """
    widget = SqlCellWidget(session)

    widget.run_sql(query, con)

    config: ChartConfig = {
        "type": ChartType.LINE,
        "x": {"label": None, "field": "Date", "aggregation": "sum", "sort": "ascending"},
        "y": {"label": None, "field": "Total", "aggregation": "sum", "sort": None},
        "y2": {"label": None, "field": None, "aggregation": "sum", "sort": None},
        "color": {"label": None, "field": "BillingCountry", "aggregation": "sum", "sort": None},
        "subtype": [],
        "width": 1000,
        "height": 400,
        "legend": {"visible": True},
        "label": True,
    }

    widget.chart_config = json.dumps(config)

    assert widget.chart is not None

    actual = Path(dir, "actual", "line_basic.json")
    actual.parent.mkdir(exist_ok=True, parents=True)

    with open(actual, "w") as file:
        json.dump(widget.chart.to_dict(), file, indent=4)

    assert filecmp.cmp(Path(dir, "baseline", "line_basic.json"), Path(dir, "actual", "line_basic.json"))


def test_generate_area_basic(session):
    """
    Check proper vega spec generated for area chart.
    """
    db = Path(dir, "chinook.sqlite")
    con = create_engine(f"sqlite:///{db}").connect()

    query = """
        SELECT
            BillingCountry,
            date(InvoiceDate, 'start of month') AS Date,
            SUM(Total) AS Total
        FROM Invoice
        GROUP BY 1, 2
        HAVING BillingCountry IN ('USA', 'Canada', 'France')
    """
    widget = SqlCellWidget(session)

    widget.run_sql(query, con)

    config: ChartConfig = {
        "type": ChartType.AREA,
        "x": {"label": None, "field": "Date", "aggregation": "sum", "sort": "ascending"},
        "y": {"label": None, "field": "Total", "aggregation": "sum", "sort": None},
        "y2": {"label": None, "field": None, "aggregation": "sum", "sort": None},
        "color": {"label": None, "field": "BillingCountry", "aggregation": "sum", "sort": None},
        "subtype": [],
        "width": 1000,
        "height": 400,
        "legend": {"visible": True},
        "label": True,
    }

    widget.chart_config = json.dumps(config)

    assert widget.chart is not None

    actual = Path(dir, "actual", "area_basic.json")
    actual.parent.mkdir(exist_ok=True, parents=True)

    with open(actual, "w") as file:
        json.dump(widget.chart.to_dict(), file, indent=4)

    assert filecmp.cmp(Path(dir, "baseline", "area_basic.json"), Path(dir, "actual", "area_basic.json"))
