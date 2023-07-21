import { Button, Group, ScrollArea, Space, Stack, Tabs } from "@mantine/core";
import { IconPin, IconSettings } from "@tabler/icons-react";
import React, { FunctionComponent } from "react";
import { useModelState } from "../hooks";
import { ChartProperties } from "./properties";
import { ChartType } from "./type";


const ConfigCommand: FunctionComponent = () => {
    const [spec] = useModelState("preview_vega");
    const [, setPersistVega] = useModelState("persist_vega");

    return (
        <Group>
            <Button
                compact
                onClick={() => setPersistVega(new Date().toString())}
                disabled={spec === "{}"}
                leftIcon={<IconPin stroke={1.5} size={14} />}
            >
                Pin
            </Button>
        </Group>
    )
}


export const ChartConfig: FunctionComponent = () => {
    return (
        <Tabs defaultValue="config">
            <Tabs.List>
                <Tabs.Tab value="config" icon={<IconSettings stroke={1.5} size={16} />}>Config</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="config" pt="xs">
                <ScrollArea
                    h={500}
                    sx={{ padding: 5 }}
                >
                    <Stack justify="flex-start">
                        <ChartType />

                        <ChartProperties />

                        <Space h="xl" />

                        <ConfigCommand />
                    </Stack>
                </ScrollArea>
            </Tabs.Panel>
        </Tabs >
    )
}
