import { ActionIcon, Divider, Group, Stack } from "@mantine/core";
import { useResizeObserver } from "@mantine/hooks";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { FunctionComponent } from "react";
import { VegaLite } from "react-vega";
import { useModel } from "../hooks";
import { LabelWidth, MenuWidth, ViewHeight } from "./const";
import { VisualMenu } from "./menu";

interface previewChartProp {
    rect: any;
    chartType: number;
    XAxis: string;
    open: boolean;
}

const VisualPreviewChart: FunctionComponent<previewChartProp> = ({ rect, chartType, XAxis, open }) => {
    const model = useModel();
    const [data, setData] = useState(model?.get("vis_data") !== "" ? model?.get("vis_data") : `{"columns":[],"index":[],"data":[]}`);
    const colData = JSON.parse(data).data;
    const colName = JSON.parse(data).columns;
    model?.on("change:vis_data", () => {
        setData(model.get("vis_data"))
    })
    const lineData =
        colData ?
            {
                values:
                    colData.map((item: number[], index: number) => {
                        return (
                            colName.map((type: string, colIndex: number) => (
                                { a: index, b: item[colIndex], c: type }
                            ))
                        )
                    }).flat()
            }
            :
            {
                values: [
                    { 'a': 0, 'b': 0, 'c': "" }
                ]
            };

    return (
        <VegaLite
            data={lineData}
            renderer={'svg'}
            actions={false}
            spec={
                {
                    width: open ? rect.width - MenuWidth - LabelWidth : rect.width - 4 - LabelWidth,
                    height: ViewHeight,
                    params: [{
                        name: "industry",
                        select: { type: "point", fields: ["series"] },
                        bind: "legend"
                    }],
                    layer: [
                        {
                            mark: chartType === 1 ? "line" : "bar",
                            transform: [
                                {
                                    calculate: "datum.a", "as": XAxis,
                                },
                                {
                                    calculate: "datum.b", "as": colName,
                                }
                            ],
                            encoding: {
                                x: { field: XAxis, type: "quantitative", axis: { tickMinStep: 30 } },
                                y: { field: colName, type: "quantitative" },
                                color: { field: "c", type: "nominal" },
                                opacity: {
                                    condition: { param: "industry", value: 1 },
                                    value: 10
                                }
                            },
                            data: { name: "values" } // note: vega-lite data attribute is a plain object instead of an array
                        }
                    ]
                }} />
    )
}

export const Visualization: FunctionComponent = () => {
    const model = useModel();

    const [hist, setHist] = useState<string>(model?.get("title_hist") ?? "");
    model?.on("change:title_hist", () => { setHist(model.get("title_hist")) })
    const headerData: string[] = JSON.parse(hist ?? `{dtype:""}`).filter((header: any) => header.dtype.includes("int") || header.dtype.includes("float")).map((header: any) => header.columnName);

    const quickName = JSON.parse(model?.get("vis_data") !== "" ? model?.get("vis_data") : `{"columns":[]}`).columns[0];
    const [colName, setColName] = useState<string>(quickName);
    const [XAxis, setXAxis] = useState("index");
    const [ref, rect] = useResizeObserver();
    const [open, setOpen] = useState<boolean>(true);
    const [chartType, setChartType] = useState(1);
    useEffect(() => {
        model?.trigger("vis_sql", colName)
    }, [])

    return (
        <Group grow ref={ref} sx={{ margin: "auto 1rem auto 0rem" }}>
            <Group noWrap sx={{ height: "100%", marginTop: "1rem", gap: "0", alignItems: "flex-start" }}>
                <Group noWrap sx={{ gap: "0", width: "90%" }}>
                    {
                        open ?
                            <VisualMenu
                                chartType={chartType}
                                setChartType={setChartType}
                                setXAxis={setXAxis}
                                setColName={setColName}
                                colName={colName}
                                header={headerData}
                            />
                            :
                            <></>
                    }
                </Group>
                <ActionIcon onClick={() => { setOpen(!open) }}>
                    {
                        open ?
                            <IconChevronLeft />
                            :
                            <IconChevronRight />
                    }
                </ActionIcon>
                <Divider orientation="vertical" />
                <Stack>
                    <VisualPreviewChart rect={rect} chartType={chartType} XAxis={XAxis} open={open} />
                </Stack>
            </Group>
        </Group>
    )
}