# Analytical Sql Cell

Analytical sql cell for Jupyter.

[![Build Status](https://travis-ci.org/datarho.tech/sqlcell.svg?branch=master)](https://travis-ci.org/datarho.tech/sqlcell)
[![codecov](https://codecov.io/gh/datarho.tech/sqlcell/branch/master/graph/badge.svg)](https://codecov.io/gh/datarho.tech/sqlcell)

## Installation

You can install using `pip`:

```bash
pip install asqlcell
```

If you are using Jupyter Notebook 5.2 or earlier, you may also need to enable
the nbextension:
```bash
jupyter nbextension enable --py [--sys-prefix|--user|--system] asqlcell
```

## Development

This widget is developed with conda to ensure a consistent developer experience. The project is developed in both
Mac OS and Windows Subsystem for Linux.

Please run the following commands to create a conda environment:

```bash
conda create -n asqlcell -c conda-forge nodejs yarn python jupyterlab
conda activate asqlcell
```

### Python

Install the python. This will also build the TypeScript package.

```bash
pip install -e ".[test, examples, docs]"
```

### Jupyter

When developing your extensions, you need to manually enable your extensions with the notebook / lab frontend. 

For lab, this is done by the command:

```
jupyter labextension develop --overwrite .
jlpm run build
```

For classic notebook, you need to run:

```
jupyter nbextension install --sys-prefix --symlink --overwrite --py asqlcell
jupyter nbextension enable --sys-prefix --py asqlcell
```

Note that the `--symlink` flag doesn't work on Windows, so you will here have to run
the `install` command every time that you rebuild your extension. For certain installations
you might also need another flag instead of `--sys-prefix`, but we won't cover the meaning
of those flags here.

#### Typescript

You must start watching the change of the widget:

```bash
jlpm run watch
```

Then in another terminal you can run Jupyter Lab (without launching a browser):

```bash
jupyter lab --no-browser
```

Now you can open Google Chrome and navigate to [http://localhost:8888](http://localhost:8888) to play with the widget.
After a change wait for the build to finish and then refresh your browser and the changes should take effect.

If you make a change to the python code then you will need to restart the notebook kernel to have it take effect.
