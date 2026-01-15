const db = require("../db");

// ✅ SIGNUP (name, mobile, email + role)
exports.signup = (req, res) => {
  console.log("✅ SIGNUP HIT:", req.body);

  const { name, mobile, email } = req.body;

  if (!name || !mobile || !email) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const sql = "INSERT INTO users (name, mobile, email) VALUES (?, ?, ?)";

  db.query(sql, [name, mobile, email], (err, result) => {
    if (err) {
      console.log("❌ DB ERROR:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "User already exists" });
      }
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: result.insertId,
        name,
        mobile,
        email,
      },
    });
  });
};


// ✅ LOGIN (mobile + role check)
exports.login = async (req, res) => {
  try {
    const { mobile, role } = req.body;

    if (!mobile || !role) {
      return res.status(400).json({ message: "Mobile and role required" });
    }

    const validRoles = ["OWNER", "TENANT"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // ✅ Find user
    const [users] = await db.query("SELECT * FROM users WHERE mobile = ?", [
      mobile,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    // ✅ Check role exists for this user
    const [roles] = await db.query(
      "SELECT role FROM user_roles WHERE user_id = ? AND role = ?",
      [user.id, role]
    );

    if (roles.length === 0) {
      return res.status(403).json({
        message: `You are not registered as ${role}`,
      });
    }

    return res.json({
      message: "Login success",
      user,
      role,
    });
  } catch (err) {
    console.log("Login error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

// ✅ GET USER ROLES (simple)
exports.getRoles = async (req, res) => {
  try {
    const { userId } = req.params;

    const [roles] = await db.query(
      "SELECT role FROM user_roles WHERE user_id = ?",
      [userId]
    );

    return res.json({
      userId,
      roles: roles.map((r) => r.role),
    });
  } catch (err) {
    console.log("Roles error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};
