import { Flame } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface StreakAnimationProps {
  streak: number;
  isAnimating?: boolean;
  onAnimationComplete?: () => void;
}

export function StreakAnimation({ streak, isAnimating = false, onAnimationComplete }: StreakAnimationProps) {
  // Animaciones
  const flameScale = useRef(new Animated.Value(1)).current;
  const flameRotation = useRef(new Animated.Value(0)).current;
  const numberScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  const isActive = streak > 0;

  useEffect(() => {
    if (isAnimating && isActive) {
      // Animación de celebración completa
      const flameAnimation = Animated.sequence([
        // Pulse inicial
        Animated.spring(flameScale, {
          toValue: 1.4,
          tension: 200,
          friction: 5,
          useNativeDriver: true,
        }),
        // Bounces
        Animated.spring(flameScale, {
          toValue: 0.9,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(flameScale, {
          toValue: 1.15,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(flameScale, {
          toValue: 1,
          tension: 200,
          friction: 10,
          useNativeDriver: true,
        }),
      ]);

      // Wiggle de la llama
      const wiggleAnimation = Animated.sequence([
        Animated.timing(flameRotation, { toValue: 0.1, duration: 50, useNativeDriver: true }),
        Animated.timing(flameRotation, { toValue: -0.1, duration: 50, useNativeDriver: true }),
        Animated.timing(flameRotation, { toValue: 0.1, duration: 50, useNativeDriver: true }),
        Animated.timing(flameRotation, { toValue: -0.1, duration: 50, useNativeDriver: true }),
        Animated.timing(flameRotation, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]);

      // Glow
      const glowAnimation = Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]);

      // Número bounce
      const numberAnimation = Animated.sequence([
        Animated.delay(100),
        Animated.spring(numberScale, {
          toValue: 1.3,
          tension: 300,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(numberScale, {
          toValue: 1,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
      ]);

      // Partículas (chispas)
      const createParticleAnimation = (particle: Animated.Value, delay: number) => {
        return Animated.sequence([
          Animated.delay(delay),
          Animated.timing(particle, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(particle, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]);
      };

      // Pulse ring
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 }
      );

      Animated.parallel([
        flameAnimation,
        wiggleAnimation,
        glowAnimation,
        numberAnimation,
        createParticleAnimation(particle1, 0),
        createParticleAnimation(particle2, 100),
        createParticleAnimation(particle3, 200),
        pulseAnimation,
      ]).start(() => {
        onAnimationComplete?.();
      });
    }
  }, [isAnimating]);

  // Animación idle suave para cuando hay racha activa
  useEffect(() => {
    if (isActive && !isAnimating) {
      const idleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(flameScale, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(flameScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      idleAnimation.start();
      return () => idleAnimation.stop();
    }
  }, [isActive, isAnimating]);

  // Interpolaciones para partículas
  const particle1Style = {
    opacity: particle1,
    transform: [
      { translateY: particle1.interpolate({ inputRange: [0, 1], outputRange: [0, -30] }) },
      { translateX: particle1.interpolate({ inputRange: [0, 1], outputRange: [0, -15] }) },
      { scale: particle1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] }) },
    ],
  };

  const particle2Style = {
    opacity: particle2,
    transform: [
      { translateY: particle2.interpolate({ inputRange: [0, 1], outputRange: [0, -35] }) },
      { translateX: particle2.interpolate({ inputRange: [0, 1], outputRange: [0, 5] }) },
      { scale: particle2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.2, 0] }) },
    ],
  };

  const particle3Style = {
    opacity: particle3,
    transform: [
      { translateY: particle3.interpolate({ inputRange: [0, 1], outputRange: [0, -25] }) },
      { translateX: particle3.interpolate({ inputRange: [0, 1], outputRange: [0, 15] }) },
      { scale: particle3.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.8, 0] }) },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Pulse ring */}
      {isAnimating && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              opacity: glowOpacity,
              transform: [{ scale: pulseScale }],
            },
          ]}
        />
      )}

      {/* Glow effect */}
      <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

      {/* Partículas/Chispas */}
      <Animated.View style={[styles.particle, particle1Style]}>
        <Text style={styles.particleText}>✨</Text>
      </Animated.View>
      <Animated.View style={[styles.particle, particle2Style]}>
        <Text style={styles.particleText}>🔥</Text>
      </Animated.View>
      <Animated.View style={[styles.particle, particle3Style]}>
        <Text style={styles.particleText}>⭐</Text>
      </Animated.View>

      {/* Flame icon */}
      <Animated.View
        style={[
          styles.flameContainer,
          {
            transform: [
              { scale: flameScale },
              { rotate: flameRotation.interpolate({
                  inputRange: [-0.1, 0, 0.1],
                  outputRange: ['-10deg', '0deg', '10deg'],
                }) 
              },
            ],
          },
        ]}
      >
        <Flame
          size={24}
          color={isActive ? "#dc2626" : "#9ca3af"}
          fill={isActive ? "#dc2626" : "none"}
        />
      </Animated.View>

      {/* Número de racha */}
      <Animated.View style={[styles.numberContainer, { transform: [{ scale: numberScale }] }]}>
        <Text style={styles.number}>{streak}</Text>
        <Text style={styles.unit}>{streak === 1 ? 'Día' : 'Días'}</Text>
      </Animated.View>

      {/* Label */}
      <Text style={[styles.label, isActive && styles.labelActive]}>Racha</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#dc2626',
    top: -10,
  },
  glow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fecaca',
    top: -5,
  },
  particle: {
    position: 'absolute',
    top: 0,
  },
  particleText: {
    fontSize: 12,
  },
  flameContainer: {
    marginBottom: 4,
  },
  numberContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  number: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: '#111827',
  },
  unit: {
    fontSize: 11,
    fontFamily: 'Montserrat_700Bold',
    color: '#111827',
  },
  label: {
    fontSize: 10,
    fontFamily: 'Montserrat_700Bold',
    textTransform: 'uppercase',
    color: '#9ca3af',
    marginTop: 2,
  },
  labelActive: {
    color: '#dc2626',
  },
});
