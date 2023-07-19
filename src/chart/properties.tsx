import { Select, Stack } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { useModelState } from "../hooks";
import { DataType, DataTypeIcon } from "./const";
import { IconItem, ItemIcon } from "./item";

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
        />
    )
}

const VerticalAxis: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");
    const [hist] = useModelState("title_hist");

    const items = columns(hist);
    const selected = JSON.parse(config)["y"];
    const icon = items.find((entry) => entry.value === selected)?.icon;

    return (
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
