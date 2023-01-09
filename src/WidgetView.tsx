import React, { useEffect, useRef, useState } from "react";
import { WidgetModel } from "@jupyter-widgets/base";
import { useModelState, WidgetModelContext } from "./hooks";
import { Box, Group, Stack, Text, Textarea, TextInput, ActionIcon } from "@mantine/core";
import { DataTable } from "./components/table"
import { VscDebugStart } from "react-icons/vsc";
import { DataImport } from "./components/dataimport";

interface WidgetProps {
    model: WidgetModel;
}
export interface Dfhead {
    columnName: string,
    bins: { bin_start: number, bin_end: number, count: number }[],
}

const ReactWidget = (props: WidgetProps) => {
    const [hist, setHist] = useState<Dfhead[]>([{ columnName: "", bins: [{ bin_start: 0, bin_end: 0, count: 0 }] }]);
    const [sqlContent, setSqlContent] = useState(props.model.get("value") ?? "");
    const [show, setShow] = useState<boolean>(props.model.get("show") ?? true);
    const [output, setOutput] = useModelState("output");
    const [outputName, setOutputName] = useState(output);
    const [page, setPage] = useState(1);
    const [data, setData] = useState(props.model.get("data") ?? "")
    const [error, setError] = useState(props.model.get("error") ?? "")
    const [rowNumber, setRowNumber] = useState<number>(10);
    const [time, setTime] = useState<number>(0);
    const [openTimer, setOpenTimer] = useState<boolean>(false);
    const [timerId, setTimerId] = useState<number>();

    const latestCallback = useRef<any | null>(null);

    useEffect(() => {
        latestCallback.current = () => { setTime(time + 1); };
    });

    useEffect(() => {
        if (!openTimer) {
            window.clearInterval(Number(timerId));
        } else {
            setTimerId(window.setInterval(() => latestCallback.current(), 1));
        }
    }, [openTimer]);

    useEffect(() => {
        props.model.set("value", sqlContent);
        props.model?.save_changes();
    }, [sqlContent])

    // Ask back-end whether this is a command mode, so we could decide whether to show inputArea
    useEffect(() => {
        props.model.set("json_dump", new Date().toISOString());
        props.model.save_changes();
    }, [])

    // Receive event from Model
    props.model?.on("error", (msg) => {
        setOpenTimer(false);
        setError(msg);
        setData("");
    })
    props.model?.on("show", (msg) => {
        setShow(msg);
    })
    props.model?.on("data_message", (msg) => {
        setData(msg.slice(6, msg.length));
        setOpenTimer(false);
        setError("");
    })
    props.model?.on("update_outputName", (msg) => {
        setOutputName(msg.changed.output)
    })
    props.model?.on("sort", (msg) => {
        props.model?.set("index_sort", msg, "");
        props.model?.save_changes();
    })
    props.model?.on("setRange", (msg) => {
        props.model?.set("data_range", msg, "");
        props.model?.save_changes();
    })
    props.model?.on("importData", (msg) => {
        setSqlContent("select * from " + msg);
    })
    props.model?.on("clickButton", (msg) => {
        props.model.set("json_dump", new Date().toISOString());
        props.model?.set("sql_button", new Date().toISOString());
        props.model?.save_changes();
    })
    props.model?.on("hist", (msg: any) => {
        if (msg) {
            setHist(JSON.parse(msg).dfhead);
        }
    })

    return (
        <div className="Widget">
            <Stack
                spacing={0}
                align="center">
                {
                    show ?
                        <>
                            <Group
                                position="apart"
                                align={"center"}
                                sx={{
                                    width: "95%",
                                    height: "30px",
                                }}>
                                <DataImport model={props.model} />
                                <Group
                                    position="right"
                                    align="center"
                                    sx={{
                                        height: "100%",
                                        gap: "0px",
                                    }}>

                                    <Text color="#8D8D8D" sx={{ marginRight: "10px" }}>SAVED TO</Text>

                                    <TextInput
                                        size="xs"
                                        styles={() => ({
                                            input: {
                                                width: "100px",
                                                color: "#8D8D8D",
                                                fontSize: "inherit",
                                                backgroundColor: "#fafafa",
                                                borderColor: "#fafafa",
                                                fontWeight: "bold",
                                                paddingLeft: 0,
                                                ":focus": {
                                                    borderColor: "lightgray",
                                                }
                                            },
                                        })}
                                        value={outputName}
                                        onChange={(e) => {
                                            setOutput(e.target.value);
                                        }}
                                    />
                                </Group>
                            </Group>
                            <Group
                                sx={{
                                    width: "95%",
                                    display: "flex",
                                    gap: 0,
                                }}>
                                <Box
                                    sx={{
                                        width: "95%"
                                    }}
                                >
                                    <Textarea
                                        autosize
                                        minRows={3}
                                        sx={{
                                            ".mantine-Textarea-input": {
                                                height: "88px",
                                            }
                                        }}
                                        value={sqlContent}
                                        onChange={(e) => {
                                            setSqlContent(e.target.value);
                                        }}
                                    />
                                </Box>
                                <ActionIcon
                                    onClick={() => {
                                        setPage(1);
                                        props.model?.trigger("setRange", [0, rowNumber * 1]);
                                        props.model?.trigger("clickButton")
                                        setTime(0)
                                        setOpenTimer(true)
                                        setHist([{ columnName: "", bins: [{ bin_start: 0, bin_end: 0, count: 0 }] }])
                                        setData("")
                                    }}
                                    sx={{ height: "100%" }}
                                >
                                    <VscDebugStart size={18} />
                                </ActionIcon>
                            </Group>
                            <Group sx={{ width: "95%" }}>
                                <Text>{time / 1000}s</Text>
                            </Group>
                        </>
                        :
                        <></>
                }
                <Group position="left">
                    <Text color="red">{error.slice(0, 6)}</Text>
                    <Text>{error.slice(6, -1)}</Text>
                </Group>
                <Group
                    sx={{ width: "95%" }}
                    position="center">
                    {
                        data ?
                            <DataTable
                                data={data}
                                model={props.model}
                                page={page}
                                setPage={setPage}
                                rowNumber={rowNumber}
                                setRowNumber={setRowNumber}
                                hist={hist}
                            />
                            :
                            <Box sx={{ height: "60px" }} />
                    }
                </Group>
            </Stack>
        </div>
    );
}

const withModelContext = (Component: (props: WidgetProps) => JSX.Element) => {
    return (props: WidgetProps) => (
        <WidgetModelContext.Provider value={props.model}>
            <Component {...props} />
        </WidgetModelContext.Provider>
    );
}

export default withModelContext(ReactWidget);
