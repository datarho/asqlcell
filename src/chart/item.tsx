import { Group, Text } from "@mantine/core";
import React, { forwardRef } from "react";

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
    icon: JSX.Element;
    value: string;
    label: string;
}

export const IconItem = forwardRef<HTMLDivElement, ItemProps>(({ icon, value, label, ...others }: ItemProps, ref) => (
    <Group noWrap ref={ref} {...others}>
        {icon}
        <Text size="sm">{label}</Text>
    </Group>
));

