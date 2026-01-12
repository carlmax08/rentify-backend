const db = require("../db");

// SIGNUP
exports.signup = (req, res) => {
  const { name, mobile, email } = req.body;

  if (!name || !mobile || !email) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const sql =
    "INSERT INTO users (name, mobile, email) VALUES (?, ?, ?)";

  db.query(sql, [name, mobile, email], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ message: "User already exists" });
      }
      return res.status(500).json({ message: "Database error" });
    }

    res.status(201).json({
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

// LOGIN
exports.login = (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: "Mobile required" });
  }

  db.query(
    "SELECT * FROM users WHERE mobile = ?",
    [mobile],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user: rows[0] });
    }
  );
};

// ROLE CHECK
exports.getRoles = (req, res) => {
  const { userId } = req.params;

  const ownerQuery =
    "SELECT COUNT(*) AS count FROM properties WHERE owner_id = ?";
  const tenantQuery =
    "SELECT COUNT(*) AS count FROM tenancies WHERE user_id = ? AND status='active'";

  db.query(ownerQuery, [userId], (err, ownerRes) => {
    if (err) return res.status(500).json({ message: "DB error" });

    db.query(tenantQuery, [userId], (err, tenantRes) => {
      if (err) return res.status(500).json({ message: "DB error" });

      res.json({
        roles: {
          isOwner: ownerRes[0].count > 0,
          isTenant: tenantRes[0].count > 0,
        },
      });
    });
  });
};
