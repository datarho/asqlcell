def test_labextension_path():
    from asqlcell import _jupyter_labextension_paths

    path = _jupyter_labextension_paths()

    assert len(path) == 1
    assert path[0] == {"src": "labextension", "dest": "asqlcell"}


def test_nbextension_path():
    from asqlcell import _jupyter_nbextension_paths

    path = _jupyter_nbextension_paths()

    assert len(path) == 1
    assert path[0] == {"section": "notebook", "src": "nbextension", "dest": "asqlcell", "require": "asqlcell/extension"}
