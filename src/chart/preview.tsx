import React, { FunctionComponent } from "react";
import { VegaLite, VisualizationSpec } from "react-vega";
import { useModelState } from "../hooks";

export const ChartPreview: FunctionComponent = () => {
    const [spec] = useModelState("preview_vega");

    const vega: VisualizationSpec = JSON.parse(spec);

    return (
        vega ?
            <VegaLite
                renderer="svg"
                actions={{ export: true, source: false, compiled: false, editor: false }}
                spec={vega}
            />
            :
            <></>
    )
}
