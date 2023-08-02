import { Button, Group } from "@mantine/core";
import { IconPin } from "@tabler/icons-react";
import React, { FunctionComponent } from "react";
import { useModelState } from "../hooks";

export const ConfigCommand: FunctionComponent = () => {
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
