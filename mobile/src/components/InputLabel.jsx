import React from 'react';
import { StyleSheet, Text } from 'react-native';

// Reusable component for standarized input labels

const InputLabel = props => (
  <Text
    style={
      props.styles && props.styles.textLabel
        ? [styles.textLabel, props.styles.textLabel]
        : styles.textLabel
    }
  >
    {props.text}
  </Text>
);

const styles = StyleSheet.create({
  textLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0E1111'
  }
});

export default InputLabel;
