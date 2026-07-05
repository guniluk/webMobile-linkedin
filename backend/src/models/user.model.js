import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    profilePicture: { type: String, default: '' },
    bannerImg: { type: String, default: '' },
    headline: { type: String, default: 'Linkedin User' },
    location: { type: String, default: 'Not Specified' },
    about: { type: String, default: 'No about information' },
    skills: [String],
    experience: [
      {
        title: { type: String },
        company: { type: String },
        description: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
      },
    ],
    education: [
      {
        school: { type: String },
        fieldOfStudy: { type: String },
        startYear: { type: String },
        endYear: { type: String },
      },
    ],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

export default User;
