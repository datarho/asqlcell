// Add any needed widget imports here (or from controls)
// import {} from "@jupyter-widgets/base";

import { ExampleModel } from "..";
import { createTestModel } from "./utils";

describe("Example", () => {
    describe("ExampleModel", () => {
        it("should be createable", () => {
            const model = createTestModel(ExampleModel);
            expect(model).toBeInstanceOf(ExampleModel);
            expect(model.get("value")).toEqual("Hello World");
        });

        it("should be createable with a value", () => {
            const state = { value: "Foo Bar!" };
            const model = createTestModel(ExampleModel, state);
            expect(model).toBeInstanceOf(ExampleModel);
            expect(model.get("value")).toEqual("Foo Bar!");
        });
    });
});
