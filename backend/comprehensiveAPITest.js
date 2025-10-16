// Comprehensive API Testing Script
// This script tests all API endpoints without interrupting the running server

const https = require('https');
const http = require('http');

class APITester {
    constructor(baseUrl = 'http://localhost:5000') {
        this.baseUrl = baseUrl;
        this.authToken = null;
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    // HTTP request helper
    makeRequest(method, path, data = null, headers = {}) {
        return new Promise((resolve, reject) => {
            const url = new URL(path, this.baseUrl);
            const options = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname + url.search,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            };

            if (this.authToken) {
                options.headers['Authorization'] = `Bearer ${this.authToken}`;
            }

            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => {
                    body += chunk;
                });
                res.on('end', () => {
                    try {
                        const jsonBody = body ? JSON.parse(body) : {};
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            body: jsonBody
                        });
                    } catch (e) {
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            body: body
                        });
                    }
                });
            });

            req.on('error', (err) => {
                reject(err);
            });

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    // Test helper
    async runTest(testName, testFunction) {
        console.log(`\n🔍 Testing: ${testName}`);
        try {
            const result = await testFunction();
            if (result.success) {
                console.log(`✅ ${testName}: PASSED`);
                if (result.message) console.log(`   ${result.message}`);
                this.results.passed++;
            } else {
                console.log(`❌ ${testName}: FAILED`);
                console.log(`   ${result.message || 'Unknown error'}`);
                this.results.failed++;
            }
            this.results.tests.push({
                name: testName,
                success: result.success,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            console.log(`❌ ${testName}: ERROR`);
            console.log(`   ${error.message}`);
            this.results.failed++;
            this.results.tests.push({
                name: testName,
                success: false,
                message: error.message
            });
        }
    }

    // 1. Health Check Test
    async testHealthCheck() {
        return this.runTest('Health Check', async () => {
            const response = await this.makeRequest('GET', '/health');
            if (response.statusCode === 200) {
                return {
                    success: true,
                    message: `Server healthy: ${JSON.stringify(response.body)}`,
                    data: response.body
                };
            }
            return {
                success: false,
                message: `Health check failed with status ${response.statusCode}`
            };
        });
    }

    // 2. Authentication Tests
    async testAuth() {
        // Test register (using correct route)
        await this.runTest('User Register', async () => {
            const registerData = {
                email: 'testapi@example.com',
                password: 'password123',
                name: 'API Test User',
                role: 'doctor'
            };

            const response = await this.makeRequest('POST', '/api/auth/register', registerData);
            
            if (response.statusCode === 201 || response.statusCode === 400) {
                // 201 = success, 400 = user might already exist
                return {
                    success: true,
                    message: `Register response: ${response.statusCode} - ${JSON.stringify(response.body)}`
                };
            }
            return {
                success: false,
                message: `Register failed with status ${response.statusCode}: ${JSON.stringify(response.body)}`
            };
        });

        // Test login with existing doctor account
        await this.runTest('Doctor Login', async () => {
            const loginData = {
                email: 'doctor@hospital.com',
                password: 'password123'  // Try common password
            };

            const response = await this.makeRequest('POST', '/api/auth/login', loginData);
            
            if (response.statusCode === 200 && response.body.data && response.body.data.token) {
                this.authToken = response.body.data.token;
                return {
                    success: true,
                    message: `Doctor login successful, token received`,
                    data: { userId: response.body.data.user?.id }
                };
            }
            return {
                success: false,
                message: `Doctor login failed with status ${response.statusCode}: ${JSON.stringify(response.body)}`
            };
        });

        // If doctor login failed, try patient login
        if (!this.authToken) {
            await this.runTest('Patient Login Fallback', async () => {
                const loginData = {
                    email: 'patient@example.com',
                    password: 'password123'  // Try common password
                };

                const response = await this.makeRequest('POST', '/api/auth/login', loginData);
                
                if (response.statusCode === 200 && response.body.data && response.body.data.token) {
                    this.authToken = response.body.data.token;
                    return {
                        success: true,
                        message: `Patient login successful, token received`,
                        data: { userId: response.body.data.user?.id }
                    };
                }
                return {
                    success: false,
                    message: `Patient login failed with status ${response.statusCode}: ${JSON.stringify(response.body)}`
                };
            });
        }
    }

    // 3. Patients API Tests
    async testPatientsAPI() {
        let patientId = null;

        // Get all patients
        await this.runTest('Get Patients', async () => {
            const response = await this.makeRequest('GET', '/api/patients');
            if (response.statusCode === 200) {
                return {
                    success: true,
                    message: `Found ${response.body.length || 0} patients`,
                    data: response.body
                };
            }
            return {
                success: false,
                message: `Failed to get patients: ${response.statusCode}`
            };
        });

        // Create patient
        await this.runTest('Create Patient', async () => {
            const patientData = {
                name: 'Test Patient',
                email: 'patient@test.com',
                phone: '1234567890',
                address: 'Test Address',
                medicalHistory: 'Test medical history'
            };

            const response = await this.makeRequest('POST', '/api/patients', patientData);
            if (response.statusCode === 201) {
                patientId = response.body._id;
                return {
                    success: true,
                    message: `Patient created with ID: ${patientId}`,
                    data: response.body
                };
            }
            return {
                success: false,
                message: `Failed to create patient: ${response.statusCode} - ${JSON.stringify(response.body)}`
            };
        });

        // Get specific patient (if created)
        if (patientId) {
            await this.runTest('Get Specific Patient', async () => {
                const response = await this.makeRequest('GET', `/api/patients/${patientId}`);
                if (response.statusCode === 200) {
                    return {
                        success: true,
                        message: `Patient retrieved: ${response.body.name}`,
                        data: response.body
                    };
                }
                return {
                    success: false,
                    message: `Failed to get patient: ${response.statusCode}`
                };
            });
        }
    }

    // 4. Medicines API Tests
    async testMedicinesAPI() {
        let medicineId = null;

        // Get all medicines
        await this.runTest('Get Medicines', async () => {
            const response = await this.makeRequest('GET', '/api/medicines');
            if (response.statusCode === 200) {
                return {
                    success: true,
                    message: `Found ${response.body.length || 0} medicines`,
                    data: response.body
                };
            }
            return {
                success: false,
                message: `Failed to get medicines: ${response.statusCode}`
            };
        });

        // Create medicine
        await this.runTest('Create Medicine', async () => {
            const medicineData = {
                name: 'Test Medicine',
                description: 'Test Description',
                dosage: '10mg',
                sideEffects: 'None known',
                stock: 100,
                price: 25.50
            };

            const response = await this.makeRequest('POST', '/api/medicines', medicineData);
            if (response.statusCode === 201) {
                medicineId = response.body._id;
                return {
                    success: true,
                    message: `Medicine created with ID: ${medicineId}`,
                    data: response.body
                };
            }
            return {
                success: false,
                message: `Failed to create medicine: ${response.statusCode} - ${JSON.stringify(response.body)}`
            };
        });
    }

    // 5. Camps API Tests
    async testCampsAPI() {
        // Get all camps
        await this.runTest('Get Camps', async () => {
            const response = await this.makeRequest('GET', '/api/camps');
            if (response.statusCode === 200) {
                return {
                    success: true,
                    message: `Found ${response.body.length || 0} camps`,
                    data: response.body
                };
            }
            return {
                success: false,
                message: `Failed to get camps: ${response.statusCode}`
            };
        });

        // Create camp
        await this.runTest('Create Camp', async () => {
            const campData = {
                name: 'Test Health Camp',
                location: 'Test Location',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
                description: 'Test camp description',
                maxCapacity: 50
            };

            const response = await this.makeRequest('POST', '/api/camps', campData);
            if (response.statusCode === 201) {
                return {
                    success: true,
                    message: `Camp created: ${response.body.name}`,
                    data: response.body
                };
            }
            return {
                success: false,
                message: `Failed to create camp: ${response.statusCode} - ${JSON.stringify(response.body)}`
            };
        });
    }

    // 6. Prescriptions API Tests
    async testPrescriptionsAPI() {
        // Get all prescriptions
        await this.runTest('Get Prescriptions', async () => {
            const response = await this.makeRequest('GET', '/api/prescriptions');
            if (response.statusCode === 200) {
                return {
                    success: true,
                    message: `Found ${response.body.length || 0} prescriptions`,
                    data: response.body
                };
            }
            return {
                success: false,
                message: `Failed to get prescriptions: ${response.statusCode}`
            };
        });
    }

    // Run all tests
    async runAllTests() {
        console.log('🚀 Starting Comprehensive API Testing...\n');
        console.log('=' .repeat(60));

        await this.testHealthCheck();
        await this.testAuth();
        await this.testPatientsAPI();
        await this.testMedicinesAPI();
        await this.testCampsAPI();
        await this.testPrescriptionsAPI();

        console.log('\n' + '=' .repeat(60));
        console.log('📊 TEST RESULTS SUMMARY');
        console.log('=' .repeat(60));
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📝 Total Tests: ${this.results.tests.length}`);
        console.log(`🎯 Success Rate: ${((this.results.passed / this.results.tests.length) * 100).toFixed(1)}%`);

        if (this.results.failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.results.tests
                .filter(test => !test.success)
                .forEach(test => {
                    console.log(`   • ${test.name}: ${test.message}`);
                });
        }

        console.log('\n✨ API Testing Complete!');
        return this.results;
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new APITester();
    tester.runAllTests().catch(console.error);
}

module.exports = APITester;