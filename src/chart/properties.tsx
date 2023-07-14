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



export const ChartProperties: FunctionComponent = () => {

    return (
        <Stack>
            <HorizontalAxis />

            <VerticalAxis />
        </Stack>
    )
}
