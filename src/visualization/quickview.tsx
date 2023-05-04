import React, { FunctionComponent, useState } from "react";
import { VegaLite } from "react-vega";
import { useModel } from "../hooks";

export const QuickViewChart: FunctionComponent = () => {
    const model = useModel();
    const [data, setData] = useState(model?.get("quickv_data") !== "" ? model?.get("quickv_data") : `{"columns":[],"index":[],"data":[]}`);
    const colData = JSON.parse(data).data;
    const colName = JSON.parse(data).columns;
    model?.on("change:quickv_data", () => {
        setData(model.get("quickv_data"))
    });

    const lineData =
        colData ?
            {
                values:
                    colData.map((item: number[], index: number) => {
                        return (
                            colName.map((type: number, colIndex: number) => {
                                return ({ a: index, b: item[colIndex], c: type })
                            })
                        )[0]
                    })
            }
            :
            {
                values: [
                    { a: 0, b: 0 }
                ]
            };
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
                            { calculate: "datum.a", as: "index" },
                            { calculate: "datum.b", as: colName }
                        ],
                        encoding: {
                            x: { field: "index", type: dataLength >= 10 ? "quantitative" : "ordinal", axis: { title: null } },
                            y: { field: colName, type: "quantitative" },
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