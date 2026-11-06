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

import { api, OnboardingStep, ChecklistItem } from "./Src/service/api";
import { styles } from "./Src/Styles/AppStyles";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const login = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Required", "Please enter your name and email.");
      return;
    }

    const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const nameParts = name.trim().split(/\\s+/);
      const employee = await api.createEmployee({
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(" "),
        email: email.trim().toLowerCase(),
        onboardingStatus: "PENDING",
      });

      setEmployeeId(employee.employeeId);
      setEmployeeName(`${employee.firstName} ${employee.lastName}`.trim());

      // Load saved onboarding data; create defaults only for a new employee.
      let employeeSteps = await api.getSteps(employee.employeeId);
      if (employeeSteps.length === 0) {
        employeeSteps = await api.createSteps(employee.employeeId);
      }

      let employeeChecklist = await api.getChecklist(employee.employeeId);
      if (employeeChecklist.length === 0) {
        employeeChecklist = await api.createChecklist(employee.employeeId);
      }

      setSteps(employeeSteps);
      setChecklist(employeeChecklist);
      setScreen("dashboard");
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = async (step: OnboardingStep) => {
    try {
      const nextStatus = step.status === "COMPLETED" ? "PENDING" : "COMPLETED";
      const updated = await api.updateStep(step.id, nextStatus);
      setSteps((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (error) {
      Alert.alert("Update Failed", error instanceof Error ? error.message : "Could not update this step.");
    }
  };

  const toggleChecklist = async (item: ChecklistItem) => {
    try {
      const nextStatus = item.status === "COMPLETED" ? "PENDING" : "COMPLETED";
      const updated = await api.updateChecklist(item.id, nextStatus);
      setChecklist((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
    } catch (error) {
      Alert.alert("Update Failed", error instanceof Error ? error.message : "Could not update this item.");
    }
  };

  const completedCount =
    steps.filter((step) => step.status === "COMPLETED").length +
    checklist.filter((item) => item.status === "COMPLETED").length;
  const totalCount = steps.length + checklist.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const confirmOnboarding = async () => {
    if (employeeId === null) return;
    try {
      setLoading(true);
      await api.confirmOnboarding(employeeId);
      setConfirmed(true);
      Alert.alert("Onboarding Confirmed", "Employee onboarding has been successfully completed.");
    } catch (error) {
      Alert.alert("Confirmation Failed", error instanceof Error ? error.message : "Please complete all tasks first.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setScreen("login");
    setEmployeeId(null);
    setEmployeeName("");
    setConfirmed(false);
    setSteps([]);
    setChecklist([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>SUMPOSITIVE</Text>
          <Text style={styles.headerSubtitle}>Employee Onboarding</Text>
        </View>
        {screen !== "login" && (
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>

      {screen === "login" ? (
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>Start your employee onboarding journey.</Text>

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

          <Text style={styles.note}>Your onboarding tasks are saved to the backend.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.greeting}>Hello, {employeeName}!</Text>
          <Text style={styles.subtitle}>Welcome to your onboarding dashboard.</Text>

          <View style={styles.progressCard}>
            <Text style={styles.cardTitle}>Overall Progress</Text>
            <Text style={styles.progressNumber}>{progress}%</Text>
            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.smallText}>{completedCount} of {totalCount} tasks completed</Text>
          </View>

          <Text style={styles.sectionTitle}>Onboarding Steps</Text>
          {steps.map((step) => {
            const done = step.status === "COMPLETED";
            return (
              <TouchableOpacity
                key={step.id}
                style={styles.taskCard}
                onPress={() => toggleStep(step)}
                disabled={loading}
              >
                <Text style={styles.taskName}>{step.stepName}</Text>
                <Text style={done ? styles.done : styles.pending}>
                  {done ? "✓ Completed" : "Mark Complete"}
                </Text>
              </TouchableOpacity>
            );
          })}

          <Text style={styles.sectionTitle}>Joining Checklist</Text>
          {checklist.map((item) => {
            const done = item.status === "COMPLETED";
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.taskCard}
                onPress={() => toggleChecklist(item)}
              >
                <Text style={styles.taskName}>{item.itemName}</Text>
                <Text style={done ? styles.done : styles.pending}>
                  {done ? "✓ Completed" : "Mark Complete"}
                </Text>
              </TouchableOpacity>
            );
          })}

          {progress === 100 && totalCount > 0 && (
            <View style={styles.successCard}>
              <Text style={styles.successText}>All onboarding tasks completed!</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}