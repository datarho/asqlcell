import { ActionIcon, Box, Group, Text, Textarea } from "@mantine/core";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import { DataImport } from "./dataimport";
import { NameOutput } from "./outputname";
import { VscDebugStart } from "react-icons/vsc";
import React from "react";
import { useModel } from "../hooks";

interface prop {
    setPage: React.Dispatch<React.SetStateAction<number>>;
}

export const WidgetInputArea: FunctionComponent<prop> = ({ setPage }) => {
    const model = useModel();
    const [timeStamp, setTimeStamp] = useState<number>(0);
    const [time, setTime] = useState<number>(0);
    const [openTimer, setOpenTimer] = useState<boolean>(false);
    const [timerId, setTimerId] = useState<number>();
    const latestCallback = useRef<any | null>(null);
    const [sqlContent, setSqlContent] = useState(model?.get("value") ?? "");

    model?.on("importData", (msg) => {
        setSqlContent("select * from " + msg);
    })
    model?.on("error", () => {
        setOpenTimer(false);
    })
    model?.on("hist", () => {
        setOpenTimer(false);
    })

    useEffect(() => {
        latestCallback.current = () => { setTime(Date.now() - timeStamp); };
    });

    useEffect(() => {
        if (!openTimer) {
            window.clearInterval(Number(timerId));
        } else {
            setTimerId(window.setInterval(() => latestCallback.current(), 10));
        }
    }, [openTimer]);
    useEffect(() => {
        model?.set("value", sqlContent);
        model?.save_changes();
    }, [sqlContent])

    return (
        <>
            <Group
                position="apart"
                align={"center"}
                sx={{
                    width: "95%",
                    height: "30px",
                }}>
                <DataImport />
                <NameOutput />
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
                            marginTop: "10px",
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
                        model?.set("sql_button", new Date().toISOString());
                        model?.save_changes();
                        setPage(1);
                        setTime(0)
                        setTimeStamp(Date.now());
                        setOpenTimer(true)
                    }}
                    sx={{ height: "100%" }}
                >
                    <VscDebugStart size={18} />
                </ActionIcon>
            </Group>
            <Group sx={{ width: "95%" }}>
                {
                    time === 0 ?
                        <></>
                        :
                        <Text>{time / 1000}s</Text>
                }
            </Group>
        </>
    )
}