require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// HubSpot API configuration
const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const CUSTOM_OBJECT_TYPE_ID = process.env.HUBSPOT_CUSTOM_OBJECT_TYPE_ID;

const hubspotClient = axios.create({
  baseURL: 'https://api.hubapi.com/crm/v3/objects',
  headers: {
    'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Route 1: Homepage - Display all custom objects
app.get('/', async (req, res) => {
  try {
    console.log('🔍 Searching pets in HubSpot...');
    
    // استخدمي Search API علشان نجيب البيانات مع الـ properties
    const searchResponse = await hubspotClient.post(`/${CUSTOM_OBJECT_TYPE_ID}/search`, {
      "filterGroups": [],
      "properties": ["name", "type", "age"], // lowercase!
      "limit": 100,
      "after": 0
    });
    
    console.log('✅ Search API Response received');
    console.log('Number of records:', searchResponse.data.results ? searchResponse.data.results.length : 0);
    
    const records = searchResponse.data.results || [];
    res.render('homepage', { 
      title: 'My Pets | Integrating With HubSpot I Practicum',
      records: records 
    });
  } catch (error) {
    console.error('❌ ERROR searching custom objects:');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    const records = [];
    res.render('homepage', { 
      title: 'My Pets | Integrating With HubSpot I Practicum',
      records: records 
    });
  }
});

// Route 2: Form to create new custom object
app.get('/update-cobj', (req, res) => {
  res.render('updates', { 
    title: 'Add New Pet | Integrating With HubSpot I Practicum' 
  });
});

// Route 3: Handle form submission
app.post('/update-cobj', async (req, res) => {
  try {
    const { name, type, age } = req.body;
    
    console.log('🆕 Creating new pet:', { name, type, age });
    
    const newRecord = {
      properties: {
        name: name,  // lowercase!
        type: type,  // lowercase!
        age: age     // lowercase!
      }
    };

    await hubspotClient.post(`/${CUSTOM_OBJECT_TYPE_ID}`, newRecord);
    console.log('✅ Pet created successfully');
    res.redirect('/');
  } catch (error) {
    console.error('❌ Error creating custom object:');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.redirect('/');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:3000`);
});