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
exports.login = (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: "Mobile required" });
  }

  db.query("SELECT * FROM users WHERE mobile = ?", [mobile], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Login success",
      user: rows[0],
    });
  });
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
