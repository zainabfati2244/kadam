import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

/** A consistent, Kadam-brand replacement for native system alerts. */
export default function AppAlert({
  visible,
  title,
  message,
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
}: Props) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel || onConfirm}>
      <Pressable style={styles.overlay} onPress={onCancel || onConfirm}>
        <Pressable style={[styles.card, { backgroundColor: theme.primary }]} onPress={() => undefined}>
          <Text style={styles.brand}>Kadam</Text>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
          <View style={styles.actions}>
            {cancelText ? (
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                <Text style={[styles.buttonText, { color: theme.text }]}>{cancelText}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.card }]} onPress={onConfirm}>
              <Text style={[styles.buttonText, { color: theme.primary }]}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: { width: '100%', maxWidth: 360, borderRadius: 22, padding: 24 },
  brand: {
    color: '#FFF8E7',
    fontFamily: 'Bezoria-Reguler-Exfontfbf7',
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 18,
  },
  title: { fontSize: 21, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  message: { fontSize: 14, lineHeight: 21, textAlign: 'center', opacity: 0.9 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  button: { flex: 1, minHeight: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancelButton: { borderWidth: 1, borderColor: '#FFF8E7' },
  buttonText: { fontSize: 14, fontWeight: '800', letterSpacing: 0.6 },
});
