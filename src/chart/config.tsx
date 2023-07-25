import { ScrollArea, Space, Stack, Tabs } from "@mantine/core";
import { IconPresentation, IconSettings } from "@tabler/icons-react";
import React, { FunctionComponent } from "react";
import { ConfigCommand } from "./command";
import { DisplaySize } from "./display";
import { ChartProperties } from "./properties";
import { ChartType } from "./type";

export const ChartConfig: FunctionComponent = () => {
    return (
        <Tabs defaultValue="config">
            <Tabs.List>
                <Tabs.Tab value="config" icon={<IconSettings stroke={1.5} size={16} />}>Config</Tabs.Tab>
                <Tabs.Tab value="display" icon={<IconPresentation stroke={1.5} size={16} />}>Display</Tabs.Tab>
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

            <Tabs.Panel value="display" pt="xs">
                <ScrollArea
                    h={500}
                    sx={{ padding: 5 }}
                >
                    <Stack justify="flex-start">
                        <DisplaySize />

                    </Stack>
                </ScrollArea>
            </Tabs.Panel>
        </Tabs >
    )
}
