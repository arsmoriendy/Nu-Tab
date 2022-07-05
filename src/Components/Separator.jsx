import React from "react";

export default class Separator extends React.Component {
  constructor(props) {
    super(props);
    this.mainDiv = React.createRef();
    this.state = {
      separators: [],
    };
  }

  componentDidMount() {
    //Set separator width
    const parentWidth = this.mainDiv.current.parentNode.clientWidth;
    const separatorWidthPx = 10;
    const xTimes = parseInt(parentWidth / separatorWidthPx);
    const separators = [];

    let i = 0;
    while (i < xTimes) {
      separators.push(
        <div className="separator" key={i} style={{ width: separatorWidthPx }}>
          -
        </div>
      );
      i++;
    }

    this.setState({ separators: separators });
  }

  render() {
    return (
      <div className="separators" ref={this.mainDiv} style={this.props.style}>
        {this.state.separators}
      </div>
    );
  }
}
