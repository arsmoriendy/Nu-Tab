import React from "react";
import Separator from "../Separator";
import "./WallpaperMeta.css";

export default class WallpaperMeta extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  downloadText = () => {
    switch (this.state.imageDownload) {
      case undefined:
        return "Download Image";
      case "started":
        return "Downloading Image";
      case "finished":
        return "Image Downloaded";
      case "failed":
        return "Download Failed";
      default:
        return;
    }
  };

  render() {
    const bgColors = this.props.bgColors;
    const bgMeta = this.props.bgMeta;

    const socials = [];
    for (const key in bgMeta.user.social) {
      if (bgMeta.user.social[key]) {
        switch (key) {
          case "instagram_username":
            socials.push(
              <a
                className="instagram icon"
                href={`https://instagram.com/${bgMeta.user.social[key]}`}
                key={key}
              >
                &#xf16d;
              </a>
            );
            break;
          case "portfolio_url":
            socials.push(
              <a
                style={{ fontFamily: "Iosveka" }}
                className="portfolio icon"
                href={`${bgMeta.user.social[key]}`}
                key={key}
              >
                &#xfa9e;
              </a>
            );
            break;
          case "twitter_username":
            socials.push(
              <a
                className="twitter icon"
                href={`https://twitter.com/${bgMeta.user.social[key]}`}
                key={key}
              >
                &#xf099;
              </a>
            );
            break;
          default:
            break;
        }
      }
    }

    return (
      <div className="WallpaperMeta container">
        <div className="content">
          <div className="header tag">Image Meta</div>

          <div className="unsplashAttr value">
            Powered by{" "}
            <a href="https://unsplash.com">
              <span className="unsplash icon">&#xe07c; </span>Unsplash
            </a>
          </div>

          <Separator />

          <div className="bgAuthor tag">Author</div>
          <div className="bgAuthor value">
            <img
              src={
                bgMeta.user.profile_image[
                  this.state.dpHover ? "large" : "small"
                ]
              }
              className="profile skeletonLoading"
              onMouseEnter={() => this.setState({ dpHover: true })}
              onMouseLeave={() => this.setState({ dpHover: false })}
              alt=""
            />
            <a
              className="bgAuthor name"
              href={`${bgMeta.user.links.html}/?utm_source=New_Tab&utm_medium=referral`}
              style={{ gridRow: !socials.length && "span 2" }}
            >
              {bgMeta.user.name}
            </a>
            <div className="bgAuthor socials">{socials}</div>
          </div>

          {bgMeta.location.title &&
            (() => {
              const title = bgMeta.location.title.includes(",")
                ? bgMeta.location.title.slice(
                    0,
                    bgMeta.location.title.indexOf(",")
                  )
                : bgMeta.location.title;
              if (
                title !== bgMeta.location.city &&
                title !== bgMeta.location.country
              ) {
                return (
                  <>
                    <div className="bgLocation tag title">Location</div>
                    <div className="bgLocation value title">{title}</div>
                  </>
                );
              }
            })()}
          {bgMeta.location.city && (
            <>
              <div className="bgLocation tag city">City</div>
              <div className="bgLocation value city">
                {bgMeta.location.city}
              </div>
            </>
          )}
          {bgMeta.location.country && (
            <>
              <div className="bgLocation tag country">Country</div>
              <div className="bgLocation value country">
                {bgMeta.location.country}
              </div>
            </>
          )}

          <div className="bgColorsContainer value">
            {bgColors.colors.map((color, index) => (
              <div
                className="bgColor"
                style={{ backgroundColor: color.hex }}
                key={index}
              />
            ))}
            {Object.values(bgColors.dominant_colors).map((color, index) => (
              <div
                className="bgColor"
                style={{ backgroundColor: color.hex }}
                key={index}
              />
            ))}
          </div>
        </div>

        <div className="buttons">
          <button
            className={`button1 downloadBgButton ${
              this.state.imageDownload === "started" ? "loading" : ""
            }`}
            onClick={() => {
              //Sends mandatory download fetch to unsplash
              fetch("http://arsmoriendy.duckdns.org/api/unsplash/download", {
                method: "POST",
                headers: {
                  Authorization: "Basic arsmoriendy",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  id: bgMeta.id,
                  ixid: bgMeta.links.download_location.slice(
                    bgMeta.links.download_location.indexOf("?") + 6
                  ),
                }),
              });

              this.setState({ imageDownload: "started" });

              //Fetches raw background image and then downloads it
              fetch(bgMeta.urls.raw)
                .then((res) => res.blob())
                .then((blob) => {
                  const url = URL.createObjectURL(blob);

                  const a = document.createElement("a");
                  a.style.display = "none";
                  a.download = `${bgMeta.user.username}-${bgMeta.id}`;
                  a.href = url;

                  document.body.appendChild(a);
                  a.click();
                  URL.revokeObjectURL(url);

                  this.setState({ imageDownload: "finished" });
                })
                .catch((err) => {
                  console.log(err);
                  this.setState({ imageDownload: "failed" });
                });
            }}
          >
            {`${this.downloadText()}`}
          </button>
          <a className="button1 link icon" href={bgMeta.links.html}>
            &#xf0c1;
          </a>
        </div>
      </div>
    );
  }
}
