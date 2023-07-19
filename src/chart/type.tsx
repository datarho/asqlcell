import { Select } from "@mantine/core";
import { IconChartAreaLine, IconChartBar, IconChartDots, IconChartLine, IconChartPie } from "@tabler/icons-react";
import React, { FunctionComponent } from "react";
import { useModelState } from "../hooks";
import { IconItem, ItemIcon } from "./item";


const data = [
    {
        icon: IconChartBar,
        value: "bar",
        label: "Bar",
    },
    {
        icon: IconChartLine,
        value: "line",
        label: "Line"
    },
    {
        icon: IconChartAreaLine,
        value: "area",
        label: "Area"
    },
    {
        icon: IconChartDots,
        value: "point",
        label: "Scatter"
    },
    {
        icon: IconChartPie,
        value: "pie",
        label: "Pie"
    }
]

export const ChartType: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");

    const type: string = JSON.parse(config)["type"];
    const icon = data.find((entry) => entry.value === type)?.icon;

    return (
        <Select
            label="Chart type"
            itemComponent={IconItem}
            data={data}
            icon={<ItemIcon icon={icon} />}
            value={type}
            onChange={(value) => {
                const updated = {
                    ...JSON.parse(config),
                    type: value,
                };
                setConfig(JSON.stringify(updated));
            }}
        />
    )
}
