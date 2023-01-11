import { Button, Group, Stack, Text } from "@mantine/core";
import { Bar } from "@nivo/bar";
import React, { useState } from "react";
import { FunctionComponent } from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { Dfhead } from "../WidgetView";

interface props {
    headerContent: Dfhead[];
    header: string[];
    model: any;
}

export const DataframeHeader: FunctionComponent<props> = ({ headerContent, header, model }) => {
    const Order = {
        Increasing: 1,
        Descending: -1,
        None: 0,
    }
    const [order, setOrder] = useState(Order.Increasing);
    let currentOrder = Order.None;
    const [col, setColName] = useState<string>(" ");

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
                                                    <Bar
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
                                                    />
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
            </tr>
        </thead>
    )
}