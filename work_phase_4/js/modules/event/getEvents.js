import { fetchData } from "../fetchData.js";

export const getEvents = async () => {
    try {
        const data = await fetchData("genericevent");

        if (!data) {
            throw new Error("No data returned from server.");
        }

        return data;
        
    } catch (error) {
        console.error("Error in getEvents:", error);
        return null;
    }
};
