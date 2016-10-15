import React from 'react';

import style from './cmpt.mod.css';

/**
 * @CLIENT_SERVER
 */
export default class ComponentListItem extends React.Component {
  _boundExpandToggleFunction;
  _contactLink;

  componentWillMount() {
    this.setState({
      expand: false
    });
    this._boundExpandToggleFunction = this.toggleExpandDisplay.bind(this);
  }

  toggleExpandDisplay(event) {
    if (event.target === this._contactLink) return;
    this.setState({
      expand: !this.state.expand
    });
  }

  // TODO: Make contact link configurable, slack ID, perhaps?
  render() {
    var SampleComponent = this.props.data.thumbnail;
    var DocComponent = this.props.data.doc;
    var docs = null;
    if (DocComponent) {
      docs = <div className={style.componentDescription}>
          <DocComponent />
        </div>;
    }

    return <div className={style.componentListItem + ' ' + (this.state.expand ? '' : style.shrunk)}>
      <div className={style.componentListItemTitle} onClick={this._boundExpandToggleFunction}>
        <h4><a ref={(a) => this._contactLink = a} href={'mailto:' + this.props.data.detail.author.email}>{this.props.data.detail.author.name}</a></h4>
        <h2>{this.props.data.detail.label}</h2>
        <h3>{this.props.data.detail.vendor}.{this.props.data.detail.name}</h3>
      </div>
      <div className={style.componentThumbnail}>
        <SampleComponent context={this.props.context} />
      </div>
      {docs}
      <div className={style.componentDescription}>
        <div>
          <h3>Code</h3>
          <pre className={style.componentThumbnailCode} dangerouslySetInnerHTML={{__html: this.props.data.code}} />
        </div>
      </div>
    </div>;
  }
}