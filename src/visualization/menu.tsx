import { Accordion, ActionIcon, Button, Grid, Group, Popover, ScrollArea, Select, Stack, Tabs, Text, TextInput, Transition } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Icon123, IconAbc, IconAlertSquareRounded, IconBorderLeft, IconBorderRight, IconCalendar, IconChartArrows, IconChartArrowsVertical, IconChartBar, IconChartDots, IconChartLine, IconChartPie, IconCheck, IconEdit, IconMinus, IconPlus, IconSortAscending, IconSortDescending, IconX, TablerIconsProps } from "@tabler/icons-react";
import React, { forwardRef, FunctionComponent, useState } from "react";
import { useModel, useModelState } from "../hooks";
import { MenuHeight } from "./const";

interface menuProps {
    XAxis: string,
    setXAxis: React.Dispatch<React.SetStateAction<string>>,
}
export interface ColItem {
    seriesName: string;
    colName: string;
    chartType: string;
    yAxis: string;
}
interface SelectProps {
    index: number,
    name: string,
    seriesName: string,
    colArray: ColItem[],
    setColArray: any,
    XAxis: string,
    sendVisSql: any,
}
interface XAxisProps {
    XAxis: string,
    setXAxis: any,
    cacheObject: any,
    colName: any,
    sendVisSql: any
}
interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
    label: string;
    icon: (props: TablerIconsProps) => JSX.Element;
}
const IconMap: Record<string, JSX.Element> = {
    "int": <Icon123 size={16} />,
    "float": <Icon123 size={16} />,
    "string": <IconAbc size={16} />,
    "bool": <IconAbc size={16} />,
    "datetime": <IconCalendar />,
};

const ChartIconMap: Record<string, JSX.Element> = {
    "line": <IconChartLine size={16} />,
    "bar": <IconChartBar size={16} />,
    "point": <IconChartDots size={16} />,
    "arc": <IconChartPie size={16} />
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ label, icon, ...others }: ItemProps, ref) => (
        <div ref={ref} {...others}>
            <Group noWrap position="apart" w={"100%"}>
                <Group sx={{ width: "60%" }}>
                    <Text truncate size="xs">{label}</Text>
                </Group>
                {icon}
            </Group>
        </div>
    )
);

const InitialSelectedCols = `{"selectedCol":[{"seriesName":"Y-series-0", "colName":"","chartType":"line", "yAxis":"left"}]}`;
const InitialSingleSelectedCol = { "seriesName": "Y-series-0", "colName": "", "chartType": "line", "yAxis": "left" };
const SelectDropDown: FunctionComponent<SelectProps> = ({ index, name, seriesName, setColArray, XAxis, sendVisSql }) => {
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

    const [hist, setHist] = useState<string>(model?.get("title_hist") ?? "");
    model?.on("change:title_hist", () => { setHist(model.get("title_hist")) })
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
    const [seriesIcon, setSeriesIcon] = useState<JSX.Element>(<Icon123 />);
    const target: ColItem = cacheObject["selectedCol"].find((item: ColItem) => item.seriesName === seriesName);
    const [chartIcon, setChartIcon] = useState<JSX.Element>(ChartIconMap[target.chartType]);
    const [yAxis, setYAxis] = useState(target ? target.yAxis : "left");
    const [openRenaming, setOpenRenaming] = useState<boolean>(false);
    const [seriesNameState, setSeriesNameState] = useState<string>(seriesName);
    const seriesNames = cacheObject.selectedCol.map((item: ColItem) => { return (item.seriesName) });

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
                                        sendVisSql(XAxis, array)
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
                                        setCache(JSON.stringify(cacheObject))
                                        setColArray([...array])
                                        sendVisSql(XAxis, array)
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
                                <ActionIcon size="xs" color={"darkgray"}>
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
                                                    seriesNames.includes(seriesNameState) && target.seriesName !== seriesNameState
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
                                </ActionIcon>
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
                                    onChange={(value) => {
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
                                            <IconBorderLeft size={16} />
                                            :
                                            <IconBorderRight size={16} />
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

const XAxisSelection: FunctionComponent<XAxisProps> = ({ XAxis, setXAxis, cacheObject, colName, sendVisSql }) => {
    const model = useModel();
    const [sortAsce, setSortAsce] = useState(true);
    const [hist, setHist] = useState<string>(model?.get("title_hist") ?? "");
    model?.on("change:title_hist", () => { setHist(model.get("title_hist")) })
    const headers = JSON.parse(hist ?? `{"columnName":"", "dtype":""}`);
    const [xAxisIcon, setXAxisIcon] = useState<JSX.Element>(<Icon123 />);
    const [cache, setCache] = useModelState("cache");
    const dataLength = (model?.get("data_grid") ?? "{}").split("\n")[1] as unknown as number || 0;
    const [orient, setOrient] = useState(JSON.parse(
        cache.includes("chartState")
            ?
            cache
            :
            `{"chartState":{"orient": "vertical"}}`
    ).chartState.orient);

    const headerWithType: (string | any)[] = [{ columnName: "Index(Default)", dtype: "int" }, ...headers]
        .filter(item => (item.dtype !== "int" && item.dtype !== "float") || item.columnName === "Index(Default)")
        .map((header: { columnName: string, dtype: string }) => {
            return (
                {
                    value: header.columnName === "Index(Default)" ? "Index" : header.columnName, label: header.columnName, icon: IconMap[header.dtype]
                }
            )
        });
    return (
        <Grid.Col span={12} >
            <Accordion
                chevronPosition="left"
                variant="filled"
                sx={{
                    padding: 0,
                    ".mantine-Accordion-control": {
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
                <Accordion.Item value="X-axis" >
                    <Accordion.Control>
                        <Group noWrap>
                            <Text size={"sm"}>X-axis</Text>
                            {
                                dataLength > 500 ?
                                    <SamplingIndicator />
                                    :
                                    <></>
                            }
                        </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <Grid>
                            <Grid.Col span={12}>
                                <Select
                                    size="xs"
                                    icon={xAxisIcon}
                                    defaultValue={"Index"}
                                    value={XAxis}
                                    data={headerWithType}
                                    itemComponent={SelectItem}
                                    maxDropdownHeight={5 * 16}
                                    onChange={(value) => {
                                        setXAxisIcon(headerWithType.filter(item => item.value === value)[0].icon)
                                        cacheObject["xAxisState"] = value;
                                        setCache(JSON.stringify(cacheObject));
                                        setXAxis(value!);
                                        let array = [...colName]
                                        array = array.filter(item => item !== "")
                                        sendVisSql(value!, array)
                                    }}
                                />
                            </Grid.Col>
                            <Grid.Col span={8}></Grid.Col>
                            <Grid.Col span={2} sx={{ paddingTop: 0 }}>
                                <ActionIcon
                                    onClick={() => {
                                        if (cache.includes("chartState")) {
                                            orient === "vertical"
                                                ?
                                                cacheObject["chartState"] = { "orient": "horizontal" }
                                                :
                                                cacheObject["chartState"] = { "orient": "vertical" };
                                        } else {
                                            cacheObject["chartState"] = JSON.parse(`{"orient":"horizontal"}`)
                                        }
                                        setCache(
                                            JSON.stringify(cacheObject)
                                        );
                                        setOrient(orient === "vertical" ? "horizontal" : "vertical")
                                    }}>
                                    {
                                        orient === "vertical" ?
                                            <IconChartArrowsVertical size={16} />
                                            :
                                            <IconChartArrows size={16} />
                                    }
                                </ActionIcon>
                            </Grid.Col>
                            <Grid.Col span={2} sx={{ paddingTop: 0, display: "flex", alignItems: "center" }}>
                                <ActionIcon
                                    variant="subtle"
                                    size="xs"
                                    onClick={() => {
                                        setSortAsce(!sortAsce);
                                        model?.trigger("sort-X");
                                    }}
                                >
                                    {
                                        sortAsce ?
                                            <IconSortAscending size={16} />
                                            :
                                            <IconSortDescending size={16} />
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

const SamplingIndicator: FunctionComponent = () => {
    const [opened, { close, open }] = useDisclosure(false);
    return (
        <Popover opened={opened}>
            <Popover.Target>
                <IconAlertSquareRounded onMouseEnter={open} onMouseLeave={close} size={16} />
            </Popover.Target>
            <Popover.Dropdown>
                <Text size={8}>Data has been sampled.</Text>
            </Popover.Dropdown>
        </Popover>
    )
}

export const VisualMenu: FunctionComponent<menuProps> = ({ XAxis, setXAxis }) => {
    const model = useModel();
    const [cache, setCache] = useModelState("cache");
    const [colArray, setColArray] = useState<ColItem[]>(
        JSON.parse(
            cache.includes("selectedCol")
                ?
                cache
                :
                InitialSelectedCols
        ).selectedCol
    );
    const cacheObject = JSON.parse(cache === "" ? "{ }" : cache);
    const sendVisSql = (ColName: string, array: ColItem[]) => {
        const isIndex = ColName === "Index";
        const group = array
            .filter((item: ColItem) => (item.colName !== ""))
            .map((item: ColItem) => (
                `"${item.colName}"`
            ))
        model?.set("vis_sql", [
            // NOTE: THE CONDITION WOULD ALWAYS BE TRUE
            `select * EXCLUDE (index_rn1qaz2wsx)\nfrom \n(\nSELECT ${group.join(",")}${!isIndex ? "," + `"${ColName}"` : ""}, ROW_NUMBER() OVER () AS index_rn1qaz2wsx\n FROM $$__NAME__$$ ${true ? "" : "GROUP BY " + `"${ColName}"`}\n)\nusing SAMPLE reservoir (500 rows) REPEATABLE(42)\norder by index_rn1qaz2wsx`,
            isIndex ? "index_rn1qaz2wsx" : ColName,
            new Date().toISOString()
        ]);
        model?.save_changes();
    }

    return (
        <Stack h="100%" sx={{ minWidth: "15rem" }}>
            <Tabs variant="pills" defaultValue="data" sx={{
                ".mantine-Tabs-tabsList": {
                    height: 0
                }
            }}>
                <Tabs.List grow>
                    <Group noWrap sx={{ marginBottom: "1rem" }}>
                        {/* <Tabs.Tab value="data" >Data</Tabs.Tab> */}
                        {/* <Tabs.Tab value="style" >Style</Tabs.Tab> */}
                    </Group>
                </Tabs.List>
                <Tabs.Panel value="data" >
                    <ScrollArea
                        offsetScrollbars={true}
                        dir="rtl"
                        h={MenuHeight}
                        w={"100%"}
                        sx={{
                            paddingLeft: "1rem",
                        }}>
                        <Grid sx={{
                            direction: "ltr",
                            gap: "0",
                            marginBottom: "1.5rem",
                            maxWidth: "100%",
                            overflowX: "hidden",
                        }}>
                            <XAxisSelection
                                XAxis={XAxis}
                                setXAxis={setXAxis}
                                cacheObject={cacheObject}
                                colName={colArray}
                                sendVisSql={sendVisSql}
                            />
                            {
                                colArray.map((item, index) => {
                                    return (
                                        <SelectDropDown
                                            index={index}
                                            name={item.colName}
                                            seriesName={item.seriesName}
                                            colArray={colArray}
                                            setColArray={setColArray}
                                            XAxis={XAxis}
                                            sendVisSql={sendVisSql}
                                        />
                                    )
                                })
                            }
                            <Grid.Col span={7}></Grid.Col>
                            <Grid.Col span={5}
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end"
                                }}
                            >
                                <Button
                                    compact
                                    variant="subtle"
                                    leftIcon={<IconPlus size="0.75rem" />}
                                    size="xs"
                                    sx={{
                                        ":hover": {
                                            color: "blue",
                                            backgroundColor: "transparent"
                                        }
                                    }}
                                    onClick={() => {
                                        colArray.splice(colArray.length, 0, { seriesName: `Y-series-${colArray.length}`, colName: "", chartType: "line", yAxis: "left" })
                                        setColArray([...colArray])
                                        cacheObject["selectedCol"] = [...colArray];
                                        setCache(JSON.stringify(cacheObject))
                                    }}
                                >
                                    Add series
                                </Button>
                            </Grid.Col>
                        </Grid>
                    </ScrollArea>
                </Tabs.Panel>
            </Tabs>
        </Stack >
    )
}