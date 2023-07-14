import React, { FunctionComponent } from "react";
import { VegaLite, VisualizationSpec } from "react-vega";
import { useModelState } from "../hooks";

export const ChartPreview: FunctionComponent = () => {
    const [spec] = useModelState("vega_spec");

    const vega: VisualizationSpec = JSON.parse(spec);

    return (
        spec ?
            <VegaLite
                renderer="svg"
                actions={{ export: true, source: false, compiled: false, editor: false }}
                spec={vega}
            />
            :
            <></>
    )
}
