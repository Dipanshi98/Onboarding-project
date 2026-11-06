import { test, expect } from '@playwright/test'

test('register employee and complete the onboarding process', async ({ page }) => {
  const uniqueEmail = `qa.playwright.${Date.now()}@example.com`

  await page.goto('/')

  await page.getByRole('button', { name: 'Employees' }).click()
  await page.getByRole('button', { name: '+ Add Employee' }).click()

  await page.getByLabel('First Name').fill('Playwright')
  await page.getByLabel('Last Name').fill('Tester')
  await page.getByLabel('Email Address').fill(uniqueEmail)
  await page.getByLabel('Phone Number').fill('9876543210')
  await page.getByLabel('Department').fill('Quality Assurance')
  await page.getByLabel('Designation').fill('QA Engineer')
  await page.getByLabel('Joining Date').fill('2026-12-01')

  await page.getByRole('button', { name: 'Register Employee' }).click()

  await expect(page.getByText('Employee registered successfully!')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Employee Onboarding' })).toBeVisible()

  // Complete every onboarding step.
  const onboardingSteps = page.locator('.task-card')
  await expect(onboardingSteps.first()).toBeVisible()
  while (await page.getByRole('button', { name: 'Complete' }).count() > 0) {
    await page.getByRole('button', { name: 'Complete' }).first().click()
  }

  // Complete every joining checklist item.
  await page.getByRole('button', { name: 'Joining Checklist' }).click()
  while (await page.getByRole('button', { name: 'Complete' }).count() > 0) {
    await page.getByRole('button', { name: 'Complete' }).first().click()
  }

  await expect(page.getByText('Employee Onboarding Completed!')).toBeVisible()
  await page.getByRole('button', { name: 'Confirm Onboarding' }).click()
  await expect(page.getByText('Onboarding officially confirmed.')).toBeVisible()
})

test('employee registration blocks an invalid email address', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Employees' }).click()
  await page.getByRole('button', { name: '+ Add Employee' }).click()

  await page.getByLabel('First Name').fill('Invalid')
  await page.getByLabel('Last Name').fill('Email')
  await page.getByLabel('Email Address').fill('not-an-email')

  const emailInput = page.getByLabel('Email Address')
  await expect(emailInput).toHaveJSProperty('validity.valid', false)
  await expect(page.getByRole('button', { name: 'Register Employee' })).toBeEnabled()
})
