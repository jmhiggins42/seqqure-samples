import React from 'react';
import { StyleSheet, Text, TouchableHighlight } from 'react-native';

// Reusable Button component for uniform look/functionality to app's buttons

const Button = ({ noDefaultStyle, styles, label, children, ...props }) => (
  <TouchableHighlight
    underlayColor="#CCC"
    onPress={props.onPress}
    style={[noDefaultStyle ? '' : defaultStyles.button, styles ? styles.button : '']}
    {...props}
  >
    {children || <Text style={(styles && styles.label) || defaultStyles.text}>{label}</Text>}
  </TouchableHighlight>
);

const defaultStyles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  text: {
    color: '#0E1111'
  }
});

export default Button;
