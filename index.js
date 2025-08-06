const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const SHOP = process.env.SHOPIFY_SHOP;
const API_VERSION = '2024-01';
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

app.get('/', async (req, res) => {
  try {
    const headers = {
      'X-Shopify-Access-Token': ACCESS_TOKEN,
      'Content-Type': 'application/json'
    };

    const ordersRes = await axios.get(`https://${SHOP}/admin/api/${API_VERSION}/orders.json?limit=10&status=any`, { headers });
    const draftsRes = await axios.get(`https://${SHOP}/admin/api/${API_VERSION}/draft_orders.json?limit=10`, { headers });

    const orders = ordersRes.data.orders;
    const drafts = draftsRes.data.draft_orders;

    let html = `
      <h1>All Orders (Regular & Draft)</h1>
      <h2>Regular Orders</h2>
      ${orders.length > 0 ? '<ul>' + orders.map(o => `
        <li>
          <strong>${o.name}</strong> – $${o.total_price} – ${o.financial_status}<br>
          Created: ${new Date(o.created_at).toLocaleDateString()}
        </li>`).join('') + '</ul>' : '<p>No regular orders found.</p>'}
      
      <h2>Draft Orders</h2>
      ${drafts.length > 0 ? '<ul>' + drafts.map(d => `
        <li>
          <strong>Draft ${d.name || d.id}</strong> – $${d.total_price}<br>
          Created: ${new Date(d.created_at).toLocaleDateString()}
        </li>`).join('') + '</ul>' : '<p>No draft orders found.</p>'}
    `;

    res.send(html);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('Error retrieving orders. Check API token and shop name.');
  }
});

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));