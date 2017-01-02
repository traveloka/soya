import React from 'react';

// We can use webpack's localized CSS/SCSS to ensure there is no naming clash
// between our components.
import style from './PhotoCaption.mod.scss';

export default class PhotoCaption extends React.Component {
  render() {
    return <div className={style.container}>
      <div className={style.image} style={{width: (this.props.width + 22) + 'px'}}>
        <img src={this.props.url} />
        <span className={style.imageCaption}>{this.props.caption}</span>
      </div>
    </div>;
  }
}