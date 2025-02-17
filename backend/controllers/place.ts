import { Request, Response } from "express";
import axios from "axios";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// @desc    Search a place
// @route   POST /api/place/search
// @access  Private
export const searchPlaceController = async (req: Request, res: Response) => {
  try {
    const { search, country } = req.body;

    if (!search || typeof search !== "string") {
      throw new Error("Invalid search query");
    }

    // Build the components parameter if country is provided
    let components = "";
    if (country && typeof country === "string") {
      // For example, if country is "kr" for South Korea
      components = `&components=country:${encodeURIComponent(country)}`;
    }

    // 1. Call the Google Places Autocomplete API with optional country restriction
    const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      search,
    )}${components}&key=${GOOGLE_PLACES_API_KEY}`;

    const autoResponse = await axios.get(autocompleteUrl);
    const predictions = autoResponse.data.predictions;

    if (!predictions || predictions.length === 0) {
      throw new Error("No predictions found");
    }

    // Limit the number of predictions to 5
    const limitedPredictions = predictions.slice(0, 5);

    // 2. For each prediction, call the Place Details API to get name, coordinates, and photos
    const placeDetailsPromises = limitedPredictions.map(
      async (prediction: any) => {
        const placeId = prediction.place_id;
        // Include the "photos" field to get photo references (if available)
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry,photos&key=${GOOGLE_PLACES_API_KEY}`;
        const detailsResponse = await axios.get(detailsUrl);
        const result = detailsResponse.data.result;

        // Check if photos are available and construct an image URL using the first photo reference
        let imageUrl = null;
        if (result.photos && result.photos.length > 0) {
          const photoReference = result.photos[0].photo_reference;
          // Note: You can adjust maxwidth or maxheight as needed
          imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
        }

        return {
          title: result.name,
          lat: result.geometry.location.lat,
          lon: result.geometry.location.lng,
          image: imageUrl,
        };
      },
    );

    const places = await Promise.all(placeDetailsPromises);
    res.json(places);
  } catch (error: any) {
    console.error("Error in searchPlaces:", error);
    res.status(500).json({ error: error.message });
  }
};
