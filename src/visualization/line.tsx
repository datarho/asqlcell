import React, { FunctionComponent, useState } from "react";
import { VegaLite } from "react-vega";
import { useModel } from "../hooks";

export const LineChart: FunctionComponent = () => {
    const model = useModel();
    const [data, setData] = useState(model?.get("vis_data") !== "" ? model?.get("vis_data") : `{\"columns\":[],\"index\":[],\"data\":[]}`);
    const colData = JSON.parse(data).data;
    const colName = JSON.parse(data).columns[0];
    model?.on("change:vis_data", (msg) => {
        setData(model.get("vis_data"))
    });

    const lineData =
        colData ?
            {
                values:
                    colData.map((item: number, index: number) => {
                        return ({ a: index, b: item })
                    })
            }
            :
            {
                values: [
                    { 'a': 0, 'b': 0 }
                ]
            };
    const dataLength = lineData.values.length;

    return <VegaLite
        data={lineData}
        actions={false}
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
                        mark: 'line',
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
                        data: { name: 'values' }
                    }
                ]
            }} />;
}