from pathlib import Path
from typing import cast

import __main__
from IPython.core.interactiveshell import InteractiveShell
from pandas import DataFrame
from sqlalchemy import Connection, create_engine, inspect

dir = Path(__file__).parent.resolve()


def test_duckdb_conn_embedded_line_magic(shell: InteractiveShell):
    file = Path(dir, "gapminder.csv.gz")
    sql = """
        SELECT * FROM '{file}'
    """.format(
        file=file
    )

    result = cast(DataFrame, shell.run_line_magic("sql", sql))

    assert list(result.columns) == ["country", "year", "population", "continent", "life_exp", "gdp_cap"]
    assert result.shape == (1704, 6)


def test_duckdb_conn_embedded_cell_magic(shell: InteractiveShell, cell_id="076b741a-37f9-49c7-ad1f-d84fa5045a24"):
    file = Path(dir, "gapminder.csv.gz")
    sql = """
        SELECT * FROM '{file}'
    """.format(
        file=file
    )

    shell.run_cell_magic("sql", "--out out", sql)

    out = shell.user_global_ns.get("out")

    assert list(out.columns) == ["country", "year", "population", "continent", "life_exp", "gdp_cap"]
    assert out.shape == (1704, 6)


def test_duckdb_conn_standalone_metadata(shell: InteractiveShell):
    file = Path(dir, "chinook.duckdb")
    conn = create_engine(
        "duckdb:///{file}".format(file=file),
    ).connect()

    tables = inspect(conn).get_table_names()
    chinook = [
        "album",
        "artist",
        "customer",
        "employee",
        "genre",
        "invoice",
        "invoiceline",
        "mediatype",
        "playlist",
        "playlisttrack",
        "track",
    ]

    assert sorted(tables) == chinook


def test_duckdb_conn_standalone_cell_magic(shell: InteractiveShell):
    file = Path(dir, "chinook.duckdb")

    con = create_engine(
        "duckdb:///{file}".format(file=file),
    ).connect()

    shell.user_global_ns.setdefault("con", con)

    shell.run_cell_magic(
        "sql",
        "--out out --con con",
        """
        SELECT * FROM genre
        """,
    )

    out = shell.user_global_ns.get("out")

    assert out.columns.values.tolist() == ["GenreId", "Name"]
    assert out.shape == (25, 2)

    shell.run_cell_magic(
        "sql",
        "--out out --con con",
        """
        SELECT Name, count(AlbumId) AS Albums
        FROM Artist LEFT JOIN Album ON Artist.ArtistId=Album.ArtistId
        GROUP BY Name
        ORDER BY Albums DESC
        """,
    )

    out = shell.user_global_ns.get("out")

    assert out.columns.values.tolist() == ["Name", "Albums"]
    assert out.shape == (29, 2)
