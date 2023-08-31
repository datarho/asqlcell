import os
from glob import glob

from jupyter_packaging import (
    combine_commands,
    create_cmdclass,
    ensure_targets,
    get_version,
    install_npm,
    skip_if_exists,
)
from setuptools import find_packages, setup

HERE = os.path.dirname(os.path.abspath(__file__))


# The name of the project
name = "asqlcell"

# Get the version
version = get_version(os.path.join(name, "_version.py"))


# Representative files that should exist after a successful build
jstargets = [
    os.path.join(HERE, name, "nbextension", "index.js"),
    os.path.join(HERE, name, "labextension", "package.json"),
]


package_data_spec = {name: ["nbextension/**js*", "labextension/**"]}


data_files_spec = [
    ("share/jupyter/nbextensions/asqlcell", "asqlcell/nbextension", "**"),
    ("share/jupyter/labextensions/asqlcell", "asqlcell/labextension", "**"),
    ("share/jupyter/labextensions/asqlcell", ".", "install.json"),
    ("etc/jupyter/nbconfig/notebook.d", ".", "asqlcell.json"),
]


cmdclass = create_cmdclass("jsdeps", package_data_spec=package_data_spec, data_files_spec=data_files_spec)
npm_install = combine_commands(
    install_npm(HERE, build_cmd="build:prod"),
    ensure_targets(jstargets),
)
cmdclass["jsdeps"] = skip_if_exists(jstargets, npm_install)


setup_args = dict(
    name=name,
    description="Analytical sql cell for Jupyter",
    version=version,
    scripts=glob(os.path.join("scripts", "*")),
    cmdclass=cmdclass,
    packages=find_packages(),
    author="qizh",
    author_email="qizh@datarho.tech",
    url="https://github.com/datarho/asqlcell",
    license="BSD",
    platforms="Linux, Mac OS X, Windows",
    keywords=["Jupyter", "Widgets", "IPython"],
    classifiers=[
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: BSD License",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.4",
        "Programming Language :: Python :: 3.5",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Framework :: Jupyter",
    ],
    include_package_data=True,
    python_requires=">=3.8",
    install_requires=[
        "altair>=5.1.0",
        "duckdb>=0.8.1",
        "duckdb-engine>=0.9.2",
        "fastparquet>=2023.4.0",
        "ipywidgets>=8.0.0",
        "jinja2>=3.1.2",
        "pandas==2.0.3",
        "StrEnum>=0.4.15",
        "sqlparse>=0.4.3",
        "sqlalchemy>=2.0.19",
        "openai>= 0.27.10",
        "requests>=2.28.1",
        "vegafusion>=1.4.0",
        "vl-convert-python>=0.13.0",
        "vegafusion-python-embed>=1.4.0",
    ],
    extras_require={
        "test": [
            "pytest>=4.6",
            "pytest-cov",
            "nbval",
        ],
        "examples": [
            # Any requirements for the examples to run
        ],
        "docs": [
            "jupyter_sphinx",
            "nbsphinx",
            "nbsphinx-link",
            "pytest_check_links",
            "pypandoc",
            "recommonmark",
            "sphinx>=1.5",
            "sphinx_rtd_theme",
        ],
    },
    entry_points={},
)

setup(**setup_args)
