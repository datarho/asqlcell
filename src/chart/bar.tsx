import React, { FunctionComponent } from "react";
import { ColorAxis, HorizontalAxis, VerticalAxis } from "./properties";

export const BarChart: FunctionComponent = () => {
    return (
        <>
            <VerticalAxis />
            <HorizontalAxis />
            <ColorAxis />
        </>
    );
}