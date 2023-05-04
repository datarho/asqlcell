import { ActionIcon, Grid, Group, ScrollArea, Select, Stack, Tabs } from "@mantine/core";
import { IconChartBar, IconChartLine, IconMinus, IconPlus } from "@tabler/icons-react";
import React, { FunctionComponent, useState } from "react";
import { useModel } from "../hooks";
import { ViewHeight } from "./const";

interface menuProps {
    chartType: number;
    setChartType: React.Dispatch<React.SetStateAction<number>>;
    setXAxis: React.Dispatch<React.SetStateAction<string>>;
    setColName: React.Dispatch<React.SetStateAction<string>>;
    colName: string;
    header: string[];
}
interface SelectProps {
    index: number,
    name: string,
    header: string[],
    colArray: string[],
    setColArray: any
}

const SelectDropDown: FunctionComponent<SelectProps> = ({ index, name, header, colArray, setColArray }) => {
    const model = useModel();
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
                        model?.set("vis_sql", [
                            `select * EXCLUDE (index_rn1qaz2wsx)\nfrom \n(\nSELECT ${array.join(",")}, ROW_NUMBER() OVER () AS index_rn1qaz2wsx\nFROM $$__NAME__$$\n)\nusing SAMPLE reservoir (500 rows) REPEATABLE(42)\norder by index_rn1qaz2wsx`,
                            new Date().toISOString()
                        ]);
                        model?.save_changes();
                    }}
                />
            </Grid.Col>
            <Grid.Col span={2} sx={{ display: "flex", alignItems: "end" }}>

                <Stack sx={{ gap: 0 }}>
                    {
                        index === colArray.length - 1 ?
                            <>
                                <ActionIcon size="xs" onClick={() => { setColArray([...colArray, ""]) }}>
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
                                        model?.set("vis_sql", [
                                            `select * EXCLUDE (index_rn1qaz2wsx)\nfrom \n(\nSELECT ${array.join(",")}, ROW_NUMBER() OVER () AS index_rn1qaz2wsx\nFROM $$__NAME__$$\n)\nusing SAMPLE reservoir (500 rows) REPEATABLE(42)\norder by index_rn1qaz2wsx`,
                                            new Date().toISOString()
                                        ]);
                                        model?.save_changes();
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

export const VisualMenu: FunctionComponent<menuProps> = ({ chartType, setChartType, setXAxis, setColName, colName, header }) => {
    const model = useModel();
    model?.on("change:vis_data", () => { setColName(JSON.parse(model?.get("vis_data")).columns[0] ?? "") });
    const [colArray, setColArray] = useState<string[]>([colName]);
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
                                    data={["Index"]}
                                    onChange={(value) => { setXAxis(value!) }}
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
                                colArray.map((name, index) => {
                                    return (
                                        <SelectDropDown
                                            index={index}
                                            name={name}
                                            header={header}
                                            colArray={colArray}
                                            setColArray={setColArray}
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