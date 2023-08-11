import React, { FunctionComponent } from "react";
import { Text } from "@mantine/core";
import { AggregationSwitch, FieldSwitch } from "./properties";

export const AreaChart: FunctionComponent = () => {
    return (
        <>
            <Text fw={600}>Y-Axis</Text>

            <FieldSwitch major="y" minor="x" sort={true} />

            <Text fw={600}>X-Axis</Text>

            <FieldSwitch major="x" minor="y" sort={true} />

            <AggregationSwitch major="x" minor="y" />

            <Text fw={600}>Color</Text>

            <FieldSwitch major="color" />
        </>
    );
}