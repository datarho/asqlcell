import React, { FunctionComponent } from "react";
import { ColorAxis, HorizontalAxis, VerticalAxis } from "./properties";

export const ScatterChart: FunctionComponent = () => {
    return (
        <>
            <HorizontalAxis />
            <VerticalAxis />
            <ColorAxis />
        </>
    );
}