import { Stack, Text } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { AggregationSwitch, FieldSwitch } from "./properties";

export const PieChart: FunctionComponent = () => {
    return (
        <Stack>
            <Text fw={600}>Size</Text>

            <FieldSwitch major="y" minor="x" sort={true} />

            <Text fw={600}>Color</Text>

            <FieldSwitch major="x" minor="y" sort={true} />

            <AggregationSwitch major="y" minor="x" />
        </Stack>
    );
}
