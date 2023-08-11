import { Stack, Text } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { AggregationSwitch, FieldSwitch } from "./properties";

export const BarChart: FunctionComponent = () => {
    return (
        <Stack>
            <Text fw={600}>X-Axis</Text>

            <FieldSwitch major="y" minor="x" sort />

            <Text fw={600}>Y-Axis</Text>

            <FieldSwitch major="x" minor="y" sort />

            <AggregationSwitch major="x" minor="y" />

            <Text fw={600}>Color</Text>

            <FieldSwitch major="color" clearable />
        </Stack>
    );
}
