import React, { useState } from "react";
import { WidgetModel } from "@jupyter-widgets/base";
import { useModel, useModelState, WidgetModelContext } from "./hooks";
import { Box, Group, Stack, Tabs, Text } from "@mantine/core";
import { DataTable } from "./table";
import { Visualization } from "./visualization";
import { IconChartBar, IconTable } from "@tabler/icons-react";

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

const ReactWidget = () => {
    const model = useModel();
    const [data, setData] = useState(model?.get("data_grid"))
    const [error, setError] = useState(model?.get("error") ? model?.get("error")[0] : "")
    const [rowNumber, setRowNumber] = useState<number>(model?.get("row_range")[1] - model?.get("row_range")[0]);
    const [page, setPage] = useState(Math.floor(model?.get("row_range")[0] / rowNumber) + 1);
    const [cache, setCache] = useModelState("cache");
    const cacheObject = JSON.parse(cache === "" ? "{ }" : cache);
    const [tabValue, setTabValue] = useState(cacheObject.tabValue ?? "table");

    // Receive event from Model
    model?.on("change:error", () => {
        setError(model?.get("error") ? model?.get("error")[0] : "");
        setData("")
    })
    model?.on("change:data_grid", () => {
        setData(model?.get("data_grid"));
        setError("");
    })
    model?.on("sort", (msg) => {
        model?.set("column_sort", msg, "");
        model?.save_changes();
    })
    model?.on("setRange", (msg) => {
        model?.set("row_range", msg, "");
        model?.save_changes();
    })

    model?.on("quick_view", (col_name) => {
        model?.set("quickv_var", [
            col_name,
            new Date().toISOString()
        ]);
        model?.save_changes();
    })

    model?.on("output_var", (outputName) => {
        model?.set("output_var", outputName);
        model?.save_changes();
    })

    model?.on("dfs_button", () => {
        model?.set("dfs_button", new Date().toISOString());
        model?.save_changes();
    })

    model?.on("data_sql", (sqlContent) => {
        model?.set("data_sql", sqlContent);
        model?.save_changes();
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
                            <Tabs
                                defaultValue="table"
                                value={tabValue}
                                sx={{ width: "100%" }}
                                onTabChange={(value) => {
                                    cacheObject["tabValue"] = value!;
                                    setCache(JSON.stringify(cacheObject));
                                    setTabValue(value!)
                                }}>
                                <Tabs.List>
                                    <Tabs.Tab value="table" icon={<IconTable size="0.8rem" />}>Table</Tabs.Tab>
                                    <Tabs.Tab value="visualization" icon={<IconChartBar size="0.8rem" />}>Visualization</Tabs.Tab>
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
