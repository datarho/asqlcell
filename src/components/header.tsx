import { Box, Button, Group, Modal, Stack, Text } from "@mantine/core";
import React, { useState } from "react";
import { FunctionComponent } from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { VegaLite } from "react-vega";
import { Dfhead } from "../WidgetView";

interface props {
    headerContent: Dfhead[];
    header: string[];
    model: any;
    data: string,
}

export const DataframeHeader: FunctionComponent<props> = ({ headerContent, header, model, data }) => {
    const Order = {
        Increasing: 1,
        Descending: -1,
        None: 0,
    }
    const [order, setOrder] = useState(Order.Increasing);
    let currentOrder = Order.None;
    const [col, setColName] = useState<string>(" ");
    const [openLineChart, setOpenLineChart] = useState<boolean>(false);

    const LineChart: FunctionComponent<{ data: any }> = ({ data }) => {
        const barData = {
            table: [
                { a: `${data[0].bin_start}-${data[0].bin_end}`, b: data[0].count },
                { a: `${data[1].bin_start}-${data[1].bin_end}`, b: data[1].count },
                { a: `${data[2].bin_start}-${data[2].bin_end}`, b: data[2].count },
                { a: `${data[3].bin_start}-${data[3].bin_end}`, b: data[3].count },
                { a: `${data[4].bin_start}-${data[4].bin_end}`, b: data[4].count },
                { a: `${data[5].bin_start}-${data[5].bin_end}`, b: data[5].count },
                { a: `${data[6].bin_start}-${data[6].bin_end}`, b: data[6].count },
                { a: `${data[7].bin_start}-${data[7].bin_end}`, b: data[7].count },
                { a: `${data[8].bin_start}-${data[8].bin_end}`, b: data[8].count },
                { a: `${data[9].bin_start}-${data[9].bin_end}`, b: data[9].count },
            ],
        }
        return (
            <VegaLite

                data={barData}
                actions={false}
                spec={{
                    "background": "transparent",
                    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
                    "data": { "name": 'table' },
                    "width": 60,
                    "height": 40,
                    "config": { "view": { "stroke": null } },
                    "layer": [
                        {
                            "params": [
                                {
                                    "name": "hover",
                                    "select": { "type": "point", "on": "mouseover", "clear": "mouseout" }
                                }
                            ],
                            "mark": { "type": "bar", "color": "#eee", "tooltip": true },
                            "transform": [
                                {
                                    "calculate": "log(datum.b)/log(10)", "as": "log_x",
                                }, {
                                    "calculate": "datum.b", "as": "count",
                                },
                                {
                                    "calculate": "datum.a", "as": "interval",
                                },
                            ],
                            "encoding": {
                                "x": {
                                    "field": "interval",
                                    "type": "nominal",
                                    "axis": { "labels": false, "title": null },
                                },
                                "opacity": {
                                    "condition": { "test": { "param": "hover", "empty": false }, "value": 0.5 },
                                    "value": 0
                                },
                                "detail": [{ "field": "count" }]
                            }
                        },
                        {
                            "mark": "bar",
                            "transform": [{
                                "calculate": "datum.b===0 ? 0 : datum.b === 1? 0.5: log(datum.b)/log(2)", "as": "log_x"
                            }],
                            "encoding": {
                                "x": {
                                    "field": "a",
                                    "type": "nominal",
                                    "axis": { "labels": false, "title": null },
                                },
                                "y": {
                                    "field": "log_x",
                                    "type": "quantitative",
                                    "axis": { "labels": false, "domain": false, "grid": false, "ticks": false, "title": null },
                                },
                            }
                        },
                    ]
                }}
            />
        )
    }

    return (
        <thead>
            <tr>
                <th></th>
                {
                    header.map((item, index) =>
                        <th
                            key={index}
                            style={{
                                textAlign: "center",
                                padding: 0,
                            }}>
                            <Group position="center" spacing="xs">
                                <Modal
                                    opened={openLineChart}
                                    onClose={() => setOpenLineChart(false)}
                                    title="Introduce yourself!"
                                    size="lg"
                                >
                                    <Box sx={{ height: "400px" }}>
                                        {/* <ResponsiveLine
                                            data={[{
                                                "id": "japan",
                                                "color": "hsl(94, 70%, 50%)",
                                                "data": chartData,
                                            }]}
                                            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}

                                        /> */}
                                    </Box>
                                </Modal>
                                {/* <Button onClick={() => {
                                    setChartData([0, 1, 2, 3, 4].map(subindex =>
                                        typeof (info.data[subindex][1]) !== "boolean" ?
                                            info.data[subindex][1]
                                            :
                                            info.data[subindex][1] ?
                                                1
                                                :
                                                0
                                    ));
                                    setOpenLineChart(true)
                                }}>

                                </Button> */}
                                <Button
                                    color="dark"
                                    sx={{

                                        height: "27px",
                                        "&.mantine-UnstyledButton-root:hover": {
                                            backgroundColor: "#ebebeb"
                                        }
                                    }}
                                    rightIcon={
                                        <>
                                            {
                                                headerContent ?
                                                    headerContent.filter(header => header.columnName === item).length !== 0 ?
                                                        <Text size={"xs"} fs="italic" color={"gray"}>{headerContent.filter(header => header.columnName === item)[0].dtype}</Text>
                                                        : <></>
                                                    :
                                                    <></>
                                            }
                                            {
                                                col === item ?
                                                    order === Order.Increasing ?
                                                        <FaSortUp color="gray" size={10} />
                                                        :
                                                        order === Order.Descending ?
                                                            <FaSortDown color="gray" size={10} />
                                                            :
                                                            <FaSort color="lightgray" size={10} />
                                                    :
                                                    <FaSort color="lightgray" size={10} />
                                            }
                                        </>
                                    }
                                    variant="subtle"
                                    onClick={() => {
                                        if (col === item) {
                                            if (order === Order.Increasing) {
                                                currentOrder = Order.Descending
                                                setOrder(Order.Descending)
                                            }
                                            else if (order === Order.Descending) {
                                                currentOrder = Order.None;
                                                setOrder(Order.None);
                                            } else {
                                                currentOrder = Order.Increasing
                                                setOrder(Order.Increasing)
                                            }
                                        } else {
                                            currentOrder = Order.Increasing
                                            setOrder(Order.Increasing)
                                            setColName(item)
                                        }
                                        model?.trigger("sort", [item, currentOrder])
                                    }}
                                >
                                    {item}
                                </Button>
                            </Group>
                            {
                                headerContent ?
                                    <>
                                        {
                                            headerContent.filter(header => header.columnName === item && (["int32", "int64", "float64"].includes(header.dtype))).length !== 0 ?
                                                <Stack sx={{ gap: 0 }}>
                                                    <LineChart data={headerContent.filter(header => header.columnName === item)[0].bins} />
                                                    {/* <Bar
                                                        data={headerContent.filter(header => header.columnName === item)[0].bins}
                                                        enableGridY={false}
                                                        padding={0.2}
                                                        colorBy={"id"}
                                                        keys={["count"]}
                                                        indexBy="bin_start"
                                                        layout={"vertical"}
                                                        groupMode={"stacked"}
                                                        reverse={false}
                                                        height={40} width={60}
                                                        enableLabel={false}
                                                        valueScale={{ type: "symlog" }}
                                                        tooltip={({ value, index }) => {
                                                            const binRange = headerContent.filter(header => header.columnName === item)[0].bins[index];
                                                            return (
                                                                <div
                                                                    style={{
                                                                        background: 'white',
                                                                        padding: '0 2px',
                                                                        border: '1px solid #ccc',
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            padding: '3px 0',
                                                                            fontSize: "2px"
                                                                        }}
                                                                    >
                                                                        <div style={{ display: "flex" }}>
                                                                            [{binRange.bin_start.toFixed(2)},{binRange.bin_end.toFixed(2)}]:{value}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }}
                                                    /> */}
                                                    <Text size="xs">
                                                        [{
                                                            Math.abs(headerContent.filter(header => header.columnName === item)[0].bins[0].bin_start) >= 100 ?
                                                                headerContent.filter(header => header.columnName === item)[0].bins[0].bin_start.toFixed(0) + " "
                                                                :
                                                                headerContent.filter(header => header.columnName === item)[0].bins[0].bin_start.toFixed(3) + " "
                                                        }
                                                        ,
                                                        {
                                                            Math.abs(headerContent.filter(header => header.columnName === item)[0].bins[9].bin_end) >= 100 ?
                                                                " " + headerContent.filter(header => header.columnName === item)[0].bins[9].bin_end.toFixed(0)
                                                                :
                                                                " " + headerContent.filter(header => header.columnName === item)[0].bins[9].bin_end.toFixed(3)
                                                        }]
                                                    </Text>
                                                </Stack>
                                                :
                                                <></>
                                        }
                                    </>
                                    :
                                    <></>

                            }
                        </th>
                    )
                }
            </tr >
        </thead >
    )
}