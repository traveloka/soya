import React from 'react';
import PropTypes from 'prop-types';
import at from 'soya/lib/scope';

import style from './style.mod.css';

export default class AutocompleteDisplay extends React.Component {
  static get propTypes() {
    return {
      placeholder: PropTypes.string
    };
  }

  componentWillMount() {
    this.onDocClick = this.handleDocClick.bind(this);
    if (at.client) document.addEventListener('click', this.onDocClick);
    this.setState({
      results: [],
      selectedIndex: 0
    });
  }

  componentWillUnmount() {
    if (at.client) document.removeEventListener('click', this.onDocClick);
  }

  render() {
    var i, item, selected, resultView, resultItemViews = [];
    if (this.state.results && this.state.results.length > 0) {
      for (i = 0; i < this.state.results.length; i++) {
        item = this.state.results[i];
        selected = this.state.selectedIndex == i ? style.selected : '';
        resultItemViews.push(
          <li key={item.value} className={selected}
              onMouseOver={this.handleMouseOver.bind(this, i)}
              onClick={this.select.bind(this, item)}>{item.label}</li>);
      }
    }

    if (resultItemViews.length > 0) {
      resultView = <ul className={style.results}>{resultItemViews}</ul>;
    }

    return <div className={style.inputContainer} ref={(ref) => this.container = ref}>
        <label>{this.props.label}</label>
        <input className={style.input} type="text" value={this.props.value}
          placeholder={this.props.placeholder} disabled={this.props.isDisabled}
          onKeyDown={this.handleListNav.bind(this)}
          onChange={this.handleChange.bind(this)}
          ref={(ref) => this.input = ref} />
        {resultView}
        {this.props.errorMessages.length > 0 ? <span>{this.props.errorMessages[0]}</span> : null}
      </div>;
  }

  search(val) {
    if (this.props.search) {
      return this.props.search(val, this.props.options);
    }
    var regex = new RegExp(`${val}`, 'i');
    return this.props.options.filter(function(item) {
      return regex.test(item.searchStr);
    });
  }

  handleListNav(event) {
    if (event.key == 'Tab') {
      this.closeResults();
    } else if (event.key == 'ArrowDown') {
      this.changeSelectedIndex(1);
      event.preventDefault();
    } else if (event.key == 'ArrowUp') {
      this.changeSelectedIndex(-1);
      event.preventDefault();
    } else if (event.key == 'Enter') {
      var value = '';
      if (this.state.results[this.state.selectedIndex]) {
        value = this.state.results[this.state.selectedIndex].value;
      }
      this.props.handleChange(value);
      this.setState({
        results: [],
        selectedIndex: 0
      });
    }
  }

  changeSelectedIndex(change) {
    var finalIndex = this.state.selectedIndex + change;
    if (finalIndex > this.state.results.length) finalIndex = this.state.results.length - 1;
    if (finalIndex < 0) finalIndex = 0;
    this.setState({
      selectedIndex: finalIndex
    });
  }

  handleDocClick(event) {
    var i, isClickingInput = false, node = event.target;
    for (i = 0; i <= 5; i++) {
      if (node == null) return;
      if (node == this.container) {
        isClickingInput = true;
        break;
      }
      node = node.parentNode;
    }

    if (!isClickingInput && this.state.results.length > 0) {
      this.closeResults();
    }
  }

  closeResults() {
    this.setState({
      results: [],
      selectedIndex: 0
    });
    var value = this.props.value;
    if (value == null) value = '';
    if (!this.props.valueList.hasOwnProperty(this.props.value) && value != '') {
      this.props.handleChange(null);
    }
  }

  handleChange(event) {
    var value = this.input.value;
    this.props.handleChange(value);

    // Update autocomplete box.
    if (value == '') {
      this.setState({
        results: [],
        selectedIndex: 0
      });
      return;
    }
    var results = this.search(value);
    this.setState({
      results: results
    });
  }

  handleMouseOver(index) {
    this.setState({
      selectedIndex: index
    });
  }

  select(item) {
    this.props.handleChange(item.value);
    this.setState({
      results: [],
      selectedIndex: 0
    });
  }
}