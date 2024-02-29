import { Stack, Text } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { FieldSwitch } from "../properties";

export const FunnelChart: FunctionComponent = () => {
    return (
        <Stack>
            <Text fw={600}>X-Axis</Text>

            <FieldSwitch major="x" minor="y" />

            <Text fw={600}>Y-Axis</Text>

            <FieldSwitch major="y" minor="x" />
        </Stack>
    );
}
