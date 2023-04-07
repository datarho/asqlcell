import React, { FunctionComponent, useState } from "react";
import { VegaLite } from "react-vega";
import { useModel } from "../hooks";

export const LineChart: FunctionComponent = () => {
    const [colData, setColData] = useState<any[] | undefined>(undefined);
    const model = useModel();
    model?.on("quick_view", (msg) => {
        setColData(JSON.parse(msg.slice(6, msg.length) ?? "{}").data);
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
                        encoding: {
                            x: { field: "a", type: "quantitative" },
                            y: { field: "b", type: "quantitative" },
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