import { SqlCellModel } from "..";
import { createTestModel } from "./utils";

describe("Analytical Sql Cell", () => {
    it("should be creatable", () => {
        const model = createTestModel(SqlCellModel);
        expect(model).toBeInstanceOf(SqlCellModel);
        expect(model.get("value")).toEqual(undefined);
    });

    it("should be creatable with a value", () => {
        const state = { value: "" };
        const model = createTestModel(SqlCellModel, state);
        expect(model).toBeInstanceOf(SqlCellModel);
        expect(model.get("value")).toEqual("");
    });
});
