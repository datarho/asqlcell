import pytest
from ipykernel.comm import Comm
from IPython.core.interactiveshell import InteractiveShell
from IPython.testing.globalipapp import start_ipython
from ipywidgets import Widget

from asqlcell.magic import SqlMagics


@pytest.fixture(scope="session")
def session() -> InteractiveShell:
    yield start_ipython()


@pytest.fixture(scope="session")
def shell(session) -> InteractiveShell:
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


_widget_attrs = {}
undefined = object()


@pytest.fixture
def mock_comm():
    _widget_attrs["_comm_default"] = getattr(Widget, "_comm_default", undefined)
    Widget._comm_default = lambda self: MockComm()
    _widget_attrs["_ipython_display_"] = Widget._ipython_display_

    def raise_not_implemented(*args, **kwargs):
        raise NotImplementedError()

    Widget._ipython_display_ = raise_not_implemented

    yield MockComm()

    for attr, value in _widget_attrs.items():
        if value is undefined:
            delattr(Widget, attr)
        else:
            setattr(Widget, attr, value)
