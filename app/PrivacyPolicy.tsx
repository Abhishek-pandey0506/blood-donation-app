import Colors from "@/src/_utils/colors";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function PrivacyPolicy() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width >= 640; // e.g., tablet or web

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.card, isSmallScreen && styles.cardWide]}>
        <Text style={styles.title}>Privacy Policy</Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.text}>
          We are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and protect the information you provide while using our Blood Donation App.
        </Text>

        <Text style={styles.sectionTitle}>2. Data We Collect</Text>
        <Text style={styles.text}>
          We may collect personal information such as your name, contact details, location, and donation history when you register or use our services.
        </Text>

        <Text style={styles.sectionTitle}>3. Use of Information</Text>
        <Text style={styles.text}>
          Your data is used to match you with donation centers, notify you of upcoming donation drives, and improve our app features.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.text}>
          We use secure protocols and encryption to protect your data. However, no method of transmission over the internet is 100% secure.
        </Text>

        <Text style={styles.sectionTitle}>5. Third-Party Sharing</Text>
        <Text style={styles.text}>
          We do not sell your data. Limited sharing may occur with medical partners or government bodies in compliance with legal obligations.
        </Text>

        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.text}>
          You have the right to access, modify, or delete your personal data. Contact us at privacy@bloodapp.org to make a request.
        </Text>

        <Text style={styles.sectionTitle}>7. Changes to This Policy</Text>
        <Text style={styles.text}>
          We may update this policy from time to time. We encourage you to review it periodically.
        </Text>

        {/* <Text style={styles.footer}>Last Updated: May 9, 2025</Text> */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#FAFAFA",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    width: "100%",
    alignSelf: "center",
  },
  cardWide: {
    maxWidth: 800,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 6,
    color: "#333",
  },
  text: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  footer: {
    marginTop: 30,
    fontSize: 13,
    color: "#888",
    textAlign: "center",
  },
});
