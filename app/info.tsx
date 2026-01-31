import React from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import licenses from "../assets/licenses.json";
import Constants from "expo-constants";

export default function InfoScreen() {
  const version = Constants.expoConfig?.version || "1.0.0";
  const name = Constants.expoConfig?.name || "Kire";

  return (
    <View style={styles.container}>
      <FlatList
        data={licenses}
        keyExtractor={(item) => item.name}
        ListHeaderComponent={
          <View style={styles.header}>
            <Image
              source={require("../assets/images/icon.png")}
              style={styles.icon}
            />
            <Text style={styles.appName}>{name}</Text>
            <Text style={styles.appVersion}>Version {version}</Text>

            <View style={styles.separator} />

            <Text style={styles.licensesTitle}>Open Source Licenses</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.licenseItem}>
            <Text style={styles.depName}>
              {item.name} <Text style={styles.depVersion}>v{item.version}</Text>
            </Text>
            <Text style={styles.licenseType}>{item.license}</Text>
            <Text style={styles.licenseText} numberOfLines={10}>
              {item.licenseText}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContent: {
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  appVersion: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    width: "100%",
    marginVertical: 24,
  },
  licensesTitle: {
    fontSize: 20,
    fontWeight: "600",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  licenseItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  depName: {
    fontSize: 16,
    fontWeight: "600",
  },
  depVersion: {
    fontWeight: "400",
    color: "#888",
    fontSize: 14,
  },
  licenseType: {
    fontSize: 14,
    color: "#6750A4",
    marginVertical: 4,
    fontWeight: "500",
  },
  licenseText: {
    fontSize: 12,
    color: "#444",
    fontFamily: "monospace",
  },
});
