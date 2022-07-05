import React from "react";
import "./Notifications.css";

export default class Notifications extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
      currentKey: 0,
    };
  }

  notify = (type, content, timeout, key) => {
    this.setState(
      s => ({ currentKey: s.currentKey + 1 }),
      () => {
        const el = (
          <div
            className={`container notification ${type}`}
            children={content}
            key={key ? key : this.state.currentKey}
            onClick={() => {
              this.removeNotification(el.key);
            }}
          />
        );

        this.setState(s => ({
          notifications: [...s.notifications, el],
        }));

        if (timeout !== "presist") {
          setTimeout(() => {
            this.removeNotification(el.key);
          }, timeout || 5000);
        }
      }
    );
  };

  removeNotification = key => {
    this.setState(s => ({
      notifications: s.notifications.filter(value => value.key !== key),
    }));
  };

  render() {
    return <div className="Notifications">{this.state.notifications}</div>;
  }
}
