from typing import List, Literal, Optional, TypedDict

from strenum import StrEnum


class ChartType(StrEnum):
    BAR = "bar"
    COLUMN = "column"
    LINE = "line"
    AREA = "area"
    PIE = "pie"
    SCATTER = "scatter"
    COMBO = "combo"
    FUNNEL = "funnel"
    SUNBURST = "sunburst"


class SubChartType(StrEnum):
    CLUSTERED = "clustered"
    PERCENT = "100"


class LegendConfig(TypedDict):
    visible: bool


class AxisConfig(TypedDict):
    label: Optional[str]
    field: Optional[str]
    aggregation: Optional[str]
    sort: Optional[Literal["ascending", "descending"]]


class ChartConfig(TypedDict):
    type: Optional[ChartType]
    x: AxisConfig
    x2: AxisConfig
    y: AxisConfig
    y2: AxisConfig
    color: AxisConfig
    subtype: List[str]
    height: int
    width: int
    legend: LegendConfig
    label: bool
    theme: str
