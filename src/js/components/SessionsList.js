import React, { Component } from 'react';
import { filter, groupBy } from 'lodash';
import SessionItem from './SessionItem';

const MINUTE = 60000;

function betweenDates(begin, end) {
  return date => date > begin && date < end;
}

class TotalTime extends Component {
  constructor() {
    super();

    this.timeout = null;

    this.state = {
      isCurrent: false,
      minutes: 0,
    };

    this.updateMinutes = this.updateMinutes.bind(this);
    this.clear = this.clear.bind(this);
  }

  componentWillMount() {
    const { sessions } = this.props;
    this.updateMinutes(sessions);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.sessions.length !== nextProps.sessions.length) {
      this.updateMinutes(nextProps.sessions);
    }
  }

  componentWillUnmount() {
    this.clear();
  }

  clear() {
    clearInterval(this.timeout);
    this.timeout = null;
  }

  updateMinutes(sessions) {
    const now = Date.now();
    let foundCurrent = false;

    const sessionsAmount = sessions.reduce((acc, cur) => {
      const { date, duration } = cur;
      const dateEnd = date + duration;
      const sessionCheck = betweenDates(date, dateEnd);
      const current = sessionCheck(now);

      if (current) {
        foundCurrent = true;
        if (!this.state.isCurrent) {
          this.setState({ isCurrent: true });
          this.timeout = setInterval(() => {
            this.updateMinutes(sessions);
          }, MINUTE / 6);
        }
        return acc + (now - date);
      }

      if (this.state.isCurrent && !foundCurrent) {
        this.clear();
        this.setState({
          isCurrent: false,
        });
      }

      return acc + cur.duration;
    }, 0);

    this.setState({ minutes: Math.ceil(sessionsAmount / MINUTE) });
  }

  render() {
    return <span>{this.state.minutes}</span>
  }
}

export default class SessionsList extends Component {
  shouldComponentUpdate(nextProps) {
    const { todos, sessions } = this.props;
    return todos !== nextProps.todos || sessions !== nextProps.sessions;
  }
  render() {
    const { sessions, todos } = this.props;
    const startedTodos = filter(todos, todo => todo.workingOn || todo.completed);
    const now = Date.now();

    const dateNow = new Date();
    const midnight = dateNow.setHours(0, 0, 0, 0);

    const sessionDays = groupBy(sessions, (session) => {
      const dateDayRoundDown = new Date(session.date);
      return dateDayRoundDown.setHours(0, 0, 0, 0);
    });

    const sessionDayKeys = Object.keys(sessionDays);
    let sessionCount = '';
    let sessionAmount = '';
    let sessionsToday = [];

    if (
      sessionDayKeys.length > 0
      && parseInt(sessionDayKeys[sessionDayKeys.length - 1]) === midnight
      && sessionDays[sessionDayKeys[sessionDayKeys.length - 1]].length > 0
    ) {
      sessionsToday = sessionDays[sessionDayKeys[sessionDayKeys.length - 1]];
      sessionCount = sessionsToday.length;
      sessionAmount = sessionsToday.reduce((acc, cur) => {
        return acc + cur.duration;
      }, 0);
    }

    return (
      <div id="sessions-container">
        <h5>
          WORK LOG
          {sessionCount && <span>({sessionCount})</span>}
          {sessionsToday.length > 0 && <TotalTime sessions={sessionsToday} />}
        </h5>
        <ul id="sessions-list">
          {
            sessionDayKeys.reverse().map((day) => {
              const sessionsItems = sessionDays[day].reverse().map((session) => {
                const { date, duration, distractions } = session;
                const dateEnd = date + duration;
                const sessionCheck = betweenDates(date, dateEnd);
                const current = sessionCheck(now);

                const working = filter(startedTodos, (todo) => {
                  const { workingOn, completed } = todo;

                  return (
                    !!workingOn
                    && workingOn < dateEnd
                    && (completed ? completed > dateEnd : true));
                });

                const finished = filter(startedTodos, (todo) => {
                  const { completed } = todo;
                  return sessionCheck(completed);
                });

                return (
                  <SessionItem
                    key={date}
                    current={current}
                    date={date}
                    dateEnd={dateEnd}
                    distractions={distractions}
                    working={working}
                    finished={finished}
                  />
                );
              });

              if (parseInt(day) === midnight) {
                return [...sessionsItems];
              }
            })
          }
        </ul>
      </div>
    );
  }
}
