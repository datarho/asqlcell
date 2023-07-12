from enum import Enum


class ChartType(Enum):
    BAR = "bar"
    LINE = "line"
    AREA = "area"
    PIE = "pie"
    SCATTER = "point"


class SubChartType(Enum):
    GROUPED = "grouped"
    PERCENT = "100"
