import React from 'react';
import ReactDOM from 'react-dom';
import IntlMessageFormat from 'intl-messageformat';
import connect from 'soya/lib/data/redux/connect';
import ContentResourceSegment from '../segments/ContentResourceSegment';

class ContentResource extends React.Component {
  static displayName = 'SoyaContentResource';

  static connectId() {
    return ContentResource.displayName;
  }

  static getSegmentDependencies() {
    return [ContentResourceSegment];
  }

  static subscribeQueries(nextProps, subscribe) {
    subscribe(ContentResourceSegment.id(), {
      locale: nextProps.context.locale.locale,
      name: nextProps.crName,
      entryKey: nextProps.entryKey,
      param: nextProps.param,
    }, 'cr');
  }

  static propTypes = {
    component: React.PropTypes.any,
    renderProp: React.PropTypes.string,
    crName: React.PropTypes.string.isRequired,
    entryKey: React.PropTypes.string.isRequired,
    param: React.PropTypes.object,
    result: React.PropTypes.shape({
      cr: React.PropTypes.string,
    }),
  };

  static defaultProps = {
    component: 'span',
    renderProp: 'children',
    param: null,
  };

  constructor(props, context) {
    super(props, context);
    this._inspect = props.context.cookieJar.read('allowExpandResource');
  };

  componentDidMount() {
    this.inspect();
  }

  componentDidUpdate() {
    this.inspect();
  }

  inspect() {
    if (this.props.result.cr && this._inspect) {
      const node = ReactDOM.findDOMNode(this);
      const { language, country } = this.props.context.locale;
      node.setAttribute('data-tvxr', 'content');
      node.setAttribute('data-tvxr-resource', this.props.crName);
      node.setAttribute('data-tvxr-entry', this.props.entryKey);
      node.setAttribute('data-tvxr-language', language);
      node.setAttribute('data-tvxr-country', country);
    }
  }

  render() {
    const {
      component: Component,
      renderProp,
      entryKey,
      crName,
      param,
      result,
      ...props,
    } = this.props;
    delete props.context;
    delete props.getActionCreator;
    delete props.getConfig;
    delete props.getReduxStore;
    let content = null;
    if (result.cr) {
      try {
        content = new IntlMessageFormat(result.cr).format(param);
      } catch (e) {
        content = result.cr;
      }
    }
    if (renderProp === 'dangerouslySetInnerHTML') {
      content = { __html: content };
    }
    props[renderProp] = content;

    return (
      <Component {...props} />
    );
  }
}

export default connect(ContentResource);
