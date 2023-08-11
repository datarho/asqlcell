import { Stack } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { AggregationSwitch, FieldSwitch } from "./properties";

export const ColumnChart: FunctionComponent = () => {
    return (
        <Stack>
            <FieldSwitch label="X-Axis" major="x" minor="y" sort />

            <FieldSwitch label="Y-Axis" major="y" minor="x" sort />

            <AggregationSwitch major="y" minor="x" />

            <FieldSwitch label="Color" major="color" clearable />
        </Stack>
    );
}
