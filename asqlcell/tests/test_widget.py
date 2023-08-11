import filecmp
import json
from pathlib import Path

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
    Check basic vega spec generated for column chart.
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


def test_generate_bar_basic(session):
    """
    Check basic vega spec generated for bar chart.
    """
    db = Path(dir, "chinook.sqlite")
    con = create_engine(f"sqlite:///{db}").connect()

    query = """
        SELECT
            SUM(Invoice.Total) AS Total,
            Employee.FirstName || ' ' || Employee.LastName AS 'Sales Agent'
        FROM Invoice
        JOIN Customer ON Invoice.CustomerId = Customer.CustomerId
        JOIN Employee ON Customer.SupportRepId = Employee.EmployeeId
        GROUP BY 2
        ORDER BY 1
        DESC
    """
    widget = SqlCellWidget(session)

    widget.run_sql(query, con)

    config: ChartConfig = {
        "type": ChartType.BAR,
        "x": {"label": None, "field": "Total", "aggregation": "sum", "sort": None},
        "y": {"label": None, "field": "Sales Agent", "aggregation": "sum", "sort": None},
        "y2": {"label": None, "field": None, "aggregation": "sum", "sort": None},
        "color": {"label": None, "field": None, "aggregation": "sum", "sort": None},
        "subtype": [],
        "width": 500,
        "height": 200,
        "legend": {"visible": True},
        "label": True,
    }

    widget.chart_config = json.dumps(config)

    assert widget.chart is not None

    actual = Path(dir, "actual", "bar_basic.json")
    actual.parent.mkdir(exist_ok=True, parents=True)

    with open(actual, "w") as file:
        json.dump(widget.chart.to_dict(), file, indent=4)

    assert filecmp.cmp(Path(dir, "baseline", "bar_basic.json"), Path(dir, "actual", "bar_basic.json"))


def test_generate_pie_basic(session):
    """
    Check basic vega spec generated for pie chart.
    """
    db = Path(dir, "chinook.sqlite")
    con = create_engine(f"sqlite:///{db}").connect()

    query = """
        SELECT
            Country,
            COUNT(CustomerId) AS Count
        FROM Customer
        GROUP BY 1
        ORDER BY 2
        DESC
        LIMIT 10
    """
    widget = SqlCellWidget(session)

    widget.run_sql(query, con)

    config: ChartConfig = {
        "type": ChartType.PIE,
        "x": {"label": None, "field": "Country", "aggregation": "sum", "sort": None},
        "y": {"label": None, "field": "Count", "aggregation": "sum", "sort": "descending"},
        "y2": {"label": None, "field": None, "aggregation": "sum", "sort": None},
        "color": {"label": None, "field": None, "aggregation": "sum", "sort": None},
        "subtype": [],
        "width": 500,
        "height": 400,
        "legend": {"visible": True},
        "label": True,
    }

    widget.chart_config = json.dumps(config)

    assert widget.chart is not None

    actual = Path(dir, "actual", "pie_basic.json")
    actual.parent.mkdir(exist_ok=True, parents=True)

    with open(actual, "w") as file:
        json.dump(widget.chart.to_dict(), file, indent=4)

    assert filecmp.cmp(Path(dir, "baseline", "pie_basic.json"), Path(dir, "actual", "pie_basic.json"))


def test_generate_line_basic(session):
    """
    Check basic vega spec generated for line chart.
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
    Check basic vega spec generated for area chart.
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


def test_generate_scatter_basic(session):
    """
    Check basic vega spec generated for scatter chart.
    """
    db = Path(dir, "chinook.sqlite")
    con = create_engine(f"sqlite:///{db}").connect()

    query = """
        SELECT
            BillingCountry,
            COUNT(DISTINCT CustomerId) AS Users,
            SUM(Total) AS Sales
        FROM Invoice
        GROUP BY 1
    """
    widget = SqlCellWidget(session)

    widget.run_sql(query, con)

    config: ChartConfig = {
        "type": ChartType.SCATTER,
        "x": {"label": None, "field": "Users", "aggregation": "sum", "sort": None},
        "y": {"label": None, "field": "Sales", "aggregation": "sum", "sort": None},
        "y2": {"label": None, "field": None, "aggregation": "sum", "sort": None},
        "color": {"label": None, "field": "BillingCountry", "aggregation": "sum", "sort": None},
        "subtype": [],
        "width": 700,
        "height": 600,
        "legend": {"visible": True},
        "label": True,
    }

    widget.chart_config = json.dumps(config)

    assert widget.chart is not None

    actual = Path(dir, "actual", "scatter_basic.json")
    actual.parent.mkdir(exist_ok=True, parents=True)

    with open(actual, "w") as file:
        json.dump(widget.chart.to_dict(), file, indent=4)

    assert filecmp.cmp(Path(dir, "baseline", "scatter_basic.json"), Path(dir, "actual", "scatter_basic.json"))


def test_generate_funnel_basic(session):
    """
    Check basic vega spec generated for funnel chart.
    """
    db = Path(dir, "chinook.sqlite")
    con = create_engine(f"sqlite:///{db}").connect()

    query = """
        SELECT
            V.column1 AS Step,
            V.column2 As Count
        FROM
        (VALUES
            ('Consultation', 140000),
            ('Prospect', 120000),
            ('Qualified', 100000),
            ('Negotiation', 80000),
            ('Prototype', 60000),
            ('Closing', 40000),
            ('Won', 20000),
            ('Finalized', 10000)
        ) [V]
    """
    widget = SqlCellWidget(session)

    widget.run_sql(query, con)

    config: ChartConfig = {
        "type": ChartType.FUNNEL,
        "x": {"label": None, "field": "Count", "aggregation": "sum", "sort": None},
        "y": {"label": None, "field": "Step", "aggregation": "sum", "sort": None},
        "y2": {"label": None, "field": None, "aggregation": "sum", "sort": None},
        "color": {"label": None, "field": None, "aggregation": "sum", "sort": None},
        "subtype": [],
        "width": 500,
        "height": 400,
        "legend": {"visible": True},
        "label": True,
    }

    widget.chart_config = json.dumps(config)

    assert widget.chart is not None

    actual = Path(dir, "actual", "funnel_basic.json")
    actual.parent.mkdir(exist_ok=True, parents=True)

    with open(actual, "w") as file:
        json.dump(widget.chart.to_dict(), file, indent=4)

    assert filecmp.cmp(Path(dir, "baseline", "funnel_basic.json"), Path(dir, "actual", "funnel_basic.json"))
