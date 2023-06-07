import { FunctionComponent, useRef, useState } from "react";
import { Group, Stack, Table, Text, NumberInput, Pagination, Select, ScrollArea, Box, ActionIcon, Tooltip } from "@mantine/core"
import React from "react";
import { uuid } from "@jupyter-widgets/base";
import { DataframeHeader } from "./header";
import { TableElement } from "./element";
import { useModel, useModelState } from "../hooks";
import { IconFilters } from "@tabler/icons-react";
import { useIntersection } from "@mantine/hooks";


const NumericElement: FunctionComponent<{ item: number, color: number, activated: boolean }> = ({ item, color, activated }) => {
    const textColor = color > 125 ? 0 : 255;
    const containerRef = useRef();
    const { ref, entry } = useIntersection({
        root: containerRef.current,
        threshold: 1,
    });
    return (
        <Box ref={ref} bg={activated && entry?.isIntersecting ? `rgb(${color}, ${color}, ${color})` : "transparent"} c={activated && entry?.isIntersecting ? `rgb(${textColor}, ${textColor}, ${textColor})` : "black"}>
            <Text sx={{ overflow: "hidden" }} fz="8px">
                {
                    item
                }
            </Text>
        </Box>
    )
}

export const DataTable: FunctionComponent = () => {
    const model = useModel();
    const [data] = useModelState("data_grid");
    const [hist] = useModelState("title_hist");
    const [execTime] = useModelState("exec_time");
    const [color] = useModelState("column_color");

    const [rowNumber, setRowNumber] = useState<number>(model?.get("row_range")[1] - model?.get("row_range")[0]);
    const [page, setPage] = useState(Math.floor(model?.get("row_range")[0] / rowNumber) + 1);
    const [tempoIndex, setTempoIndex] = useState<number>(1);
    const [outOfRange, setOutOfRange] = useState<boolean>(false);
    const [activatedFormatting, setActiedFormatting] = useState<boolean>(false);

    const info = JSON.parse(data.split("\n")[0]);
    const dataLength = data.split("\n")[1] as unknown as number || 0;
    const colorMatrix = JSON.parse(color).data;
    const header: string[] = info.columns;

    let timeDiff = 0;
    if (execTime.length !== 0) {
        timeDiff = (new Date(execTime.split(",")[1]).getTime() - new Date(execTime.split(",")[0]).getTime()) / 1000;
    }

    const headerContent = hist ?
        JSON.parse(hist)
        :
        [{ columnName: "", dtype: "", bins: [{ bin_start: 0, bin_end: 0, count: 0 }] }];

    const rows = [...Array(info.index.length).keys()].map((index: number) => (
        <tr key={uuid()}>
            <td key={index}>{info.index[index]}</td>
            {
                info.data[index].map((item: any, tdIndex: number) => (
                    <td key={tdIndex} style={{ fontSize: "8px" }}>
                        {
                            typeof (item) === "boolean" ?
                                item ?
                                    "True"
                                    :
                                    "False"
                                :
                                typeof (item) === "string" ?
                                    <TableElement item={item} />
                                    :
                                    <NumericElement
                                        item={item}
                                        color={colorMatrix[index] ? colorMatrix[index][tdIndex] : 255}
                                        activated={activatedFormatting}
                                    />
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
            <ScrollArea scrollbarSize={8} style={{ width: "100%" }}>
                <Table
                    withBorder
                    withColumnBorders
                    striped
                    sx={{
                        width: "100%",
                        "& thead": {
                            height: "57px",
                        },
                        "& td": {
                            maxWidth: "200px"
                        },
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

                    <DataframeHeader headerContent={headerContent} header={header} dataLength={dataLength} />

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
                    <Tooltip
                        label="Conditional Formatting"
                        withArrow
                    >
                        <ActionIcon
                            variant="transparent"
                            onClick={() => { setActiedFormatting(!activatedFormatting) }}
                        >
                            <IconFilters size={16} />
                        </ActionIcon>
                    </Tooltip>
                    <Group sx={{ gap: 0 }}>
                        <Select
                            sx={{
                                width: "40px",
                                height: "22px",
                                ".mantine-Select-item": { padding: "0px" },
                                ".mantine-Select-rightSection": { width: "20px" },
                                ".mantine-Select-input": {
                                    paddingLeft: "1px",
                                    paddingRight: "0px",
                                    height: "22px",
                                    minHeight: "22px",
                                    color: "#8d8d8d",
                                },
                            }}
                            placeholder={rowNumber as unknown as string}
                            data={["10", "30", "50", "100"]}
                            onChange={(number) => {
                                const num = number as unknown as number;
                                setPage(1);
                                setRowNumber(num);
                                model?.trigger("setRange", [(0 * num), 1 * num]);
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
                                    model?.trigger("setRange", [((index - 1) * rowNumber), index * rowNumber]);
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
                                    model?.trigger("setRange", [((tempoIndex - 1) * rowNumber), tempoIndex * rowNumber]);
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
                                        model?.trigger("setRange", [((tempoIndex - 1) * rowNumber), tempoIndex * rowNumber]);
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