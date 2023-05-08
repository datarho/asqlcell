import { ActionIcon, Grid, Group, ScrollArea, Select, Stack, Tabs } from "@mantine/core";
import { IconChartBar, IconChartLine, IconMinus, IconPlus } from "@tabler/icons-react";
import React, { FunctionComponent, useEffect, useState } from "react";
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

const SelectDropDown: FunctionComponent<SelectProps> = ({ index, name, header, colArray, setColArray, XAxis, sendVisSql }) => {
    return (
        <>
            <Grid.Col span={10}>
                <Select
                    label={`Y-axis ${index}`}
                    value={name}
                    maxDropdownHeight={5 * 16}
                    data={header.map((item: string) => ({
                        value: item, label: item
                    }))}
                    onChange={(value) => {
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
            <Grid.Col span={2} sx={{ display: "flex", alignItems: "end" }}>
                <Stack sx={{ gap: 0 }}>
                    {
                        index === 0 ?
                            <>
                                <ActionIcon
                                    size="xs"
                                    onClick={() => {
                                        colArray.splice(index + 1, 0, "")
                                        setColArray([...colArray])
                                    }}
                                >
                                    <IconPlus size="0.75rem" />
                                </ActionIcon>
                            </>
                            :
                            <>
                                <ActionIcon
                                    size="xs"
                                    onClick={() => {
                                        colArray.splice(index, 1)
                                        setColArray([...colArray])
                                        var array = colArray.filter(item => item !== "")
                                        sendVisSql(XAxis, array)
                                    }}>
                                    <IconMinus size="0.75rem" />
                                </ActionIcon>
                                <ActionIcon
                                    size="xs"
                                    onClick={() => {
                                        colArray.splice(index + 1, 0, "")
                                        setColArray([...colArray])
                                    }}
                                >
                                    <IconPlus size="0.75rem" />
                                </ActionIcon>
                            </>
                    }
                </Stack>
            </Grid.Col>
        </>
    )
}

export const VisualMenu: FunctionComponent<menuProps> = ({ chartType, setChartType, XAxis, setXAxis, numericCols, categoricCols }) => {
    const model = useModel();
    const [cache, setCache] = useModelState("cache");
    const [colName, setColName] = useState<string[]>(JSON.parse(cache.includes("selectedCol") ? cache : `{"selectedCol":[""]}`).selectedCol);
    const cacheObject = JSON.parse(cache === "" ? "{}" : cache);

    const categoricData = () => {
        const array = [...categoricCols];
        if (!array.includes("index")) {
            array.splice(0, 0, "Index")
        }
        return (array)
    }

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
            <Tabs variant="pills" defaultValue="data">
                <Tabs.List grow>
                    <Group noWrap sx={{ marginBottom: "1rem" }}>
                        <Tabs.Tab value="data" >Data</Tabs.Tab>
                        {/* <Tabs.Tab value="style" >Style</Tabs.Tab> */}
                    </Group>
                </Tabs.List>
                <Tabs.Panel value="data" >
                    <ScrollArea h={ViewHeight} w={"100%"} sx={{
                        paddingLeft: "1rem",
                    }}>
                        <Grid sx={{
                            marginBottom: "1.5rem",
                            maxWidth: "100%",
                            overflowX: "hidden",
                        }}>
                            <Grid.Col span={10}>
                                <Select
                                    icon={chartType === 1 ? <IconChartLine /> : <IconChartBar />}
                                    label="Chart Type"
                                    defaultValue={"1"}
                                    data={[
                                        { value: "1", label: "Line" },
                                        { value: "2", label: "Bar" }
                                    ]}
                                    onChange={(value) => { setChartType(parseInt(value!)) }}
                                />
                            </Grid.Col>
                            <Grid.Col span={2}></Grid.Col>
                            <Grid.Col span={10}>
                                <Select
                                    label="X-axis"
                                    defaultValue={"Index"}
                                    value={XAxis}
                                    data={categoricData()}
                                    onChange={(value) => {
                                        cacheObject["xAxisState"] = value;
                                        setCache(JSON.stringify(cacheObject));
                                        setXAxis(value!);
                                        let array = [...colName]
                                        array = array.filter(item => item !== "")
                                        sendVisSql(value!, array)
                                        model?.save_changes()
                                    }}
                                />
                            </Grid.Col>
                            <Grid.Col span={2} sx={{ display: "flex", alignItems: "end" }}>
                                {/* <ActionIcon onClick={() => {}} >
                                {
                                    true ?
                                        <IconSortAscendingLetters size={16} />
                                        :
                                        <IconSortDescendingLetters size={16} />
                                }
                            </ActionIcon> */}
                            </Grid.Col>

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
                        </Grid>
                    </ScrollArea>
                </Tabs.Panel>
            </Tabs>
        </Stack >
    )
}