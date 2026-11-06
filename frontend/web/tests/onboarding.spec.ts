import { test, expect } from '@playwright/test'

test('register employee and complete the onboarding process', async ({ page }) => {
  test.setTimeout(180_000)
  const uniqueEmail = `qa.playwright.${Date.now()}@example.com`

  const completeAllTasks = async () => {
    const completeButtons = page.getByRole('button', { name: 'Complete' })

    while (await completeButtons.count() > 0) {
      // Capture the task's name so the locator remains tied to the same card
      // when React refreshes the list after the API update.
      const firstPendingButton = completeButtons.first()
      const firstPendingCard = page.locator('.task-card').filter({
        has: firstPendingButton,
      })
      const taskName = await firstPendingCard.locator('.task-details strong').innerText()
      const taskCard = page.locator('.task-card').filter({
        has: page.getByText(taskName, { exact: true }),
      })
      const taskButton = taskCard.getByRole('button', { name: 'Complete' })

      await taskButton.click()
      await expect(taskButton).toHaveCount(0, { timeout: 20_000 })
      await expect(taskCard).toContainText('COMPLETED')
      console.log(`Completed task: ${taskName}`)
    }
  }

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

  // Complete all onboarding steps.
  await expect(page.locator('.task-card').first()).toBeVisible()
  await completeAllTasks()

  // Complete all joining checklist items.
  await page.getByRole('button', { name: 'Joining Checklist' }).click()
  await expect(page.locator('.task-card').first()).toBeVisible()
  await completeAllTasks()

  await expect(page.getByText('Employee Onboarding Completed!')).toBeVisible()
  await page.getByRole('button', { name: 'Confirm Onboarding' }).click()
  await expect(page.getByText('Onboarding officially confirmed.')).toBeVisible()
})

test('employee registration rejects an invalid email address', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Employees' }).click()
  await page.getByRole('button', { name: '+ Add Employee' }).click()

  await page.getByLabel('First Name').fill('Invalid')
  await page.getByLabel('Last Name').fill('Email')
  await page.getByLabel('Email Address').fill('not-an-email')

  const isValid = await page.getByLabel('Email Address').evaluate((element) =>
    (element as HTMLInputElement).checkValidity(),
  )
  expect(isValid).toBe(false)
})
