import Colors from "@/src/_utils/colors";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function TermsAndConditions() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width >= 640;

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.card, isSmallScreen && styles.cardWide]}>
        <Text style={styles.title}>Terms and Conditions</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By using the Blood Donation App, you agree to be bound by these Terms and Conditions. If you do not agree, you may not use the app.
        </Text>

        <Text style={styles.sectionTitle}>2. Eligibility</Text>
<Text style={styles.text}>
  To use this app and participate in blood donation activities, users must be at least 18 years old and comply with all applicable health and eligibility guidelines set by local medical authorities and blood donation organizations.
</Text>


        <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
        <Text style={styles.text}>
          You agree to provide accurate personal information and refrain from misusing any feature of the app, including scheduling or canceling appointments irresponsibly.
        </Text>

        <Text style={styles.sectionTitle}>4. Medical Disclaimer</Text>
        <Text style={styles.text}>
          This app does not provide medical advice. Consult a qualified healthcare provider before donating blood or making health-related decisions.
        </Text>

        <Text style={styles.sectionTitle}>5. Privacy Policy</Text>
        <Text style={styles.text}>
          Your use of the app is also governed by our Privacy Policy, which outlines how we collect, store, and use your personal information.
        </Text>

        <Text style={styles.sectionTitle}>6. Termination</Text>
        <Text style={styles.text}>
          We reserve the right to suspend or terminate your access to the app at our discretion, especially in cases of policy violations or fraudulent behavior.
        </Text>

        <Text style={styles.sectionTitle}>7. Modifications</Text>
        <Text style={styles.text}>
          We may update these Terms at any time. Continued use of the app constitutes your acceptance of any revised terms.
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
