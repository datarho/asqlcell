import { ActionIcon, Group, Menu, Select } from "@mantine/core";
import { IconChartAreaLine, IconChartBar, IconChartDots, IconChartLine, IconChartPie, IconPercentage, IconSettings } from "@tabler/icons-react";
import React, { FunctionComponent, useState } from "react";
import { useModelState } from "../hooks";
import { ChartType } from "./const";
import { IconItem } from "./item";

const data = [
    {
        icon: <IconChartBar stroke={1.5} size={18} />,
        value: ChartType.Column,
        label: "Column",
    },
    {
        icon: <IconChartBar stroke={1.5} size={18} style={{ transform: "rotate(90deg)" }} />,
        value: ChartType.Bar,
        label: "Bar",
    },
    {
        icon: <IconChartLine stroke={1.5} size={18} />,
        value: ChartType.Line,
        label: "Line"
    },
    {
        icon: <IconChartAreaLine stroke={1.5} size={18} />,
        value: ChartType.Area,
        label: "Area"
    },
    {
        icon: <IconChartDots stroke={1.5} size={18} />,
        value: ChartType.Scatter,
        label: "Scatter"
    },
    {
        icon: <IconChartPie stroke={1.5} size={18} />,
        value: ChartType.Pie,
        label: "Pie"
    }
]

export const ChartPicker: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");

    const [opened, setOpened] = useState(false);

    const key = Object.keys(ChartType).find(key => ChartType[key as keyof typeof ChartType] === JSON.parse(config)["type"]);
    const type = ChartType[key as keyof typeof ChartType];
    const icon = data.find((entry) => entry.value === type)?.icon;

    return (
        <Group noWrap spacing="xs">
            <Select
                label="Chart type"
                searchable
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

            {
                [ChartType.Column, ChartType.Bar, ChartType.Area].includes(type) ?
                    <Menu
                        width={160}
                        opened={opened}
                        onChange={setOpened}
                        position="right"
                        shadow="md"
                        withArrow
                    >
                        <Menu.Target>
                            <ActionIcon
                                mt="xl"
                                variant="transparent"
                                onClick={() => setOpened(true)}
                            >
                                <IconSettings size={16} />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Label>Style</Menu.Label>

                            <Menu.Item
                                onClick={() => {
                                    const updated = {
                                        ...JSON.parse(config),
                                        subtype: [],
                                    };
                                    setConfig(JSON.stringify(updated));
                                }}
                                icon={<IconChartBar size={12} />}
                            >
                                Stack
                            </Menu.Item>

                            {
                                [ChartType.Area].includes(type) ?
                                    undefined
                                    :
                                    <Menu.Item
                                        onClick={() => {
                                            const updated = {
                                                ...JSON.parse(config),
                                                subtype: ["clustered"],
                                            };
                                            setConfig(JSON.stringify(updated));
                                        }}
                                        icon={<IconChartBar size={12} />}
                                    >
                                        Clustered
                                    </Menu.Item>
                            }

                            <Menu.Item
                                onClick={() => {
                                    const updated = {
                                        ...JSON.parse(config),
                                        subtype: ["100"],
                                    };
                                    setConfig(JSON.stringify(updated));
                                }}
                                icon={<IconPercentage size={12} />}
                            >
                                100% Stack
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                    :
                    undefined
            }
        </Group>
    )
}
