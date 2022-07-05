import React from "react";
import "./Clock.css";

export default class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hour: 0,
      minute: 0,
      date: null,
    };
    this.mainDiv = React.createRef();
  }

  componentDidMount() {
    const setTime = () => {
      const now = new Date();

      const hour = now.getHours();
      const minute = now.getMinutes();
      const day = now.toLocaleDateString(undefined, { weekday: "long" });
      const date = now.toLocaleDateString(undefined, {
        month: "long",
        day: "2-digit",
      });

      this.setState({
        hour: hour,
        minute: minute,
        day: day,
        date: date,
      });
    };

    setTime();

    this.setTimeInterval = setInterval(() => {
      setTime();
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.setTimeInterval);
  }

  render() {
    const { hour, minute, day, date } = this.state;
    const settings = this.props.settings;
    return (
      <>
        <div
          className="Clock container"
          ref={this.mainDiv}
          style={{
            justifyContent: settings.Clock["Show Date"] === "no" && "center",
          }}
        >
          <div className="time">
            <div className="hour">
              {settings.Clock["Format"] === "12h" && hour > 12
                ? hour - 12
                : hour}
            </div>

            <div className="minute">:{minute.toString().padStart(2, "0")}</div>

            {settings.Clock["Format"] === "12h" && (
              <div className="ampm">{hour < 12 ? "AM" : "PM"}</div>
            )}
          </div>

          {settings.Clock["Show Date"] === "yes" && (
            <div className="dayDate">
              <div className="day">{day}</div>
              <div className="date" children={date} />
            </div>
          )}
        </div>
      </>
    );
  }
}
