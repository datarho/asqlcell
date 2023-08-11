import { Icon123, IconAbc, IconArrowsSort, IconCalendar, IconSortAscending, IconSortDescending } from "@tabler/icons-react";
import React from "react";
import { AreaChart } from "./area";
import { BarChart } from "./bar";
import { ColumnChart } from "./column";
import { ComboChart } from "./combo";
import { LineChart } from "./line";
import { PieChart } from "./pie";
import { ScatterChart } from "./scatter";

export const ViewHeight = 264;
export const MenuHeight = 311;
export const MenuWidth = 285;
export const LabelWidth = 128;
export const ConfigItemWidth = 240;

export enum ChartType {
    Bar = "bar",
    Column = "column",
    Line = "line",
    Area = "area",
    Scatter = "scatter",
    Pie = "pie",
    Combo = "combo",
}

export const ChartTypeComponents: Record<ChartType, JSX.Element> = {
    [ChartType.Bar]: <BarChart />,
    [ChartType.Column]: <ColumnChart />,
    [ChartType.Line]: <LineChart />,
    [ChartType.Area]: <AreaChart />,
    [ChartType.Scatter]: <ScatterChart />,
    [ChartType.Pie]: <PieChart />,
    [ChartType.Combo]: <ComboChart />,
}

export enum DataType {
    Int = "int",
    Float = "float",
    String = "string",
    Bool = "bool",
    Datetime = "datetime",
}

export const DataTypeIcons: Record<DataType, JSX.Element> = {
    [DataType.Int]: <Icon123 stroke={1.5} size={18} />,
    [DataType.Float]: <Icon123 stroke={1.5} size={18} />,
    [DataType.String]: <IconAbc stroke={1.5} size={18} />,
    [DataType.Bool]: <IconAbc stroke={1.5} size={18} />,
    [DataType.Datetime]: <IconCalendar stroke={1.5} size={18} />,
}

export enum SortType {
    Ascending = "ascending",
    Descending = "descending",
    None = "none",
}

export const SortIcons = {
    [SortType.Ascending]: <IconSortAscending stroke={1.5} size={18} />,
    [SortType.Descending]: <IconSortDescending stroke={1.5} size={18} />,
    [SortType.None]: <IconArrowsSort stroke={1.5} size={18} />,
}

export enum AggregationType {
    Sum = "sum",
    Average = "average",
    Max = "max",
    Min = "min",
    Count = "count",
    Median = "median",
}
