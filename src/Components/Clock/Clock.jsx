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

      const hour = {
        "24h": now.getHours().toString().padStart(2, "0"),
        "12h":
          now.getHours() > 12
            ? (now.getHours() - 12).toString().padStart(2, "0")
            : now.getHours().toString().padStart(2, "0"),
      };
      const minute = now.getMinutes().toString().padStart(2, "0");
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
            <div
              className="hour"
              style={{
                borderRight:
                  settings.Clock["Format"] === "both" &&
                  "1px solid var(--vibrantRgb)",
              }}
            >
              {(() => {
                switch (settings.Clock["Format"]) {
                  case "24h":
                    return hour["24h"];
                  case "12h":
                    return hour["12h"];
                  case "both":
                    return (
                      <>
                        <div className="12h">{hour["12h"]}</div>
                        <div
                          style={{ borderTop: "1px solid var(--vibrantRgb)" }}
                        />
                        <div className="24h">{hour["24h"]}</div>
                      </>
                    );
                  default:
                    break;
                }
              })()}
            </div>

            {settings.Clock["Format"] !== "both" && ":"}

            <div className="minute">
              {minute}
              {/(12h)|(both)/.test(settings.Clock["Format"]) && (
                <span className="ampm">{hour < 12 ? "AM" : "PM"}</span>
              )}
            </div>
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
