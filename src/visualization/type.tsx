import React, { FunctionComponent } from "react";
import { Select } from "@mantine/core";
import { useModelState } from "../hooks";


export const ChartType: FunctionComponent = () => {
    const [chartConfig, setChartConfig] = useModelState("chart_config");

    return (
        <Select
            label="Chart type"
            placeholder="Pick one"
            data={[
                { value: "bar", label: "Bar" },
            ]}
            onChange={(value) => {
                const config = JSON.parse(chartConfig);
                config["type"] = value;
                setChartConfig(JSON.stringify(config));
                console.log(config)

            }}
        />
    )
}
