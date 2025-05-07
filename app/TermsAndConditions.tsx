import { ScrollView, Text } from "react-native";

export default function TermsAndConditions() {
  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontWeight: "bold", fontSize: 18 }}>Terms and Conditions</Text>
      <Text style={{ marginTop: 10 }}>
        This is a placeholder for the Terms and Conditions. Add your legal terms here.
      </Text>
    </ScrollView>
  );
}
