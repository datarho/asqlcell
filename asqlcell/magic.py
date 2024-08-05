from IPython.core.interactiveshell import InteractiveShell
from IPython.core.magic import Magics, cell_magic, line_magic, magics_class
from IPython.core.magic_arguments import argument, magic_arguments, parse_argstring


@magics_class
class SqlMagics(Magics):
    """
    Magic extension for analytical sql cell.
    """

    def __init__(self, shell: InteractiveShell):
        super(SqlMagics, self).__init__(shell)
        self.shell = shell
        self.access_token = None
        self.api_key = None
        self.chat_to = None

    @line_magic("sql")
    @cell_magic("sql")
    @magic_arguments()
    @argument(
        "output",
        nargs="?",
        type=str,
        help="The variable name for the result dataframe.",
    )
    @argument(
        "-o", "--out", type=str, help="The variable name for the result dataframe."
    )
    @argument(
        "-c", "--con", type=str, help="The variable name for database connection."
    )
    @argument("-e", "--explain", type=str, help="Return Sql Explain or not.")
    @argument("-d", "--db", type=str, help="Use database.")
    @argument("line", default="", nargs="*", type=str, help="The SQL statement.")
    def execute(self, line="", cell=""):
        """
        Execute the magic extension. This could be a line magic or a cell magic.
        """
        if cell:
            return self._handle_cell_magic(line, cell)
        else:
            return self._handle_line_magic(line)

    def _handle_line_magic(self, line: str):
        """
        Handle line magic.
        """
        from asqlcell.utils import get_duckdb_result

        return get_duckdb_result(self.shell, line)

    def _handle_cell_magic(self, line: str, cell: str):
        """
        Handle cell magic. Line contains parameters only.
        """
        args = parse_argstring(self.execute, line)

        # Ensure there is a widget created for the cell.
        from asqlcell.utils import get_cell_id

        cell_id = "asqlcell" + get_cell_id(self.shell)

        if self._get_widget(cell_id) is None:
            self._set_widget(cell_id)
        widget = self._get_widget(cell_id)

        if widget is None:
            raise NameError("Failed to find widget with given cell id")

        # Specify parameters and execute the sql statements.
        if args.output:
            widget.data_name = args.output
        if args.out:
            widget.data_name = args.out
        if args.con:
            from asqlcell.utils import get_connection

            con = get_connection(self.shell, args.con)
            if args.db:
                from sqlalchemy import text

                con.execute(text("use " + args.db))
            if args.explain:
                widget.explainsql(cell, con, args.explain)
            else:
                widget.run_sql(cell, con)
        else:
            widget.run_sql(cell)
        from IPython.display import display
        from IPython.core.display import HTML

        display(HTML(""), display_id=widget.cell_id)
        return widget

    def _get_widget(self, var_name: str):
        """
        Get sql cell widget variable by the given name and type. None will be returned if type is incorrect.
        """
        var = self.shell.user_global_ns.get(var_name)
        from asqlcell.widget import SqlCellWidget

        return var if type(var) is SqlCellWidget else None

    def _set_widget(self, cell_id: str) -> None:
        """
        Set new sql cell widget with the given name.
        """
        from asqlcell.widget import SqlCellWidget

        self.shell.user_global_ns[cell_id] = SqlCellWidget(
            shell=self.shell, cell_id=cell_id
        )
