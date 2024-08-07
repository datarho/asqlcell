import { WidgetModel } from "@jupyter-widgets/base";
import { Box, Tabs } from "@mantine/core";
import { IconChartBar, IconTable } from "@tabler/icons-react";
import React, { useState } from "react";
import { Chart } from "./chart";
import { useModel, useModelState, WidgetModelContext } from "./hooks";
import { DataTable } from "./table";

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

    model?.on("setRange", (msg) => {
        model?.set("row_range", msg, "");
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
