import { Stack, Text } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { FieldSwitch } from "./properties";

export const SunburstChart: FunctionComponent = () => {
    return (
        <Stack>
            <Text fw={600}>Category</Text>

            <FieldSwitch major="x" />

            <Text fw={600}>Sub category</Text>

            <FieldSwitch major="x2" />

            <Text fw={600}>Value</Text>

            {/* <FieldSwitch major="y" />

            <AggregationSwitch major="y" minor="x2" /> */}

            {/* <Text fw={600}>Color</Text>

            <FieldSwitch major="color" clearable /> */}
        </Stack>
    );
}
