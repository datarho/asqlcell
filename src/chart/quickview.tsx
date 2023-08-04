import React, { FunctionComponent } from "react";
import { VegaLite, VisualizationSpec } from "react-vega";
import { useModelState } from "../hooks";

export const QuickViewChart: FunctionComponent = () => {
    const [spec] = useModelState("quickview_vega");

    const vega: VisualizationSpec = JSON.parse(spec);

    return (
        "$schema" in vega ?
            <VegaLite
                renderer="svg"
                actions={{ export: true, source: false, compiled: false, editor: false }}
                spec={vega}
            />
            :
            <></>
    )
}