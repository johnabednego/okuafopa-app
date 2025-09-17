import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import COLORS from '../theme/colors';

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
};

export default function ConfirmModal({ visible, title = 'Confirm', message = '', onConfirm, onCancel, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.row}>
            <TouchableOpacity onPress={onCancel} style={[styles.btn, { backgroundColor: '#ccc' }]}>
              <Text> {cancelLabel} </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={[styles.btn, { backgroundColor: COLORS.primary }]}>
              <Text style={{ color: '#fff' }}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  card: { width: '86%', backgroundColor: '#fff', borderRadius: 10, padding: 16 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  message: { marginBottom: 12, color: '#444' },
  row: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginLeft: 8 }
});
