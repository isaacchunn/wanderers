import { Request, Response } from "express";
import axios from "axios";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

const getAutocompletePredictions = async (
  search: string,
  country?: string,
): Promise<any[]> => {
  let components = "";
  if (country && typeof country === "string") {
    components = `&components=country:${encodeURIComponent(country)}`;
  }

  const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    search,
  )}${components}&key=${GOOGLE_PLACES_API_KEY}`;

  const autoResponse = await axios.get(autocompleteUrl);
  const predictions = autoResponse.data.predictions;

  if (!predictions || predictions.length === 0) {
    throw new Error("No predictions found");
  }

  return predictions.slice(0, 5);
};

const getPlaceDetails = async (placeId: string): Promise<any> => {
  // Include additional fields in the details request
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry,photos,types,international_phone_number,website,formatted_address,user_ratings_total,rating&key=${GOOGLE_PLACES_API_KEY}`;
  const detailsResponse = await axios.get(detailsUrl);
  const result = detailsResponse.data.result;

  // Build the image URL if photos are available
  let imageUrl = null;
  if (result.photos && result.photos.length > 0) {
    const photoReference = result.photos[0].photo_reference;
    imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
  }

  // Construct a Google Maps URL using the place_id
  const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;

  return {
    title: result.name,
    lat: result.geometry.location.lat,
    lon: result.geometry.location.lng,
    image: imageUrl,
    types: result.types, // Array of types
    internationalPhoneNumber: result.international_phone_number,
    website: result.website,
    formattedAddress: result.formatted_address,
    userRatingsTotal: result.user_ratings_total,
    rating: result.rating,
    googleMapsUrl,
  };
};

// @desc    Search a place
// @route   POST /api/place/search
// @access  Private
export const searchPlaceController = async (req: Request, res: Response) => {
  try {
    const { search, country } = req.body;

    if (!search || typeof search !== "string") {
      throw new Error("Invalid search query");
    }

    // Get predictions from the Autocomplete API
    const predictions = await getAutocompletePredictions(search, country);

    // For each prediction, get detailed information
    const places = await Promise.all(
      predictions.map(async (prediction: any) =>
        getPlaceDetails(prediction.place_id),
      ),
    );

    res.json(places);
  } catch (error: any) {
    console.error("Error in searchPlaceController:", error);
    res.status(500).json({ error: error.message });
  }
};
