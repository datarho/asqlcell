import { Select } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { useModelState } from "../hooks";


export const ChartType: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");

    return (
        <Select
            label="Chart type"
            placeholder="Pick one"
            data={[
                { value: "bar", label: "Bar" },
            ]}
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
