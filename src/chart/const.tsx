import { Icon123, IconAbc, IconCalendar } from "@tabler/icons-react";
import React from "react";

export const ViewHeight = 264;
export const MenuHeight = 311;
export const MenuWidth = 285;
export const LabelWidth = 128;

export enum ChartType {
    Bar = "bar",
    Column = "column",
    Line = "line",
    Area = "area",
    Scatter = "scatter",
    Pie = "pie",
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
};
