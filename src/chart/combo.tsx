import React, { FunctionComponent } from "react";
import { HorizontalAxis, VerticalAxis } from "./properties";

export const ComboChart: FunctionComponent = () => {
    return (
        <>
            <HorizontalAxis />
            <VerticalAxis />
            <VerticalAxis />
        </>
    );
}
