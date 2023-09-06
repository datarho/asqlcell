import copy
import filecmp
import json
from pathlib import Path

from sqlalchemy import create_engine

from asqlcell.chart import ChartConfig, ChartType
from asqlcell.widget import SqlCellWidget

dir = Path(__file__).parent.resolve()
db = Path(dir, "chinook.sqlite")
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


def run_cmp(session, query, config: ChartConfig, filename):
    con = create_engine(f"sqlite:///{db}").connect()
    widget = SqlCellWidget(session)
    widget.run_sql(query, con)
    widget.chart_config = json.dumps(config)
    actual = Path(dir, "actual", f"{filename}.json")
    actual.parent.mkdir(exist_ok=True, parents=True)
    with open(actual, "w") as file:
        assert type(widget.preview_vega) is str
        file.write(widget.preview_vega)
    assert filecmp.cmp(actual, Path(dir, "baseline", f"{filename}.json"))


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
    query = """
        SELECT
            Customer.Country,
            SUM(Invoice.Total) AS Total
        FROM Invoice
        JOIN Customer ON Customer.CustomerId = Invoice.CustomerId
        GROUP BY 1
        ORDER BY 2 DESC
    """
    c = copy.deepcopy(config)
    c["type"] = ChartType.COLUMN
    c["x"]["field"] = "Country"
    c["y"]["field"] = "Total"
    c["width"] = 1000
    c["height"] = 400
    run_cmp(session, query, c, "column_basic")


def test_generate_bar_basic(session):
    """
    Check basic vega spec generated for bar chart.
    """
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
    c = copy.deepcopy(config)
    c["type"] = ChartType.BAR
    c["x"]["field"] = "Total"
    c["y"]["field"] = "Sales Agent"
    c["width"] = 500
    c["height"] = 200
    run_cmp(session, query, c, "bar_basic")


def test_generate_pie_basic(session):
    """
    Check basic vega spec generated for pie chart.
    """
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
    c = copy.deepcopy(config)
    c["type"] = ChartType.PIE
    c["x"]["field"] = "Country"
    c["y"]["field"] = "Count"
    c["y"]["sort"] = "descending"
    c["width"] = 500
    c["height"] = 400
    run_cmp(session, query, c, "pie_basic")


def test_generate_line_basic(session):
    """
    Check basic vega spec generated for line chart.
    """
    query = """
        SELECT
            BillingCountry,
            date(InvoiceDate, 'start of month') AS Date,
            SUM(Total) AS Total
        FROM Invoice
        GROUP BY 1, 2
        HAVING BillingCountry IN ('USA', 'Canada', 'France')
    """
    c = copy.deepcopy(config)
    c["type"] = ChartType.LINE
    c["x"]["field"] = "Date"
    c["x"]["sort"] = "ascending"
    c["y"]["field"] = "Total"
    c["color"]["field"] = "BillingCountry"
    c["width"] = 1000
    c["height"] = 400
    run_cmp(session, query, c, "line_basic")


def test_generate_line_with_label(session):
    """
    Check basic vega spec generated for line chart.
    """
    query = """
        SELECT
            BillingCountry,
            date(InvoiceDate, 'start of month') AS Date,
            SUM(Total) AS Total
        FROM Invoice
        GROUP BY 1, 2
        HAVING BillingCountry IN ('USA', 'Canada', 'France')
    """
    c = copy.deepcopy(config)
    c["type"] = ChartType.LINE
    c["x"]["field"] = "Date"
    c["x"]["sort"] = "ascending"
    c["y"]["field"] = "Total"
    c["color"]["field"] = "BillingCountry"
    c["width"] = 1000
    c["height"] = 400
    c["label"] = True
    run_cmp(session, query, c, "line_with_label")


def test_generate_area_basic(session):
    """
    Check basic vega spec generated for area chart.
    """
    query = """
        SELECT
            BillingCountry,
            date(InvoiceDate, 'start of month') AS Date,
            SUM(Total) AS Total
        FROM Invoice
        GROUP BY 1, 2
        HAVING BillingCountry IN ('USA', 'Canada', 'France')
    """
    c = copy.deepcopy(config)
    c["type"] = ChartType.AREA
    c["x"]["field"] = "Date"
    c["x"]["sort"] = "ascending"
    c["y"]["field"] = "Total"
    c["color"]["field"] = "BillingCountry"
    c["width"] = 1000
    c["height"] = 400
    run_cmp(session, query, c, "area_basic")


def test_generate_scatter_basic(session):
    """
    Check basic vega spec generated for scatter chart.
    """
    query = """
        SELECT
            BillingCountry,
            COUNT(DISTINCT CustomerId) AS Users,
            SUM(Total) AS Sales
        FROM Invoice
        GROUP BY 1
    """
    c = copy.deepcopy(config)
    c["type"] = ChartType.SCATTER
    c["x"]["field"] = "Users"
    c["y"]["field"] = "Sales"
    c["color"]["field"] = "BillingCountry"
    c["width"] = 700
    c["height"] = 600
    run_cmp(session, query, c, "scatter_basic")


def test_generate_scatter_with_no_legend(session):
    """
    Check basic vega spec generated for scatter chart.
    """
    query = """
        SELECT
            BillingCountry,
            COUNT(DISTINCT CustomerId) AS Users,
            SUM(Total) AS Sales
        FROM Invoice
        GROUP BY 1
    """
    c = copy.deepcopy(config)
    c["type"] = ChartType.SCATTER
    c["x"]["field"] = "Users"
    c["y"]["field"] = "Sales"
    c["color"]["field"] = "BillingCountry"
    c["width"] = 700
    c["height"] = 600
    c["legend"]["visible"] = False
    run_cmp(session, query, c, "scatter_no_legend")


def test_generate_funnel_basic(session):
    """
    Check basic vega spec generated for funnel chart.
    """
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
    c = copy.deepcopy(config)
    c["type"] = ChartType.FUNNEL
    c["x"]["field"] = "Count"
    c["y"]["field"] = "Step"
    c["width"] = 500
    c["height"] = 400
    run_cmp(session, query, c, "funnel_basic")


def test_generate_combo_basic(session):
    """
    Check basic vega spec generated for combo chart.
    """
    query = """
        SELECT
            BillingCountry,
            date(InvoiceDate, 'start of month') AS Date,
            SUM(Total) AS Total
        FROM Invoice
        GROUP BY 1, 2
        HAVING BillingCountry IN ('USA', 'Canada', 'France')
    """
    c = copy.deepcopy(config)
    c["type"] = ChartType.COMBO
    c["x"]["field"] = "BillingCountry"
    c["y"]["field"] = "Total"
    c["y2"]["field"] = "Total"
    c["width"] = 100
    c["height"] = 500
    run_cmp(session, query, c, "combo_basic")


def test_generate_sunburst_basic(session):
    query = """
        WITH Geo(Country, Continent) AS 
        (
            VALUES 
            ('USA', 'North America'),
            ('Canada', 'North America'),
            ('France', 'Europe'),
            ('Brazil', 'South America'),
            ('Germany', 'Europe'),
            ('United Kingdom', 'Europe'),
            ('Portugal', 'Europe'),
            ('India', 'Asia'),
            ('Czech Republic', 'Europe'),
            ('Sweden', 'Europe')
        )
        SELECT
            Customer.Country,
            Geo.Continent,
            COUNT(Customer.CustomerId) AS Count
        FROM Customer
        JOIN Geo ON Customer.Country = Geo.Country
        GROUP BY 1, 2
        ORDER BY 3 DESC
        LIMIT 10
    """
    c = copy.deepcopy(config)
    c["type"] = ChartType.SUNBURST
    c["x"]["field"] = "Continent"
    c["x2"]["field"] = "Country"
    c["y"]["field"] = "Count"
    c["width"] = 500
    c["height"] = 400
    run_cmp(session, query, c, "sunburst_basic")
