import OpenSpaceApi from 'openspace-api-js';

// Assumes the website is open on the same machine as OpenSpace is running on,
// @TODO (anden88 2026-06-15): Make the host and port configurable by the user
export const api = OpenSpaceApi('localhost', 4682);
