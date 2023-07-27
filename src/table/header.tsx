import { ActionIcon, Box, Button, Group, Popover, Stack, Text } from "@mantine/core";
import { IconChartLine } from "@tabler/icons-react";
import React, { FunctionComponent, useState } from "react";
import { HistChart, QuickViewChart } from "../chart";
import { Order } from "../const";
import { useModelState } from "../hooks";
import { Dfhead } from "../view";
import { OrderIcons } from "./const";

interface HeaderProps {
    contents: Dfhead[];
    titles: string[];
    dataLength: number;
}

interface TitleProps {
    content: Dfhead;
    title: string;
}

interface InfoProps {
    header: Dfhead;
    title: string;
    dataLength: number;
}

const BinInfo: FunctionComponent<InfoProps> = ({ header, title, dataLength }) => {
    const [open, setOpen] = useState<string | undefined>(undefined);

    return (
        <Stack spacing={0}>
            {
                header.bins.map((bin, index) =>
                    <Group
                        key={index}
                        noWrap
                        position="apart"
                        onMouseEnter={() => { setOpen(title) }}
                        onMouseLeave={() => setOpen(undefined)}
                        sx={{ gap: 0, width: "10rem", marginBottom: "-2px" }}
                    >
                        {
                            bin.count > 0 ?
                                <>
                                    <Box sx={{ maxWidth: "6rem" }}>
                                        <Text weight={600} fs="italic" c={"#696969"} truncate fz="xs">{bin.bin}</Text>
                                    </Box>

                                    <Text c={"blue"} fz="xs">
                                        {
                                            open ? bin.count : (bin.count / dataLength * 100).toFixed(2) + "%"
                                        }
                                    </Text>
                                </>
                                :
                                <></>
                        }
                    </Group>
                )
            }
        </Stack>
    );
}

const HistInfo: FunctionComponent<InfoProps> = ({ header, title, dataLength }) => {
    const [, setQuickViewVar] = useModelState("quickview_var");

    return (
        <Group noWrap position="center">
            <HistChart item={title} headerContent={header} />

            <Popover
                onOpen={() => {
                    setQuickViewVar([title, new Date().toISOString()])
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
    );
}

const HeaderInfo: FunctionComponent<InfoProps> = ({ header, title, dataLength }) => {
    const numerical = header.dtype.includes("int") || header.dtype.includes("float");

    return (
        <Group position="center">
            {
                numerical ?
                    <HistInfo
                        header={header}
                        title={title}
                        dataLength={dataLength}
                    />
                    :
                    <BinInfo
                        header={header}
                        title={title}
                        dataLength={dataLength}
                    />
            }
        </Group>
    )
}

const HeaderTitle: FunctionComponent<TitleProps> = ({ content, title }) => {
    const [colSort, setColSort] = useModelState("column_sort");

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
                        <Text size={"xs"} fs="italic" color={"gray"}>
                            {
                                content.dtype.includes("datetime") ?
                                    "datetime"
                                    :
                                    content.dtype
                            }
                        </Text>

                        {
                            colSort[0] === title ?
                                OrderIcons[colSort[1]]
                                :
                                OrderIcons[Order.None]
                        }
                    </>
                }
                variant="subtle"
                onClick={() => {
                    if (colSort[0] === title) {
                        switch (colSort[1]) {
                            case Order.Increasing:
                                setColSort([colSort[0], Order.Descending]);
                                break;
                            case Order.Descending:
                                setColSort([colSort[0], Order.None]);
                                break;
                            default:
                                setColSort([colSort[0], Order.Increasing]);
                        }
                    } else {
                        setColSort([title, Order.Increasing])
                    }
                }}
            >
                <Text truncate fw={700}>{title}</Text>
            </Button>
        </Group>
    )
}

export const DataframeHeader: FunctionComponent<HeaderProps> = ({ contents, titles, dataLength }) => {
    return (
        <thead>
            <tr>
                <th>{/* column for index */}</th>

                {
                    titles.map((title, index) => {
                        const content = contents.find(head => head.columnName === title)!;  // there must be a corresponding header content

                        return (
                            <th key={index}>
                                <Stack justify="flex-start" spacing="xs">
                                    <HeaderTitle
                                        content={content}
                                        title={title}
                                    />

                                    <HeaderInfo
                                        header={content}
                                        title={title}
                                        dataLength={dataLength}
                                    />
                                </Stack>
                            </th>
                        );
                    })
                }
            </tr >
        </thead >
    )
}
