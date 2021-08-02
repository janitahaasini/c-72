import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet, TextInput, Alert,Image ,KeyboardAvoidingView,ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import db from '../config.js'


export default class TransactionScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermissions: null,
      scanned: false,
      scannedData: '',
      buttonState: 'normal',
      scannedBookId: ' ',
      scannedStudentId: ' '
    }
  }

  getCameraPermissions = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      /*status === "granted" is true when user has granted permission
        status === "granted" is false when user has not granted the permission
      */
      hasCameraPermissions: status === "granted",
      buttonState: id,
      scanned: false
    });
  }

  handleBarCodeScanned = async ({ type, data }) => {
    const { buttonState } = this.state
    if (buttonState === 'BookId') {
      this.setState({
        scanned: true,
        scannedBookId: data,
        buttonState: 'normal'
      })
    }
    else if (buttonState === 'StudentId') {
      this.setState({
        scanned: true,
        scannedStudentId: data,
        buttonState: 'normal'
      })
    }
  }
handleTransaction=()=>{
var transactionMessage
db.collection("books").doc(this.state.scannedBookId).get()
.then((doc)=>{
 var book=doc.data()
 if(book.bookAvalibility){
this.intiateBookIssue()
transactionMessage='Book Issued'
ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
 }
 else{
   this.intiateBookReturn()
   transactionMessage='Book Returned'
   ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
 }
})
this.setState({
  transactionMessage:transactionMessage
})
}
intiateBookIssue=async()=>{
  db.collection("Transactions").add({
    'StudentId':this.state.scannedStudentId,
    'BookID':this.state.scannedBookId,
    'date':firebase.firestore.Timestamp.now().toDate(),
    'transactionType':'Issue'
  })
  db.collection("books").doc(this.state.scannedBookId).update({
    'bookAvalability':false
  })
  db.collection("Students").doc(this.state.scannedStudentId).update({
    'no of booksIssued':firebase.firestore.FeildValue.increment(1)
  })
  Alert.alert("BOOK ISSUED")
  this.setState({
    scannedBookId:' ',
    scannedStudentId:' '

  })
}
intiateBookReturn=async()=>{
  db.collection("Transactions").add({
    'StudentId':this.state.scannedStudentId,
    'BookID':this.state.scannedBookId,
    'date':firebase.firestore.Timestamp.now().toDate(),
    'transactionType':'Return'
  })
  db.collection("books").doc(this.state.scannedBookId).update({
    'bookAvalability':true
  })
  db.collection("Students").doc(this.state.scannedStudentId).update({
    'no of booksIssued':firebase.firestore.FeildValue.increment(-1)
  })
  Alert.alert("BOOK RETURNED")
  this.setState({
    scannedBookId:' ',
    scannedStudentId:' '

  })
}

  render() {
    const hasCameraPermissions = this.state.hasCameraPermissions;
    const scanned = this.state.scanned;
    const buttonState = this.state.buttonState;

    if (buttonState !== "normal" && hasCameraPermissions) {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }

    else if (buttonState === "normal") {
      return (

       <KeyboardAvoidingView style={styles.container} behavior='padding'enabled>
          <View>
            <Image source={require('../assets/booklogo.jpg')} style={{ width: 200, height: 200 }} />
            <Text style={{ textAlign: 'center', fontSize: 30, fontStyle: 'neucha' }}>WILY</Text>
          </View>
          <View style={styles.inputView}>
            <TextInput style={styles.inputbox} placeholder='book id' 
            onTouchText={text=>this.setState({
              scannedBookId:text
            })}
            value={this.state.scannedBookId}
            />
            <TouchableOpacity style={styles.scanButton} onPress={() => {
              this.getCameraPermissions("BookId")
            }}>
              <Text style={styles.buttonText}>SCAN</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput style={styles.inputbox} placeholder='Student id' 
            onChangeText={text=>this.setState({
              scannedStudentId:text
            })}
            value={this.state.scannedStudentId}
            />
            <TouchableOpacity style={styles.scanButton} onPress={() => {
              this.getCameraPermissions("StudentId")
            }}>
              <Text style={styles.buttonText}>SCAN</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={this.handleTransaction() }>
<Text style={styles.sumbitButtonText}SUBMIT></Text>
          </TouchableOpacity>
          </KeyboardAvoidingView>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  displayText: {
    fontSize: 15,
    textDecorationLine: 'underline'
  },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    margin: 10
  },
  buttonText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 10
  },
  inputView: {
    flexDirection: 'row',
    margin: 20
  },
  inputbox: {
    width: 200,
    height: 50,
    borderWidth: 1.5,
    fontSize: 20
  },
  submitButton:{
    backgroundColor:'blue',
    width:100,
    height:50
  },
  sumbitButtonText:{
    fontSize:10,
    fontWeight:'bold',
    padding:10,
    color:'pink',
    textAlign:'center'
  }
});