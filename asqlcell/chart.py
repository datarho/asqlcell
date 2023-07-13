from typing import Optional, TypedDict
from strenum import StrEnum


class ChartType(StrEnum):
    BAR = "bar"
    LINE = "line"
    AREA = "area"
    PIE = "pie"
    SCATTER = "point"


class SubChartType(StrEnum):
    GROUPED = "grouped"
    PERCENT = "100"


class ChartConfig(TypedDict):
    type: Optional[ChartType]
    x: Optional[str]
    y: Optional[str]
    color: Optional[str]
    theta: Optional[str]
    subtype: list[str]
