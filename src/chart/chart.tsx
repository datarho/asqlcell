import { Divider, Group } from "@mantine/core";
import React, { FunctionComponent, useState } from "react";
import { useModel } from "../hooks";
import { ChartConfig } from "./config";
import { ChartPreview } from "./preview";


export const Chart: FunctionComponent = () => {
    const model = useModel();
    const cache = model?.get("cache");
    const [XAxis, setXAxis] = useState(JSON.parse(cache.includes("xAxisState") && !cache.includes(`{"xAxisState":""}`) ? cache : `{"xAxisState":"Index"}`)["xAxisState"]);

    return (
        <Group noWrap>
            <ChartConfig
                XAxis={XAxis}
                setXAxis={setXAxis}
            />

            <Divider orientation="vertical" />

            <ChartPreview />
        </Group >
    )
}
