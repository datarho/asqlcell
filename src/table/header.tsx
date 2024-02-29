import { ActionIcon, Box, Button, Collapse, Group, Popover, Stack, Text, Tooltip, createStyles } from "@mantine/core";
import { IconChartLine } from "@tabler/icons-react";
import React, { FunctionComponent, useEffect, useState } from "react";
import { HistChart, QuickViewChart } from "../chart";
import { Order } from "../const";
import { useModelState } from "../hooks";
import { Dfhead } from "../view";
import { OrderIcons } from "./const";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { CgArrowsMergeAltV, CgArrowAlignV } from "react-icons/cg";

interface HeaderProps {
    headerContent: Dfhead[];
    header: string[];
    dataLength: number;
}

interface TitleProps {
    headerContent: Dfhead[];
    item: string;
    index: number
}

interface InfoProps {
    headerContent: Dfhead;
    item: string;
    dataLength: number;
    shownHeaderInfo?: boolean
}

const FONT_BRIGHT_COLOR = "#373A40";         //dark[4]
const FONT_DISABLE_BRIGHT_COLOR = "#909296"; //dark[2]

const BinInfo: FunctionComponent<InfoProps> = ({ headerContent, item, dataLength }) => {
    const [open, setOpen] = useState<string | undefined>(undefined);

    return (
        <Stack spacing={0}>
            {
                headerContent.bins.map((bin, index) =>
                    <Group
                        key={index}
                        noWrap
                        position="apart"
                        onMouseEnter={() => { setOpen(item) }}
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

const HistInfo: FunctionComponent<InfoProps> = ({ headerContent, item }) => {

    const [, setQuickViewVar] = useModelState("quickview_var");

    return (
        <Group noWrap position="center">
            <HistChart item={item} headerContent={headerContent} />

            <Popover
                onOpen={() => {
                    setQuickViewVar([item, new Date().toISOString()]);
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

const HeaderInfo: FunctionComponent<InfoProps> = ({ headerContent, item, dataLength, shownHeaderInfo }) => {
    const numerical = headerContent.dtype.includes("int") || headerContent.dtype.includes("float");

    return (
        <Group
            noWrap
            position="center"
            spacing={0}
        >
            <Collapse in={shownHeaderInfo ?? false}>
                {
                    numerical ?
                        <HistInfo
                            headerContent={headerContent}
                            item={item}
                            dataLength={dataLength}
                        />
                        :
                        <BinInfo
                            headerContent={headerContent}
                            item={item}
                            dataLength={dataLength}
                        />
                }
            </Collapse>
        </Group>
    )
}

const HeaderTitle: FunctionComponent<TitleProps> = ({ headerContent, item, index }) => {
    const [colSort, setColSort] = useModelState("column_sort");
    const [cache] = useModelState("cache");
    const [width, setWidth] = useState("100%");
    const [opened, { close, open }] = useDisclosure(false);
    const clipboard = useClipboard({ timeout: 1000 });

    useEffect(() => {
        // Respond to change of col width in widget state

        const cacheObject = JSON.parse(cache);
        const w = cacheObject?.HeaderWidth?.[item] ?? "100%";
        setWidth(w)
    }, [cache, item]);

    return (
        <Group w={width} noWrap position="center" id={`header_${index}`} spacing={0}>
            <Popover
                opened={opened}
                offset={0}
                styles={{
                    dropdown: {
                        padding: "0.2rem",
                        fontSize: 12,
                        fontWeight: 500,
                    }
                }}
            >
                <Popover.Target>
                    <Button
                        w={"calc(100% - 5.5rem)"}
                        variant="subtle" p={0}
                        onMouseEnter={open}
                        onMouseLeave={close}
                        onClick={() => { clipboard.copy(item) }}
                        sx={{
                            ":hover": {
                                backgroundColor: "transparent"
                            }
                        }}
                    >
                        <Text truncate fw={700}>{item}</Text>
                    </Button>
                </Popover.Target>
                <Popover.Dropdown>
                    <Text truncate fw={700}>{item}</Text>
                    {
                        clipboard.copied ?
                            <Text c="green">Copied</Text>
                            :
                            <Text>Click to copy</Text>
                    }
                </Popover.Dropdown>
            </Popover>
            <Tooltip
                label={"Click to sort"}
                sx={{
                    backgroundColor: "white",
                    color: "#323232",
                    fontWeight: 500,
                    fontSize: 12
                }}
            >
                <Button
                    color="dark"
                    sx={{
                        height: "27px",
                        width: "6rem",
                        "&.mantine-UnstyledButton-root": {
                            color: FONT_BRIGHT_COLOR,
                            ":hover": {
                                backgroundColor: "transparent"
                            },
                            ":disabled": {
                                color: FONT_DISABLE_BRIGHT_COLOR,
                                backgroundColor: "transparent",
                            }
                        }
                    }}
                    variant="subtle"
                    onClick={() => {
                        if (colSort?.[0] === item) {
                            switch (colSort[1]) {
                                case Order.Increasing:
                                    setColSort([item, Order.Descending]);
                                    break;
                                case Order.Descending:
                                    setColSort([item, Order.None]);
                                    break;
                                default:
                                    setColSort([item, Order.Increasing]);
                            }
                        } else {
                            setColSort([item, Order.Increasing])
                        }
                    }}
                >
                    <>
                        {
                            headerContent ?
                                headerContent.filter(header => header.columnName === item).length > 0 ?
                                    <Text
                                        size={"xs"}
                                        fs="italic"
                                        sx={{
                                            color: FONT_DISABLE_BRIGHT_COLOR
                                        }}
                                    >
                                        {
                                            headerContent.filter(header => header.columnName === item)?.[0]?.dtype ?? ""
                                        }
                                    </Text>
                                    :
                                    <></>
                                :
                                <></>
                        }
                        {
                            colSort?.[0] === item ?
                                OrderIcons[(colSort[1] ?? Order.None) as Order]
                                :
                                OrderIcons[Order.None]
                        }
                    </>
                </Button>
            </Tooltip>
        </Group>
    )
}

export const DataframeHeader: FunctionComponent<HeaderProps> = ({ headerContent, header, dataLength }) => {
    const [drag, setDrag] = useState<{ iniMouse: number; iniSize: number }>({ iniMouse: 0, iniSize: 0 });
    const [cache, setCache] = useModelState("cache");
    const [shownHeaderInfo, setShownHeaderInfo] = useState(false);
    const useStyles = createStyles((theme) => ({
        div: {
            cursor: "col-resize",
            height: "100%",
            position: "absolute",
            right: "-4px",
            top: 0,
            width: "4px",
            zIndex: 1,
            '&:hover': {
                backgroundColor: "#ebebeb"
            }
        }
    }));
    const { classes } = useStyles();
    const handleStart = (e: any, index: number) => {
        let iniMouse = e.clientX;
        let iniSize = document.getElementById(`header_${index}`)?.offsetWidth ?? drag.iniSize;
        setDrag({
            iniMouse: iniMouse,
            iniSize: iniSize
        });
    };

    const handleMove = (e: any, index: number) => {
        if (e.clientX) {
            let iniMouse = drag.iniMouse;
            let iniSize = drag.iniSize;

            let endMouse = e.clientX;
            let endSize = iniSize + (endMouse - iniMouse);
            if (endSize > 160) {
                document.getElementById(`header_${index}`)!.style.width = `${endSize}px`;
            }
        }
    };

    useEffect(() => {
        // Respond to state of display of HeaderInfo
        const cacheObject = JSON.parse(cache);
        const shown = cacheObject?.shownHeaderInfo ?? false;
        setShownHeaderInfo(shown);
    }, [cache]);

    return (
        <thead>
            <tr>
                <th>
                    <ActionIcon
                        onClick={() => {
                            const cacheObject = JSON.parse(cache);
                            cacheObject["shownHeaderInfo"] = !shownHeaderInfo;
                            setCache(JSON.stringify(cacheObject));
                        }}
                    >
                        {
                            shownHeaderInfo ?
                                <CgArrowsMergeAltV />
                                :
                                <CgArrowAlignV />
                        }
                    </ActionIcon>
                </th>

                {
                    header ?
                        header.map((item, index) => {
                            const content = headerContent.find(head => head.columnName === item)!;  // there must be a corresponding header content
                            return (
                                <th
                                    key={index}
                                    style={{
                                        padding: 0,
                                        verticalAlign: "baseline",
                                        position: "relative",
                                    }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            minWidth: "7rem"
                                        }}>
                                        <Stack sx={{ gap: 0 }}>
                                            <HeaderTitle
                                                headerContent={headerContent}
                                                item={item}
                                                index={index}
                                            />
                                            <HeaderInfo
                                                shownHeaderInfo={shownHeaderInfo}
                                                headerContent={content}
                                                item={item}
                                                dataLength={dataLength}
                                            />
                                        </Stack>
                                    </Box>
                                    <div
                                        className={classes.div}
                                        draggable={true}
                                        onDragStart={(e) => handleStart(e, index)}
                                        onDrag={(e) => handleMove(e, index)}
                                        onDragEnd={() => {
                                            // Save changed col width into widget state in notebook and in kernel

                                            const cacheObject = JSON.parse(cache)
                                            cacheObject["headerWidth"] = {
                                                ...cacheObject["headerWidth"],
                                                [item]: document.getElementById(`header_${index}`)?.style?.width ?? "100%"
                                            }
                                            setCache(JSON.stringify(cacheObject))
                                        }}
                                    />
                                </th>
                            )
                        })
                        :
                        <></>
                }
            </tr >
        </thead >
    )
}
