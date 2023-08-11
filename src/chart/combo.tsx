import { Stack } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { AggregationSwitch, FieldSwitch } from "./properties";

export const ComboChart: FunctionComponent = () => {
    return (
        <Stack>
            <FieldSwitch label="X-Axis" major="x" minor="y" extra="y2" sort />

            <FieldSwitch label="Line" major="y" minor="y2" extra="x" sort />

            <AggregationSwitch major="y" />

            <FieldSwitch label="Column" major="y2" minor="x" extra="y" sort />

            <AggregationSwitch major="y2" />
        </Stack>
    );
}
