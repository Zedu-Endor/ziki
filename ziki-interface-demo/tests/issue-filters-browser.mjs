// Uses the parent repository's existing Playwright installation. No new dependencies.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require('../../../node_modules/@playwright/test');
const origin = process.argv[2] || 'http://localhost:3003';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/issues`);
    await page.getByRole('combobox', { name: /^Project/ }).selectOption('p1');
    await page.waitForURL('**/issues?project=p1');
    await page.getByRole('combobox', { name: /^My issues/ }).selectOption('assigned');
    await page.waitForURL('**mine=assigned');
    await page.getByRole('combobox', { name: /^Sort/ }).selectOption('newest');
    await page.waitForURL('**sort=newest');
    const saved = page.url();
    const rows = page.locator('.issue-work-row');
    assert.ok(await rows.count() > 0);
    const count = await rows.count();
    await page.reload();
    await page.getByRole('combobox', { name: /^Project/ }).waitFor();
    assert.equal(await page.getByRole('combobox', { name: /^Project/ }).inputValue(), 'p1');
    assert.equal(await page.getByRole('combobox', { name: /^My issues/ }).inputValue(), 'assigned');
    assert.equal(await page.getByRole('combobox', { name: /^Sort/ }).inputValue(), 'newest');
    assert.equal(await rows.count(), count);
    await rows.first().click();
    await page.getByRole('link', { name: 'Back to issues' }).click();
    await page.waitForURL(saved);
    assert.equal(await rows.count(), count);
    await page.getByRole('combobox', { name: /^Status/ }).selectOption('closed');
    await page.waitForURL('**status=closed');
    await page.goBack();
    await page.waitForURL(saved);
    assert.equal(await page.getByRole('combobox', { name: /^Status/ }).inputValue(), 'all');
    await page.goForward();
    await page.waitForURL('**status=closed');
    assert.equal(await page.getByRole('combobox', { name: /^Status/ }).inputValue(), 'closed');
    await page.getByRole('button', { name: 'Clear all filters' }).click();
    await page.waitForURL(`${origin}/issues`);
    await page.getByRole('searchbox', { name: 'Search issues', exact: true }).fill('  nonexistent-issue-xyz  ');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('heading', { name: 'No matching issues' }).waitFor();
    assert.equal(new URL(page.url()).searchParams.get('q'), 'nonexistent-issue-xyz');
    await page.getByRole('button', { name: 'Show all issues' }).click();
    await page.waitForURL(`${origin}/issues`);
    assert.ok(await rows.count() > 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'no horizontal overflow');
    assert.deepEqual(errors, [], 'no client errors');
    console.log(`PASS ${width}px: combined filters, reload, detail return, Back/Forward, empty search, reset, layout`);
    await page.close();
  }
} finally {
  await browser.close();
}
