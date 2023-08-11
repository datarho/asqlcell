import { Stack, Text } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { AggregationSwitch, FieldSwitch } from "./properties";

export const FunnelChart: FunctionComponent = () => {
    return (
        <Stack>
            <Text fw={600}>Y-Axis</Text>

            <FieldSwitch major="y" minor="x" />

            <Text fw={600}>X-Axis</Text>

            <FieldSwitch major="x" minor="y" />

            <AggregationSwitch major="x" minor="y" />

            <FieldSwitch major="color" />
        </Stack>
    );
}
