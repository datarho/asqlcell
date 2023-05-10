import { Accordion, ActionIcon, Button, Grid, Group, ScrollArea, Select, Stack, Tabs, Text, Transition } from "@mantine/core";
import { Icon123, IconAbc, IconCalendar, IconChartBar, IconChartLine, IconMinus, IconPlus, IconSortAscending, IconSortDescending, TablerIconsProps } from "@tabler/icons-react";
import React, { forwardRef, FunctionComponent, useEffect, useState } from "react";
import { useModel, useModelState } from "../hooks";
import { ViewHeight } from "./const";

interface menuProps {
    chartType: number,
    setChartType: React.Dispatch<React.SetStateAction<number>>,
    XAxis: string,
    setXAxis: React.Dispatch<React.SetStateAction<string>>,
    numericCols: string[],
    categoricCols: string[],
}
interface SelectProps {
    index: number,
    name: string,
    header: string[],
    colArray: string[],
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

const SelectDropDown: FunctionComponent<SelectProps> = ({ index, name, header, colArray, setColArray, XAxis, sendVisSql }) => {
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
                <Accordion.Item value={`Y-axis ${index}`} >
                    <Group noWrap sx={{ gap: "0" }}>
                        <Accordion.Control>
                            <Text>{`Y-axis ${index}`}</Text>
                        </Accordion.Control>
                        <Transition mounted={showedButton} transition="fade" duration={200} timingFunction="ease">
                            {(styles) => (
                                <ActionIcon
                                    style={{ ...styles }}
                                    size="xs"
                                    color="blue"
                                    onClick={() => {
                                        colArray.splice(index, 1)
                                        setColArray([...colArray])
                                        var array = colArray.filter(item => item !== "")
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
                                        var array = [...colArray]
                                        if (!array.includes(value!)) {
                                            array.splice(index, 1, value!)
                                        }
                                        setColArray([...array])
                                        array = array.filter(item => item !== "")
                                        sendVisSql(XAxis, array)
                                    }}
                                />
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
                    <Accordion.Control>X-axis</Accordion.Control>
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
                            <Grid.Col span={7} sx={{ paddingTop: 0 }}></Grid.Col>
                            <Grid.Col span={5} sx={{ paddingTop: 0, display: "flex", alignItems: "end" }}>
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

export const VisualMenu: FunctionComponent<menuProps> = ({ chartType, setChartType, XAxis, setXAxis, numericCols, categoricCols }) => {
    const model = useModel();
    const [cache, setCache] = useModelState("cache");
    const [colName, setColName] = useState<string[]>(JSON.parse(cache.includes("selectedCol") ? cache : `{"selectedCol":[""]}`).selectedCol);
    const cacheObject = JSON.parse(cache === "" ? "{ }" : cache);

    const sendVisSql = (ColName: string, array: string[]) => {
        const isIndex = ColName === "Index";
        model?.set("vis_sql", [
            `select * EXCLUDE (index_rn1qaz2wsx)\nfrom \n(\nSELECT ${array.join(",")}${!isIndex ? "," + ColName : ""}, ROW_NUMBER() OVER () AS index_rn1qaz2wsx\nFROM $$__NAME__$$\n)\nusing SAMPLE reservoir (500 rows) REPEATABLE(42)\norder by index_rn1qaz2wsx`,
            isIndex ? "index_rn1qaz2wsx" : ColName,
            new Date().toISOString()
        ]);
        model?.save_changes();
    }
    useEffect(() => {
        cacheObject["selectedCol"] = colName;
        setCache(JSON.stringify(cacheObject))
    }, [[...colName]])
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
                        h={ViewHeight}
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
                                    icon={chartType === 1 ? <IconChartLine /> : <IconChartBar />}
                                    defaultValue={"1"}
                                    data={[
                                        { value: "1", label: "Line" },
                                        { value: "2", label: "Bar" }
                                    ]}
                                    onChange={(value) => { setChartType(parseInt(value!)) }}
                                />
                            </Grid.Col>

                            <XAxisSelection
                                XAxis={XAxis}
                                setXAxis={setXAxis}
                                cacheObject={cacheObject}
                                setCache={setCache}
                                colName={colName}
                                sendVisSql={sendVisSql}
                            />

                            {
                                colName.map((name, index) => {
                                    return (
                                        <SelectDropDown
                                            index={index}
                                            name={name}
                                            header={numericCols}
                                            colArray={colName}
                                            setColArray={setColName}
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
                                        colName.splice(colName.length, 0, "")
                                        setColName([...colName])
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