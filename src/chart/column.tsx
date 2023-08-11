import { Stack, Text } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { AggregationSwitch, FieldSwitch } from "./properties";

export const ColumnChart: FunctionComponent = () => {
    return (
        <Stack>
            <Text>X-Axis</Text>

            <FieldSwitch major="x" minor="y" sort={true} />

            <Text>Y-Axis</Text>

            <FieldSwitch major="y" minor="x" sort={true} />

            <AggregationSwitch major="y" minor="x" />

            <FieldSwitch major="color" />
        </Stack>
    );
}
