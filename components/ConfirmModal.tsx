import {
  AlertTriangle,
  CalendarDays,
  CheckCircle,
  Clock,
  MapPin,
  User,
  X,
  XCircle,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type ModalType =
  | "reserve"
  | "cancel"
  | "checkin"
  | "success"
  | "error"
  | "info"
  | "confirm";

interface ClassInfo {
  nombre: string;
  horaInicio: string;
  horaFin: string;
  instructor: string;
}

interface ConfirmModalProps {
  visible: boolean;
  type: ModalType;
  title?: string;
  message?: string;
  clase?: ClassInfo | null;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  type,
  title,
  message,
  clase,
  loading = false,
  confirmText,
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [isModalVisible, setIsModalVisible] = useState(visible);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.85)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  const isSuccess = type === "success";
  const isError = type === "error";
  const isInfo = type === "info";

  // Configuración por tipo
  const configs: Record<
    ModalType,
    {
      icon: any;
      iconColor: string;
      bgColor: string;
      title: string;
      message: string;
      confirmText: string;
      buttonColor: string;
    }
  > = {
    reserve: {
      icon: CalendarDays,
      iconColor: "#d97706",
      bgColor: "#fef3c7",
      title: "Confirmar Reservación",
      message: "¿Deseas reservar esta clase?",
      confirmText: "Reservar",
      buttonColor: "#dc2626",
    },
    cancel: {
      icon: X,
      iconColor: "#dc2626",
      bgColor: "#fee2e2",
      title: "Cancelar Reservación",
      message: "¿Estás seguro de cancelar tu reservación?",
      confirmText: "Sí, cancelar",
      buttonColor: "#ef4444",
    },
    checkin: {
      icon: MapPin,
      iconColor: "#16a34a",
      bgColor: "#dcfce7",
      title: "¡Ya llegué!",
      message: "Confirma tu asistencia",
      confirmText: "¡Estoy aquí!",
      buttonColor: "#16a34a",
    },
    success: {
      icon: CheckCircle,
      iconColor: "#16a34a",
      bgColor: "#dcfce7",
      title: "¡Listo!",
      message: "Operación realizada exitosamente",
      confirmText: "Entendido",
      buttonColor: "#16a34a",
    },
    error: {
      icon: XCircle,
      iconColor: "#dc2626",
      bgColor: "#fee2e2",
      title: "Error",
      message: "Ocurrió un error. Por favor intenta de nuevo.",
      confirmText: "Entendido",
      buttonColor: "#dc2626",
    },
    info: {
      icon: AlertTriangle,
      iconColor: "#d97706",
      bgColor: "#fef3c7",
      title: "Información",
      message: "",
      confirmText: "Entendido",
      buttonColor: "#d97706",
    },
    confirm: {
      icon: AlertTriangle,
      iconColor: "#2563eb",
      bgColor: "#dbeafe",
      title: "Confirmar",
      message: "",
      confirmText: "Confirmar",
      buttonColor: "#2563eb",
    },
  };

  const currentConfig = configs[type];
  const IconComponent = currentConfig.icon;
  const displayTitle = title || currentConfig.title;
  const displayMessage = message || currentConfig.message;
  const displayConfirmText = confirmText || currentConfig.confirmText;

  const isConfirm = type === "confirm";
  const showTwoButtons = (!isSuccess && !isError && !isInfo) || isConfirm;
  const showSingleButton = (isSuccess || isError || isInfo) && !isConfirm;

  // Animación de entrada
  useEffect(() => {
    if (visible) {
      setIsModalVisible(true);
      backdropOpacity.setValue(0);
      modalScale.setValue(0.85);
      modalOpacity.setValue(0);
      iconScale.setValue(0);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(modalScale, {
          toValue: 1,
          tension: 300,
          friction: 20,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.sequence([
        Animated.delay(80),
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 400,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(modalScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsModalVisible(false);
      onCancel();
    });
  };

  const handleConfirm = () => {
    if (showSingleButton) {
      handleClose();
    } else if (onConfirm) {
      onConfirm();
    }
  };

  if (!isModalVisible && !visible) return null;

  return (
    <Modal
      visible={isModalVisible}
      transparent
      statusBarTranslucent
      animationType="none"
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={styles.backdropPressable} onPress={handleClose} />
      </Animated.View>

      <View style={styles.centeredContainer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: modalOpacity,
              transform: [{ scale: modalScale }],
            },
          ]}
        >
          {/* Icono */}
          <Animated.View
            style={[
              styles.iconContainer,
              { backgroundColor: currentConfig.bgColor },
              { transform: [{ scale: iconScale }] },
            ]}
          >
            <IconComponent size={32} color={currentConfig.iconColor} />
          </Animated.View>

          {/* Título */}
          <Text style={styles.title}>{displayTitle}</Text>

          {/* Mensaje */}
          <Text style={styles.message}>{displayMessage}</Text>

          {/* Info de la clase */}
          {clase && !isSuccess && !isError && !isInfo && (
            <View style={styles.classInfo}>
              <Text style={styles.className}>{clase.nombre}</Text>
              <View style={styles.classDetail}>
                <Clock size={14} color="#6b7280" />
                <Text style={styles.classDetailText}>
                  {clase.horaInicio} - {clase.horaFin}
                </Text>
              </View>
              <View style={styles.classDetail}>
                <User size={14} color="#6b7280" />
                <Text style={styles.classDetailText}>{clase.instructor}</Text>
              </View>
            </View>
          )}

          {/* Botón único para success/error/info */}
          {showSingleButton && (
            <Pressable
              onPress={handleClose}
              style={[
                styles.singleButton,
                { backgroundColor: currentConfig.buttonColor },
              ]}
            >
              <Text style={styles.buttonTextWhite}>{displayConfirmText}</Text>
            </Pressable>
          )}

          {/* Dos botones para reserve/cancel/checkin */}
          {showTwoButtons && (
            <View style={styles.buttonRow}>
              {/* Botón Cancelar - Gris */}
              <Pressable
                onPress={handleClose}
                disabled={loading}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </Pressable>

              {/* Botón Confirmar - Color según tipo */}
              <Pressable
                onPress={handleConfirm}
                disabled={loading}
                style={[
                  styles.confirmButton,
                  type === "reserve" && { backgroundColor: "#dc2626" },
                  type === "cancel" && { backgroundColor: "#ef4444" },
                  type === "checkin" && { backgroundColor: "#16a34a" },
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    {displayConfirmText}
                  </Text>
                )}
              </Pressable>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdropPressable: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  classInfo: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    marginBottom: 20,
  },
  className: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  classDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  classDetailText: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 6,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
  },
  singleButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginRight: 6,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginLeft: 6,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  buttonTextWhite: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
});
