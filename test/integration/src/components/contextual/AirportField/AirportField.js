import React from 'react';
import connect from 'soya/lib/data/redux/connect';
import createField from 'soya/lib/data/redux/form/createField';
import { SERVER } from 'soya/lib/data/RenderType';

import Autocomplete from '../../common/Autocomplete/Autocomplete';
import AutocompleteDisplay from '../../common/Autocomplete/AutocompleteDisplay';
import AirportListSegment from '../../../segments/AirportListSegment';

class AirportInputBase extends React.Component {
  static connectId() {
    return 'AirportField';
  }

  static getSegmentDependencies() {
    return [AirportListSegment];
  }

  static subscribeQueries(nextProps, subscribe) {
    var hydrationOption = { SERVER: false };
    subscribe(AirportListSegment.id(), '*', 'airports', hydrationOption);
  }

  componentWillMount() {
    this.generateItemList(this.props);
    this.props.registerSubmitValidators([this.validateSubmit.bind(this)]);
  }

  componentWillReceiveProps(nextProps) {
    this.generateItemList(nextProps);
  }

  generateItemList(props) {
    var itemList = [], valueMap = {};
    if (props.result.airports != null) {
      var key, airport;
      for (key in props.result.airports.data) {
        if (!props.result.airports.data.hasOwnProperty(key)) continue;
        airport = props.result.airports.data[key];
        itemList.push({
          label: `${airport.name} (${airport.code}) - ${airport.location}`,
          inputLabel: `${airport.location} (${airport.code})`,
          searchStr: `${airport.name} ${airport.location} ${airport.code}`,
          value: `${airport.location} (${airport.code})`
        });
        valueMap[`${airport.location} (${airport.code})`] = null;
      }
    }
    this.setState({
      itemList: itemList,
      valueList: valueMap
    });
  }

  validateSubmit(value) {
    if (!this.state.valueList.hasOwnProperty(value)) {
      return 'Value is not on the list';
    }
    return true;
  }

  render() {
    return <div>
      <AutocompleteDisplay options={this.state.itemList}
                           label={this.props.label} errorMessages={this.props.errorMessages}
                           value={this.props.value} valueList={this.state.valueList}
                           placeholder={this.props.label} isDisabled={this.props.isDisabled}
                           handleChange={this.props.handleChange} />
    </div>;
  }
}

export var AirportInput = connect(AirportInputBase);
export default createField(AirportInput);