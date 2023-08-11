import { Stack } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { AggregationSwitch, FieldSwitch } from "./properties";

export const PieChart: FunctionComponent = () => {
    return (
        <Stack>
            <FieldSwitch label="X-Axis" major="y" minor="x" sort={true} />

            <FieldSwitch label="Color" major="x" minor="y" sort={true} />

            <AggregationSwitch major="y" minor="x" />
        </Stack>
    );
}
