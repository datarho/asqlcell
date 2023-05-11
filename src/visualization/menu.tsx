import { Accordion, ActionIcon, Button, Grid, Group, ScrollArea, Select, Stack, Tabs, Text, Transition } from "@mantine/core";
import { Icon123, IconAbc, IconCalendar, IconChartBar, IconChartLine, IconGrain, IconMinus, IconPlus, IconSortAscending, IconSortDescending, TablerIconsProps } from "@tabler/icons-react";
import React, { forwardRef, FunctionComponent, useEffect, useState } from "react";
import { useModel, useModelState } from "../hooks";
import { MenuHeight } from "./const";

interface menuProps {
    chartType: string,
    setChartType: React.Dispatch<React.SetStateAction<string>>,
    XAxis: string,
    setXAxis: React.Dispatch<React.SetStateAction<string>>,
}
interface SelectProps {
    index: number,
    name: string,
    colArray: { seriesName: string, colName: string, aggregate: string }[],
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
    "int": <Icon123 />,
    "float": <Icon123 />,
    "string": <IconAbc />,
    "bool": <IconAbc />,
    "datetime": <IconCalendar />,
};
interface ColItem {
    seriesName: string;
    colName: string;
    aggregate: string;
}
const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ label, icon, ...others }: ItemProps, ref) => (
        <div ref={ref} {...others}>
            <Group noWrap position="apart">
                <Text size="sm">{label}</Text>
                {icon}
            </Group>
        </div>
    )
);

const SelectDropDown: FunctionComponent<SelectProps> = ({ index, name, colArray, setColArray, XAxis, sendVisSql }) => {
    const [showedButton, setShowedButton] = useState<boolean>(false)
    const model = useModel();
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
                                        var array = [...colArray];
                                        array.splice(index, 1)
                                        setColArray([...array])
                                        sendVisSql(XAxis, array)
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
                                    onChange={(value) => {
                                        setSeriesIcon(headerWithType.filter(item => item.value === value)[0].icon)
                                        var names = colArray.map(item => item.colName);
                                        var array = [...colArray];
                                        if (!names.includes(value!)) {
                                            array.splice(index, 1, { seriesName: "", colName: value!, aggregate: '' })
                                            names.splice(index, 1, value!)
                                        }
                                        setColArray([...array])
                                        sendVisSql(XAxis, array)
                                    }}
                                />
                            </Grid.Col>
                            {/* <Grid.Col span={5}>
                                <Text>Aggregate: </Text>
                            </Grid.Col>
                            <Grid.Col span={7}>
                                <Select
                                    size="xs"
                                    defaultValue={""}
                                    value={colArray.filter(item => item.colName === name)[0].aggregate}
                                    data={[
                                        { value: "avg", label: "Average" },
                                        { value: "sum", label: "Sum" },
                                        { value: "count", label: "Count" },
                                        { value: "", label: "None" },
                                    ]}
                                    onChange={(value) => {
                                        var array = [...colArray];
                                        var target = colArray.filter(item => item.colName === name)[0]
                                        if (target) {
                                            target.aggregate = value!
                                            array.splice(index, 1, target)
                                        }
                                        sendVisSql(XAxis, array)
                                    }}
                                />
                            </Grid.Col> */}
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
    const [colNames, setColNames] = useState<ColItem[]>(JSON.parse(cache.includes("selectedCol") ? cache : `{"selectedCol":[{"seriesName":"", "colName":"", "aggregate":""}]}`).selectedCol);
    const cacheObject = JSON.parse(cache === "" ? "{ }" : cache);
    const ChartIconMap: Record<string, JSX.Element> = {
        "line": <IconChartLine />,
        "bar": <IconChartBar />,
        "point": <IconGrain />,
    }
    const sendVisSql = (ColName: string, array: ColItem[]) => {
        const isIndex = ColName === "Index";
        const group = array
            .filter((item: ColItem) => (item.colName !== ""))
            .map((item: ColItem) => (
                item.aggregate === "" ?
                    `"${item.colName}"`
                    :
                    `${item.aggregate}("${item.colName}")`
            ))
        model?.set("vis_sql", [
            // NOTE: THE CONDITION WOULD ALWAYS BE TRUE
            `select * EXCLUDE (index_rn1qaz2wsx)\nfrom \n(\nSELECT ${group.join(",")}${!isIndex ? "," + `"${ColName}"` : ""}, ROW_NUMBER() OVER () AS index_rn1qaz2wsx\n FROM $$__NAME__$$ ${true ? "" : "GROUP BY " + `"${ColName}"`}\n)\nusing SAMPLE reservoir (500 rows) REPEATABLE(42)\norder by index_rn1qaz2wsx`,
            isIndex ? "index_rn1qaz2wsx" : ColName,
            new Date().toISOString()
        ]);
        model?.save_changes();
    }

    useEffect(() => {
        cacheObject["selectedCol"] = colNames;
        setCache(JSON.stringify(cacheObject))
    }, [[...colNames]])

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
                        h={MenuHeight}
                        w={"100%"}
                        sx={{
                            paddingLeft: "1rem",
                        }}>
                        <Grid sx={{
                            gap: "0",
                            marginBottom: "1.5rem",
                            maxWidth: "100%",
                            overflowX: "hidden",
                        }}>
                            <Grid.Col span={12}>
                                <Select
                                    size="xs"
                                    icon={ChartIconMap[chartType]}
                                    defaultValue={"line"}
                                    data={[
                                        { value: "line", label: "Line" },
                                        { value: "bar", label: "Bar" },
                                        { value: "point", label: "Scatter" }
                                    ]}
                                    onChange={(value) => { setChartType(value!) }}
                                />
                            </Grid.Col>

                            <XAxisSelection
                                XAxis={XAxis}
                                setXAxis={setXAxis}
                                cacheObject={cacheObject}
                                setCache={setCache}
                                colName={colNames}
                                sendVisSql={sendVisSql}
                            />

                            {
                                colNames.map((item, index) => {
                                    return (
                                        <SelectDropDown
                                            index={index}
                                            name={item.colName}
                                            colArray={colNames}
                                            setColArray={setColNames}
                                            XAxis={XAxis}
                                            sendVisSql={sendVisSql}
                                        />
                                    )
                                })
                            }
                            <Grid.Col span={7}></Grid.Col>
                            <Grid.Col span={5}>
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
                                        colNames.splice(colNames.length, 0, { seriesName: "", colName: "", aggregate: "" })
                                        setColNames([...colNames])
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