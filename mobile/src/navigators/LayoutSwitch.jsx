import { createSwitchNavigator } from 'react-navigation';

/* Local imports here */

// Containers
import AuthLoading from '../containers/AuthLoading';

const LayoutSwitch = createSwitchNavigator(
  {
    Loading: AuthLoading,
    Auth: AuthStack,
    App: AppDrawer
  },
  { initialRouteName: 'Loading' }
);

export default LayoutSwitch;
