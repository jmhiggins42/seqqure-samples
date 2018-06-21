import React from 'react';
import { Platform, StyleSheet, ToastAndroid, View, Text, Picker } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

// Components
import Button from '../components/Button';
import Container from '../components/Container';
import InputLabel from '../components/InputLabel';

class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tenantId: ''
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onSubmit = () => {
    const { tenantId } = this.state;

    if (Platform.OS === 'android' && !tenantId) {
      ToastAndroid.show('Tenant is required', ToastAndroid.LONG);
      return;
    }

    this.props.onSubmit({ tenantId });
  };

  onCancel = () => this.setState({ tenantId: '' }, this.props.onCancel);

  render = () =>
    this.props.currentStep === 2 ? (
      <React.Fragment>
        <Container>
          <InputLabel text="Confirm Tenant" />
          <Picker
            selectedValue={this.state.tenantId}
            onValueChange={tenantId => this.setState({ tenantId })}
            enabled={!this.props.disabled}
          >
            <Picker.Item value="" label="Select a Tenant" />
            {this.props.tenantOptions.map(tenant => (
              <Picker.Item
                key={tenant._id}
                value={tenant._id}
                label={tenant.tenantName}
                // iOS-only styling (Andrdoid styling would be found in /mobile/android/app/src/main/res/values/styles.xml)
                style={styles.pickerItem}
              />
            ))}
          </Picker>
        </Container>
        <View style={styles.footer}>
          <Container>
            <Button
              styles={{ button: styles.primary, label: styles.label }}
              onPress={this.onSubmit}
            >
              <View style={styles.inline}>
                <Text style={styles.label}>
                  <Icon name="check" size={20} /> Confirm
                </Text>
              </View>
            </Button>
          </Container>
          <Container>
            <Button
              label="Cancel"
              styles={{ button: styles.warning, label: styles.label }}
              onPress={this.onCancel}
              disabled={this.props.disabled}
            />
          </Container>
          <Container>
            <Button
              label="Forgot Password?"
              styles={{ button: styles.center, label: styles.link }}
              onPress={() =>
                ToastAndroid.showWithGravity(
                  'Feature not enabled',
                  ToastAndroid.SHORT,
                  ToastAndroid.TOP
                )
              }
              disabled={Platform.OS === 'ios' || this.props.disabled}
            />
          </Container>
        </View>
      </React.Fragment>
    ) : null;
}

const styles = StyleSheet.create({
  center: {
    alignSelf: 'center'
  },
  footer: { marginTop: 100 },
  inline: { flexDirection: 'row' },
  label: {
    color: '#FAFAFA',
    fontSize: 20,
    fontWeight: 'bold'
  },
  link: {
    color: '#0366D6',
    fontSize: 20
  },
  picker: { color: '#0E1111' },
  pickerItem: {
    textAlign: 'center',
    color: '#0E1111',
    fontSize: 30
  },
  primary: {
    backgroundColor: '#1240AB',
    padding: 15
  },
  textInput: {
    height: 60,
    fontSize: 30,
    backgroundColor: '#FAFAFA'
  },
  warning: {
    backgroundColor: '#C79121',
    padding: 15
  }
});

export default LoginForm;
