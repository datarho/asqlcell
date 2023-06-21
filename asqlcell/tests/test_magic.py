from pathlib import Path

import __main__
from IPython.core.interactiveshell import InteractiveShell
from pandas import DataFrame

dir = Path(__file__).parent.resolve()


def execute_sql(shell: InteractiveShell, sql: str) -> DataFrame:
    return shell.run_line_magic("sql", sql)


def test_inline_magic(shell: InteractiveShell):
    file = Path(dir, "data_taxi_zone_lookup.csv")
    result = shell.run_line_magic("sql", "SELECT * FROM '{file}'".format(file=file))

    assert result.shape == (265, 4)


def test_cell_magic(shell: InteractiveShell, cell_id="076b741a-37f9-49c7-ad1f-d84fa5045a24"):
    file = Path(dir, "data_taxi_zone_lookup.csv")

    shell.run_cell_magic("sql", "-o result", "SELECT * FROM '{file}'".format(file=file))

    result = getattr(__main__, "result", None)

    assert result.shape == (265, 4)
