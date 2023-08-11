import { Stack, Text } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { AggregationSwitch, FieldSwitch } from "./properties";

export const BarChart: FunctionComponent = () => {
    return (
        <Stack>
            <Text>Y-Axis</Text>

            <FieldSwitch major="y" minor="x" sort={true} />

            <Text>X-Axis</Text>

            <FieldSwitch major="x" minor="y" sort={true} />

            <AggregationSwitch major="x" minor="y" />

            <FieldSwitch major="color" />
        </Stack>
    );
}
