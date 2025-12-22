import { Flame } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

interface StreakCelebrationProps {
  visible: boolean;
  streakCount: number;
  onComplete: () => void;
}

interface FireParticle {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

export function StreakCelebration({
  visible,
  streakCount,
  onComplete,
}: StreakCelebrationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const numberAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Fire particles
  const [particles] = useState<FireParticle[]>(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      size: 20 + Math.random() * 30,
      delay: Math.random() * 500,
      duration: 1500 + Math.random() * 1000,
      color: ["#f97316", "#ef4444", "#fbbf24", "#f59e0b"][
        Math.floor(Math.random() * 4)
      ],
    }))
  );

  const particleAnims = useRef(
    particles.map(() => ({
      translateY: new Animated.Value(height),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      bounceAnim.setValue(0);
      numberAnim.setValue(0);
      glowAnim.setValue(0);

      // Main celebration animation
      Animated.sequence([
        // Fade in
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 200,
            friction: 10,
            useNativeDriver: true,
          }),
        ]),
        // Bounce the number
        Animated.sequence([
          Animated.spring(bounceAnim, {
            toValue: 1,
            tension: 300,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(numberAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // Glow effect
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.5,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        ),
        // Fade out
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete();
      });

      // Fire particles animation
      particleAnims.forEach((anim, i) => {
        anim.translateY.setValue(height);
        anim.opacity.setValue(0);
        anim.scale.setValue(0);

        Animated.sequence([
          Animated.delay(particles[i].delay),
          Animated.parallel([
            Animated.timing(anim.translateY, {
              toValue: height * 0.3 + Math.random() * height * 0.3,
              duration: particles[i].duration,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(anim.opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.delay(particles[i].duration - 600),
              Animated.timing(anim.opacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(anim.scale, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
        {/* Fire Particles */}
        {particles.map((particle, i) => (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                left: particle.x,
                opacity: particleAnims[i].opacity,
                transform: [
                  { translateY: particleAnims[i].translateY },
                  { scale: particleAnims[i].scale },
                ],
              },
            ]}
          >
            <Flame size={particle.size} color={particle.color} />
          </Animated.View>
        ))}

        {/* Main Content */}
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Glowing Fire Icon */}
          <Animated.View
            style={[
              styles.fireContainer,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
                transform: [
                  {
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.15],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.fireGlow} />
            <Flame size={80} color="#f97316" style={styles.fireIcon} />
          </Animated.View>

          {/* Streak Number */}
          <Animated.View
            style={[
              styles.numberContainer,
              {
                transform: [
                  {
                    scale: bounceAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1.2, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.streakNumber}>{streakCount}</Text>
            <Text style={styles.streakLabel}>días de racha</Text>
          </Animated.View>

          {/* Celebration Text */}
          <Animated.View
            style={{
              opacity: numberAnim,
              transform: [
                {
                  translateY: numberAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <Text style={styles.celebrationText}>
              {streakCount >= 10
                ? "🔥 ¡IMPARABLE!"
                : streakCount >= 5
                ? "🔥 ¡EN FUEGO!"
                : "¡Sigue así!"}
            </Text>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  particle: {
    position: "absolute",
  },
  content: {
    alignItems: "center",
  },
  fireContainer: {
    position: "relative",
    marginBottom: 20,
  },
  fireGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f97316",
    opacity: 0.3,
    top: -20,
    left: -20,
  },
  fireIcon: {
    zIndex: 10,
  },
  numberContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  streakNumber: {
    fontSize: 72,
    fontWeight: "bold",
    color: "#ffffff",
    textShadowColor: "#f97316",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  streakLabel: {
    fontSize: 18,
    color: "#f97316",
    fontWeight: "600",
    marginTop: -8,
  },
  celebrationText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
});
