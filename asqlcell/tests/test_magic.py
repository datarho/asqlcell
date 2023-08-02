from pathlib import Path

from IPython.core.interactiveshell import InteractiveShell
from IPython.utils.capture import capture_output
from pandas import DataFrame
from pytest import raises

dir = Path(__file__).parent.resolve()


def test_shell(shell: InteractiveShell):
    with capture_output() as captured:
        shell.run_cell("print('hello world')")
    assert captured.stdout == "hello world\n"


def test_inline_magic(shell: InteractiveShell):
    result = shell.run_line_magic("sql", "SELECT 'hello world'")

    assert type(result) is DataFrame

    assert result.loc[0][0] == "hello world"


def test_cell_magic_with_result(shell: InteractiveShell, cell_id="076b741a-37f9-49c7-ad1f-d84fa5045a24"):
    shell.run_cell_magic("sql", "--out result", "SELECT 'hello world'")

    # Get the result from running the cell.

    result = shell.run_cell("result").result

    assert type(result) is DataFrame

    assert result.loc[0][0] == "hello world"

    # Get the result from user global namespace.

    result = shell.user_global_ns.get("result")

    assert type(result) is DataFrame

    assert result.loc[0][0] == "hello world"


def test_cell_magic_with_no_name(shell: InteractiveShell, cell_id="076b741a-37f9-49c7-ad1f-d84fa5045a24"):
    shell.run_cell_magic("sql", "result", "SELECT 'hello world'")

    # Get the result from running the cell.

    result = shell.run_cell("result").result

    assert type(result) is DataFrame

    assert result.loc[0][0] == "hello world"

    # Get the result from user global namespace.

    result = shell.user_global_ns.get("result")

    assert type(result) is DataFrame

    assert result.loc[0][0] == "hello world"


def test_cell_magic_with_two_name(shell: InteractiveShell, cell_id="076b741a-37f9-49c7-ad1f-d84fa5045a24"):
    shell.run_cell_magic("sql", "foo -o result", "SELECT 'hello world'")

    # Ensure the positional argument did not get created.

    foo = shell.user_global_ns.get("foo")

    assert foo is None

    # Get the result from running the cell.

    result = shell.run_cell("result").result

    assert type(result) is DataFrame

    assert result.loc[0][0] == "hello world"

    # Get the result from user global namespace.

    result = shell.user_global_ns.get("result")

    assert type(result) is DataFrame

    assert result.loc[0][0] == "hello world"


def test_cell_magic_with_undefined_con(shell: InteractiveShell, cell_id="076b741a-37f9-49c7-ad1f-d84fa5045a24"):
    with raises(NameError):
        shell.run_cell_magic("sql", "--out result --con con", "SELECT 'hello world'")
