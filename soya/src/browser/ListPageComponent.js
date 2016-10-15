import React from 'react';

import ComponentListItem from './ComponentListItem.js';
import style from './cmpt.mod.css';

/**
 * @CLIENT_SERVER
 */
export default class Component extends React.Component {
  render() {
    var componentMap = this.props.componentMap;
    var vendor, componentName, componentList = [], category, categoryLinks = [], categories = {};
    for (vendor in componentMap) {
      for (componentName in componentMap[vendor]) {
        category = componentMap[vendor][componentName].detail.category;
        componentList.push(<ComponentListItem context={this.props.context} data={componentMap[vendor][componentName]} />);
        if (!categories.hasOwnProperty(category)) {
          categories[category] = true;
          categoryLinks.push(<a href="javascript:void(0)">{category}</a>);
        }
      }
    }
    return <div className={style.cbrowser}>
      <nav>
        <h1>Soya Component Browser</h1>
        <h3>{componentList.length} Components Loaded</h3>
        <input type="text" placeholder="Search Components" />
      </nav>
      <div className={style.header}>
        <h3>Viewing all components</h3>
      </div>
      <div className={style.categoryList}>
        <h3>Categories</h3>
        <a href="javascript:void(0)">Show All</a>
        {categoryLinks}
      </div>
      <div className={style.componentList}>
        {componentList}
      </div>
    </div>;
  }
}