import * as widgets from "@jupyter-widgets/base";
import React from "react";
import ReactDOM from "react-dom";
import ReactWidget from "./WidgetView";
import "../css/widget.css";
import { MODULE_NAME, MODULE_VERSION } from "./version";
import { DOMWidgetView } from "@jupyter-widgets/base";

const defaultModelProperties = {
    data_name: "",
    dfs_button: "",
    error: ["", ""],
    exec_time: "",
    output_var: "sqlcelldf",
    row_range: [0, 10],
    column_sort: ["", 0], // default value: ("",0), orientation:(-1,0,1)
    dfs_result: "",
    sql_button: "",
    mode: "",
    data_grid: "",
    data_sql: "",
    quickv_sql: "",
    quickv_data: "",
    vis_sql: ["", ""],
    vis_data: "",
    title_hist: "",
    cache: "{}",
}

export type WidgetModelState = typeof defaultModelProperties

export class SqlCellModel extends widgets.DOMWidgetModel {
    defaults = (): any => {
        return {
            ...super.defaults(),
            _model_name: SqlCellModel.model_name,
            _model_module: SqlCellModel.model_module,
            _model_module_version: SqlCellModel.model_module_version,
            _view_name: SqlCellModel.view_name,
            _view_module: SqlCellModel.view_module,
            _view_module_version: SqlCellModel.view_module_version,
            output_var: "sqlcelldf",
            row_range: undefined,
            column_sort: undefined,
            dfs_button: undefined,
            dfs_result: undefined,
            sql_button: undefined,
            mode: undefined,
            exec_time: "",
            data_grid: undefined,
            data_name: undefined,
            data_sql: undefined,
            error: undefined,
            quickv_sql: undefined,
            quickv_data: undefined,
            vis_sql: undefined,
            vis_data: undefined,
            title_hist: undefined,
            cache: undefined,
        };
    }

    initialize(attributes: any, options: any) {
        super.initialize(attributes, options);
        this.set("json_dump", new Date().toISOString());
        this.save_changes();
        // this.on("all", (msg) => { console.log(msg) })
        // this.on("change", (msg) => { console.log(msg) })
        this.on("change:output", this.handle_update_messages, this);
    }

    handle_update_messages(msg: any) {
        this.trigger("update_outputName", msg);
    }
    static serializers: widgets.ISerializers = {
        ...widgets.DOMWidgetModel.serializers,
        // Add any extra serializers here
    };

    static model_name = "SqlCellModel";
    static model_module = MODULE_NAME;
    static model_module_version = MODULE_VERSION;
    static view_name = "SqlCellView"; // Set to null if no view
    static view_module = MODULE_NAME; // Set to null if no view
    static view_module_version = MODULE_VERSION;
}

export class SqlCellView extends DOMWidgetView {
    render = (): void => {
        this.el.classList.add("custom-widget");

        const component = React.createElement(ReactWidget, {
            model: this.model,
        });
        ReactDOM.render(component, this.el);
    }
}