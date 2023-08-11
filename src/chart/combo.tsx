import { Stack, Text } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { AggregationSwitch, FieldSwitch } from "./properties";

export const ComboChart: FunctionComponent = () => {
    return (
        <Stack>
            <Text fw={600}>X-Axis</Text>

            <FieldSwitch major="x" sort />

            <Text fw={600}>Column</Text>

            <FieldSwitch major="y" />

            <AggregationSwitch major="y" />

            <Text fw={600}>Line</Text>

            <FieldSwitch major="y2" />

            <AggregationSwitch major="y2" />
        </Stack>
    );
}
