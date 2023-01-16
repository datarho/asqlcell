import { FunctionComponent, useState } from "react";
import { Group, Stack, Table, Text, NumberInput, Pagination, Select, ScrollArea } from "@mantine/core"
import React from "react";
import { uuid } from "@jupyter-widgets/base";
import { DataframeHeader } from "./header";

interface prop {
    data: string,
    model: any,
    page: number,
    setPage: React.Dispatch<React.SetStateAction<number>>,
    rowNumber: number,
    setRowNumber: React.Dispatch<React.SetStateAction<number>>,
    hist: string;
    show: boolean;
}

export const DataTable: FunctionComponent<prop> = ({ data, model, page, setPage, rowNumber, setRowNumber, hist, show }) => {
    const [tempoIndex, setTempoIndex] = useState<number>(1);
    const [outOfRange, setOutOfRange] = useState<boolean>(false);
    const info = JSON.parse(data.split("\n")[0]);
    const dataLength = data.split("\n")[1] as unknown as number || 0;
    const header: string[] = info.columns;
    const headerContent = hist ?
        JSON.parse(hist).dfhead.slice(0, -1)
        :
        [{ columnName: "", dtype: "", bins: [{ bin_start: 0, bin_end: 0, count: 0 }] }];
    let timeDiff = 0;
    if (data) {
        const timeList = data.split("\n").pop();
        if (timeList !== "") {
            timeDiff = (new Date(timeList ? timeList.split(",")[1] : "0").getTime() - new Date(timeList ? timeList.split(",")[0] : "0").getTime()) / 1000;
        }
    }


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

                    <DataframeHeader headerContent={headerContent} header={header} model={model} />

                    <tbody>
                        {rows}
                    </tbody>
                </Table >
            </ScrollArea>
            <Group
                position="apart"
                sx={{ width: "100%" }}>
                <Group>
                    <Text color="#8d8d8d">{dataLength} rows</Text>
                    {
                        timeDiff !== 0 ?
                            <Text color="#8d8d8d">{timeDiff} s</Text>
                            :
                            <></>
                    }
                </Group>
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