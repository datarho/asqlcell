import React, { FunctionComponent } from "react";
import { VegaLite } from "react-vega";
import { Dfhead } from "../../view";
import { Group, Stack, Text } from "@mantine/core";



interface HistChartProps {
    headerContent: Dfhead;
    item: string;
}

export const HistChart: FunctionComponent<HistChartProps> = ({ item, headerContent }) => {
    const expo = (input: number) => { return input.toExponential(2) };
    const isScientific = (input: number) => { return (!(0.1 <= Math.abs(input) && Math.abs(input) <= 10000)) };
    const getIntervalSide = (input: number) => {
        let res = "";
        if (input === 0) {
            res = "0";
        }
        else if (isScientific(input)) {
            res = expo(input)
        } else {
            res = input.toFixed(2)
        }
        return res
    };

    const globalInterval = (item: string) => {
        const left = headerContent.bins[0].bin_start;
        const right = headerContent.bins[9].bin_end;
        return (
            `[${getIntervalSide(left)}, ${getIntervalSide(right)}]`
        )
    }

    const data = headerContent.bins
    const barData = {
        table:
            data.map((item: any, index: number) => {
                const leftInterval = getIntervalSide(item.bin_start);
                const rightInterval = getIntervalSide(item.bin_end);
                const interval = `[${leftInterval}, ${rightInterval}]`;
                return (
                    { a: interval, b: item.count, index: index }
                )
            }),
    };
    return (
        <Stack>
            <VegaLite
                data={barData}
                actions={false}
                renderer={'svg'}
                spec={{
                    background: "transparent",
                    data: {
                        name: "table"
                    },
                    width: 60,
                    height: 40,
                    config: {
                        view: {
                            stroke: null
                        }
                    },
                    layer: [
                        {
                            params: [
                                {
                                    name: "hover",
                                    select: {
                                        type: "point",
                                        on: "mouseover",
                                        clear: "mouseout"
                                    }
                                }
                            ],
                            mark: {
                                type: "bar",
                                color: "#eee",
                                tooltip: true
                            },
                            transform: [
                                {
                                    calculate: "datum.a + ': ' +datum.b", as: "tooltip",
                                }
                            ],
                            encoding: {
                                x: {
                                    field: "index",
                                    type: "nominal",
                                    axis: {
                                        labels: false,
                                        title: null
                                    },
                                },
                                tooltip: {
                                    field: "tooltip",
                                    type: "nominal"
                                },
                                opacity: {
                                    condition: {
                                        test: {
                                            param: "hover",
                                            empty: false
                                        },
                                        value: 0.5
                                    },
                                    value: 0
                                },
                                detail: [{ field: "count" }]
                            }
                        },
                        {
                            mark: "bar",
                            transform: [{
                                calculate: "datum.b===0 ? 0 : datum.b === 1? 0.5: log(datum.b)/log(2)", as: "log_x"
                            }],
                            encoding: {
                                x: {
                                    field: "index",
                                    type: "nominal",
                                    axis: {
                                        labels: false,
                                        title: null,
                                        ticks: false
                                    },
                                },
                                y: {
                                    field: "log_x",
                                    type: "quantitative",
                                    axis: {
                                        labels: false,
                                        domain: false,
                                        grid: false,
                                        ticks: false,
                                        title: null
                                    },
                                },
                            }
                        },
                    ]
                }}
            />
            <Group sx={{ width: "max-content" }}>
                <Text size="xs" c={"#696969"} sx={{ marginTop: "-20px" }}>
                    {globalInterval(item)}
                </Text>
            </Group>
        </Stack>
    )
};
