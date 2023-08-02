import filecmp
import json
from pathlib import Path

from IPython.core.interactiveshell import InteractiveShell
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
            Customer.FirstName || ' ' || Customer.LastName AS Customer,
            SUM(Invoice.Total) AS Total
        FROM Invoice
        JOIN Customer ON Customer.CustomerId = Invoice.CustomerId
        GROUP BY 1, 2
        ORDER BY 3 DESC
        """
    widget = SqlCellWidget(session)

    widget.run_sql(query, con)

    config: ChartConfig = {
        "type": ChartType.COLUMN,
        "x": "Country",
        "y": "Total",
        "color": None,
        "theta": None,
        "aggregation": "sum",
        "subtype": [],
        "sort": None,
        "width": 0,
        "height": 0,
    }

    chart = widget._generate_column(config)

    assert chart is not None

    actual = Path(dir, "actual", "column_basic.json")
    actual.parent.mkdir(exist_ok=True, parents=True)

    with open(actual, "w") as file:
        json.dump(chart.to_dict(), file, indent=4)

    assert filecmp.cmp(Path(dir, "baseline", "column_basic.json"), Path(dir, "actual", "column_basic.json"))
