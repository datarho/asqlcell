import json
from typing import Union

import requests
from IPython.core.display import HTML
from IPython.core.interactiveshell import InteractiveShell
from IPython.core.magic import Magics, cell_magic, line_magic, magics_class
from IPython.core.magic_arguments import argument, magic_arguments, parse_argstring
from IPython.display import display
from pandas import DataFrame

from asqlcell.utils import get_cell_id, get_duckdb_result, get_connection
from asqlcell.widget import SqlCellWidget


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
    @argument("line", default="", nargs="*", type=str, help="The SQL statement.")
    def execute(self, line="", cell=""):
        """
        Execute the magic extension. This could be a line magic or a cell magic.
        """
        if cell:
            return self._handle_cell_magic(line, cell)
        else:
            return self._handle_line_magic(line)

    def _handle_line_magic(self, line: str) -> DataFrame:
        """
        Handle line magic.
        """
        return get_duckdb_result(self.shell, line)

    def _handle_cell_magic(self, line: str, cell: str) -> SqlCellWidget:
        """
        Handle cell magic. Line contains parameters only.
        """
        args = parse_argstring(self.execute, line)

        # Ensure there is a widget created for the cell.
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
            con = get_connection(self.shell, args.con)
            if args.explain:
                widget.explainsql(cell, con, args.explain)
            else:
                widget.run_sql(cell, con)
        else:
            widget.run_sql(cell)
        display(HTML(""), display_id=widget.cell_id)
        return widget

    def _get_widget(self, var_name: str) -> Union[SqlCellWidget, None]:
        """
        Get sql cell widget variable by the given name and type. None will be returned if type is incorrect.
        """
        var = self.shell.user_global_ns.get(var_name)

        return var if type(var) is SqlCellWidget else None

    def _set_widget(self, cell_id: str) -> None:
        """
        Set new sql cell widget with the given name.
        """
        self.shell.user_global_ns[cell_id] = SqlCellWidget(
            shell=self.shell, cell_id=cell_id
        )

    def displayAns(self, q, a):
        from IPython.core.display import Markdown, display

        display(Markdown(f"Question: {q}\nAnswer: " + a))

    def get_baidu_token(self, api_key, secret_key):
        url = f"https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id={api_key}&client_secret={secret_key}"
        payload = ""
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        response = requests.request("POST", url, headers=headers, data=payload)
        self.access_token = json.loads(response.text)["access_token"]

    def get_baidu_result(self, query):
        url = f"https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/eb-instant?access_token={self.access_token}"
        payload = json.dumps(
            {"messages": [{"role": "user", "content": query}], "stream": True}
        )
        headers = {"Content-Type": "application/json"}
        response = requests.request("POST", url, headers=headers, data=payload)
        ll = [
            item.replace("data: ", "")
            for item in response.text.split("\n\n")
            if len(item) > 200
        ]
        self.displayAns(query, "".join([json.loads(item)["result"] for item in ll]))

    def get_openai_result(self, query):
        import openai

        openai.api_key = self.api_key
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-0613", messages=[{"role": "user", "content": query}]
        )
        self.displayAns(query, response.choices[0].message.content)  # type: ignore

    @cell_magic("chat")
    @magic_arguments()
    @argument("--to", nargs="?", type=str)
    @argument("--apikey", nargs="?", type=str)
    @argument("--secretkey", nargs="?", type=str)
    @argument("--accesstoken", nargs="?", type=str)
    def chat(self, line="", cell=""):
        args = parse_argstring(self.chat, line)
        if args.to:
            self.chat_to = args.to
        if args.accesstoken:
            self.access_token = args.accesstoken
        if self.chat_to == "openai" and args.apikey:
            self.api_key = args.apikey
        if args.apikey and args.secretkey:
            self.get_baidu_token(args.apikey, args.secretkey)
        if self.chat_to == "openai":
            self.get_openai_result(cell)
        else:
            self.get_baidu_result(cell)
