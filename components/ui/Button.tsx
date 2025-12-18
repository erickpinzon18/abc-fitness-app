import { LucideIcon } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "right",
  loading = false,
  disabled = false,
  fullWidth = true,
  className = "",
}: ButtonProps) {
  const baseStyles = "flex-row items-center justify-center rounded-2xl";

  const variantStyles = {
    primary: "bg-avc-red shadow-lg shadow-red-200",
    secondary: "bg-gray-900",
    outline: "bg-white border border-red-100",
    ghost: "bg-transparent",
  };

  const textVariantStyles = {
    primary: "text-white",
    secondary: "text-white",
    outline: "text-avc-red",
    ghost: "text-avc-red",
  };

  const sizeStyles = {
    sm: "py-2.5 px-4",
    md: "py-4 px-6",
    lg: "py-4 px-8",
  };

  const textSizeStyles = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const iconSize = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  const iconColor = {
    primary: "#ffffff",
    secondary: "#ffffff",
    outline: "#dc2626",
    ghost: "#dc2626",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "opacity-50" : ""}
        ${className}
      `}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={iconColor[variant]} />
      ) : (
        <>
          {Icon && iconPosition === "left" && (
            <Icon
              size={iconSize[size]}
              color={iconColor[variant]}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            className={`font-montserrat-bold ${textVariantStyles[variant]} ${textSizeStyles[size]}`}
          >
            {title}
          </Text>
          {Icon && iconPosition === "right" && (
            <Icon
              size={iconSize[size]}
              color={iconColor[variant]}
              style={{ marginLeft: 8 }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
