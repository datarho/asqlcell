import duckdb
import numpy as np
from IPython.core.interactiveshell import InteractiveShell
from pandas import DataFrame
from sqlalchemy import Connection
import zlib

__DUCKDB = None


def get_cell_id(shell: InteractiveShell) -> str:
    """
    Get cell id for the current cell by walking the stack.
    """
    i = 0
    while True:
        scope = shell.get_local_scope(i)
        if scope.get("cell_id") is not None:
            return scope["cell_id"].replace("-", "")
        if "msg" in scope:
            msg = scope["msg"]
            if "metadata" in msg:
                meta = msg.get("metadata")
                if "cellId" in meta:
                    return meta.get("cellId").replace("-", "")
        i += 1


def get_duckdb():
    global __DUCKDB
    if not __DUCKDB:
        __DUCKDB = duckdb.connect(database=":memory:", read_only=False)
    return __DUCKDB


def get_duckdb_result(shell: InteractiveShell, sql, vlist=[]):
    for k, v in get_vars(shell, is_df=True).items():
        try:
            get_duckdb().register(k, v)
        except Exception:
            pass
    df = get_duckdb().execute(sql, vlist).df()
    for k, v in get_vars(shell, is_df=True).items():
        try:
            get_duckdb().unregister(k)
        except Exception:
            pass
    return df


def get_connection(shell: InteractiveShell, var_name: str) -> Connection:
    """
    Get sql alchemy connection by the given name. Error will be thrown if type is incorrect.
    """
    var = shell.user_global_ns.get(var_name)
    if type(var) is not Connection:
        raise NameError("Failed to find connection variable")
    return var


def get_vars(shell: InteractiveShell, is_df=False):
    vars = {}
    for k, v in shell.user_global_ns.items():
        if not is_df or not k.startswith("_") and type(v) is DataFrame:
            vars[k] = v
    return vars


def is_type_numeric(dtype):
    # if pd.api.types.is_datetime64_any_dtype(dtype) or pd.api.types.is_timedelta64_dtype(dtype):
    #    return True
    try:
        return np.issubdtype(dtype, np.number)
    except TypeError:
        return False


def dtype_str(kind):
    if kind == "b":
        return "bool"
    elif kind in ("i", "u"):
        return "int"
    elif kind in ("f", "c"):
        return "float"
    elif kind == "M":
        return "datetime"
    else:
        return "string"


def get_histogram(df: DataFrame):
    hist = []

    for column in df:
        col = df[column]
        if is_type_numeric(col.dtypes):
            np_array = np.array(col.replace([np.inf, -np.inf], np.nan).dropna())
            y, bins = np.histogram(np_array, bins=10)
            hist.append(
                {
                    "columnName": column,
                    "dtype": dtype_str(df.dtypes[str(column)].kind),
                    "bins": [
                        {
                            "bin_start": bins[i],
                            "bin_end": bins[i + 1],
                            "count": count.item(),
                        }
                        for i, count in enumerate(y)
                    ],
                }
            )
        else:
            col = col.astype(str)
            unique_values, value_counts = np.unique(col, return_counts=True)
            sorted_indexes = np.flip(np.argsort(value_counts))
            bins = []
            sum = 0
            for i, si in enumerate(sorted_indexes):
                if i < 3:
                    bins.append(
                        {
                            "bin": str(unique_values[si]),
                            "count": value_counts[si].item(),
                        }
                    )
                else:
                    sum += value_counts[si].item()
            bins.append({"bin": "other", "count": sum})
            hist.append(
                {
                    "columnName": column,
                    "dtype": dtype_str(df.dtypes[str(column)].kind),
                    "bins": bins,
                }
            )

    return hist


class NoTracebackException(Exception):
    def _render_traceback_(self):
        red_text = "\033[0;31m"
        black_text = "\033[0m"
        return [f"{red_text}Exception{black_text}: {str(self)}"]


def calculate_adler32_checksum(file_path) -> int:
    checksum = zlib.adler32(b"")
    with open(file_path, "rb") as file:
        checksum = zlib.adler32(file.read())
    return checksum


def check_duplicate(self, *args):
    li = [item for item in args if item is not None]
    if len(li) == 0:
        return
    select = ",".join([f"'{item}'" for item in li])
    group = ",".join([str(i + 1) for i in range(len(li))])
    name = self.data_name
    get_duckdb_result(
        self.shell,
        f"select {select} from {name} group by {group} having count(*) > 1",
    )
