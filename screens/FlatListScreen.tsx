import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'FlatList'>;

type Note = {
    id: string;
    name: string;
    description: string;
    image?: string;
    location?: { latitude: number; longitude: number } | null;
};

const FlatListScreen: React.FC<Props> = ({navigation}) => {

    const [searchText, setSearchText] = useState('');
    const [notes, setNotes] = useState<Note[]>([]);

    const loadNotes = async () => {
        try {
            const storedNotes = await AsyncStorage.getItem('records');
            if (storedNotes) {
                console.debug('ahhahahaha:', storedNotes);
                setNotes(JSON.parse(storedNotes));
            }
        } catch (error) {
            console.error('Failed to load notes:', error);
        }
    };

    useEffect(() => {
        loadNotes();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            loadNotes();
        }, [])
    );

    const filteredNotes = notes.filter(note => note.name.toLowerCase().includes(searchText.toLowerCase()));

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>

            <Text style={styles.title}>Flat List Screen</Text>

            <TextInput
                style={styles.searchBar}
                placeholder="Search notes..."
                value={searchText}
                onChangeText={setSearchText}
            />

            <FlatList
                data={filteredNotes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.itemContainer} 
                    onPress={() => navigation.navigate('ViewOneItem', { noteId: item.id })}
                    >
                        {item.image ? (
                            <Image source={{ uri: 'file://' + item.image }} style={styles.thumbnail} />
                        ) : (
                            <View style={styles.placeholder}><Icon name="image" size={40} color="#aaa" /></View>
                        )}
                        <Text style={styles.itemText}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    backButton: { position: 'absolute', top: 20, left: 20, zIndex: 10 },
    searchBar: { height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 10, marginBottom: 10 },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    itemContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
    thumbnail: { width: 50, height: 50, borderRadius: 5, marginRight: 10 },
    placeholder: { width: 50, height: 50, borderRadius: 5, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    itemText: { fontSize: 16 }
});

export default FlatListScreen;