#!/usr/bin/env python
# coding: utf-8

# Copyright (c) qizh.
# Distributed under the terms of the Modified BSD License.

import pytest

from ..asqlcell import SqlcellWidget


def test_widget_creation_blank():
    w = SqlcellWidget()
    assert w.value == ''
