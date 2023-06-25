from pathlib import Path

from IPython.core.interactiveshell import InteractiveShell
from pandas import DataFrame
from sqlalchemy import create_engine, inspect

dir = Path(__file__).parent.resolve()


def test_duckdb_conn_embedded_line_magic(shell: InteractiveShell):
    file = Path(dir, "gapminder.csv.gz")
    sql = f"SELECT * FROM '{file}'"

    result = shell.run_line_magic("sql", sql)

    assert type(result) is DataFrame

    assert list(result.columns) == [
        "country",
        "year",
        "population",
        "continent",
        "life_exp",
        "gdp_cap",
    ]
    assert result.shape == (1704, 6)


def test_duckdb_conn_embedded_cell_magic(shell: InteractiveShell, cell_id="076b741a-37f9-49c7-ad1f-d84fa5045a24"):
    file = Path(dir, "gapminder.csv.gz")
    sql = f"SELECT * FROM '{file}'"

    shell.run_cell_magic("sql", "--out out", sql)

    out = shell.user_global_ns.get("out")

    assert type(out) is DataFrame

    assert list(out.columns) == [
        "country",
        "year",
        "population",
        "continent",
        "life_exp",
        "gdp_cap",
    ]
    assert out.shape == (1704, 6)


def test_duckdb_conn_standalone_metadata(shell: InteractiveShell):
    file = Path(dir, "chinook.duckdb")
    conn = create_engine(f"duckdb:///{file}").connect()

    tables = inspect(conn).get_table_names()
    chinook = [
        "Album",
        "Artist",
        "Customer",
        "Employee",
        "Genre",
        "Invoice",
        "InvoiceLine",
        "MediaType",
        "Playlist",
        "PlaylistTrack",
        "Track",
    ]

    assert sorted(tables) == chinook


def test_duckdb_conn_standalone_cell_magic(shell: InteractiveShell, cell_id="076b741a-37f9-49c7-ad1f-d84fa5045a24"):
    file = Path(dir, "chinook.duckdb")
    con = create_engine(f"duckdb:///{file}").connect()

    shell.user_global_ns["con"] = con

    shell.run_cell_magic(
        "sql",
        "--out out --con con",
        """
        SELECT * FROM Album
        """,
    )

    out = shell.user_global_ns.get("out")

    assert type(out) is DataFrame

    assert out.columns.values.tolist() == ["AlbumId", "Title", "ArtistId"]
    assert out.shape == (347, 3)

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

    assert type(out) is DataFrame

    assert out.columns.values.tolist() == ["Name", "Albums"]
    assert out.shape == (275, 2)
