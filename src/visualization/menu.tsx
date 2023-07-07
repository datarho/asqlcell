import React, { FunctionComponent, useState } from "react";
import { Button, Grid } from "@mantine/core";
import { IconPlus, } from "@tabler/icons-react";
import { useModelState } from "../hooks";
import { XAxisSelection } from "../menu";
import { SelectDropDown } from "../menu";
import { InitialSelectedCols } from "../public";

interface menuProps {
    XAxis: string,
    setXAxis: React.Dispatch<React.SetStateAction<string>>,
}
export interface ColItem {
    seriesName: string;
    colName: string;
    chartType: string;
    yAxis: string;
}

export const VisualConfig: FunctionComponent<menuProps> = ({ XAxis, setXAxis }) => {
    const [cache, setCache] = useModelState("cache");
    const [colArray, setColArray] = useState<ColItem[]>(
        JSON.parse(
            cache.includes("selectedCol")
                ?
                cache
                :
                InitialSelectedCols
        ).selectedCol
    );
    const cacheObject = JSON.parse(cache === "" ? "{ }" : cache);

    return (


        <Grid sx={{
            direction: "ltr",
            gap: "0",
            marginBottom: "1.5rem",
            maxWidth: "100%",
            overflowX: "hidden",
        }}>
            <XAxisSelection
                XAxis={XAxis}
                setXAxis={setXAxis}
                cacheObject={cacheObject}
                colName={colArray}
            />
            {
                colArray.map((item, index) => {
                    return (
                        <SelectDropDown
                            index={index}
                            key={index}
                            name={item.colName}
                            seriesName={item.seriesName}
                            colArray={colArray}
                            setColArray={setColArray}
                            XAxis={XAxis}
                        />
                    )
                })
            }
            <Grid.Col span={7}></Grid.Col>
            <Grid.Col span={5}
                sx={{
                    display: "flex",
                    justifyContent: "flex-end"
                }}
            >
                <Button
                    compact
                    variant="subtle"
                    leftIcon={<IconPlus size="0.75rem" />}
                    size="xs"
                    sx={{
                        ":hover": {
                            color: "blue",
                            backgroundColor: "transparent"
                        }
                    }}
                    onClick={() => {
                        const names = colArray.map(item => { return (item.seriesName) })
                        let givenName = ""
                        colArray.forEach((col, index) => {
                            const tempoName = `Y-series-${index}`
                            if (!names.includes(tempoName)) {
                                givenName = tempoName
                            }
                        })
                        if (givenName === "") { givenName = `Y-series-${names.length}` }
                        colArray.splice(colArray.length, 0, { seriesName: givenName, colName: "", chartType: "line", yAxis: "left" })
                        setColArray([...colArray])
                        cacheObject["selectedCol"] = [...colArray];
                        setCache(JSON.stringify(cacheObject))
                    }}
                >
                    Series
                </Button>
            </Grid.Col>
        </Grid>
    )
}
