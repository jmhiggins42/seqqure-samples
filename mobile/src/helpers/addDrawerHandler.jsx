import React from 'react';
import { Platform, BackHandler } from 'react-native';

// Higher Order Component that adds back button functionality to open/close nav drawer to any container component

const addDrawerHandler = Component =>
  class extends React.Component {
    componentDidMount = () => {
      if (Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
      }
    };
    componentWillUnmount = () => {
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
      }
    };
    onBackPress = () => {
      this.props.navigation.toggleDrawer();
      return true;
    };
    render = () => {
      return <Component {...this.props} />;
    };
  };

export default addDrawerHandler;
