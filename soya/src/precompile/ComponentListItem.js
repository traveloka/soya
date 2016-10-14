import React from 'react';

import style from './cmpt.mod.css';

/**
 * @CLIENT_SERVER
 */
export default class ComponentListItem extends React.Component {
  render() {
    var SampleComponent = this.props.data.component;
    return <div className={style.componentListItem}>
      <div className={style.componentListItemTitle}>
        {this.props.data.detail.vendor}.{this.props.data.detail.name}
      </div>
      <div className={style.componentThumbnail}>
        <SampleComponent context={this.props.context} />
      </div>
      <div className={style.componentThumbnailDetail}>
        Component: {this.props.data.detail.name}<br />
        Author: {this.props.data.detail.author}
      </div>
    </div>;
  }
}