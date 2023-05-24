import { Accordion, ActionIcon, Button, Grid, Group, ScrollArea, Select, Stack, Tabs, Text, Transition } from "@mantine/core";
import { Icon123, IconAbc, IconBorderLeft, IconBorderRight, IconCalendar, IconChartBar, IconChartDots, IconChartLine, IconMinus, IconPlus, IconSortAscending, IconSortDescending, TablerIconsProps } from "@tabler/icons-react";
import React, { forwardRef, FunctionComponent, useState } from "react";
import { useModel, useModelState } from "../hooks";
import { MenuHeight } from "./const";

interface menuProps {
    chartType: string,
    setChartType: React.Dispatch<React.SetStateAction<string>>,
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
    colArray: ColItem[],
    setColArray: any,
    XAxis: string,
    sendVisSql: any,
}
interface XAxisProps {
    XAxis: string,
    setXAxis: any,
    cacheObject: any,
    setCache: any,
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
    "point": <IconChartDots size={16} />
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ label, icon, ...others }: ItemProps, ref) => (
        <div ref={ref} {...others}>
            <Group noWrap position="apart">
                <Group sx={{ width: "60%" }}>
                    <Text truncate size="xs">{label}</Text>
                </Group>
                {icon}
            </Group>
        </div>
    )
);

const SelectDropDown: FunctionComponent<SelectProps> = ({ index, name, setColArray, XAxis, sendVisSql }) => {
    const [showedButton, setShowedButton] = useState<boolean>(false)
    const model = useModel();
    const [cache, setCache] = useModelState("cache");
    const cacheObject = JSON.parse(
        cache === "" ?
            `{"selectedCol":[{"seriesName":"", "colName":"","chartType":"line", "yAxis":"left"}]}`
            :
            cache
    );
    if (!cacheObject["selectedCol"]) {
        cacheObject["selectedCol"] = [{ "seriesName": "", "colName": "", "chartType": "line", "yAxis": "left" }];
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
    const target: ColItem = cacheObject["selectedCol"].find((item: ColItem) => item.colName === name);
    const [chartIcon, setChartIcon] = useState<JSX.Element>(ChartIconMap[target ? target.chartType : "line"]);
    const [yAxis, setYAxis] = useState(target ? target.yAxis : "left");

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
                            <Text size={"sm"}>{`Y-series ${index}`}</Text>
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
                                    // sx={{
                                    //     ".mantine-Select-itemsWrapper": {
                                    //         maxWidth: "192px"
                                    //     }
                                    // }}
                                    onChange={(value) => {
                                        setSeriesIcon(headerWithType.filter(item => item.value === value)[0].icon)
                                        var names = cacheObject["selectedCol"].map((item: ColItem) => item.colName);
                                        var array = [...cacheObject["selectedCol"]];
                                        if (!names.includes(value!)) {
                                            array.splice(index, 1, { seriesName: "", colName: value!, chartType: "line", yAxis: "left" })
                                            names.splice(index, 1, value!)
                                        }
                                        cacheObject["selectedCol"] = [...array];
                                        setCache(JSON.stringify(cacheObject))
                                        setColArray([...array])
                                        sendVisSql(XAxis, array)
                                    }}
                                />
                            </Grid.Col>

                            <Grid.Col span={7}>

                            </Grid.Col>
                            <Grid.Col span={2}>
                                <Select
                                    size="xs"
                                    rightSectionProps={{ display: "none" }}
                                    itemComponent={SelectItem}
                                    data={[
                                        { value: "line", label: "Line", icon: ChartIconMap["line"] },
                                        { value: "bar", label: "Bar", icon: ChartIconMap["bar"] },
                                        { value: "point", label: "Point", icon: ChartIconMap["point"] },
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
                                        const target = cacheObject["selectedCol"].find((item: ColItem) => item.colName === name)
                                        if (!target) { return }
                                        target.chartType = value!;
                                        cacheObject["selectedCol"] = [...cacheObject["selectedCol"]];
                                        setColArray([...cacheObject["selectedCol"]])
                                        setCache(JSON.stringify(cacheObject))
                                    }}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}
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
                                        const target = cacheObject["selectedCol"].find((item: ColItem) => item.colName === name)
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

const XAxisSelection: FunctionComponent<XAxisProps> = ({ XAxis, setXAxis, cacheObject, setCache, colName, sendVisSql }) => {
    const model = useModel();
    const [sortAsce, setSortAsce] = useState(true);
    const [hist, setHist] = useState<string>(model?.get("title_hist") ?? "");
    model?.on("change:title_hist", () => { setHist(model.get("title_hist")) })
    const headers = JSON.parse(hist ?? `{"columnName":"", "dtype":""}`);
    const [xAxisIcon, setXAxisIcon] = useState<JSX.Element>(<Icon123 />)

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
                        <Text size={"sm"}>X-axis</Text>
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
                            <Grid.Col span={5} sx={{ paddingTop: 0 }}></Grid.Col>
                            <Grid.Col span={7} sx={{ paddingTop: 0, display: "flex", alignItems: "end", justifyContent: "flex-end" }}>
                                <Button
                                    compact
                                    variant="subtle"
                                    size="xs"
                                    rightIcon={
                                        sortAsce ?
                                            <IconSortAscending size={16} />
                                            :
                                            <IconSortDescending size={16} />
                                    }
                                    sx={{
                                        ":hover": {
                                            color: "blue",
                                            backgroundColor: "transparent"
                                        }
                                    }}
                                    onClick={() => {
                                        setSortAsce(!sortAsce);
                                        model?.trigger("sort-X");
                                    }}
                                >
                                    {sortAsce ? "Ascending" : "Descending"}
                                </Button>
                            </Grid.Col>
                        </Grid>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Grid.Col>
    )
}

export const VisualMenu: FunctionComponent<menuProps> = ({ chartType, setChartType, XAxis, setXAxis }) => {
    const model = useModel();
    const [cache, setCache] = useModelState("cache");
    const [colArray, setColArray] = useState<ColItem[]>(
        JSON.parse(
            cache.includes("selectedCol")
                ?
                cache
                :
                `{"selectedCol":[{"seriesName":"", "colName":"","chartType":"line", "yAxis":"left"}]}`
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
                                setCache={setCache}
                                colName={colArray}
                                sendVisSql={sendVisSql}
                            />
                            {
                                colArray.map((item, index) => {
                                    return (
                                        <SelectDropDown
                                            index={index}
                                            name={item.colName}
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
                                        colArray.splice(colArray.length, 0, { seriesName: "", colName: "", chartType: "line", yAxis: "left" })
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