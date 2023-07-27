import { ActionIcon, Group, Menu, Select, Stack, Text } from "@mantine/core";
import { IconArrowsSort, IconCheck, IconSettings, IconSortAscending, IconSortDescending } from "@tabler/icons-react";
import React, { FunctionComponent, useState } from "react";
import { useModelState } from "../hooks";
import { DataType, DataTypeIcons } from "./const";
import { IconItem } from "./item";

enum ChartType {
    Bar = "bar",
    Column = "column",
    Line = "line",
    Area = "area",
    Scatter = "scatter",
    Pie = "pie",
}

enum SortType {
    Ascending = "ascending",
    Descending = "descending",
    Naturally = "naturally",
}

const columns = (hist: string) => {
    const columns = JSON.parse(hist);

    return [...columns].map((header: { columnName: string, dtype: DataType }) => ({
        value: header.columnName,
        label: header.columnName,
        icon: DataTypeIcons[header.dtype],
    }))
}


const QualitativeMenu: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");

    const [opened, setOpened] = useState(false);

    const sortItem = (name: SortType) => {
        const icon = {
            [SortType.Ascending]: <IconSortAscending stroke={1.5} size={12} />,
            [SortType.Descending]: <IconSortDescending stroke={1.5} size={12} />,
            [SortType.Naturally]: <IconArrowsSort stroke={1.5} size={12} />,
        }[name];

        return (
            <Menu.Item
                onClick={() => {
                    const updated = {
                        ...JSON.parse(config),
                        sort: name === SortType.Naturally ? null : name,
                    };
                    setConfig(JSON.stringify(updated));
                }}
                icon={icon}
            >
                Sort {name}
            </Menu.Item>
        )
    }

    return (
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
                <Menu.Label>Sort</Menu.Label>

                {
                    [SortType.Ascending, SortType.Descending, SortType.Naturally].map(item => {
                        return sortItem(item);
                    })
                }
            </Menu.Dropdown>
        </Menu>
    )
}

const QuantitativeMenu: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");

    const [opened, setOpened] = useState(false);

    const key = Object.keys(ChartType).find(key => ChartType[key as keyof typeof ChartType] === JSON.parse(config)["type"]);
    const type = ChartType[key as keyof typeof ChartType];

    const aggregation = JSON.parse(config)["aggregation"];

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

    const sortValue = (type: ChartType, name: SortType) => {
        switch (type) {
            case ChartType.Bar:
                return name === SortType.Ascending ? "x" : "-x";
            case ChartType.Pie:
                return name === SortType.Ascending ? "color" : "-color";
            default:
                return name === SortType.Ascending ? "y" : "-y";
        }
    }

    const sortItem = (type: ChartType, name: SortType) => {
        const icon = {
            [SortType.Ascending]: <IconSortAscending stroke={1.5} size={12} />,
            [SortType.Descending]: <IconSortDescending stroke={1.5} size={12} />,
            [SortType.Naturally]: <IconArrowsSort stroke={1.5} size={12} />,
        }[name];

        return (
            <Menu.Item
                onClick={() => {
                    const updated = {
                        ...JSON.parse(config),
                        sort: sortValue(type, name),
                    };
                    setConfig(JSON.stringify(updated));
                }}
                icon={icon}
            >
                Sort {name}
            </Menu.Item>
        )
    }

    return (
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
                        return sortItem(type, item);
                    })
                }
            </Menu.Dropdown>
        </Menu>
    );
}

const HorizontalAxis: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");
    const [hist] = useModelState("title_hist");

    const key = Object.keys(ChartType).find(key => ChartType[key as keyof typeof ChartType] === JSON.parse(config)["type"]);
    const type = ChartType[key as keyof typeof ChartType];

    const items = columns(hist);
    const selected = JSON.parse(config)["x"];
    const icon = items.find((entry) => entry.value === selected)?.icon;

    const menu = (type?: ChartType) => {
        switch (type) {
            case ChartType.Bar:
                return <QuantitativeMenu />;
            default:
                return <QualitativeMenu />;
        }
    }

    return (
        <Group noWrap spacing="xs">
            <Select
                label="X-Axis"
                searchable
                data={items}
                icon={icon}
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

            {
                menu(type)
            }
        </Group>
    )
}

const VerticalAxis: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");
    const [hist] = useModelState("title_hist");

    const key = Object.keys(ChartType).find(key => ChartType[key as keyof typeof ChartType] === JSON.parse(config)["type"]);
    const type = ChartType[key as keyof typeof ChartType];

    const items = columns(hist);
    const selected = JSON.parse(config)["y"];
    const icon = items.find((entry) => entry.value === selected)?.icon;

    const menu = (type: ChartType) => {
        switch (type) {
            case ChartType.Bar:
                return <QualitativeMenu />;
            default:
                return <QuantitativeMenu />;
        }
    }

    return (
        <Group noWrap spacing="xs">
            <Select
                label="Y-Axis"
                searchable
                data={items}
                icon={icon}
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

            {
                menu(type)
            }
        </Group>
    )
}

const ThetaAxis: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");
    const [hist] = useModelState("title_hist");

    const items = columns(hist);
    const selected = JSON.parse(config)["theta"];
    const icon = items.find((entry) => entry.value === selected)?.icon;

    return (
        <Group noWrap spacing="xs">
            <Select
                label="Size"
                searchable
                data={items}
                icon={icon}
                value={selected}
                itemComponent={IconItem}
                onChange={(value) => {
                    const updated = {
                        ...JSON.parse(config),
                        theta: value,
                    };
                    setConfig(JSON.stringify(updated));
                }}
                sx={{ width: 240 }}
            />

            <QuantitativeMenu />
        </Group>
    )
}

const ColorAxis: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");
    const [hist] = useModelState("title_hist");

    const items = columns(hist);
    const selected = JSON.parse(config)["color"];
    const icon = items.find((entry) => entry.value === selected)?.icon;

    return (
        <Group noWrap spacing="xs">
            <Select
                label="Color"
                searchable
                clearable
                data={items}
                icon={icon}
                value={selected}
                itemComponent={IconItem}
                onChange={(value) => {
                    const updated = {
                        ...JSON.parse(config),
                        color: value,
                    };
                    setConfig(JSON.stringify(updated));
                }}
                sx={{ width: 240 }}
            />

            <QualitativeMenu />
        </Group>
    )
}

export const ChartProperties: FunctionComponent = () => {
    const [config] = useModelState("chart_config");

    const type: string = JSON.parse(config)["type"];

    const render = () => {
        switch (type) {
            case ChartType.Column:
                return (
                    <>
                        <HorizontalAxis />
                        <VerticalAxis />
                        <ColorAxis />
                    </>
                );

            case ChartType.Bar:
                return (
                    <>
                        <VerticalAxis />
                        <HorizontalAxis />
                        <ColorAxis />
                    </>
                );

            case ChartType.Area:
                return (
                    <>
                        <HorizontalAxis />
                        <VerticalAxis />
                        <ColorAxis />
                    </>
                );

            case ChartType.Line:
                return (
                    <>
                        <HorizontalAxis />
                        <VerticalAxis />
                        <ColorAxis />
                    </>
                );

            case ChartType.Scatter:
                return (
                    <>
                        <HorizontalAxis />
                        <VerticalAxis />
                        <ColorAxis />
                    </>
                );

            case ChartType.Pie:
                return (
                    <>
                        <ThetaAxis />
                        <ColorAxis />
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
