/**
 * ConversãoAI Mobile — LoginScreen
 */
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuthStore } from "../../store/auth.store";
import { COLORS, SPACING, RADIUS, FONTS } from "../../constants/theme";

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!email.trim()) e.email = "Email obrigatório";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Email inválido";
    if (!password) e.password = "Senha obrigatória";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (
        err.error === "TOO_MANY_LOGIN_ATTEMPTS" ||
        err.error === "ACCOUNT_LOCKED"
      ) {
        Alert.alert("Conta bloqueada", err.message);
      } else {
        setErrors({ general: err.message || "Email ou senha incorretos." });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoIcon}>
            <Text style={{ fontSize: 24 }}>⚡</Text>
          </View>
          <Text style={styles.logoText}>ConversãoAI</Text>
          <Text style={styles.logoSub}>Marketing Intelligence</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Entre na sua conta</Text>

        {/* Error geral */}
        {errors.general && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={COLORS.red} />
            <Text style={styles.errorBannerText}>{errors.general}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrap, errors.email && styles.inputError]}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={COLORS.text3}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={COLORS.text3}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setErrors((e) => ({ ...e, email: "" }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
            {errors.email ? (
              <Text style={styles.fieldError}>{errors.email}</Text>
            ) : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Senha</Text>
            <View
              style={[styles.inputWrap, errors.password && styles.inputError]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={COLORS.text3}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={COLORS.text3}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setErrors((e) => ({ ...e, password: "" }));
                }}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={COLORS.text3}
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.fieldError}>{errors.password}</Text>
            ) : null}
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Entrar</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou continue com</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social */}
          <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
            <Text style={{ fontSize: 18 }}>🌐</Text>
            <Text style={styles.socialBtnText}>Continuar com Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
            <Ionicons name="logo-apple" size={20} color={COLORS.text} />
            <Text style={styles.socialBtnText}>Continuar com Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Register */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.footerLink}> Cadastre-se grátis</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: SPACING.xl },
  logoWrap: { alignItems: "center", marginBottom: SPACING.xxxl },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logoText: {
    fontSize: 26,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize: 11,
    color: COLORS.text3,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 3,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: 6,
  },
  subtitle: { fontSize: 14, color: COLORS.text2, marginBottom: SPACING.xl },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.redBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.red + "44",
  },
  errorBannerText: { fontSize: 13, color: COLORS.red, flex: 1 },
  form: { gap: SPACING.md },
  formGroup: { gap: 6 },
  label: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.text2,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border2,
    paddingHorizontal: 12,
  },
  inputError: { borderColor: COLORS.red },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    height: 48,
    color: COLORS.text,
    fontSize: 14,
    fontFamily: FONTS.body,
  },
  eyeBtn: { padding: 8 },
  fieldError: { fontSize: 11, color: COLORS.red, marginTop: 2 },
  forgotBtn: { alignSelf: "flex-end" },
  forgotText: { fontSize: 12, color: COLORS.accent2 },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    fontSize: 15,
    fontFamily: FONTS.heading,
    color: "#fff",
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: SPACING.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: 12, color: COLORS.text3 },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border2,
  },
  socialBtnText: { fontSize: 14, fontFamily: FONTS.medium, color: COLORS.text },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: SPACING.xxl,
  },
  footerText: { fontSize: 14, color: COLORS.text2 },
  footerLink: { fontSize: 14, color: COLORS.accent2, fontFamily: FONTS.medium },
});
