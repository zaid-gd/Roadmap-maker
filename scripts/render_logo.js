const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const svgContent = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    width="512"
    height="512"
    viewBox="-2 -2 28 28"
    fill="none"
    stroke="white"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
>
    <!-- Background for contrast -->
    <rect x="-2" y="-2" width="28" height="28" fill="#050505" stroke="none" />
    <path d="M4 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    <path d="M4 15V9a2 2 0 0 1 2-2h2" />
    <path d="M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    <path d="M10 7h4a2 2 0 0 1 2 2v6" />
    <path d="M16 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
    <path d="M18 15h2a2 2 0 0 0 2-2V7" />
    <path d="M22 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
</svg>
`;

async function render() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setContent(`
    <style>
      body { margin: 0; background: #050505; display: flex; align-items: center; justify-content: center; height: 100vh; }
      svg { width: 512px; height: 512px; }
    </style>
    ${svgContent}
  `);

  const outputPath = path.join(__dirname, '..', 'public', 'brand-assets', 'exact-logo-render.png');
  await page.locator('svg').screenshot({ path: outputPath });
  
  console.log(`Saved exact rendering to: ${outputPath}`);
  await browser.close();
}

render().catch(console.error);
