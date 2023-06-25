from IPython.core.interactiveshell import InteractiveShell

from asqlcell._version import __version__, version_info
from asqlcell.magic import SqlMagics
from asqlcell.widget import SqlCellWidget


def _jupyter_labextension_paths():
    """
    Called by Jupyter Lab Server to detect if it is a valid labextension and
    to install the widget
    Returns
    =======
    src: Source directory name to copy files from. Webpack outputs generated files
        into this directory and Jupyter Lab copies from this directory during
        widget installation
    dest: Destination directory name to install widget files to. Jupyter Lab copies
        from `src` directory into <jupyter path>/labextensions/<dest> directory
        during widget installation
    """
    return [
        {
            "src": "labextension",
            "dest": "asqlcell",
        }
    ]


def _jupyter_nbextension_paths():
    """
    Called by Jupyter Notebook Server to detect if it is a valid nbextension and to install the widget
    Returns
    =======
    section: The section of the Jupyter Notebook Server to change.
        Must be 'notebook' for widget extensions
    src: Source directory name to copy files from. Webpack outputs generated files
        into this directory and Jupyter Notebook copies from this directory during
        widget installation
    dest: Destination directory name to install widget files to. Jupyter Notebook copies
        from `src` directory into <jupyter path>/nbextensions/<dest> directory
        during widget installation
    require: Path to importable AMD Javascript module inside the
        <jupyter path>/nbextensions/<dest> directory
    """
    return [{"section": "notebook", "src": "nbextension", "dest": "asqlcell", "require": "asqlcell/extension"}]


def load_ipython_extension(shell: InteractiveShell):
    """
    Any module file that define a function named `load_ipython_extension` can be loaded via
    `%load_ext module.path` or be configured to be auto loaded by IPython via `ipython_config.py`
    at startup time.
    """
    # You can register the class itself without instantiating it. IPython will call the default constructor on it.
    shell.register_magics(SqlMagics(shell))
