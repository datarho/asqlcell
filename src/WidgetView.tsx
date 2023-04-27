import React, { useState } from "react";
import { WidgetModel } from "@jupyter-widgets/base";
import { WidgetModelContext } from "./hooks";
import { Box, Group, Stack, Tabs, Text } from "@mantine/core";
import { DataTable } from "./table";
import { WidgetInputArea } from "./input";
import { Visualization } from "./visualization/visualization";
import { LineChart } from "./visualization/line";

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
    const show = props.model.get("mode");
    const [data, setData] = useState(props.model.get("data_grid"))
    const [error, setError] = useState(props.model.get("error") ? props.model.get("error")[0] : "")
    const [rowNumber, setRowNumber] = useState<number>(props.model.get("row_range")[1] - props.model.get("row_range")[0]);
    const [page, setPage] = useState(Math.floor(props.model.get("row_range")[0] / rowNumber) + 1);
    const [tableState, setTableState] = useState<boolean>(true);

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

    props.model?.on("setTableView", (msg) => {
        setTableState(msg === 1 ? true : false);
    })

    props.model?.on("vis_sql", (col_name) => {
        props.model?.set("vis_sql", [
            `select * EXCLUDE (index_rn1qaz2wsx)\nfrom \n(\nSELECT "${col_name}", ROW_NUMBER() OVER () AS index_rn1qaz2wsx\nFROM $$__NAME__$$\n)\nusing SAMPLE reservoir (100 rows) REPEATABLE(42)\norder by index_rn1qaz2wsx`,
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
                    show === "UI" ?
                        <WidgetInputArea setPage={setPage} />
                        :
                        <></>
                }
                {
                    error !== "" && data === "" ?
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
                            sx={{ width: "95%" }}
                            position="center">
                            {
                                tableState ?
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
                                    :
                                    <LineChart />
                            }
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
