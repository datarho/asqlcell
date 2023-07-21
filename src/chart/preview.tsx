import { ScrollArea } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { VegaLite, VisualizationSpec } from "react-vega";
import { useModelState } from "../hooks";

export const ChartPreview: FunctionComponent = () => {
    const [spec] = useModelState("preview_vega");

    const vega: VisualizationSpec = JSON.parse(spec);

    return (
        vega ?
            <ScrollArea
                style={{ width: "100%" }}
            >
                <VegaLite
                    renderer="svg"
                    actions={{ export: true, source: false, compiled: false, editor: false }}
                    spec={vega}
                />
            </ScrollArea>
            :
            <></>
    )
}
