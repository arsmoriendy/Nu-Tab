import React from "react";
import Separator from "../Separator";
import "./TwitchFollowList.css";
import getApi from "../../getApi.js";

export default class TwitchFollowList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clientId: getApi("Twitch"),
      followList: [],
    };
  }

  componentDidMount() {
    if (localStorage["twitchApiState"]) {
      this.checkAuthorize();
    }

    this.forceUpdate();
  }

  componentDidUpdate(p) {
    const twitchSettings = this.props.settings.TwitchFollowList;
    if (twitchSettings.authorized) {
      if (
        p.settings.TwitchFollowList.authorized !== twitchSettings.authorized
      ) {
        this.fetchLoginId();
      }

      //on interval setting change start a new interval
      if (
        p.settings.TwitchFollowList.Interval !== twitchSettings.Interval ||
        !this.fetchFollowListInterval
      ) {
        clearInterval(this.fetchFollowListInterval);
        if (twitchSettings.id) {
          this.fetchFollowedList();
          this.fetchFollowListInterval = setInterval(() => {
            this.fetchFollowedList();
          }, twitchSettings.Interval);
        }
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.fetchFollowListInterval);
  }

  checkAuthorize() {
    const settings = JSON.parse(JSON.stringify(this.props.settings));
    const url = new URL(window.location.href);
    const urlHash = new URLSearchParams(url.hash.slice(1));

    if (
      urlHash !== "" &&
      urlHash.get("state") === localStorage["twitchApiState"]
    ) {
      settings.TwitchFollowList["at"] = urlHash.get("access_token");
      settings.TwitchFollowList.authorized = true;
      this.props.updateSettings(settings);
      localStorage["settings"] = JSON.stringify(settings);

      localStorage.removeItem("twitchApiState");
      this.props.notify("pass", "Authorization Succsesful");
    } else {
      settings.TwitchFollowList.authorized = false;
      this.props.updateSettings(settings);
      localStorage["settings"] = JSON.stringify(settings);

      localStorage.removeItem("twitchApiState");
      this.props.notify("error", "Authorization Failed", "presist");
    }
  }

  fetchLoginId = async () => {
    const settings = JSON.parse(JSON.stringify(this.props.settings));
    localStorage["settings"] = JSON.stringify(settings);

    const get = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${settings.TwitchFollowList["at"]}`,
        "Client-Id": this.state.clientId,
      },
    });
    const res = await get.json();
    if (res.error) {
      settings.TwitchFollowList.authorized = false;
      this.props.updateSettings(settings);
      localStorage["settings"] = JSON.stringify(settings);
    } else {
      settings.TwitchFollowList.id = res.data[0].id;
      this.props.updateSettings(settings);
      localStorage["settings"] = JSON.stringify(settings);
    }
  };

  fetchFollowedList = async () => {
    const settings = this.props.settings;
    const req = await fetch(
      `https://api.twitch.tv/helix/streams/followed?user_id=${this.props.settings.TwitchFollowList.id}`,
      {
        headers: {
          Authorization: `Bearer ${this.props.settings.TwitchFollowList["at"]}`,
          "Client-Id": this.state.clientId,
        },
      }
    );
    const res = await req.json();
    if (res.error) {
      settings.TwitchFollowList.authorized = false;
      this.props.updateSettings(settings);
      localStorage["settings"] = JSON.stringify(settings);
    } else {
      this.setState({
        followList: res.data,
      });
    }
  };

  render() {
    return (
      <div className="TwitchFollowList container">
        {this.props.settings.TwitchFollowList.authorized ? (
          <>
            <div className="tag header">Followed Channels</div>
            <Separator />
            <div className="list">
              {this.state.followList.length ? (
                <>
                  {this.state.followList.map((channel) => (
                    <a
                      href={`https://twitch.tv/${channel.user_login}`}
                      className="channel"
                      key={channel.user_login}
                      onMouseEnter={() =>
                        this.setState({
                          [channel.user_login + "Hovered"]: true,
                        })
                      }
                      onMouseLeave={() =>
                        this.setState({
                          [channel.user_login + "Hovered"]: false,
                        })
                      }
                    >
                      <div className="tag">
                        <div className="name">
                          {channel.user_name || channel.user_login}
                        </div>
                        <div className="gameName">{channel.game_name}</div>
                      </div>
                      <div className="value">
                        <div className="viewCount">
                          <span className="icon">&#xf007;</span>
                          {(() => {
                            const viewCount = channel.viewer_count.toString();
                            if (viewCount > 999) {
                              return (
                                <div>
                                  <span style={{ fontWeight: "bold" }}>
                                    {viewCount.slice(0, -3)}
                                  </span>
                                  <span>.{viewCount.slice(-3, -1)}k</span>
                                </div>
                              );
                            } else {
                              return viewCount;
                            }
                          })()}
                        </div>
                        <div className="duration">
                          <span className="icon">&#xf017;</span>
                          {(() => {
                            const st = new Date(channel.started_at);
                            const now = new Date();

                            let hours = now.getHours() - st.getHours();
                            let minutes = now.getMinutes() - st.getMinutes();
                            if (hours < 0) {
                              hours = hours + 24;
                            }
                            if (minutes < 0) {
                              hours = hours - 1;
                              minutes = minutes + 60;
                            }
                            return `${hours
                              .toString()
                              .padStart(2, "0")}:${minutes
                              .toString()
                              .padStart(2, "0")}`;
                          })()}
                        </div>
                      </div>
                      {this.state[channel.user_login + "Hovered"] && (
                        <div
                          className="thumbnail container"
                          style={{
                            left: (() => {
                              const parent = document.querySelector(
                                ".TwitchFollowList.container"
                              );
                              return `${
                                parent.offsetWidth + parent.offsetLeft + 30
                              }px`;
                            })(),
                          }}
                        >
                          <img
                            src={
                              channel.thumbnail_url
                                .replace("{width}", "320")
                                .replace("{height}", "180") +
                              `?dummy=${Math.random()}`
                            }
                            width={320}
                            height={180}
                            alt=""
                            className="skeletonLoading"
                          />
                          <div>{channel.title}</div>
                        </div>
                      )}
                    </a>
                  ))}
                </>
              ) : (
                <div className="empty">
                  No one is live
                  <img
                    src="https://cdn.frankerfacez.com/emoticon/425196/1"
                    alt="Sadge"
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div>Requires Twitch Authorization:</div>
            <button
              className="button1"
              onClick={() => {
                const authState = Math.random().toString().slice(2);
                localStorage["twitchApiState"] = authState;

                const authUrlParams = {
                  response_type: "token",
                  client_id: this.state.clientId,
                  redirect_uri: window.location.origin,
                  scope: encodeURIComponent("user:read:follows"),
                  state: authState,
                };

                let authUrl = "https://id.twitch.tv/oauth2/authorize?";
                for (const [key, value] of Object.entries(authUrlParams)) {
                  authUrl = authUrl + `${key}=${value}&`;
                }
                authUrl = authUrl.slice(0, -1);

                window.location.replace(authUrl);
              }}
            >
              Authorize
            </button>
          </>
        )}
      </div>
    );
  }
}
