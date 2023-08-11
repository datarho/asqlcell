import { Stack, Text } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { FieldSwitch } from "./properties";

export const ScatterChart: FunctionComponent = () => {
    return (
        <Stack>
            <Text fw={600}>X-Axis</Text>

            <FieldSwitch major="x" />

            <Text fw={600}>Y-Axis</Text>

            <FieldSwitch major="y" />

            <Text fw={600}>Color</Text>

            <FieldSwitch major="color" clearable />
        </Stack>
    );
}
