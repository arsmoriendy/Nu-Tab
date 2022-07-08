import React from "react";
import "./Settings.css";
import Separator from "../Separator";

export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showSettings: false,
      settings: JSON.parse(JSON.stringify(this.props.settings)),
    };
  }

  toggleSettings = () => {
    this.setState((s) => ({
      showSettings: !s.showSettings,
    }));
  };

  radio = (format) => {
    const settings = JSON.parse(JSON.stringify(this.props.settings));

    const component = format.component;
    const tag = format.tag;
    const values = format.values;

    return (
      <React.Fragment key={component + tag}>
        <div className={`${tag} tag`}>{tag}</div>

        <div className={`${tag} value radio`}>
          {values.map((value) => (
            <button
              className={`button1 ${
                settings[component][tag] === value && "active"
              }`}
              onClick={() => {
                settings[component][tag] = value;
                this.props.updateSettings(settings);
                localStorage["settings"] = JSON.stringify(settings);
              }}
              key={component + tag + value}
            >
              {value}
            </button>
          ))}
        </div>
      </React.Fragment>
    );
  };

  numberInput = (format) => {
    const component = format.component;
    const tag = format.tag;

    const attributes = format.attributes;

    const min = attributes.min;
    const max = attributes.max;
    const step = attributes.step;
    const placeholder = attributes.placeholder;

    return (
      <React.Fragment key={component}>
        <div className="tag">{tag}</div>
        <div className="value numberInput">
          <input
            className="button1"
            type="number"
            min={min}
            max={max}
            step={step}
            value={this.state.settings[component][tag]}
            placeholder={placeholder}
            onChange={(e) => {
              const settings = JSON.parse(JSON.stringify(this.props.settings));
              settings[component][tag] = e.target.value;
              this.setState({
                settings: settings,
              });
            }}
          />
          <button
            className="button1 value"
            onClick={() => {
              this.props.updateSettings(this.state.settings);
              localStorage["settings"] = JSON.stringify(this.state.settings);
            }}
          >
            Submit
          </button>
        </div>
      </React.Fragment>
    );
  };

  renderSettings = () => {
    const settingTemplates = {
      Clock: [
        {
          radio: {
            component: "Clock",
            tag: "Format",
            values: ["24h", "12h", "both"],
          },
        },
        {
          radio: {
            component: "Clock",
            tag: "Show Date",
            values: ["yes", "no"],
          },
        },
      ],
      TwitchFollowList: [
        {
          numberInput: {
            component: "TwitchFollowList",
            tag: "Interval",
            attributes: {
              step: 500,
              placeholder: "milliseconds",
            },
          },
        },
      ],
    };

    const makeSetting = (template) => {
      return (
        <div className={`${template}Settings content`} key={template}>
          <div className="header tag" key={template + "section"}>
            {template}
          </div>
          <Separator />
          {settingTemplates[`${template}`].map((setting) => {
            const settingKey = Object.keys(setting)[0];
            return this[settingKey](setting[settingKey]);
          })}
        </div>
      );
    };

    return this.props.settings.componentList.map((component) => {
      if (component !== "WallpaperMeta") {
        return makeSetting(component);
      }
      return [];
    });
  };

  render() {
    return (
      <>
        <div className="settings">
          <button
            className="toggle button1"
            onClick={this.toggleSettings}
            style={{ opacity: this.state.showSettings && "1" }}
          >
            &#xf013;
          </button>

          {this.state.showSettings && (
            <>
              <div className="container containerR">
                {this.renderSettings()}

                <div className="content">
                  <div className="header tag">Misc</div>
                  <Separator />
                  <div className="Components tag">Components</div>
                  <div className="Components value radio">
                    <button
                      className="button1 add"
                      onClick={() => {
                        this.setState({
                          showAdd: true,
                        });
                      }}
                    >
                      add
                    </button>
                    <button
                      className="button1 remove"
                      onClick={() => {
                        this.setState({
                          showRemove: true,
                        });
                      }}
                    >
                      remove
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {this.state.showSettings && (
          <div
            className="modal"
            style={{ zIndex: 10 }}
            onClick={() => {
              this.setState({ showSettings: false, showAdd: false });
            }}
          />
        )}

        {this.state.showAdd && (
          <>
            <div className="addDialog container">
              <div className="header">Add Components</div>
              <Separator />
              <button
                className="button1"
                onClick={() => this.props.addComponent("WallpaperMeta")}
              >
                WallpaperMeta
              </button>
              <button
                className="button1"
                onClick={() => this.props.addComponent("Clock")}
              >
                Clock
              </button>
              <button
                className="button1"
                onClick={() => this.props.addComponent("TwitchFollowList")}
              >
                TwitchFollowList
              </button>
            </div>
            <div
              className="modal"
              style={{ zIndex: 12 }}
              onClick={() => {
                this.setState({ showAdd: false });
              }}
            />
          </>
        )}

        {this.state.showRemove && (
          <>
            <div className="addDialog container">
              <div className="header">Remove Components</div>
              <Separator />
              {this.props.componentList.map((comp) => (
                <button
                  className="button1"
                  onClick={() => {
                    this.props.removeComponent(comp);
                  }}
                  key={comp}
                >
                  {comp}
                </button>
              ))}
            </div>
            <div
              className="modal"
              style={{ zIndex: 12 }}
              onClick={() => {
                this.setState({ showRemove: false });
              }}
            />
          </>
        )}
      </>
    );
  }
}
