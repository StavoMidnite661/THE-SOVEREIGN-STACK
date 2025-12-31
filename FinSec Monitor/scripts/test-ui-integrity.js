const http = require('http');

const url = 'http://localhost:3000';

console.log(`[TEST] Starting UI Integrity Check on ${url}...`);

http.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`[TEST] Received ${data.length} bytes of HTML.`);
    
    // Check for Global Theme
    const hasWhiteText = data.includes('text-white');
    const hasDarkBg = data.includes('bg-background'); // or similar root class if valid, but checking specifics is better
    
    // Check for Button Styles (Gradient)
    // Note: React might obfuscate class names in production builds, but in dev standard classes usually appear.
    // However, tailwind classes are class strings.
    const hasButtonGradient = data.includes('bg-gradient-to-r');
    const hasButtonBlue = data.includes('from-blue-600');
    
    // Check for Glass Morphism (Cards/Tabs)
    // We added 'glass-morphism' class to the cards in overview-tab.tsx
    const hasGlassMorphism = data.includes('glass-morphism');
    
    console.log('\n--- VERIFICATION RESULTS ---');
    console.log(`1. Global White Text Enforced: ${hasWhiteText ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`2. Button Cyberpunk Gradient:  ${hasButtonGradient && hasButtonBlue ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`3. Glass Morphism Classes:     ${hasGlassMorphism ? '✅ PASS' : '❌ FAIL'}`);

    if (hasWhiteText && hasButtonGradient && hasGlassMorphism) {
        console.log('\n[SUCCESS] UI Polish verification complete. Cyberpunk theme is active.');
        process.exit(0);
    } else {
        console.log('\n[FAILURE] One or more UI elements missing expected classes.');
        console.log('Note: If this is a client-side rendered component, raw HTML fetch might miss it. But page.tsx is server component or initial render should have some structure.');
        // Next.js static generation often puts classes in.
        process.exit(1);
    }
  });

}).on('error', (err) => {
  console.error(`[ERROR] Could not connect to localhost:3000. Is the server running? Details: ${err.message}`);
  process.exit(1);
});
