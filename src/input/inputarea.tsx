import { ActionIcon, Box, Group, Textarea } from "@mantine/core";
import { FunctionComponent, useEffect, useState } from "react";
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
    const [sqlContent, setSqlContent] = useState(model?.get("data_sql"));

    model?.on("importData", (msg) => {
        setSqlContent("select * from " + msg);
    })

    useEffect(() => {
        model?.trigger("data_sql", sqlContent)
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
                        model?.set("data_sql", sqlContent);
                        model?.save_changes();
                        setPage(1);
                    }}
                    sx={{ height: "100%" }}
                >
                    <VscDebugStart size={18} />
                </ActionIcon>
            </Group>
        </>
    )
}