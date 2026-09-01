/**
 * WanderWise Cloud Functions — public API surface.
 * Every export here is a 2nd-gen callable unless noted.
 *
 * Structure follows the backend spec §8.
 */
const { setGlobalOptions } = require('firebase-functions/v2');

setGlobalOptions({
  region: 'asia-south1',   // Mumbai — closest to the launch user base
  maxInstances: 20,
});

// -- discover ---------------------------------------------------------------
exports.getDiscoverFeed = require('./discover/getDiscoverFeed').getDiscoverFeed;
exports.getCityDetail   = require('./discover/getCityDetail').getCityDetail;

// -- estimate ---------------------------------------------------------------
exports.calculateEstimate = require('./estimate/calculateEstimate').calculateEstimate;

// -- itinerary --------------------------------------------------------------
exports.generateItinerary = require('./itinerary/generateItinerary').generateItinerary;
exports.buildRoute        = require('./itinerary/buildRoute').buildRoute;
exports.getTripMap        = require('./itinerary/getTripMap').getTripMap;

// -- chat -------------------------------------------------------------------
exports.chatWithLocalGuide = require('./chat/chatWithLocalGuide').chatWithLocalGuide;

// -- trips ------------------------------------------------------------------
exports.getMyTrips       = require('./trips/getMyTrips').getMyTrips;
exports.getTripDetailTab = require('./trips/getTripDetailTab').getTripDetailTab;
exports.updateTripSlot   = require('./trips/updateTripSlot').updateTripSlot;

// -- account ----------------------------------------------------------------
exports.onUserCreate      = require('./account/onUserCreate').onUserCreate;       // blocking trigger
exports.ensureUserProfile = require('./account/onUserCreate').ensureUserProfile;
exports.deleteAccount     = require('./account/deleteAccount').deleteAccount;

// -- content ----------------------------------------------------------------
exports.getStaticContent = require('./content/getStaticContent').getStaticContent;
