from typing import Generator

import pytest
from ipykernel.comm import Comm
from IPython.core.interactiveshell import InteractiveShell
from IPython.testing.globalipapp import start_ipython


@pytest.fixture(scope="session")
def session() -> InteractiveShell:
    yield start_ipython()  # type: ignore


@pytest.fixture(scope="function")
def shell(session: InteractiveShell) -> Generator[InteractiveShell, None, None]:
    session.run_line_magic(magic_name="load_ext", line="asqlcell")
    yield session
    session.run_line_magic(magic_name="unload_ext", line="asqlcell")
    session.run_line_magic(magic_name="reset", line="-f")


class MockComm(Comm):
    """A mock Comm object.

    Can be used to inspect calls to Comm's open/send/close methods.
    """

    comm_id = "a-b-c-d"
    kernel = "Truthy"

    def __init__(self, *args, **kwargs):
        self.log_open = []
        self.log_send = []
        self.log_close = []
        super(MockComm, self).__init__(*args, **kwargs)

    def open(self, *args, **kwargs):
        self.log_open.append((args, kwargs))

    def send(self, *args, **kwargs):
        self.log_send.append((args, kwargs))

    def close(self, *args, **kwargs):
        self.log_close.append((args, kwargs))
