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

      const h = now.getHours();
      const hour = {
        raw: h,
        "24h": h.toString().padStart(2, "0"),
        "12h":
          h > 12
            ? (h - 12).toString().padStart(2, "0")
            : h.toString().padStart(2, "0"),
      };
      const minute = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      const day = now
        .toLocaleDateString(undefined, { weekday: "short" })
        .toUpperCase();
      const date = now.toLocaleDateString(undefined, {
        day: "2-digit",
      });
      const month = now
        .toLocaleDateString(undefined, { month: "short" })
        .toUpperCase();

      this.setState({
        hour: hour,
        minute: minute,
        seconds: seconds,
        day: day,
        date: date,
        month: month,
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
    const { hour, minute, seconds, day, date, month } = this.state;
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
              {(() => {
                switch (settings.Clock["Format"]) {
                  case "24h":
                    return <span>{hour["24h"]}</span>;
                  case "12h":
                    return <span>{hour["12h"]}</span>;
                  default:
                    break;
                }
              })()}
            </div>

            <span
              style={{ opacity: seconds % 2 === 0 ? "1" : "var(--opacity)" }}
            >
              :
            </span>

            <div className="minute">{minute}</div>
            <div className="extras">
              {settings.Clock["Extras"]["AM/PM"] && (
                <span className="ampm">{hour["raw"] < 12 ? "AM" : "PM"}</span>
              )}
              {settings.Clock["Extras"]["seconds"] && (
                <div className="seconds">{seconds}</div>
              )}
            </div>
          </div>

          {settings.Clock["Show Date"] === "yes" && (
            <div className="dayDate">
              <div className="day">{day}</div>
              <div>
                <span className="date">{date}</span>-
                <span className="month">{month}</span>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
}
