import { FunctionComponent, useEffect, useState } from "react";
import { Button, Group, Stack, Table, Text, NumberInput, Pagination, Select, ScrollArea } from "@mantine/core"
import React from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { uuid } from "@jupyter-widgets/base";
// import { Bar } from "@nivo/bar";
import { Dfhead } from "../WidgetView";

interface prop {
    data: string,
    model: any,
    page: number,
    setPage: React.Dispatch<React.SetStateAction<number>>,
    rowNumber: number,
    setRowNumber: React.Dispatch<React.SetStateAction<number>>,
    hist: Dfhead[];
}

const Order = {
    Increasing: 1,
    Descending: -1,
    None: 0,
}

export const DataTable: FunctionComponent<prop> = ({ data, model, page, setPage, rowNumber, setRowNumber, hist }) => {
    const [order, setOrder] = useState(Order.Increasing);
    const [col, setColName] = useState<string>(" ");
    const [tempoIndex, setTempoIndex] = useState<number>(1);
    const [outOfRange, setOutOfRange] = useState<boolean>(false);
    const info = JSON.parse(data.split("\n")[0]);
    const dataLength = data.split("\n")[1] as unknown as number || 0;
    const header: string[] = info.columns;
    let currentOrder = Order.None;


    useEffect(() => {
        model.set("json_dump", new Date().toISOString());
        model.save_changes();
    }, [])


    const rows = [...Array(info.index.length).keys()].map((index) => (
        <tr key={uuid()}>
            <td key={index}>{info.index[index]}</td>
            {
                info.data[index].map((item: any, tdIndex: number) => (
                    <td key={tdIndex} style={{ fontSize: "12px" }}>
                        {
                            typeof (item) === "boolean" ?
                                item ?
                                    "True"
                                    :
                                    "False"
                                :
                                item
                        }
                    </td>
                ))
            }
        </tr>
    ))

    return (
        <Stack
            align="center"
            spacing={10}
            sx={{
                width: "100%",
                marginBottom: "16px",
            }}>
            <ScrollArea style={{ width: "100%" }}>
                <Table
                    withBorder
                    withColumnBorders
                    striped
                    sx={{
                        width: "100%",
                        "& tbody tr td": {
                            padding: "0px 3px",
                        },
                        "&  td:first-of-type": {
                            backgroundColor: "#ebebeb",
                            width: "7%"
                        },
                        "&  tr:first-of-type": {
                            backgroundColor: "#ebebeb",
                        },
                        "&  tr:nth-of-type(even)": {
                            backgroundColor: "#f2f2f2",
                        },
                    }}>
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
                                        <Button
                                            color="dark"
                                            sx={{
                                                width: "100%",
                                                height: "27px",
                                                "&.mantine-UnstyledButton-root:hover": {
                                                    backgroundColor: "#ebebeb"
                                                }
                                            }}
                                            rightIcon={
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
                                        {/* {
                                            hist ?
                                                hist.filter(his => his.columnName === item).length !== 0 ?
                                                    <Bar
                                                        data={hist.filter(his => his.columnName === item)[0].bins}
                                                        enableGridY={false}
                                                        colorBy={"id"}
                                                        keys={["count"]}
                                                        indexBy="bin_start"
                                                        layout={"vertical"}
                                                        groupMode={"stacked"}
                                                        reverse={false}
                                                        height={40} width={60}
                                                        enableLabel={false}
                                                        valueScale={{ type: "symlog" }}
                                                    />
                                                    :
                                                    <></>
                                                :
                                                <></>
                                        } */}
                                    </th>
                                )
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </Table >
            </ScrollArea>
            <Group
                position="apart"
                sx={{ width: "100%" }}>
                <Group><Text color="#8d8d8d">{dataLength} rows</Text></Group>
                <Group align={"center"}>
                    <Group sx={{ gap: 0 }}>
                        <Select
                            sx={{
                                width: "40px",
                                height: "22px",
                                ".mantine-Select-item": { padding: "0px" },
                                ".mantine-Select-rightSection": { width: "20px" },
                                ".mantine-Select-input": {
                                    paddingLeft: "5px",
                                    paddingRight: "0px",
                                    height: "22px",
                                    minHeight: "22px",
                                    color: "#8d8d8d",
                                },
                            }}
                            placeholder="10"
                            data={["5", "10", "20", "30"]}
                            onChange={(number) => {
                                const num = number as unknown as number;
                                setPage(1);
                                setRowNumber(num);
                                model.trigger("setRange", [(0 * num), 1 * num]);
                            }}
                        />
                        <Text color="#8d8d8d">/page</Text>
                    </Group>
                    {
                        data ?
                            <Pagination
                                size="xs"
                                page={page}
                                total={Math.ceil(dataLength / rowNumber)}
                                onChange={(index) => {
                                    setPage(index);
                                    model.trigger("setRange", [((index - 1) * rowNumber), index * rowNumber]);
                                }}
                                styles={(theme) => ({
                                    item: {
                                        color: theme.colors.gray[4],
                                        backgroundColor: theme.colors.gray[0],
                                        "&[data-active]": {
                                            color: theme.colors.dark[2],
                                            backgroundColor: theme.colors.gray[4],
                                        },
                                    },
                                })}
                            />
                            :
                            <></>
                    }
                    <Group sx={{ gap: 0 }}>
                        <Text color="#8d8d8d">goto</Text>
                        <NumberInput
                            defaultValue={18}
                            size="xs"
                            hideControls
                            error={outOfRange}
                            value={page}
                            onBlur={() => {
                                if (tempoIndex > 0 && tempoIndex <= Math.ceil(dataLength / rowNumber)) {
                                    setPage(tempoIndex);
                                    setOutOfRange(false);
                                    model.trigger("setRange", [((tempoIndex - 1) * rowNumber), tempoIndex * rowNumber]);
                                } else {
                                    setOutOfRange(true)
                                }
                            }}
                            onKeyDown={(e) => {
                                if (["Escape", "Enter"].indexOf(e.key) > -1) {
                                    (document.activeElement instanceof HTMLElement) && document.activeElement.blur();
                                    if (tempoIndex > 0 && tempoIndex <= Math.ceil(dataLength / rowNumber)) {
                                        setPage(tempoIndex);
                                        setOutOfRange(false);
                                        model.trigger("setRange", [((tempoIndex - 1) * rowNumber), tempoIndex * rowNumber]);
                                    } else {
                                        setOutOfRange(true)
                                    }
                                }
                            }}
                            onChange={(page) => {
                                setTempoIndex(page as number);
                                ((page as number) > 0 && (page as number) <= Math.ceil(dataLength / rowNumber)) ?
                                    setOutOfRange(false)
                                    :
                                    setOutOfRange(true)
                            }}
                            sx={{
                                width: "40px",
                                ".mantine-NumberInput-input": {
                                    paddingLeft: "5px",
                                    paddingRight: "0px",
                                    height: "22px",
                                    minHeight: "22px",
                                }
                            }}
                        />
                    </Group>
                </Group>
            </Group>
        </Stack>
    )
}