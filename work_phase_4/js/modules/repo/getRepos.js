import { fetchData } from "../fetchData.js";

export const getRepos = async () => {
    try {
        const data = await fetchData("genericproduct");

        if (!data) {
            throw new Error("No data returned from server.");
        }

        return data;

    } catch (error) {
        console.error("Error in getRepos:", error);
        return null;
    }
};
