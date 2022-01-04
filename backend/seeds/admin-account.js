const bcrypt = require("bcrypt");

exports.seed = async function (knex) {
  // Create admin account
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword =
    process.env.ADMIN_PASSWORD || Math.random().toString(16).substr(2, 14);

  try {
    await knex("account").insert({
      email: adminEmail,
      password: bcrypt.hashSync(
        adminPassword,
        parseInt(process.env.SALT_ROUNDS || "10")
      ),
      is_admin: true,
      confirmed: true,
      created_timestamp: String(Date.now()),
    });

    console.log(`Created admin account for ${adminEmail} ${adminPassword}`);
  } catch (err) {
    console.error("Error creating admin account", err);
    throw err;
  }
};
