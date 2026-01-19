/**
 * API to UI Integration Tests
 * 
 * These tests demonstrate end-to-end integration by:
 * 1. Creating test data programmatically via API
 * 2. Verifying that data appears correctly in the browser UI
 * 3. Testing the Swagger UI interactive documentation
 * 
 * This pattern is useful for:
 * - Validating API documentation accuracy
 * - Testing API-UI data consistency
 * - Verifying interactive API explorers work correctly
 * - End-to-end user workflows
 */

import { test, expect } from '@playwright/test';
import { PetstoreClient } from '../../src/client/petstore.client';
import { PetFixtures } from '../../src/data/pet.fixtures';

test.describe('API to UI Integration Tests', () => {
  let createdPetId: number;
  let petName: string;

  /**
   * Test: Create pet via API and verify in Swagger UI
   * 
   * Demonstrates the complete API-to-UI integration flow:
   * - Creates a pet using the API client (programmatic)
   * - Opens the Swagger UI in a browser (visual)
   * - Navigates to the GET /pet/{petId} endpoint
   * - Executes the endpoint with the created pet's ID
   * - Verifies the response displayed in UI matches API-created data
   * 
   * This validates that:
   * - API operations work correctly
   * - Swagger UI documentation is functional
   * - Data created via API is immediately queryable
   * - UI displays accurate response data
   */
  test('should create pet via API and verify in Swagger UI', async ({ request, page }) => {
    // Step 1: Create a pet via API
    await test.step('Create pet via API', async () => {
      const client = new PetstoreClient(request);
      const petData = PetFixtures.createAvailablePet();
      petName = petData.name;

      const response = await client.createPet(petData);
      expect(response.status).toBe(200);
      expect(response.json).toHaveProperty('id');
      
      createdPetId = response.json!.id;
      console.log(`✅ Created pet via API: ID=${createdPetId}, Name=${petName}`);
    });

    // Step 2: Open Swagger Petstore UI
    await test.step('Navigate to Swagger Petstore UI', async () => {
      await page.goto('https://petstore.swagger.io/');
      
      // Wait for Swagger UI to load - try multiple possible selectors
      try {
        await expect(page.locator('.info .title, h2.title, .info__title')).toBeVisible({ timeout: 10000 });
      } catch {
        // If none of those work, wait for the main content area
        await page.waitForSelector('.swagger-ui', { timeout: 10000 });
      }
      
      console.log('✅ Loaded Swagger Petstore UI');
    });

    // Step 3: Navigate to the Pet section and find GET /pet/{petId}
    await test.step('Find GET /pet/{petId} endpoint', async () => {
      // Wait for the operations to be visible
      await page.waitForSelector('.opblock-tag-section', { timeout: 10000 });

      // Look for the pet section - try multiple possible selectors
      const petSection = page.locator('.opblock-tag-section').filter({ 
        has: page.locator('h3.opblock-tag:has-text("pet")') 
      }).first();

      await expect(petSection).toBeVisible({ timeout: 10000 });

      // Find the GET /pet/{petId} endpoint
      // The endpoint is in a div with class opblock-get and contains the path
      const getPetByIdEndpoint = petSection.locator('.opblock.opblock-get').filter({
        has: page.locator('.opblock-summary-path:has-text("/pet/{petId}")')
      }).first();

      await expect(getPetByIdEndpoint).toBeVisible({ timeout: 5000 });
      console.log('✅ Found GET /pet/{petId} endpoint');

      // Click to expand the endpoint
      await getPetByIdEndpoint.click();
      await page.waitForTimeout(500); // Brief wait for expansion animation
    });

    // Step 4: Click "Try it out", enter petId, and Execute
    await test.step('Execute GET request in UI', async () => {
      // Click "Try it out" button
      const tryItOutButton = page.locator('button.try-out__btn:has-text("Try it out")').first();
      await expect(tryItOutButton).toBeVisible({ timeout: 5000 });
      await tryItOutButton.click();
      console.log('✅ Clicked "Try it out"');

      // Wait for the input field to appear and enter the petId
      const petIdInput = page.locator('input[placeholder="petId"]').first();
      await expect(petIdInput).toBeVisible({ timeout: 5000 });
      await petIdInput.fill(createdPetId.toString());
      console.log(`✅ Entered petId: ${createdPetId}`);

      // Click Execute button
      const executeButton = page.locator('button.execute').first();
      await expect(executeButton).toBeVisible({ timeout: 5000 });
      await executeButton.click();
      console.log('✅ Clicked Execute');

      // Wait for response to appear
      await page.waitForSelector('.responses-wrapper', { timeout: 10000 });
      await page.waitForTimeout(1000); // Additional wait for response to render
    });

    // Step 5: Assert the response body contains pet name and id
    await test.step('Verify response in UI', async () => {
      // Wait for the response body to be visible
      const responseBody = page.locator('.responses-wrapper .response .response-col_description').first();
      await expect(responseBody).toBeVisible({ timeout: 10000 });

      // Get the response text
      const responseText = await responseBody.textContent();
      console.log('Response preview:', responseText?.substring(0, 200));

      // Assert response contains the pet ID
      expect(responseText).toContain(createdPetId.toString());
      console.log(`✅ Response contains pet ID: ${createdPetId}`);

      // Assert response contains the pet name
      expect(responseText).toContain(petName);
      console.log(`✅ Response contains pet name: ${petName}`);

      // Verify response code is 200
      const responseCode = page.locator('.responses-wrapper .response .response-col_status').first();
      await expect(responseCode).toContainText('200');
      console.log('✅ Response status: 200');
    });

    // Cleanup: Delete the pet via API
    await test.step('Cleanup: Delete pet via API', async () => {
      const client = new PetstoreClient(request);
      await client.deletePet(createdPetId);
      console.log(`✅ Cleaned up pet ${createdPetId}`);
    });
  });

  /**
   * Test: Handle non-existent pet gracefully in UI
   * 
   * Validates error handling in the Swagger UI:
   * - Attempts to GET a pet with a non-existent ID
   * - Verifies UI displays proper 404 error response
   * - Confirms error message is shown correctly
   * 
   * Important for validating:
   * - Error responses are properly formatted
   * - UI handles failures gracefully
   * - Users get meaningful error messages
   */
  test('should handle non-existent pet gracefully in UI', async ({ request, page }) => {
    const nonExistentPetId = 999999999;

    // Step 1: Navigate to Swagger UI
    await test.step('Navigate to Swagger Petstore UI', async () => {
      await page.goto('https://petstore.swagger.io/');
      
      // Wait for Swagger UI to load
      try {
        await expect(page.locator('.info .title, h2.title, .info__title')).toBeVisible({ timeout: 10000 });
      } catch {
        await page.waitForSelector('.swagger-ui', { timeout: 10000 });
      }
    });

    // Step 2: Find and expand GET /pet/{petId}
    await test.step('Find GET /pet/{petId} endpoint', async () => {
      await page.waitForSelector('.opblock-tag-section', { timeout: 10000 });

      const petSection = page.locator('.opblock-tag-section').filter({ 
        has: page.locator('h3.opblock-tag:has-text("pet")') 
      }).first();

      const getPetByIdEndpoint = petSection.locator('.opblock.opblock-get').filter({
        has: page.locator('.opblock-summary-path:has-text("/pet/{petId}")')
      }).first();

      await getPetByIdEndpoint.click();
      await page.waitForTimeout(500);
    });

    // Step 3: Try it out with non-existent ID
    await test.step('Execute GET request with non-existent ID', async () => {
      const tryItOutButton = page.locator('button.try-out__btn:has-text("Try it out")').first();
      await tryItOutButton.click();

      const petIdInput = page.locator('input[placeholder="petId"]').first();
      await petIdInput.fill(nonExistentPetId.toString());
      console.log(`Entered non-existent petId: ${nonExistentPetId}`);

      const executeButton = page.locator('button.execute').first();
      await executeButton.click();

      await page.waitForSelector('.responses-wrapper', { timeout: 10000 });
      await page.waitForTimeout(1000);
    });

    // Step 4: Verify 404 response
    await test.step('Verify 404 response in UI', async () => {
      const responseCode = page.locator('.responses-wrapper .response .response-col_status').first();
      await expect(responseCode).toContainText('404', { timeout: 10000 });
      console.log('✅ Correctly received 404 for non-existent pet');

      const responseBody = page.locator('.responses-wrapper .response .response-col_description').first();
      const responseText = await responseBody.textContent();
      
      // Verify error response structure
      expect(responseText).toContain('Pet not found');
      console.log('✅ Response contains error message');
    });
  });

  /**
   * Test: Create and update pet via API, then verify updates in UI
   * 
   * Tests the full lifecycle with updates:
   * - Creates a pet with original data via API
   * - Updates the pet (name and status) via API
   * - Verifies UI shows UPDATED data, not original
   * 
   * This ensures:
   * - Updates are immediately reflected in the system
   * - UI queries return the latest data
   * - No caching issues prevent seeing updates
   * - Complete CRUD cycle works end-to-end
   */
  test('should create and update pet via API, then verify updates in UI', async ({ request, page }) => {
    let petId: number;
    const originalName = `OriginalDog_${Date.now()}`;
    const updatedName = `UpdatedDog_${Date.now()}`;

    // Step 1: Create pet via API
    await test.step('Create pet via API', async () => {
      const client = new PetstoreClient(request);
      const petData = PetFixtures.createPet({
        name: originalName,
        photoUrls: ['https://example.com/photo.jpg'],
        status: 'available'
      });
      const response = await client.createPet(petData);
      
      petId = response.json!.id;
      console.log(`✅ Created pet: ID=${petId}, Name=${originalName}`);
    });

    // Step 2: Update pet via API
    await test.step('Update pet via API', async () => {
      const client = new PetstoreClient(request);
      const updatedPetData = PetFixtures.createPet({
        id: petId,
        name: updatedName,
        photoUrls: ['https://example.com/updated.jpg'],
        status: 'pending'
      });
      await client.updatePet(updatedPetData);
      console.log(`✅ Updated pet to: Name=${updatedName}, Status=pending`);
    });

    // Step 3: Verify updated data in Swagger UI
    await test.step('Verify updated data in UI', async () => {
      await page.goto('https://petstore.swagger.io/');
      await page.waitForSelector('.opblock-tag-section', { timeout: 10000 });

      const petSection = page.locator('.opblock-tag-section').filter({ 
        has: page.locator('h3.opblock-tag:has-text("pet")') 
      }).first();

      const getPetByIdEndpoint = petSection.locator('.opblock.opblock-get').filter({
        has: page.locator('.opblock-summary-path:has-text("/pet/{petId}")')
      }).first();

      await getPetByIdEndpoint.click();
      await page.waitForTimeout(500);

      // Try it out
      await page.locator('button.try-out__btn:has-text("Try it out")').first().click();
      await page.locator('input[placeholder="petId"]').first().fill(petId.toString());
      await page.locator('button.execute').first().click();

      await page.waitForSelector('.responses-wrapper', { timeout: 10000 });
      await page.waitForTimeout(1000);

      // Verify response
      const responseBody = page.locator('.responses-wrapper .response .response-col_description').first();
      const responseText = await responseBody.textContent();

      // Should contain updated name, not original
      expect(responseText).toContain(updatedName);
      expect(responseText).not.toContain(originalName);
      expect(responseText).toContain('pending');
      
      console.log(`✅ UI shows updated pet data: ${updatedName}, status=pending`);
    });

    // Cleanup
    await test.step('Cleanup', async () => {
      const client = new PetstoreClient(request);
      await client.deletePet(petId);
      console.log(`✅ Cleaned up pet ${petId}`);
    });
  });
});
