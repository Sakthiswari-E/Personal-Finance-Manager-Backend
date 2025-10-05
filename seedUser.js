// // backend/seedUser.js
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import bcrypt from "bcryptjs";
// import User from "./models/User.js"; // adjust path if needed

// dotenv.config();

// async function seedUser() {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     const email = "test@example.com";
//     const password = "123456";

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Remove existing test user if exists
//     await User.deleteOne({ email });

//     // Create new test user
//     const newUser = new User({
//       name: "Test User",
//       email,
//       password: hashedPassword,
//     });

//     await newUser.save();

//     console.log("✅ Test user created:", { email, password });
//     mongoose.connection.close();
//   } catch (err) {
//     console.error("❌ Error seeding user:", err);
//     mongoose.connection.close();
//   }
// }

// seedUser();






// // backend/seedUser.js
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import User from "./models/User.js";  // ✅ make sure this path matches your folder

// dotenv.config();

// const seedUser = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     const email = "elansakthiswari@gmail.com";

//     // Check if user already exists
//     let user = await User.findOne({ email });
//     if (user) {
//       console.log("User already exists:", email);
//     } else {
//       user = await User.create({
//         name: "Elan",
//         email,
//         password: "123456", // 🔑 will be hashed automatically
//       });
//       console.log("User created:", user.email);
//     }

//     mongoose.connection.close();
//     process.exit();
//   } catch (err) {
//     console.error("Error seeding user:", err);
//     process.exit(1);
//   }
// };

// seedUser();






// backend/seedUser.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js"; // ✅ correct path

dotenv.config();

const seedUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected for seeding");

    // ✅ Define the user details here
    const name = "Elansakthiswari";
    const email = "elansakthiswari@gmail.com";
    const password = "Bommi5678"; // or "123456" if you prefer

    // ✅ Find existing user
    let user = await User.findOne({ email });

    if (user) {
      console.log("🔁 Updating existing user password...");
      user.password = password; // pre-save hook will hash it
      user.name = user.name || name;
      await user.save();
      console.log(`✅ Password reset successful: ${email}`);
    } else {
      console.log("✨ Creating new seed user...");
      user = new User({ name, email, password });
      await user.save();
      console.log(`✅ Seed user created: ${email}`);
    }

    await mongoose.disconnect();
    console.log("🚪 MongoDB disconnected");
  } catch (err) {
    console.error("❌ Error seeding user:", err.message);
    process.exit(1);
  }
};

seedUser();
