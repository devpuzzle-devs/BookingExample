import React from 'react';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';

import './style.scss';

class LocationSearchInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      address: '',
      address_components: [],
      latLng: {}  
    };
  }

  handleChange = address => {
    this.setState({ address });
  };

  handleSelect = address => {
    geocodeByAddress(address)
      .then(results => {
        console.log(results); 
        const venueName = results[0]['types'].indexOf('establishment') > -1 ? address.split(',')[0] : null;
        this.setState({ address, address_components: results[0].address_components })
        this.props.onAddressSelect(venueName, results[0])
        return getLatLng(results[0])})
      .then(latLng => {
        console.log('Success', latLng)
        this.setState({ latLng })
        this.props.onLatLngChange(latLng.lat, latLng.lng)
      })
      .catch(error => console.error('Error', error));
  };

  render() {
    return (
      <PlacesAutocomplete
        value={this.props.address}
        onChange={address => this.props.handleAddressChange(address)}
        onSelect={this.handleSelect}
        searchOptions={searchOptions}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div className="autocomplete-wrapper">
            <input
              {...getInputProps({
                placeholder: 'Add place or address',
                className: 'form-control location-search-input',
              })}
            />
            <div className={`autocomplete-dropdown-container ${!suggestions.length ? 'hidden' : ''}`}>
              {loading && <div>Loading...</div>}
              {suggestions.map(suggestion => {
                const className = suggestion.active
                  ? 'suggestion-item--active'
                  : 'suggestion-item';
                // inline style for demonstration purpose
                const style = suggestion.active
                  ? { backgroundColor: '#deebff', cursor: 'pointer' }
                  : { backgroundColor: '#ffffff', cursor: 'pointer' };
                return (
                  <div
                    {...getSuggestionItemProps(suggestion, {
                      className,
                      style,
                    })}
                  >
                    <span>{suggestion.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PlacesAutocomplete>
    );
  }
}

export default LocationSearchInput

const searchOptions = {
  componentRestrictions: {country: 'us'},
  //location: {lat: 37.77, lang: -122.43},
  //radius: 2000,
  //types: ['geocode']
}