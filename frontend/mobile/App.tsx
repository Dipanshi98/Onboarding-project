
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";

import { api } from "./Src/service/api";
import { styles } from "./Src/Styles/AppStyles";

const onboardingSteps = [
  "Personal Information",
  "Document Verification",
  "IT Setup",
  "Training",
  "Final Review",
];

const checklistItems = [
  "Submit identity documents",
  "Collect laptop and access credentials",
  "Complete joining formalities",
];

export default function App() {
  const [screen, setScreen] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [completedItems, setCompletedItems] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleStep = (index: number) => {
    setCompletedSteps((old) =>
      old.includes(index)
        ? old.filter((item) => item !== index)
        : [...old, index]
    );
  };

  const toggleChecklist = (index: number) => {
    setCompletedItems((old) =>
      old.includes(index)
        ? old.filter((item) => item !== index)
        : [...old, index]
    );
  };

  const login = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Required", "Please enter your name and email.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const nameParts = name.trim().split(/\s+/);

      const employee = await api.createEmployee({
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(" "),
        email: email.trim().toLowerCase(),
        onboardingStatus: "PENDING",
      });

      setEmployeeName(
        `${employee.firstName} ${employee.lastName}`.trim()
      );

      setScreen("dashboard");

      Alert.alert("Success", "Employee registered successfully!");
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const progress = Math.round(
    ((completedSteps.length + completedItems.length) / 8) * 100
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>SUMPOSITIVE</Text>
          <Text style={styles.headerSubtitle}>
            Employee Onboarding
          </Text>
        </View>

        {screen !== "login" && (
          <TouchableOpacity onPress={() => setScreen("login")}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>

      {screen === "login" ? (
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Welcome!</Text>

          <Text style={styles.subtitle}>
            Start your employee onboarding journey.
          </Text>

          <Text style={styles.label}>Full Name</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />

          <Text style={styles.label}>Email Address</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={login}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            Employee registration is connected to the backend.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.greeting}>
            Hello, {employeeName}!
          </Text>

          <Text style={styles.subtitle}>
            Welcome to your onboarding dashboard.
          </Text>

          <View style={styles.progressCard}>
            <Text style={styles.cardTitle}>Overall Progress</Text>

            <Text style={styles.progressNumber}>
              {progress}%
            </Text>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` },
                ]}
              />
            </View>

            <Text style={styles.smallText}>
              {completedSteps.length + completedItems.length} of 8 tasks completed
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Onboarding Steps</Text>

          {onboardingSteps.map((step, index) => {
            const done = completedSteps.includes(index);

            return (
              <TouchableOpacity
                key={step}
                style={styles.taskCard}
                onPress={() => toggleStep(index)}
              >
                <Text style={styles.taskName}>{step}</Text>
                <Text style={done ? styles.done : styles.pending}>
                  {done ? "✓ Completed" : "Mark Complete"}
                </Text>
              </TouchableOpacity>
            );
          })}

          <Text style={styles.sectionTitle}>Joining Checklist</Text>

          {checklistItems.map((item, index) => {
            const done = completedItems.includes(index);

            return (
              <TouchableOpacity
                key={item}
                style={styles.taskCard}
                onPress={() => toggleChecklist(index)}
              >
                <Text style={styles.taskName}>{item}</Text>
                <Text style={done ? styles.done : styles.pending}>
                  {done ? "✓ Completed" : "Mark Complete"}
                </Text>
              </TouchableOpacity>
            );
          })}

          {progress === 100 && (
            <View style={styles.successCard}>
              <Text style={styles.successText}>
                All onboarding tasks completed!
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
