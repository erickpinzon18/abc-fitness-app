import { useAuth } from "@/context/AuthContext";
import {
  pickImageFromGallery,
  takePhoto,
  uploadProfilePhoto,
} from "@/lib/imageService";
import { updateUser } from "@/lib/userService";
import { useNavigation } from "@react-navigation/native";
import {
  Camera,
  Check,
  ChevronLeft,
  Image as ImageIcon,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Level = "Scaled" | "Intermedio" | "RX";

export default function DatosPersonalesScreen() {
  const navigation = useNavigation();
  const { user, userData, refreshUserData } = useAuth();

  const [displayName, setDisplayName] = useState(userData?.displayName || "");
  const [phone, setPhone] = useState(userData?.phone || "");
  const [level, setLevel] = useState<Level>(userData?.level || "Scaled");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Photo states
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [tempPhotoUri, setTempPhotoUri] = useState<string | null>(null);

  const checkChanges = (field: string, value: string) => {
    const original = {
      displayName: userData?.displayName || "",
      phone: userData?.phone || "",
      level: userData?.level || "Scaled",
    };

    const current = {
      displayName,
      phone,
      level,
      [field]: value,
    };

    const changed =
      current.displayName !== original.displayName ||
      current.phone !== original.phone ||
      current.level !== original.level;

    setHasChanges(changed);
  };

  const handlePickFromGallery = async () => {
    setPhotoModalVisible(false);
    const uri = await pickImageFromGallery();
    if (uri) {
      handleUploadPhoto(uri);
    }
  };

  const handleTakePhoto = async () => {
    setPhotoModalVisible(false);
    const uri = await takePhoto();
    if (uri) {
      handleUploadPhoto(uri);
    }
  };

  const handleUploadPhoto = async (uri: string) => {
    if (!user) return;

    setTempPhotoUri(uri);
    setUploadingPhoto(true);

    try {
      const result = await uploadProfilePhoto(user.uid, uri);
      if (result.success) {
        await refreshUserData();
        Alert.alert("Éxito", "Foto de perfil actualizada");
      } else {
        Alert.alert("Error", result.error || "No se pudo subir la foto");
        setTempPhotoUri(null);
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      Alert.alert("Error", "No se pudo subir la foto");
      setTempPhotoUri(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!displayName.trim()) {
      Alert.alert("Error", "El nombre es requerido");
      return;
    }

    setSaving(true);
    try {
      await updateUser(user.uid, {
        displayName: displayName.trim(),
        phone: phone.trim(),
        level,
      });

      await refreshUserData();
      setHasChanges(false);
      Alert.alert("Éxito", "Datos actualizados correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error updating user:", error);
      Alert.alert("Error", "No se pudieron guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const levels: Level[] = ["Scaled", "Intermedio", "RX"];
  const currentPhotoUrl = tempPhotoUri || userData?.photoURL;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Datos Personales</Text>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasChanges || saving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasChanges || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Check size={20} color={hasChanges ? "#ffffff" : "#9ca3af"} />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => setPhotoModalVisible(true)}
              disabled={uploadingPhoto}
            >
              {currentPhotoUrl ? (
                <Image
                  source={{ uri: currentPhotoUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarLarge}>
                  <Text style={styles.avatarInitials}>
                    {displayName?.charAt(0).toUpperCase() || "U"}
                  </Text>
                </View>
              )}
              {uploadingPhoto && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color="#ffffff" />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Camera size={14} color="#ffffff" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPhotoModalVisible(true)}
              disabled={uploadingPhoto}
            >
              <Text style={styles.changePhotoText}>
                {uploadingPhoto ? "Subiendo..." : "Cambiar foto"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Photo Picker Modal */}
          <Modal
            visible={photoModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setPhotoModalVisible(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setPhotoModalVisible(false)}
            >
              <View style={styles.photoModalContent}>
                <View style={styles.photoModalHeader}>
                  <Text style={styles.photoModalTitle}>Cambiar foto</Text>
                  <TouchableOpacity onPress={() => setPhotoModalVisible(false)}>
                    <X size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.photoOption}
                  onPress={handleTakePhoto}
                >
                  <View
                    style={[
                      styles.photoOptionIcon,
                      { backgroundColor: "#dbeafe" },
                    ]}
                  >
                    <Camera size={24} color="#2563eb" />
                  </View>
                  <View>
                    <Text style={styles.photoOptionTitle}>Tomar foto</Text>
                    <Text style={styles.photoOptionSubtitle}>
                      Usa la cámara de tu dispositivo
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.photoOption}
                  onPress={handlePickFromGallery}
                >
                  <View
                    style={[
                      styles.photoOptionIcon,
                      { backgroundColor: "#fef2f2" },
                    ]}
                  >
                    <ImageIcon size={24} color="#dc2626" />
                  </View>
                  <View>
                    <Text style={styles.photoOptionTitle}>
                      Elegir de galería
                    </Text>
                    <Text style={styles.photoOptionSubtitle}>
                      Selecciona una imagen existente
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>INFORMACIÓN BÁSICA</Text>

            {/* Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre completo</Text>
              <TextInput
                style={styles.textInput}
                value={displayName}
                onChangeText={(text) => {
                  setDisplayName(text);
                  checkChanges("displayName", text);
                }}
                placeholder="Tu nombre completo"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
              />
            </View>

            {/* Email Field (read-only) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <View style={styles.readOnlyInput}>
                <Text style={styles.readOnlyText}>{user?.email || ""}</Text>
                <Text style={styles.readOnlyBadge}>Verificado</Text>
              </View>
              <Text style={styles.helperText}>
                El correo no se puede modificar
              </Text>
            </View>

            {/* Phone Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Teléfono</Text>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  checkChanges("phone", text);
                }}
                placeholder="10 dígitos"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* Level Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>NIVEL DE ENTRENAMIENTO</Text>
            <Text style={styles.sectionSubtitle}>
              Selecciona tu nivel actual para personalizar tu experiencia
            </Text>

            <View style={styles.levelContainer}>
              {levels.map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[
                    styles.levelOption,
                    level === lvl && styles.levelOptionSelected,
                  ]}
                  onPress={() => {
                    setLevel(lvl);
                    checkChanges("level", lvl);
                  }}
                >
                  <View
                    style={[
                      styles.levelRadio,
                      level === lvl && styles.levelRadioSelected,
                    ]}
                  >
                    {level === lvl && <View style={styles.levelRadioInner} />}
                  </View>
                  <View style={styles.levelInfo}>
                    <Text
                      style={[
                        styles.levelName,
                        level === lvl && styles.levelNameSelected,
                      ]}
                    >
                      {lvl}
                    </Text>
                    <Text style={styles.levelDescription}>
                      {lvl === "Scaled"
                        ? "Movimientos adaptados, peso ligero"
                        : lvl === "Intermedio"
                        ? "Técnica sólida, peso moderado"
                        : "Sin escalas, máxima intensidad"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Account Info */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>INFORMACIÓN DE CUENTA</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Membresía</Text>
              <View style={styles.membershipBadge}>
                <Text style={styles.membershipText}>
                  {userData?.membershipType === "pro"
                    ? "Pro"
                    : userData?.membershipType === "premium"
                    ? "Premium"
                    : userData?.membershipType === "unlimited"
                    ? "Ilimitado"
                    : "Básico"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total de clases</Text>
              <Text style={styles.infoValue}>
                {userData?.totalClasses || 0} clases
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Racha actual</Text>
              <Text style={styles.infoValue}>
                {userData?.streak || 0} días 🔥
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#e5e7eb",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarInitials: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#ffffff",
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
  },
  formSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#9ca3af",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
    marginTop: -8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  readOnlyInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  readOnlyText: {
    fontSize: 15,
    color: "#6b7280",
  },
  readOnlyBadge: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#22c55e",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  helperText: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 6,
  },
  levelContainer: {
    gap: 12,
  },
  levelOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  levelOptionSelected: {
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
  },
  levelRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  levelRadioSelected: {
    borderColor: "#dc2626",
  },
  levelRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#dc2626",
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 2,
  },
  levelNameSelected: {
    color: "#dc2626",
  },
  levelDescription: {
    fontSize: 13,
    color: "#6b7280",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  membershipBadge: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  membershipText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#dc2626",
  },
  // Photo picker styles
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#dc2626",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  photoModalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  photoModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  photoModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  photoOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#f9fafb",
    marginBottom: 12,
    gap: 16,
  },
  photoOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  photoOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  photoOptionSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
});
