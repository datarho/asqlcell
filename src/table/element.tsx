import { ActionIcon, Group, Popover, Text, Textarea } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import React, { FunctionComponent } from "react";
import { VscEllipsis } from "react-icons/vsc";

export const TableElement: FunctionComponent<{ item: string }> = ({ item }) => {
    const { ref, width } = useElementSize();
    return (
        <Popover position="top" withArrow shadow="md">
            <Group ref={ref} noWrap sx={{ gap: 0 }}>
                <Text sx={{ overflow: "hidden" }} fz="12px">
                    {
                        item.substring(0, Math.max(160, width) / 8)
                    }
                </Text>
                <Popover.Target>
                    {
                        Math.max(160, width) < (8 * item.length) ?
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