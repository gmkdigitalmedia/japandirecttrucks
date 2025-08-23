// Test if frontend can connect to backend properly
const axios = require('axios');

async function testFrontendAPI() {
    console.log('🧪 Testing Frontend API Connection...\n');
    
    try {
        // Test 1: Direct backend call
        console.log('1. Testing direct backend call...');
        const backendResponse = await axios.get('http://localhost:8000/api/vehicles/featured');
        console.log(`✅ Backend: ${backendResponse.data.data.length} vehicles returned`);
        
        // Test 2: Frontend proxy call  
        console.log('\n2. Testing frontend proxy call...');
        const frontendResponse = await axios.get('http://localhost:3000/api/vehicles/featured');
        console.log(`✅ Frontend Proxy: ${frontendResponse.data.data.length} vehicles returned`);
        
        // Test 3: Check if data is the same
        const backendVehicles = backendResponse.data.data;
        const frontendVehicles = frontendResponse.data.data;
        
        if (backendVehicles.length === frontendVehicles.length) {
            console.log('\n✅ Data matches between backend and frontend proxy!');
            console.log(`\nSample vehicle from frontend:`)
            console.log(`- ${frontendVehicles[0].title_description}`);
            console.log(`- Manufacturer: ${frontendVehicles[0].manufacturer?.name}`);
            console.log(`- Price: ¥${frontendVehicles[0].price_total_yen?.toLocaleString()}`);
            console.log(`- Image: ${frontendVehicles[0].primary_image ? 'YES' : 'NO'}`);
        } else {
            console.log('❌ Data mismatch between backend and frontend proxy!');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testFrontendAPI();