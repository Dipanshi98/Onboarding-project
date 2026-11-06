const API_BASE_URL = "http://localhost:8080";
export interface Employee { employeeId: number; firstName: string; lastName: string; email: string; phone?: string; department?: string; designation?: string; joiningDate?: string; onboardingStatus?: string; }
export interface OnboardingStep { id: number; employeeId: number; stepName: string; description: string; status: string; }
export interface ChecklistItem { id: number; employeeId: number; itemName: string; status: string; }

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json() as Promise<T>;
}

export const api = {
  getEmployees: () => request<Employee[]>("/api/employees"),
  getEmployee: (id: number) => request<Employee>(`/api/employees/${id}`),
  createEmployee: (employee: Partial<Employee>) => request<Employee>("/api/employees", { method: "POST", body: JSON.stringify(employee) }),
  confirmOnboarding: (id: number) => request<Employee>(`/api/employees/${id}/confirm-onboarding`, { method: "POST" }),
  getSteps: (employeeId: number) => request<OnboardingStep[]>(`/api/onboarding/${employeeId}/steps`),
  createSteps: (employeeId: number) => request<OnboardingStep[]>(`/api/onboarding/${employeeId}/steps`, { method: "POST" }),
  updateStep: (id: number, status: string) => request<OnboardingStep>(`/api/onboarding/steps/${id}?status=${encodeURIComponent(status)}`, { method: "PUT" }),
  getChecklist: (employeeId: number) => request<ChecklistItem[]>(`/api/checklist/${employeeId}`),
  createChecklist: (employeeId: number) => request<ChecklistItem[]>(`/api/checklist/${employeeId}`, { method: "POST" }),
  updateChecklist: (id: number, status: string) => request<ChecklistItem>(`/api/checklist/item/${id}?status=${encodeURIComponent(status)}`, { method: "PUT" }),
};
