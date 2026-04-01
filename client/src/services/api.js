import axios from "axios";

const API = axios.create({
  baseURL: "https://new-vers.onrender.com/api"
});

// ✅ PARTICIPANT
export const createParticipant = (data) =>
  API.post("/participant", data);

// ✅ FRIEND
export const saveFriend = (data) =>
  API.post("/friend", data);

// ✅ RESPONSE (universal)
export const saveResponse = (data) =>
  API.post("/response", data);

// ✅ STAGE
export const updateStage = (data) =>
  API.post("/stage", data);

// ✅ SESSION (guard)
export const getSession = (id) =>
  API.get(`/session/${id}`);
