import { Stack } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { FieldSwitch } from "./properties";

export const ScatterChart: FunctionComponent = () => {
    return (
        <Stack>
            <FieldSwitch label="X-Axis" major="x" />

            <FieldSwitch label="Y-Axis" major="y" />

            <FieldSwitch label="Color" major="color" clearable />
        </Stack>
    );
}
