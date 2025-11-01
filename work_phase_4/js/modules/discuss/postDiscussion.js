import { postData } from "../postData.js";

export const postDiscussion = async (discussion) => {
    try {
        const data = await postData("multiphotopost", discussion);

        if (!data) {
            throw new Error("No data returned from server.");
        }

        return data;
    } catch (error) {
        console.error("Error in postDiscussion:", error);
        return null;
    }
};
