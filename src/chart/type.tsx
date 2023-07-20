import { Select } from "@mantine/core";
import { IconChartAreaLine, IconChartBar, IconChartDots, IconChartLine, IconChartPie } from "@tabler/icons-react";
import React, { FunctionComponent } from "react";
import { useModelState } from "../hooks";
import { IconItem } from "./item";


const data = [
    {
        icon: <IconChartBar stroke={1.5} size={18} style={{ transform: "rotate(90deg)" }} />,
        value: "column",
        label: "Column",
    },
    {
        icon: <IconChartBar stroke={1.5} size={18} />,
        value: "bar",
        label: "Bar",
    },
    {
        icon: <IconChartLine stroke={1.5} size={18} />,
        value: "line",
        label: "Line"
    },
    {
        icon: <IconChartAreaLine stroke={1.5} size={18} />,
        value: "area",
        label: "Area"
    },
    {
        icon: <IconChartDots stroke={1.5} size={18} />,
        value: "scatter",
        label: "Scatter"
    },
    {
        icon: <IconChartPie stroke={1.5} size={18} />,
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
            icon={icon}
            value={type}
            onChange={(value) => {
                const updated = {
                    ...JSON.parse(config),
                    type: value,
                };
                setConfig(JSON.stringify(updated));
            }}
            sx={{ width: 240 }}
        />
    )
}
