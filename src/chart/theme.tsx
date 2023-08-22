import { Select } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { useModelState } from "../hooks";

export const ThemeSelect: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");

    const payload = JSON.parse(config);
    const theme: string = payload["theme"];

    return (
        <Select
            label="Theme"
            data={[
                { value: "accent", label: "Accent" },
                { value: "category10", label: "Category 10" },
                { value: "category20", label: "Category 20" },
                { value: "dark2", label: "Dark" },
                { value: "paired", label: "Paired" },
                { value: "tableau10", label: "Tableau 10" },
                { value: "tableau20", label: "Tableau 20" },
                { value: "blues", label: "Blues" },
                { value: "greens", label: "Greens" },
                { value: "browns", label: "Browns" },
            ]}
            value={theme}
            onChange={(value) => {
                const updated = {
                    ...payload,
                    theme: value
                };
                setConfig(JSON.stringify(updated));
            }}
        />
    )
}
