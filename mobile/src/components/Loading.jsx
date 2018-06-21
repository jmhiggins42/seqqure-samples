import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

const Loading = () => (
  <View style={styles.loadingBar}>
    <ActivityIndicator size="large" color="#1240AB" />
  </View>
);

const styles = StyleSheet.create({
  loadingBar: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});

export default Loading;
