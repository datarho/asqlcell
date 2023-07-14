import { ScrollArea, Stack, Tabs } from "@mantine/core";
import React, { FunctionComponent } from "react";
import { ChartProperties } from "./properties";
import { ChartType } from "./type";
import { IconSettings } from "@tabler/icons-react";

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
                    </Stack>
                </ScrollArea>
            </Tabs.Panel>
        </Tabs>
    )
}
