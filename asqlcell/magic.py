import logging

import __main__
from IPython.core.interactiveshell import InteractiveShell
from IPython.core.magic import Magics, cell_magic, line_magic, magics_class, needs_local_scope
from IPython.core.magic_arguments import argument, magic_arguments, parse_argstring

from asqlcell import utils
from asqlcell.utils import get_cell_id, get_duckdb_result
from asqlcell.widget import SqlCellWidget


@magics_class
class SqlMagics(Magics):
    """
    Magic extension for analytical sql cell.
    """

    def __init__(self, shell: InteractiveShell):
        super(SqlMagics, self).__init__(shell)

        self.shell = shell

    @needs_local_scope
    @line_magic("sql")
    @cell_magic("sql")
    @magic_arguments()
    @argument("-o", "--output", help="The variable name for the result dataframe.")
    @argument("-c", "--conn", help="The variable name for database connection.")
    @argument("line", default="", nargs="*", type=str, help="The SQL statement.")
    def execute(self, line="", cell="", local_ns=None):
        """
        Execute the magic extension. This could be a line magic or a cell magic.
        """
        if cell:
            # Handle cell magic where line contains parameters only.
            args = parse_argstring(self.execute, line)

            # Ensure there is a widget created for the cell.
            cell_id = "asqlcell" + self._get_cell_id()

            if self._get_widget(cell_id) is None:
                self._set_widget(cell_id)
            widget = self._get_widget(cell_id)

            # Specify parameters and execute the sql statements.
            widget.data_name = args.output
            if args.conn:
                widget.run_sql(cell, utils.get_value(args.conn))
            else:
                widget.run_sql(cell)
            return widget
        else:
            # Handle line magic where line is one line of sql statement.

            return get_duckdb_result(line)

    def _get_widget(self, variable_name) -> SqlCellWidget:
        var = getattr(__main__, variable_name, None)
        return var if isinstance(var, SqlCellWidget) else None

    def _set_widget(self, cell_id: str) -> None:
        setattr(__main__, cell_id, SqlCellWidget(mode="CMD"))

    def _get_cell_id(self) -> str:
        """
        Get cell id for the current cell by walking the stack.
        """
        for i in range(20):
            scope = self.shell.get_local_scope(i)
            if scope.get("cell_id") is not None:
                return scope["cell_id"].replace("-", "")
            if "msg" in scope:
                msg = scope.get("msg")
                if "metadata" in msg:
                    meta = msg.get("metadata")
                    if "cellId" in meta:
                        return meta.get("cellId").replace("-", "")
        logging.debug("cell id not found")
        return ""
