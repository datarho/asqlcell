import { Accordion, ActionIcon, Grid, Group, Popover, Select, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Icon123, IconAlertSquareRounded, IconChartArrows, IconChartArrowsVertical } from "@tabler/icons-react";
import React from "react";
import { FunctionComponent, useState } from "react";
import { useModel, useModelState } from "../hooks";
import { IconMap, SelectItem, sendVisSql } from "../public";

interface XAxisProps {
    XAxis: string,
    setXAxis: any,
    cacheObject: any,
    colName: any,
}

const SamplingIndicator: FunctionComponent = () => {
    const [opened, { close, open }] = useDisclosure(false);
    return (
        <Popover opened={opened}>
            <Popover.Target>
                <IconAlertSquareRounded onMouseEnter={open} onMouseLeave={close} size={16} />
            </Popover.Target>
            <Popover.Dropdown>
                <Text size={8}>Data has been sampled.</Text>
            </Popover.Dropdown>
        </Popover>
    )
}

export const XAxisSelection: FunctionComponent<XAxisProps> = ({ XAxis, setXAxis, cacheObject, colName }) => {
    const model = useModel();
    // const [sortAsce, setSortAsce] = useState(true);
    const [hist] = useModelState("title_hist");
    const headers = JSON.parse(hist ?? `{"columnName":"", "dtype":""}`);
    const [xAxisIcon, setXAxisIcon] = useState<JSX.Element>(<Icon123 />);
    const [cache, setCache] = useModelState("cache");
    const dataLength = (model?.get("data_grid") ?? "{}").split("\n")[1] as unknown as number || 0;
    const [orient, setOrient] = useState(JSON.parse(
        cache.includes("chartState")
            ?
            cache
            :
            `{"chartState":{"orient": "vertical"}}`
    ).chartState.orient);

    const headerWithType: (string | any)[] = [{ columnName: "Index(Default)", dtype: "int" }, ...headers]
        .filter(item => (item.dtype !== "int" && item.dtype !== "float") || item.columnName === "Index(Default)")
        .map((header: { columnName: string, dtype: string }) => {
            return (
                {
                    value: header.columnName === "Index(Default)" ? "Index" : header.columnName, label: header.columnName, icon: IconMap[header.dtype]
                }
            )
        });
    return (
        <Grid.Col span={12} >
            <Accordion
                chevronPosition="left"
                variant="filled"
                sx={{
                    padding: 0,
                    ".mantine-Accordion-control": {
                        padding: 0,
                    },
                    ".mantine-Accordion-content": {
                        padding: "0.5rem 1rem 0rem 1rem",
                    },
                    ".mantine-Accordion-item": {
                        paddingTop: "0.5rem",
                    },
                }}
            >
                <Accordion.Item value="X-axis" >
                    <Accordion.Control>
                        <Group noWrap>
                            <Text size={"sm"}>X-Axis</Text>
                            {
                                dataLength > 500 ?
                                    <SamplingIndicator />
                                    :
                                    <></>
                            }
                        </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <Grid>
                            <Grid.Col span={12}>
                                <Select
                                    size="xs"
                                    icon={xAxisIcon}
                                    defaultValue={"Index"}
                                    value={XAxis}
                                    data={headerWithType}
                                    itemComponent={SelectItem}
                                    maxDropdownHeight={5 * 16}
                                    onChange={(value) => {
                                        setXAxisIcon(headerWithType.filter(item => item.value === value)[0].icon)
                                        cacheObject["xAxisState"] = value;
                                        setCache(JSON.stringify(cacheObject));
                                        setXAxis(value!);
                                        let array = [...colName]
                                        array = array.filter(item => item !== "")
                                        sendVisSql(model, value!, array)
                                    }}
                                />
                            </Grid.Col>
                            <Grid.Col span={8}></Grid.Col>
                            <Grid.Col span={1} sx={{ paddingTop: 0 }}>
                                {/* <ActionIcon
                                    variant="subtle"
                                    size="xs"
                                    onClick={() => {
                                        setSortAsce(!sortAsce);
                                        model?.trigger("sort-X");
                                    }}
                                >
                                    {
                                        sortAsce ?
                                            <IconSortAscending size={16} />
                                            :
                                            <IconSortDescending size={16} />
                                    }
                                </ActionIcon> */}
                            </Grid.Col>
                            <Grid.Col span={3} sx={{ paddingTop: 0, display: "flex", alignItems: "center", justifyContent: "right" }}>
                                <ActionIcon
                                    onClick={() => {
                                        if (cache.includes("chartState")) {
                                            orient === "vertical"
                                                ?
                                                cacheObject["chartState"] = { "orient": "horizontal" }
                                                :
                                                cacheObject["chartState"] = { "orient": "vertical" };
                                        } else {
                                            cacheObject["chartState"] = JSON.parse(`{"orient":"horizontal"}`)
                                        }
                                        setCache(
                                            JSON.stringify(cacheObject)
                                        );
                                        setOrient(orient === "vertical" ? "horizontal" : "vertical")
                                    }}>
                                    {
                                        orient === "vertical" ?
                                            <IconChartArrowsVertical size={16} color="dimgrey" />
                                            :
                                            <IconChartArrows size={16} color="dimgrey" />
                                    }
                                </ActionIcon>
                            </Grid.Col>
                        </Grid>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Grid.Col>
    )
}