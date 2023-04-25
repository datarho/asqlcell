import { ActionIcon, Box, Button, Group, Popover, Stack, Text } from "@mantine/core";
import { IconChartLine } from "@tabler/icons-react";
import React, { useState } from "react";
import { FunctionComponent } from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { useModel } from "../hooks";
import { BarChart } from "../visualization/bar";
import { LineChart } from "../visualization/line";
import { Dfhead } from "../WidgetView";

interface props {
    headerContent: Dfhead[];
    header: string[];
    dataLength: number;
}

export const DataframeHeader: FunctionComponent<props> = ({ headerContent, header, dataLength }) => {
    const model = useModel();
    const Order = {
        Increasing: 1,
        Descending: -1,
        None: 0,
    }
    const [order, setOrder] = useState(model?.get("column_sort")[1]);
    let currentOrder = Order.None;
    const [col, setColName] = useState<string>(model?.get("column_sort")[0]);
    const [open, setOpen] = useState<string | undefined>(undefined);
    return (
        <thead>
            <tr>
                <th></th>
                {
                    header.map((item, index) =>
                        <th
                            key={index}
                            style={{
                                padding: 0,
                            }}>
                            <Box sx={{
                                display: "flex",
                                justifyContent: "center",
                            }}>
                                <Stack align={"flex-start"} sx={{ gap: 0, maxWidth: "10rem" }}>
                                    <Group position="left">
                                        <Button
                                            color="dark"
                                            sx={{
                                                maxWidth: "10rem",
                                                height: "27px",
                                                "&.mantine-UnstyledButton-root": {
                                                    paddingLeft: "0px",
                                                    ":hover": {
                                                        backgroundColor: "#ebebeb",
                                                    }
                                                }
                                            }}
                                            rightIcon={
                                                <>
                                                    {
                                                        headerContent ?
                                                            headerContent.filter(header => header.columnName === item).length !== 0 ?
                                                                <Text size={"xs"} fs="italic" color={"gray"}>{headerContent.filter(header => header.columnName === item)[0].dtype}</Text>
                                                                : <></>
                                                            :
                                                            <></>
                                                    }
                                                    {
                                                        col === item ?
                                                            order === Order.Increasing ?
                                                                <FaSortUp color="gray" size={10} />
                                                                :
                                                                order === Order.Descending ?
                                                                    <FaSortDown color="gray" size={10} />
                                                                    :
                                                                    <FaSort color="lightgray" size={10} />
                                                            :
                                                            <FaSort color="lightgray" size={10} />
                                                    }
                                                </>
                                            }
                                            variant="subtle"
                                            onClick={() => {
                                                if (col === item) {
                                                    if (order === Order.Increasing) {
                                                        currentOrder = Order.Descending
                                                        setOrder(Order.Descending)
                                                    }
                                                    else if (order === Order.Descending) {
                                                        currentOrder = Order.None;
                                                        setOrder(Order.None);
                                                    } else {
                                                        currentOrder = Order.Increasing
                                                        setOrder(Order.Increasing)
                                                    }
                                                } else {
                                                    currentOrder = Order.Increasing
                                                    setOrder(Order.Increasing)
                                                    setColName(item)
                                                }
                                                model?.trigger("sort", [item, currentOrder])
                                            }}
                                        >
                                            <Text truncate fw={700}>{item}</Text>
                                        </Button>
                                    </Group>
                                    {
                                        headerContent ?
                                            <>
                                                {
                                                    headerContent.filter(header => header.columnName === item && (header.dtype.includes("int") || header.dtype.includes("float"))).length !== 0 ?
                                                        <Group noWrap position="left" sx={{ gap: 0, alignItems: "flex-start" }}>
                                                            <BarChart item={item} headerContent={headerContent} />
                                                            <Popover
                                                                position="right"
                                                                onOpen={() => {
                                                                    model?.set("vis_sql",
                                                                        [
                                                                            `select * EXCLUDE (index_rn1qaz2wsx)\nfrom \n(\nSELECT "${item}", ROW_NUMBER() OVER () AS index_rn1qaz2wsx\nFROM $$__NAME__$$\n)\nusing SAMPLE reservoir (100 rows) REPEATABLE(42)\norder by index_rn1qaz2wsx`,
                                                                            new Date().toISOString()
                                                                        ]);
                                                                    model?.save_changes();
                                                                }}>
                                                                <Popover.Target>
                                                                    <ActionIcon variant="transparent" sx={{ alignItems: "flex-end" }}>
                                                                        <IconChartLine size={12} />
                                                                    </ActionIcon>
                                                                </Popover.Target>
                                                                <Popover.Dropdown sx={{ position: "fixed" }}>
                                                                    <LineChart />
                                                                </Popover.Dropdown>
                                                            </Popover>
                                                        </Group>
                                                        :
                                                        <Stack align="left" sx={{ gap: 0 }}>
                                                            {
                                                                headerContent.filter(header => header.columnName === item).length > 0 ?
                                                                    headerContent.filter(header => header.columnName === item)[0].bins.map(bin => {
                                                                        return (
                                                                            <Group
                                                                                noWrap
                                                                                position="apart"
                                                                                onMouseEnter={() => { setOpen(item) }}
                                                                                onMouseLeave={() => setOpen(undefined)}
                                                                                sx={{ gap: 0, width: "6rem", marginBottom: "-2px" }}
                                                                            >
                                                                                {
                                                                                    (bin as any).count !== 0 ?
                                                                                        <>
                                                                                            <Box sx={{ maxWidth: "4rem" }}>
                                                                                                <Text weight={600} fs="italic" c={"#696969"} truncate fz="xs">{(bin as any).bin}: </Text>
                                                                                            </Box>
                                                                                            {
                                                                                                open ?
                                                                                                    <Text
                                                                                                        c={"blue"}
                                                                                                        fz="xs">
                                                                                                        {(bin as any).count}
                                                                                                    </Text>
                                                                                                    :
                                                                                                    <Text
                                                                                                        c={"blue"}
                                                                                                        fz="xs"
                                                                                                    >
                                                                                                        {((bin as any).count / dataLength * 100).toFixed(2)}%
                                                                                                    </Text>
                                                                                            }
                                                                                        </>
                                                                                        :
                                                                                        <></>
                                                                                }
                                                                            </Group>
                                                                        )
                                                                    })
                                                                    :
                                                                    <></>
                                                            }
                                                        </Stack>
                                                }
                                            </>
                                            :
                                            <></>
                                    }
                                </Stack>
                            </Box>
                        </th>
                    )
                }
            </tr >
        </thead >
    )
}