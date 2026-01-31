import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerTintColor: "#6750A4",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Kire",
          headerTitleAlign: "left",
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/info")}
              hitSlop={20}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#6750A4"
              />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="info"
        options={{
          title: "About",
        }}
      />
    </Stack>
  );
}
