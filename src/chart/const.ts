import { Icon123, IconAbc, IconCalendar, TablerIconsProps } from "@tabler/icons-react";

export const ViewHeight = 264;
export const MenuHeight = 311;
export const MenuWidth = 285;
export const LabelWidth = 128;

export type DataType = "int" | "float" | "string" | "bool" | "datetime";

export const DataTypeIcon: Record<DataType, (props: TablerIconsProps) => JSX.Element> = {
    "int": Icon123,
    "float": Icon123,
    "string": IconAbc,
    "bool": IconAbc,
    "datetime": IconCalendar,
};
