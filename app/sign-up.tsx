import { useSignUp } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { saveUserToFirestore } from '../config/firebase';

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState('');

    const onSignUpPress = async () => {
        if (!isLoaded) return;
        if (!emailAddress || !password || !firstName || !lastName) {
            setErrorText('Please fill all fields');
            return;
        }
        setLoading(true);
        setErrorText('');

        try {
            await signUp.create({
                firstName,
                lastName,
                emailAddress,
                password,
            });

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            setErrorText(err.errors?.[0]?.message || 'Sign up failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onPressVerify = async () => {
        if (!isLoaded) return;
        if (!code) {
            setErrorText('Please enter verification code');
            return;
        }
        setLoading(true);
        setErrorText('');

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (completeSignUp.status === 'complete') {
                const userId = completeSignUp.createdUserId;
                if (userId) {
                    await saveUserToFirestore(
                        userId,
                        emailAddress,
                        `${firstName} ${lastName}`,
                        'email_password'
                    );
                }
                await setActive({ session: completeSignUp.createdSessionId });
                router.replace('/');
            } else {
                console.error(JSON.stringify(completeSignUp, null, 2));
                setErrorText('Verification incomplete.');
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            setErrorText(err.errors?.[0]?.message || 'Verification failed.');
        } finally {
            setLoading(false);
        }
    };

    if (pendingVerification) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Check your email</Text>
                    <Text style={styles.subtitle}>We sent a verification code to {emailAddress}</Text>
                </View>
                <View style={styles.form}>
                    {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
                    <View style={styles.inputContainer}>
                        <Ionicons name="key-outline" size={20} color="#888" style={styles.inputIcon} />
                        <TextInput
                            value={code}
                            placeholder="Verification Code"
                            placeholderTextColor="#888"
                            onChangeText={setCode}
                            style={styles.input}
                            keyboardType="number-pad"
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={onPressVerify}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.primaryButtonText}>Verify Email</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Image
                        source={require('../assets/images/react-logo.png')}
                        style={styles.logo}
                        contentFit="contain"
                    />
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Start tracking your calories today</Text>
                </View>

                <View style={styles.form}>
                    {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

                    <View style={styles.row}>
                        <View style={[styles.inputContainer, styles.halfInput]}>
                            <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                            <TextInput
                                value={firstName}
                                placeholder="First Name"
                                placeholderTextColor="#888"
                                onChangeText={setFirstName}
                                style={styles.input}
                            />
                        </View>
                        <View style={[styles.inputContainer, styles.halfInput]}>
                            <TextInput
                                value={lastName}
                                placeholder="Last Name"
                                placeholderTextColor="#888"
                                onChangeText={setLastName}
                                style={styles.input}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                        <TextInput
                            autoCapitalize="none"
                            value={emailAddress}
                            placeholder="Email Address"
                            placeholderTextColor="#888"
                            onChangeText={setEmailAddress}
                            style={styles.input}
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                        <TextInput
                            value={password}
                            placeholder="Password"
                            placeholderTextColor="#888"
                            secureTextEntry={true}
                            onChangeText={setPassword}
                            style={styles.input}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={onSignUpPress}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.primaryButtonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/sign-in')}>
                        <Text style={styles.footerLink}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#FAFAFA',
        paddingHorizontal: 24,
        justifyContent: 'center',
        paddingVertical: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    form: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        width: '48%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1A1A1A',
    },
    primaryButton: {
        backgroundColor: '#4A90E2',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    footerText: {
        color: '#666',
        fontSize: 15,
    },
    footerLink: {
        color: '#4A90E2',
        fontSize: 15,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#E74C3C',
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
});
