import React, { useState } from "react";
import { WidgetModel } from "@jupyter-widgets/base";
import { WidgetModelContext } from "./hooks";
import { Box, Group, Stack, Tabs, Text } from "@mantine/core";
import { DataTable } from "./table";
import { Visualization } from "./visualization";

interface WidgetProps {
    model: WidgetModel;
}
export interface Dfhead {
    columnName: string,
    dtype: string,
    bins: any[],
    time1?: string;
    time2?: string;
}

const ReactWidget = (props: WidgetProps) => {
    const [data, setData] = useState(props.model.get("data_grid"))
    const [error, setError] = useState(props.model.get("error") ? props.model.get("error")[0] : "")
    const [rowNumber, setRowNumber] = useState<number>(props.model.get("row_range")[1] - props.model.get("row_range")[0]);
    const [page, setPage] = useState(Math.floor(props.model.get("row_range")[0] / rowNumber) + 1);

    // Receive event from Model
    props.model?.on("change:error", () => {
        setError(props.model.get("error") ? props.model.get("error")[0] : "");
        setData("")
    })
    props.model?.on("change:data_grid", () => {
        setData(props.model.get("data_grid"));
        setError("");
    })
    props.model?.on("sort", (msg) => {
        props.model?.set("column_sort", msg, "");
        props.model?.save_changes();
    })
    props.model?.on("setRange", (msg) => {
        props.model?.set("row_range", msg, "");
        props.model?.save_changes();
    })

    props.model?.on("quick_view", (col_name) => {
        props.model?.set("quickv_var", [
            col_name,
            new Date().toISOString()
        ]);
        props.model?.save_changes();
    })

    props.model?.on("output_var", (outputName) => {
        props.model?.set("output_var", outputName);
        props.model?.save_changes();
    })

    props.model?.on("dfs_button", () => {
        props.model?.set("dfs_button", new Date().toISOString());
        props.model?.save_changes();
    })

    props.model?.on("data_sql", (sqlContent) => {
        props.model?.set("data_sql", sqlContent);
        props.model?.save_changes();
    })

    return (
        <div className="Widget" >
            <Stack
                spacing={0}
                align="center">
                {
                    error !== "" ?
                        <Group position="left">
                            <Text color="red">Error:</Text>
                            <Text>{error}</Text>
                        </Group>
                        :
                        <></>
                }
                {
                    data !== "" ?
                        <Group
                            sx={{ marginBottom: "1rem", width: "95%" }}
                            position="center"
                        >
                            <Tabs defaultValue="table" sx={{ width: "100%" }}>
                                <Tabs.List>
                                    <Tabs.Tab value="table" >Table Result</Tabs.Tab>
                                    <Tabs.Tab value="visualization" >Visualization</Tabs.Tab>
                                </Tabs.List>
                                <Tabs.Panel value="table" >
                                    <DataTable
                                        page={page}
                                        setPage={setPage}
                                        rowNumber={rowNumber}
                                        setRowNumber={setRowNumber}
                                    />
                                </Tabs.Panel>

                                <Tabs.Panel value="visualization" >
                                    <Visualization />
                                </Tabs.Panel>
                            </Tabs>
                        </Group>
                        :
                        <Box sx={{ height: "60px" }} />
                }
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
