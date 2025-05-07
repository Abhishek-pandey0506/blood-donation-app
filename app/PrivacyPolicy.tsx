import { ScrollView, Text } from "react-native";

export default function PrivacyPolicy() {
  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontWeight: "bold", fontSize: 18 }}>Privacy Policy</Text>
      <Text style={{ marginTop: 10 }}>
        This is a placeholder for the Privacy Policy. You can include your actual policy text here.
      </Text>
    </ScrollView>
  );
}
