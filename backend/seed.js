require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');
const Event = require('./models/Event');
const Mentorship = require('./models/Mentorship');
const Message = require('./models/Message');
const Notification = require('./models/Notification');

const seedData = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is required to seed the real database.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Event.deleteMany({});
    await Mentorship.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});

    // Create Admin
    const admin = await User.create({
      name: 'Platform Admin',
      email: 'admin@demo.com',
      password: 'demo123',
      role: 'admin',
      isEmailVerified: true
    });

    // Create Alumni
    const alumni = await User.create({
      name: 'Sarah Connor',
      email: 'alumni@demo.com',
      password: 'demo123',
      role: 'alumni',
      company: 'Tech Solutions Inc.',
      designation: 'Senior Software Engineer',
      domain: 'Cloud Infrastructure',
      graduationYear: '2018',
      isApproved: true,
      skills: ['AWS', 'Node.js', 'Docker', 'Kubernetes'],
      bio: 'Enthusiastic cloud architect with 6 years of experience in scaling distributed systems.'
    });

    // Create Student
    const student = await User.create({
      name: 'John Doe',
      email: 'student@demo.com',
      password: 'demo123',
      role: 'student',
      college: 'Global Institute of Technology',
      course: 'B.Tech CSE',
      year: '3rd',
      skills: ['React', 'JavaScript', 'Tailwind'],
      bio: 'Aspiring full-stack developer looking for guidance in modern web architectures.'
    });

    // Create a Job
    await Job.create({
      title: 'Full Stack Developer Intern',
      company: 'Tech Solutions Inc.',
      description: 'Looking for a passionate student to join our engineering team for a 6-month internship.',
      type: 'internship',
      postedBy: alumni._id,
      location: 'Remote',
      skills: ['React', 'Node.js'],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    // Create an Event
    await Event.create({
      title: 'Mastering System Design',
      description: 'Join us for a deep dive into scalable system architectures and interview preparation.',
      type: 'webinar',
      host: alumni._id,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      duration: '2 hours',
      platform: 'Zoom',
      link: 'https://zoom.us/j/demo',
      isApproved: true
    });

    console.log('Seed data created successfully in MongoDB Atlas!');
    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
