import { createStackNavigator } from 'react-navigation';
import LoginScreen from '../containers/Login/LoginScreen';

export default createStackNavigator(
  {
    Login: {
      path: '/login',
      screen: LoginScreen
    }
    // FOR FUTURE SPRINT: Forgot Password
  },
  { headerMode: 'none' }
);
