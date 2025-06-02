import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import FormField from '@/components/FormField';
import { useSession } from '@/services/authContext';
import { BACKGROUND_COLOR, DARKER_PRIMARY, PRIMARY_COLOR } from '@/constants';

export default function SignUp() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useSession();

  const handleSignUp = async () => {
    const { username, email, password } = form;

    if (!username || !email || !password) {
      Alert.alert('Missing Fields', 'All fields are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await signUp(username, email, password);
      if (!success) {
        Alert.alert('Sign Up Failed', 'Email is already registered.');
      } else {
        Alert.alert('Success', 'Account created!');
        router.replace('/sign-in');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          <Text style={Platform.OS == 'web' ? styles.titleWeb : styles.title}>Create Account</Text>
          <Text style={Platform.OS == 'web' ? styles.subtitleWeb : styles.subtitle}>Sign up to join Stupid Home</Text>

          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e: any) => setForm({ ...form, username: e })}
            otherStyles="mb-4"
            keyboardType="ascii-capable"
          />

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e: any) => setForm({ ...form, email: e })}
            otherStyles="mb-4"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(p: any) => setForm({ ...form, password: p })}
            otherStyles="mb-6"
            secureTextEntry
          />

          <View style={Platform.OS == 'web' ? styles.wrapper : ""}>
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={isSubmitting}
            style={Platform.OS == 'web' ? styles.buttonWeb : styles.button}>
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={Platform.OS == 'web' ? styles.footerTextWeb : styles.footerText}>Already have an account?</Text>
            <Link href="/sign-in">
              <Text style={Platform.OS == 'web' ? styles.signInTextWeb : styles.signInText}>Sign In</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    color: DARKER_PRIMARY,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: DARKER_PRIMARY,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: DARKER_PRIMARY,
    marginRight: 4,
  },
  signInText: {
    fontSize: 14,
    fontWeight: '600',
    color: DARKER_PRIMARY,
  },
   titleWeb: {
    fontSize: 65,
    color: '#003366',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitleWeb: {
    fontSize: 35,
    color: '#335577',
    textAlign: 'center',
    marginBottom: 75,
  },
   footerTextWeb: {
    fontSize: 25,
    color: '#335577',
    marginRight: 4,
  },
   signInTextWeb: {
    fontSize: 25,
    fontWeight: '600',
    color: '#0055cc',
  },
   wrapper: {
    justifyContent: "center",
    alignItems:"center",
  },
   buttonWeb: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    justifyContent: "center",
    alignContent: "center",
    width: 400
  },
});
