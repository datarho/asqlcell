import { createContext, useContext, useEffect, useState, DependencyList } from 'react';
import { WidgetModel } from '@jupyter-widgets/base';
import {WidgetModelState} from "../widget"
export const WidgetModelContext = createContext<WidgetModel | undefined>(
  undefined
);


// TYPES AND INTERFACES
//============================================================================================


interface ModelCallback {
  (model: WidgetModel, event: Backbone.EventHandler): void;
}

// HOOKS
//============================================================================================

/**
 *
 * @param name property name in the Python model object.
 * @returns model state and set state function.
 */
 export function useModelState<T extends keyof WidgetModelState>(
  name: T
): [WidgetModelState[T], (val: WidgetModelState[T], options?: any) => void] {
  const model = useModel();
  const [state, setState] = useState<WidgetModelState[T]>(model?.get(name));

  useModelEvent(
    `change:${name}`,
    (model) => {
      setState(model.get(name));
    },
    [name]
  );

  function updateModel(val: WidgetModelState[T], options?: any) {
    model?.set(name, val, options);
    model?.save_changes();
  }

  return [state, updateModel];
}

/**
 * Subscribes a listener to the model event loop.
 * @param event String identifier of the event that will trigger the callback.
 * @param callback Action to perform when event happens.
 * @param deps Dependencies that should be kept up to date within the callback.
 */
export function useModelEvent(
  event: string,
  callback: ModelCallback,
  deps?: DependencyList | undefined
) {
  const model = useModel();

  const dependencies = deps === undefined ? [model] : [...deps, model];
  useEffect(() => {
    const callbackWrapper = (e: Backbone.EventHandler) =>
      model && callback(model, e);
    model?.on(event, callbackWrapper);
    return () => void model?.unbind(event, callbackWrapper);
  }, dependencies);
}

/**
 * An escape hatch in case you want full access to the model.
 * @returns Python model
 */
export function useModel() {
  return useContext(WidgetModelContext);
}
