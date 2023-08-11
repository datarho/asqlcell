import React, { FunctionComponent } from "react";
import { ColorAxis, HorizontalAxis, VerticalAxis } from "./properties";

export const ColumnChart: FunctionComponent = () => {
    return (
        <>
            <HorizontalAxis />
            <VerticalAxis />
            <ColorAxis />
        </>
    );
}