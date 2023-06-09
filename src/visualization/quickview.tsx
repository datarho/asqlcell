import React, { FunctionComponent } from "react";
import { VegaLite } from "react-vega";
import { useModelState } from "../hooks";

export const QuickViewChart: FunctionComponent = () => {
    const [data] = useModelState("quickv_data");
    const lineData = { values: JSON.parse(data === "" ? `{"columns":[],"index":[],"data":[]}` : data) };
    const dataLength = lineData.values.length;
    return <VegaLite
        data={lineData}
        actions={false}
        renderer={'svg'}
        spec={
            {
                width: 400,
                height: 150,
                params: [{
                    name: "industry",
                    select: { type: "point", fields: ["series"] },
                    bind: "legend"
                }],
                layer: [
                    {
                        mark: "line",
                        transform: [
                            { calculate: "toNumber(datum.x)", as: "index" },
                            { calculate: "datum.y", as: "y" }
                        ],
                        encoding: {
                            x: { field: "index", type: dataLength >= 10 ? "quantitative" : "ordinal", axis: { title: null } },
                            y: { field: "y", type: "quantitative" },
                            opacity: {
                                condition: { param: "industry", value: 1 },
                                value: 10
                            }
                        },
                        data: { name: "values" }
                    }
                ]
            }} />;
}