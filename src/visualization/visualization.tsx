import { ActionIcon, Divider, Group, Stack } from "@mantine/core";
import { useResizeObserver } from "@mantine/hooks";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import React, { useState } from "react";
import { FunctionComponent } from "react";
import { VegaLite } from "react-vega";
import { useModel, useModelState } from "../hooks";
import { LabelWidth, MenuWidth, ViewHeight } from "./const";
import { VisualMenu } from "./menu";

interface previewChartProp {
    rect: any;
    chartType: number;
    XAxis: string;
    open: boolean;
}

const VisualPreviewChart: FunctionComponent<previewChartProp> = ({ rect, chartType, XAxis, open }) => {
    const [visData] = useModelState("vis_data");
    const lineData = { values: JSON.parse(visData === "" ? `[{ "x": 0, "y": 0, "type": 0 }]` : visData) };
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
                            calculate: XAxis === "Index" ? "toNumber(datum.x)" : "datetime(datum.x)", "as": XAxis,
                        },
                        {
                            calculate: "datum.y", "as": "col",
                        },
                        {
                            calculate: "datum.type", "as": "Label",
                        }
                    ],
                    data: { name: "values" },
                    encoding: {
                        x: { field: XAxis, type: XAxis === "Index" ? "quantitative" : "temporal" },
                        y: { field: "y", type: "quantitative" },
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

    const headerData: string[] = JSON.parse(hist ?? `{"dtype":""}`).filter((header: any) => header.dtype.includes("int") || header.dtype.includes("float")).map((header: any) => header.columnName);
    const cache = model?.get("cache");
    const [XAxis, setXAxis] = useState(JSON.parse(cache.includes("xAxisState") && !cache.includes(`{"xAxisState":""}`) ? cache : `{"xAxisState":"Index"}`)["xAxisState"]);
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
                                XAxis={XAxis}
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