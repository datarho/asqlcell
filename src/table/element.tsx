import { ActionIcon, Group, Popover, Text, Textarea } from "@mantine/core";
import React from "react";
import { FunctionComponent } from "react";
import { VscEllipsis } from "react-icons/vsc";
import { useElementSize } from "@mantine/hooks";

export const TableElement: FunctionComponent<{ item: string }> = ({ item }) => {
    const { ref, width } = useElementSize();
    return (
        <Popover position="top" withArrow shadow="md">
            <Group ref={ref} noWrap sx={{ gap: 0 }}>
                <Text sx={{ overflow: "hidden" }} fz="8px">
                    {
                        item.substring(0, width / 8)
                    }
                </Text>
                <Popover.Target>
                    {
                        width < (8 * item.length - 40) ?
                            <ActionIcon variant="light" color="blue" sx={{ height: "10px", minHeight: "10px", width: "10px", minWidth: "10px" }}>
                                <VscEllipsis size={8} />
                            </ActionIcon>
                            :
                            <div></div>
                    }
                </Popover.Target>
            </Group>
            <Popover.Dropdown sx={{ padding: 0 }}>
                <Textarea
                    readOnly
                    variant="unstyled"
                    withAsterisk
                    defaultValue={item}
                    autosize
                    minRows={1}
                    maxRows={2}
                    sx={{
                        fontSize: "12px",
                        "& .mantine-Textarea-input": {
                            cursor: "default",
                            paddingTop: 0,
                            paddingBottom: 0,
                        }
                    }}
                />
            </Popover.Dropdown>
        </Popover >
    )
}