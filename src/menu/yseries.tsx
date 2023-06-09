import { FunctionComponent, useEffect, useState } from "react";
import { Accordion, ActionIcon, Grid, Group, Select, Text, Transition } from "@mantine/core";
import { IconBorderLeft, IconBorderRight, IconMinus } from "@tabler/icons-react";
import { useModel, useModelState } from "../hooks";
import { ColItem } from "../visualization";
import { ChartIconMap, ChartTypeList, IconMap, InitialSelectedCols, InitialSingleSelectedCol, SelectItem, sendVisSql } from "../public";
import React from "react";

interface SelectProps {
    index: number,
    name: string,
    seriesName: string,
    colArray: ColItem[],
    setColArray: any,
    XAxis: string,
}

export const SelectDropDown: FunctionComponent<SelectProps> = ({ index, name, seriesName, setColArray, XAxis }) => {
    const [showedButton, setShowedButton] = useState<boolean>(false)
    const model = useModel();
    const [cache, setCache] = useModelState("cache");
    const cacheObject = JSON.parse(
        cache === "" ?
            InitialSelectedCols
            :
            cache
    );
    if (!cacheObject["selectedCol"]) {
        cacheObject["selectedCol"] = [InitialSingleSelectedCol];
    }
    const [hist] = useModelState("title_hist");
    const headers = JSON.parse(hist ?? `{"columnName":"", "dtype":""}`);
    const headerWithType: (string | any)[] = headers
        .filter((item: { dtype: string }) => item.dtype === "int" || item.dtype === "float")
        .map((header: { columnName: string, dtype: string }) => {
            return (
                {
                    value: header.columnName === "Index(Default)" ? "Index" : header.columnName, label: header.columnName, icon: IconMap[header.dtype]
                }
            )
        });
    const [seriesIcon, setSeriesIcon] = useState<JSX.Element>(IconMap["int"]);
    const target: ColItem = cacheObject["selectedCol"].find((item: ColItem) => item.seriesName === seriesName);
    const [chartIcon, setChartIcon] = useState<JSX.Element>(ChartIconMap[target ? target.chartType : "line"]);
    const [yAxis, setYAxis] = useState(target ? target.yAxis : "left");
    // const [openRenaming, setOpenRenaming] = useState<boolean>(false);
    // const [seriesNameState, setSeriesNameState] = useState<string>(seriesName);
    const seriesNameState = seriesName;
    // const seriesNames = cacheObject.selectedCol.map((item: ColItem) => { return (item.seriesName) });
    useEffect(() => {
        if (target) {
            setChartIcon(ChartIconMap[target.chartType])
        }
    }, [target])
    return (
        <Grid.Col span={12}
            onMouseMove={() => { setShowedButton(true) }} onMouseLeave={() => setShowedButton(false)}
        >
            <Accordion
                chevronPosition="left"
                variant="filled"
                sx={{
                    padding: 0,
                    ".mantine-Accordion-control": {
                        width: "90%",
                        padding: 0,
                    },
                    ".mantine-Accordion-content": {
                        padding: "0.5rem 1rem 0rem 1rem",
                    },
                    ".mantine-Accordion-item": {
                        paddingTop: "0.5rem",
                    },
                }}
            >
                <Accordion.Item value={`Y-series ${index}`} >
                    <Group noWrap sx={{ gap: "0" }}>
                        <Accordion.Control>
                            <Text size={"sm"}>{seriesName}</Text>
                        </Accordion.Control>
                        <Transition mounted={showedButton} transition="fade" duration={200} timingFunction="ease">
                            {(styles) => (
                                <ActionIcon
                                    style={{ ...styles }}
                                    size="xs"
                                    color="blue"
                                    onClick={() => {
                                        var array = [...cacheObject["selectedCol"]];
                                        array.splice(index, 1)
                                        setColArray([...array])
                                        sendVisSql(model, XAxis, array)
                                        cacheObject["selectedCol"] = [...array];
                                        setCache(JSON.stringify(cacheObject))
                                    }}
                                >
                                    <IconMinus size="0.75rem" />
                                </ActionIcon>
                            )}
                        </Transition>
                    </Group>
                    <Accordion.Panel>
                        <Grid>
                            <Grid.Col span={12}>
                                <Select
                                    size="xs"
                                    value={name}
                                    icon={seriesIcon}
                                    maxDropdownHeight={5 * 16}
                                    itemComponent={SelectItem}
                                    data={headerWithType}
                                    sx={{
                                        ".mantine-Select-itemsWrapper": {
                                            maxWidth: "207px" // Given width of dropdown item according to fixed width of menu list
                                        }
                                    }}
                                    onChange={(value) => {
                                        setSeriesIcon(headerWithType.filter(item => item.value === value)[0].icon)
                                        var names = cacheObject["selectedCol"].map((item: ColItem) => item.colName);
                                        var array = [...cacheObject["selectedCol"]];
                                        array.splice(index, 1, { seriesName: seriesNameState, colName: value!, chartType: target.chartType, yAxis: "left" })
                                        names.splice(index, 1, value!)
                                        cacheObject["selectedCol"] = [...array];
                                        setCache(JSON.stringify(cacheObject));
                                        setColArray([...array]);
                                        sendVisSql(model, XAxis, array);
                                    }}
                                />
                            </Grid.Col>

                            <Grid.Col span={6}></Grid.Col>
                            <Grid.Col
                                span={2}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center"
                                }}
                            >
                                {/* <ActionIcon size="xs" color={"darkgray"}>
                                    <Popover opened={openRenaming}>
                                        <Popover.Target>
                                            <ActionIcon onClick={() => setOpenRenaming(!openRenaming)}>
                                                <IconEdit size={16} />
                                            </ActionIcon>
                                        </Popover.Target>
                                        <Popover.Dropdown>
                                            <TextInput
                                                autoFocus
                                                size={"xs"}
                                                value={seriesNameState}
                                                error={
                                                    target && seriesNames.includes(seriesNameState) && target.seriesName !== seriesNameState
                                                        ?
                                                        <Text sx={{ fontSize: "x-small" }}>No duplicated series name.</Text>
                                                        :
                                                        ""
                                                }
                                                rightSection={
                                                    <Group noWrap sx={{ gap: 0 }}>
                                                        <ActionIcon
                                                            size="xs"
                                                            variant="transparent"
                                                            onClick={() => {
                                                                if (target && !seriesNames.includes(seriesNameState)) {
                                                                    target.seriesName = seriesNameState;
                                                                    cacheObject["selectedCol"] = [...cacheObject["selectedCol"]];
                                                                    setColArray([...cacheObject["selectedCol"]])
                                                                    setCache(JSON.stringify(cacheObject))
                                                                }
                                                                setOpenRenaming(!openRenaming);
                                                            }}>
                                                            <IconCheck size={10} />
                                                        </ActionIcon>
                                                        <ActionIcon
                                                            size="xs"
                                                            variant="transparent"
                                                            onClick={() => {
                                                                setOpenRenaming(!openRenaming);
                                                                setSeriesNameState(seriesName)
                                                            }}>
                                                            <IconX size={10} />
                                                        </ActionIcon>
                                                    </Group>
                                                }
                                                onChange={(e) => setSeriesNameState(e.target.value)}
                                                onKeyDown={(event) => {
                                                    switch (event.key) {
                                                        case "Enter":
                                                            if (target && !seriesNames.includes(seriesNameState)) {
                                                                target.seriesName = seriesNameState;
                                                                cacheObject["selectedCol"] = [...cacheObject["selectedCol"]];
                                                                setColArray([...cacheObject["selectedCol"]])
                                                                setCache(JSON.stringify(cacheObject))
                                                            }
                                                            setOpenRenaming(!openRenaming);
                                                            break;
                                                        case "Escape":
                                                            setOpenRenaming(!openRenaming);
                                                            setSeriesNameState(seriesName)
                                                            break;
                                                    }
                                                }}
                                            />
                                        </Popover.Dropdown>
                                    </Popover>
                                </ActionIcon> */}
                            </Grid.Col>
                            <Grid.Col
                                span={2}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center"
                                }}
                            >
                                <Select
                                    size="xs"
                                    rightSectionProps={{ display: "none" }}
                                    itemComponent={SelectItem}
                                    data={[
                                        { value: "line", label: "Line", icon: ChartIconMap["line"] },
                                        { value: "bar", label: "Bar", icon: ChartIconMap["bar"] },
                                        { value: "point", label: "Point", icon: ChartIconMap["point"] },
                                        { value: "arc", label: "Pie", icon: ChartIconMap["arc"] },
                                    ]}
                                    icon={chartIcon}
                                    sx={{
                                        ".mantine-Select-icon": {
                                            color: "dimgrey",
                                            alignItems: "flex-start",
                                        },
                                        ".mantine-Select-rightSection": {
                                            display: "none",
                                        },
                                        ".mantine-Select-input": {
                                            backgroundColor: "transparent",
                                            border: "none",
                                            paddingLeft: 0,
                                            color: "transparent"
                                        },
                                        ".mantine-Select-dropdown": {
                                            width: "6rem !important"
                                        }
                                    }}
                                    onChange={(value: ChartTypeList) => {
                                        setChartIcon(ChartIconMap[value!])
                                        if (!target) { return }
                                        target.chartType = value!;
                                        cacheObject["selectedCol"] = [...cacheObject["selectedCol"]];
                                        setColArray([...cacheObject["selectedCol"]])
                                        setCache(JSON.stringify(cacheObject))
                                    }}
                                />
                            </Grid.Col>
                            <Grid.Col span={2}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center"
                                }}
                            >
                                <ActionIcon
                                    size="xs"
                                    onClick={() => {
                                        const value = yAxis === "left" ? "right" : "left"
                                        setYAxis(value);
                                        if (!target) { return }
                                        target.yAxis = value;
                                        cacheObject["selectedCol"] = [...cacheObject["selectedCol"]];
                                        setCache(JSON.stringify(cacheObject))
                                    }}
                                >
                                    {
                                        yAxis === "left" ?
                                            <IconBorderLeft size={16} color="dimgrey" />
                                            :
                                            <IconBorderRight size={16} color="dimgrey" />
                                    }
                                </ActionIcon>
                            </Grid.Col>
                        </Grid>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Grid.Col>
    )
}