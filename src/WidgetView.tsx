import React, { useState } from "react";
import { WidgetModel } from "@jupyter-widgets/base";
import { WidgetModelContext } from "./hooks";
import { Box, Group, Stack, Text } from "@mantine/core";

import { DataTable } from "./table";
import { WidgetInputArea } from "./input";


interface WidgetProps {
    model: WidgetModel;
}
export interface Dfhead {
    columnName: string,
    dtype: string,
    bins: { bin_start: number, bin_end: number, count: number }[],
    time1?: string;
    time2?: string;
}

const ReactWidget = (props: WidgetProps) => {
    const [show, setShow] = useState<boolean>(props.model.get("show"));
    const [data, setData] = useState(props.model.get("data") ? true : false)
    const [error, setError] = useState(props.model.get("error"))
    const [rowNumber, setRowNumber] = useState<number>(props.model.get("data_range")[1] - props.model.get("data_range")[0]);
    const [page, setPage] = useState(Math.floor(props.model.get("data_range")[0] / rowNumber) + 1);

    // Receive event from Model
    props.model?.on("error", (msg) => {
        setError(msg);
        setData(false);
    })
    props.model?.on("show", (msg) => {
        setShow(msg);
    })
    props.model?.on("data", (msg) => {
        if (msg.slice(6, msg.length) !== data) {
            setData(msg.slice(6, msg.length));
        }
        setError(undefined);
    })
    props.model?.on("sort", (msg) => {
        props.model?.set("index_sort", msg, "");
        props.model?.save_changes();
    })
    props.model?.on("setRange", (msg) => {
        props.model?.set("data_range", msg, "");
        props.model?.save_changes();
    })

    return (
        <div className="Widget">
            <Stack
                spacing={0}
                align="center">
                {
                    show ?
                        <WidgetInputArea setPage={setPage} />
                        :
                        <></>
                }
                {
                    error ?
                        <Group position="left">
                            <Text color="red">{error.slice(0, 6)}</Text>
                            <Text>{error.slice(6, error.length)}</Text>
                        </Group>
                        :
                        <></>
                }
                <Group
                    sx={{ width: "95%" }}
                    position="center">
                    {
                        data ?
                            <DataTable
                                page={page}
                                setPage={setPage}
                                rowNumber={rowNumber}
                                setRowNumber={setRowNumber}
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
