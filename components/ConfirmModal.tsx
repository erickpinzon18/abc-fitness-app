import { AlertTriangle, CalendarDays, CheckCircle, Clock, MapPin, User, X, XCircle } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export type ModalType = 'reserve' | 'cancel' | 'checkin' | 'success' | 'error' | 'info';

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
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [isModalVisible, setIsModalVisible] = useState(visible);
  
  // Animaciones nativas - más rápidas y fluidas
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.85)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  const isSuccess = type === 'success';
  const isError = type === 'error';
  const isInfo = type === 'info';
  const isCancel = type === 'cancel';
  const isCheckin = type === 'checkin';

  // Configuración por tipo
  const config = {
    reserve: {
      icon: CalendarDays,
      iconColor: '#d97706',
      bgColor: '#fef3c7',
      title: 'Confirmar Reservación',
      message: '¿Deseas reservar esta clase?',
      confirmText: 'Reservar',
      buttonColor: '#dc2626',
    },
    cancel: {
      icon: X,
      iconColor: '#dc2626',
      bgColor: '#fee2e2',
      title: 'Cancelar Reservación',
      message: '¿Estás seguro de cancelar tu reservación?',
      confirmText: 'Sí, cancelar',
      buttonColor: '#ef4444',
    },
    checkin: {
      icon: MapPin,
      iconColor: '#16a34a',
      bgColor: '#dcfce7',
      title: '¡Ya llegué!',
      message: 'Confirma tu asistencia',
      confirmText: '¡Estoy aquí!',
      buttonColor: '#16a34a',
    },
    success: {
      icon: CheckCircle,
      iconColor: '#16a34a',
      bgColor: '#dcfce7',
      title: '¡Listo!',
      message: 'Operación realizada exitosamente',
      confirmText: 'Entendido',
      buttonColor: '#16a34a',
    },
    error: {
      icon: XCircle,
      iconColor: '#dc2626',
      bgColor: '#fee2e2',
      title: 'Error',
      message: 'Ocurrió un error. Por favor intenta de nuevo.',
      confirmText: 'Entendido',
      buttonColor: '#dc2626',
    },
    info: {
      icon: AlertTriangle,
      iconColor: '#d97706',
      bgColor: '#fef3c7',
      title: 'Información',
      message: '',
      confirmText: 'Entendido',
      buttonColor: '#d97706',
    },
  };

  const currentConfig = config[type];
  const IconComponent = currentConfig.icon;
  const displayTitle = title || currentConfig.title;
  const displayMessage = message || currentConfig.message;
  const displayConfirmText = confirmText || currentConfig.confirmText;

  const showButtons = !isSuccess && !isError && !isInfo;
  const showSingleButton = isSuccess || isError || isInfo;

  // Animación de entrada
  useEffect(() => {
    if (visible) {
      setIsModalVisible(true);
      // Reset valores
      backdropOpacity.setValue(0);
      modalScale.setValue(0.85);
      modalOpacity.setValue(0);
      iconScale.setValue(0);

      // Animación de entrada rápida y snappy
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

      // Animación del icono con bounce
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

  // Animación de salida
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
    <Modal visible={isModalVisible} transparent statusBarTranslucent animationType="none">
      {/* Backdrop animado */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={styles.backdropPressable} onPress={handleClose} />
      </Animated.View>

      {/* Contenido del modal */}
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
          {/* Icono animado */}
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
          <Text style={[styles.message, { marginBottom: clase ? 16 : 20 }]}>{displayMessage}</Text>

          {/* Info de la clase (si aplica) */}
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

          {/* Botón único (success/error/info) */}
          {showSingleButton && (
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.singleButton,
                { backgroundColor: currentConfig.buttonColor },
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonTextWhite}>{displayConfirmText}</Text>
            </Pressable>
          )}

          {/* Botones de acción */}
          {showButtons && (
            <View style={styles.buttonRow}>
              <Pressable
                onPress={handleClose}
                disabled={loading}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                disabled={loading}
                style={({ pressed }) => [
                  styles.confirmButton,
                  { backgroundColor: currentConfig.buttonColor },
                  pressed && styles.buttonPressed,
                  loading && styles.buttonLoading,
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.buttonTextWhite}>{displayConfirmText}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdropPressable: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#6b7280',
    textAlign: 'center',
  },
  classInfo: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  className: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    color: '#111827',
    marginBottom: 8,
  },
  classDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  classDetailText: {
    fontSize: 13,
    fontFamily: 'Montserrat_500Medium',
    color: '#6b7280',
    marginLeft: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  singleButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonLoading: {
    opacity: 0.7,
  },
  cancelButtonText: {
    fontSize: 15,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#374151',
    textAlign: 'center',
  },
  buttonTextWhite: {
    fontSize: 15,
    fontFamily: 'Montserrat_700Bold',
    color: '#ffffff',
    textAlign: 'center',
  },
});
