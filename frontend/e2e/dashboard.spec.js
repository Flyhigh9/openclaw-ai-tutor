import {
  test,
  expect,
} from "@playwright/test";

test.describe(
  "OpenClaw AI Tutor Dashboard",
  () => {
    test(
      "dashboard loads successfully",
      async ({ page }) => {
        await page.goto("/");

        await expect(
          page.getByRole(
            "heading",
            {
              name:
                "Student Learning Dashboard",
            }
          )
        ).toBeVisible();

        await expect(
          page
            .getByText(
              "OpenClaw AI Tutor",
              {
                exact: false,
              }
            )
            .first()
        ).toBeVisible();
      }
    );

    test(
      "student list is displayed",
      async ({ page }) => {
        await page.goto("/");

        const studentSection =
          page.locator("#students");

        await expect(
          studentSection.getByRole(
            "heading",
            {
              name: "Students",
              exact: true,
            }
          )
        ).toBeVisible();

        await expect(
          studentSection.getByText(
            "Emma Virtanen",
            {
              exact: true,
            }
          )
        ).toBeVisible();

        await expect(
          studentSection.getByText(
            "Liam Nguyen",
            {
              exact: true,
            }
          )
        ).toBeVisible();
      }
    );

    test(
      "student detail view opens",
      async ({ page }) => {
        await page.goto("/");

        const liamRow =
          page
            .getByRole("row")
            .filter({
              hasText:
                "Liam Nguyen",
            });

        await liamRow
          .getByRole(
            "button",
            {
              name:
                "View Details",
            }
          )
          .click();

        const studentSection =
          page.locator(
            "#students"
          );

        await expect(
          studentSection.getByText(
            "Student Detail",
            {
              exact: true,
            }
          )
        ).toBeVisible();

        await expect(
          studentSection.getByRole(
            "heading",
            {
              name:
                "Liam Nguyen",
              exact: true,
            }
          )
        ).toBeVisible();
      }
    );

    test(
      "student detail shows progress and risk information",
      async ({ page }) => {
        await page.goto("/");

        const liamRow =
          page
            .getByRole("row")
            .filter({
              hasText:
                "Liam Nguyen",
            });

        await liamRow
          .getByRole(
            "button",
            {
              name:
                "View Details",
            }
          )
          .click();

        const studentSection =
          page.locator(
            "#students"
          );

        await expect(
          studentSection.getByText(
            "Average Progress",
            {
              exact: true,
            }
          )
        ).toBeVisible();

        await expect(
          studentSection.getByText(
            "Risk Level",
            {
              exact: true,
            }
          )
        ).toBeVisible();

        await expect(
          studentSection.getByText(
            "Overdue",
            {
              exact: true,
            }
          )
        ).toBeVisible();

        await expect(
          studentSection.getByText(
            "Recommended Action",
            {
              exact: true,
            }
          )
        ).toBeVisible();
      }
    );

    test(
      "student detail shows learning trend",
      async ({ page }) => {
        await page.goto("/");

        const liamRow =
          page
            .getByRole("row")
            .filter({
              hasText:
                "Liam Nguyen",
            });

        await liamRow
          .getByRole(
            "button",
            {
              name:
                "View Details",
            }
          )
          .click();

        const studentSection =
          page.locator(
            "#students"
          );

        await expect(
          studentSection.getByRole(
            "heading",
            {
              name:
                "Learning Trend",
              exact: true,
            }
          )
        ).toBeVisible();

        await expect(
          studentSection.getByText(
            "STABLE",
            {
              exact: true,
            }
          )
        ).toBeVisible();
      }
    );

    test(
      "AI Learning Coach can be opened",
      async ({ page }) => {
        await page.goto("/");

        const liamRow =
          page
            .getByRole("row")
            .filter({
              hasText:
                "Liam Nguyen",
            });

        await liamRow
          .getByRole(
            "button",
            {
              name:
                "View Details",
            }
          )
          .click();

        const studentSection =
          page.locator(
            "#students"
          );

        await studentSection
          .getByRole(
            "button",
            {
              name:
                "View Coach",
            }
          )
          .click();

        await expect(
          studentSection.getByText(
            "Current Learning Situation",
            {
              exact: false,
            }
          )
        ).toBeVisible();
      }
    );

    test(
      "student detail view can be closed",
      async ({ page }) => {
        await page.goto("/");

        const liamRow =
          page
            .getByRole("row")
            .filter({
              hasText:
                "Liam Nguyen",
            });

        await liamRow
          .getByRole(
            "button",
            {
              name:
                "View Details",
            }
          )
          .click();

        const studentSection =
          page.locator(
            "#students"
          );

        await expect(
          studentSection.getByText(
            "Student Detail",
            {
              exact: true,
            }
          )
        ).toBeVisible();

        await studentSection
          .getByRole(
            "button",
            {
              name:
                "Close",
            }
          )
          .click();

        await expect(
          studentSection.getByText(
            "Student Detail",
            {
              exact: true,
            }
          )
        ).not.toBeVisible();
      }
    );
  }
);