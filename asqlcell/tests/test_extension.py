from asqlcell import _jupyter_labextension_paths, _jupyter_nbextension_paths


def test_labextension_path():
    path = _jupyter_labextension_paths()

    print(path[0])

    assert len(path) == 1
    assert path[0] == { "src": "labextension", "dest": "asqlcell" }

def test_nbextension_path():
    path = _jupyter_nbextension_paths()

    assert len(path) == 1
    assert path[0] == {"section": "notebook", "src": "nbextension", "dest": "asqlcell", "require": "asqlcell/extension"}
