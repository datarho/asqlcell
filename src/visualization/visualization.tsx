import { ActionIcon, Divider, Group, Stack } from "@mantine/core";
import { useResizeObserver } from "@mantine/hooks";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { FunctionComponent } from "react";
import { VegaLite, VisualizationSpec } from "react-vega";
import { useModel, useModelState } from "../hooks";
import { LabelWidth, MenuWidth, ViewHeight } from "./const";
import { VisualMenu } from "./menu";
import { vega, vegaLite } from "vega-embed";

interface previewChartProp {
    rect: any,
    chartType: string,
    XAxis: string,
    open: boolean,
}

export type ChartTypeList = "line" | "arc" | "bar";

const VisualPreviewChart: FunctionComponent<previewChartProp> = ({ rect, chartType, XAxis, open }) => {
    const model = useModel();
    const [hist, setHist] = useState<string>(model?.get("title_hist") ?? "");
    model?.on("change:title_hist", () => { setHist(model.get("title_hist")) })
    const headers = JSON.parse(hist ?? `{"dtype":""}`);
    const dateCols = headers.filter((header: any) => header.dtype.includes("datetime"))
    const dateColName = dateCols.length >= 1 ? dateCols.map((item: { columnName: string }) => item.columnName) : [""];
    const [visData] = useModelState("vis_data");
    const lineData = { values: JSON.parse(visData === "" ? `[{ "x": 0, "y": 0, "type": 0 }]` : visData) };
    const [sortAsce, setSortAsce] = useState(true);
    model?.on("sort-X", () => setSortAsce(!sortAsce));

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
                "calculate": "datum.y", "as": "col",
            },
            {
                "calculate": "datum.type", "as": "Label",
            }
        ],
        "data": { "values": lineData.values },
        "encoding": {
            "x": {
                field: XAxis,
                axis: { labelAngle: 0 },
                sort: sortAsce ? "ascending" : "descending",
                type: XAxis === "Index" ?
                    "quantitative"
                    :
                    dateColName.includes(XAxis) ?
                        "temporal"
                        :
                        "nominal"
            },
            "y": {
                field: "y",
                type: "quantitative"
            },
            "color": {
                condition: {
                    param: "hover",
                    field: "Label",
                    type: "nominal",
                },
                value: "grey"
            },
            "opacity": {
                condition: {
                    param: "hover",
                    value: chartType === "line" ? 1 : 0.5
                },
                value: 0.2
            }
        },
        "layer": [
            {
                mark: chartType as ChartTypeList,
            },
            {
                params: [{
                    name: "hover",
                    select: {
                        type: "point" as ChartTypeList,
                        fields: ["Label"],
                        on: "mouseover"
                    }
                }],
                mark: { "type": "line" as ChartTypeList, "strokeWidth": 8, "stroke": "transparent" }
            },
        ],

    };


    useEffect(() => {
        var view = new vega.View(vega.parse(vegaLite.compile(spec as any).spec), { renderer: 'none' });
        view
            .toCanvas()
            .then(png => {
                var base64Image = png.toDataURL()
                const decode = decodeURIComponent(base64Image)
                model?.set("png", decode.substring(22, decode.length))
                model?.save_changes()
            })
            .catch(error => {
                console.error('Error rendering chart:', error);
            });
    }, [lineData])

    return (
        <>
            <div id="chart"></div>
            <VegaLite
                renderer={'svg'}
                actions={false}
                spec={spec as VisualizationSpec} />
        </>
    )
}

export const Visualization: FunctionComponent = () => {
    const model = useModel();
    const cache = model?.get("cache");
    const [XAxis, setXAxis] = useState(JSON.parse(cache.includes("xAxisState") && !cache.includes(`{"xAxisState":""}`) ? cache : `{"xAxisState":"Index"}`)["xAxisState"]);
    const [ref, rect] = useResizeObserver();
    const [open, setOpen] = useState<boolean>(true);
    const [chartType, setChartType] = useState<string>("line");

    return (
        <Group grow ref={ref} sx={{ margin: "auto 1rem auto 0rem" }}>
            <Group noWrap sx={{ height: "100%", marginTop: "1rem", gap: "0", alignItems: "flex-start" }}>
                <Group noWrap sx={{ gap: "0", width: "90%" }}>
                    {
                        open ?
                            <VisualMenu
                                chartType={chartType}
                                setChartType={setChartType}
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
                <Stack>
                    <VisualPreviewChart
                        rect={rect}
                        chartType={chartType}
                        XAxis={XAxis}
                        open={open}
                    />
                </Stack>
            </Group>
        </Group>
    )
}