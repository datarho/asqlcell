from typing import List, Optional, TypedDict

from strenum import StrEnum


class ChartType(StrEnum):
    BAR = "bar"
    COLUMN = "column"
    LINE = "line"
    AREA = "area"
    PIE = "pie"
    SCATTER = "scatter"
    COMBO = "combo"


class SubChartType(StrEnum):
    CLUSTERED = "clustered"
    PERCENT = "100"


class LegendConfig(TypedDict):
    visible: bool


class ChartConfig(TypedDict):
    type: Optional[ChartType]
    x: Optional[str]
    y: Optional[str]
    y2: Optional[str]
    color: Optional[str]
    theta: Optional[str]
    aggregation: Optional[str]
    aggregation2: Optional[str]
    subtype: List[str]
    sort: Optional[str]
    height: int
    width: int
    legend: LegendConfig
    label: bool
