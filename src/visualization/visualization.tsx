import { ActionIcon, Container, Divider, Grid, Group, ScrollArea, Select, Stack, Tabs } from "@mantine/core";
import { useResizeObserver } from "@mantine/hooks";
import { IconChartBar, IconChartLine, IconChevronLeft, IconChevronRight, IconMinus, IconPlus } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { FunctionComponent } from "react";
import { VegaLite } from "react-vega";
import { useModel } from "../hooks";

interface menuProps {
    chartType: number;
    rect: any;
    setChartType: React.Dispatch<React.SetStateAction<number>>;
    setXAxis: React.Dispatch<React.SetStateAction<string>>;
    setColName: React.Dispatch<React.SetStateAction<string>>;
    colName: string;
    header: string[];
}
interface previewChartProp {
    rect: any;
    rect2: any;
    chartType: number;
    XAxis: string;
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
                        array.forEach((item, index) => {
                            if (item === "") {
                                array.splice(index, 1)
                            }

                        })
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
                                        model?.set("vis_sql", [
                                            `select * EXCLUDE (index_rn1qaz2wsx)\nfrom \n(\nSELECT ${(colArray).join(",")}, ROW_NUMBER() OVER () AS index_rn1qaz2wsx\nFROM $$__NAME__$$\n)\nusing SAMPLE reservoir (500 rows) REPEATABLE(42)\norder by index_rn1qaz2wsx`,
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

const VisualMenu: FunctionComponent<menuProps> = ({ chartType, rect, setChartType, setXAxis, setColName, colName, header }) => {
    const model = useModel();
    model?.on("change:vis_data", () => { setColName(JSON.parse(model?.get("vis_data")).columns[0] ?? "") })
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
                    <ScrollArea h={rect.height}>
                        <Grid sx={{ marginBottom: "1.5rem" }}>
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
        </Stack>
    )
}

const VisualPreviewChart: FunctionComponent<previewChartProp> = ({ rect, rect2, chartType, XAxis }) => {
    const model = useModel();
    const [data, setData] = useState(model?.get("vis_data") !== "" ? model?.get("vis_data") : `{\"columns\":[],\"index\":[],\"data\":[]}`);
    const colData = JSON.parse(data).data;
    const colName = JSON.parse(data).columns;
    model?.on("change:vis_data", () => {
        setData(model.get("vis_data"))
    })
    const lineData =
        colData ?
            {
                values:
                    colData.map((item: number[], index: number) => {
                        return (
                            colName.map((type: string, colIndex: number) => (
                                { a: index, b: item[colIndex], c: type }
                            )
                            )
                        )
                    }).flat()
            }
            :
            {
                values: [
                    { 'a': 0, 'b': 0, 'c': "" }
                ]
            };

    return (
        <VegaLite
            data={lineData}
            renderer={'svg'}
            actions={false}
            spec={
                {
                    width: rect.width - rect2.width - 32,
                    height: rect2.height,
                    params: [{
                        name: "industry",
                        select: { type: "point", fields: ["series"] },
                        bind: "legend"
                    }],
                    layer: [
                        {
                            mark: chartType === 1 ? "line" : "bar",
                            transform: [
                                {
                                    calculate: "datum.a", "as": XAxis,
                                },
                                {
                                    calculate: "datum.b", "as": colName,
                                }
                            ],
                            encoding: {
                                x: { field: XAxis, type: "quantitative", axis: { tickMinStep: 30 } },
                                y: { field: colName, type: "quantitative" },
                                color: { field: "c", type: "nominal" },
                                opacity: {
                                    condition: { param: "industry", value: 1 },
                                    value: 10
                                }
                            },
                            data: { name: "values" } // note: vega-lite data attribute is a plain object instead of an array
                        }
                    ]
                }} />
    )
}

export const Visualization: FunctionComponent = () => {
    const model = useModel();

    const [hist, setHist] = useState<string>(model?.get("title_hist") ?? "");
    model?.on("change:title_hist", () => { setHist(model.get("title_hist")) })
    const headerData: string[] = JSON.parse(hist ?? `{dtype:""}`).filter((header: any) => header.dtype.includes("int") || header.dtype.includes("float")).map((header: any) => header.columnName);

    const quickName = JSON.parse(model?.get("vis_data") !== "" ? model?.get("vis_data") : `{"columns":[]}`).columns[0]
    const [colName, setColName] = useState<string>(quickName === "" ? quickName : headerData[0]);
    const [XAxis, setXAxis] = useState("index");
    const [ref, rect] = useResizeObserver();
    const [ref2, rect2] = useResizeObserver();
    const [open, setOpen] = useState<boolean>(true);
    const [chartType, setChartType] = useState(1);
    useEffect(() => {
        model?.trigger("vis_sql", colName)
    }, [])

    return (
        <>
            <Container ref={ref} fluid sx={{ padding: "1rem auto 2rem 1rem", margin: "auto 1rem auto 0rem", }}>
                <Group noWrap sx={{ gap: "0" }}>
                    <Group ref={ref2} noWrap sx={{ height: 264, alignItems: "flex-start", gap: "0", paddingRight: "1rem" }}>
                        {
                            open ?
                                <VisualMenu
                                    chartType={chartType}
                                    rect={rect2}
                                    setChartType={setChartType}
                                    setXAxis={setXAxis}
                                    setColName={setColName}
                                    colName={colName}
                                    header={headerData}
                                />
                                :
                                <></>
                        }
                        <ActionIcon onClick={() => { setOpen(!open) }}>
                            {
                                open ?
                                    <IconChevronLeft />
                                    :
                                    <IconChevronRight />
                            }
                        </ActionIcon>
                        <Divider orientation="vertical" />
                    </Group>
                    <Stack>
                        <VisualPreviewChart rect={rect} rect2={rect2} chartType={chartType} XAxis={XAxis} />
                    </Stack>
                </Group>
            </Container>
        </>
    )
}