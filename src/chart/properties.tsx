import { ActionIcon, Group, Select, Stack } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { useModelState } from "../hooks";
import { DataType, DataTypeIcon } from "./const";
import { IconItem, ItemIcon } from "./item";
import { IconSettings } from "@tabler/icons-react";

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
                label="X axis"
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

    const items = columns(hist);
    const selected = JSON.parse(config)["y"];
    const icon = items.find((entry) => entry.value === selected)?.icon;

    return (
        <Stack>
            <Group noWrap spacing="xs">
                <Select
                    label="Y axis"
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
                <ActionIcon mt="xl" variant="transparent">
                    <IconSettings size={16} />
                </ActionIcon>
            </Group>

            <VerticalAxisAggr />
        </Stack>
    )
}

const VerticalAxisAggr: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");

    const selected = JSON.parse(config)["aggr"];

    return (
        <Select
            label="Aggregation"
            data={[
                { value: "count", label: "count" },
                { value: "max", label: "max" },
                { value: "mean", label: "mean" },
                { value: "median", label: "median" },
                { value: "min", label: "min" },
                { value: "sum", label: "sum" },
            ]}
            value={selected}
            onChange={(value) => {
                const updated = {
                    ...JSON.parse(config),
                    aggr: value,
                };
                setConfig(JSON.stringify(updated));
            }}
            sx={{ width: 240 }}
        />
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
            case "bar":
                return (
                    <>
                        <HorizontalAxis />
                        <VerticalAxis />
                    </>
                )

            case "pie":
                return (
                    <>
                        <ColorAxis />
                        <ThetaAxis />
                    </>
                )
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
