import { Divider, Group } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { ChartConfig } from "./config";
import { ChartPreview } from "./preview";


export const Chart: FunctionComponent = () => {
    return (
        <Group noWrap>
            <ChartConfig />

            <Divider orientation="vertical" />

            <ChartPreview />
        </Group >
    )
}
