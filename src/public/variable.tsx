import React, { forwardRef } from "react";
import { Icon123, IconAbc, IconCalendar, IconChartBar, IconChartDots, IconChartLine, IconChartPie, TablerIconsProps, } from "@tabler/icons-react";
import { Group, Text } from "@mantine/core";

export const InitialSingleSelectedCol = { "seriesName": "Y-series-0", "colName": "", "chartType": "line", "yAxis": "left" };

export const InitialSelectedCols = `{"selectedCol":[{"seriesName":"Y-series-0", "colName":"","chartType":"line", "yAxis":"left"}]}`;

export const ChartIconMap: Record<string, JSX.Element> = {
    "line": <IconChartLine size={16} />,
    "bar": <IconChartBar size={16} />,
    "point": <IconChartDots size={16} />,
    "arc": <IconChartPie size={16} />
}

export const DataTypeIcon: Record<string, JSX.Element> = {
    "int": <Icon123 size={16} />,
    "float": <Icon123 size={16} />,
    "string": <IconAbc size={16} />,
    "bool": <IconAbc size={16} />,
    "datetime": <IconCalendar size={16} />,
};

export type ChartTypeList = "line" | "arc" | "bar" | "point";

export const ChartType: Record<string, ChartTypeList> = {
    Line: "line",
    Bar: "bar",
    Scatter: "point",
    Pie: "arc"
}

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
    label: string;
    icon: (props: TablerIconsProps) => JSX.Element;
}

export const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ label, icon, ...others }: ItemProps, ref) => (
        <div ref={ref} {...others}>
            <Group noWrap position="apart" w={"100%"}>
                <Group sx={{ width: "60%" }}>
                    <Text truncate size="xs">{label}</Text>
                </Group>
                {icon}
            </Group>
        </div>
    )
);
