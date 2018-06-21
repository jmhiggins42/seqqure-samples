import React from 'react';
import { StyleSheet, View } from 'react-native';

// Reusable container component to provide Views with some default margin-bottom

const Container = ({ children, ...props }) => (
  <View style={styles.container} {...props}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFAFA',
    marginBottom: 15
  }
});

export default Container;
