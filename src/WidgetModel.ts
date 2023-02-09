import * as widgets from "@jupyter-widgets/base";
import React from "react";
import ReactDOM from "react-dom";
import ReactWidget from "./WidgetView";
import "../css/widget.css";

import { MODULE_NAME, MODULE_VERSION } from "./version";
import { DOMWidgetView } from "@jupyter-widgets/base";

const defaultModelProperties = {
    value: "",
    output: "sqlcelldf",
    event: "",
    data_range: [0, 0],
    dfs_button: "",
    data: "",
    error: "",
    show: undefined,
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
            value: "",
            output: "sqlcelldf",
            event: undefined,
            data_range: undefined,
            dfs_button: undefined,
            data: undefined,
            error: undefined,
            show: undefined,
        };
    }

    initialize(attributes: any, options: any) {
        super.initialize(attributes, options);
        this.on("msg:custom", this.handle_custom_messages, this);
        this.on("change:output", this.handle_update_messages, this);
    }

    handle_custom_messages(msg: any) {
        if (msg.includes("\"iscommand\": true")) {
            this.trigger("show", false)
        }
        else if (msg.includes("\"iscommand\": false")) {
            this.trigger("show", true)
        }

        if (msg.includes("__ERR:")) {
            this.trigger("error", msg)
        }
        else if (msg.includes("__ERT:")) {
            this.set("error", msg);
        }

        if (msg.includes("__DFS:")) {
            this.trigger("dataframe", msg)
        }

        if (msg.includes("__DFM:")) {
            // set data into widget 
            this.trigger("data_message", msg);
        }
        else if (msg.includes("__DFT:")) {
            // store data before into widgetview
            this.set("data", msg.slice(6, msg.length));

            // set data into widget 
            this.trigger("data_message", msg);
        }

        if (msg.includes("__JSD:")) {
            this.trigger("hist", msg.slice(6, msg.length));
        }
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