import React, { FunctionComponent } from "react";
import { ColorAxis, ThetaAxis } from "./properties";

export const PieChart: FunctionComponent = () => {
    return (
        <>
            <ThetaAxis />
            <ColorAxis />
        </>
    );
}