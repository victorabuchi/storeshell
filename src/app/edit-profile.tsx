import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccount } from '@/account/account-provider';
import { theme } from '@/brand';
import { Button } from '@/components/button';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { customer, updateName } = useAccount();
  const [firstName, setFirstName] = useState(customer?.firstName ?? '');
  const [lastName, setLastName] = useState(customer?.lastName ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateName(firstName.trim(), lastName.trim());
      router.back();
    } catch (e) {
      Alert.alert('Could not save', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen}>
      <View style={styles.form}>
        <Field label="First Name" value={firstName} onChangeText={setFirstName} autoComplete="given-name" />
        <Field label="Surname" value={lastName} onChangeText={setLastName} autoComplete="family-name" />
        <Text style={styles.note}>Your email is how you sign in, so it can’t be changed here.</Text>
      </View>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button title="Save" onPress={save} loading={saving} disabled={!firstName.trim()} />
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  ...input
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...input} style={styles.input} placeholderTextColor={theme.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  form: { flex: 1, padding: 20, gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 14, color: theme.textMuted },
  input: {
    height: 54,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 16,
    fontSize: 17,
    color: theme.text,
  },
  note: { fontSize: 14, color: theme.textMuted },
  footer: { paddingHorizontal: 20 },
});
