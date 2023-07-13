import React, { FunctionComponent } from "react";
import { VegaLite, VisualizationSpec } from "react-vega";
import { useModelState } from "../hooks";

export const ChartPreview: FunctionComponent = () => {
    const [spec] = useModelState("vega_spec");

    const vega: VisualizationSpec = JSON.parse(spec);

    // const spec: VisualizationSpec = {
    //     "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    //     "description": "Google's stock price over time.",
    //     "width": 800,
    //     "height": ViewHeight,
    //     "transform": [
    //         {
    //             "calculate":
    //                 XAxis === "Index" ?
    //                     "toNumber(datum.x)"
    //                     :
    //                     dateColName.includes(XAxis) ?
    //                         "datetime(datum.x)"
    //                         :
    //                         "datum.x"
    //             ,
    //             "as": XAxis,
    //         },
    //         {
    //             "calculate": `datum.type`, "as": "Label",
    //         },
    //         {
    //             "calculate": "datum.y", "as": "Theta"
    //         },
    //         {
    //             "calculate": "datum.x", "as": "Categories"
    //         }
    //     ],
    //     "data": { "values": lineData.values },
    //     ...chartSpec,
    //     resolve: {
    //         scale: { "y": "independent" },
    //         legend: {
    //             // "color": "independent",
    //             // "size": "independent"
    //         }
    //     }
    // };

    // useEffect(() => {
    //     const view = new vega.View(vega.parse(vegaLite.compile(spec as any).spec), { renderer: 'none' });
    //     view
    //         .toCanvas()
    //         .then(png => {
    //             const base64Image = png.toDataURL()
    //             const decode = decodeURIComponent(base64Image)
    //             model?.set("png", decode.substring(22, decode.length))
    //             model?.save_changes()
    //         })
    //         .catch(error => {
    //             console.error('Error rendering chart:', error);
    //         });
    // }, [lineData])

    return (
        spec ?
            <VegaLite
                renderer="svg"
                actions={false}
                spec={vega}
            />
            :
            <></>
    )
}
