const { v4: uuidv4 } = require("uuid");
import { UserRole } from "@prisma/client";
const { generateEmailToken } = require("../../controllers/auth");

function userFixture(overrides = {}) {
  var defaultValues = {
    id: uuidv4(),
    media: "",
    username: (Math.random() + 1).toString(36).substring(2),
    email: (Math.random() + 1).toString(36).substring(2) + "@gmail.com",
    password: "12345678",
    role: UserRole.UV,
  };
  return { ...defaultValues, ...overrides };
}

function userTokenFixture(overrides = {}) {
  var defaultValues = {
    user_id: uuidv4(),
    token: generateEmailToken(),
    context: "email_confirmation",
    sent_to: "blah@gmail.com",
  };
  return { ...defaultValues, ...overrides };
}

export { userFixture, userTokenFixture };
