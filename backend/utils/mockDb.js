const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../data/db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, '../data'))) {
  fs.mkdirSync(path.join(__dirname, '../data'));
}

class MockDb {
  constructor() {
    this.data = {
      users: [],
      jobs: [],
      events: [],
      mentorships: [],
      messages: [],
      notifications: []
    };
    this.load();
  }

  load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(content);
      } catch (e) {
        console.error('Error loading mock DB:', e);
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.error('Error saving mock DB:', e);
    }
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  async find(collection, query = {}) {
    let results = [...this.data[collection]];
    
    // Simple query filtering
    Object.keys(query).forEach(key => {
      if (key === '$or') {
        results = results.filter(item => {
          return query.$or.some(q => {
            const [qKey] = Object.keys(q);
            if (q[qKey].$regex) {
              const regex = new RegExp(q[qKey].$regex, q[qKey].$options || '');
              return regex.test(item[qKey]);
            }
            return item[qKey] === q[qKey];
          });
        });
      } else if (query[key] && typeof query[key] === 'object' && query[key].$regex) {
        const regex = new RegExp(query[key].$regex, query[key].$options || '');
        results = results.filter(item => regex.test(item[key]));
      } else if (query[key] && typeof query[key] === 'object' && query[key].$in) {
        results = results.filter(item => {
           if (!item[key]) return false;
           return query[key].$in.some(val => item[key].includes(val));
        });
      } else {
        results = results.filter(item => item[key] === query[key]);
      }
    });
    
    return results;
  }

  async findOne(collection, query) {
    const results = await this.find(collection, query);
    return results[0] || null;
  }

  async findById(collection, id) {
    return this.data[collection].find(item => item._id === id) || null;
  }

  async create(collection, doc) {
    const newDoc = {
      ...doc,
      _id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data[collection].push(newDoc);
    this.save();
    return newDoc;
  }

  async findByIdAndUpdate(collection, id, updates, options = {}) {
    const index = this.data[collection].findIndex(item => item._id === id);
    if (index === -1) return null;
    
    this.data[collection][index] = {
      ...this.data[collection][index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data[collection][index];
  }

  async findOneAndUpdate(collection, query, updates) {
    const doc = await this.findOne(collection, query);
    if (!doc) return null;
    return this.findByIdAndUpdate(collection, doc._id, updates);
  }

  async findByIdAndDelete(collection, id) {
    const index = this.data[collection].findIndex(item => item._id === id);
    if (index === -1) return null;
    const deleted = this.data[collection].splice(index, 1);
    this.save();
    return deleted[0];
  }

  async countDocuments(collection, query = {}) {
    const results = await this.find(collection, query);
    return results.length;
  }

  async deleteMany(collection, query = {}) {
    if (Object.keys(query).length === 0) {
      this.data[collection] = [];
    } else {
      // Not fully implemented for complexity, but clearing is usually what's needed for seeding
      this.data[collection] = []; 
    }
    this.save();
  }

  async updateMany(collection, query, updates) {
    const items = await this.find(collection, query);
    items.forEach(item => {
      const index = this.data[collection].findIndex(i => i._id === item._id);
      this.data[collection][index] = { ...this.data[collection][index], ...updates };
    });
    this.save();
  }
}

module.exports = new MockDb();
