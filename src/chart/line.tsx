import React, { FunctionComponent } from "react";
import { Text } from "@mantine/core";
import { FieldSwitch, HorizontalAxis, VerticalAxis } from "./properties";

export const LineChart: FunctionComponent = () => {
    return (
        <>
            <HorizontalAxis />
            <VerticalAxis />
            <Text fw={600}>Color</Text>

            <FieldSwitch major="color" />
        </>
    );
}