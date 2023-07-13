import { Select, Stack } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { useModelState } from "../hooks";
import { DataTypeIcon } from "../public";

const headers = (hist: string) => {
    const columns = JSON.parse(hist ?? "{}");

    return [...columns].map((header: { columnName: string, dtype: string }) => ({
        value: header.columnName,
        label: header.columnName,
        icon: DataTypeIcon[header.dtype]
    }))
}

const HorizontalAxis: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");
    const [hist] = useModelState("title_hist");

    return (
        <Select
            label="Column"
            data={headers(hist)}
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

    return (
        <Select
            label="Row"
            data={headers(hist)}
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
