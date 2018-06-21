import React from 'react';
import { Platform, StyleSheet, ToastAndroid, View, Text, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

// Components
import Button from '../../components/Button';
import Container from '../../components/Container';
import InputLabel from '../../components/InputLabel';

class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: ''
    };

    this.passwordInput = React.createRef();
    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onSubmit = () => {
    const { email, password } = this.state;

    if (!email || !password) {
      const rules = [];

      if (!email) rules.push('Email Address');
      if (!password) rules.push('Password');

      Platform.OS === 'android' &&
        ToastAndroid.show(
          rules.join(' and ') + (rules.length === 1 ? ' is required' : ' are required'),
          ToastAndroid.LONG
        );
      return;
    }

    this.props.onSubmit({ email, password });
  };

  onCancel = () => this.setState({ email: '', password: '' }, this.props.onCancel);

  render = () =>
    this.props.currentStep === 1 ? (
      <React.Fragment>
        <Container>
          <InputLabel text="Email Address" />
          <TextInput
            autoFocus={true}
            style={styles.textInput}
            value={this.state.email}
            onChangeText={email => this.setState({ email })}
            onSubmitEditing={() => this.passwordInput.current.focus()}
            blurOnSubmit={false}
            returnKeyType="next"
            selectionColor="#1240AB"
            underlineColorAndroid="#0E1111"
            keyboardType="email-address"
            editable={!this.props.disabled}
          />
        </Container>
        <Container>
          <InputLabel text="Password" />
          <TextInput
            ref={this.passwordInput}
            secureTextEntry={true}
            style={styles.textInput}
            value={this.state.password}
            onChangeText={password => this.setState({ password })}
            onSubmitEditing={this.onSubmit}
            returnKeyType="send"
            selectionColor="#1240AB"
            underlineColorAndroid="#0E1111"
            editable={!this.props.disabled}
          />
        </Container>
        <View style={styles.footer}>
          <Container>
            <Button
              styles={{ button: styles.primary, label: styles.label }}
              onPress={this.onSubmit}
              disabled={this.props.disabled}
            >
              <View style={styles.inline}>
                <Text style={styles.label}>
                  <Icon name="sign-in" size={20} /> Sign In
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
