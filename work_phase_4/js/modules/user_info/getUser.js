import { fetchData } from "../fetchData.js";

export const getUser = async () => {
    try {
        const data = await fetchData("community");

        if (!data) {
            throw new Error("No data returned from server.");
        }

        return data[0];

    } catch (error) {
        console.error("Error in getUser:", error);
        return null;
    }
};
