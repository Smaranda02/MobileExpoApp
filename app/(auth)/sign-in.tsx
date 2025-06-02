import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import FormField from '@/components/FormField';
import { useSession } from '@/services/authContext';
import { BACKGROUND_COLOR, DARKER_PRIMARY, PRIMARY_COLOR } from '@/constants';

export default function SignIn() {
  const { signIn } = useSession();

  const [form, setForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await signIn(form.email, form.password);
      if (!success) {
        Alert.alert('Login Failed', 'Invalid email or password.');
      }
      else {
        router.replace('/firstPage');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          <Text style={Platform.OS == 'web' ? styles.titleWeb : styles.title}>Welcome Back</Text>
          <Text style={Platform.OS == 'web' ? styles.subtitleWeb : styles.subtitle}>Log in to continue to Smart Home Controller</Text>

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e: any) => setForm({ ...form, email: e })}
            otherStyles="width-100"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(p: any) => setForm({ ...form, password: p })}
            secureTextEntry
            otherStyles="mb-4"
          />

          <View style={Platform.OS == 'web' ? styles.wrapper : ""}>
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={isSubmitting}
              style={Platform.OS == 'web' ? styles.buttonWeb : styles.button}>
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={Platform.OS == 'web' ? styles.buttonTextWeb :  styles.buttonText }>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={Platform.OS == 'web' ? styles.footerTextWeb : styles.footerText}>Don't have an account?</Text>
            <Link href="/sign-up">
              <Text style={Platform.OS == 'web' ? styles.signUpTextWeb : styles.signUpText}>Sign Up</Text>
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
    color: '#003366',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
   titleWeb: {
    fontSize: 65,
    color: '#003366',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: PRIMARY_COLOR,
    textAlign: 'center',
    marginBottom: 24,
  },
  subtitleWeb: {
    fontSize: 35,
    color: '#335577',
    textAlign: 'center',
    marginBottom: 75,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonWeb: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    justifyContent: "center",
    alignContent: "center",
    width: 400
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
   buttonTextWeb: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 30,
    maxWidth: 500
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 24,

  },
  footerTextWeb: {
    fontSize: 25,
    color: '#335577',
    marginRight: 4,
  },
  footerText: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    marginRight: 4,
  },
  signUpText: {
    fontSize: 14,
    fontWeight: '600',
    color: DARKER_PRIMARY,
  },

  signUpTextWeb: {
    fontSize: 25,
    fontWeight: '600',
    color: '#0055cc',
  },

  wrapper: {
    justifyContent: "center",
    alignItems:"center",
  }
});
