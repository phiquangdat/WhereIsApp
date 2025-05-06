import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet } from 'react-native';

const ListItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.container} onPress={onPress}>
    <Text style={styles.name}>{item.name}</Text>
    {item.photo && <Image source={{ uri: item.photo }} style={styles.thumbnail} />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  name: {
    flex: 1,
    fontSize: 16,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
});

export default ListItem;
