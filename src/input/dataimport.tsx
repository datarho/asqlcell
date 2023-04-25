import React, { FunctionComponent, useState } from "react";
import { Box, Button, Group, Popover, Text, NavLink, ScrollArea } from "@mantine/core";
import { RiArrowDownSLine } from "react-icons/ri";
import { useModel } from "../hooks";

export const DataImport: FunctionComponent = () => {
    const model = useModel();
    const [opened, setOpened] = useState<boolean>(false);
    const [dataframe, setDataFrame] = useState<string>(model?.get("dfs_result"));
    model?.on("change:dfs_result", (msg) => {
        setDataFrame(model.get("dfs_result"))
    })
    const DropdownHeight = dataframe.trim().split(/\r?\n/).length >= 5 ? "125px" : `${dataframe.trim().split(/\r?\n/).length * 25}px`;
    const items = dataframe.split("\n").map((name, index) => (
        name === "" ?
            <></>
            :
            <NavLink
                sx={{ height: "25px" }}
                className="data list"
                key={index}
                label={name.split("\t")[0]}
                onClick={() => {
                    model?.trigger("importData", name.split("\t")[0]);
                    setOpened(false)
                }}
                rightSection={<Text size="xs">{name.split("\t")[1]}</Text>}
            />
    ));

    return (
        <>
            <Popover
                opened={opened}
                onChange={setOpened}
            >
                <Popover.Target>
                    <Button
                        rightIcon={<RiArrowDownSLine />}
                        color="dark"
                        variant="subtle"
                        radius="xs"
                        sx={{
                            outline: "none",
                            "&:hover": {
                                backgroundColor: "transparent"
                            },
                        }}
                        onClick={() => {
                            setOpened((open) => !open)
                            model?.trigger("dfs_button")
                        }}
                    >
                        <Text
                            color="gray"
                            sx={{ fontWeight: "bold" }}
                        >
                            Dataframe
                        </Text>
                    </Button>
                </Popover.Target>

                <Popover.Dropdown
                    sx={{
                        marginLeft: "2.5%",
                        marginTop: "-15px",
                        padding: "2px",
                    }}
                >
                    {
                        dataframe ?
                            <ScrollArea sx={{ height: DropdownHeight }}>
                                <Group style={{ width: "100%" }}>
                                    <Box sx={{
                                        padding: 0,
                                    }}>
                                        {items}
                                    </Box>
                                </Group>
                            </ScrollArea>
                            :
                            <Text color={"lightgray"}>There is no dataframe.</Text>
                    }
                </Popover.Dropdown>
            </Popover>
        </>
    )
}