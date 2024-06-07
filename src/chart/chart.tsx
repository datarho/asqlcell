import { ActionIcon, Box, Divider, Group } from "@mantine/core";
import React, { FunctionComponent, useEffect, useState } from "react";
import { ChartConfig } from "./config";
import { ChartPreview } from "./preview";
import { useElementSize } from "@mantine/hooks";
import { useModelState } from "../hooks";
import { IconArrowLeft } from "@tabler/icons-react";

export const Chart: FunctionComponent = () => {
    const [opened, setOpened] = useState(false);
    const { ref, width } = useElementSize();
    const [transitionWidth, setTransitionWidth] = useState(0);
    const [cache, setCache] = useModelState("cache");

    useEffect(() => {
        // Respond to state of display of HeaderInfo

        const cacheObject = JSON.parse(cache);
        const shown = cacheObject?.openedConfig ?? false;
        setOpened(shown)
    }, [cache]);

    useEffect(() => {
        // "width" would be set to 0 after component unload
        // Record transition width in state can make animation in shifting between tabs

        if (width > 0) {
            setTransitionWidth(width)
        }
    }, [width])

    return (
        <Group noWrap align="flex-start" style={{ position: "relative" }}>
            <Group
                noWrap
                ml={`-${transitionWidth + 16}px`}
                style={{
                    transition: "all 0.3s ease-in-out",
                    transform: opened ? `translate(${transitionWidth + 16}px)` : ""
                }}>
                <Box ref={ref}>
                    <ChartConfig />
                </Box>

                <Divider orientation="vertical" />

                <ChartPreview />
            </Group>
            <ActionIcon
                variant="transparent"
                style={{
                    position: "absolute",
                    top: 0,
                    transition: "all 0.3s ease-in-out",
                    transform: opened ? `translate(${transitionWidth + 16}px)` : "rotate(180deg)"
                }}
                onClick={() => {
                    const cacheObject = JSON.parse(cache)
                    cacheObject["openedConfig"] = !opened
                    setCache(JSON.stringify(cacheObject))
                }}
            >
                <IconArrowLeft />
            </ActionIcon>
        </Group >
    )
}
