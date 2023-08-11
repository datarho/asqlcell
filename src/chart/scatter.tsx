import { Stack, Text } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { FieldSwitch } from "./properties";

export const ScatterChart: FunctionComponent = () => {
    return (
        <Stack>
            <Text fw={600}>X-Axis</Text>

            <FieldSwitch major="x" minor="y" sort={true} />

            <Text fw={600}>Y-Axis</Text>

            <FieldSwitch major="y" minor="x" sort={true} />

            <Text fw={600}>Color</Text>

            <FieldSwitch major="color" clearable />
        </Stack>
    );
}
