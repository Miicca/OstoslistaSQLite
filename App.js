import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('shoppingList.db');

const Ostoslista = () => {
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [shoppingList, setShoppingList] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS shopping_list (id INTEGER PRIMARY KEY AUTOINCREMENT, product TEXT, amount TEXT);'
      );
    });
    updateList();
  }, []);

  const updateList = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM shopping_list;', [], (_, { rows }) => {
        setShoppingList(rows._array);
      });
    });
  };

  const addToList = () => {
    if (product && amount) {
      db.transaction(tx => {
        tx.executeSql('INSERT INTO shopping_list (product, amount) VALUES (?, ?);', [product, amount], (_, result) => {
          if (result.rowsAffected > 0) {
            setProduct('');
            setAmount('');
            updateList();
          } else {
            Alert.alert('Error', 'Failed to add item to the shopping list.');
          }
        });
      });
    } else {
      Alert.alert('Error', 'Product and amount fields cannot be empty.');
    }
  };

  const removeFromList = (id) => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM shopping_list WHERE id = ?;', [id], (_, result) => {
        if (result.rowsAffected > 0) {
          updateList();
        } else {
          Alert.alert('Error', 'Failed to remove item from the shopping list.');
        }
      });
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text>{item.product} - {item.amount}</Text>
      <Button title="Hankittu" onPress={() => removeFromList(item.id)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ostoslista</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tuote"
          value={product}
          onChangeText={setProduct}
        />
        <TextInput
          style={styles.input}
          placeholder="Määrä"
          value={amount}
          onChangeText={setAmount}
        />
        <Button title="Lisää" onPress={addToList} />
      </View>
      <FlatList
        style={styles.list}
        data={shoppingList}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    marginRight: 10,
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    paddingHorizontal: 10,
  },
  list: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default Ostoslista;