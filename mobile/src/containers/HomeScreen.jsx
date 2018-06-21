import React from 'react';
import { StyleSheet, View, Image } from 'react-native';

/* Local imports here */

const HomeScreen = props => (
  <View style={styles.main}>
    <View style={styles.background}>
      <Image style={styles.image} source={/* Image file here */} />
      <View style={styles.shade} />
    </View>
    <Header styles={{ header: styles.header, text: styles.headerText }}>SeQQure Mobile</Header>
    <View style={styles.content}>
      <Main onLogout={() => props.navigation.navigate('Auth')} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center'
  },
  header: { backgroundColor: 'transparent' },
  headerText: { color: '#6EC8DF' },
  image: {
    flex: 1,
    resizeMode: 'cover'
  },
  main: {
    flex: 1,
    backgroundColor: '#FAFAFA'
  },
  shade: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  }
});

export default addDrawerHandler(HomeScreen);
