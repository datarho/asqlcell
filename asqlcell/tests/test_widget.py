from ..widget import SqlCellWidget


def test_widget_creation_blank():
    w = SqlCellWidget()
    assert w._model_name == "SqlCellModel"
    assert w._model_module == "asqlcell"
    assert w._model_module_version == "0.1.0"
    assert w._view_name == "SqlCellView"
    assert w._view_module == "asqlcell"
    assert w._view_module_version == "0.1.0"
