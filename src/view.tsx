import React, { useState } from "react";
import { WidgetModel } from "@jupyter-widgets/base";
import { useModel, useModelState, WidgetModelContext } from "./hooks";
import { Box, Tabs } from "@mantine/core";
import { DataTable } from "./table";
import { Chart } from "./chart";
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

    const [cache, setCache] = useModelState("cache");
    const cacheObject = JSON.parse(cache === "" ? "{ }" : cache);
    const [tabValue, setTabValue] = useState(cacheObject.tabValue ?? "table");

    // Receive event from Model
    model?.on("change:data_grid", () => {
        setData(model?.get("data_grid"));
    });

    model?.on("sort", (msg) => {
        model?.set("column_sort", msg, "");
        model?.save_changes();
    });

    model?.on("setRange", (msg) => {
        model?.set("row_range", msg, "");
        model?.save_changes();
    });

    model?.on("quick_view", (col_name) => {
        model?.set("quickview_var", [
            col_name,
            new Date().toISOString()
        ]);
        model?.save_changes();
    });

    model?.on("output_var", (outputName) => {
        model?.set("output_var", outputName);
        model?.save_changes();
    });

    model?.on("dfs_button", () => {
        model?.set("dfs_button", new Date().toISOString());
        model?.save_changes();
    });

    model?.on("data_sql", (sqlContent) => {
        model?.set("data_sql", sqlContent);
        model?.save_changes();
    });

    return (
        data ?
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
                    <Tabs.Tab value="chart" icon={<IconChartBar size="0.8rem" />}>Chart</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="table" >
                    <DataTable />
                </Tabs.Panel>

                <Tabs.Panel value="chart" >
                    <Chart />
                </Tabs.Panel>
            </Tabs>
            :
            <Box sx={{ height: "60px" }} />
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
