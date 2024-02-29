import { uuid } from "@jupyter-widgets/base";
import { Group, ScrollArea, Stack, Table, Text } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { useModelState } from "../hooks";
import { TableElement } from "./element";
import { DataframeHeader } from "./header";
import { TablePagination } from "./components"

export const DataTable: FunctionComponent = () => {
    const [data] = useModelState("data_grid");
    const [hist] = useModelState("title_hist");
    const [execTime] = useModelState("exec_time");

    const info = JSON.parse(data.split("\n")[0]);
    const dataLength = data.split("\n")[1] as unknown as number || 0;
    const header: string[] = info.columns;

    const headerContent = hist ?
        JSON.parse(hist)
        :
        [{ columnName: "", dtype: "", bins: [{ bin_start: 0, bin_end: 0, count: 0 }] }];

    const rows = [...Array(info.index.length).keys()].map((rowIndex: number) => (
        <tr key={uuid()}>
            <td key={rowIndex}>{info?.index?.at(rowIndex) ?? ""}</td>
            {
                info?.data?.at(rowIndex) ?
                    info.data.at(rowIndex).map((item: string | boolean | number, tdIndex: number) => (
                        <td key={tdIndex} style={{ fontSize: "8px" }}>
                            {
                                item ?
                                    <TableElement item={item} index={rowIndex} tdIndex={tdIndex} />
                                    :
                                    <></>
                            }
                        </td>
                    ))
                    :
                    <></>
            }
        </tr>
    ))

    return (
        <Stack
            spacing={10}
        >
            <ScrollArea scrollbarSize={8}>
                <Table
                    withBorder
                    withColumnBorders
                    striped
                    sx={{
                        width: "100%",
                        "& thead": {
                            height: "57px",
                        },
                        "& td": {
                            maxWidth: "200px"
                        },
                        "& tbody tr td": {
                            padding: "0px 3px",
                        },
                        "& thead tr th:first-of-type": {
                            padding: 0
                        },
                        "&  td:first-of-type": {
                            backgroundColor: "#ebebeb",
                        },
                        "&  tr:first-of-type": {
                            backgroundColor: "#ebebeb",
                        },
                        "&  tr:nth-of-type(even)": {
                            backgroundColor: "#f2f2f2",
                        },
                    }}>

                    <DataframeHeader headerContent={headerContent} header={header} dataLength={dataLength} />

                    <tbody>
                        {rows}
                    </tbody>
                </Table>
            </ScrollArea>
            <Group
                noWrap
                position="apart"
                sx={{ width: "100%" }}>
                <Group>
                    <Text color="#8d8d8d">{dataLength} rows</Text>
                    {
                        execTime > 0 ?
                            <Text color="#8d8d8d">{execTime.toFixed(4)} s</Text>
                            :
                            <></>
                    }
                </Group>
                <TablePagination />
            </Group>
        </Stack>
    )
}
