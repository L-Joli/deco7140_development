import { fetchData } from "../fetchData.js";

export const getDiscussions = async () => {
    try {
        const data = await fetchData("multiphotopost");

        if (!data) {
            throw new Error("No data returned from server.");
        }

        return data;
        
    } catch (error) {
        console.error("Error in getDiscussions:", error);
        return null;
    }
};
