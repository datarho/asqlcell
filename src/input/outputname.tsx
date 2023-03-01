import { Group, Text, TextInput } from "@mantine/core";
import React, { useState } from "react";
import { FunctionComponent } from "react";
import { useModel, useModelState } from "../hooks";

export const NameOutput: FunctionComponent = () => {
    const model = useModel();
    const [output, setOutput] = useModelState("output");
    const [outputName, setOutputName] = useState(output);

    model?.on("update_outputName", (msg) => {
        setOutputName(msg.changed.output)
    })

    const escape = () => {
        if (document.activeElement instanceof HTMLElement) {
            if (outputName.trim().length > 0) {
                setOutput(outputName);
                document.activeElement.blur();
            }
            else {
                setOutputName(output);
            }
        }
    }

    return (
        <Group
            position="right"
            align="center"
            sx={{
                height: "100%",
                gap: "0px",
            }}>

            <Text color="#8D8D8D" sx={{ marginRight: "10px" }}>SAVED TO</Text>

            <TextInput
                size="xs"
                styles={() => ({
                    input: {
                        width: "100px",
                        color: "#8D8D8D",
                        fontSize: "inherit",
                        backgroundColor: "#fafafa",
                        borderColor: "#fafafa",
                        fontWeight: "bold",
                        paddingLeft: 0,
                        ":focus": {
                            borderColor: outputName.trim().length === 0 ? "red" : "lightgray",
                        }
                    },
                })}
                value={outputName}
                onBlur={() => {
                    escape();
                }}
                onKeyDown={(e) => {
                    if (["Enter", "Escape"].includes(e.code)) {
                        e.preventDefault();
                        escape();
                    }
                }}
                onChange={(e) => {
                    setOutputName(e.target.value);
                }}

            />
        </Group>
    )
}