/**
 * ConversãoAI Mobile — RegisterScreen
 * NOVO ARQUIVO — criado para completar fluxo de auth
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

export default function RegisterScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const register = useAuthStore((s) => s.register);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!name.trim() || name.trim().length < 2)
      e.name = "Nome deve ter ao menos 2 caracteres.";
    if (!email.trim()) e.email = "Email obrigatório.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Email inválido.";
    if (!password) e.password = "Senha obrigatória.";
    else if (password.length < 8) e.password = "Mínimo 8 caracteres.";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      e.password = "Use maiúscula, minúscula e número.";
    if (password !== confirm) e.confirm = "As senhas não coincidem.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (err.error === "EMAIL_ALREADY_EXISTS") {
        setErrors({ email: "Este email já está cadastrado." });
      } else {
        setErrors({
          general: err.message || "Erro ao criar conta. Tente novamente.",
        });
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
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text2} />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoIcon}>
            <Text style={{ fontSize: 22 }}>⚡</Text>
          </View>
        </View>

        <Text style={styles.title}>Criar sua conta</Text>
        <Text style={styles.subtitle}>
          Comece grátis — sem cartão de crédito
        </Text>

        {/* Erro geral */}
        {errors.general ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={COLORS.red} />
            <Text style={styles.errorBannerText}>{errors.general}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          {/* Nome */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome completo</Text>
            <View style={[styles.inputWrap, errors.name && styles.inputError]}>
              <Ionicons
                name="person-outline"
                size={17}
                color={COLORS.text3}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Seu nome"
                placeholderTextColor={COLORS.text3}
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  setErrors((e) => ({ ...e, name: "" }));
                }}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
            {errors.name ? (
              <Text style={styles.fieldError}>{errors.name}</Text>
            ) : null}
          </View>

          {/* Email */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrap, errors.email && styles.inputError]}>
              <Ionicons
                name="mail-outline"
                size={17}
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

          {/* Senha */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Senha</Text>
            <View
              style={[styles.inputWrap, errors.password && styles.inputError]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={17}
                color={COLORS.text3}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor={COLORS.text3}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setErrors((e) => ({ ...e, password: "" }));
                }}
                secureTextEntry={!showPass}
                returnKeyType="next"
              />
              <TouchableOpacity
                onPress={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={17}
                  color={COLORS.text3}
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.fieldError}>{errors.password}</Text>
            ) : null}
          </View>

          {/* Confirmar */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirmar senha</Text>
            <View
              style={[styles.inputWrap, errors.confirm && styles.inputError]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={17}
                color={COLORS.text3}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Repita a senha"
                placeholderTextColor={COLORS.text3}
                value={confirm}
                onChangeText={(v) => {
                  setConfirm(v);
                  setErrors((e) => ({ ...e, confirm: "" }));
                }}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </View>
            {errors.confirm ? (
              <Text style={styles.fieldError}>{errors.confirm}</Text>
            ) : null}
          </View>

          {/* Indicador de força */}
          {password.length > 0 && (
            <View style={styles.strengthWrap}>
              {[
                password.length >= 8,
                /[A-Z]/.test(password),
                /[0-9]/.test(password),
                /[^A-Za-z0-9]/.test(password),
              ].map((ok, i) => (
                <View
                  key={i}
                  style={[
                    styles.strengthBar,
                    { backgroundColor: ok ? COLORS.green : COLORS.surface2 },
                  ]}
                />
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Criar conta grátis</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.terms}>
            Ao criar uma conta você concorda com os{" "}
            <Text style={styles.termsLink}>Termos de Uso</Text> e{" "}
            <Text style={styles.termsLink}>Política de Privacidade</Text>.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.footerLink}>Fazer login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: SPACING.xl },
  backBtn: { marginBottom: SPACING.sm, alignSelf: "flex-start", padding: 4 },
  logoWrap: { alignItems: "center", marginBottom: SPACING.xl },
  logoIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
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
  formGroup: { gap: 5 },
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
    height: 46,
    color: COLORS.text,
    fontSize: 14,
    fontFamily: FONTS.body,
  },
  eyeBtn: { padding: 8 },
  fieldError: { fontSize: 11, color: COLORS.red, marginTop: 2 },
  strengthWrap: { flexDirection: "row", gap: 6 },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
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
  terms: {
    fontSize: 11,
    color: COLORS.text3,
    textAlign: "center",
    lineHeight: 17,
  },
  termsLink: { color: COLORS.accent2 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.xl,
  },
  footerText: { fontSize: 14, color: COLORS.text2 },
  footerLink: { fontSize: 14, color: COLORS.accent2, fontFamily: FONTS.medium },
});
