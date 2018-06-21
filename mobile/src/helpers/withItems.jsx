import React from 'react';
import { Platform, ToastAndroid } from 'react-native';

// Components
import Loading from '../components/Loading';

/* API Service import here */

// High Order Component and renders a loading screen until API call is complete
// and passes the JSON response to the container component via props

const withItems = Component =>
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { items: [] };
    }

    componentWillMount = () => {
      apiRequest()
        .then(data => {
          this.setState({ items: data.items });
        })
        .catch(err => {
          if (err.response) {
            Platform.OS === 'android' &&
              ToastAndroid.show(err.response.data.errors, ToastAndroid.LONG);
          }
        });
    };

    render = () =>
      this.state.escrows.length === 0 ? (
        <Loading />
      ) : (
        <Component {...this.props} items={this.state.items} />
      );
  };

export default withItems;
