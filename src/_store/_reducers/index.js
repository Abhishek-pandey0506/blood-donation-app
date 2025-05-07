import { combineReducers } from "@reduxjs/toolkit";
import Auth from "./auth";
const rootReducer = combineReducers({
    auth:Auth
});
export default rootReducer;
