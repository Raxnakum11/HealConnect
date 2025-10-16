// Frontend Integration Testing Script
// This script tests frontend-backend integration by simulating API calls from the frontend

const http = require('http');

class FrontendIntegrationTester {
    constructor() {
        this.backendBaseUrl = 'http://localhost:5000';
        this.frontendUrl = 'http://localhost:8080';
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
            const url = new URL(path, this.backendBaseUrl);
            console.log(`🔍 Constructed URL: ${url.toString()}`);
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

    // Test frontend accessibility
    async testFrontendAccessibility() {
        return this.runTest('Frontend Server Accessibility', async () => {
            try {
                const options = {
                    hostname: 'localhost',
                    port: 8080,
                    path: '/',
                    method: 'GET'
                };

                return new Promise((resolve, reject) => {
                    const req = http.request(options, (res) => {
                        if (res.statusCode === 200) {
                            resolve({
                                success: true,
                                message: `Frontend accessible at http://localhost:8080 (Status: ${res.statusCode})`
                            });
                        } else {
                            resolve({
                                success: false,
                                message: `Frontend returned status ${res.statusCode}`
                            });
                        }
                    });

                    req.on('error', (err) => {
                        resolve({
                            success: false,
                            message: `Frontend not accessible: ${err.message}`
                        });
                    });

                    req.setTimeout(5000, () => {
                        resolve({
                            success: false,
                            message: 'Frontend request timed out'
                        });
                    });

                    req.end();
                });
            } catch (error) {
                return {
                    success: false,
                    message: `Error testing frontend: ${error.message}`
                };
            }
        });
    }

    // Test authentication flow (like frontend would do)
    async testAuthenticationFlow() {
        return this.runTest('Authentication Flow', async () => {
            const loginData = {
                email: 'doctor@hospital.com',
                password: 'password123'
            };

            const response = await this.makeRequest('POST', '/api/auth/login', loginData);

            if (response.statusCode === 200 && response.body.success && response.body.data && response.body.data.token) {
                this.authToken = response.body.data.token;
                return {
                    success: true,
                    message: `Authentication successful for user: ${response.body.data.user.name}`,
                    data: response.body.data.user
                };
            }

            return {
                success: false,
                message: `Authentication failed: Status ${response.statusCode} - ${JSON.stringify(response.body)}`
            };
        });
    }

    // Test patient data fetching (like PatientDashboard would do)
    async testPatientDataFetching() {
        return this.runTest('Patient Data Fetching', async () => {
            const response = await this.makeRequest('GET', '/api/patients');

            if (response.statusCode === 200) {
                return {
                    success: true,
                    message: `Successfully fetched patient data (${response.body.length} patients)`,
                    data: response.body
                };
            }

            return {
                success: false,
                message: `Failed to fetch patients: ${response.statusCode} - ${JSON.stringify(response.body)}`
            };
        });
    }

    // Test medicines data fetching (like Medicines component would do)
    async testMedicinesDataFetching() {
        return this.runTest('Medicines Data Fetching', async () => {
            const response = await this.makeRequest('GET', '/api/medicines');

            if (response.statusCode === 200) {
                return {
                    success: true,
                    message: `Successfully fetched medicines data (${response.body.length} medicines)`,
                    data: response.body
                };
            }

            return {
                success: false,
                message: `Failed to fetch medicines: ${response.statusCode} - ${JSON.stringify(response.body)}`
            };
        });
    }

    // Test prescriptions data fetching (like frontend Medicines.tsx would do)
    async testPrescriptionsDataFetching() {
        return this.runTest('Prescriptions Data Fetching', async () => {
            const response = await this.makeRequest('GET', '/api/prescriptions');

            if (response.statusCode === 200) {
                return {
                    success: true,
                    message: `Successfully fetched prescriptions data (${response.body.length} prescriptions)`,
                    data: response.body
                };
            }

            return {
                success: false,
                message: `Failed to fetch prescriptions: ${response.statusCode} - ${JSON.stringify(response.body)}`
            };
        });
    }

    // Test camps data fetching (like Camps component would do)
    async testCampsDataFetching() {
        return this.runTest('Camps Data Fetching', async () => {
            const response = await this.makeRequest('GET', '/api/camps');

            if (response.statusCode === 200) {
                return {
                    success: true,
                    message: `Successfully fetched camps data (${response.body.length} camps)`,
                    data: response.body
                };
            }

            return {
                success: false,
                message: `Failed to fetch camps: ${response.statusCode} - ${JSON.stringify(response.body)}`
            };
        });
    }

    // Test appointments data fetching
    async testAppointmentsDataFetching() {
        return this.runTest('Appointments Data Fetching', async () => {
            const response = await this.makeRequest('GET', '/api/appointments');

            if (response.statusCode === 200) {
                return {
                    success: true,
                    message: `Successfully fetched appointments data (${response.body.length} appointments)`,
                    data: response.body
                };
            }

            return {
                success: false,
                message: `Failed to fetch appointments: ${response.statusCode} - ${JSON.stringify(response.body)}`
            };
        });
    }

    // Run all frontend integration tests
    async runAllTests() {
        console.log('🌐 Starting Frontend Integration Testing...\n');
        console.log('=' .repeat(60));

        await this.testFrontendAccessibility();
        await this.testAuthenticationFlow();
        
        // Only proceed with data tests if authentication succeeded
        if (this.authToken) {
            await this.testPatientDataFetching();
            await this.testMedicinesDataFetching();
            await this.testPrescriptionsDataFetching();
            await this.testCampsDataFetching();
            await this.testAppointmentsDataFetching();
        } else {
            console.log('\n❌ Skipping data fetching tests due to authentication failure');
        }

        // Print summary
        console.log('\n' + '=' .repeat(60));
        console.log('📊 FRONTEND INTEGRATION TEST SUMMARY');
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

        console.log('\n✨ Frontend Integration Testing Complete!');
        return this.results;
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new FrontendIntegrationTester();
    tester.runAllTests().catch(console.error);
}

module.exports = FrontendIntegrationTester;