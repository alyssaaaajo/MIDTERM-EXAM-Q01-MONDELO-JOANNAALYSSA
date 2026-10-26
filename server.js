const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


function readData() {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get all visitors
app.get('/api/visitors', (req, res) => {
    try {
        const visitors = readData();
        res.status(200).json(visitors);
    } catch (err) {
        res.status(500).json({ message: 'Failed to read data' });
    }
});

// Get one visitor thru ID
app.get('/api/visitors/:id', (req, res) => {
    try {
        const visitors = readData();
        const id = parseInt(req.params.id, 10);

        const visitor = visitors.find(v => v.id === id);

        if (!visitor) {
            return res.status(404).json({ message: 'Visitor not found' });
        }

        res.status(200).json(visitor);
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve visitor' });
    }
});

// Add visitor
app.post('/api/visitors', (req, res) => {
    try {
        const visitors = readData();

        const {
            visitor_name,
            purpose,
            person_to_visit,
            date
        } = req.body;

        if (!visitor_name || !purpose || !person_to_visit || !date) {
            return res.status(400).json({
                message: 'Please fill in all fields'
            });
        }

        const newId = visitors.length > 0
            ? Math.max(...visitors.map(v => v.id)) + 1
            : 1;

        const newVisitor = {
            id: newId,
            visitor_name: visitor_name,
            purpose: purpose,
            person_to_visit: person_to_visit,
            date: date,
            status: 'Inside'
        };

        visitors.push(newVisitor);
        writeData(visitors);

        res.status(201).json(newVisitor);
    } catch (err) {
        res.status(500).json({ message: 'Failed to add visitor' });
    }
});

// Delete visitor w/ ID
app.delete('/api/visitors/:id', (req, res) => {
    try {
        const visitors = readData();
        const id = parseInt(req.params.id, 10);

        const index = visitors.findIndex(v => v.id === id);

        if (index === -1) {
            return res.status(404).json({ message: 'Visitor not found' });
        }

        const deletedVisitor = visitors.splice(index, 1)[0];

        writeData(visitors);

        res.status(200).json({
            message: 'Visitor deleted successfully',
            visitor: deletedVisitor
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete visitor' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});