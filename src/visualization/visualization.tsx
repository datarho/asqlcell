import { ActionIcon, Divider, Group, Stack } from "@mantine/core";
import { useResizeObserver } from "@mantine/hooks";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import React, { useState } from "react";
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
    // Index x-axis
    const model = useModel();
    const [data, setData] = useState(model?.get("vis_data") !== "" ? model?.get("vis_data") : `{"columns":[],"index":[],"data":[]}`);
    const colData = JSON.parse(data).data;
    const colName = JSON.parse(data).columns;
    model?.on("change:vis_data", () => {
        setData(model.get("vis_data"))
    })

    // Date x-axis
    const [tableData, setTableData] = useState(model?.get("data_grid") ?? "{}");
    const info = JSON.parse(tableData.split("\n")[0]);
    const [hist, setHist] = useState<string>(model?.get("title_hist") ?? "");
    model?.on("change:title_hist", () => { setHist(model.get("title_hist")) })
    const header = JSON.parse(hist ?? `{dtype:""}`);
    const dateColIndex: number = header.indexOf(header.filter((header: any) => header.dtype.includes("datetime"))[0]);
    const dateCol = info["data"].map((item: string[]) => Date.parse(item[dateColIndex]))
    model?.on("change:data_grid", () => {
        setTableData(model.get("data_grid"))
    })

    const lineData =
        colData ?
            XAxis === "Index" ?
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
                    values:
                        colData.map((item: number[], index: number) => {
                            return (
                                colName.map((type: string, colIndex: number) => (
                                    { a: dateCol[index], b: item[colIndex], c: type }
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
                    transform: [
                        {
                            calculate: "datum.a", "as": XAxis,
                        },
                        {
                            calculate: "datum.b", "as": colName,
                        },
                        {
                            calculate: "datum.c", "as": "Label",
                        }
                    ],
                    data: { name: "values" },
                    encoding: {
                        x: { field: XAxis, type: XAxis === "Index" ? "quantitative" : "temporal", axis: { tickMinStep: 30 } },
                        y: { field: colName, type: "quantitative" },
                        color: {
                            condition: {
                                param: "hover",
                                field: "Label",
                                type: "nominal",
                            },
                            value: "grey"
                        },
                        opacity: {
                            condition: {
                                param: "hover",
                                value: 1
                            },
                            value: 0.2
                        }
                    },
                    layer: [
                        {
                            mark: chartType === 1 ? "line" : "bar",
                        },
                        {
                            params: [{
                                name: "hover",
                                select: {
                                    type: "point",
                                    fields: ["Label"],
                                    on: "mouseover"
                                }
                            }],
                            mark: { "type": "line", "strokeWidth": 8, "stroke": "transparent" }
                        },
                    ],
                    config: { "view": { "stroke": null } },
                }} />
    )
}

export const Visualization: FunctionComponent = () => {
    const model = useModel();
    const [hist, setHist] = useState<string>(model?.get("title_hist") ?? "");
    model?.on("change:title_hist", () => { setHist(model.get("title_hist")) })
    const headerData: string[] = JSON.parse(hist ?? `{dtype:""}`).filter((header: any) => header.dtype.includes("int") || header.dtype.includes("float")).map((header: any) => header.columnName);
    const [XAxis, setXAxis] = useState("Index");
    const [ref, rect] = useResizeObserver();
    const [open, setOpen] = useState<boolean>(true);
    const [chartType, setChartType] = useState(1);

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