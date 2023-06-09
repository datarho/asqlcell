import { ActionIcon, Divider, Group } from "@mantine/core";
import { useResizeObserver } from "@mantine/hooks";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { FunctionComponent } from "react";
import { VegaLite, VisualizationSpec } from "react-vega";
import { useModel, useModelState } from "../hooks";
import { LabelWidth, MenuWidth, ViewHeight } from "./const";
import { ColItem, VisualMenu } from "./menu";
import { vega, vegaLite } from "vega-embed";

interface previewChartProp {
    rect: any,
    XAxis: string,
    open: boolean,
}

const VisualPreviewChart: FunctionComponent<previewChartProp> = ({ rect, XAxis, open }) => {
    const model = useModel();
    const [hist] = useModelState("title_hist");
    const headers = JSON.parse(hist ?? `{"dtype":""}`);
    const dateCols = headers.filter((header: any) => header.dtype.includes("datetime"))
    const dateColName = dateCols.length >= 1 ? dateCols.map((item: { columnName: string }) => item.columnName) : [""];
    const [visData] = useModelState("vis_data");
    const lineData = { values: JSON.parse(visData === "" ? `[{ "x": 0, "y": 0, "type": 0 }]` : visData) };
    const [sortAsce, setSortAsce] = useState(true);
    model?.on("sort-X", () => setSortAsce(!sortAsce));
    const [cache] = useModelState("cache");
    const orient = JSON.parse(cache.includes("chartState") ? cache : `{"chartState":{"orient":"vertical"}}`).chartState.orient;
    const selectedCol =
        JSON.parse(
            cache.includes("selectedCol")
                ?
                cache
                :
                `{"selectedCol":[{"seriesName":"", "colName":"","chartType":"line", "yAxis":"left"}]}`).selectedCol
        ;
    const leftCols: string[] = selectedCol.filter((item: ColItem) => { return (item.yAxis === "left") }).map((item: ColItem) => item.colName)
    const rightCols: string[] = selectedCol.filter((item: ColItem) => { return (item.yAxis === "right") }).map((item: ColItem) => item.colName)
    const yAxisList = (leftCols.length > 0 && rightCols.length > 0) ?
        ["y", "y2"]
        :
        leftCols.length > 0 ?
            ["y"]
            :
            ["y2"]

    const charts = {
        "encoding": {
            "x": {
                field: orient === "vertical" ? XAxis : "y",
                axis: { labelAngle: 45 },
                sort: null,//sortAsce ? "ascending" : "descending",
                type: orient === "vertical" ?
                    XAxis === "Index" ?
                        "quantitative"
                        :
                        dateColName.includes(XAxis) ?
                            "temporal"
                            :
                            "nominal"
                    :
                    "quantitative"
            },
            "tooltip": [
                { "field": "x", "type": "nominal" }
            ]
        },
        "layer":
            yAxisList.map((item, index) => {
                return (
                    {
                        "transform":
                            item === "y"
                                ?
                                [
                                    {
                                        "filter": {
                                            "field": "type",
                                            "oneOf": leftCols
                                        }
                                    }
                                ]
                                :
                                [
                                    {
                                        "filter": {
                                            "field": "type",
                                            "oneOf": rightCols
                                        }
                                    }
                                ],
                        "encoding": {
                            y: {
                                field: orient === "vertical" ? "y" : XAxis,
                                type: orient === "vertical" ?
                                    "quantitative"
                                    :
                                    dateColName.includes(XAxis) ?
                                        "temporal"
                                        :
                                        "nominal",
                                axis: {
                                    orient: item === "y" ? "left" : "right"
                                }
                            },
                            opacity: {
                                condition: {
                                    param: `hover_${index}`,
                                    value: 0.8
                                },
                                value: 0.2
                            },
                        },
                        layer: [
                            // Chart type of visualization
                            ...selectedCol
                                .filter((series: ColItem) => series.chartType !== "arc")
                                .map((series: ColItem) => {
                                    return (
                                        {
                                            mark: series.chartType,
                                            transform: [
                                                { "filter": `datum.type==='${series.colName}'` },
                                                { "calculate": `datum.type + "_${series.chartType ?? ""}"`, "as": "Legend" }
                                            ],
                                            "encoding": {
                                                color: {
                                                    condition: {
                                                        param: `hover_${index}`,
                                                        field: "Legend",
                                                        type: "nominal",
                                                    },
                                                    value: "grey"
                                                }
                                            }
                                        }
                                    )
                                }),

                            // Hidden layer for interaction
                            {
                                params: [{
                                    name: `hover_${index}`,
                                    select: {
                                        type: "point",
                                        field: "Legend",
                                        on: "mouseover"
                                    }
                                }],
                                mark: { type: "line", strokeWidth: 8, stroke: "transparent" }
                            },
                        ]
                    })
            })
    };

    const pieCharts = selectedCol
        .filter((series: ColItem) => series.chartType === "arc")
        .map((series: ColItem) => {
            return (
                {
                    mark: { "type": "arc", "tooltip": true },
                    transform: [
                        { "filter": `datum.type==='${series.colName}'` }
                    ],
                    encoding: {
                        "theta": { "field": "Theta", "aggregate": "count", "type": "quantitative" },
                        "color": { "field": "Categories", "type": "nominal" },
                        "tooltip": [
                            { "field": "Theta", "aggregate": "count", "type": "nominal" }
                        ]
                    }
                }
            )
        });

    const hasPieChart = selectedCol.filter((series: ColItem) => series.chartType === "arc").length > 0;
    const hasOtherCharts = selectedCol.filter((series: ColItem) => series.chartType !== "arc").length > 0;
    const chartSpec = hasPieChart && hasOtherCharts ?
        {
            "hconcat": [
                charts,
                ...pieCharts
            ]
        }
        :
        hasPieChart ?
            { "hconcat": [...pieCharts] }
            :
            { ...charts };

    const spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Google's stock price over time.",
        "width": open ? rect.width - MenuWidth - LabelWidth : rect.width - 4 - LabelWidth,
        "height": ViewHeight,
        "transform": [
            {
                "calculate":
                    XAxis === "Index" ?
                        "toNumber(datum.x)"
                        :
                        dateColName.includes(XAxis) ?
                            "datetime(datum.x)"
                            :
                            "datum.x"
                ,
                "as": XAxis,
            },
            {
                "calculate": `datum.type`, "as": "Label",
            },
            {
                "calculate": "datum.y", "as": "Theta"
            },
            {
                "calculate": "datum.x", "as": "Categories"
            }
        ],
        "data": { "values": lineData.values },
        ...chartSpec,
        resolve: {
            scale: { "y": "independent" },
            legend: {
                // "color": "independent",
                // "size": "independent"
            }
        }
    };

    useEffect(() => {
        let view = new vega.View(vega.parse(vegaLite.compile(spec as any).spec), { renderer: 'none' });
        view
            .toCanvas()
            .then(png => {
                let base64Image = png.toDataURL()
                const decode = decodeURIComponent(base64Image)
                model?.set("png", decode.substring(22, decode.length))
                model?.save_changes()
            })
            .catch(error => {
                console.error('Error rendering chart:', error);
            });
    }, [lineData])

    return (
        <VegaLite
            renderer={'svg'}
            actions={false}
            spec={spec as VisualizationSpec}
        />
    )
}

export const Visualization: FunctionComponent = () => {
    const model = useModel();
    const cache = model?.get("cache");
    const [XAxis, setXAxis] = useState(JSON.parse(cache.includes("xAxisState") && !cache.includes(`{"xAxisState":""}`) ? cache : `{"xAxisState":"Index"}`)["xAxisState"]);
    const [ref, rect] = useResizeObserver();
    const [open, setOpen] = useState<boolean>(true);

    return (
        <Group grow ref={ref} sx={{ margin: "auto 1rem auto 0rem" }}>
            <Group noWrap sx={{ height: "100%", marginTop: "1rem", gap: "0", alignItems: "flex-start", justifyContent: "space-between" }}>
                <Group noWrap sx={{ gap: "0", width: "16rem" }}>
                    {
                        open ?
                            <VisualMenu
                                XAxis={XAxis}
                                setXAxis={setXAxis}
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
                <Group w={open ? rect.width - 256 - 28 : rect.width - 28}>
                    <VisualPreviewChart
                        rect={rect}
                        XAxis={XAxis}
                        open={open}
                    />
                </Group>
            </Group>
        </Group>
    )
}