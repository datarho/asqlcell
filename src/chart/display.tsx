import { NumberInput, Stack } from "@mantine/core";
import { IconArrowAutofitHeight, IconArrowAutofitWidth } from "@tabler/icons-react";
import React, { FunctionComponent } from "react";
import { useModelState } from "../hooks";

export const DisplaySize: FunctionComponent = () => {
    const [config, setConfig] = useModelState("chart_config");
    const width: number = JSON.parse(config)["width"];
    const height: number = JSON.parse(config)["height"];

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
                        ...JSON.parse(config),
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
                        ...JSON.parse(config),
                        height: value,
                    };
                    setConfig(JSON.stringify(updated));
                }}
            />
        </Stack>
    )
}
