const { v4: uuidv4 } = require("uuid");
import { UserRole, ItineraryVisbility } from "@prisma/client";
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

function itineraryFixture(overrides = {}) {
  var defaultValues = {
    id: uuidv4(),
    title: "Trip to Japan",
    location: "Japan",
    owner_id: uuidv4(),
    collaborators: [],
    activities: [],
    votes: [],
    visibility:
      Math.random() < 0.5
        ? ItineraryVisbility.public
        : ItineraryVisbility.private,
    start_date: new Date("2022-01-01"),
    end_date: new Date("2022-01-10"),
  };
  return { ...defaultValues, ...overrides };
}

function activityFixture(overrides = {}) {
  var defaultValues = {
    id: uuidv4(),
    title: "Hiking at Mount Fuji",
    description: "A guided hiking tour",
    itinerary_id: 123,
    expense: 200,
    split: "equal",
    sequence: 1,
  };
  return { ...defaultValues, ...overrides };
}

export { userFixture, userTokenFixture, itineraryFixture, activityFixture };
