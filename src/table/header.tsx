import { ActionIcon, Button, Group, Popover, Text } from "@mantine/core";
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
}

export const DataframeHeader: FunctionComponent<props> = ({ headerContent, header }) => {
    const model = useModel();
    const Order = {
        Increasing: 1,
        Descending: -1,
        None: 0,
    }
    const [order, setOrder] = useState(model?.get("index_sort")[1]);
    let currentOrder = Order.None;
    const [col, setColName] = useState<string>(model?.get("index_sort")[0]);

    return (
        <thead>
            <tr>
                <th></th>
                {
                    header.map((item, index) =>
                        <th
                            key={index}
                            style={{
                                textAlign: "center",
                                padding: 0,
                            }}>
                            <Group position="center" spacing="xs">
                                <Button
                                    color="dark"
                                    sx={{
                                        height: "27px",
                                        "&.mantine-UnstyledButton-root:hover": {
                                            backgroundColor: "#ebebeb"
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
                                    {item}
                                </Button>
                            </Group>
                            {
                                headerContent ?
                                    <>
                                        {
                                            headerContent.filter(header => header.columnName === item && (["int32", "int64", "float64"].includes(header.dtype))).length !== 0 ?
                                                <Group noWrap position="center" sx={{ gap: 0 }}>
                                                    <BarChart item={item} headerContent={headerContent} />
                                                    <Popover
                                                        position="right"
                                                        onOpen={() => {
                                                            model?.set("execute", `SELECT ${item} FROM $$__NAME__$$ using SAMPLE reservoir (1000 rows) REPEATABLE(42)`);
                                                            model?.save_changes();
                                                        }}>
                                                        <Popover.Target>
                                                            <ActionIcon variant="transparent">
                                                                <IconChartLine size={8} />
                                                            </ActionIcon>
                                                        </Popover.Target>
                                                        <Popover.Dropdown>
                                                            <LineChart />
                                                        </Popover.Dropdown>
                                                    </Popover>
                                                </Group>
                                                :
                                                <></>
                                        }
                                    </>
                                    :
                                    <></>
                            }
                        </th>
                    )
                }
            </tr >
        </thead >
    )
}