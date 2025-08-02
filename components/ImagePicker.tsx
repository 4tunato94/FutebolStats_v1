import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Upload } from 'lucide-react-native';

interface ImagePickerProps {
  imageUri?: string;
  onImageSelected: (uri: string) => void;
  label?: string;
}

export default function ImagePicker({ imageUri, onImageSelected, label }: ImagePickerProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TextInput
        style={styles.input}
        placeholder="URL da imagem (opcional)"
        value={imageUri || ''}
        onChangeText={onImageSelected}
      />
      
      <View style={styles.note}>
        <Upload color="#666" size={16} />
        <Text style={styles.noteText}>Cole a URL de uma imagem online</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});