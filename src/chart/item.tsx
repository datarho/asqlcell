import { Group, Text } from "@mantine/core";
import { TablerIconsProps } from "@tabler/icons-react";
import React, { FunctionComponent, forwardRef } from "react";


interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
    icon: (props: TablerIconsProps) => JSX.Element;
    value: string;
    label: string;
}

export const IconItem = forwardRef<HTMLDivElement, ItemProps>(({ icon, value, label, ...others }: ItemProps, ref) => (
    <Group noWrap ref={ref} {...others}>
        <ItemIcon icon={icon} />
        <Text size="sm">{label}</Text>
    </Group>
));

interface IconProps {
    icon?: (props: TablerIconsProps) => JSX.Element;
}

export const ItemIcon: FunctionComponent<IconProps> = ({ icon: Icon }) => {
    return Icon ? <Icon stroke={1.5} size={18} /> : null
}
