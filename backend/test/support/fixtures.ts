import { v4 as uuidv4 } from "uuid";
import { UserRole, ItineraryVisibility } from "@prisma/client";
import crypto from "crypto";

/**
 * Generate a random token for testing purposes
 * @returns A random string token
 */
const generateTestToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate a test user
 * @param overrides Properties to override default values
 * @returns A user object for testing
 */
function userFixture(overrides = {}) {
  const defaultValues = {
    id: Math.floor(Math.random() * 1000),
    media: "",
    username: (Math.random() + 1).toString(36).substring(2),
    email: (Math.random() + 1).toString(36).substring(2) + "@gmail.com",
    password: "P@ssw0rd123!",
    role: UserRole.UV,
    created_at: new Date(),
    updated_at: new Date(),
    password_history: [],
    email_verified: null,
    user_photo: null,
    profile_description: null,
    active: true
  };
  return { ...defaultValues, ...overrides };
}

/**
 * Generate a test user token
 * @param overrides Properties to override default values
 * @returns A user token object for testing
 */
function userTokenFixture(overrides = {}) {
  const defaultValues = {
    id: Math.floor(Math.random() * 1000),
    user_id: Math.floor(Math.random() * 1000),
    token: generateTestToken(),
    context: "email_confirmation",
    sent_to: (Math.random() + 1).toString(36).substring(2) + "@gmail.com",
    created_at: new Date(),
    updated_at: new Date(),
    active: true
  };
  return { ...defaultValues, ...overrides };
}

/**
 * Generate a test password history entry
 * @param overrides Properties to override default values
 * @returns A password history object for testing
 */
function passwordHistoryFixture(overrides = {}) {
  const defaultValues = {
    id: Math.floor(Math.random() * 1000),
    user_id: Math.floor(Math.random() * 1000),
    password: "hashedpassword-" + Math.random(),
    created_at: new Date(),
  };
  return { ...defaultValues, ...overrides };
}

/**
 * Generate a test itinerary
 * @param overrides Properties to override default values
 * @returns An itinerary object for testing
 */
function itineraryFixture(overrides = {}) {
  const defaultValues = {
    id: Math.floor(Math.random() * 1000),
    title: "Trip to Japan",
    location: "Japan",
    owner_id: Math.floor(Math.random() * 1000),
    collaborators: [],
    activities: [],
    votes: [],
    visibility: Math.random() < 0.5 ? ItineraryVisibility.public : ItineraryVisibility.private,
    start_date: new Date("2022-01-01"),
    end_date: new Date("2022-01-10"),
    created_at: new Date(),
    updated_at: new Date(),
    active: true
  };
  return { ...defaultValues, ...overrides };
}

/**
 * Generate a test activity
 * @param overrides Properties to override default values
 * @returns An activity object for testing
 */
function activityFixture(overrides = {}) {
  const defaultValues = {
    id: Math.floor(Math.random() * 1000),
    title: "Hiking at Mount Fuji",
    description: "A guided hiking tour",
    itinerary_id: Math.floor(Math.random() * 1000),
    expense: 200,
    split: "equal",
    sequence: 1,
    created_at: new Date(),
    updated_at: new Date(),
    active: true
  };
  return { ...defaultValues, ...overrides };
}

/**
 * Generate a test activity vote
 * @param overrides Properties to override default values
 * @returns An activity vote object for testing
 */
function activityVoteFixture(overrides = {}) {
  const defaultValues = {
    id: Math.floor(Math.random() * 1000),
    activity_id: Math.floor(Math.random() * 1000),
    user_id: Math.floor(Math.random() * 1000),
    vote: Math.random() < 0.5 ? 1 : -1,
    created_at: new Date(),
    updated_at: new Date()
  };
  return { ...defaultValues, ...overrides };
}

export {
  userFixture,
  userTokenFixture,
  passwordHistoryFixture,
  itineraryFixture,
  activityFixture,
  activityVoteFixture,
  generateTestToken
};