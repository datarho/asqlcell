from IPython.core.magic import register_cell_magic, register_line_magic, needs_local_scope
from ipywidgets import DOMWidget
from traitlets import Unicode, Tuple, Int, observe, HasTraits
import json
import datetime
import IPython
import sqlparse
import __main__
from .jinjasql import JinjaSql
from .utils import get_duckdb, get_duckdb_result, get_value, get_vars, get_histogram

module_name = "asqlcell"
module_version = "0.1.0"

@needs_local_scope
@register_cell_magic
def sql(line, cell='', local_ns={}):
    cellid = 'asqlcell' + get_cell_id()
    if get_value(cellid) == None:
        setattr(__main__, cellid, SqlcellWidget(mode='CMD'))
    w = get_value(cellid)
    w.data_name = line.strip()
    w.data_sql = cell
    w.run_sql()
    return w

@register_line_magic
def sql(line=""):
    return get_duckdb_result(line)

def get_cell_id():
    for i in range(20):
        scope = IPython.get_ipython().get_local_scope(i)
        if scope.get('cell_id') != None:
            return scope['cell_id'].replace('-', '')
        if 'msg' in scope:
            msg = scope.get('msg')
            if 'metadata' in msg:
                meta = msg.get('metadata')
                if 'cellId' in meta:
                    return meta.get('cellId').replace('-', '')
    print("NO CELL_ID")
    return ''

class SqlcellWidget(DOMWidget, HasTraits):
    _model_name = Unicode('SqlCellModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('SqlCellView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    output_var = Unicode('sqlcelldf').tag(sync=True)
    row_range = Tuple(Int(), Int(), default_value=(0, 10)).tag(sync=True)
    column_sort = Tuple(Unicode(), Int(), default_value=('', 0)).tag(sync=True)
    dfs_button = Unicode('').tag(sync=True)
    dfs_result = Unicode('').tag(sync=True)
    sql_button = Unicode('').tag(sync=True)
    title_hist = Unicode('').tag(sync=True)
    mode = Unicode('').tag(sync=True)
    data_grid = Unicode('').tag(sync=True)
    exec_time = Unicode('').tag(sync=True)
    data_sql = Unicode('').tag(sync=True)
    data_name = Unicode('').tag(sync=True)
    vis_sql = Tuple(Unicode(''), Unicode(''), default_value=('', '')).tag(sync=True)
    vis_data = Unicode('').tag(sync=True)
    error = Unicode('').tag(sync=True)

    def __init__(self, sql='', mode="UI"):
        super(SqlcellWidget, self).__init__()
        self.mode = mode

    def run_sql(self):
        try:
            if len(self.data_name) == 0:
                self.data_name = "__" + get_cell_id()
            time = datetime.datetime.now()
            res = sqlparse.format(self.data_sql, strip_comments=True, reindent=True)
            jsql = JinjaSql(param_style="qmark")
            res, vlist = jsql.prepare_query(res, get_vars())
            setattr(__main__, self.data_name, get_duckdb_result(res, vlist))
            self.row_range = (0, self.row_range[1] - self.row_range[0])
            self.column_sort = ('', 0)
            self.title_hist = str(json.dumps(get_histogram(get_value(self.data_name))))
            self.exec_time = str(time) + "," + str(datetime.datetime.now())
            self.set_data_grid()
        except Exception as r:
            self.error = str(r)

    def set_data_grid(self):
        df = get_value(self.data_name)
        self.data_grid = str(df[self.row_range[0] : self.row_range[1]].to_json(orient="split", date_format='iso')) + "\n" + str(len(df))

    @observe('dfs_button')
    def on_dfs_button(self, change):
        result = ""
        for k, v in get_vars(is_df=True).items():
            result += k + "\t" + str(v.shape) + "\n"
        self.dfs_result = result

    @observe('sql_button')
    def on_sql_button(self, change):
        self.data_name = self.output_var
        self.run_sql()

    @observe('row_range')
    def on_row_range(self, change):
        self.set_data_grid()

    @observe('column_sort')
    def on_column_sort(self, change):
        sort_by = change.new[0]
        sort_ascending = change.new[1]
        df = get_value(self.data_name)
        df.sort_index(axis=0, inplace=True)
        if (sort_ascending != 0):
            df.sort_values(by=sort_by, ascending=(True if sort_ascending > 0 else False), inplace=True, kind='stable')
        self.set_data_grid()

    @observe('vis_sql')
    def on_vis_sql(self, change):
        get_duckdb().register(self.data_name, get_value(self.data_name))
        df = get_duckdb().execute(change.new[0].replace("$$__NAME__$$", self.data_name)).df()
        get_duckdb().unregister(self.data_name)
        self.vis_data = str(df.to_json(orient="split", date_format='iso'))