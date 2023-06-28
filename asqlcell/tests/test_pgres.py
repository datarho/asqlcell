from pathlib import Path

from IPython.core.interactiveshell import InteractiveShell
from pandas import DataFrame
from sqlalchemy import create_engine, inspect

dir = Path(__file__).parent.resolve()


def test_sqlite_standalone_metadata(shell: InteractiveShell):
    conn = create_engine(
        "postgresql+pg8000://postgres:123456@localhost:5432/",
    ).connect()

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


def test_sqlite_standalone_cell_magic(
    shell: InteractiveShell, cell_id="076b741a-37f9-49c7-ad1f-d84fa5045a24"
):
    con = create_engine(
        "postgresql+pg8000://postgres:123456@localhost:5432/",
    ).connect()

    shell.user_global_ns["con"] = con

    shell.run_cell_magic(
        "sql",
        "--out out --con con",
        """
        SELECT * FROM "Genre"
        """,
    )

    out = shell.user_global_ns.get("out")

    assert type(out) is DataFrame

    assert out.columns.values.tolist() == ["GenreId", "Name"]
    assert out.shape == (25, 2)

    shell.run_cell_magic(
        "sql",
        "--out out --con con",
        """
        SELECT "AlbumId", count("Name") AS Albums
        FROM "Artist" As a LEFT JOIN "Album" As b ON a."ArtistId"=b."ArtistId"
        GROUP BY "AlbumId"
        ORDER BY Albums DESC;
        """,
    )

    out = shell.user_global_ns.get("out")

    assert type(out) is DataFrame
    assert out.columns.values.tolist()[0] == "AlbumId"
