import { Eye, EyeOff, LucideIcon } from "lucide-react-native";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: LucideIcon;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  className?: string;
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  icon: Icon,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  className = "",
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = secureTextEntry;

  return (
    <View className={`space-y-2.5 ${className}`}>
      {label && (
        <Text className="text-sm font-montserrat-semibold text-gray-700 ml-1 mb-1">
          {label}
        </Text>
      )}
      <View className="relative">
        {Icon && (
          <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
            <Icon size={20} color="#9ca3af" />
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full py-4 bg-gray-50 border rounded-2xl text-gray-900 font-montserrat
            ${Icon ? "pl-12" : "pl-4"}
            ${isPassword ? "pr-12" : "pr-4"}
            ${isFocused ? "border-avc-red" : "border-gray-200"}
            ${error ? "border-red-500" : ""}
          `}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-0 bottom-0 justify-center"
          >
            {showPassword ? (
              <EyeOff size={20} color="#9ca3af" />
            ) : (
              <Eye size={20} color="#9ca3af" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-xs text-red-500 ml-1 font-montserrat">
          {error}
        </Text>
      )}
    </View>
  );
}
