import React from 'react';
import { Platform, ToastAndroid, StyleSheet, ScrollView, View, Text } from 'react-native';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import RNFetchBlob from 'react-native-fetch-blob';
import RNFS from 'react-native-fs';
import FaIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

// Components
import Button from '../../components/Button';
import Container from '../../components/Container';
import Loading from '../../components/Loading';

// Services
import { getByMilestoneId as getMilestoneDocuments } from '../../services/documentsService';
import { downloadFileDoc as downloadDocument } from '../../services/signedUrlService';

// Helpers
import addDrawerHandler from '../../helpers/addDrawerHandler';

// Constants
const SavePath = Platform.OS === 'ios' ? RNFS.MainBundlePath : RNFS.DocumentDirectoryPath;

class DocumentsScreen extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      documents: null
    };

    this.onDocumentView = this.onDocumentView.bind(this);
  }

  componentDidMount = () => {
    const milestoneId = this.props.navigation.getParam('milestoneId', false);

    if (milestoneId) {
      getMilestoneDocuments(milestoneId)
        .then(data => {
          documents = data.item.sort((a, b) => {
            if (a.latest && !b.latest) return -1;
            else if (!a.latest && b.latest) return 1;
            else return a.displayOrder - b.displayOrder;
          });
          this.setState({ documents });
        })
        .catch(err => {
          if (err.response) {
            Platform.OS === 'android' &&
              ToastAndroid.show(err.response.data.errors, ToastAndroid.LONG);
          }
        });
    } else {
      Platform.OS === 'android' &&
        ToastAndroid.show(
          'Error in getting milestone information, please try again.',
          ToastAndroid.LONG
        );
    }
  };

  onDocPickerUpdate = prevDocument => {
    DocumentPicker.show({ filetype: [DocumentPickerUtil.allFiles()] }, (error, res) => {
      if (error) {
        console.log('Uh oh :(', error);
        return;
      }

      const newDocument = {
        ...prevDocument,
        docName: res.fileName,
        type: res.type,
        size: res.fileSize
      };
      delete newDocument._id;

      // TODO: Create a blob from the selected document and upload via S3
      // uploadDocument(newDocument)
      //   .then(data => {
      //     newDocument._id = data.item;

      //     // blob making

      //   })
      //   .catch(err => console.log("Uh oh :("));

      Platform.OS === 'android' &&
        ToastAndroid.show('Full feature not implemented yet', ToastAndroid.LONG);
    });
  };

  onDocumentView = document => {
    downloadDocument(document._id)
      .then(data => {
        RNFetchBlob.android
          .actionViewIntentWithProtocol(data.item, document.type)
          .then(() => {
            /* Success! */
          })
          .catch(error => console.log('Error: ', JSON.stringify(error), error));
      })
      .catch(err => {
        if (err.response && err.response.data) console.log(err.response.data.errors);
        else console.log(err);
      });
  };

  render = () =>
    !this.state.documents ? (
      <Loading />
    ) : (
      <ScrollView style={styles.screen}>
        <React.Fragment>
          <Container>
            <Text style={styles.text}>
              {`${this.state.documents.length} ${
                this.state.documents.length === 1 ? 'Document' : 'Documents'
              } found`}
            </Text>
          </Container>
          {this.state.documents.map(document => (
            <React.Fragment key={document._id}>
              <Container style={[styles.border, styles.inline, styles.wrap, styles.container]}>
                <Text style={styles.document}>
                  <Text style={styles.bold}>{document.docType}</Text> {document.docName}{' '}
                  {`(${document.type})`}
                </Text>
                <Container style={styles.button}>
                  <Button
                    styles={{
                      button: styles.success,
                      label: styles.label
                    }}
                    onPress={this.onDocumentView.bind(this, document)}
                  >
                    <View style={styles.inline}>
                      <Text style={styles.label}>
                        <FaIcon name="eye" size={20} />View
                      </Text>
                    </View>
                  </Button>
                </Container>
                <Container style={styles.button}>
                  {document.latest && (
                    <Button
                      styles={{
                        button: styles.primary,
                        label: styles.label
                      }}
                      onPress={this.onDocPickerUpdate.bind(this, document)}
                    >
                      <View style={styles.inline}>
                        <Text style={styles.label}>
                          <MaterialIcon name="create-new-folder" size={20} />Update
                        </Text>
                      </View>
                    </Button>
                  )}
                </Container>
              </Container>
            </React.Fragment>
          ))}
        </React.Fragment>
      </ScrollView>
    );
}

const styles = StyleSheet.create({
  bold: { fontWeight: 'bold' },
  border: {
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#d6d7da'
  },
  button: { flexBasis: '50%' },
  container: { marginBottom: 15 },
  danger: {
    backgroundColor: '#A90329',
    padding: 15
  },
  document: {
    flexBasis: '100%',
    textAlign: 'center',
    fontSize: 20
  },
  image: { height: 500, flex: 1 },
  inline: {
    flexDirection: 'row'
  },
  label: {
    color: '#FAFAFA',
    fontSize: 20,
    fontWeight: 'bold'
  },
  primary: {
    backgroundColor: '#1240AB',
    padding: 15
  },
  screen: { flex: 1, padding: 10, backgroundColor: '#FAFAFA' },
  text: { fontSize: 20, textAlign: 'center' },
  success: {
    backgroundColor: '#739E73',
    padding: 15
  },
  wrap: { flexWrap: 'wrap' }
});

export default addDrawerHandler(DocumentsScreen);
