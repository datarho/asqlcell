import React from 'react';
import { WidgetModel } from '@jupyter-widgets/base';
import { useModelState, WidgetModelContext } from './hooks/widget-model';

interface WidgetProps {
  model: WidgetModel;
}

function ReactWidget(props: WidgetProps) {
  const [name, setName] = useModelState('value');
  const inputStyle = {
    padding: '7px',
    background: 'whitesmoke',
    border: '1px solid gray',
    borderRadius: '4px',
  }

  return (
    <div className="Widget">
      <h1>Hello {name}</h1>
      <input
        style={inputStyle}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </div>
  );
}

function withModelContext(Component: (props: WidgetProps) => JSX.Element) {
  return (props: WidgetProps) => (
    <WidgetModelContext.Provider value={props.model}>
      <Component {...props} />
    </WidgetModelContext.Provider>
  );
}

export default withModelContext(ReactWidget);
