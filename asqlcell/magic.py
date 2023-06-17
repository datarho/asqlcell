import __main__
from IPython.core.magic import Magics, cell_magic, line_magic, magics_class, needs_local_scope
from IPython.core.magic_arguments import argument, magic_arguments, parse_argstring

from asqlcell.utils import get_cell_id, get_duckdb_result
from asqlcell.widget import SqlCellWidget


@magics_class
class SqlMagics(Magics):
    @needs_local_scope
    @line_magic("sql")
    @cell_magic("sql")
    @magic_arguments()
    @argument("-o", "--output", help="The variable name for the result dataframe.", required=True)
    @argument("line", default="", nargs="*", type=str, help="The SQL statement.")
    def execute(self, line="", cell="", local_ns=None):
        """
        Execute the magic extension. This could be a line magic or a cell magic.
        """
        if cell:
            # Handle cell magic where line contains parameters only.
            args = parse_argstring(self.execute, line)

            # Ensure there is a widget created for the cell.
            cell_id = "asqlcell" + get_cell_id()
            if self._get_widget(cell_id) == None:
                self._set_widget(cell_id)
            widget = self._get_widget(cell_id)

            # Specify parameters and execute the sql statements.
            widget.data_name = args.output
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
