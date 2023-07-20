import { ActionIcon, Group, Menu, Select, Stack, Text } from "@mantine/core";
import { IconCheck, IconSettings, IconSortAscending, IconSortDescending } from "@tabler/icons-react";
import React, { FunctionComponent, useState } from "react";
import { useModelState } from "../hooks";
import { DataType, DataTypeIcon } from "./const";
import { IconItem, ItemIcon } from "./item";

enum ChartType {
    Bar = "bar",
    Line = "line",
    Area = "area",
    Scatter = "scatter",
    Pie = "pie",
}

enum SortType {
    Ascending = "ascending",
    Descending = "descending",
}

const columns = (hist: string) => {
    const columns = JSON.parse(hist);

    return [...columns].map((header: { columnName: string, dtype: DataType }) => ({
        value: header.columnName,
        label: header.columnName,
        icon: DataTypeIcon[header.dtype],
    }))
}

const HorizontalAxis: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");
    const [hist] = useModelState("title_hist");

    const items = columns(hist);
    const selected = JSON.parse(config)["x"];
    const icon = items.find((entry) => entry.value === selected)?.icon;

    return (
        <Group noWrap spacing="xs">
            <Select
                label="X-Axis"
                data={items}
                icon={<ItemIcon icon={icon} />}
                value={selected}
                itemComponent={IconItem}
                onChange={(value) => {
                    const updated = {
                        ...JSON.parse(config),
                        x: value,
                    };
                    setConfig(JSON.stringify(updated));
                }}
                sx={{ width: 240 }}
            />
            <ActionIcon mt="xl" variant="transparent">
                <IconSettings size={16} />
            </ActionIcon>

        </Group>
    )
}

const VerticalAxis: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");
    const [hist] = useModelState("title_hist");

    const [opened, setOpened] = useState(false);

    const items = columns(hist);

    const selected = JSON.parse(config)["y"];
    const aggregation = JSON.parse(config)["aggregation"];
    const icon = items.find((entry) => entry.value === selected)?.icon;

    const aggregationItem = (name: string) => {
        return (
            <Menu.Item
                onClick={() => {
                    const updated = {
                        ...JSON.parse(config),
                        aggregation: name,
                    };
                    setConfig(JSON.stringify(updated));
                }}
                icon={<IconCheck color={aggregation === name ? undefined : ""} size={12} />}
            >
                <Text tt="capitalize">{name}</Text>
            </Menu.Item>
        )
    }

    const sortItem = (name: SortType) => {
        const Icon = {
            [SortType.Ascending]: IconSortAscending,
            [SortType.Descending]: IconSortDescending,
        }[name];

        return (
            <Menu.Item
                onClick={() => {
                    const updated = {
                        ...JSON.parse(config),
                        sort: name,
                    };
                    setConfig(JSON.stringify(updated));
                }}
                icon={<Icon size={12} />}
            >
                Sort {name}
            </Menu.Item>
        )
    }

    return (
        <Stack>
            <Group noWrap spacing="xs">
                <Select
                    label="Y-Axis"
                    data={items}
                    icon={<ItemIcon icon={icon} />}
                    value={selected}
                    itemComponent={IconItem}
                    onChange={(value) => {
                        const updated = {
                            ...JSON.parse(config),
                            y: value,
                        };
                        setConfig(JSON.stringify(updated));
                    }}
                    sx={{ width: 240 }}
                />

                <Menu
                    width={200}
                    opened={opened}
                    onChange={setOpened}
                    position="right"
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
                        <Menu.Label>Aggregation</Menu.Label>

                        {
                            ["sum", "average", "max", "min", "count", "median"].map(item => {
                                return aggregationItem(item);
                            })
                        }

                        <Menu.Divider />

                        <Menu.Label>Sort</Menu.Label>

                        {
                            [SortType.Ascending, SortType.Descending].map(item => {
                                return sortItem(item);
                            })
                        }
                    </Menu.Dropdown>
                </Menu>
            </Group>
        </Stack>
    )
}

const ThetaAxis: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");
    const [hist] = useModelState("title_hist");

    const items = columns(hist);
    const selected = JSON.parse(config)["theta"];
    const icon = items.find((entry) => entry.value === selected)?.icon;

    return (
        <Select
            label="Size"
            data={items}
            icon={<ItemIcon icon={icon} />}
            value={selected}
            itemComponent={IconItem}
            onChange={(value) => {
                const updated = {
                    ...JSON.parse(config),
                    theta: value,
                };
                setConfig(JSON.stringify(updated));
            }}
        />
    )
}

const ColorAxis: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");
    const [hist] = useModelState("title_hist");

    const items = columns(hist);
    const selected = JSON.parse(config)["color"];
    const icon = items.find((entry) => entry.value === selected)?.icon;

    return (
        <Select
            label="Color"
            data={items}
            icon={<ItemIcon icon={icon} />}
            value={selected}
            itemComponent={IconItem}
            onChange={(value) => {
                const updated = {
                    ...JSON.parse(config),
                    color: value,
                };
                setConfig(JSON.stringify(updated));
            }}
        />
    )
}

export const ChartProperties: FunctionComponent = () => {
    const [config] = useModelState("chart_config");

    const type: string = JSON.parse(config)["type"];

    const render = () => {
        switch (type) {
            case ChartType.Bar:
                return (
                    <>
                        <HorizontalAxis />
                        <VerticalAxis />
                    </>
                );

            case ChartType.Area:
                return (
                    <>
                        <HorizontalAxis />
                        <VerticalAxis />
                    </>
                );

            case ChartType.Line:
                return (
                    <>
                        <HorizontalAxis />
                        <VerticalAxis />
                    </>
                );

            case ChartType.Scatter:
                return (
                    <>
                        <HorizontalAxis />
                        <VerticalAxis />
                    </>
                );

            case ChartType.Pie:
                return (
                    <>
                        <ColorAxis />
                        <ThetaAxis />
                    </>
                );
        }
    }

    return (
        <Stack>
            {
                render()
            }
        </Stack>
    )
}
