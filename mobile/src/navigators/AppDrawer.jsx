import React from 'react';
import { createDrawerNavigator } from 'react-navigation';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FaIcon from 'react-native-vector-icons/FontAwesome';

/* Local imports here */

export default createDrawerNavigator({
  Home: {
    path: '/',
    screen: HomeScreen,
    navigationOptions: {
      drawerIcon: ({ tintColor }) => (
        <MaterialIcon name="home" size={24} style={{ color: tintColor }} />
      )
    }
  },
  EscrowsStack: {
    path: '/escrows',
    screen: EscrowsStack,
    navigationOptions: {
      drawerLabel: 'Escrows',
      drawerIcon: ({ tintColor }) => (
        <FaIcon name="university" size={24} style={{ color: tintColor }} />
      )
    }
  },
  Logout: {
    path: '/logout',
    screen: LogoutScreen,
    navigationOptions: {
      drawerIcon: ({ tintColor }) => (
        <FaIcon name="sign-out" size={24} style={{ color: tintColor }} />
      )
    }
  }
});
