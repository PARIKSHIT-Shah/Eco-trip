const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.post('/plan', protect, async (req, res) => {
  try {
    const { destination, days, members, budget, departureDate, accommodation, preferences, notes } = req.body;

    if (!destination || destination.trim() === '') {
      return res.status(400).json({ message: 'Destination is required' });
    }

    const hasDays = days && !isNaN(days);

    let prompt = `You are an expert eco-travel planner. A user wants to travel to "${destination}".`;
    if (departureDate) prompt += ` Travel date: ${departureDate}.`;
    if (hasDays) prompt += ` Duration: ${days} days.`;
    if (budget) prompt += ` Budget: ₹${budget} for ${members || 1} people.`;
    if (accommodation) prompt += ` Stay preference: ${accommodation}.`;
    if (preferences?.length) prompt += ` Interests: ${preferences.join(', ')}.`;
    if (notes) prompt += ` Special notes: ${notes}.`;

    prompt += `\n\nRespond ONLY with a valid JSON object. No explanation, no markdown, no backticks. Just raw JSON.\n\nThe JSON must have this exact structure:\n{\n  "overview": "2-3 sentences about the destination — why it's great, eco highlights, best season",\n  "tourist_spots": [\n    {\n      "name": "Spot name",\n      "description": "2 sentences about the spot",\n      "best_time": "Morning / Evening / Anytime",\n      "category": "Nature / History / Adventure / Culture / Beach / Food / Shopping"\n    }\n  ],\n  "famous_food": [\n    {\n      "name": "Food item name",\n      "description": "One sentence about it"\n    }\n  ],\n  "special_info": "What makes this place truly special — local customs, hidden gems, eco tips"`;

    if (hasDays) {
      prompt += `,\n  "itinerary": [\n    {\n      "day": 1,\n      "title": "Day title e.g. Arrival & Forest Walk",\n      "slots": [\n        {\n          "time": "9:00 AM",\n          "activity": "Activity name",\n          "description": "Brief description with real place names"\n        }\n      ]\n    }\n  ]`;
    }

    prompt += `\n}\n\nInclude at least 6 tourist spots and 5 famous foods. ${hasDays ? `Create a complete ${days}-day itinerary with 4-5 time slots per day. Keep everything eco-friendly and sustainable.` : 'Do not include itinerary field.'}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 4000,
        messages: [
          {
            role: 'system',
            content: 'You are an eco-travel expert AI. Always respond with valid JSON only. No markdown, no explanation, no backticks. Just raw JSON.'
          },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq API error:', err);
      return res.status(502).json({ message: 'AI service error. Please try again.' });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || '';
    const cleaned = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/```$/, '').trim();

    let plan;
    try {
      plan = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('JSON parse error:', cleaned.substring(0, 300));
      return res.status(500).json({ message: 'AI returned invalid response. Please try again.' });
    }

    res.json({ plan });
  } catch (err) {
    console.error('AI plan error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
