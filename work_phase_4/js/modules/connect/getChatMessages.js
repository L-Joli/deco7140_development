import { fetchData } from "../fetchData.js";

export const getChatMessages = async () => {
    try {
        const data = await fetchData("genericchat");

        if (!data) {
            throw new Error("No data returned from server.");
        }

        return data;
    } catch (error) {
        console.error("Error in getChatMessages:", error);
        return null;
    }
};
