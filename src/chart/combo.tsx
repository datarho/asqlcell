import { Stack, Text } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { AggregationSwitch, FieldSwitch } from "./properties";

export const ComboChart: FunctionComponent = () => {
    return (
        <Stack>
            <Text fw={600}>X-Axis</Text>

            <FieldSwitch major="x" minor="y" extra="y2" sort />

            <Text fw={600}>Line</Text>

            <FieldSwitch major="y" minor="y2" extra="x" sort />

            <AggregationSwitch major="y" />

            <Text fw={600}>Column</Text>

            <FieldSwitch major="y2" minor="x" extra="y" sort />

            <AggregationSwitch major="y2" />
        </Stack>
    );
}
