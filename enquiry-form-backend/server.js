const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser'); // Ensure: npm install body-parser

const app = express();
const PORT = 3000; // Server will run on this port

// Middleware setup
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse incoming JSON requests

// Helper function: Fallback using dynamic import for Fetch if Axios fails
const callBlandAIFetch = async (contactNumber) => {
    try {
        const { default: fetch } = await import('node-fetch'); // Dynamic ESM import

        const response = await fetch('https://api.bland.ai/v1/calls', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-dunjzzxmqxx1mm7cjfp8da4evmmngykdfxjwjsdgrjntj3q4vxgs33askayq3mf469', // Replace with your valid API key
            },
            body: JSON.stringify({
                phone_number: contactNumber,
                task: 'initiate_call',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Fetch Error Response:', errorData);
            throw new Error('Failed to trigger call via Fetch.');
        }

        return await response.json(); // Successfully parsed response data
    } catch (error) {
        console.error('Fetch Request Failed:', error.message);
        throw error;
    }
};

// Route to handle enquiry submissions and trigger a call
app.post('/enquiry', async (req, res) => {
    let { contactNumber } = req.body;

    // Ensure the contact number starts with a '+' prefix
    if (!contactNumber.startsWith('+')) {
        return res.status(400).json({ 
            message: 'Invalid contact number. Please include the country code (e.g., +12223334444).' 
        });
    }

    try {
        // Primary request using Axios
        const axiosResponse = await axios.post(
            'https://api.bland.ai/v1/calls',
            {
                phone_number: contactNumber,
                task: 'initiate_call',
                pathway_id: '914a0942-cb1f-4aeb-a8f4-feeffb4ca7ae', // Replace with valid pathway ID
            },
            {
                headers: {
                    'Authorization': 'Bearer sk-dunjzzxmqxx1mm7cjfp8da4evmmngykdfxjwjsdgrjntj3q4vxgs33askayq3mf469', 
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('Call initiated successfully (Axios):', axiosResponse.data);
        res.status(200).json({
            message: 'Your request is noted. 📞 We will call back soon. Please wait patiently.',
        });

    } catch (axiosError) {
        console.error('Axios Request Failed:', axiosError.response ? axiosError.response.data : axiosError.message);

        // Fallback to Fetch if Axios request fails
        try {
            const fetchData = await callBlandAIFetch(contactNumber);
            console.log('Call initiated successfully (Fetch):', fetchData);
            res.status(200).json({
                message: 'Call triggered successfully via fallback!',
                data: fetchData,
            });

        } catch (fetchError) {
            console.error('Both Axios and Fetch failed:', fetchError.message);
            res.status(500).json({
                message: 'Failed to initiate call. Please try again later.',
                error: fetchError.message,
            });
        }
    }
});


// Health check route to verify Bland AI API connectivity
app.get('/ping-bland', async (req, res) => {
    try {
        const response = await axios.get('https://api.bland.ai/v1/health'); // Replace with a real health endpoint if available
        res.status(200).json({ message: 'Bland AI is reachable!', data: response.data });
    } catch (error) {
        console.error('Connectivity Issue:', error.message);
        res.status(500).json({ message: 'Failed to reach Bland AI.', error: error.message });
    }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
