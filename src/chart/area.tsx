import React, { FunctionComponent } from "react";
import { ColorAxis, HorizontalAxis, VerticalAxis } from "./properties";

export const AreaChart: FunctionComponent = () => {
    return (
        <>
            <HorizontalAxis />
            <VerticalAxis />
            <ColorAxis />
        </>
    );
}