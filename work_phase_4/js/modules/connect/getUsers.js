import { fetchData } from "../fetchData.js";

export const getUsers = async () => {
    try {
        const data = await fetchData("genericuserprofile");

        if (!data) {
            throw new Error("No data returned from server.");
        }

        return data;
    } catch (error) {
        console.error("Error in getUsers:", error);
        return null;
    }
};
