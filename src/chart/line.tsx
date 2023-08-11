import React, { FunctionComponent } from "react";
import { ColorAxis, HorizontalAxis, VerticalAxis } from "./properties";

export const LineChart: FunctionComponent = () => {
    return (
        <>
            <HorizontalAxis />
            <VerticalAxis />
            <ColorAxis />
        </>
    );
}