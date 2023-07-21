from typing import Optional, TypedDict

from strenum import StrEnum


class ChartType(StrEnum):
    BAR = "bar"
    COLUMN = "column"
    LINE = "line"
    AREA = "area"
    PIE = "pie"
    SCATTER = "scatter"


class SubChartType(StrEnum):
    CLUSTERED = "clustered"
    PERCENT = "100"


class ChartConfig(TypedDict):
    type: Optional[ChartType]
    x: Optional[str]
    y: Optional[str]
    color: Optional[str]
    theta: Optional[str]
    aggregation: str
    subtype: list[str]
    sort: Optional[str]
