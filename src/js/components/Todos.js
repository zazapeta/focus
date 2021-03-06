import React, { Component } from 'react';
import Dragula from 'react-dragula';
import { groupBy, orderBy } from 'lodash';
import Todo from './Todo';
import FocusInput from './FocusInput';

export default class SessionsList extends Component {
  constructor(props) {
    super(props)
    this.dragulaDecorator = this.dragulaDecorator.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.todos !== nextProps.todos;
  }

  dragulaDecorator(node) {
    const { updateTodoOrder } = this.props
    if (node) {
      const options = { };
      Dragula([node], options).on('drop', (el, target) => {
        const listItems = target.getElementsByTagName('li');
        let listIds = [];
        for (let i = 0; i < listItems.length; i++) {
          listIds.push(listItems[i].id);
        }
        updateTodoOrder(listIds);
      });
    }
  }

  render() {
    const { todos, toggleTodoCompletion, removeTodo, toggleTodoEdit, addTodo } = this.props;
    const groupedByCompleted = groupBy(todos, todo => !!todo.completed);
    const groupedByStarted = groupBy(groupedByCompleted.false, todo => !!todo.workingOn);

    return (
      <div id="todos-container">
        <h5>TODOS</h5>

        <FocusInput addTodo={addTodo} placeholder="Add a Todo" />

        {groupedByStarted.true && <ul className="todos" ref={this.dragulaDecorator}>
          {orderBy(groupedByStarted.true, ['order'], ['asc']).map(todo =>
            <Todo key={todo.id} todo={todo} {...this.props} draggable={groupedByStarted.true.length > 1} />)
          }
        </ul>}

        {groupedByStarted.false && <ul className="todos" ref={this.dragulaDecorator}>
          {orderBy(groupedByStarted.false, ['order'], ['asc']).map(todo =>
            <Todo key={todo.id} todo={todo} {...this.props} draggable={groupedByStarted.false.length > 1} />)
          }
        </ul>}

        {groupedByCompleted.true && <ul className="todos">
          {groupedByCompleted.true.map(todo =>
            <Todo key={todo.id} todo={todo} {...this.props} draggable={false} />)
          }
        </ul>}
      </div>
    );
  }
}
