import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const ItemDetailsScreen = ({ route }) => {
  const { item } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name: {item.name}</Text>
      <Text style={styles.label}>Description: {item.description}</Text>
      {item.photo && <Image source={{ uri: item.photo }} style={styles.photo} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, marginVertical: 5 },
  photo: { width: 200, height: 200, borderRadius: 5, marginTop: 10 },
});

export default ItemDetailsScreen;
