import React from "react";
import "./App.css";
import dataURItoBlob from "./third_party/dataURItoBlob";
import WallpaperMeta from "./Components/WallpaperMeta/WallpaperMeta";
import Clock from "./Components/Clock/Clock";
import Settings from "./Components/Settings/Settings";
import Notifications from "./Components/Notifications/Notifications";
import TwitchFollowList from "./Components/TwitchFollowList/TwitchFollowList";
import getApi from "./getApi.js";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      client_id: getApi("Unsplash"),
      settings: localStorage["settings"]
        ? JSON.parse(localStorage["settings"])
        : {
            componentList: ["WallpaperMeta", "TwitchFollowList", "Clock"],
            Clock: {
              Format: "12h",
              "Show Date": "yes",
              Extras: { "AM/PM": true, seconds: false },
            },
            TwitchFollowList: {
              id: "",
              at: "",
              authorized: false,
              Interval: 5000,
            },
          },
      bgMeta: localStorage["bgMeta"] && JSON.parse(localStorage["bgMeta"]),
      bgColors:
        localStorage["bgColors"] && JSON.parse(localStorage["bgColors"]),
      done: false,
    };
    this.Notifications = React.createRef();
  }

  componentDidMount() {
    (async () => {
      const apiFetch = await fetch(
        `https://api.unsplash.com/photos/random?topics=bo8jQKTaE0Y&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${this.state.client_id}` } }
      );
      const bgMeta = await apiFetch.json();

      const vw = Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0
      );

      const vh = Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0
      );

      const bgUrl = `${bgMeta.urls.raw}&fit=crop&cs=tinysrgb&w=${vw}&h=${vh}`;
      const bgColorsFetch = await fetch(`${bgUrl}&palette=json`);
      const bgColors = await bgColorsFetch.json();

      const bgFetch = await fetch(bgUrl);
      const bgImg = await bgFetch.blob();

      const reader = new FileReader();
      reader.onload = (e) => {
        localStorage["bgImg"] = e.target.result;
        localStorage["bgMeta"] = JSON.stringify(bgMeta);
        localStorage["bgColors"] = JSON.stringify(bgColors);
      };
      reader.readAsDataURL(bgImg);

      this.setState({ done: true });
      this.Notifications.current.notify(
        "pass",
        "Finished fetching next background image"
      );
    })();

    //Check for localstorage // initialize
    if (!localStorage["bgImg"] || !localStorage["settings"]) {
      localStorage["settings"] = JSON.stringify(this.state.settings);
      this.Notifications.current.notify(
        "warning",
        "Fetching background image...",
        "presist",
        "initialize download"
      );

      const interval = setInterval(() => {
        if (this.state.done) {
          clearInterval(interval);
          this.Notifications.current.removeNotification("initialize download");
          window.location.reload();
        }
      }, 100);
    } else {
      //Set bgImg
      const bgImg = URL.createObjectURL(dataURItoBlob(localStorage["bgImg"]));
      document
        .querySelector("#background")
        .style.setProperty("background-image", `url(${bgImg})`);

      const blur = document.createElement("div");
      blur.setAttribute("id", "blur");
      blur.style.setProperty("background-image", `url(${bgImg})`);
      document.body.querySelector(".App").appendChild(blur);

      //Set color vairables
      const dominantColors = JSON.parse(
        localStorage["bgColors"]
      ).dominant_colors;

      if (dominantColors.muted_dark && dominantColors.vibrant_light) {
        const vibrant_light = `${dominantColors.vibrant_light.red * 255}, ${
          dominantColors.vibrant_light.green * 255
        }, ${dominantColors.vibrant_light.blue * 255}`;

        const muted_dark = `${dominantColors.muted_dark.red * 255}, ${
          dominantColors.muted_dark.green * 255
        }, ${dominantColors.muted_dark.blue * 255}`;

        document.body.style.setProperty("--vibrant", vibrant_light);
        document.body.style.setProperty("--muted", muted_dark);
      }
    }
  }

  addComponent = (componentName) => {
    if (this.state.settings.componentList.includes(componentName)) {
      this.Notifications.current.notify("error", "Component already exists!");
    } else {
      this.setState((s) => {
        const settings = JSON.parse(JSON.stringify(s.settings));
        settings.componentList.push(componentName);
        localStorage["settings"] = JSON.stringify(settings);
        return { settings: settings };
      });
    }
  };

  removeComponent = (componentName) => {
    this.setState((s) => {
      const settings = JSON.parse(JSON.stringify(s.settings));
      settings.componentList = settings.componentList.filter(
        (comp) => comp !== componentName
      );
      localStorage["settings"] = JSON.stringify(settings);
      return { settings: settings };
    });
  };

  renderComponents() {
    let componentList = [];
    this.state.settings.componentList.forEach((comp) => {
      const key = this.state.settings.componentList.indexOf(comp);
      switch (comp) {
        case "WallpaperMeta":
          componentList.push(
            <WallpaperMeta
              bgMeta={this.state.bgMeta}
              bgColors={this.state.bgColors}
              client_id={this.state.client_id}
              key={key}
            />
          );
          break;

        case "Clock":
          componentList.push(
            <Clock settings={this.state.settings} key={key} />
          );
          break;

        case "TwitchFollowList":
          componentList.push(
            <TwitchFollowList
              settings={this.state.settings}
              notify={(type, content, timeout, key) =>
                this.notify(type, content, timeout, key)
              }
              updateSettings={(settings) =>
                this.setState({ settings: settings })
              }
              key={key}
            />
          );
          break;

        default:
          break;
      }
    });
    return componentList;
  }

  notify = (type, content, timeout, key) => {
    this.Notifications.current.notify(type, content, timeout, key);
  };
  removeNotification = (key) => [
    this.Notifications.current.removeNotification(key),
  ];

  render() {
    return (
      <div className="App">
        <div id="background" />
        <Settings
          settings={this.state.settings}
          updateSettings={(settings) => this.setState({ settings: settings })}
          componentList={this.state.settings.componentList}
          addComponent={(componentName) => this.addComponent(componentName)}
          removeComponent={(componentName) =>
            this.removeComponent(componentName)
          }
        />
        <Notifications ref={this.Notifications} />

        <div className="componentList">
          {localStorage["bgImg"] && <>{this.renderComponents()}</>}
        </div>
      </div>
    );
  }
}
