import __main__
from IPython.core.magic import needs_local_scope, register_cell_magic, register_line_magic

from asqlcell.utils import get_cell_id, get_duckdb_result, get_value
from asqlcell.widget import SqlCellWidget


@needs_local_scope
@register_cell_magic
def sql(line, cell="", local_ns={}):
    cell_id = "asqlcell" + get_cell_id()
    if get_value(cell_id) == None:
        setattr(__main__, cell_id, SqlCellWidget(mode="CMD"))
    w = get_value(cell_id)
    w.data_name = line.strip()
    w.run_sql(cell)
    return w


@register_line_magic
def sql(line=""):
    return get_duckdb_result(line)
