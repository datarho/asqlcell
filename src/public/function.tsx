import { ColItem } from "../visualization";

// The reason why we pass model as a parameter into this function is 
// it would cause an error if we get model by useModel here. 
export const sendVisSql = (model: any, ColName: string, array: ColItem[]) => {
    const isIndex = ColName === "Index";
    const group = array
        .filter((item: ColItem) => (item.colName !== ""))
        .map((item: ColItem) => (
            `"${item.colName}"`
        ))
    model?.set("vis_sql", [
        // NOTE: THE CONDITION WOULD ALWAYS BE TRUE
        `select * EXCLUDE (index_rn1qaz2wsx)\nfrom \n(\nSELECT ${group.join(",")}${!isIndex ? "," + `"${ColName}"` : ""}, ROW_NUMBER() OVER () AS index_rn1qaz2wsx\n FROM $$__NAME__$$ ${true ? "" : "GROUP BY " + `"${ColName}"`}\n)\nusing SAMPLE reservoir (500 rows) REPEATABLE(42)\norder by index_rn1qaz2wsx`,
        ColName === "Index" ? "index_rn1qaz2wsx" : ColName, // Unexpected constant condition  no-constant-condition
        new Date().toISOString()
    ]);
    model?.save_changes();
}