import { Stack } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { FieldSwitch } from "./properties";

export const FunnelChart: FunctionComponent = () => {
    return (
        <Stack>
            <FieldSwitch label="X-Axis" major="x" minor="y" />

            <FieldSwitch label="Y-Axis" major="y" minor="x" />
        </Stack>
    );
}
