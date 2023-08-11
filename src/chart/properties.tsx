import { ActionIcon, Group, Menu, Select, Stack, Text, Tooltip } from "@mantine/core";
import { IconArrowsSort, IconSettings, IconSortAscending, IconSortDescending } from "@tabler/icons-react";
import React, { FunctionComponent, useState } from "react";
import { useModelState } from "../hooks";
import { AggregationType, ChartType, ChartTypeComponents, ConfigItemWidth, DataType, DataTypeIcons, SortIcons, SortType } from "./const";
import { IconItem } from "./item";

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

    const payload = JSON.parse(config);
    const type = payload["type"] as ChartType;

    const sortValue = (type: ChartType, name: SortType) => {
        switch (type) {
            case ChartType.Pie:
                return name === SortType.Ascending ? "+color" : "-color";
            default:
                return name === SortType.None ? null : name;
        }
    }

    const items = () => {
        switch (type) {
            case ChartType.Pie:
            case ChartType.Area:
                return [SortType.Ascending, SortType.Descending];
            default:
                return [SortType.Ascending, SortType.Descending, SortType.None];
        }
    }

    const sortItem = (name: SortType) => {
        const icon = SortIcons[name];

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
                <Text tt="capitalize">{name}</Text>
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
                    items().map(item => {
                        return sortItem(item);
                    })
                }
            </Menu.Dropdown>
        </Menu>
    )
}

interface AxisProps {
    label?: string;
    major: string;
    minor?: string;
    extra?: string;
    sort?: boolean;
    clearable?: boolean;
}

const QuantitativeMenu: FunctionComponent<AxisProps> = ({ major, minor }) => {
    const [config, setConfig] = useModelState("chart_config");

    const [opened, setOpened] = useState(false);

    const payload = JSON.parse(config);

    const type = payload["type"] as ChartType;

    const sortValue = (type: ChartType, name: SortType) => {
        switch (type) {
            case ChartType.Bar:
                return name === SortType.Ascending ? "x" : "-x";
            case ChartType.Pie:
                return name === SortType.Ascending ? "+theta" : "-theta";
            default:
                return name === SortType.Ascending ? "y" : "-y";
        }
    }

    const sortItem = (type: ChartType, name: SortType) => {
        const icon = {
            [SortType.Ascending]: <IconSortAscending stroke={1.5} size={12} />,
            [SortType.Descending]: <IconSortDescending stroke={1.5} size={12} />,
            [SortType.None]: <IconArrowsSort stroke={1.5} size={12} />,
        }[name];

        return (
            <Menu.Item
                onClick={() => {
                    const updated = {
                        ...payload,
                        sort: sortValue(type, name),
                    };
                    setConfig(JSON.stringify(updated));
                }}
                icon={icon}
            >
                <Text tt="capitalize">{name}</Text>
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
                {
                    [SortType.Ascending, SortType.Descending].map(item => {
                        return sortItem(type, item);
                    })
                }
            </Menu.Dropdown>
        </Menu>
    );
}

export const SortToggle: FunctionComponent<AxisProps> = ({ major, minor, extra }) => {
    const [config, setConfig] = useModelState("chart_config");

    const payload = JSON.parse(config);
    const selected = payload[major]["sort"] ? payload[major]["sort"] as SortType : SortType.None;

    return (
        <Tooltip label={selected.charAt(0).toUpperCase() + selected.slice(1)}>
            <ActionIcon
                onClick={() => {
                    const candidates = [SortType.Ascending, SortType.Descending, SortType.None];
                    const last = candidates.indexOf(selected);
                    const next = (last + 1) % candidates.length;

                    let updated = {
                        ...payload,
                        [major]: {
                            ...payload[major],
                            sort: candidates[next] === SortType.None ? null : candidates[next],
                        },
                    };

                    if (minor) {
                        updated = {
                            ...updated,
                            [minor]: {
                                ...payload[minor],
                                sort: null,
                            }
                        }
                    }

                    if (extra) {
                        updated = {
                            ...updated,
                            [extra]: {
                                ...payload[extra],
                                sort: null,
                            }
                        }
                    }

                    setConfig(JSON.stringify(updated));
                }}
            >
                {
                    SortIcons[selected]
                }
            </ActionIcon>
        </Tooltip >
    )
}

export const FieldSwitch: FunctionComponent<AxisProps> = ({ label, major, minor, extra, sort, clearable }) => {
    const [config, setConfig] = useModelState("chart_config");
    const [hist] = useModelState("title_hist");

    const items = columns(hist);

    const payload = JSON.parse(config);
    const selected = payload[major]["field"];

    const icon = items.find((entry) => entry.value === selected)?.icon;

    return (
        <Group noWrap spacing="xs">
            <Select
                label={label}
                searchable
                clearable={clearable}
                data={items}
                icon={icon}
                value={selected}
                itemComponent={IconItem}
                onChange={(value) => {
                    const updated = {
                        ...payload,
                        [major]: {
                            ...payload[major],
                            field: value
                        },
                    };
                    setConfig(JSON.stringify(updated));
                }}
                sx={{ width: ConfigItemWidth }}
            />

            {
                sort ?
                    <SortToggle major={major} minor={minor} extra={extra} sort={sort} />
                    :
                    undefined
            }
        </Group>
    )
}

export const AggregationSwitch: FunctionComponent<AxisProps> = ({ major }) => {
    const [config, setConfig] = useModelState("chart_config");

    const payload = JSON.parse(config);
    const selected = payload[major]["aggregation"] as AggregationType;

    const items = Object.values(AggregationType).map((operator) => ({
        value: operator,
        label: operator.charAt(0).toUpperCase() + operator.slice(1),
    }))

    return (
        <Group
            noWrap
            sx={{ width: ConfigItemWidth }}
        >
            <Text>
                Aggregation
            </Text>

            <Select
                searchable
                data={items}
                value={selected}
                onChange={(value) => {
                    const updated = {
                        ...payload,
                        [major]: {
                            ...payload[major],
                            aggregation: value
                        },
                    };
                    setConfig(JSON.stringify(updated));
                }}
            />
        </Group>
    );
}

export const HorizontalAxis: FunctionComponent = () => {
    return (
        <Stack>
            <Text>X-Axis</Text>

            <FieldSwitch major="x" minor="y" sort={true} />
        </Stack>
    )
}

export const VerticalAxis: FunctionComponent = () => {
    return (
        <Stack>
            <Text>Y-Axis</Text>

            <FieldSwitch major="y" minor="x" sort={true} />

            <AggregationSwitch major="y" minor="x" sort={true} />
        </Stack>
    )
}

export const ThetaAxis: FunctionComponent = () => {
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
                sx={{ width: ConfigItemWidth }}
            />

            <QuantitativeMenu major="y" minor="x" sort={true} />
        </Group>
    )
}

export const ColorAxis: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");
    const [hist] = useModelState("title_hist");

    const items = columns(hist);
    const selected = JSON.parse(config)["color"];
    const icon = items.find((entry) => entry.value === selected)?.icon;

    const key = Object.keys(ChartType).find(key => ChartType[key as keyof typeof ChartType] === JSON.parse(config)["type"]);
    const type = ChartType[key as keyof typeof ChartType];

    const menu = () => {
        switch (type) {
            case ChartType.Pie:
                return <QualitativeMenu />;
            default:
                return undefined;
        }
    }

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
                sx={{ width: ConfigItemWidth }}
            />

            {
                menu()
            }
        </Group>
    )
}

export const ChartProperties: FunctionComponent = () => {
    const [config] = useModelState("chart_config");

    const key = Object.keys(ChartType).find(key => ChartType[key as keyof typeof ChartType] === JSON.parse(config)["type"]);
    const type = ChartType[key as keyof typeof ChartType];
    const chart = ChartTypeComponents[type];

    return (
        <Stack>
            {chart}
        </Stack>
    )
}
