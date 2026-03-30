import { fetchWithRadiusExpansion } from '../../backend/lib/overpass';

async function test() {
  const lat = 14.4426; // Nellore lat
  const lon = 79.9865; // Nellore lon
  console.log('Testing Overpass API with radius expansion...');
  try {
    const places = await fetchWithRadiusExpansion(lat, lon);
    console.log('Results:');
    places.forEach(p => console.log(`- ${p.name} (${p.type}) [${p.distance} km]`));
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
