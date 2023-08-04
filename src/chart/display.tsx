import { NumberInput, Stack, Switch } from "@mantine/core";
import { IconArrowAutofitHeight, IconArrowAutofitWidth } from "@tabler/icons-react";
import React, { FunctionComponent } from "react";
import { useModelState } from "../hooks";

export const DisplaySize: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");

    const payload = JSON.parse(config);
    const width: number = payload["width"];
    const height: number = payload["height"];

    const label = payload["label"]
    const legend = payload["legend"]

    return (
        <Stack>
            <NumberInput
                defaultValue={0}
                label="Width"
                max={10000}
                min={0}
                icon={<IconArrowAutofitWidth stroke={1.5} size={14} />}
                step={100}
                sx={{ width: 240 }}
                value={width}
                onChange={(value) => {
                    const updated = {
                        ...payload,
                        width: value,
                    };
                    setConfig(JSON.stringify(updated));
                }}
            />

            <NumberInput
                defaultValue={0}
                label="Height"
                max={10000}
                min={0}
                icon={<IconArrowAutofitHeight stroke={1.5} size={14} />}
                step={100}
                sx={{ width: 240 }}
                value={height}
                onChange={(value) => {
                    const updated = {
                        ...payload,
                        height: value,
                    };
                    setConfig(JSON.stringify(updated));
                }}
            />

            <Switch
                value="visible"
                label="Show label"
                checked={label}
                onChange={(event) => {
                    const updated = {
                        ...payload,
                        label: event.currentTarget.checked
                    };
                    setConfig(JSON.stringify(updated));
                }}
            />

            <Switch
                value="visible"
                label="Show legend"
                checked={legend["visible"]}
                onChange={(event) => {
                    const updated = {
                        ...payload,
                        legend: {
                            ...payload["legend"],
                            visible: event.currentTarget.checked
                        },
                    };
                    setConfig(JSON.stringify(updated));
                }}
            />
        </Stack>
    )
}
