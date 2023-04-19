import { ActionIcon, Box, Container, Divider, Group, Select, Stack, Tabs } from "@mantine/core";
import { useResizeObserver } from "@mantine/hooks";
import { IconChartBar, IconChartLine, IconChevronLeft, IconChevronRight, IconSortAscendingLetters } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { FunctionComponent } from "react";
import { VegaLite } from "react-vega";
import { useModel } from "../hooks";

interface menuProps {
    chartType: number;
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
    colName: string;
}

const VisualMenu: FunctionComponent<menuProps> = ({ chartType, setChartType, setXAxis, setColName, colName, header }) => {
    const model = useModel();
    return (
        <Stack h="100%" sx={{ minWidth: "15rem" }}>
            <Tabs variant="pills" defaultValue="data">
                <Tabs.List grow>
                    <Group noWrap>
                        <Tabs.Tab value="data" >Data</Tabs.Tab>
                        <Tabs.Tab value="style" >Style</Tabs.Tab>
                    </Group>
                </Tabs.List>
                <Tabs.Panel value="data" >
                    <Stack sx={{ marginTop: "1rem" }}>
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
                        <Group noWrap>
                            <Select
                                label="X-axis"
                                defaultValue={"Index"}
                                data={["Index", "Date"]}
                                onChange={(value) => { setXAxis(value!) }}
                            />
                            <ActionIcon>{<IconSortAscendingLetters />}</ActionIcon>
                        </Group>
                        <Select
                            label="Y-axis 1"
                            value={colName}
                            data={header.map((item) => ({
                                value: item.toLowerCase(), label: item
                            }))}
                            onChange={(value) => {
                                setColName(value!);
                                model?.set("vis_sql", `SELECT "${value}" FROM $$__NAME__$$ using SAMPLE reservoir (100 rows) REPEATABLE(42)`);
                                model?.save_changes();
                            }}
                        />
                    </Stack>
                </Tabs.Panel>
                <Tabs.Panel value="label" >
                    <Box h="100%"></Box>
                </Tabs.Panel>
                <Tabs.Panel value="secondary" >
                    <Box h="100%"></Box>
                </Tabs.Panel>
            </Tabs>
        </Stack>
    )
}

const VisualPreviewChart: FunctionComponent<previewChartProp> = ({ rect, rect2, chartType, XAxis, colName }) => {
    const model = useModel();
    const [colData, setColData] = useState<string>(model?.get("vis_data"));
    model?.on("quick_view", (msg) => {
        setColData(msg.slice(6, msg.length) ?? "{}");
    });
    const lineData =
        colData ?
            JSON.parse(colData).data.map((item: number, index: number) => {
                return ({ a: index, b: item })
            })
            :
            [{ a: 0, b: 0 }]
        ;

    return (
        <VegaLite
            data={{ values: lineData }}
            actions={false}
            spec={
                {
                    width: rect.width - rect2.width,
                    height: 200,
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
                                opacity: {
                                    condition: { param: "industry", value: 1 },
                                    value: 10
                                }
                            },
                            data: { name: 'values' } // note: vega-lite data attribute is a plain object instead of an array
                        }
                    ]
                }} />
    )
}

export const Visualization: FunctionComponent = () => {
    const model = useModel();
    const [data, setData] = useState(model?.get("data_grid") ?? "");
    model?.on("data", (msg) => setData(msg));
    const header: string[] = JSON.parse(data.split("\n")[0]).columns;

    const [colName, setColName] = useState<string>(header[0]);
    // Visualization and quick view use the same listener,
    // talk more about it later
    model?.on("quick_view", (msg) => {
        setColName(JSON.parse(msg.slice(6, msg.length) ?? "{}").columns[0])
    });

    const [XAxis, setXAxis] = useState("index");
    const [ref, rect] = useResizeObserver();
    const [ref2, rect2] = useResizeObserver();
    const [open, setOpen] = useState<boolean>(true);
    const [chartType, setChartType] = useState(1);
    useEffect(() => {
        model?.set("vis_sql", `SELECT "${colName}" FROM $$__NAME__$$ using SAMPLE reservoir (100 rows) REPEATABLE(42)`);
        model?.save_changes();
    }, [])

    return (
        <>
            <Container ref={ref} fluid sx={{ maxWidth: "100vh", paddingBottom: "2rem", paddingTop: "1rem" }}>
                <Group noWrap sx={{ gap: "0" }}>
                    <Group ref={ref2} noWrap sx={{ height: 264, alignItems: "flex-start", gap: "0", paddingRight: "1rem" }}>
                        {
                            open ?
                                <VisualMenu
                                    chartType={chartType}
                                    setChartType={setChartType}
                                    setXAxis={setXAxis}
                                    setColName={setColName}
                                    colName={colName}
                                    header={header} />
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
                        <VisualPreviewChart rect={rect} rect2={rect2} chartType={chartType} XAxis={XAxis} colName={colName} />
                    </Stack>
                </Group>
            </Container>
        </>
    )
}