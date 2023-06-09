import { ActionIcon, Box, Button, Group, Popover, Stack, Text } from "@mantine/core";
import { IconChartLine } from "@tabler/icons-react";
import React, { useState } from "react";
import { FunctionComponent } from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { useModel, useModelState } from "../hooks";
import { HistChart, QuickViewChart } from "../visualization";
import { Dfhead } from "../WidgetView";

interface props {
    headerContent: Dfhead[];
    header: string[];
    dataLength: number;
}
interface TitleProps {
    headerContent: Dfhead[];
    item: string;
}
interface InfoProps {
    headerContent: Dfhead[];
    item: string;
    dataLength: number;
}

const HeaderInfo: FunctionComponent<InfoProps> = ({ headerContent, item, dataLength }) => {
    const model = useModel();
    const [open, setOpen] = useState<string | undefined>(undefined);
    return (
        <>
            {headerContent.filter(header => header.columnName === item && (header.dtype.includes("int") || header.dtype.includes("float"))).length !== 0 ?
                <Group noWrap position="center" sx={{ gap: 0, alignItems: "flex-start" }}>

                    <HistChart item={item} headerContent={headerContent} />

                    <Popover
                        onOpen={() => {
                            model?.trigger("quick_view", item)
                        }}
                    >
                        <Popover.Target>
                            <ActionIcon variant="transparent" sx={{ alignItems: "flex-end" }}>
                                <IconChartLine size={12} />
                            </ActionIcon>
                        </Popover.Target>
                        <Popover.Dropdown
                            sx={{
                                position: "fixed",
                                top: "calc(50vh - 75px) !important",
                                left: "calc(50vw - 240px) !important",
                            }}
                        >
                            <QuickViewChart />
                        </Popover.Dropdown>
                    </Popover>

                </Group>
                :
                <Stack align="left" sx={{ gap: 0 }}>
                    {
                        headerContent.filter(header => header.columnName === item).length > 0 ?
                            headerContent.filter(header => header.columnName === item)[0].bins.map((bin, index) => {
                                return (
                                    <Group
                                        key={index}
                                        noWrap
                                        position="apart"
                                        onMouseEnter={() => { setOpen(item) }}
                                        onMouseLeave={() => setOpen(undefined)}
                                        sx={{ gap: 0, width: "10rem", marginBottom: "-2px" }}
                                    >
                                        {
                                            (bin as any).count !== 0 ?
                                                <>
                                                    <Box sx={{ maxWidth: "6rem" }}>
                                                        <Text weight={600} fs="italic" c={"#696969"} truncate fz="xs">{(bin as any).bin}</Text>
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
                </Stack>}
        </>
    )
}

const HeaderTitle: FunctionComponent<TitleProps> = ({ headerContent, item }) => {
    const model = useModel();
    const Order = {
        Increasing: 1,
        Descending: -1,
        None: 0,
    }
    const [colSort, setColSort] = useModelState("column_sort");
    let currentOrder = Order.None;
    return (
        <Group position="center">
            <Button
                color="dark"
                sx={{
                    maxWidth: "10rem",
                    height: "27px",
                    "&.mantine-UnstyledButton-root": {
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
                                    <Text size={"xs"} fs="italic" color={"gray"}>{
                                        headerContent.filter(header => header.columnName === item)[0].dtype.includes("datetime") ?
                                            "datetime"
                                            :
                                            headerContent.filter(header => header.columnName === item)[0].dtype
                                    }</Text>
                                    :
                                    <></>
                                :
                                <></>
                        }
                        {
                            colSort[0] === item ?
                                colSort[1] === Order.Increasing ?
                                    <FaSortUp color="gray" size={10} />
                                    :
                                    colSort[1] === Order.Descending ?
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
                    if (colSort[0] === item) {
                        if (colSort[1] === Order.Increasing) {
                            currentOrder = Order.Descending
                            setColSort([colSort[0], Order.Descending])
                        }
                        else if (colSort[1] === Order.Descending) {
                            currentOrder = Order.None;
                            setColSort([colSort[0], Order.None]);
                        } else {
                            currentOrder = Order.Increasing
                            setColSort([colSort[0], Order.Increasing])
                        }
                    } else {
                        currentOrder = Order.Increasing
                        setColSort([colSort[0], Order.Increasing])
                    }
                    model?.trigger("sort", [item, currentOrder])
                }}
            >
                <Text truncate fw={700}>{item}</Text>
            </Button>
        </Group>
    )
}

export const DataframeHeader: FunctionComponent<props> = ({ headerContent, header, dataLength }) => {
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
                                verticalAlign: "baseline",
                            }}>
                            <Box sx={{
                                display: "flex",
                                justifyContent: "center",
                            }}>
                                <Stack align={"center"} sx={{ gap: 0, maxWidth: "10rem" }}>
                                    <HeaderTitle
                                        headerContent={headerContent}
                                        item={item}
                                    />
                                    {
                                        headerContent ?
                                            <HeaderInfo
                                                headerContent={headerContent}
                                                item={item}
                                                dataLength={dataLength}
                                            />
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