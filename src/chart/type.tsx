import { Group, Select, Text } from "@mantine/core";
import { IconChartAreaLine, IconChartBar, IconChartDots, IconChartLine, TablerIconsProps } from "@tabler/icons-react";
import React, { FunctionComponent, forwardRef } from "react";
import { useModelState } from "../hooks";


const data = [
    {
        icon: <IconChartBar stroke={1.5} />,
        value: "bar",
        label: "Bar",
    },
    {
        icon: <IconChartLine stroke={1.5} />,
        value: "line",
        label: "Line"
    },
    {
        icon: <IconChartAreaLine stroke={1.5} />,
        value: "area",
        label: "Area"
    },
    {
        icon: <IconChartDots stroke={1.5} />,
        value: "point",
        label: "Scatter"
    },
]

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
    icon: (props: TablerIconsProps) => JSX.Element;
    value: string;
    label: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(({ icon, value, label, ...others }: ItemProps, ref) => (
    <Group noWrap ref={ref} {...others}>
        {icon}
        <Text size="sm">{label}</Text>
    </Group>
));

export const ChartType: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");
    const type = JSON.parse(config)["type"];
    const icon = data.find((entry) => entry.value === type)?.icon;

    return (
        <Select
            label="Chart type"
            placeholder="Pick one"
            itemComponent={SelectItem}
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
        />
    )
}
