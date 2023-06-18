from pathlib import Path

from IPython.core.interactiveshell import InteractiveShell
from pandas import DataFrame

dir = Path(__file__).parent.resolve()


def execute_sql(shell: InteractiveShell, sql: str) -> DataFrame:
    return shell.run_line_magic("sql", sql)


def test_inline_magic(shell: InteractiveShell):
    file = Path(dir, "data_taxi_zone_lookup.csv")
    result = shell.run_line_magic("sql", "SELECT * FROM '{file}'".format(file=file))

    assert result.shape == (265, 4)
