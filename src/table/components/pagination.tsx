import React, { FunctionComponent, useState } from "react"
import { ActionIcon, Group, NumberInput, Pagination, Select, Text, Tooltip } from "@mantine/core";
import { IconFilters } from "@tabler/icons-react";
import { useModel, useModelState } from "../../hooks";

export const TablePagination: FunctionComponent = () => {
    const model = useModel();
    const [data] = useModelState("data_grid");
    const dataLength = data.split("\n")[1] as unknown as number || 0;
    const [rowNumber, setRowNumber] = useState<number>(model?.get("row_range")[1] - model?.get("row_range")[0]);
    const [page, setPage] = useState(Math.floor(model?.get("row_range")[0] / rowNumber) + 1);
    const [tempoIndex, setTempoIndex] = useState<number>(1);
    const [outOfRange, setOutOfRange] = useState<boolean>(false);
    const [cache, setCache] = useModelState("cache");

    return (
        <Group align={"center"}>
            <Tooltip
                label="Conditional Formatting"
                withArrow
            >
                <ActionIcon
                    variant="transparent"
                    onClick={() => {
                        const cacheObject = JSON.parse(cache);
                        setCache(JSON.stringify({ ...cacheObject, ["activatedFormatting"]: !cacheObject["activatedFormatting"] }))
                    }}
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
    )
}