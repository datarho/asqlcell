import { ActionIcon, Group, Select, Stack, Text, Tooltip } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { useModelState } from "../hooks";
import { AggregationType, ChartType, ChartTypeComponents, ConfigItemWidth, DataType, DataTypeIcons, SortIcons, SortType } from "./const";
import { IconItem } from "./item";

interface AxisProps {
    major: string;
    minor?: string;
    extra?: string;
    sort?: boolean;
    clearable?: boolean;
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

export const FieldSwitch: FunctionComponent<AxisProps> = ({ major, minor, extra, sort, clearable }) => {
    const [config, setConfig] = useModelState("chart_config");
    const [hist] = useModelState("title_hist");

    const columns = JSON.parse(hist);

    const items = [...columns].map((header: { columnName: string, dtype: DataType }) => ({
        value: header.columnName,
        label: header.columnName,
        icon: DataTypeIcons[header.dtype],
    }));

    const payload = JSON.parse(config);
    const selected = payload[major]["field"];

    const icon = items.find((entry) => entry.value === selected)?.icon;

    return (
        <Group noWrap spacing="xs">
            <Select
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
