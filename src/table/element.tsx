import {
    ActionIcon, Box,
    Button, CopyButton,
    Group, Menu,
    Modal,
    Stack,
    Text,
    Textarea, Tooltip, UnstyledButton
} from "@mantine/core";
import { useIntersection, useHover, useDisclosure } from "@mantine/hooks";
import {
    IconArrowsMaximize,
    IconCheck,
    IconCopy, IconDots
} from "@tabler/icons-react";
import React, { FunctionComponent, memo, useMemo, useRef } from "react";
import { useModelState } from "../hooks";

interface TableElementProps {
    index: number,
    tdIndex: number,
    item: string | boolean | number,
}


export const InitialTextElement: FunctionComponent<{ item: string }> = ({ item }) => (
    <Text
        fz="xs"
        sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
    >
        {item}
    </Text>
);
export const TextElement = memo(InitialTextElement);

export const NumericElement: FunctionComponent<{ item: number, color: number, activated: boolean }> = ({ item, color, activated }) => {
    const containerRef = useRef();
    const { ref, entry } = useIntersection({
        root: containerRef.current,
        threshold: 1,
    });
    return (
        <Box
            ref={ref}
            w="80%"
            bg={activated && entry?.isIntersecting ? `rgb(${color}, ${color}, ${color})` : "transparent"}
        >
            <Text sx={{ overflow: "hidden" }} fz="xs">
                {item}
            </Text>
        </Box>
    )
};

const DetailPage: FunctionComponent<{ hovered: boolean, item: string | number, close: () => void }> = ({ item, hovered, close }) => {
    return (
        <Stack spacing={0} align="center">
            <Group position="right" w="100%">
                <CopyButton value={item.toString()}>
                    {({ copied, copy }) => (
                        <UnstyledButton onClick={copy}
                            style={{
                                display: hovered ? "block" : "none"
                            }}
                        >
                            {
                                copied ?
                                    <Tooltip label={"Copied"} position="bottom">
                                        <IconCheck color={'blue'} size={20} stroke={1.5} />
                                    </Tooltip>
                                    :
                                    <IconCopy color={'teal'} size={20} stroke={1.5} />
                            }
                        </UnstyledButton>
                    )}
                </CopyButton>
            </Group>
            <Textarea
                autosize
                minRows={5}
                maxRows={15}
                readOnly
                value={item}
                w="100%"
                mb={"xl"}
                sx={{
                    ".mantine-Textarea-input": {
                        paddingTop: 0,
                        paddingBottom: 0
                    }
                }}
            />
            <Button w="50%" onClick={close}>
                Close
            </Button>
        </Stack>
    )
};

const ElementActionMenu: FunctionComponent<{ hovered: boolean, item: string | number }> = ({ hovered, item }) => {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        // Box outside is placeholder for copy icon
        <Box w={12} h={12} style={{ justifyContent: "center" }}>
            <Modal opened={opened} onClose={close} title="Detail" centered>
                <DetailPage hovered={hovered} item={item} close={close} />
            </Modal>
            <Menu
                offset={-1}
                zIndex={1}
                styles={{
                    item: {
                        height: "1rem",
                        fontSize: "10px",
                        padding: "0.2rem"
                    },
                    dropdown: {
                        padding: 0
                    }
                }}
            >
                <Menu.Target>
                    <ActionIcon
                        size={"xs"}
                        style={{ display: hovered ? "flex" : "none" }}
                    >
                        <IconDots size={12} stroke={1.5} />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item
                        icon={<IconArrowsMaximize size={12} stroke={1.5} />}
                        onClick={open}
                    >
                        Detail
                    </Menu.Item>
                    <Menu.Item
                        icon={<IconCopy size={12} stroke={1.5} />}
                        onClick={() => {
                            navigator.clipboard.writeText(item.toString());
                        }}
                    >
                        Copy
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Box>
    )
}

export const TableElement: FunctionComponent<TableElementProps> = ({ item, index, tdIndex }) => {
    const [color] = useModelState("column_color");
    const colorMatrix = JSON.parse(color)?.data;
    const [cache] = useModelState("cache");
    const activatedFormatting = useMemo(() => JSON.parse(cache)["activatedFormatting"], [cache])
    const { hovered, ref } = useHover();

    const elementOutput = () => {
        switch (typeof (item)) {
            case "string":
                return (<TextElement item={item} />)
            case "number":
            case "bigint":
                return (
                    <NumericElement
                        item={item}
                        color={colorMatrix?.at(index) ? colorMatrix?.at(index).at(tdIndex) : 255}
                        activated={activatedFormatting}
                    />
                )
            case "boolean":
                return (<Text sx={{ overflow: "hidden" }} fz="xs">{item ? "True" : "False"}</Text>)
            case "symbol":
            case "undefined":
            case "object":
            case "function":
            default:
                return <></>
        }
    }

    const menuOutput = (typeof (item) === "string" && item.length > 0) || typeof (item) === "number" ?
        <ElementActionMenu hovered={hovered} item={item} />
        :
        <></>

    return (
        <Group ref={ref} spacing={0} noWrap position="apart" w="100%" align="start">
            {
                elementOutput()
            }
            {
                menuOutput
            }
        </Group>
    )
}